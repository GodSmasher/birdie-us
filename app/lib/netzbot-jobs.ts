// Baut die Arbeitsaufträge (Jobs) für den Portal-Bot: gewonnene Anmeldungen, die
// (1) datenvollständig sind, (2) noch keinen Entwurf haben (docStatus 'offen') und
// (3) einem erkannten Netzbetreiber zugeordnet sind. Die Felder werden aus den
// Projektdaten + Geschäftsregeln vorausgefüllt. Welche Netzbetreiber der Bot
// tatsächlich bedienen kann, entscheidet der Bot selbst (Driver-Registry) — die
// App liefert alle plausiblen Jobs und bleibt damit vom Bot entkoppelt.

import { getRegistrations } from './netzanmeldung';
import { getProjectDataBatch } from './projektdaten';
import { netzbetreiberForPlz } from './netzbetreiber';
import { phasen, einspeiseart } from './geschaeftsregeln';

export interface BotJob {
  offerId: string;
  customer: string;
  netzbetreiber: string;
  fields: {
    name: string;
    street?: string;
    zip?: string;
    city?: string;
    kwp?: number;
    moduleCount?: number;
    moduleType?: string;
    inverter?: string;
    phases?: 1 | 3;
    einspeiseart?: 'ueberschuss' | 'voll';
  };
}

export async function getBotJobs(): Promise<BotJob[]> {
  const regs = await getRegistrations();
  const candidates = regs.filter((r) => (r.docStatus ?? 'offen') === 'offen');
  if (candidates.length === 0) return [];

  const projects = await getProjectDataBatch(candidates.map((r) => r.offerId));
  const byId = new Map(projects.map((p) => [p.offerId, p]));

  const jobs: BotJob[] = [];
  for (const r of candidates) {
    const p = byId.get(r.offerId);
    if (!p || !p.ready) continue;
    const nb = netzbetreiberForPlz(p.address?.zip);
    if (!nb) continue;
    jobs.push({
      offerId: r.offerId,
      customer: r.customer,
      netzbetreiber: nb.name,
      fields: {
        name: p.customerName || r.customer,
        street: p.address?.line,
        zip: p.address?.zip,
        city: p.address?.city,
        kwp: p.kwp || undefined,
        moduleCount: p.moduleCount || undefined,
        moduleType: p.moduleType,
        inverter: p.inverter,
        phases: phasen(p),
        einspeiseart: einspeiseart(p),
      },
    });
  }
  return jobs;
}
