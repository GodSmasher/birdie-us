import {
  type Connector,
  type ConnectorContext,
  type TariffData,
  type PricePoint,
  type TestResult,
  summarizePoints,
  nowPoint,
} from '../types.js';

// aWATTar publishes hourly EPEX spot prices. Fully public, no auth.
// DE: https://api.awattar.de/v1/marketdata · AT: https://api.awattar.at/v1/marketdata
// marketprice unit is EUR/MWh → ct/kWh = EUR/MWh / 10

interface AwattarRow {
  start_timestamp: number;
  end_timestamp: number;
  marketprice: number;
  unit: string;
}

function baseUrl(region: string): string {
  return region.toLowerCase() === 'at' ? 'https://api.awattar.at/v1/marketdata' : 'https://api.awattar.de/v1/marketdata';
}

export const awattar: Connector<TariffData> = {
  manifest: {
    id: 'awattar',
    name: 'aWATTar',
    vendor: 'aWATTar GmbH',
    category: 'tariff',
    regions: ['DE', 'AT'],
    authType: 'none',
    protocol: 'REST',
    capabilities: ['read'],
    config: [
      { key: 'region', label: 'Marktregion', required: false, default: 'de', help: 'de oder at' },
    ],
    docsUrl: 'https://www.awattar.de/services/api',
    status: 'stable',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    const region = ctx.config.region || 'de';
    const t0 = Date.now();
    try {
      const res = await ctx.fetch(baseUrl(region), { headers: { Accept: 'application/json' } });
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const json = (await res.json()) as { data?: AwattarRow[] };
      const n = json.data?.length ?? 0;
      return { ok: n > 0, message: `${n} Preisfenster geladen (${region.toUpperCase()})`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<TariffData> {
    const region = ctx.config.region || 'de';
    const res = await ctx.fetch(baseUrl(region), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`aWATTar HTTP ${res.status}`);
    const json = (await res.json()) as { data: AwattarRow[] };

    const points: PricePoint[] = json.data.map((r) => ({
      start: new Date(r.start_timestamp).toISOString(),
      end: new Date(r.end_timestamp).toISOString(),
      ctPerKwh: Math.round((r.marketprice / 10) * 100) / 100,
    }));

    return {
      provider: 'aWATTar',
      currency: 'EUR',
      now: nowPoint(points),
      points,
      ...summarizePoints(points),
    };
  },
};
