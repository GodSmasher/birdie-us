// Netzanmeldung — grid-registration tracker. There is no Netzbetreiber/MaStR API,
// so .birdie owns this workflow: each won project moves through fixed stages.
// Registrations are stored in the DB (entities kind='registration'), seeded from
// won Reonic offers and advanced manually (one place instead of portal-shuffling).

import { getDb, tenantId, getEntities, upsertEntities, deleteEntities } from './db';
import type { RawOffer } from './reonic-server';
import { netzbetreiberForPlz } from './netzbetreiber';

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

export interface BotError {
  at: string;
  step: string;         // welcher Schritt fehlgeschlagen ist (z.B. "login", "step2_adresse")
  error: string;        // Fehlerbeschreibung
  screenshot?: string;  // Pfad/URL zum Screenshot
  retries: number;      // wie oft schon versucht
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
  botErrors?: BotError[];
  botRetries?: number;   // Gesamtzahl Versuche
  botSkipUntil?: string; // exponentielles Backoff — vor diesem Zeitpunkt nicht erneut versuchen
}

function customerName(c: unknown, ...fallbacks: (string | undefined | null)[]): string {
  if (typeof c === 'string' && c.trim()) return c.trim();
  if (c && typeof c === 'object') {
    const o = c as Record<string, unknown>;
    const n = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
    if (n) return n;
    if (typeof o.name === 'string' && o.name.trim()) return o.name.trim();
    if (typeof o.company === 'string' && o.company.trim()) return o.company.trim();
  }
  for (const fb of fallbacks) {
    if (typeof fb === 'string' && fb.trim()) return fb.trim();
  }
  return '—';
}

export interface Portal { name: string; username?: string; password?: string; portalUrl?: string; hasPassword: boolean }

