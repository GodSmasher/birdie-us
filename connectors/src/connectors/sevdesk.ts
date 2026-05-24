import {
  type Connector,
  type ConnectorContext,
  type TestResult,
  requireConfig,
} from '../types.js';

// sevDesk REST API v1 — invoicing/accounting (Volta's tool).
// Auth: 32-char API token passed RAW in the `Authorization` header (no "Bearer").
// Base: https://my.sevdesk.de/api/v1 · Responses wrapped in { objects: [...] }.
// Docs: https://api.sevdesk.de/
//
// Invoice status: 1000 = paid is well-established; < 100 = draft; anything else
// counts as open/in-progress. Exact intermediate labels get confirmed live.

const BASE = 'https://my.sevdesk.de/api/v1';

interface SevContact { id?: string; name?: string; surename?: string; familyname?: string }
interface SevInvoice {
  id: string;
  invoiceNumber?: string;
  status?: string | number;
  sumGross?: string | number;
  sumNet?: string | number;
  invoiceDate?: string;
  timeToPay?: string | number;
  payDate?: string | null;
  header?: string;
  contact?: SevContact;
}

export interface InvoiceRow {
  id: string;
  number: string;
  customer: string;
  status: 'draft' | 'open' | 'paid';
  statusCode: number;
  gross: number;
  date?: string;
  dueDate?: string;
  overdue: boolean;
}

export interface SevdeskInvoices {
  invoices: InvoiceRow[];
  total: number;
  openCount: number;
  openSum: number;
  overdueCount: number;
  overdueSum: number;
  paidCount: number;
  paidSum: number;
}

function authHeaders(ctx: ConnectorContext): Record<string, string> {
  return { Authorization: ctx.config.apiKey, Accept: 'application/json' };
}

async function sevFetch<T>(ctx: ConnectorContext, path: string): Promise<T[]> {
  const res = await ctx.fetch(`${BASE}${path}`, { headers: authHeaders(ctx) });
  if (res.status === 401) throw new Error('sevDesk: Token ungültig (401)');
  if (res.status === 403) throw new Error('sevDesk: keine Berechtigung (403)');
  if (!res.ok) throw new Error(`sevDesk HTTP ${res.status}`);
  const json = (await res.json()) as { objects?: T[] };
  return json.objects ?? [];
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

function classify(statusCode: number): 'draft' | 'open' | 'paid' {
  if (statusCode >= 1000) return 'paid';
  if (statusCode < 100) return 'draft';
  return 'open';
}

function contactName(c?: SevContact): string {
  if (!c) return '—';
  return c.name || [c.surename, c.familyname].filter(Boolean).join(' ').trim() || '—';
}

export async function sevdeskListInvoices(ctx: ConnectorContext, limit = 250): Promise<SevdeskInvoices> {
  requireConfig(ctx, ['apiKey']);
  const raw = await sevFetch<SevInvoice>(
    ctx,
    `/Invoice?limit=${limit}&embed=contact&orderBy[0][field]=invoiceDate&orderBy[0][arrangement]=desc`,
  );

  const now = Date.now();
  const invoices: InvoiceRow[] = raw.map((iv) => {
    const statusCode = num(iv.status);
    const status = classify(statusCode);
    const gross = num(iv.sumGross);
    let dueDate: string | undefined;
    if (iv.invoiceDate) {
      const due = new Date(iv.invoiceDate);
      due.setDate(due.getDate() + num(iv.timeToPay || 14));
      dueDate = due.toISOString();
    }
    const overdue = status === 'open' && !!dueDate && Date.parse(dueDate) < now;
    return {
      id: iv.id,
      number: iv.invoiceNumber || iv.header || iv.id,
      customer: contactName(iv.contact),
      status,
      statusCode,
      gross,
      date: iv.invoiceDate,
      dueDate,
      overdue,
    };
  });

  const open = invoices.filter((i) => i.status === 'open');
  const overdue = open.filter((i) => i.overdue);
  const paid = invoices.filter((i) => i.status === 'paid');
  const sum = (arr: InvoiceRow[]) => Math.round(arr.reduce((s, i) => s + i.gross, 0));

  return {
    invoices,
    total: invoices.length,
    openCount: open.length,
    openSum: sum(open),
    overdueCount: overdue.length,
    overdueSum: sum(overdue),
    paidCount: paid.length,
    paidSum: sum(paid),
  };
}

export const sevdesk: Connector<SevdeskInvoices> = {
  manifest: {
    id: 'sevdesk',
    name: 'sevDesk',
    vendor: 'sevDesk GmbH',
    category: 'accounting',
    regions: ['DE'],
    authType: 'token',
    protocol: 'REST v1',
    capabilities: ['read', 'write'],
    config: [
      { key: 'apiKey', label: 'API Token', required: true, secret: true, help: 'sevDesk → Einstellungen → Benutzer → API-Token (32 Zeichen)' },
    ],
    docsUrl: 'https://api.sevdesk.de/',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['apiKey']);
    const t0 = Date.now();
    try {
      const accounts = await sevFetch<{ id: string }>(ctx, '/CheckAccount?limit=1');
      return { ok: true, message: `verbunden · ${accounts.length} Bankkonto(en) sichtbar`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<SevdeskInvoices> {
    return sevdeskListInvoices(ctx);
  },
};
