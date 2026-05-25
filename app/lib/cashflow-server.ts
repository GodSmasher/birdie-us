// Server-only cashflow / liquidity module.
// Combines Supabase cashflow tables with Reonic pipeline data and sevDesk invoices.

import { getDb, tenantId } from './db';
import { getSevdeskInvoices, type InvoiceRow } from './sevdesk-server';
import { getReonicOffersRaw, type RawOffer } from './reonic-server';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface CashflowProject {
  id: string;
  customerName: string;
  title: string;
  orderValue: number;
  orderDate?: string;
  installationDate?: string;
  completionDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  reonicOfferId?: string;
  entries: CashflowEntry[];
  // computed
  plannedIn: number;
  actualIn: number;
  plannedOut: number;
  actualOut: number;
  balance: number;
  flags: string[];
}

export interface CashflowEntry {
  id: string;
  direction: 'in' | 'out';
  category: string;
  description?: string;
  plannedAmount: number;
  actualAmount?: number;
  plannedDate: string;
  actualDate?: string;
  supplier?: string;
  status: 'planned' | 'invoiced' | 'paid' | 'overdue' | 'cancelled';
}

export interface CashflowWeek {
  weekStart: string;
  plannedIn: number;
  plannedOut: number;
  actualIn: number;
  actualOut: number;
  netPlanned: number;
  netActual: number;
  runningBalance: number;
}

export interface CashflowSummary {
  configured: boolean;
  error?: string;
  projects: CashflowProject[];
  timeline: CashflowWeek[];
  totals: {
    orderValueTotal: number;
    plannedInTotal: number;
    actualInTotal: number;
    plannedOutTotal: number;
    actualOutTotal: number;
    openBalance: number;
    projectCount: number;
    activeCount: number;
    flagCount: number;
  };
  sevdeskLinked: boolean;
}

const categoryLabels: Record<string, string> = {
  anzahlung: 'Anzahlung',
  abschlag: 'Abschlag',
  schlussrechnung: 'Schlussrechnung',
  sonstiges_in: 'Sonstige Einnahme',
  material: 'Material',
  subunternehmer: 'Subunternehmer',
  sonstiges_out: 'Sonstige Ausgabe',
};
export { categoryLabels };

// ── Data loading ────────────────────────────────────────────────────────────────

interface DbProject {
  id: string;
  customer_name: string;
  title: string;
  order_value: string;
  order_date: string | null;
  installation_date: string | null;
  completion_date: string | null;
  status: string;
  reonic_offer_id: string | null;
  notes: string | null;
}

interface DbEntry {
  id: string;
  project_id: string;
  direction: string;
  category: string;
  description: string | null;
  planned_amount: string;
  actual_amount: string | null;
  planned_date: string;
  actual_date: string | null;
  supplier: string | null;
  status: string;
  sevdesk_invoice_id: string | null;
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
}

function toMonday(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  return mon.toISOString().slice(0, 10);
}

