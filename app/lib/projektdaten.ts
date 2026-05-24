// Extracts the technical project data from a Reonic offer (for Netzanmeldung):
// system size, inverter, battery, address — and flags what's missing so the
// office can see whether the salesperson entered everything.

import { getDb, tenantId } from './db';

const INV = /wechselrichter|inverter|hybrid/i;
const BAT = /speicher|batterie|battery|\blfp\b|powerocean.*(batt|lfp)|akku/i;
const MOD = /(\d{3,4})\s*[Ww](?:p|att)?\b/;

export interface ProjectData {
  offerId: string;
  name: string;
  type?: string;
  address?: { line: string; zip?: string; city?: string };
  kwp: number;
  moduleCount: number;
  moduleType?: string;
  inverter?: string;
  battery?: string;
  annualKwh?: number;
  missing: string[];
  ready: boolean;
}

interface Comp { name?: string; quantity?: string | number }

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

  // Address from the linked contact
  let address: ProjectData['address'];
  const customerId = (o.customer as { id?: string })?.id;
  if (customerId) {
    const { data: cRow } = await db
      .from('entities').select('data').eq('tenant_id', tid).eq('kind', 'contact').eq('external_id', customerId).single();
    if (cRow) {
      const c = (cRow as { data: Record<string, unknown> }).data;
      const line = [c.street, c.number].filter(Boolean).join(' ').trim();
      address = { line, zip: c.postcode as string, city: c.city as string };
    }
  }

  const demand = o.demand as { annualEnergyDemandWh?: number } | undefined;
  const annualKwh = demand?.annualEnergyDemandWh ? Math.round(demand.annualEnergyDemandWh / 1000) : undefined;

  const missing: string[] = [];
  if (!address?.zip || !address?.city) missing.push('Adresse / PLZ');
  if (kwp <= 0) missing.push('Anlagengröße (kWp)');
  if (!inverter) missing.push('Wechselrichter');
  if (moduleCount === 0) missing.push('Module');

  return {
    offerId,
    name: (o.name as string) || offerId,
    type: o.type as string,
    address,
    kwp,
    moduleCount,
    moduleType,
    inverter,
    battery,
    annualKwh,
    missing,
    ready: missing.length === 0,
  };
}
