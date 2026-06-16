// Server-only Reonic v3 client. Reads credentials from env — never shipped to the
// browser (only imported by server components). Mirrors the auth + categorization
// from the @birdie/connectors package.
// v3 changes: no clientId in path, x-authorization without Basic prefix,
// /residentialProjects instead of /h360/offers, kanbanColumnId on projects.

type ComponentType =
  | 'module' | 'inverter' | 'microinverter' | 'optimizer' | 'batteryStorage'
  | 'wallbox' | 'heatPump' | 'heatingRod' | 'hotWaterStorage'
  | 'moduleFrameConstruction' | 'installationFee' | 'serviceFee' | 'other';

const RULES: [ComponentType, RegExp][] = [
  ['microinverter', /mikro.?wechselrichter|microinverter|micro.?inverter|powerstream/],
  ['optimizer', /optimi[sz]er|leistungsoptimierer/],
  ['inverter', /wechselrichter|inverter|\bwr\b|hybrid-?wr/],
  ['batteryStorage', /speicher|batterie|battery|akku|\blfp\b|powerocean.*batt/],
  ['wallbox', /wallbox|ladestation|charger|typ.?2|wall ?box|emob/],
  ['heatPump', /wärmepumpe|heat ?pump/],
  ['heatingRod', /heizstab|heating rod/],
  ['hotWaterStorage', /warmwasserspeicher|pufferspeicher|brauchwasser/],
  ['moduleFrameConstruction', /unterkonstruktion|montagesystem|gestell|schiene|dachhaken|befestigung/],
  ['module', /\bmodul|pv-?modul|solarmodul|\bpanel\b|glas-glas|full ?black|\d{3}\s?wp/],
  ['installationFee', /montage|installation|inbetriebnahme|dienstleistung/],
  ['serviceFee', /provision|gebühr|pauschale|service|abmelden|anmeldung|netzanmeldung|zähler/],
];

export const typeLabels: Record<ComponentType, string> = {
  module: 'PV-Modul', inverter: 'Wechselrichter', microinverter: 'Mikrowechselrichter',
  optimizer: 'Optimierer', batteryStorage: 'Speicher', wallbox: 'Wallbox',
  heatPump: 'Wärmepumpe', heatingRod: 'Heizstab', hotWaterStorage: 'Warmwasserspeicher',
  moduleFrameConstruction: 'Unterkonstruktion', installationFee: 'Montage',
  serviceFee: 'Dienstleistung', other: 'Sonstiges',
};

function inferType(name = '', description = '', brand = ''): ComponentType {
  const t = `${name} ${description} ${brand}`.toLowerCase();
  for (const [type, pattern] of RULES) if (pattern.test(t)) return type;
  return 'other';
}

export interface CatalogComponent {
  id: string;
  name: string;
  brand?: string;
  articleNr?: string;
  type: ComponentType;
  typeLabel: string;
  price: number;
  purchasePrice?: number;
  vat: number;
}

export interface Catalog {
  configured: boolean;
  total: number;
  byType: { type: ComponentType; label: string; count: number }[];
  components: CatalogComponent[];
  error?: string;
}

