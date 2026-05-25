// Netzanmeldung — grid-registration tracker. There is no Netzbetreiber/MaStR API,
// so .birdie owns this workflow: each won project moves through fixed stages.
// Registrations are stored in the DB (entities kind='registration'), seeded from
// won Reonic offers and advanced manually (one place instead of portal-shuffling).

import { getDb, tenantId, getEntities, upsertEntities } from './db';
import type { RawOffer } from './reonic-server';

export const STAGES = [
  { id: 'anfrage', label: 'Netzanfrage', desc: 'Anschlussbegehren beim Netzbetreiber' },
  { id: 'zusage', label: 'Zusage', desc: 'Netzbetreiber bestätigt' },
  { id: 'inbetriebnahme', label: 'Inbetriebnahme', desc: 'Anlage in Betrieb + Protokoll' },
  { id: 'mastr', label: 'MaStR', desc: 'Marktstammdatenregister · Frist 1 Monat' },
  { id: 'abschluss', label: 'Abgeschlossen', desc: 'Zähler gesetzt, fertig' },
] as const;

export type StageId = (typeof STAGES)[number]['id'];
export const STAGE_IDS = STAGES.map((s) => s.id) as StageId[];

// Document/review lifecycle — the office's actual to-do flow. Separate from the
// grid-process STAGES above. A (later) portal bot would create drafts → 'pruefen';
// a human reviews + frees them → 'freigegeben'; after portal submission → 'eingereicht'.
export const DOC_STAGES = [
  { id: 'offen', label: 'Offen', desc: 'noch kein Entwurf erzeugt' },
  { id: 'pruefen', label: 'Bitte prüfen', desc: 'Entwurf erzeugt — auf Freigabe wartend' },
  { id: 'freigegeben', label: 'Freigegeben', desc: 'geprüft, bereit zum Einreichen' },
  { id: 'eingereicht', label: 'Eingereicht', desc: 'beim Netzbetreiber eingereicht' },
] as const;

export type DocStatus = (typeof DOC_STAGES)[number]['id'];
export const DOC_STATUS_IDS = DOC_STAGES.map((s) => s.id) as DocStatus[];

export interface GeneratedDoc {
  form: 'e2' | 'e3';
  at: string;
  source?: 'manuell' | 'bot';
  draftRef?: string;
}

export interface Registration {
  offerId: string;
  customer: string;
  value: number;
  netzbetreiber: string;
  status: StageId;
  startedAt: string;
  dueDate?: string;
  docStatus?: DocStatus;
  documents?: GeneratedDoc[];
}

function customerName(c: unknown, fb?: string): string {
  if (typeof c === 'string' && c.trim()) return c;
  if (c && typeof c === 'object') {
    const o = c as Record<string, unknown>;
    const n = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
    if (n) return n;
    if (typeof o.name === 'string') return o.name;
  }
  return fb ?? '—';
}

export interface Portal { name: string; username?: string; portalUrl?: string; hasPassword: boolean }

export async function getPortals(): Promise<Portal[]> {
  const rows = await getEntities<Portal>('portal');
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRegistrations(): Promise<Registration[]> {
  const rows = await getEntities<Registration>('registration');
  return rows.sort((a, b) => STAGE_IDS.indexOf(a.status) - STAGE_IDS.indexOf(b.status));
}

/** Create registrations for won offers that don't have one yet (keeps existing status). */
export async function seedRegistrations(): Promise<number> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return 0;

  const { data: existing } = await db.from('entities').select('external_id').eq('tenant_id', tid).eq('kind', 'registration');
  const have = new Set((existing ?? []).map((r) => (r as { external_id: string }).external_id));

  const offers = await getEntities<RawOffer>('offer');
  const won = offers.filter((o) => o.state === 'Won' && !have.has(o.id));

  const now = new Date();
  const rows = won.map((o) => ({
    externalId: o.id,
    data: {
      offerId: o.id,
      customer: customerName(o.customer, o.customerNumber),
      value: typeof o.totalPlannedPrice === 'number' ? o.totalPlannedPrice : 0,
      netzbetreiber: '—',
      status: 'anfrage' as StageId,
      startedAt: now.toISOString(),
      docStatus: 'offen' as DocStatus,
      documents: [],
    } satisfies Registration,
  }));

  return upsertEntities(tid, 'reonic', 'registration', rows);
}

export async function setRegistrationStatus(offerId: string, status: StageId): Promise<boolean> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid || !STAGE_IDS.includes(status)) return false;

  const { data } = await db
    .from('entities')
    .select('data')
    .eq('tenant_id', tid)
    .eq('kind', 'registration')
    .eq('external_id', offerId)
    .single();
  if (!data) return false;

  const reg = (data as { data: Registration }).data;
  reg.status = status;
  // Entering "inbetriebnahme" starts the 1-month MaStR clock.
  if (status === 'inbetriebnahme') {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    reg.dueDate = due.toISOString();
  }
  if (status === 'abschluss') reg.dueDate = undefined;

  const n = await upsertEntities(tid, 'reonic', 'registration', [{ externalId: offerId, data: reg }]);
  return n > 0;
}

async function loadReg(offerId: string): Promise<{ tid: string; reg: Registration } | null> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return null;
  const { data } = await db
    .from('entities').select('data').eq('tenant_id', tid).eq('kind', 'registration').eq('external_id', offerId).single();
  if (!data) return null;
  return { tid, reg: (data as { data: Registration }).data };
}

/** Record that a draft document was generated → moves the registration to 'pruefen'. */
export async function recordDraft(
  offerId: string,
  form: 'e2' | 'e3',
  opts: { source?: 'manuell' | 'bot'; draftRef?: string } = {},
): Promise<boolean> {
  const loaded = await loadReg(offerId);
  if (!loaded) return false;
  const { tid, reg } = loaded;
  const docs = (reg.documents ?? []).filter((d) => d.form !== form);
  docs.push({ form, at: new Date().toISOString(), source: opts.source ?? 'manuell', draftRef: opts.draftRef });
  reg.documents = docs;
  // Only advance forward — don't pull a freigegeben/eingereicht item back.
  if (!reg.docStatus || reg.docStatus === 'offen') reg.docStatus = 'pruefen';
  const n = await upsertEntities(tid, 'reonic', 'registration', [{ externalId: offerId, data: reg }]);
  return n > 0;
}

/** Set the document/review status (Freigabe, Eingereicht …). */
export async function setDocStatus(offerId: string, docStatus: DocStatus): Promise<boolean> {
  if (!DOC_STATUS_IDS.includes(docStatus)) return false;
  const loaded = await loadReg(offerId);
  if (!loaded) return false;
  const { tid, reg } = loaded;
  reg.docStatus = docStatus;
  const n = await upsertEntities(tid, 'reonic', 'registration', [{ externalId: offerId, data: reg }]);
  return n > 0;
}
