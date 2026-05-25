// Konfiguration aus der Umgebung. Portal-Logins kommen aus Env-Vars (pro
// Netzbetreiber), NIEMALS aus dem Code/Repo. Auf einem persistenten Host hinterlegt
// (Worker-Plattform Secrets), nicht auf Vercel.

import type { PortalCredentials } from './types.js';

export const config = {
  // Basis-URL der .birdie-App + Service-Token (analog SYNC_SECRET) für die
  // Bot↔App-Kommunikation. Der App-Endpoint muss dieses Bearer-Token akzeptieren.
  birdieApiUrl: process.env.BIRDIE_API_URL ?? '',
  birdieToken: process.env.BIRDIE_BOT_TOKEN ?? '',
  // Headless im Betrieb, sichtbar beim Entwickeln eines neuen Portal-Drivers.
  headless: process.env.NETZBOT_HEADLESS !== 'false',
  pollIntervalMs: Number(process.env.NETZBOT_POLL_MS ?? 60_000),
};

// Login pro Netzbetreiber: NETZBOT_CREDS_<SLUG>="user|pass|portalUrl".
// Beispiel: NETZBOT_CREDS_MITNETZ_STROM="volta|geheim|https://www.mitnetz-strom.de/…"
export function credentialsFor(netzbetreiber: string): PortalCredentials | null {
  const slug = netzbetreiber.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const raw = process.env[`NETZBOT_CREDS_${slug}`];
  if (!raw) return null;
  const [username, password, portalUrl] = raw.split('|');
  if (!username || !password || !portalUrl) return null;
  return { username, password, portalUrl };
}