interface RawComponent {
  id: string; groupId?: string; name?: string; brand?: string;
  articleNr?: string; price?: number | string; purchasePrice?: number | string; vat?: number | string;
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

// ---------------- Sales pipeline ----------------

function reonicAuth(): { apiKey: string; baseUrl: string } | null {
  const raw = process.env.REONIC_API_KEY;
  if (!raw) return null;
  // Strip BOM / whitespace that env-var tooling sometimes injects
  const apiKey = raw.replace(/^﻿/, '').trim();
  return {
    apiKey,                                           // v3: raw key, no "Basic " prefix
    baseUrl: (process.env.REONIC_BASE_URL || 'https://api.reonic.de/rest/v3').replace(/\/$/, ''),
  };
}

function reonicHeaders(auth: NonNullable<ReturnType<typeof reonicAuth>>): Record<string, string> {
  return { 'x-authorization': auth.apiKey, Accept: 'application/json' };
}

export interface RawOffer {
  id: string;
  name?: string;
  type?: string;
  status?: string;             // v2 Kanban column name (kept for compat)
  state?: string;              // v2 deal state
  customer?: unknown;
  customerNumber?: string;
  totalPlannedPrice?: number;  // v2 price
  lostReason?: string;
  assignedToId?: string;
  assignedTeamIds?: string[];
  // v3 fields (populated from /residentialProjects)
  kanbanBoardId?: string;
  kanbanColumnId?: string;
  stage?: string;              // 'request' | 'offer' | 'installation'
  dealState?: string;          // 'Open' | 'Won' | 'Lost'
  componentsTotalPrice?: number;
  totalPriceOverride?: number | null;
  address?: { street?: string; houseNumber?: string; postcode?: string; city?: string };
  customerContact?: { id?: string; fullName?: string; firstName?: string; lastName?: string; primaryEmail?: string };
  createdAt?: string;
}

export interface SellerStat { id: string; name: string; wonCount: number; wonValue: number; openValue: number }

async function fetchNameMap(
  auth: NonNullable<ReturnType<typeof reonicAuth>>,
  resource: 'users' | 'teams',
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`${auth.baseUrl}/${resource}?page=${page}`, {
        headers: reonicHeaders(auth),
        next: { revalidate: 600 },
      });
      if (!res.ok) break;
      const json = (await res.json()) as { data?: Array<{ id: string; fullName?: string; name?: string }> };
      const list = json.data ?? [];
      for (const item of list) map.set(item.id, item.fullName || item.name || '—');
      if (list.length < 50) break;
    }
  } catch {
    /* names stay unresolved */
  }
  return map;
}

function topStats(
  offers: RawOffer[],
  keyOf: (o: RawOffer) => string | undefined,
  names: Map<string, string>,
): SellerStat[] {
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const m = new Map<string, SellerStat>();
  const price = (o: RawOffer) => num(o.totalPriceOverride ?? o.componentsTotalPrice ?? o.totalPlannedPrice);
  for (const o of offers) {
    const id = keyOf(o);
    if (!id) continue;
    const st = (o.dealState ?? o.state) || '—';
    const s = m.get(id) ?? { id, name: names.get(id) || '—', wonCount: 0, wonValue: 0, openValue: 0 };
    if (st === 'Won') {
      s.wonCount++;
      s.wonValue += price(o);
    } else if (st === 'Open') {
      s.openValue += price(o);
    }
    m.set(id, s);
  }
  return [...m.values()]
    .map((s) => ({ ...s, wonValue: Math.round(s.wonValue), openValue: Math.round(s.openValue) }))
    .filter((s) => s.name !== '—' && (s.wonValue > 0 || s.openValue > 0))
    .sort((a, b) => b.wonValue - a.wonValue || b.openValue - a.openValue)
    .slice(0, 8);
}

function customerName(c: unknown, fallback?: string): string {
  if (typeof c === 'string' && c.trim()) return c;
  if (c && typeof c === 'object') {
    const o = c as Record<string, unknown>;
    // v3: customerContact has fullName
    if (typeof o.fullName === 'string' && o.fullName.trim()) return o.fullName.trim();
    const name = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
    if (name) return name;
    if (typeof o.name === 'string') return o.name;
  }
  return fallback || '—';
}

export interface OfferRow {
  id: string;
  name: string;
  customer: string;
  status: string;
  state: string;
  type: string;
  value: number;
}

export interface Pipeline {
  configured: boolean;
  error?: string;
  total: number;
  open: number;
  won: number;
  lost: number;
  pipelineValueOpen: number;
  wonValue: number;
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
  bySeller: SellerStat[];
  byTeam: SellerStat[];
  recent: OfferRow[];
}

// ── v3 project shape (from /residentialProjects) ───────────────────────────

interface V3Project {
  id: string;
  name?: string;
  stage?: string;
  address?: { street?: string; houseNumber?: string; postcode?: string; city?: string };
  customerContact?: { id?: string; fullName?: string; firstName?: string; lastName?: string; primaryEmail?: string };
  keyAccountManagerId?: string;
  kanbanBoardId?: string;
  kanbanColumnId?: string;
  deal?: { state?: string; lostReason?: string };
  primaryOfferVariant?: { id?: string; componentsTotalPrice?: number; totalPriceOverride?: number | null };
  tagIds?: string[];
  assignedUserIds?: string[];
  assignedTeamIds?: string[];
  customerNumber?: string;
  projectCreatedAt?: string;
  offerCreatedAt?: string;
  requestCreatedAt?: string;
  updatedAt?: string;
}

