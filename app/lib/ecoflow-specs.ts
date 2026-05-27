// EcoFlow PowerOcean Speicherdaten — statischer Lookup für Datenblatt-Felder.
// Quelle: offizielle EcoFlow-Datenblätter + Händler-Produktseiten (Stand 2026-05).
//
// Wird genutzt um die korrekten technischen Daten in Netzanmeldungen, E2/E3-Formulare
// und die DB einzutragen, ohne dass Katrin jedes Mal manuell nachschlagen muss.

export interface BatterySpec {
  model: string;
  capacityKwh: number;       // Nennkapazität pro Modul
  usableKwh: number;         // nutzbare Kapazität (DoD 95%)
  voltage: number;           // Nennspannung (V)
  maxDischargekW: number;    // max. Entladeleistung pro Modul (kW)
  cycleLife: number;          // Zyklen bis 70% Restkapazität
  dod: number;               // Depth of Discharge (%)
  efficiency: number;         // Round-trip Wirkungsgrad (%)
  chemistry: string;
  weightKg: number;
  dimensions: string;        // B x T x H (mm)
  ip: string;
  warranty: string;
}

export interface InverterSpec {
  model: string;
  ratedPowerKw: number;      // Nennleistung (kW)
  apparentPowerKva: number;  // Scheinleistung (kVA)
  maxPvInputW: number;       // max. PV-Eingangsleistung (W)
  mpptCount: number;         // Anzahl MPPT-Tracker
  mpptVoltageRange: string;  // MPPT-Spannungsbereich (V)
  maxInputCurrentA: number;  // max. Eingangsstrom pro MPPT (A)
  maxEfficiency: number;     // max. Wirkungsgrad (%)
  phases: 1 | 3;
  weightKg: number;
  dimensions: string;        // B x T x H (mm)
  ip: string;
  backupPowerKw?: number;    // Notstrom-Ausgangsleistung (kW)
}

// ── Batterie-Module ──────────────────────────────────────────────────────────

export const BATTERIES: Record<string, BatterySpec> = {
  'PowerOcean 5kWh': {
    model: 'EcoFlow PowerOcean LFP Battery 5kWh',
    capacityKwh: 5.12,
    usableKwh: 4.8,
    voltage: 800,
    maxDischargekW: 3.3,
    cycleLife: 6000,
    dod: 95,
    efficiency: 94,
    chemistry: 'LiFePO4 (LFP)',
    weightKg: 59.2,
    dimensions: '680 x 183 x 452',
    ip: 'IP65',
    warranty: '15 Jahre',
  },
};

// ── Hybrid-Wechselrichter ────────────────────────────────────────────────────

export const INVERTERS: Record<string, InverterSpec> = {
  'PowerOcean 5kW 3ph': {
    model: 'EcoFlow PowerOcean Hybrid-Wechselrichter 5kW 3-phasig',
    ratedPowerKw: 5,
    apparentPowerKva: 5,
    maxPvInputW: 7500,
    mpptCount: 2,
    mpptVoltageRange: '160–1000',
    maxInputCurrentA: 16,
    maxEfficiency: 97.6,
    phases: 3,
    weightKg: 29.5,
    dimensions: '588 x 380 x 175',
    ip: 'IP65',
    backupPowerKw: 5,
  },
  'PowerOcean 8kW 3ph': {
    model: 'EcoFlow PowerOcean Hybrid-Wechselrichter 8kW 3-phasig',
    ratedPowerKw: 8,
    apparentPowerKva: 8,
    maxPvInputW: 12000,
    mpptCount: 2,
    mpptVoltageRange: '160–1000',
    maxInputCurrentA: 16,
    maxEfficiency: 97.6,
    phases: 3,
    weightKg: 29.5,
    dimensions: '588 x 380 x 175',
    ip: 'IP65',
    backupPowerKw: 8,
  },
  'PowerOcean 10kW 3ph': {
    model: 'EcoFlow PowerOcean Hybrid-Wechselrichter 10kW 3-phasig',
    ratedPowerKw: 10,
    apparentPowerKva: 10,
    maxPvInputW: 14000,
    mpptCount: 2,
    mpptVoltageRange: '200–850',
    maxInputCurrentA: 16,
    maxEfficiency: 97.6,
    phases: 3,
    weightKg: 29.65,
    dimensions: '670 x 508 x 356',
    ip: 'IP65',
    backupPowerKw: 10,
  },
  'PowerOcean 12kW 3ph': {
    model: 'EcoFlow PowerOcean Hybrid-Wechselrichter 12kW 3-phasig',
    ratedPowerKw: 12,
    apparentPowerKva: 12,
    maxPvInputW: 16000,
    mpptCount: 2,
    mpptVoltageRange: '200–850',
    maxInputCurrentA: 16,
    maxEfficiency: 97.6,
    phases: 3,
    weightKg: 29.65,
    dimensions: '670 x 508 x 356',
    ip: 'IP65',
    backupPowerKw: 12,
  },
};

// ── Lookup-Helpers ───────────────────────────────────────────────────────────

/** Finde Inverter-Specs anhand des Komponentennamens aus Reonic (fuzzy match). */
export function findInverter(name: string): InverterSpec | undefined {
  const n = name.toLowerCase();
  // Exakter Key-Match
  for (const [key, spec] of Object.entries(INVERTERS)) {
    if (n.includes(key.toLowerCase())) return spec;
  }
  // Fuzzy: extrahiere kW-Zahl und suche passenden 3ph-Wechselrichter
  const kwMatch = /(\d+)\s*k[wW]/.exec(n);
  if (kwMatch) {
    const kw = parseInt(kwMatch[1], 10);
    const key = `PowerOcean ${kw}kW 3ph`;
    if (INVERTERS[key]) return INVERTERS[key];
  }
  return undefined;
}

/** Finde Batterie-Specs anhand des Komponentennamens aus Reonic (fuzzy match). */
export function findBattery(name: string): BatterySpec | undefined {
  const n = name.toLowerCase();
  if (n.includes('powerocean') || n.includes('ecoflow')) {
    // Aktuell gibt es nur ein Batteriemodul — bei Erweiterung hier differenzieren
    return BATTERIES['PowerOcean 5kWh'];
  }
  return undefined;
}
