import {
  type Connector,
  type ConnectorContext,
  type ForecastData,
  type ForecastPoint,
  type TestResult,
  requireConfig,
} from '../types.js';

// OpenWeatherMap 5-day / 3-hour forecast. Auth: API key (query param).
// Key: https://home.openweathermap.org/api_keys

interface OwmEntry {
  dt: number;
  main: { temp: number };
  clouds: { all: number };
}

function url(ctx: ConnectorContext): string {
  const { lat, lon, apiKey } = ctx.config;
  const u = new URL('https://api.openweathermap.org/data/2.5/forecast');
  u.searchParams.set('lat', lat);
  u.searchParams.set('lon', lon);
  u.searchParams.set('appid', apiKey);
  u.searchParams.set('units', 'metric');
  return u.toString();
}

export const openweathermap: Connector<ForecastData> = {
  manifest: {
    id: 'openweathermap',
    name: 'OpenWeatherMap',
    vendor: 'OpenWeather',
    category: 'weather',
    regions: ['DE', 'AT', 'CH'],
    authType: 'apikey',
    protocol: 'REST',
    capabilities: ['read'],
    config: [
      { key: 'apiKey', label: 'API Key', required: true, secret: true, help: 'home.openweathermap.org/api_keys' },
      { key: 'lat', label: 'Breitengrad', required: true, help: 'z.B. 46.8508' },
      { key: 'lon', label: 'Längengrad', required: true, help: 'z.B. 9.5320' },
    ],
    docsUrl: 'https://openweathermap.org/forecast5',
    status: 'stable',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['apiKey', 'lat', 'lon']);
    const t0 = Date.now();
    try {
      const res = await ctx.fetch(url(ctx));
      if (res.status === 401) return { ok: false, message: 'API Key ungültig (401)' };
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const json = (await res.json()) as { list?: OwmEntry[] };
      const n = json.list?.length ?? 0;
      return { ok: n > 0, message: `${n} Wetter-Punkte (3h-Raster)`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<ForecastData> {
    requireConfig(ctx, ['apiKey', 'lat', 'lon']);
    const res = await ctx.fetch(url(ctx));
    if (!res.ok) throw new Error(`OpenWeatherMap HTTP ${res.status}`);
    const json = (await res.json()) as { list: OwmEntry[] };
    const points: ForecastPoint[] = json.list.map((e) => ({
      ts: new Date(e.dt * 1000).toISOString(),
      tempC: e.main.temp,
      cloudCoverPct: e.clouds.all,
    }));
    return { source: 'OpenWeatherMap', points };
  },
};
