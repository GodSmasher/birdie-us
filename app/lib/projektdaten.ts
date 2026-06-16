// Extracts the technical project data from a Reonic offer (for Netzanmeldung):
// system size, inverter, battery, address — and flags what's missing so the
// office can see whether the salesperson entered everything.

import { getDb, tenantId } from './db';
import { findInverter, findBattery, type InverterSpec, type BatterySpec } from './ecoflow-specs';
import { loadEnrichment, type ExtractedFields } from './reonic-files';

const INV = /wechselrichter|inverter|hybrid/i;
const BAT = /speicher|batterie|battery|\blfp\b|powerocean.*(batt|lfp)|akku/i;
const MOD = /(\d{3,4})\s*[Ww](?:p|att)?\b/;

export interface ProjectData {
  offerId: string;
  name: string;
  customerName: string;
  type?: string;
  phone?: string;              // customer phone (from Reonic contact)
  email?: string;              // customer email (from Reonic contact)
  address?: { line: string; zip?: string; city?: string };
  kwp: number;
  moduleCount: number;
  moduleType?: string;
  inverter?: string;
  inverterKw?: number;        // inverter rated power in kW (from inverter string)
  inverterCount?: number;     // number of inverters (default 1)
  battery?: string;
  batteryKwh?: number;
  batteryModuleCount?: number; // number of battery modules (e.g. 2x 5kWh = 10kWh)
  annualKwh?: number;
  inverterSpec?: InverterSpec;  // datasheet specs of the inverter
  batterySpec?: BatterySpec;    // datasheet specs of the battery module
  missing: string[];
  ready: boolean;
}

interface Comp { name?: string; quantity?: string | number }

/** Resolve project data for many offers at once (best-effort, skips failures). */
export async function getProjectDataBatch(offerIds: string[]): Promise<ProjectData[]> {
  const results = await Promise.all(offerIds.map((id) => getProjectData(id).catch(() => null)));
  return results.filter((p): p is ProjectData => p !== null);
}

