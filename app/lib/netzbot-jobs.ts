// Baut die Arbeitsaufträge (Jobs) für den Portal-Bot: gewonnene Anmeldungen, die
// (1) datenvollständig sind, (2) noch keinen Entwurf haben (docStatus 'offen') und
// (3) einem erkannten Netzbetreiber zugeordnet sind. Die Felder werden aus den
// Projektdaten + Geschäftsregeln vorausgefüllt. Welche Netzbetreiber der Bot
// tatsächlich bedienen kann, entscheidet der Bot selbst (Driver-Registry) — die
// App liefert alle plausiblen Jobs und bleibt damit vom Bot entkoppelt.

import { getRegistrations, getPortalCredentials } from './netzanmeldung';
import { getProjectDataBatch } from './projektdaten';
import { netzbetreiberForPlz } from './netzbetreiber';
import { phasen, einspeiseart, speicherkopplung, hatNotstrom, inselbildend, schwarzstartfaehig, naSchutzIntegriert } from './geschaeftsregeln';

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
    inverterKw?: number;
    inverterCount?: number;
    battery?: string;
    batteryKwh?: number;
    phases?: 1 | 3;
    einspeiseart?: 'ueberschuss' | 'voll';
    speicherkopplung?: 'dc' | 'ac';
    naSchutz?: boolean;
    notstrom?: boolean;
    inselbildend?: boolean;
    schwarzstartfaehig?: boolean;
  };
}

export async function getBotJobs(): Promise<BotJob[]> {
  const regs = await getRegistrations();
  const now = new Date().toISOString();
  const candidates = regs.filter((r) =>
    (r.docStatus ?? 'offen') === 'offen' &&
    (!r.botSkipUntil || r.botSkipUntil <= now) // respect exponential backoff
  );
  if (candidates.length === 0) return [];

  const projects = await getProjectDataBatch(candidates.map((r) => r.offerId));
  const byId = new Map(projects.map((p) => [p.offerId, p]));

  const jobs: BotJob[] = [];
  for (const r of candidates) {
    const p = byId.get(r.offerId);
    if (!p || !p.ready) continue;
    // Exakter VNB aus DB (vnbdigital.de-Bot) > PLZ-Heuristik als Fallback
    const nbName = (r.netzbetreiber && r.netzbetreiber !== '—') ? r.netzbetreiber : netzbetreiberForPlz(p.address?.zip)?.name;
    if (!nbName) continue;
    jobs.push({
      offerId: r.offerId,
      customer: r.customer,
      netzbetreiber: nbName,
      fields: {
        name: p.customerName || r.customer,
        street: p.address?.line,
        zip: p.address?.zip,
        city: p.address?.city,
        kwp: p.kwp || undefined,
        moduleCount: p.moduleCount || undefined,
        moduleType: p.moduleType,
        inverter: p.inverter,
        inverterKw: p.inverterKw,
        inverterCount: p.inverterCount,
        battery: p.battery || undefined,
        batteryKwh: p.batteryKwh || undefined,
        phases: phasen(p),
        einspeiseart: einspeiseart(p),
        speicherkopplung: p.battery ? speicherkopplung(p) : undefined,
        naSchutz: naSchutzIntegriert(p),
        notstrom: hatNotstrom(p) || undefined,
        inselbildend: inselbildend(p) || undefined,
        schwarzstartfaehig: schwarzstartfaehig(p) || undefined,
      },
    });
  }
  return jobs;
}

/** Jobs inklusive Portal-Credentials — nur für die Bot-API (Bearer-geschützt). */
export interface BotJobWithCreds extends BotJob {
  credentials?: { username: string; password: string; portalUrl: string };
}

export async function getBotJobsWithCredentials(): Promise<BotJobWithCreds[]> {
  const [jobs, creds] = await Promise.all([getBotJobs(), getPortalCredentials()]);

  // Build a normalized lookup: "bayernwerk netz" → creds for "Bayernwerk Netz GmbH" etc.
  // This bridges mismatches between PLZ-lookup names and portal import names.
  const normalize = (s: string) => s.toLowerCase().replace(/\s*(gmbh|ag|netz|mbh|co\.?\s*kg)\s*/gi, '').trim();
  const normalizedCreds = new Map<string, { username: string; password: string; portalUrl: string }>();
  for (const [name, c] of creds) {
    normalizedCreds.set(normalize(name), c);
  }

  return jobs.map((job) => ({
    ...job,
    credentials: creds.get(job.netzbetreiber) ?? normalizedCreds.get(normalize(job.netzbetreiber)),
  }));
}