/** Map a v3 residentialProject to the RawOffer shape used throughout birdie. */
function v3ToRawOffer(p: V3Project): RawOffer {
  const price = p.primaryOfferVariant?.totalPriceOverride
    ?? p.primaryOfferVariant?.componentsTotalPrice
    ?? 0;
  return {
    id: p.id,
    name: p.name,
    state: p.deal?.state,        // "Open" | "Won" | "Lost"
    status: undefined,           // v3 uses kanbanColumnId instead
    customer: p.customerContact,
    customerNumber: p.customerNumber,
    totalPlannedPrice: price,
    lostReason: p.deal?.lostReason ?? undefined,
    assignedToId: p.keyAccountManagerId ?? p.assignedUserIds?.[0],
    assignedTeamIds: p.assignedTeamIds,
    // v3 extras
    kanbanBoardId: p.kanbanBoardId,
    kanbanColumnId: p.kanbanColumnId,
    stage: p.stage,
    dealState: p.deal?.state,
    componentsTotalPrice: p.primaryOfferVariant?.componentsTotalPrice,
    totalPriceOverride: p.primaryOfferVariant?.totalPriceOverride,
    address: p.address,
    customerContact: p.customerContact,
    createdAt: p.projectCreatedAt ?? p.requestCreatedAt ?? p.offerCreatedAt,
  };
}

export type { V3Project };

export async function getReonicPipeline(maxPages = 20): Promise<Pipeline> {
  const auth = reonicAuth();
  if (!auth) return emptyPipeline();

  try {
    const all: RawOffer[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(`${auth.baseUrl}/residentialProjects?page=${page}`, {
        headers: reonicHeaders(auth),
        next: { revalidate: 300 },
      });
      if (!res.ok) return { ...emptyPipeline(), configured: true, error: `Reonic HTTP ${res.status}` };
      const json = (await res.json()) as { data?: V3Project[] };
      const results = json.data ?? [];
      if (results.length === 0) break;
      all.push(...results.map(v3ToRawOffer));
      if (results.length < 50) break;
    }

    const [userNames, teamNames] = await Promise.all([fetchNameMap(auth, 'users'), fetchNameMap(auth, 'teams')]);
    return buildPipeline(all, userNames, teamNames);
  } catch (e) {
    return { ...emptyPipeline(), configured: true, error: (e as Error).message };
  }
}

export function emptyPipeline(): Pipeline {
  return { configured: false, total: 0, open: 0, won: 0, lost: 0, pipelineValueOpen: 0, wonValue: 0, byStatus: [], byType: [], bySeller: [], byTeam: [], recent: [] };
}

/** Aggregate raw offers into the Pipeline view. Reused for live + DB-backed reads.
 *  Optional `cutoff` ISO date string filters to offers created on or after that date. */
export function buildPipeline(allRaw: RawOffer[], userNames: Map<string, string>, teamNames: Map<string, string>, cutoff?: string): Pipeline {
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

  // Zeitraum-Filter (wenn cutoff gesetzt)
  const all = cutoff ? allRaw.filter((o) => (o.createdAt ?? '') >= cutoff) : allRaw;

  // v3: deal.state is mapped to both state and dealState
  const getState = (o: RawOffer) => o.dealState ?? o.state ?? '—';
  const open = all.filter((o) => getState(o) === 'Open');
  const won = all.filter((o) => getState(o) === 'Won');
  const lost = all.filter((o) => getState(o) === 'Lost');

  // v3: price from totalPriceOverride > componentsTotalPrice > totalPlannedPrice
  const price = (o: RawOffer) => num(o.totalPriceOverride ?? o.componentsTotalPrice ?? o.totalPlannedPrice);

  const countBy = (key: keyof RawOffer) => {
    const m = new Map<string, number>();
    for (const o of all) {
      const k = (o[key] as string) || '—';
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].map(([k, count]) => ({ k, count })).sort((a, b) => b.count - a.count);
  };

  // v3: status is undefined, use stage instead (request/offer/installation)
  const byStage = new Map<string, number>();
  for (const o of all) {
    const s = o.stage ?? o.status ?? '—';
    byStage.set(s, (byStage.get(s) ?? 0) + 1);
  }

  return {
    configured: true,
    total: all.length,
    open: open.length,
    won: won.length,
    lost: lost.length,
    pipelineValueOpen: Math.round(open.reduce((s, o) => s + price(o), 0)),
    wonValue: Math.round(won.reduce((s, o) => s + price(o), 0)),
    byStatus: [...byStage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([status, count]) => ({ status, count })),
    byType: countBy('type').map(({ k, count }) => ({ type: k, count })),
    bySeller: topStats(all, (o) => o.assignedToId, userNames),
    byTeam: topStats(all, (o) => o.assignedTeamIds?.[0], teamNames),
    recent: all.slice(0, 40).map((o) => ({
      id: o.id,
      name: o.name || '—',
      customer: customerName(o.customer, o.customerNumber),
      status: o.stage ?? o.status ?? '—',
      state: getState(o),
      type: o.type || '—',
      value: price(o),
    })),
  };
}

