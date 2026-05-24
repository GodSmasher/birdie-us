// Demonstrates the polling layer: fan out many jobs against the real aWATTar API
// with a concurrency limit, one deliberately broken job to prove error isolation,
// retry/backoff, and time-series flattening.
//   npm run poll-demo

import { runBatch, summarize, type PollJob } from './scheduler.js';

function buildJobs(): PollJob[] {
  const jobs: PollJob[] = [];
  // Simulate many installations polling aWATTar (DE + AT mix).
  for (let i = 0; i < 20; i++) {
    jobs.push({
      id: `inst-${i}`,
      connectorId: 'awattar',
      installationId: `anlage-${i}`,
      tenantId: 'volta',
      config: { region: i % 2 === 0 ? 'de' : 'at' },
    });
  }
  // One job pointed at a connector that needs creds it doesn't have (graceful fail).
  jobs.push({ id: 'broken', connectorId: 'tibber', installationId: 'x', config: {} });
  return jobs;
}

async function main() {
  const jobs = buildJobs();
  console.log(`\n▸ Polling ${jobs.length} Jobs · Concurrency 6 · Retry an · Rate-Gate 200ms/Connector\n`);

  const t0 = Date.now();
  const results = await runBatch(jobs, {
    concurrency: 6,
    retry: { retries: 3, timeoutMs: 8000, onRetry: (i) => console.log(`  retry #${i.attempt} in ${Math.round(i.delayMs)}ms (${i.reason})`) },
    minIntervalMsPerConnector: 200,
    keepReadings: true,
  });
  const totalMs = Date.now() - t0;

  const sum = summarize(results, totalMs);
  console.log('Ergebnis:');
  console.log(`  Jobs:           ${sum.jobs}`);
  console.log(`  Erfolgreich:    ${sum.ok}`);
  console.log(`  Fehlgeschlagen: ${sum.failed}`);
  console.log(`  Readings total: ${sum.totalReadings}  ← speicherbare Time-Series-Zeilen`);
  console.log(`  Dauer:          ${sum.totalMs}ms (langsamster Job ${sum.maxMs}ms)`);

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.log('\n  Fehler (isoliert, Batch lief weiter):');
    for (const f of failed) console.log(`    • ${f.job.id} (${f.job.connectorId}): ${f.error}`);
  }

  const sample = results.find((r) => r.ok && r.readings?.length);
  if (sample?.readings) {
    console.log(`\n  Beispiel-Readings von ${sample.job.installationId} (erste 3 von ${sample.readingCount}):`);
    for (const r of sample.readings.slice(0, 3)) {
      console.log(`    ${r.ts}  ${r.metric}=${r.value}${r.unit}`);
    }
  }
}

main().catch((e) => {
  console.error('Fehler:', (e as Error).message);
  process.exit(1);
});
