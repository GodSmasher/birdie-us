// Extracts the technical project data from a Reonic offer (for Netzanmeldung):
// system size, inverter, battery, address — and flags what's missing so the
// office can see whether the salesperson entered everything.

import { getDb, tenantId } from './db';
import { findInverter, findBattery, type InverterSpec, type BatterySpec } from './ecoflow-specs';

const INV = /wechselrichter|inverter|hybrid/i;
const BAT = /speicher|batterie|battery|\blfp\b|powerocean.*(batt|lfp)|akku/i;
const MOD = /(\d{3,4})\s*[Ww](?:p|att)?\b/;

export interface ProjectData {
  offerId: string;
  name: string;
  customerName: string;
  type?: string;
  phone?: string;              // Telefon des Kunden (aus Reonic-Kontakt)
  email?: string;              // E-Mail des Kunden (aus Reonic-Kontakt)
  address?: { line: string; zip?: string; city?: string };
  kwp: number;
  moduleCount: number;
  moduleType?: string;
  inverter?: string;
  inverterKw?: number;        // Wechselrichter-Nennleistung in kW (aus Inverter-String)
  inverterCount?: number;     // Anzahl Wechselrichter (default 1)
  battery?: string;
  batteryKwh?: number;
  batteryModuleCount?: number; // Anzahl Batterie-Module (z.B. 2× 5kWh = 10kWh)
  annualKwh?: number;
  inverterSpec?: InverterSpec;  // Datenblatt-Specs des Wechselrichters
  batterySpec?: BatterySpec;    // Datenblatt-Specs des Batteriemoduls
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
  for (const c of comps) {
    const nm = (c.name || '').trim();
    const qty = Number(c.quantity) || 1;
    const m = MOD.exec(nm);
    if (m && qty >= 4) {
      kwp += (parseInt(m[1], 10) * qty) / 1000;
      moduleCount += qty;
      if (!moduleType) moduleType = nm;
    } else if (BAT.test(nm)) {
      battery = battery ? battery : nm;
    } else if (INV.test(nm)) {
      inverter = inverter ? inverter : nm;
    }
  }
  kwp = Math.round(kwp * 100) / 100;
  const batMatch = battery ? /(\d+(?:[.,]\d+)?)\s*kwh/i.exec(battery) : null;
  const batteryKwh = batMatch ? Number(batMatch[1].replace(',', '.')) : undefined;

  // Wechselrichter-Nennleistung (kW) und Anzahl aus Inverter-String extrahieren
  let inverterKw: number | undefined;
  let inverterCount = 1;
  if (inverter) {
    const kwMatch = /(\d+(?:[.,]\d+)?)\s*k[Ww]/.exec(inverter);
    if (kwMatch) inverterKw = Number(kwMatch[1].replace(',', '.'));
    // Anzahl WR = Summe aller INV-Komponenten-Quantities (meist 1)
    inverterCount = comps
      .filter((c) => INV.test((c.name || '').trim()))
      .reduce((sum, c) => sum + (Number(c.quantity) || 1), 0) || 1;
  }

  // Address + name + phone + email from the linked contact
  let address: ProjectData['address'];
  let contactName = '';
  let phone: string | undefined;
  let email: string | undefined;
  const customerId = (o.customer as { id?: string })?.id;
  if (customerId) {
    const { data: cRow } = await db
      .from('entities').select('data').eq('tenant_id', tid).eq('kind', 'contact').eq('external_id', customerId).single();
    if (cRow) {
      const c = (cRow as { data: Record<string, unknown> }).data;
      const line = [c.street, c.number].filter(Boolean).join(' ').trim();
      address = { line, zip: c.postcode as string, city: c.city as string };
      contactName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
      phone = (c.phone || c.phoneNumber || c.mobile || c.telefon) as string | undefined;
      email = (c.email || c.emailAddress) as string | undefined;
    }
  }
  // Fallback: derive a clean name from the offer title ("Max Müller 2 - PV" → "Max Müller")
  const offerName = (o.name as string) || '';
  const customerName = contactName || offerName.split(' - ')[0].replace(/\s+\d+\s*$/, '').trim() || offerName;

  const demand = o.demand as { annualEnergyDemandWh?: number } | undefined;
  const annualKwh = demand?.annualEnergyDemandWh ? Math.round(demand.annualEnergyDemandWh / 1000) : undefined;

  const missing: string[] = [];
  if (!address?.zip || !address?.city) missing.push('Adresse / PLZ');
  if (kwp <= 0) missing.push('Anlagengröße (kWp)');
  if (!inverter) missing.push('Wechselrichter');
  if (moduleCount === 0) missing.push('Module');

  const batSpec = battery ? findBattery(battery) : undefined;
  // Batterie-Modulanzahl: Gesamt-kWh / Kapazität pro Modul (z.B. 10,24kWh / 5,12kWh = 2)
  const batteryModuleCount = batSpec && batteryKwh ? Math.round(batteryKwh / batSpec.capacityKwh) || 1 : undefined;

  return {
    offerId,
    name: (o.name as string) || offerId,
    customerName,
    phone,
    email,
    type: o.type as string,
    address,
    kwp,
    moduleCount,
    moduleType,
    inverter,
    inverterKw,
    inverterCount,
    battery,
    batteryKwh,
    batteryModuleCount,
    annualKwh,
    inverterSpec: inverter ? findInverter(inverter) : undefined,
    batterySpec: batSpec,
    missing,
    ready: missing.length === 0,
  };
}