// ---------------- Won projects (for Anlagen page) ----------------

export async function getWonProjects(maxPages = 5): Promise<RawOffer[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  const all: RawOffer[] = [];
  try {
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(`${auth.baseUrl}/residentialProjects?page=${page}&dealState=Won`, {
        headers: reonicHeaders(auth),
        next: { revalidate: 300 },
      });
      if (!res.ok) break;
      const json = (await res.json()) as { data?: V3Project[] };
      const results = json.data ?? [];
      if (results.length === 0) break;
      all.push(...results.map(v3ToRawOffer));
      if (results.length < 50) break;
    }
  } catch { /* best effort */ }
  return all;
}

// ---------------- Raw fetchers (for DB sync) ----------------

export async function getReonicOffersRaw(maxPages = 40): Promise<{ id: string; data: unknown }[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  const all: { id: string; data: unknown }[] = [];
  const seen = new Set<string>();

  // Sync Won offers first (important for Netzanmeldung), then remaining.
  // v3 API supports dealState filter — Won-only is much smaller (~800 vs 10.000+).
  for (const dealState of ['Won', '']) {
    const filter = dealState ? `&dealState=${dealState}` : '';
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(`${auth.baseUrl}/residentialProjects?page=${page}${filter}`, {
        headers: reonicHeaders(auth), cache: 'no-store',
      });
      if (!res.ok) break;
      const json = (await res.json()) as { data?: V3Project[] };
      const results = json.data ?? [];
      for (const p of results) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          all.push({ id: p.id, data: v3ToRawOffer(p) });
        }
      }
      if (results.length < 50) break;
    }
  }
  return all;
}