export async function getCashflowSummary(): Promise<CashflowSummary> {
  const db = getDb();
  const tid = db ? await tenantId() : null;
  if (!db || !tid) {
    return emptySummary(false);
  }

  try {
    const { data: rawProjects, error: pErr } = await db
      .from('cashflow_projects')
      .select('*')
      .eq('tenant_id', tid)
      .neq('status', 'cancelled')
      .order('order_date', { ascending: false });

    if (pErr) return emptySummary(true, pErr.message);
    const dbProjects = (rawProjects ?? []) as DbProject[];
    if (dbProjects.length === 0) return emptySummary(true);

    const projectIds = dbProjects.map((p) => p.id);
    const { data: rawEntries } = await db
      .from('cashflow_entries')
      .select('*')
      .in('project_id', projectIds)
      .neq('status', 'cancelled')
      .order('planned_date', { ascending: true });
    const dbEntries = (rawEntries ?? []) as DbEntry[];

    const entriesByProject = new Map<string, DbEntry[]>();
    for (const e of dbEntries) {
      const list = entriesByProject.get(e.project_id) ?? [];
      list.push(e);
      entriesByProject.set(e.project_id, list);
    }

    const sevdesk = await getSevdeskInvoices();
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 10);

    const projects: CashflowProject[] = dbProjects.map((p) => {
      const raw = entriesByProject.get(p.id) ?? [];
      const entries: CashflowEntry[] = raw.map((e) => ({
        id: e.id,
        direction: e.direction as 'in' | 'out',
        category: e.category,
        description: e.description ?? undefined,
        plannedAmount: num(e.planned_amount),
        actualAmount: e.actual_amount != null ? num(e.actual_amount) : undefined,
        plannedDate: e.planned_date,
        actualDate: e.actual_date ?? undefined,
        supplier: e.supplier ?? undefined,
        status: e.status as CashflowEntry['status'],
      }));

      const inEntries = entries.filter((e) => e.direction === 'in');
      const outEntries = entries.filter((e) => e.direction === 'out');
      const plannedIn = inEntries.reduce((s, e) => s + e.plannedAmount, 0);
      const actualIn = inEntries.reduce((s, e) => s + (e.actualAmount ?? 0), 0);
      const plannedOut = outEntries.reduce((s, e) => s + e.plannedAmount, 0);
      const actualOut = outEntries.reduce((s, e) => s + (e.actualAmount ?? 0), 0);

      const flags: string[] = [];
      const orderVal = num(p.order_value);
      if (plannedIn > 0 && Math.abs(plannedIn - orderVal) > 1) {
        flags.push(`Teilzahlungen (${Math.round(plannedIn)}) ≠ Auftragswert (${Math.round(orderVal)})`);
      }
      for (const e of entries) {
        if (e.status === 'planned' && e.plannedDate < nowStr) {
          flags.push(`${categoryLabels[e.category] ?? e.category} überfällig (${e.plannedDate})`);
        }
      }

      return {
        id: p.id,
        customerName: p.customer_name,
        title: p.title || `Auftrag ${p.customer_name}`,
        orderValue: orderVal,
        orderDate: p.order_date ?? undefined,
        installationDate: p.installation_date ?? undefined,
        completionDate: p.completion_date ?? undefined,
        status: p.status as CashflowProject['status'],
        reonicOfferId: p.reonic_offer_id ?? undefined,
        entries,
        plannedIn: Math.round(plannedIn),
        actualIn: Math.round(actualIn),
        plannedOut: Math.round(plannedOut),
        actualOut: Math.round(actualOut),
        balance: Math.round(plannedIn - plannedOut),
        flags,
      };
    });

    const timeline = buildTimeline(projects, 26);

    const totals = {
      orderValueTotal: Math.round(projects.reduce((s, p) => s + p.orderValue, 0)),
      plannedInTotal: Math.round(projects.reduce((s, p) => s + p.plannedIn, 0)),
      actualInTotal: Math.round(projects.reduce((s, p) => s + p.actualIn, 0)),
      plannedOutTotal: Math.round(projects.reduce((s, p) => s + p.plannedOut, 0)),
      actualOutTotal: Math.round(projects.reduce((s, p) => s + p.actualOut, 0)),
      openBalance: Math.round(projects.reduce((s, p) => s + p.balance, 0)),
      projectCount: projects.length,
      activeCount: projects.filter((p) => p.status === 'active').length,
      flagCount: projects.reduce((s, p) => s + p.flags.length, 0),
    };

    return {
      configured: true,
      projects,
      timeline,
      totals,
      sevdeskLinked: sevdesk.configured && !sevdesk.error,
    };
  } catch (e) {
    return emptySummary(true, (e as Error).message);
  }
}

function buildTimeline(projects: CashflowProject[], weeks: number): CashflowWeek[] {
  const now = new Date();
  const start = new Date(toMonday(now));
  start.setDate(start.getDate() - 4 * 7);

  const weekMap = new Map<string, CashflowWeek>();
  for (let i = 0; i < weeks; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    const ws = d.toISOString().slice(0, 10);
    weekMap.set(ws, { weekStart: ws, plannedIn: 0, plannedOut: 0, actualIn: 0, actualOut: 0, netPlanned: 0, netActual: 0, runningBalance: 0 });
  }

  const weekStarts = [...weekMap.keys()].sort();

  for (const p of projects) {
    for (const e of p.entries) {
      const entryDate = new Date(e.actualDate ?? e.plannedDate);
      const ws = toMonday(entryDate);
      const bucket = weekMap.get(ws);
      if (!bucket) continue;
      if (e.direction === 'in') {
        bucket.plannedIn += e.plannedAmount;
        bucket.actualIn += e.actualAmount ?? 0;
      } else {
        bucket.plannedOut += e.plannedAmount;
        bucket.actualOut += e.actualAmount ?? 0;
      }
    }
  }

  let running = 0;
  for (const ws of weekStarts) {
    const w = weekMap.get(ws)!;
    w.plannedIn = Math.round(w.plannedIn);
    w.plannedOut = Math.round(w.plannedOut);
    w.actualIn = Math.round(w.actualIn);
    w.actualOut = Math.round(w.actualOut);
    w.netPlanned = w.plannedIn - w.plannedOut;
    w.netActual = w.actualIn - w.actualOut;
    running += w.netPlanned;
    w.runningBalance = Math.round(running);
  }

  return weekStarts.map((ws) => weekMap.get(ws)!);
}

