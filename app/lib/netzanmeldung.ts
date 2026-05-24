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

export interface Registration {
  offerId: string;
  customer: string;
  value: number;
  netzbetreiber: string;
  status: StageId;
  startedAt: string;
  dueDate?: string;
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