export async function getReonicContactsRaw(maxPages = 60): Promise<{ id: string; data: unknown }[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  const all: { id: string; data: unknown }[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${auth.baseUrl}/contacts?page=${page}`, {
      headers: reonicHeaders(auth), cache: 'no-store',
    });
    if (!res.ok) break;
    const json = (await res.json()) as { data?: { id: string }[] };
    const list = json.data ?? [];
    for (const c of list) all.push({ id: c.id, data: c });
    if (list.length < 50) break;
  }
  return all;
}

export async function getReonicDirectoryRaw(resource: 'users' | 'teams'): Promise<{ id: string; data: unknown }[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  const res = await fetch(`${auth.baseUrl}/${resource}`, {
    headers: reonicHeaders(auth), cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: { id: string; fullName?: string; name?: string; email?: string; role?: string }[] };
  const list = json.data ?? [];
  const byId = new Map<string, { id: string; data: unknown }>();
  for (const item of list) {
    byId.set(item.id, {
      id: item.id,
      data: { id: item.id, name: item.fullName || item.name || '—', email: item.email, role: item.role },
    });
  }
  return [...byId.values()];
}

// ---------------- Leads (contacts) ----------------

export interface RawContact {
  id: string; firstName?: string; lastName?: string; city?: string;
  utmSource?: string; createdAt?: string;
}

export interface Leads {
  configured: boolean;
  total: number;
  capped: boolean;
  bySource: { source: string; count: number }[];
  recent: { name: string; source: string; city?: string; createdAt?: string }[];
}

export async function getReonicLeads(maxPages = 8): Promise<Leads> {
  const auth = reonicAuth();
  const base: Leads = { configured: false, total: 0, capped: false, bySource: [], recent: [] };
  if (!auth) return base;

  try {
    const all: RawContact[] = [];
    let capped = false;
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(`${auth.baseUrl}/contacts?page=${page}`, {
        headers: reonicHeaders(auth),
        next: { revalidate: 300 },
      });
      if (!res.ok) return { ...base, configured: true };
      const json = (await res.json()) as { data?: RawContact[] };
      const list = json.data ?? [];
      all.push(...list);
      if (list.length < 50) break;
      if (page === maxPages) capped = true;
    }

    return buildLeads(all, capped);
  } catch {
    return { ...base, configured: true };
  }
}

/** Aggregate raw contacts into the Leads view. Reused for live + DB-backed reads. */
export function buildLeads(all: RawContact[], capped = false): Leads {
  const m = new Map<string, number>();
  for (const c of all) {
    const s = c.utmSource?.trim() || 'Direkt';
    m.set(s, (m.get(s) ?? 0) + 1);
  }
  const bySource = [...m.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);

  const recent = [...all]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 6)
    .map((c) => ({
      name: [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || '—',
      source: c.utmSource?.trim() || 'Direkt',
      city: c.city,
      createdAt: c.createdAt,
    }));

  return { configured: true, total: all.length, capped, bySource, recent };
}

// ---------------- Upcoming appointments ----------------

interface RawEvent {
  id: string; title?: string; titleForCustomer?: string; start?: string; end?: string; location?: string;
}

export interface UpcomingEvent { id: string; title: string; start: string; location?: string }

export async function getUpcomingEvents(limit = 8): Promise<UpcomingEvent[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  try {
    const nowIso = new Date().toISOString();
    const url = `${auth.baseUrl}/appointments?page=1`;
    const res = await fetch(url, { headers: reonicHeaders(auth), next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: RawEvent[] };
    const list = json.data ?? [];
    const now = Date.now();
    return list
      .filter((e) => e.start && Date.parse(e.start) >= now)
      .sort((a, b) => Date.parse(a.start!) - Date.parse(b.start!))
      .slice(0, limit)
      .map((e) => ({ id: e.id, title: e.titleForCustomer || e.title || 'Termin', start: e.start!, location: e.location }));
  } catch {
    return [];
  }
}

// ---------------- Combined dashboard fetch ----------------

export interface ReonicDashboard {
  configured: boolean;
  pipeline: Pipeline;
  leads: Leads;
  events: UpcomingEvent[];
}

export async function getReonicDashboard(): Promise<ReonicDashboard> {
  if (!reonicAuth()) {
    return {
      configured: false,
      pipeline: await getReonicPipeline(0),
      leads: { configured: false, total: 0, capped: false, bySource: [], recent: [] },
      events: [],
    };
  }
  const [pipeline, leads, events] = await Promise.all([getReonicPipeline(10), getReonicLeads(8), getUpcomingEvents(8)]);
  return { configured: true, pipeline, leads, events };
}

export async function getReonicCatalog(): Promise<Catalog> {
  const auth = reonicAuth();
  if (!auth) return { configured: false, total: 0, byType: [], components: [] };

  try {
    const res = await fetch(`${auth.baseUrl}/components`, {
      headers: reonicHeaders(auth),
      next: { revalidate: 300 },
    });
    if (!res.ok) return { configured: true, total: 0, byType: [], components: [], error: `Reonic HTTP ${res.status}` };

    const json = (await res.json()) as { data?: RawComponent[] };
    const raw = json.data ?? [];
    const components: CatalogComponent[] = raw.map((c) => {
      const type = inferType(c.name, undefined, c.brand);
      return {
        id: c.id,
        name: c.name ?? c.articleNr ?? c.id,
        brand: c.brand,
        articleNr: c.articleNr,
        type,
        typeLabel: typeLabels[type],
        price: num(c.price),
        purchasePrice: c.purchasePrice != null ? num(c.purchasePrice) : undefined,
        vat: num(c.vat),
      };
    });

    return buildCatalog(components);
  } catch (e) {
    return { configured: true, total: 0, byType: [], components: [], error: (e as Error).message };
  }
}

/** Aggregate a component list into the Catalog view (reused for DB-backed reads). */
export function buildCatalog(components: CatalogComponent[]): Catalog {
  const counts = new Map<ComponentType, number>();
  for (const c of components) counts.set(c.type, (counts.get(c.type) ?? 0) + 1);
  const byType = [...counts.entries()]
    .map(([type, count]) => ({ type, label: typeLabels[type], count }))
    .sort((a, b) => b.count - a.count);
  return { configured: true, total: components.length, byType, components };
}
