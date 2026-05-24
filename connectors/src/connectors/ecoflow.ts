import { createHmac, randomInt } from 'node:crypto';
import {
  type Connector,
  type ConnectorContext,
  type TestResult,
  requireConfig,
} from '../types.js';

// EcoFlow IoT Developer Platform.
// EU region (DACH): host api-e.ecoflow.com · keys via developer-eu.ecoflow.com/us/security
// Auth: HMAC-SHA256 over sorted params + accessKey + nonce + timestamp.
// Docs: https://developer.ecoflow.com/us/document/generalInfo

interface DeviceInfo {
  sn: string;
  online: number; // 1 = online
  deviceName?: string;
  productName?: string;
}

export interface EcoflowPull {
  devices: DeviceInfo[];
  target: string | null;
  /** Raw quota map exactly as EcoFlow returns it (keys differ per device type). */
  raw: Record<string, unknown>;
  /** Best-effort normalized snapshot (defensive — fields may be absent per device type). */
  summary: {
    batterySoc?: number;
    pvInputW?: number;
    acOutputW?: number;
    dcOutputW?: number;
    gridW?: number;
  };
}

function host(ctx: ConnectorContext): string {
  // EU default for DACH. Use 'global' for api.ecoflow.com (US/global accounts).
  return (ctx.config.host || 'api-e.ecoflow.com').replace(/^https?:\/\//, '');
}

/** Build EcoFlow auth headers. `params` are the flat business params (e.g. { sn }). */
function authHeaders(ctx: ConnectorContext, params: Record<string, string | number> = {}): Record<string, string> {
  const accessKey = ctx.config.accessKey;
  const secretKey = ctx.config.secretKey;
  const nonce = String(randomInt(100000, 999999));
  const timestamp = String(Date.now());

  const parts = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`);
  parts.push(`accessKey=${accessKey}`, `nonce=${nonce}`, `timestamp=${timestamp}`);
  const signStr = parts.join('&');
  const sign = createHmac('sha256', secretKey).update(signStr).digest('hex');

  return {
    accessKey,
    nonce,
    timestamp,
    sign,
    'Content-Type': 'application/json;charset=UTF-8',
  };
}

async function api<T>(ctx: ConnectorContext, path: string, params: Record<string, string | number> = {}): Promise<T> {
  const qs = Object.keys(params).length
    ? '?' + Object.keys(params).sort().map((k) => `${k}=${encodeURIComponent(params[k])}`).join('&')
    : '';
  const res = await ctx.fetch(`https://${host(ctx)}${path}${qs}`, {
    headers: authHeaders(ctx, params),
  });
  if (res.status === 401) throw new Error('EcoFlow: Signatur/Key ungültig (401)');
  if (!res.ok) throw new Error(`EcoFlow HTTP ${res.status}`);
  const json = (await res.json()) as { code: string; message: string; data?: T };
  if (json.code !== '0' && json.code !== '00000') {
    throw new Error(`EcoFlow: ${json.message} (code ${json.code})`);
  }
  return json.data as T;
}

/** Defensive field extraction — EcoFlow uses different key names per device type. */
function pickNumber(raw: Record<string, unknown>, patterns: RegExp[]): number | undefined {
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'number' && patterns.some((p) => p.test(k))) return v;
  }
  return undefined;
}

export const ecoflow: Connector<EcoflowPull> = {
  manifest: {
    id: 'ecoflow',
    name: 'EcoFlow',
    vendor: 'EcoFlow',
    category: 'battery',
    regions: ['DE', 'AT', 'CH'],
    authType: 'apikey',
    protocol: 'IoT Developer API (REST + MQTT)',
    capabilities: ['read', 'write', 'realtime'],
    config: [
      { key: 'accessKey', label: 'Access Key', required: true, secret: true, help: 'developer-eu.ecoflow.com → Security' },
      { key: 'secretKey', label: 'Secret Key', required: true, secret: true },
      { key: 'host', label: 'API Host', required: false, default: 'api-e.ecoflow.com', help: 'EU: api-e.ecoflow.com · global: api.ecoflow.com' },
      { key: 'sn', label: 'Geräte-SN', required: false, help: 'optional — sonst erstes Online-Gerät' },
    ],
    docsUrl: 'https://developer.ecoflow.com/us/document/generalInfo',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['accessKey', 'secretKey']);
    const t0 = Date.now();
    try {
      const devices = await api<DeviceInfo[]>(ctx, '/iot-open/sign/device/list');
      const online = devices.filter((d) => d.online === 1).length;
      return { ok: true, message: `${devices.length} Gerät(e), ${online} online`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<EcoflowPull> {
    requireConfig(ctx, ['accessKey', 'secretKey']);
    const devices = await api<DeviceInfo[]>(ctx, '/iot-open/sign/device/list');

    const target = ctx.config.sn || devices.find((d) => d.online === 1)?.sn || devices[0]?.sn || null;
    let raw: Record<string, unknown> = {};
    if (target) {
      raw = await api<Record<string, unknown>>(ctx, '/iot-open/sign/device/quota/all', { sn: target });
    }

    const summary: EcoflowPull['summary'] = {
      batterySoc: pickNumber(raw, [/soc/i]),
      pvInputW: pickNumber(raw, [/mppt.*(inputWat|InWatts?)/i, /pv.*watt/i, /InputWatts/i]),
      acOutputW: pickNumber(raw, [/AcOutWat/i, /acOutputWatts/i]),
      dcOutputW: pickNumber(raw, [/DcOutWat/i, /dcOutputWatts/i]),
      gridW: pickNumber(raw, [/grid.*watt/i, /gridWatt/i]),
    };

    return { devices, target, raw, summary };
  },
};
