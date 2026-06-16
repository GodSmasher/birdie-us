// EcoFlow IoT Developer API client for birdie.
//
// Uses AccessKey + SecretKey from env vars to query the EcoFlow cloud.
// API: https://api-e.ecoflow.com (EU) or https://api.ecoflow.com (global)
//
// Endpoints used:
//   GET /iot-open/sign/device/list        → list all linked devices
//   GET /iot-open/sign/device/quota/all   → get all real-time data for a device
//
// Auth: HMAC-SHA256 signing of sorted params + accessKey + nonce + timestamp

import crypto from 'crypto';

const API_BASE = 'https://api-e.ecoflow.com'; // EU endpoint

function getKeys(): { accessKey: string; secretKey: string } | null {
  // Strip BOM / whitespace / non-ASCII that PowerShell may inject into env vars
  const accessKey = process.env.ECOFLOW_ACCESS_KEY?.replace(/[^a-zA-Z0-9]/g, '');
  const secretKey = process.env.ECOFLOW_SECRET_KEY?.replace(/[^a-zA-Z0-9]/g, '');
  if (!accessKey || !secretKey) return null;
  return { accessKey, secretKey };
}

/** Flatten nested objects into dot-notation keys for signing. */
function flattenKeys(obj: Record<string, unknown>, prefix?: string): Record<string, string> {
  const getPrefix = (k: string): string => {
    if (!prefix) return k;
    return Array.isArray(obj) ? `${prefix}[${k}]` : `${prefix}.${k}`;
  };

  let res: Record<string, string> = {};
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      res = { ...res, ...flattenKeys(obj[k] as Record<string, unknown>, getPrefix(k)) };
    } else {
      res[getPrefix(k)] = String(obj[k]);
    }
  }
  return res;
}

/** Make a signed API request to EcoFlow. */
async function ecoflowRequest<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const keys = getKeys();
  if (!keys) throw new Error('ECOFLOW_ACCESS_KEY / ECOFLOW_SECRET_KEY nicht gesetzt');

  const nonce = String(100000 + Math.floor(Math.random() * 100000));
  const timestamp = String(Date.now());

  // Build signing string: sorted data params + accessKey + nonce + timestamp
  let dataStr = '';
  if (data) {
    const flat = flattenKeys(data);
    const sorted = Object.keys(flat).sort();
    dataStr = sorted.map(k => `${k}=${flat[k]}`).join('&') + '&';
  }

  const signingStr = `${dataStr}accessKey=${keys.accessKey}&nonce=${nonce}&timestamp=${timestamp}`;
  const sign = crypto.createHmac('sha256', keys.secretKey).update(signingStr).digest('hex');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json;charset=UTF-8',
    accessKey: keys.accessKey,
    nonce,
    timestamp,
    sign,
  };

  let url = `${API_BASE}${path}`;
  const fetchOpts: RequestInit = { method, headers };

  if (method === 'GET' && data) {
    const qs = new URLSearchParams(flattenKeys(data));
    url += (url.includes('?') ? '&' : '?') + qs.toString();
  } else if (method === 'POST' && data) {
    fetchOpts.body = JSON.stringify(data);
  }

  const res = await fetch(url, fetchOpts);
  if (!res.ok) throw new Error(`EcoFlow API HTTP ${res.status}: ${await res.text().catch(() => '')}`);

  const json = await res.json() as { code: string | number; message: string; data: T };
  if (String(json.code) !== '0') throw new Error(`EcoFlow API error ${json.code}: ${json.message}`);

  return json.data;
}

// ── Public types ────────────────────────────────────────────────────────────

export interface EcoFlowDevice {
  sn: string;
  deviceName?: string;
  online: number; // 1 = online, 0 = offline
  productName: string;
}

export interface EcoFlowQuota {
  [key: string]: unknown;
}

// PowerOcean-specific quota fields (from 20_1.* namespace)
export interface PowerOceanData {
  // Power values (Watts)
  solarPower: number;       // PV input power
  gridPower: number;        // Grid power (+ = import, - = export)
  homePower: number;        // Home consumption
  batteryPower: number;     // Battery power (+ = charging, - = discharging)

  // Battery
  batterySoc: number;       // State of charge (%)
  batteryCapacity: number;  // Total capacity (Wh)

  // Energy totals (Wh, today)
  solarEnergyToday: number;
  gridEnergyImportToday: number;
  gridEnergyExportToday: number;
  homeEnergyToday: number;
  batteryChargeToday: number;
  batteryDischargeToday: number;

  // System
  systemStatus: number;
  online: boolean;

  // Raw quota for debugging
  raw?: Record<string, unknown>;
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Check if EcoFlow credentials are configured. */
export function isConfigured(): boolean {
  return getKeys() !== null;
}

/** List all EcoFlow devices linked to this account. */
export async function getDeviceList(): Promise<EcoFlowDevice[]> {
  return ecoflowRequest<EcoFlowDevice[]>('GET', '/iot-open/sign/device/list');
}

/** Get all quota data for a device by serial number. */
export async function getDeviceQuota(sn: string): Promise<EcoFlowQuota> {
  return ecoflowRequest<EcoFlowQuota>('GET', `/iot-open/sign/device/quota/all?sn=${sn}`);
}

/** Parse PowerOcean quota data into a friendly structure. */
export function parsePoData(quota: EcoFlowQuota): PowerOceanData {
  // PowerOcean uses 20_1.* namespace for most values
  const q = quota as Record<string, number | undefined>;

  return {
    solarPower: q['20_1.pvPower'] ?? q['20_1.solarPower'] ?? q['20_1.pv1InputWatts'] ?? 0,
    gridPower: q['20_1.gridPower'] ?? q['20_1.gridInputWatts'] ?? 0,
    homePower: q['20_1.homePower'] ?? q['20_1.homeLoadWatts'] ?? 0,
    batteryPower: q['20_1.bpPower'] ?? q['20_1.batInputWatts'] ?? 0,
    batterySoc: q['20_1.bpSoc'] ?? q['20_1.batSoc'] ?? 0,
    batteryCapacity: q['20_1.bpTotalChgCap'] ?? q['20_1.batCapacity'] ?? 0,
    solarEnergyToday: q['20_1.pvChargeWattsToday'] ?? q['20_1.solarEnergyToday'] ?? 0,
    gridEnergyImportToday: q['20_1.gridConsumptionWattsToday'] ?? 0,
    gridEnergyExportToday: q['20_1.gridFeedInWattsToday'] ?? 0,
    homeEnergyToday: q['20_1.homeConsumptionWattsToday'] ?? 0,
    batteryChargeToday: q['20_1.batChargeWattsToday'] ?? 0,
    batteryDischargeToday: q['20_1.batDischargeWattsToday'] ?? 0,
    systemStatus: q['20_1.sysWorkMode'] ?? 0,
    online: true,
    raw: quota as Record<string, unknown>,
  };
}

/** Get all devices with their live data. */
export async function getAllDevicesWithData(): Promise<{ device: EcoFlowDevice; data: PowerOceanData | null }[]> {
  const devices = await getDeviceList();
  const results: { device: EcoFlowDevice; data: PowerOceanData | null }[] = [];

  for (const device of devices) {
    try {
      const quota = await getDeviceQuota(device.sn);
      results.push({ device, data: parsePoData(quota) });
    } catch (e) {
      console.error(`[ecoflow] Failed to get quota for ${device.sn}:`, (e as Error).message);
      results.push({ device, data: null });
    }
  }

  return results;
}
