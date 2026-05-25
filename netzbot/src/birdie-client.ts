// Kommunikation mit der .birdie-App: holt die zu bearbeitenden Anmeldungen und
// meldet erzeugte Entwürfe zurück. Nutzt ein Bearer-Service-Token.
//
// INTEGRATIONS-VERTRAG (in der App noch umzusetzen):
//   GET  {api}/api/netzanmeldung/jobs        → Job[]  (freigegebene Daten, noch ohne Entwurf)
//   POST {api}/api/netzanmeldung  { offerId, recordDraft: 'e2', draftRef }
// Beide mit  Authorization: Bearer <BIRDIE_BOT_TOKEN>.

import { config } from './config.js';
import type { Job } from './types.js';

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${config.birdieToken}`, 'Content-Type': 'application/json' };
}

export async function fetchJobs(): Promise<Job[]> {
  if (!config.birdieApiUrl) return [];
  try {
    const res = await fetch(`${config.birdieApiUrl}/api/netzanmeldung/jobs`, { headers: authHeaders() });
    if (!res.ok) return [];
    return (await res.json()) as Job[];
  } catch {
    return [];
  }
}

export async function reportDraft(offerId: string, draftRef?: string): Promise<void> {
  if (!config.birdieApiUrl) return;
  try {
    await fetch(`${config.birdieApiUrl}/api/netzanmeldung`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ offerId, recordDraft: 'e2', draftRef }),
    });
  } catch {
    /* report later */
  }
}