export async function getProjectData(offerId: string): Promise<ProjectData | null> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return null;

  const { data: offRow } = await db
    .from('entities').select('data').eq('tenant_id', tid).eq('kind', 'offer').eq('external_id', offerId).single();
  if (!offRow) return null;
  const o = (offRow as { data: Record<string, unknown> }).data;

  const opt = ((o.options as Record<string, unknown>[]) || [{}])[0] || {};
  const parse = (key: string): Comp[] => {
    const v = opt[key];
    try {
      const obj = typeof v === 'string' ? JSON.parse(v) : v;
      return (obj?.components as Comp[]) ?? [];
    } catch {
      return [];
    }
  };
  const comps = [...parse('solarPlanned'), ...parse('sesPlanned')];

  let kwp = 0;
  let moduleCount = 0;
  let moduleType: string | undefined;
  let inverter: string | undefined;
  let battery: string | undefined;
  let batteryModuleCount = 0;
  let totalBatteryKwh = 0;
  for (const c of comps) {
    const nm = (c.name || '').trim();
    const qty = Number(c.quantity) || 1;
    const m = MOD.exec(nm);
    if (m && qty >= 4) {
      kwp += (parseInt(m[1], 10) * qty) / 1000;
      moduleCount += qty;
      if (!moduleType) moduleType = nm;
    } else if (BAT.test(nm)) {
      if (!battery) battery = nm;
      batteryModuleCount += qty;
      // Extract kWh per module and multiply by quantity
      const kwhMatch = /(\d+(?:[.,]\d+)?)\s*kwh/i.exec(nm);
      if (kwhMatch) {
        totalBatteryKwh += Number(kwhMatch[1].replace(',', '.')) * qty;
      }
    } else if (INV.test(nm)) {
      inverter = inverter ? inverter : nm;
    }
  }
  kwp = Math.round(kwp * 100) / 100;
  const batteryKwh = totalBatteryKwh > 0 ? Math.round(totalBatteryKwh * 10) / 10 : undefined;

  // Extract inverter rated power (kW) and count from inverter string
  let inverterKw: number | undefined;
  let inverterCount = 1;
  if (inverter) {
    const kwMatch = /(\d+(?:[.,]\d+)?)\s*k[Ww]/.exec(inverter);
    if (kwMatch) inverterKw = Number(kwMatch[1].replace(',', '.'));
    // Inverter count = sum of all INV component quantities (usually 1)
    inverterCount = comps
      .filter((c) => INV.test((c.name || '').trim()))
      .reduce((sum, c) => sum + (Number(c.quantity) || 1), 0) || 1;
  }

  // Address + name + phone + email from the offer data (v3: inline customerContact + address)
  let address: ProjectData['address'];
  let contactName = '';
  let phone: string | undefined;
  let email: string | undefined;

  // v3: address is directly on the offer
  const offerAddr = o.address as { street?: string; houseNumber?: string; postcode?: string; city?: string } | undefined;
  if (offerAddr?.postcode && offerAddr?.city) {
    const line = [offerAddr.street, offerAddr.houseNumber].filter(Boolean).join(' ').trim();
    address = { line, zip: offerAddr.postcode, city: offerAddr.city };
  }

  // v3: customerContact is directly on the offer
  const cc = (o.customerContact ?? o.customer) as { id?: string; fullName?: string; firstName?: string; lastName?: string; primaryEmail?: string; phone?: string } | undefined;
  if (cc) {
    contactName = cc.fullName?.trim() || [cc.firstName, cc.lastName].filter(Boolean).join(' ').trim();
    email = cc.primaryEmail;
    phone = cc.phone;
  }

  // Fallback: try DB contact lookup (for v2 data)
  if (!contactName || !address) {
    const customerId = (o.customer as { id?: string })?.id ?? cc?.id;
    if (customerId) {
      const { data: cRow } = await db
        .from('entities').select('data').eq('tenant_id', tid).eq('kind', 'contact').eq('external_id', customerId).single();
      if (cRow) {
        const c = (cRow as { data: Record<string, unknown> }).data;
        if (!address) {
          const line = [c.street, c.number].filter(Boolean).join(' ').trim();
          if (c.postcode && c.city) address = { line, zip: c.postcode as string, city: c.city as string };
        }
        if (!contactName) contactName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
        if (!phone) phone = (c.phone || c.phoneNumber || c.mobile || c.telefon) as string | undefined;
        if (!email) email = (c.email || c.emailAddress) as string | undefined;
      }
    }
  }
  // Fallback: derive a clean name from the offer title ("John Smith 2 - PV" → "John Smith")
  const offerName = (o.name as string) || '';
  const customerName = contactName || offerName.split(' - ')[0].replace(/\s+\d+\s*$/, '').trim() || offerName;

  const demand = o.demand as { annualEnergyDemandWh?: number } | undefined;
  const annualKwh = demand?.annualEnergyDemandWh ? Math.round(demand.annualEnergyDemandWh / 1000) : undefined;

  const batSpec = battery ? findBattery(battery) : undefined;
  const finalBatteryModuleCount = batteryModuleCount > 0 ? batteryModuleCount : (batSpec && batteryKwh ? Math.round(batteryKwh / batSpec.capacityKwh) || 1 : undefined);

  // ── Enrichment from documents ──────────────────────────────────────────────
  // Documents (order confirmation, quote) take PRECEDENCE over Reonic components,
  // because the component list is often outdated (different inverter in quote vs installed).
  let enrichedKwp = kwp;
  let enrichedModuleCount = moduleCount;
  let enrichedModuleType = moduleType;
  let enrichedInverter = inverter;
  let enrichedInverterKw = inverterKw;
  let enrichedBatteryKwh = batteryKwh;
  let enrichedBattery = battery;
  let enrichedAddress = address;
  let enrichedCustomerName = customerName;
  try {
    let e = await loadEnrichment(offerId);

    // Auto-enrich: ALWAYS when no cache exists (not just when data is missing)
    if (!e) {
      try {
        const { enrichFromDocuments } = await import('./reonic-files');
        const result = await enrichFromDocuments(offerId);
        if (Object.keys(result.extracted).length > 0) {
          e = result.extracted;
        }
      } catch { /* auto-enrich is best-effort — don't block page load */ }
    }

    // Document data overrides Reonic components (document = source of truth)
    if (e) {
      if (e.kwp && typeof e.kwp === 'number') enrichedKwp = e.kwp;
      if (e.modulTyp) enrichedModuleType = String(e.modulTyp);
      if (e.modulAnzahl && typeof e.modulAnzahl === 'number') enrichedModuleCount = e.modulAnzahl;
      if (e.wechselrichterTyp) enrichedInverter = String(e.wechselrichterTyp);
      if (e.anschlussLeistungKw && typeof e.anschlussLeistungKw === 'number') enrichedInverterKw = e.anschlussLeistungKw;
      if (e.speicherKwh && typeof e.speicherKwh === 'number') {
        enrichedBatteryKwh = e.speicherKwh;
        enrichedBattery = e.speicherTyp ? String(e.speicherTyp) : `Speicher (${e.speicherKwh} kWh)`;
      }
      if (e.strasse && e.plz && e.ort) {
        enrichedAddress = { line: String(e.strasse), zip: String(e.plz), city: String(e.ort) };
      }
      if (e.kundenName) enrichedCustomerName = String(e.kundenName);
    }
  } catch { /* enrichment is best-effort */ }

  const missing: string[] = [];
  if (!enrichedAddress?.zip || !enrichedAddress?.city) missing.push('Address / ZIP');
  if (enrichedKwp <= 0) missing.push('System size (kWp)');
  if (!enrichedInverter) missing.push('Inverter');
  if (enrichedModuleCount === 0 && !enrichedModuleType) missing.push('Modules');

  return {
    offerId,
    name: (o.name as string) || offerId,
    customerName: enrichedCustomerName,
    phone,
    email,
    type: o.type as string,
    address: enrichedAddress,
    kwp: enrichedKwp,
    moduleCount: enrichedModuleCount,
    moduleType: enrichedModuleType,
    inverter: enrichedInverter,
    inverterKw: enrichedInverterKw,
    inverterCount,
    battery: enrichedBattery,
    batteryKwh: enrichedBatteryKwh,
    batteryModuleCount: finalBatteryModuleCount,
    annualKwh,
    inverterSpec: enrichedInverter ? findInverter(enrichedInverter) : undefined,
    batterySpec: batSpec,
    missing,
    ready: missing.length === 0,
  };
}
