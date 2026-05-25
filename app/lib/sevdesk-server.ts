// Server-only sevDesk v1 client. Reads SEVDESK_API_KEY from env — never shipped
// to the browser. Mirrors the @birdie/connectors sevdesk adapter.

const BASE = 'https://my.sevdesk.de/api/v1';

interface SevContact { name?: string; surename?: string; familyname?: string }
interface SevInvoice {
  id: string; invoiceNumber?: string; header?: string; status?: string | number;
  sumGross?: string | number; invoiceDate?: string; timeToPay?: string | number;
  payDate?: string; contact?: SevContact;
}

export interface InvoiceRow {
  id: string; number: string; customer: string;
  status: 'draft' | 'open' | 'paid'; gross: number;
  date?: string; dueDate?: string; overdue: boolean;
}

export interface AgingBucket { label: string; days: string; count: number; sum: number }

export interface Invoices {
  configured: boolean;
  error?: string;
  total: number;
  openCount: number; openSum: number;
  overdueCount: number; overdueSum: number;
  paidCount: number; paidSum: number;
  paidWeekCount: number; paidWeekSum: number;
  draftCount: number; draftSum: number;
  aging: AgingBucket[];
  invoices: InvoiceRow[];
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

function classify(code: number): 'draft' | 'open' | 'paid' {
  if (code >= 1000) return 'paid';
  if (code < 100) return 'draft';
  return 'open';
}

function contactName(c?: SevContact): string {
  if (!c) return '—';
  return c.name || [c.surename, c.familyname].filter(Boolean).join(' ').trim() || '—';
}

const emptyInvoices = (configured: boolean, error?: string): Invoices => ({
  configured, error, total: 0, openCount: 0, openSum: 0, overdueCount: 0, overdueSum: 0,
  paidCount: 0, paidSum: 0, paidWeekCount: 0, paidWeekSum: 0, draftCount: 0, draftSum: 0, aging: [], invoices: [],
});

// ═══════════════════════════════════════════════════════════════════════════════
// EINGANGSRECHNUNGEN / AUSGABEN — sevDesk Voucher + VoucherPos + AccountingType
// ═══════════════════════════════════════════════════════════════════════════════

interface SevVoucher {
  id: string;
  voucherDate?: string;
  description?: string;
  status?: string | number;
  sumNet?: string | number;
  sumGross?: string | number;
  voucherType?: string;
  creditDebit?: string;
  supplierName?: string;
}

interface SevVoucherPos {
  id: string;
  voucher?: { id: string };
  accountingType?: { id: string };
  sumGross?: string | number;
}

interface SevAccountingType {
  id: string;
  name?: string;
}

export interface ExpenseVoucher {
  id: string;
  date: string;
  supplier: string;
  gross: number;
  category: string;
  categoryId: string;
  description: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  totalGross: number;
  count: number;
  suppliers: { name: string; total: number; count: number }[];
}

export interface Expenses {
  configured: boolean;
  error?: string;
  categories: ExpenseCategory[];
  totalMonthly: number;
  totalYearly: number;
  months: number;
  voucherCount: number;
  totalAll: number;
  vouchers: ExpenseVoucher[];
}

const emptyExpenses = (configured: boolean, error?: string): Expenses => ({
  configured, error, categories: [], totalMonthly: 0, totalYearly: 0, months: 0, voucherCount: 0, totalAll: 0, vouchers: [],
});

async function fetchPages<T>(url: string, token: string, pageSize = 500): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  while (true) {
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(
      `${url}${sep}limit=${pageSize}&offset=${offset}`,
      { headers: { Authorization: token, Accept: 'application/json' }, next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error(`sevDesk HTTP ${res.status}`);
    const json = (await res.json()) as { objects?: T[] };
    const page = json.objects ?? [];
    all.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

export async function getSevdeskExpenses(): Promise<Expenses> {
  const token = process.env.SEVDESK_API_KEY;
  if (!token) return emptyExpenses(false);

  try {
    const now = new Date();
    const monthsBack = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const startDate = Math.floor(monthsBack.getTime() / 1000);

    const [allVouchers, allVoucherPos, allAccTypes] = await Promise.all([
      fetchPages<SevVoucher>(`${BASE}/Voucher?startDate=${startDate}&creditDebit=C`, token),
      fetchPages<SevVoucherPos>(`${BASE}/VoucherPos`, token, 1000),
      fetchPages<SevAccountingType>(`${BASE}/AccountingType?useClientAccountChart=true`, token, 1000),
    ]);

    const accTypeMap = new Map(allAccTypes.map(a => [a.id, a.name ?? 'Unbekannt']));

    const voucherIds = new Set(allVouchers.map(v => v.id));
    const posForExpenses = allVoucherPos.filter(p => p.voucher && voucherIds.has(p.voucher.id));

    const voucherCategoryMap = new Map<string, { catId: string; catName: string }>();
    for (const p of posForExpenses) {
      if (!p.voucher) continue;
      const catId = p.accountingType?.id ?? '0';
      const catName = accTypeMap.get(catId) ?? 'Sonstige';
      if (!voucherCategoryMap.has(p.voucher.id)) {
        voucherCategoryMap.set(p.voucher.id, { catId, catName });
      }
    }

    const monthSet = new Set<string>();
    const catMap = new Map<string, {
      id: string; name: string; totalGross: number; count: number;
      suppliers: Map<string, { name: string; total: number; count: number }>;
    }>();
    const vouchers: ExpenseVoucher[] = [];
    let totalAll = 0;

    for (const v of allVouchers) {
      const gross = num(v.sumGross);
      if (gross <= 0) continue;

      const date = v.voucherDate ?? '';
      if (date) monthSet.add(date.slice(0, 7));

      const cat = voucherCategoryMap.get(v.id) ?? { catId: '0', catName: 'Nicht zugeordnet' };
      const supplier = v.supplierName?.trim() || v.description || 'Unbekannt';
      totalAll += gross;

      vouchers.push({
        id: v.id, date, supplier, gross,
        category: cat.catName, categoryId: cat.catId,
        description: v.description ?? '',
      });

      const existing = catMap.get(cat.catId);
      if (existing) {
        existing.totalGross += gross;
        existing.count++;
        const sup = existing.suppliers.get(supplier);
        if (sup) { sup.total += gross; sup.count++; }
        else existing.suppliers.set(supplier, { name: supplier, total: gross, count: 1 });
      } else {
        const suppliers = new Map<string, { name: string; total: number; count: number }>();
        suppliers.set(supplier, { name: supplier, total: gross, count: 1 });
        catMap.set(cat.catId, { id: cat.catId, name: cat.catName, totalGross: gross, count: 1, suppliers });
      }
    }

    const categories: ExpenseCategory[] = Array.from(catMap.values())
      .map(c => ({
        id: c.id,
        name: c.name,
        totalGross: Math.round(c.totalGross),
        count: c.count,
        suppliers: Array.from(c.suppliers.values()).sort((a, b) => b.total - a.total),
      }))
      .sort((a, b) => b.totalGross - a.totalGross);

    const months = Math.max(monthSet.size, 1);

    return {
      configured: true,
      categories,
      totalMonthly: Math.round(totalAll / months),
      totalYearly: Math.round((totalAll / months) * 12),
      months,
      voucherCount: vouchers.length,
      totalAll: Math.round(totalAll),
      vouchers,
    };
  } catch (e) {
    return emptyExpenses(true, (e as Error).message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUSGANGSRECHNUNGEN — sevDesk Invoice API
// ═══════════════════════════════════════════════════════════════════════════════

export async function getSevdeskInvoices(): Promise<Invoices> {
  const token = process.env.SEVDESK_API_KEY;
  if (!token) return emptyInvoices(false);

  try {
    const res = await fetch(
      `${BASE}/Invoice?limit=250&embed=contact&orderBy[0][field]=invoiceDate&orderBy[0][arrangement]=desc`,
      { headers: { Authorization: token, Accept: 'application/json' }, next: { revalidate: 300 } },
    );
    if (!res.ok) return emptyInvoices(true, `sevDesk HTTP ${res.status}`);
    const json = (await res.json()) as { objects?: SevInvoice[] };
    const raw = json.objects ?? [];
    const now = Date.now();

    const invoices: InvoiceRow[] = raw.map((iv) => {
      const status = classify(num(iv.status));
      let dueDate: string | undefined;
      if (iv.invoiceDate) {
        const d = new Date(iv.invoiceDate);
        d.setDate(d.getDate() + num(iv.timeToPay || 14));
        dueDate = d.toISOString();
      }
      const overdue = status === 'open' && !!dueDate && Date.parse(dueDate) < now;
      return {
        id: iv.id,
        number: iv.invoiceNumber || iv.header || iv.id,
        customer: contactName(iv.contact),
        status,
        gross: num(iv.sumGross),
        date: iv.invoiceDate,
        dueDate,
        overdue,
      };
    });

    const open = invoices.filter((i) => i.status === 'open');
    const overdue = open.filter((i) => i.overdue);
    const paid = invoices.filter((i) => i.status === 'paid');
    const drafts = invoices.filter((i) => i.status === 'draft');
    const sum = (a: InvoiceRow[]) => Math.round(a.reduce((s, i) => s + i.gross, 0));

    const weekAgo = now - 7 * 86400_000;
    const paidThisWeek = paid.filter((i) => {
      const paidRaw = raw.find((r) => r.id === i.id);
      const pd = paidRaw?.payDate ? Date.parse(paidRaw.payDate) : (i.date ? Date.parse(i.date) : 0);
      return pd >= weekAgo;
    });

    const aging: AgingBucket[] = [];
    if (overdue.length > 0) {
      const buckets = [
        { label: 'Erinnerung', days: '1–7 Tage', min: 0, max: 7 },
        { label: 'Mahnung 1', days: '8–14 Tage', min: 8, max: 14 },
        { label: 'Mahnung 2', days: '15–30 Tage', min: 15, max: 30 },
        { label: 'Inkasso', days: '30+ Tage', min: 31, max: Infinity },
      ];
      for (const b of buckets) {
        const items = overdue.filter((i) => {
          const daysOver = Math.floor((now - Date.parse(i.dueDate!)) / 86400_000);
          return daysOver >= b.min && daysOver <= b.max;
        });
        if (items.length > 0) aging.push({ label: b.label, days: b.days, count: items.length, sum: sum(items) });
      }
    }

    return {
      configured: true,
      total: invoices.length,
      openCount: open.length, openSum: sum(open),
      overdueCount: overdue.length, overdueSum: sum(overdue),
      paidCount: paid.length, paidSum: sum(paid),
      paidWeekCount: paidThisWeek.length, paidWeekSum: sum(paidThisWeek),
      draftCount: drafts.length, draftSum: sum(drafts),
      aging,
      invoices,
    };
  } catch (e) {
    return emptyInvoices(true, (e as Error).message);
  }
}
