// Normalized time-series model. Every connector pull flattens into Reading rows
// ready for bulk-insert into a TSDB (Postgres/Timescale/Supabase) — this is the
// shape that lets the platform handle high data volume.

import type { TariffData, ForecastData, InverterReading } from './types.js';

export interface Reading {
  connectorId: string;
  installationId?: string;
  tenantId?: string;
  metric: string; // e.g. 'tariff.price', 'battery.soc', 'pv.power'
  value: number;
  unit: string; // 'ct/kWh', '%', 'kW', 'W', '°C', '%cloud'
  ts: string; // ISO
}

interface FlattenMeta {
  connectorId: string;
  installationId?: string;
  tenantId?: string;
}

function isTariff(x: unknown): x is TariffData {
  return !!x && typeof x === 'object' && 'points' in x && Array.isArray((x as TariffData).points)
    && (x as TariffData).points.length > 0 && 'ctPerKwh' in (x as TariffData).points[0];
}

function isForecast(x: unknown): x is ForecastData {
  return !!x && typeof x === 'object' && 'points' in x && Array.isArray((x as ForecastData).points)
    && (x as ForecastData).points.length > 0
    && ('estimateKw' in (x as ForecastData).points[0] || 'cloudCoverPct' in (x as ForecastData).points[0] || 'tempC' in (x as ForecastData).points[0]);
}

function isInverter(x: unknown): x is InverterReading {
  return !!x && typeof x === 'object' && 'pvPowerKw' in x;
}

function hasSummary(x: unknown): x is { summary: Record<string, number | undefined>; target?: string } {
  return !!x && typeof x === 'object' && 'summary' in x;
}

const ecoflowUnits: Record<string, string> = {
  batterySoc: '%',
  pvInputW: 'W',
  acOutputW: 'W',
  dcOutputW: 'W',
  gridW: 'W',
};
const ecoflowMetric: Record<string, string> = {
  batterySoc: 'battery.soc',
  pvInputW: 'pv.input_power',
  acOutputW: 'output.ac_power',
  dcOutputW: 'output.dc_power',
  gridW: 'grid.power',
};

/** Flatten any connector pull result into storable time-series rows. */
export function toReadings(pull: unknown, meta: FlattenMeta): Reading[] {
  const base = { ...meta };

  if (isTariff(pull)) {
    return pull.points.map((p) => ({ ...base, metric: 'tariff.price', value: p.ctPerKwh, unit: 'ct/kWh', ts: p.start }));
  }

  if (isForecast(pull)) {
    const out: Reading[] = [];
    for (const p of pull.points) {
      if (p.estimateKw != null) out.push({ ...base, metric: 'forecast.pv_estimate', value: p.estimateKw, unit: 'kW', ts: p.ts });
      if (p.cloudCoverPct != null) out.push({ ...base, metric: 'weather.cloud_cover', value: p.cloudCoverPct, unit: '%cloud', ts: p.ts });
      if (p.tempC != null) out.push({ ...base, metric: 'weather.temp', value: p.tempC, unit: '°C', ts: p.ts });
    }
    return out;
  }

  if (isInverter(pull)) {
    const ts = pull.ts;
    const out: Reading[] = [{ ...base, metric: 'pv.power', value: pull.pvPowerKw, unit: 'kW', ts }];
    if (pull.batterySoc != null) out.push({ ...base, metric: 'battery.soc', value: pull.batterySoc, unit: '%', ts });
    if (pull.batteryPowerKw != null) out.push({ ...base, metric: 'battery.power', value: pull.batteryPowerKw, unit: 'kW', ts });
    if (pull.gridPowerKw != null) out.push({ ...base, metric: 'grid.power', value: pull.gridPowerKw, unit: 'kW', ts });
    if (pull.housePowerKw != null) out.push({ ...base, metric: 'house.power', value: pull.housePowerKw, unit: 'kW', ts });
    return out;
  }

  if (hasSummary(pull)) {
    const ts = new Date().toISOString();
    const out: Reading[] = [];
    for (const [k, v] of Object.entries(pull.summary)) {
      if (typeof v === 'number') {
        out.push({ ...base, metric: ecoflowMetric[k] ?? k, value: v, unit: ecoflowUnits[k] ?? '', ts });
      }
    }
    return out;
  }

  return [];
}
