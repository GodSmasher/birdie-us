// Resilient fetch wrapper — timeout, retry with exponential backoff + jitter,
// honors HTTP 429 / Retry-After. Injected as ctx.fetch so connectors stay simple.

export interface RetryPolicy {
  timeoutMs?: number;
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (info: { attempt: number; delayMs: number; reason: string }) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function backoff(attempt: number, base: number, max: number): number {
  const exp = base * 2 ** attempt;
  const jitter = Math.random() * base;
  return Math.min(max, exp + jitter);
}

export function createResilientFetch(policy: RetryPolicy = {}): typeof fetch {
  const { timeoutMs = 10000, retries = 3, baseDelayMs = 500, maxDelayMs = 8000, onRetry } = policy;

  const resilient = async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> => {
    let attempt = 0;
    let lastErr: unknown;

    while (attempt <= retries) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const res = await globalThis.fetch(input, { ...init, signal: ctrl.signal });
        clearTimeout(timer);

        // Retry on rate-limit / transient server errors
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          const retryAfter = Number(res.headers.get('retry-after'));
          const delay = retryAfter > 0 ? retryAfter * 1000 : backoff(attempt, baseDelayMs, maxDelayMs);
          onRetry?.({ attempt: attempt + 1, delayMs: delay, reason: `HTTP ${res.status}` });
          await sleep(delay);
          attempt++;
          continue;
        }
        return res;
      } catch (e) {
        clearTimeout(timer);
        lastErr = e;
        const reason = (e as Error).name === 'AbortError' ? `timeout ${timeoutMs}ms` : (e as Error).message;
        if (attempt >= retries) break;
        const delay = backoff(attempt, baseDelayMs, maxDelayMs);
        onRetry?.({ attempt: attempt + 1, delayMs: delay, reason });
        await sleep(delay);
        attempt++;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error('fetch failed');
  };

  return resilient as typeof fetch;
}

// Per-key minimum-interval gate to respect API rate limits when polling many jobs.
export class RateGate {
  private last = new Map<string, number>();
  constructor(private minIntervalMs: number) {}

  async wait(key: string): Promise<void> {
    const now = Date.now();
    const prev = this.last.get(key) ?? 0;
    const waitMs = Math.max(0, prev + this.minIntervalMs - now);
    if (waitMs > 0) await sleep(waitMs);
    this.last.set(key, Date.now());
  }
}
