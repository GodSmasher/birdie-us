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

interface RawOffer {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  state?: string;
  customer?: unknown;
  customerNumber?: string;
  totalPlannedPrice?: number;
  lostReason?: string;
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
  recent: OfferRow[];
}

export async function getReonicPipeline(maxPages = 15): Promise<Pipeline> {
  const auth = reonicAuth();
  if (!auth) return empty();

  try {
    const all: RawOffer[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const res = await fetch(`${auth.baseUrl}/clients/${auth.clientId}/h360/offers?page=${page}`, {
        headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (!res.ok) return { ...empty(), configured: true, error: `Reonic HTTP ${res.status}` };
      const data = (await res.json()) as { results?: RawOffer[]; hasNextPage?: boolean };
      const results = data.results ?? [];
      all.push(...results);
      if (!data.hasNextPage || results.length === 0) break;
    }

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
  } catch (e) {
    return { ...empty(), configured: true, error: (e as Error).message };
  }

  function empty(): Pipeline {
    return { configured: false, total: 0, open: 0, won: 0, lost: 0, pipelineValueOpen: 0, wonValue: 0, byStatus: [], byType: [], recent: [] };
  }
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

    const counts = new Map<ComponentType, number>();
    for (const c of components) counts.set(c.type, (counts.get(c.type) ?? 0) + 1);
    const byType = [...counts.entries()]
      .map(([type, count]) => ({ type, label: typeLabels[type], count }))
      .sort((a, b) => b.count - a.count);

    return { configured: true, total: components.length, byType, components };
  } catch (e) {
    return { configured: true, total: 0, byType: [], components: [], error: (e as Error).message };
  }
}
