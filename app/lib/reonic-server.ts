// Server-only Reonic v2 client. Reads credentials from env — never shipped to the
// browser (only imported by server components). Mirrors the auth + categorization
// from the @birdie/connectors package.

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

// ---------------- Sales pipeline (h360 offers) ----------------

function reonicAuth(): { apiKey: string; clientId: string; baseUrl: string } | null {
  const apiKey = process.env.REONIC_API_KEY;
  const clientId = process.env.REONIC_CLIENT_ID;
  if (!apiKey || !clientId) return null;
  return {
    apiKey: apiKey.startsWith('Basic ') ? apiKey : `Basic ${apiKey}`,
    clientId,
    baseUrl: (process.env.REONIC_BASE_URL || 'https://api.reonic.de/rest/v2').replace(/\/$/, ''),
  };
}

export interface RawOffer {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  state?: string;
  customer?: unknown;
  customerNumber?: string;
  totalPlannedPrice?: number;
  lostReason?: string;
  assignedToId?: string;
  assignedTeamIds?: string[];
}

export interface SellerStat { name: string; wonCount: number; wonValue: number; openValue: number }

async function fetchNameMap(
  auth: NonNullable<ReturnType<typeof reonicAuth>>,
  resource: 'users' | 'teams',
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`${auth.baseUrl}/clients/${auth.clientId}/${resource}?page=${page}`, {
        headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' },
        next: { revalidate: 600 },
      });
      if (!res.ok) break;
      const data = (await res.json()) as Array<{ id: string; fullName?: string; name?: string }>;
      const list = Array.isArray(data) ? data : [];
      for (const item of list) map.set(item.id, item.fullName || item.name || '—');
      if (list.length < 100) break;
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
  for (const o of offers) {
    const id = keyOf(o);
    if (!id) continue;
    const s = m.get(id) ?? { name: names.get(id) || '—', wonCount: 0, wonValue: 0, openValue: 0 };
    if (o.state === 'Won') {
      s.wonCount++;
      s.wonValue += num(o.totalPlannedPrice);
    } else if (o.state === 'Open') {
      s.openValue += num(o.totalPlannedPrice);
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

export async function getReonicPipeline(maxPages = 15): Promise<Pipeline> {
  const auth = reonicAuth();
  if (!auth) return emptyPipeline();

  try {
    const all: RawOffer[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(`${auth.baseUrl}/clients/${auth.clientId}/h360/offers?page=${page}`, {
        headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (!res.ok) return { ...emptyPipeline(), configured: true, error: `Reonic HTTP ${res.status}` };
      const data = (await res.json()) as { results?: RawOffer[]; hasNextPage?: boolean };
      const results = data.results ?? [];
      all.push(...results);
      if (!data.hasNextPage || results.length === 0) break;
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

/** Aggregate raw offers into the Pipeline view. Reused for live + DB-backed reads. */
export function buildPipeline(all: RawOffer[], userNames: Map<string, string>, teamNames: Map<string, string>): Pipeline {
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const open = all.filter((o) => o.state === 'Open');
  const won = all.filter((o) => o.state === 'Won');
  const lost = all.filter((o) => o.state === 'Lost');

  const countBy = (key: keyof RawOffer) => {
    const m = new Map<string, number>();
    for (const o of all) {
      const k = (o[key] as string) || '—';
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].map(([k, count]) => ({ k, count })).sort((a, b) => b.count - a.count);
  };

  return {
    configured: true,
    total: all.length,
    open: open.length,
    won: won.length,
    lost: lost.length,
    pipelineValueOpen: Math.round(open.reduce((s, o) => s + num(o.totalPlannedPrice), 0)),
    wonValue: Math.round(won.reduce((s, o) => s + num(o.totalPlannedPrice), 0)),
    byStatus: countBy('status').slice(0, 10).map(({ k, count }) => ({ status: k, count })),
    byType: countBy('type').map(({ k, count }) => ({ type: k, count })),
    bySeller: topStats(all, (o) => o.assignedToId, userNames),
    byTeam: topStats(all, (o) => o.assignedTeamIds?.[0], teamNames),
    recent: all.slice(0, 40).map((o) => ({
      id: o.id,
      name: o.name || '—',
      customer: customerName(o.customer, o.customerNumber),
      status: o.status || '—',
      state: o.state || '—',
      type: o.type || '—',
      value: num(o.totalPlannedPrice),
    })),
  };
}

// ---------------- Raw fetchers (for DB sync) ----------------

export async function getReonicOffersRaw(maxPages = 15): Promise<{ id: string; data: unknown }[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  const all: { id: string; data: unknown }[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${auth.baseUrl}/clients/${auth.clientId}/h360/offers?page=${page}`, {
      headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' }, cache: 'no-store',
    });
    if (!res.ok) break;
    const data = (await res.json()) as { results?: { id: string }[]; hasNextPage?: boolean };
    const r = data.results ?? [];
    for (const o of r) all.push({ id: o.id, data: o });
    if (!data.hasNextPage || r.length === 0) break;
  }
  return all;
}

export async function getReonicContactsRaw(maxPages = 12): Promise<{ id: string; data: unknown }[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  const all: { id: string; data: unknown }[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${auth.baseUrl}/clients/${auth.clientId}/contacts?page=${page}`, {
      headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' }, cache: 'no-store',
    });
    if (!res.ok) break;
    const list = (await res.json()) as { id: string }[];
    if (!Array.isArray(list)) break;
    for (const c of list) all.push({ id: c.id, data: c });
    if (list.length < 100) break;
  }
  return all;
}

export async function getReonicDirectoryRaw(resource: 'users' | 'teams'): Promise<{ id: string; data: unknown }[]> {
  const auth = reonicAuth();
  if (!auth) return [];
  const out: { id: string; data: unknown }[] = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${auth.baseUrl}/clients/${auth.clientId}/${resource}?page=${page}`, {
      headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' }, cache: 'no-store',
    });
    if (!res.ok) break;
    const json = (await res.json()) as unknown;
    const list = (Array.isArray(json) ? json : ((json as { results?: unknown[] })?.results ?? [])) as { id: string; fullName?: string; name?: string }[];
    if (list.length === 0) break;
    for (const item of list) out.push({ id: item.id, data: { id: item.id, name: item.fullName || item.name || '—' } });
    if (list.length < 100) break;
  }
  return out;
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
      const res = await fetch(`${auth.baseUrl}/clients/${auth.clientId}/contacts?page=${page}`, {
        headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (!res.ok) return { ...base, configured: true };
      const data = (await res.json()) as RawContact[];
      const list = Array.isArray(data) ? data : [];
      all.push(...list);
      if (list.length < 100) break;
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
    const url = `${auth.baseUrl}/clients/${auth.clientId}/calendar-events?sort=start&start.gt=${encodeURIComponent(nowIso)}&page=1`;
    const res = await fetch(url, { headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' }, next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as RawEvent[] | { results?: RawEvent[] };
    const list = Array.isArray(data) ? data : (data.results ?? []);
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
  const apiKey = process.env.REONIC_API_KEY;
  const clientId = process.env.REONIC_CLIENT_ID;
  const baseUrl = (process.env.REONIC_BASE_URL || 'https://api.reonic.de/rest/v2').replace(/\/$/, '');

  if (!apiKey || !clientId) {
    return { configured: false, total: 0, byType: [], components: [] };
  }

  try {
    const res = await fetch(`${baseUrl}/clients/${clientId}/components`, {
      headers: { 'x-authorization': apiKey.startsWith('Basic ') ? apiKey : `Basic ${apiKey}`, Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return { configured: true, total: 0, byType: [], components: [], error: `Reonic HTTP ${res.status}` };

    const raw = (await res.json()) as RawComponent[];
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