// ── Single-project read ────────────────────────────────────────────────────────

export async function getCashflowProject(id: string): Promise<CashflowProject | null> {
  const db = getDb();
  const tid = db ? await tenantId() : null;
  if (!db || !tid) return null;

  const { data: p, error: pErr } = await db
    .from('cashflow_projects')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tid)
    .single();
  if (pErr || !p) return null;

  const { data: rawEntries } = await db
    .from('cashflow_entries')
    .select('*')
    .eq('project_id', id)
    .neq('status', 'cancelled')
    .order('planned_date', { ascending: true });
  const dbEntries = (rawEntries ?? []) as DbEntry[];

  const nowStr = new Date().toISOString().slice(0, 10);
  const entries: CashflowEntry[] = dbEntries.map((e) => ({
    id: e.id,
    direction: e.direction as 'in' | 'out',
    category: e.category,
    description: e.description ?? undefined,
    plannedAmount: num(e.planned_amount),
    actualAmount: e.actual_amount != null ? num(e.actual_amount) : undefined,
    plannedDate: e.planned_date,
    actualDate: e.actual_date ?? undefined,
    supplier: e.supplier ?? undefined,
    status: e.status as CashflowEntry['status'],
  }));

  const inEntries = entries.filter((e) => e.direction === 'in');
  const outEntries = entries.filter((e) => e.direction === 'out');
  const plannedIn = inEntries.reduce((s, e) => s + e.plannedAmount, 0);
  const actualIn = inEntries.reduce((s, e) => s + (e.actualAmount ?? 0), 0);
  const plannedOut = outEntries.reduce((s, e) => s + e.plannedAmount, 0);
  const actualOut = outEntries.reduce((s, e) => s + (e.actualAmount ?? 0), 0);

  const flags: string[] = [];
  const orderVal = num(p.order_value);
  if (plannedIn > 0 && Math.abs(plannedIn - orderVal) > 1) {
    flags.push(`Teilzahlungen (${Math.round(plannedIn)}) ≠ Auftragswert (${Math.round(orderVal)})`);
  }
  for (const e of entries) {
    if (e.status === 'planned' && e.plannedDate < nowStr) {
      flags.push(`${categoryLabels[e.category] ?? e.category} überfällig (${e.plannedDate})`);
    }
  }

  return {
    id: p.id,
    customerName: p.customer_name,
    title: p.title || `Auftrag ${p.customer_name}`,
    orderValue: orderVal,
    orderDate: p.order_date ?? undefined,
    installationDate: p.installation_date ?? undefined,
    completionDate: p.completion_date ?? undefined,
    status: p.status as CashflowProject['status'],
    reonicOfferId: p.reonic_offer_id ?? undefined,
    entries,
    plannedIn: Math.round(plannedIn),
    actualIn: Math.round(actualIn),
    plannedOut: Math.round(plannedOut),
    actualOut: Math.round(actualOut),
    balance: Math.round(plannedIn - plannedOut),
    flags,
  };
}

// ── Write helpers (for API routes) ──────────────────────────────────────────────

