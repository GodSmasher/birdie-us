// Server-only sevDesk v1 client. Reads SEVDESK_API_KEY from env — never shipped
// to the browser. Mirrors the @birdie/connectors sevdesk adapter.

const BASE = 'https://my.sevdesk.de/api/v1';

interface SevContact { name?: string; surename?: string; familyname?: string }
interface SevInvoice {
  id: string; invoiceNumber?: string; header?: string; status?: string | number;
  sumGross?: string | number; invoiceDate?: string; timeToPay?: string | number; contact?: SevContact;
}

export interface InvoiceRow {
  id: string; number: string; customer: string;
  status: 'draft' | 'open' | 'paid'; gross: number;
  date?: string; dueDate?: string; overdue: boolean;
}

export interface Invoices {
  configured: boolean;
  error?: string;
  total: number;
  openCount: number; openSum: number;
  overdueCount: number; overdueSum: number;
  paidCount: number; paidSum: number;
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
  configured, error, total: 0, openCount: 0, openSum: 0, overdueCount: 0, overdueSum: 0, paidCount: 0, paidSum: 0, invoices: [],
});

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
    const sum = (a: InvoiceRow[]) => Math.round(a.reduce((s, i) => s + i.gross, 0));

    return {
      configured: true,
      total: invoices.length,
      openCount: open.length, openSum: sum(open),
      overdueCount: overdue.length, overdueSum: sum(overdue),
      paidCount: paid.length, paidSum: sum(paid),
      invoices,
    };
  } catch (e) {
    return emptyInvoices(true, (e as Error).message);
  }
}
