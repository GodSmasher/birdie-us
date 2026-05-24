import {
  type Connector,
  type ConnectorContext,
  type ForecastData,
  type ForecastPoint,
  type TestResult,
  requireConfig,
} from '../types.js';

// Solcast rooftop PV forecast. Auth: API key (Bearer).
// Key + resource id: https://toolkit.solcast.com.au/

interface SolcastForecast { pv_estimate: number; period_end: string; period: string }

function url(resourceId: string): string {
  return `https://api.solcast.com.au/rooftop_sites/${encodeURIComponent(resourceId)}/forecasts?format=json`;
}

export const solcast: Connector<ForecastData> = {
  manifest: {
    id: 'solcast',
    name: 'Solcast',
    vendor: 'Solcast',
    category: 'weather',
    regions: ['DE', 'AT', 'CH'],
    authType: 'apikey',
    protocol: 'REST',
    capabilities: ['read'],
    config: [
      { key: 'apiKey', label: 'API Key', required: true, secret: true, help: 'toolkit.solcast.com.au' },
      { key: 'resourceId', label: 'Rooftop Site ID', required: true, help: 'pro PV-Anlage' },
    ],
    docsUrl: 'https://docs.solcast.com.au/',
    status: 'stable',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['apiKey', 'resourceId']);
    const t0 = Date.now();
    try {
      const res = await ctx.fetch(url(ctx.config.resourceId), {
        headers: { Authorization: `Bearer ${ctx.config.apiKey}`, Accept: 'application/json' },
      });
      if (res.status === 401 || res.status === 403) return { ok: false, message: `Auth fehlgeschlagen (${res.status})` };
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const json = (await res.json()) as { forecasts?: SolcastForecast[] };
      const n = json.forecasts?.length ?? 0;
      return { ok: n > 0, message: `${n} Prognose-Punkte`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<ForecastData> {
    requireConfig(ctx, ['apiKey', 'resourceId']);
    const res = await ctx.fetch(url(ctx.config.resourceId), {
      headers: { Authorization: `Bearer ${ctx.config.apiKey}`, Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Solcast HTTP ${res.status}`);
    const json = (await res.json()) as { forecasts: SolcastForecast[] };

    const points: ForecastPoint[] = json.forecasts.map((f) => ({
      ts: new Date(f.period_end).toISOString(),
      estimateKw: f.pv_estimate,
    }));

    // Sum kWh for today (each period typically 30 min → kWh = kW * 0.5)
    const today = new Date().toISOString().slice(0, 10);
    const totalKwhToday =
      Math.round(
        points
          .filter((p) => p.ts.slice(0, 10) === today)
          .reduce((sum, p) => sum + (p.estimateKw ?? 0) * 0.5, 0) * 10,
      ) / 10;

    return { source: 'Solcast', site: ctx.config.resourceId, totalKwhToday, points };
  },
};