export async function upsertProject(data: {
  id?: string;
  customerName: string;
  title?: string;
  orderValue: number;
  orderDate?: string;
  installationDate?: string;
  completionDate?: string;
  reonicOfferId?: string;
  status?: string;
  notes?: string;
}): Promise<{ id: string } | null> {
  const db = getDb();
  const tid = db ? await tenantId() : null;
  if (!db || !tid) return null;

  const row = {
    ...(data.id ? { id: data.id } : {}),
    tenant_id: tid,
    customer_name: data.customerName,
    title: data.title ?? null,
    order_value: data.orderValue,
    order_date: data.orderDate ?? null,
    installation_date: data.installationDate ?? null,
    completion_date: data.completionDate ?? null,
    reonic_offer_id: data.reonicOfferId ?? null,
    status: data.status ?? 'active',
    notes: data.notes ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = data.id
    ? await db.from('cashflow_projects').update(row).eq('id', data.id).select('id').single()
    : await db.from('cashflow_projects').insert(row).select('id').single();

  return error ? null : { id: result.id };
}

export async function upsertEntry(data: {
  id?: string;
  projectId: string;
  direction: 'in' | 'out';
  category: string;
  description?: string;
  plannedAmount: number;
  actualAmount?: number;
  plannedDate: string;
  actualDate?: string;
  supplier?: string;
  status?: string;
  sevdeskInvoiceId?: string;
}): Promise<{ id: string } | null> {
  const db = getDb();
  const tid = db ? await tenantId() : null;
  if (!db || !tid) return null;

  const row = {
    ...(data.id ? { id: data.id } : {}),
    tenant_id: tid,
    project_id: data.projectId,
    direction: data.direction,
    category: data.category,
    description: data.description ?? null,
    planned_amount: data.plannedAmount,
    actual_amount: data.actualAmount ?? null,
    planned_date: data.plannedDate,
    actual_date: data.actualDate ?? null,
    supplier: data.supplier ?? null,
    status: data.status ?? 'planned',
    sevdesk_invoice_id: data.sevdeskInvoiceId ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = data.id
    ? await db.from('cashflow_entries').update(row).eq('id', data.id).select('id').single()
    : await db.from('cashflow_entries').insert(row).select('id').single();

  return error ? null : { id: result.id };
}

export async function deleteEntry(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const { error } = await db.from('cashflow_entries').delete().eq('id', id);
  return !error;
}

// ── Reonic import ──────────────────────────────────────────────────────────────

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

function extractCustomerName(c: unknown): string {
  if (typeof c === 'string' && c.trim()) return c;
  if (c && typeof c === 'object') {
    const o = c as Record<string, unknown>;
    const name = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
    if (name) return name;
    if (typeof o.name === 'string') return o.name;
  }
  return '—';
}

export async function importReonicOffers(): Promise<ImportResult> {
  const db = getDb();
  const tid = db ? await tenantId() : null;
  if (!db || !tid) return { imported: 0, skipped: 0, errors: ['DB nicht verbunden'] };

  const rawOffers = await getReonicOffersRaw(15);
  if (rawOffers.length === 0) return { imported: 0, skipped: 0, errors: ['Reonic nicht konfiguriert oder keine Aufträge'] };

  const wonOffers = rawOffers.filter((r) => {
    const o = r.data as RawOffer;
    return o.state === 'Won' && typeof o.totalPlannedPrice === 'number' && o.totalPlannedPrice > 0;
  });
  if (wonOffers.length === 0) return { imported: 0, skipped: 0, errors: [] };

  const { data: existing } = await db
    .from('cashflow_projects')
    .select('reonic_offer_id')
    .eq('tenant_id', tid)
    .not('reonic_offer_id', 'is', null);
  const existingIds = new Set((existing ?? []).map((r: { reonic_offer_id: string }) => r.reonic_offer_id));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const raw of wonOffers) {
    const offer = raw.data as RawOffer;
    if (existingIds.has(raw.id)) {
      skipped++;
      continue;
    }

    const orderValue = offer.totalPlannedPrice!;
    const rawCustomer = extractCustomerName(offer.customer);
    const offerName = offer.name || '';
    const namePart = offerName.includes(' - ') ? offerName.split(' - ')[0].trim() : '';
    const customer = rawCustomer !== '—' ? rawCustomer : namePart || offer.customerNumber || offerName || '—';
    const projectRow = {
      tenant_id: tid,
      reonic_offer_id: raw.id,
      customer_name: customer,
      title: offerName || `Auftrag ${customer}`,
      order_value: orderValue,
      order_date: today,
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    const { data: proj, error: pErr } = await db
      .from('cashflow_projects')
      .insert(projectRow)
      .select('id')
      .single();

    if (pErr || !proj) {
      errors.push(`${customer}: ${pErr?.message ?? 'Insert fehlgeschlagen'}`);
      continue;
    }

    const entries = [
      {
        tenant_id: tid,
        project_id: proj.id,
        direction: 'in',
        category: 'anzahlung',
        description: 'Anzahlung 30%',
        planned_amount: Math.round(orderValue * 0.3),
        planned_date: addDays(today, 7),
        status: 'planned',
        updated_at: new Date().toISOString(),
      },
      {
        tenant_id: tid,
        project_id: proj.id,
        direction: 'in',
        category: 'abschlag',
        description: 'Abschlag nach Montage 60%',
        planned_amount: Math.round(orderValue * 0.6),
        planned_date: addDays(today, 42),
        status: 'planned',
        updated_at: new Date().toISOString(),
      },
      {
        tenant_id: tid,
        project_id: proj.id,
        direction: 'in',
        category: 'schlussrechnung',
        description: 'Schlussrechnung 10%',
        planned_amount: Math.round(orderValue * 0.1),
        planned_date: addDays(today, 56),
        status: 'planned',
        updated_at: new Date().toISOString(),
      },
      {
        tenant_id: tid,
        project_id: proj.id,
        direction: 'out',
        category: 'material',
        description: 'Materialeinkauf',
        planned_amount: Math.round(orderValue * 0.45),
        planned_date: addDays(today, 14),
        status: 'planned',
        updated_at: new Date().toISOString(),
      },
    ];

    const { error: eErr } = await db.from('cashflow_entries').insert(entries);
    if (eErr) {
      errors.push(`Einträge für ${customer}: ${eErr.message}`);
    }

    imported++;
  }

  return { imported, skipped, errors };
}

// ── sevDesk ↔ Cashflow Sync ──────────────────────────────────────────────────

export interface SyncResult {
  matched: number;
  updated: number;
  unmatched: string[];
  details: { project: string; invoice: string; entry: string; action: string }[];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-zäöüß0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function nameScore(projectName: string, invoiceCustomer: string): number {
  const pn = normalize(projectName);
  const ic = normalize(invoiceCustomer);
  if (!pn || !ic || pn.length < 3 || ic.length < 3) return 0;
  if (pn === ic) return 1;
  if (pn.includes(ic) || ic.includes(pn)) return 0.8;
  const pWords = pn.split(' ').filter(w => w.length > 2);
  const iWords = ic.split(' ').filter(w => w.length > 2);
  const matchCount = pWords.filter(w => iWords.some(iw => iw.includes(w) || w.includes(iw))).length;
  if (matchCount === 0) return 0;
  return matchCount / Math.max(pWords.length, iWords.length) * 0.6;
}

export async function syncSevdeskInvoices(): Promise<SyncResult> {
  const db = getDb();
  const tid = db ? await tenantId() : null;
  if (!db || !tid) return { matched: 0, updated: 0, unmatched: [], details: [] };

  const [sevdesk, { data: rawProjects }, { data: rawEntries }] = await Promise.all([
    getSevdeskInvoices(),
    db.from('cashflow_projects').select('*').eq('tenant_id', tid).neq('status', 'cancelled'),
    db.from('cashflow_entries').select('*').eq('tenant_id', tid).neq('status', 'cancelled'),
  ]);

  if (!sevdesk.configured || sevdesk.error) return { matched: 0, updated: 0, unmatched: ['sevDesk nicht verbunden'], details: [] };

  const projects = (rawProjects ?? []) as DbProject[];
  const entries = (rawEntries ?? []) as DbEntry[];

  const entriesByProject = new Map<string, DbEntry[]>();
  for (const e of entries) {
    const list = entriesByProject.get(e.project_id) ?? [];
    list.push(e);
    entriesByProject.set(e.project_id, list);
  }

  const alreadyLinked = new Set(entries.filter(e => e.sevdesk_invoice_id).map(e => e.sevdesk_invoice_id!));

  let matched = 0;
  let updated = 0;
  const unmatched: string[] = [];
  const details: SyncResult['details'] = [];

  for (const inv of sevdesk.invoices) {
    if (alreadyLinked.has(inv.id)) continue;
    if (inv.status === 'draft') continue;

    let bestProject: DbProject | null = null;
    let bestScore = 0;
    for (const p of projects) {
      const score = Math.max(nameScore(p.customer_name, inv.customer), nameScore(p.title, inv.customer));
      if (score > bestScore) { bestScore = score; bestProject = p; }
    }

    if (!bestProject || bestScore < 0.3) {
      unmatched.push(`${inv.number} · ${inv.customer} · ${Math.round(inv.gross)} (kein Projekt gefunden)`);
      continue;
    }

    matched++;

    const projEntries = (entriesByProject.get(bestProject.id) ?? [])
      .filter(e => e.direction === 'in' && !e.sevdesk_invoice_id)
      .sort((a, b) => num(a.planned_amount) - num(b.planned_amount));

    let bestEntry: DbEntry | null = null;
    let bestAmtDiff = Infinity;
    for (const e of projEntries) {
      const diff = Math.abs(num(e.planned_amount) - inv.gross);
      const ratio = diff / Math.max(num(e.planned_amount), 1);
      if (ratio < 0.3 && diff < bestAmtDiff) {
        bestAmtDiff = diff;
        bestEntry = e;
      }
    }

    if (!bestEntry && projEntries.length > 0) {
      bestEntry = projEntries.reduce((best, e) =>
        Math.abs(num(e.planned_amount) - inv.gross) < Math.abs(num(best.planned_amount) - inv.gross) ? e : best
      );
    }

    if (bestEntry) {
      const newStatus = inv.status === 'paid' ? 'paid' : 'invoiced';
      const updateData: Record<string, unknown> = {
        sevdesk_invoice_id: inv.id,
        status: newStatus,
        planned_amount: inv.gross,
        planned_date: inv.date ? inv.date.slice(0, 10) : bestEntry.planned_date,
        updated_at: new Date().toISOString(),
      };
      if (inv.status === 'paid' && inv.dueDate) {
        updateData.actual_amount = inv.gross;
        updateData.actual_date = inv.dueDate.slice(0, 10);
      }

      const { error } = await db.from('cashflow_entries').update(updateData).eq('id', bestEntry.id);
      if (!error) {
        updated++;
        details.push({
          project: bestProject.customer_name,
          invoice: `${inv.number} (${Math.round(inv.gross)})`,
          entry: bestEntry.category,
          action: `→ ${newStatus}`,
        });
      }
    } else {
      const newEntry = {
        tenant_id: tid,
        project_id: bestProject.id,
        direction: 'in',
        category: 'sonstiges_in',
        description: `sevDesk ${inv.number}`,
        planned_amount: inv.gross,
        actual_amount: inv.status === 'paid' ? inv.gross : null,
        planned_date: inv.date ? inv.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        actual_date: inv.status === 'paid' && inv.dueDate ? inv.dueDate.slice(0, 10) : null,
        status: inv.status === 'paid' ? 'paid' : 'invoiced',
        sevdesk_invoice_id: inv.id,
        updated_at: new Date().toISOString(),
      };
      const { error } = await db.from('cashflow_entries').insert(newEntry);
      if (!error) {
        updated++;
        details.push({
          project: bestProject.customer_name,
          invoice: `${inv.number} (${Math.round(inv.gross)})`,
          entry: 'NEU: sonstiges_in',
          action: `→ ${inv.status === 'paid' ? 'paid' : 'invoiced'}`,
        });
      }
    }
  }

  return { matched, updated, unmatched, details };
}

export async function cleanupSyncEntries(): Promise<{ cleared: number; reset: number }> {
  const db = getDb();
  const tid = db ? await tenantId() : null;
  if (!db || !tid) return { cleared: 0, reset: 0 };

  // Delete all sonstiges_in entries created by sync (have sevdesk_invoice_id)
  const { data: created } = await db
    .from('cashflow_entries')
    .delete()
    .eq('tenant_id', tid)
    .eq('category', 'sonstiges_in')
    .not('sevdesk_invoice_id', 'is', null)
    .select('id');

  // Reset entries that were updated by sync back to planned
  const { data: linked } = await db
    .from('cashflow_entries')
    .update({ sevdesk_invoice_id: null, status: 'planned', actual_amount: null, actual_date: null, updated_at: new Date().toISOString() })
    .eq('tenant_id', tid)
    .not('sevdesk_invoice_id', 'is', null)
    .select('id');

  return { cleared: created?.length ?? 0, reset: linked?.length ?? 0 };
}

function emptySummary(configured: boolean, error?: string): CashflowSummary {
  return {
    configured,
    error,
    projects: [],
    timeline: [],
    totals: {
      orderValueTotal: 0, plannedInTotal: 0, actualInTotal: 0,
      plannedOutTotal: 0, actualOutTotal: 0, openBalance: 0,
      projectCount: 0, activeCount: 0, flagCount: 0,
    },
    sevdeskLinked: false,
  };
}