export async function getPortals(): Promise<Portal[]> {
  const rows = await getEntities<Portal>('portal');
  // Deduplicate by name — prefer entry with complete credentials over stub
  const byName = new Map<string, Portal>();
  for (const p of rows) {
    const existing = byName.get(p.name);
    if (!existing || (p.password && !existing.password)) {
      byName.set(p.name, p);
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Get portal credentials for the bot — only returns portals with complete login data. */
export async function getPortalCredentials(): Promise<Map<string, { username: string; password: string; portalUrl: string }>> {
  const portals = await getPortals();
  const map = new Map<string, { username: string; password: string; portalUrl: string }>();
  for (const p of portals) {
    if (p.username && p.password && p.portalUrl) {
      map.set(p.name, { username: p.username, password: p.password, portalUrl: p.portalUrl });
    }
  }
  return map;
}

/** Upsert a portal's login credentials. */
export async function savePortalCredentials(
  name: string,
  creds: { username: string; password: string; portalUrl: string },
): Promise<boolean> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return false;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const data: Portal = {
    name,
    username: creds.username,
    password: creds.password,
    portalUrl: creds.portalUrl,
    hasPassword: true,
  };
  const n = await upsertEntities(tid, 'manual', 'portal', [{ externalId: slug, data }]);
  return n > 0;
}

/** Delete a portal by name (removes all slugs matching this name). */
export async function deletePortal(name: string): Promise<boolean> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return false;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const n = await deleteEntities(tid, 'portal', [slug]);
  return n > 0;
}

export async function getRegistrations(): Promise<Registration[]> {
  const rows = await getEntities<Registration>('registration');
  return rows.sort((a, b) => STAGE_IDS.indexOf(a.status) - STAGE_IDS.indexOf(b.status));
}

// Kanban-Spalte bei der Projekte reif für Netzanmeldung sind.
const NETZ_READY_STATUS = 'NTS/Zählerweise/HAK';

/** Create registrations for won offers that don't have one yet AND refresh
 *  customer name / value on existing ones (status, docStatus, documents stay). */
export interface SeedResult {
  upserted: number;
  deleted: number;
  existing: number;
  ntsOffers: number;
  totalOffers: number;
  wonOffers: number;
}

export async function seedRegistrations(): Promise<SeedResult> {
  const zero: SeedResult = { upserted: 0, deleted: 0, existing: 0, ntsOffers: 0, totalOffers: 0, wonOffers: 0 };
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return zero;

  const existingRegs = await getEntities<Registration>('registration');
  const regMap = new Map(existingRegs.map((r) => [r.offerId, r]));

  const offers = await getEntities<RawOffer>('offer');
  const offerMap = new Map(offers.map((o) => [o.id, o]));
  const wonAll = offers.filter((o) => o.state === 'Won');

  // Nur gewonnene Projekte im richtigen Kanban-Status (NTS/Zählerweise/HAK).
  const won = wonAll.filter((o) => o.status === NETZ_READY_STATUS);

  // Bestehende Registrations aufräumen: wenn das Offer NICHT mehr im NTS-Status
  // steht UND noch nicht bearbeitet wurde (anfrage + offen), löschen.
  const toDelete = existingRegs
    .filter((r) => {
      const offer = offerMap.get(r.offerId);
      if (!offer || offer.status === NETZ_READY_STATUS) return false; // keep
      // Schon bearbeitet? → behalten (Status weiter als anfrage ODER Dokumente erzeugt)
      if (r.status !== 'anfrage') return false;
      if (r.docStatus && r.docStatus !== 'offen') return false;
      if (r.documents && r.documents.length > 0) return false;
      return true; // unbearbeitet + falscher Status → weg
    })
    .map((r) => r.offerId);
  if (toDelete.length > 0) {
    await deleteEntities(tid, 'registration', toDelete);
  }

  const now = new Date();
  // Nur NTS-Offers: neue anlegen oder bestehende aktualisieren
  const rows = won.map((o) => {
    const existing = regMap.get(o.id);
    const name = customerName(o.customer, o.name ?? o.customerNumber);
    const value = typeof o.totalPlannedPrice === 'number' ? o.totalPlannedPrice : 0;
    if (existing) {
      return {
        externalId: o.id,
        data: {
          ...existing,
          customer: name !== '—' ? name : existing.customer,
          value: value > 0 ? value : existing.value,
        } satisfies Registration,
      };
    }
    return {
      externalId: o.id,
      data: {
        offerId: o.id,
        customer: name,
        value,
        netzbetreiber: '—',
        status: 'anfrage' as StageId,
        startedAt: now.toISOString(),
        docStatus: 'offen' as DocStatus,
        documents: [],
      } satisfies Registration,
    };
  });

  const upserted = await upsertEntities(tid, 'reonic', 'registration', rows);
  return {
    upserted,
    deleted: toDelete.length,
    existing: existingRegs.length,
    ntsOffers: won.length,
    totalOffers: offers.length,
    wonOffers: wonAll.length,
  };
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

/** Record a bot error — stores the error on the registration and calculates backoff. */
export async function reportBotError(
  offerId: string,
  err: { step: string; error: string; screenshot?: string },
): Promise<boolean> {
  const loaded = await loadReg(offerId);
  if (!loaded) return false;
  const { tid, reg } = loaded;
  const retries = (reg.botRetries ?? 0) + 1;
  const botErr: BotError = { at: new Date().toISOString(), step: err.step, error: err.error, screenshot: err.screenshot, retries };
  // Keep last 5 errors per registration
  reg.botErrors = [...(reg.botErrors ?? []).slice(-4), botErr];
  reg.botRetries = retries;
  // Exponential backoff: 5min, 15min, 45min, 2h, 6h, max 24h
  const backoffMs = Math.min(5 * 60_000 * Math.pow(3, retries - 1), 24 * 60 * 60_000);
  reg.botSkipUntil = new Date(Date.now() + backoffMs).toISOString();
  const n = await upsertEntities(tid, 'reonic', 'registration', [{ externalId: offerId, data: reg }]);
  return n > 0;
}

/** Reset backoff for ALL registrations so the bot retries immediately. */
export async function resetAllBackoff(): Promise<number> {
  const tid = await tenantId();
  if (!tid) return 0;
  const regs = await getRegistrations();
  const toReset = regs.filter((r) => r.botSkipUntil || r.botRetries);
  if (toReset.length === 0) return 0;
  const batch = toReset.map((r) => {
    delete r.botSkipUntil;
    r.botRetries = 0;
    r.botErrors = [];
    return { externalId: r.offerId, data: r };
  });
  return upsertEntities(tid, 'reonic', 'registration', batch);
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

// ── VBN-Zuordnung ───────────────────────────────────────────────────────────

export interface OfferAddress { zip?: string; city?: string; street?: string }

/** Resolve address for an offer by loading its linked contact. */
async function addressForOffer(db: ReturnType<typeof getDb>, tid: string, offer: RawOffer): Promise<OfferAddress> {
  const customerId = (offer.customer as { id?: string })?.id;
  if (!customerId || !db) return {};
  const { data: cRow } = await db
    .from('entities').select('data').eq('tenant_id', tid).eq('kind', 'contact').eq('external_id', customerId).single();
  if (!cRow) return {};
  const c = (cRow as { data: Record<string, unknown> }).data;
  return {
    zip: (c.postcode as string) || undefined,
    city: (c.city as string) || undefined,
    street: (c.street as string) || undefined,
  };
}

/** Legacy helper — just returns zip. */
async function plzForOffer(db: ReturnType<typeof getDb>, tid: string, offer: RawOffer): Promise<string | undefined> {
  return (await addressForOffer(db, tid, offer)).zip;
}

export interface VbnResult {
  updated: number;
  skipped: number;
  noPlz: number;
  details: { offerId: string; customer: string; nb: string; confidence: string }[];
}

/** Bulk-assign Verteilnetzbetreiber (VBN) to all registrations via PLZ→NB lookup.
 *  Only updates registrations where netzbetreiber is still '—' or empty, unless force=true. */
export async function assignNetzbetreiber(force = false): Promise<VbnResult> {
  const result: VbnResult = { updated: 0, skipped: 0, noPlz: 0, details: [] };
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return result;

  const regs = await getEntities<Registration>('registration');
  const offers = await getEntities<RawOffer>('offer');
  const offerMap = new Map(offers.map((o) => [o.id, o]));

  const toUpdate: { externalId: string; data: Registration }[] = [];

  for (const reg of regs) {
    // Skip already assigned unless force
    if (!force && reg.netzbetreiber && reg.netzbetreiber !== '—') {
      result.skipped++;
      continue;
    }

    const offer = offerMap.get(reg.offerId);
    if (!offer) { result.skipped++; continue; }

    const plz = await plzForOffer(db, tid, offer);
    if (!plz) {
      result.noPlz++;
      continue;
    }

    const nb = netzbetreiberForPlz(plz);
    if (!nb) {
      result.noPlz++;
      continue;
    }

    reg.netzbetreiber = nb.name;
    toUpdate.push({ externalId: reg.offerId, data: reg });
    result.details.push({ offerId: reg.offerId, customer: reg.customer, nb: nb.name, confidence: nb.confidence });
  }

  if (toUpdate.length > 0) {
    result.updated = await upsertEntities(tid, 'reonic', 'registration', toUpdate);
  }
  return result;
}

/** Bulk-assign VBN via the vnbdigital.de bot (exact lookup per address). */
export async function assignNetzbetreiberBot(force = false): Promise<VbnResult> {
  const { botVnbLookup } = await import('./vnb-bot');
  const result: VbnResult = { updated: 0, skipped: 0, noPlz: 0, details: [] };
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return result;

  const regs = await getEntities<Registration>('registration');
  const offers = await getEntities<RawOffer>('offer');
  const offerMap = new Map(offers.map((o) => [o.id, o]));

  const toUpdate: { externalId: string; data: Registration }[] = [];

  for (const reg of regs) {
    if (!force && reg.netzbetreiber && reg.netzbetreiber !== '—') {
      result.skipped++;
      continue;
    }

    const offer = offerMap.get(reg.offerId);
    if (!offer) { result.skipped++; continue; }

    const addr = await addressForOffer(db, tid, offer);
    if (!addr.zip) { result.noPlz++; continue; }

    const lookup = await botVnbLookup({ zip: addr.zip, city: addr.city, street: addr.street });
    if (lookup.netzbetreiber) {
      reg.netzbetreiber = lookup.netzbetreiber;
      toUpdate.push({ externalId: reg.offerId, data: reg });
      result.details.push({ offerId: reg.offerId, customer: reg.customer, nb: lookup.netzbetreiber, confidence: lookup.confidence });
    } else {
      // Fallback auf PLZ-Heuristik
      const nb = netzbetreiberForPlz(addr.zip);
      if (nb) {
        reg.netzbetreiber = nb.name;
        toUpdate.push({ externalId: reg.offerId, data: reg });
        result.details.push({ offerId: reg.offerId, customer: reg.customer, nb: nb.name, confidence: 'fallback-' + nb.confidence });
      } else {
        result.noPlz++;
      }
    }
  }

  if (toUpdate.length > 0) {
    result.updated = await upsertEntities(tid, 'reonic', 'registration', toUpdate);
  }
  return result;
}

/** Manually set the Netzbetreiber (VBN) for a single registration. */
export async function setNetzbetreiber(offerId: string, nbName: string): Promise<boolean> {
  const loaded = await loadReg(offerId);
  if (!loaded) return false;
  const { tid, reg } = loaded;
  reg.netzbetreiber = nbName;
  const n = await upsertEntities(tid, 'reonic', 'registration', [{ externalId: offerId, data: reg }]);
  return n > 0;
}
