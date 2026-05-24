// ============================================================
// .birdie Connector SDK — the contract every integration implements
// ============================================================

export type Region = 'DE' | 'AT' | 'CH';

export type ConnectorCategory =
  | 'inverter'
  | 'battery'
  | 'tariff'
  | 'weather'
  | 'crm'
  | 'accounting'
  | 'comms';

export type AuthType = 'none' | 'apikey' | 'token' | 'oauth2' | 'modbus';

export type Capability = 'read' | 'write' | 'webhook' | 'realtime';

export type ConnectorStatus = 'stable' | 'beta' | 'planned';

export interface ConfigField {
  key: string;
  label: string;
  required: boolean;
  secret?: boolean;
  help?: string;
  default?: string;
}

/** Self-describing metadata. The frontend renders connectors from these manifests. */
export interface ConnectorManifest {
  id: string;
  name: string;
  vendor: string;
  category: ConnectorCategory;
  regions: Region[];
  authType: AuthType;
  protocol: string;
  capabilities: Capability[];
  config: ConfigField[];
  docsUrl: string;
  status: ConnectorStatus;
}

export interface ConnectorContext {
  /** Resolved configuration (credentials + settings) for one tenant/installation. */
  config: Record<string, string>;
  /** Injected fetch — lets us swap in retries/proxy/mocks per environment. */
  fetch: typeof fetch;
  logger?: (msg: string) => void;
}

export interface TestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

/** The single interface every connector implements. */
export interface Connector<TPull = unknown> {
  manifest: ConnectorManifest;
  /** Cheap call that proves credentials + reachability without pulling everything. */
  testConnection(ctx: ConnectorContext): Promise<TestResult>;
  /** Pulls normalized data from the source. */
  pull(ctx: ConnectorContext, opts?: Record<string, unknown>): Promise<TPull>;
}

// ---------- Normalized domain models (shared across connectors) ----------

export interface PricePoint {
  start: string; // ISO
  end: string; // ISO
  ctPerKwh: number;
}

export interface TariffData {
  provider: string;
  currency: 'EUR';
  now: PricePoint | null;
  points: PricePoint[];
  cheapest: PricePoint | null;
  mostExpensive: PricePoint | null;
  avgCtPerKwh: number;
}

export interface ForecastPoint {
  ts: string; // ISO
  estimateKw?: number; // PV power estimate
  cloudCoverPct?: number;
  tempC?: number;
}

export interface ForecastData {
  source: string;
  site?: string;
  totalKwhToday?: number;
  points: ForecastPoint[];
}

export interface InverterReading {
  source: string;
  site?: string;
  pvPowerKw: number;
  batterySoc?: number; // %
  batteryPowerKw?: number; // + charge / - discharge
  gridPowerKw?: number; // + feed-in / - draw
  housePowerKw?: number;
  ts: string;
}

// ---------- Helpers ----------

export function requireConfig(ctx: ConnectorContext, keys: string[]): void {
  const missing = keys.filter((k) => !ctx.config[k] || ctx.config[k].trim() === '');
  if (missing.length) {
    throw new Error(`Fehlende Konfiguration: ${missing.join(', ')}`);
  }
}

export function summarizePoints(points: PricePoint[]): Pick<TariffData, 'cheapest' | 'mostExpensive' | 'avgCtPerKwh'> {
  if (points.length === 0) return { cheapest: null, mostExpensive: null, avgCtPerKwh: 0 };
  let cheapest = points[0];
  let mostExpensive = points[0];
  let sum = 0;
  for (const p of points) {
    if (p.ctPerKwh < cheapest.ctPerKwh) cheapest = p;
    if (p.ctPerKwh > mostExpensive.ctPerKwh) mostExpensive = p;
    sum += p.ctPerKwh;
  }
  return { cheapest, mostExpensive, avgCtPerKwh: Math.round((sum / points.length) * 100) / 100 };
}

export function nowPoint(points: PricePoint[], now = Date.now()): PricePoint | null {
  return points.find((p) => Date.parse(p.start) <= now && now < Date.parse(p.end)) ?? null;
}
