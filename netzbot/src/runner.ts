// Worker-Hauptschleife: holt Jobs aus .birdie, wählt den passenden Portal-Driver,
// füllt den Entwurf vor und meldet das Ergebnis (Erfolg oder Fehler) zurück.
//
// Fehlerbehandlung:
//   - Fehler werden an birdie gemeldet → exponentielles Backoff (5min → 15min → 45min → …)
//   - birdie filtert Jobs im Backoff aus → Bot bekommt nur sofort-bereite Jobs
//   - Screenshots bei Fehlern dokumentieren den Portal-Zustand
//
// Betrieb: persistenter Host (Railway/Fly/VPS), NICHT Vercel.

import { config, credentialsFor } from './config.js';
import { fetchJobs, reportDraft, reportError } from './birdie-client.js';
import { driverFor, supportedNetzbetreiber } from './drivers/index.js';

/** Extract a meaningful step name from a Playwright error. */
function errorStep(err: unknown): string {
  const msg = String(err);
  // Try to extract the last screenshot label from the error context
  const snapMatch = msg.match(/artifacts\/\w+_(\d+_\w+)\.png/);
  if (snapMatch) return snapMatch[1];
  if (msg.includes('b2clogin') || msg.includes('login')) return 'login';
  if (msg.includes('MFA')) return 'mfa';
  if (msg.includes('Weiter')) return 'navigation_weiter';
  if (msg.includes('Timeout')) return 'timeout';
  if (msg.includes('net::ERR')) return 'network';
  return 'unknown';
}

/** Shorten error messages for clean logging (max 200 chars). */
function shortError(err: unknown): string {
  const full = String(err);
  // For Playwright TimeoutErrors, extract the useful part
  const timeoutMatch = full.match(/TimeoutError: (.+?)(?:\n|$)/);
  if (timeoutMatch) return timeoutMatch[1].slice(0, 200);
  return full.slice(0, 200);
}

async function tick(): Promise<void> {
  const jobs = await fetchJobs();
  if (jobs.length === 0) {
    console.log('[netzbot] keine offenen Jobs');
    return;
  }
  console.log(`[netzbot] ${jobs.length} Job(s) von birdie erhalten`);

  let ok = 0;
  let fail = 0;
  let skip = 0;

  for (const job of jobs) {
    const driver = driverFor(job.netzbetreiber);
    if (!driver) {
      console.log(`[netzbot] ⏭ kein Driver für "${job.netzbetreiber}" (unterstützt: ${supportedNetzbetreiber().join(', ')})`);
      skip++;
      continue;
    }
    const creds = job.credentials ?? credentialsFor(job.netzbetreiber);
    if (!creds) {
      console.log(`[netzbot] ⏭ kein Login für "${job.netzbetreiber}" — bitte in birdie unter Netzanmeldung → Portale hinterlegen`);
      skip++;
      continue;
    }

    console.log(`[netzbot] ▶ ${job.customer}: ${job.netzbetreiber} …`);
    const start = Date.now();

    try {
      const result = await driver.fillDraft(job, creds);
      const durationSec = ((Date.now() - start) / 1000).toFixed(1);

      if (result.ok) {
        await reportDraft(job.offerId, result.draftRef);
        console.log(`[netzbot]   ✓ Entwurf gespeichert (${durationSec}s)${result.screenshotPath ? ` → ${result.screenshotPath}` : ''}`);
        ok++;
      } else {
        const step = errorStep(result.error);
        const short = shortError(result.error);
        await reportError(job.offerId, { step, error: short, screenshot: result.screenshotPath });
        console.log(`[netzbot]   ✗ [${step}] ${short} (${durationSec}s)${result.screenshotPath ? ` → ${result.screenshotPath}` : ''}`);
        fail++;
      }
    } catch (err) {
      const durationSec = ((Date.now() - start) / 1000).toFixed(1);
      const step = errorStep(err);
      const short = shortError(err);
      await reportError(job.offerId, { step, error: short });
      console.log(`[netzbot]   ✗ [${step}] CRASH: ${short} (${durationSec}s)`);
      fail++;
    }
  }

  console.log(`[netzbot] Tick fertig: ${ok} ✓ ${fail} ✗ ${skip} ⏭`);
}

async function main(): Promise<void> {
  const once = process.argv.includes('--once');
  if (!config.birdieApiUrl) console.warn('[netzbot] BIRDIE_API_URL nicht gesetzt — Leerlauf');
  if (once) {
    await tick();
    return;
  }
  while (true) {
    await tick().catch((e) => console.error('[netzbot] tick error', e));
    await new Promise((r) => setTimeout(r, config.pollIntervalMs));
  }
}

main();
