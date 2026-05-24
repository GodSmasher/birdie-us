import {
  type Connector,
  type ConnectorContext,
  type TariffData,
  type PricePoint,
  type TestResult,
  requireConfig,
  summarizePoints,
  nowPoint,
} from '../types.js';

// Tibber GraphQL API. Auth: personal access token (Bearer).
// Token: https://developer.tibber.com/settings/access-token

const ENDPOINT = 'https://api.tibber.com/v1-beta/gql';

const PRICE_QUERY = `{
  viewer {
    homes {
      currentSubscription {
        priceInfo {
          current { total startsAt }
          today { total startsAt }
          tomorrow { total startsAt }
        }
      }
    }
  }
}`;

interface TibberPrice { total: number; startsAt: string }

async function gql<T>(ctx: ConnectorContext, query: string): Promise<T> {
  const res = await ctx.fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ctx.config.token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (res.status === 401) throw new Error('Tibber: Token ungültig (401)');
  if (!res.ok) throw new Error(`Tibber HTTP ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error('Tibber: ' + json.errors.map((e) => e.message).join('; '));
  if (!json.data) throw new Error('Tibber: leere Antwort');
  return json.data;
}

type PriceResponse = {
  viewer: { homes: { currentSubscription: { priceInfo: { current: TibberPrice; today: TibberPrice[]; tomorrow: TibberPrice[] } } | null }[] };
};

function toPoint(p: TibberPrice, hours = 1): PricePoint {
  const start = new Date(p.startsAt);
  const end = new Date(start.getTime() + hours * 3600_000);
  return { start: start.toISOString(), end: end.toISOString(), ctPerKwh: Math.round(p.total * 100 * 100) / 100 };
}

export const tibber: Connector<TariffData> = {
  manifest: {
    id: 'tibber',
    name: 'Tibber',
    vendor: 'Tibber',
    category: 'tariff',
    regions: ['DE'],
    authType: 'token',
    protocol: 'GraphQL',
    capabilities: ['read', 'realtime'],
    config: [
      { key: 'token', label: 'Access Token', required: true, secret: true, help: 'developer.tibber.com → Access Token' },
    ],
    docsUrl: 'https://developer.tibber.com/docs/overview',
    status: 'stable',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['token']);
    const t0 = Date.now();
    try {
      const data = await gql<PriceResponse>(ctx, PRICE_QUERY);
      const homes = data.viewer.homes.length;
      return { ok: homes > 0, message: `${homes} Tibber-Home(s) erreichbar`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<TariffData> {
    requireConfig(ctx, ['token']);
    const data = await gql<PriceResponse>(ctx, PRICE_QUERY);
    const sub = data.viewer.homes[0]?.currentSubscription;
    if (!sub) throw new Error('Tibber: kein aktives Abo für dieses Home');
    const info = sub.priceInfo;
    const points: PricePoint[] = [...info.today, ...info.tomorrow].map((p) => toPoint(p));
    return {
      provider: 'Tibber',
      currency: 'EUR',
      now: info.current ? toPoint(info.current) : nowPoint(points),
      points,
      ...summarizePoints(points),
    };
  },
};
