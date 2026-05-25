// Worker-Hauptschleife: holt Jobs aus .birdie, wählt den passenden Portal-Driver,
// füllt den Entwurf vor und meldet das Ergebnis zurück. Mit --once nur ein Durchlauf.
//
// Betrieb: persistenter Host (Railway/Fly/VPS), NICHT Vercel (Playwright braucht
// einen echten Browser + lange Laufzeit).

import { config, credentialsFor } from './config.js';
import { fetchJobs, reportDraft } from './birdie-client.js';
import { driverFor, supportedNetzbetreiber } from './drivers/index.js';

async function tick(): Promise<void> {
  const jobs = await fetchJobs();
  if (jobs.length === 0) {
    console.log('[netzbot] keine offenen Jobs');
    return;
  }
  for (const job of jobs) {
    const driver = driverFor(job.netzbetreiber);
    if (!driver) {
      console.log(`[netzbot] kein Driver für "${job.netzbetreiber}" (unterstützt: ${supportedNetzbetreiber().join(', ')})`);
      continue;
    }
    const creds = credentialsFor(job.netzbetreiber);
    if (!creds) {
      console.log(`[netzbot] kein Login für "${job.netzbetreiber}" hinterlegt`);
      continue;
    }
    console.log(`[netzbot] ${job.customer}: Entwurf bei ${job.netzbetreiber} …`);
    const result = await driver.fillDraft(job, creds);
    if (result.ok) {
      await reportDraft(job.offerId, result.draftRef);
      console.log(`[netzbot]   ✓ Entwurf gespeichert${result.screenshotPath ? ` (${result.screenshotPath})` : ''}`);
    } else {
      console.log(`[netzbot]   ✗ Fehler: ${result.error}`);
    }
  }
}

async function main(): Promise<void> {
  const once = process.argv.includes('--once');
  if (!config.birdieApiUrl) console.warn('[netzbot] BIRDIE_API_URL nicht gesetzt — Leerlauf');
  if (once) {
    await tick();
    return;
  }
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await tick().catch((e) => console.error('[netzbot] tick error', e));
    await new Promise((r) => setTimeout(r, config.pollIntervalMs));
  }
}

main();
