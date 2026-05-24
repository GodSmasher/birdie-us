// DATANORM ⇄ Reonic bridge.
// DATANORM is the article/price exchange standard used by the electrical/building
// wholesale (Krannich, BayWa r.e., Memodo …). Reonic has no native DATANORM
// endpoint — .birdie parses DATANORM into Reonic `components` and exports back.
//
// This implements the common DATANORM 4.0 article record (Satzart "A"). DATANORM
// has version + per-supplier quirks; validate field order against each wholesaler.
// Record layout used here (semicolon-delimited):
//   A;KZ;Artikelnummer;Textkennzeichen;Kurztext1;Kurztext2;Preiskennzeichen;
//     Preiseinheit;Mengeneinheit;Preis(cents);Rabattgruppe;Warengruppe;...
//
// Reonic componentType values (from the live OpenAPI spec):
//   module, inverter, microinverter, optimizer, virtualBattery, batteryStorage,
//   wallbox, heatPump, airHeatPump, hotWaterHeatPump, heatingStorage,
//   hotWaterStorage, heatingRod, radiator, indoorUnitAirHeatPump, accessory*,
//   other, moduleFrameConstruction, serviceFee, installationFee

export type DatanormAction = 'new' | 'update' | 'delete' | 'unknown';

export interface DatanormArticle {
  action: DatanormAction;
  articleNumber: string;
  name: string;
  description?: string;
  priceEur: number;
  priceMarker: string; // Preiskennzeichen: 1=Listenpreis, 2=Nettopreis ...
  priceUnit: number; // Preiseinheit: price applies per N units
  unit: string; // Mengeneinheit
  discountGroup?: string;
}

export interface ReonicComponentPayload {
  componentType: string;
  name: string;
  description?: string;
  articleNumber?: string;
  gtin?: string;
  salesPrice?: number;
  purchasePrice?: number;
  vatRate?: number;
  quantityUnit?: string;
  brand?: string;
}

const ACTION_MAP: Record<string, DatanormAction> = {
  N: 'new',
  A: 'update',
  L: 'delete',
  V: 'update',
};

const UNIT_MAP: Record<string, string> = {
  '1': 'Stck',
  Stk: 'Stck',
  Stck: 'Stck',
  m: 'm',
  qm: 'm²',
  kg: 'kg',
};

/** Parse DATANORM text into article records (Satzart "A"). Tolerant of blank/other records. */
export function parseDatanorm(text: string): DatanormArticle[] {
  const out: DatanormArticle[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !line.startsWith('A;')) continue;
    const f = line.split(';');
    // f[0]='A'
    const action = ACTION_MAP[(f[1] || '').toUpperCase()] ?? 'unknown';
    const articleNumber = (f[2] || '').trim();
    const kurz1 = (f[4] || '').trim();
    const kurz2 = (f[5] || '').trim();
    const priceMarker = (f[6] || '').trim();
    const priceUnit = Number(f[7] || '1') || 1;
    const unitRaw = (f[8] || '').trim();
    const priceCents = Number(f[9] || '0') || 0;
    const discountGroup = (f[10] || '').trim() || undefined;

    if (!articleNumber) continue;
    out.push({
      action,
      articleNumber,
      name: kurz1 || articleNumber,
      description: kurz2 || undefined,
      priceEur: Math.round((priceCents / 100 / priceUnit) * 100) / 100,
      priceMarker,
      priceUnit,
      unit: UNIT_MAP[unitRaw] ?? unitRaw ?? 'Stck',
      discountGroup,
    });
  }
  return out;
}

/** Map a DATANORM article to a Reonic component create payload. */
export function articleToComponent(
  a: DatanormArticle,
  opts: { componentType?: string; brand?: string; vatRate?: number; priceAs?: 'sales' | 'purchase' } = {},
): ReonicComponentPayload {
  // Preiskennzeichen 2 = Nettopreis (Einkauf) → purchasePrice, sonst Listen-/Verkaufspreis.
  const priceAs = opts.priceAs ?? (a.priceMarker === '2' ? 'purchase' : 'sales');
  const payload: ReonicComponentPayload = {
    componentType: opts.componentType ?? 'other',
    name: a.name,
    description: a.description,
    articleNumber: a.articleNumber,
    quantityUnit: a.unit,
    vatRate: opts.vatRate ?? 0.19,
    brand: opts.brand,
  };
  if (priceAs === 'purchase') payload.purchasePrice = a.priceEur;
  else payload.salesPrice = a.priceEur;
  return payload;
}

export function articlesToComponents(
  articles: DatanormArticle[],
  opts: Parameters<typeof articleToComponent>[1] = {},
): ReonicComponentPayload[] {
  return articles.filter((a) => a.action !== 'delete').map((a) => articleToComponent(a, opts));
}

/** Export Reonic components back into a DATANORM 4.0 article file. */
export function componentsToDatanorm(components: ReonicComponentPayload[], action: 'N' | 'A' = 'N'): string {
  const head = `V;${formatDate(new Date())};.birdie Export;EUR;4;`;
  const lines = components.map((c) => {
    const price = c.salesPrice ?? c.purchasePrice ?? 0;
    const marker = c.purchasePrice != null && c.salesPrice == null ? '2' : '1';
    const cents = Math.round(price * 100);
    const k1 = (c.name || '').slice(0, 40);
    const k2 = (c.description || '').slice(0, 40);
    return `A;${action};${c.articleNumber ?? ''};00;${k1};${k2};${marker};1;${c.quantityUnit ?? 'Stck'};${cents};;;`;
  });
  return [head, ...lines].join('\r\n') + '\r\n';
}

function formatDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}
