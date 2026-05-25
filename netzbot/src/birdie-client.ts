// Kommunikation mit der .birdie-App: holt die zu bearbeitenden Anmeldungen und
// meldet erzeugte Entwürfe zurück. Nutzt ein Bearer-Service-Token.
//
// INTEGRATIONS-VERTRAG (in der App umgesetzt: app/api/netzanmeldung/bot):
//   GET  {api}/api/netzanmeldung/bot   → Job[]  (datenvollständig, noch ohne Entwurf)
//   POST {api}/api/netzanmeldung/bot   { offerId, recordDraft: 'e2', draftRef }
// Beide mit  Authorization: Bearer <BIRDIE_BOT_TOKEN>.

import { config } from './config.js';
import type { Job } from './types.js';

const ENDPOINT = '/api/netzanmeldung/bot';

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${config.birdieToken}`, 'Content-Type': 'application/json' };
}

export async function fetchJobs(): Promise<Job[]> {
  if (!config.birdieApiUrl) return [];
  try {
    const res = await fetch(`${config.birdieApiUrl}${ENDPOINT}`, { headers: authHeaders() });
    if (!res.ok) return [];
    return (await res.json()) as Job[];
  } catch {
    return [];
  }
}

export async function reportDraft(offerId: string, draftRef?: string): Promise<void> {
  if (!config.birdieApiUrl) return;
  try {
    await fetch(`${config.birdieApiUrl}${ENDPOINT}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ offerId, recordDraft: 'e2', draftRef }),
    });
  } catch {
    /* report later */
  }
}
