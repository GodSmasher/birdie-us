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
