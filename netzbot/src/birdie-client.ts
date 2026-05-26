// Kommunikation mit der .birdie-App: holt die zu bearbeitenden Anmeldungen und
// meldet erzeugte Entwürfe / Fehler zurück. Nutzt ein Bearer-Service-Token.
//
// INTEGRATIONS-VERTRAG (in der App umgesetzt: app/api/netzanmeldung/bot):
//   GET  {api}/api/netzanmeldung/bot   → Job[]  (datenvollständig, noch ohne Entwurf)
//   POST {api}/api/netzanmeldung/bot   { offerId, recordDraft, draftRef }  → Entwurf
//   POST {api}/api/netzanmeldung/bot   { offerId, error: {step,error} }   → Fehler
// Beide mit  Authorization: Bearer <BIRDIE_BOT_TOKEN>.

import { config } from './config.js';
import type { Job, PortalCredentials } from './types.js';

const ENDPOINT = '/api/netzanmeldung/bot';

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${config.birdieToken}`, 'Content-Type': 'application/json' };
}

export interface JobWithCreds extends Job {
  credentials?: { username: string; password: string; portalUrl: string };
}

export async function fetchJobs(): Promise<JobWithCreds[]> {
  if (!config.birdieApiUrl) return [];
  try {
    const res = await fetch(`${config.birdieApiUrl}${ENDPOINT}`, { headers: authHeaders() });
    if (!res.ok) return [];
    return (await res.json()) as JobWithCreds[];
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
  } catch { /* retry next tick */ }
}

export async function reportError(
  offerId: string,
  err: { step: string; error: string; screenshot?: string },
): Promise<void> {
  if (!config.birdieApiUrl) return;
  try {
    await fetch(`${config.birdieApiUrl}${ENDPOINT}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ offerId, error: err }),
    });
  } catch { /* retry next tick */ }
}
