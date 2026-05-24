// Polling orchestration — runs many connector pulls with a concurrency limit,
// per-job error isolation, rate-limiting, and resilient fetch. Built to fan out
// over many installations without overwhelming APIs or failing the whole batch.

import { getConnector } from './registry.js';
import { createResilientFetch, RateGate, type RetryPolicy } from './http.js';
import { toReadings, type Reading } from './timeseries.js';
import type { ConnectorContext } from './types.js';

export interface PollJob {
  id: string;
  connectorId: string;
  config: Record<string, string>;
  installationId?: string;
  tenantId?: string;
}

export interface PollResult {
  job: PollJob;
  ok: boolean;
  durationMs: number;
  readingCount: number;
  readings?: Reading[];
  error?: string;
}

export interface RunOptions {
  concurrency?: number;
  retry?: RetryPolicy;
  /** Min ms between calls to the same connector (rate-limit guard). */
  minIntervalMsPerConnector?: number;
  keepReadings?: boolean;
}

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function runBatch(jobs: PollJob[], opts: RunOptions = {}): Promise<PollResult[]> {
  const { concurrency = 8, retry, minIntervalMsPerConnector = 0, keepReadings = false } = opts;
  const fetchImpl = createResilientFetch(retry);
  const gate = minIntervalMsPerConnector > 0 ? new RateGate(minIntervalMsPerConnector) : null;

  return mapPool(jobs, concurrency, async (job): Promise<PollResult> => {
    const t0 = Date.now();
    try {
      const connector = getConnector(job.connectorId);
      if (!connector) throw new Error(`Unbekannter Connector: ${job.connectorId}`);
      if (gate) await gate.wait(job.connectorId);

      const ctx: ConnectorContext = { config: job.config, fetch: fetchImpl };
      const data = await connector.pull(ctx);
      const readings = toReadings(data, {
        connectorId: job.connectorId,
        installationId: job.installationId,
        tenantId: job.tenantId,
      });

      return {
        job,
        ok: true,
        durationMs: Date.now() - t0,
        readingCount: readings.length,
        ...(keepReadings ? { readings } : {}),
      };
    } catch (e) {
      return { job, ok: false, durationMs: Date.now() - t0, readingCount: 0, error: (e as Error).message };
    }
  });
}

export interface BatchSummary {
  jobs: number;
  ok: number;
  failed: number;
  totalReadings: number;
  totalMs: number;
  maxMs: number;
}

export function summarize(results: PollResult[], totalMs: number): BatchSummary {
  return {
    jobs: results.length,
    ok: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    totalReadings: results.reduce((n, r) => n + r.readingCount, 0),
    totalMs,
    maxMs: results.reduce((m, r) => Math.max(m, r.durationMs), 0),
  };
}
