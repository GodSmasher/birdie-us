// Wärmepumpe-Erkennung: Prüft ob ein Projekt eine Wärmepumpe enthält und ob
// ein Gaszähler abgemeldet werden muss. Bei Gas-Heizung → Mails an Kunden
// (Gaszähler abmelden) und Bezirksschornsteinfeger (Stilllegung melden).

import { getDb, tenantId } from './db';

export type HeatingFuel = 'gas' | 'oil' | 'unknown';

export interface WaermepumpeInfo {
  hasWaermepumpe: boolean;
  heatingFuel: HeatingFuel;
  needsGasAbmeldung: boolean;     // true wenn Gas → Kunde muss Gaszähler abmelden
  needsSchornsteinfeger: boolean;  // true wenn Gas → Bezirksschornsteinfeger informieren
  waermepumpeType?: string;        // z.B. "Luft-Wasser-Wärmepumpe"
}

const WP_PATTERN = /w[äa]rmepumpe|heat\s*pump|wp\b/i;
const GAS_PATTERN = /\bgas\b|erdgas|gasheizung|gasz[äa]hler/i;
const OIL_PATTERN = /[öo]l\b|[öo]lheizung|heiz[öo]l/i;

/** Batch: returns Set of offerIds that contain a Wärmepumpe (lightweight check). */
export async function getWpOfferIds(): Promise<Set<string>> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return new Set();
  const out = new Set<string>();
  const pageSize = 1000;
  for (let from = 0; from < 20000; from += pageSize) {
    const { data, error } = await db
      .from('entities').select('external_id, data')
      .eq('tenant_id', tid).eq('kind', 'offer')
      .range(from, from + pageSize - 1);
    if (error || !data || data.length === 0) break;
    for (const row of data) {
      const o = (row as { external_id: string; data: Record<string, unknown> }).data;
      const eid = (row as { external_id: string }).external_id;
      const t = ((o.type as string) || '').toLowerCase();
      const n = ((o.name as string) || '').toLowerCase();
      if (WP_PATTERN.test(t) || WP_PATTERN.test(n) || t.includes('wp')) out.add(eid);
    }
    if (data.length < pageSize) break;
  }
  return out;
}

/** Erkennt Wärmepumpe + Heizungstyp (Gas/Öl) aus einem Reonic-Angebot. */
export async function getWaermepumpeInfo(offerId: string): Promise<WaermepumpeInfo | null> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return null;

  const { data: offRow } = await db
    .from('entities').select('data').eq('tenant_id', tid).eq('kind', 'offer').eq('external_id', offerId).single();
  if (!offRow) return null;
  const o = (offRow as { data: Record<string, unknown> }).data;

  // 1) Typ-Feld prüfen (z.B. "PV + Wärmepumpe")
  const offerType = ((o.type as string) || '').toLowerCase();
  const offerName = ((o.name as string) || '').toLowerCase();

  // 2) Optionen durchsuchen — alle Schlüssel und Komponenten
  const opts = ((o.options as Record<string, unknown>[]) || [{}])[0] || {};
  const allTexts: string[] = [offerType, offerName];

  // Alle Optionen-Keys und deren Komponenten sammeln
  for (const [key, val] of Object.entries(opts)) {
    allTexts.push(key.toLowerCase());
    try {
      const obj = typeof val === 'string' ? JSON.parse(val) : val;
      const comps = (obj?.components as Array<{ name?: string }>) ?? [];
      for (const c of comps) {
        if (c.name) allTexts.push(c.name.toLowerCase());
      }
    } catch { /* skip */ }
  }

  // 3) Demand-Objekt prüfen (enthält evtl. Heizungsdaten)
  const demand = o.demand as Record<string, unknown> | undefined;
  if (demand) {
    for (const [key, val] of Object.entries(demand)) {
      allTexts.push(key.toLowerCase());
      if (typeof val === 'string') allTexts.push(val.toLowerCase());
    }
  }

  const combined = allTexts.join(' ');
  const hasWaermepumpe = WP_PATTERN.test(combined) || offerType.includes('wp');
  const heatingFuel: HeatingFuel = GAS_PATTERN.test(combined) ? 'gas'
    : OIL_PATTERN.test(combined) ? 'oil'
    : 'unknown';

  // Wärmepumpen-Typ extrahieren (z.B. "Luft-Wasser-Wärmepumpe 12kW")
  let waermepumpeType: string | undefined;
  for (const t of allTexts) {
    if (WP_PATTERN.test(t) && t.length > 5) {
      waermepumpeType = t;
      break;
    }
  }

  return {
    hasWaermepumpe,
    heatingFuel,
    needsGasAbmeldung: hasWaermepumpe && heatingFuel === 'gas',
    needsSchornsteinfeger: hasWaermepumpe && heatingFuel === 'gas',
    waermepumpeType,
  };
}

// ── Mail-Templates ───────────────────────────────────────────────────────────

interface MailContext {
  customerName: string;
  address: string;
  city?: string;
}

/** Mail-Text an den Kunden: Gaszähler abmelden. */
export function mailGasAbmeldungKunde(ctx: MailContext): { subject: string; body: string } {
  return {
    subject: 'Gaszähler-Abmeldung erforderlich – Ihre Wärmepumpe',
    body: `Sehr geehrte/r ${ctx.customerName},

im Zuge der Installation Ihrer neuen Wärmepumpe möchten wir Sie darauf hinweisen, dass Ihr bisheriger Gaszähler abgemeldet werden muss.

Bitte setzen Sie sich mit Ihrem Gasversorger in Verbindung und veranlassen Sie die Abmeldung bzw. Stilllegung des Gaszählers an folgender Adresse:

${ctx.address}${ctx.city ? ', ' + ctx.city : ''}

Falls Sie Fragen haben oder Unterstützung benötigen, melden Sie sich gerne bei uns.

Mit freundlichen Grüßen
Volta Energietechnik GmbH`,
  };
}

/** Mail-Text an den Bezirksschornsteinfeger: Stilllegung der Gasheizung melden. */
export function mailSchornsteinfeger(ctx: MailContext & { schornsteinfegerName?: string }): { subject: string; body: string } {
  const anrede = ctx.schornsteinfegerName
    ? `Sehr geehrte/r ${ctx.schornsteinfegerName}`
    : 'Sehr geehrte Damen und Herren';

  return {
    subject: `Stilllegung Gasheizung – ${ctx.customerName}, ${ctx.address}`,
    body: `${anrede},

hiermit möchten wir Ihnen mitteilen, dass bei folgendem Objekt die bestehende Gasheizung im Zuge einer Wärmepumpen-Installation stillgelegt wird:

Anlagenbetreiber: ${ctx.customerName}
Adresse: ${ctx.address}${ctx.city ? ', ' + ctx.city : ''}

Wir bitten um Kenntnisnahme und ggf. Terminierung einer Abnahme.

Mit freundlichen Grüßen
Volta Energietechnik GmbH`,
  };
}
