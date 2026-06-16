// Business rules for interconnection registration.
//
// These functions encode decisions that would otherwise require a human per form
// (feed-in type, phase connection, grid protection, storage coupling, backup power).
// They are NOT in Reonic — they are Volta company policy.
//
// CONFIRMED on 2026-05-26 by Volta:
//   1. Feed-in type: always surplus feed-in
//   2. Phase connection: always 3-phase (system runs 3-phase)
//   3. Grid protection: yes, always integrated in inverter
//   4. Storage: always DC-coupled with rectifier
//   5. Backup power: only if customer purchased backup power package
//      (then also: island-forming system = yes, black-start capable = yes)

import type { ProjectData } from './projektdaten';

export const RULES_CONFIRMED = true;

export type Einspeiseart = 'ueberschuss' | 'voll';
export type Phasen = 1 | 3;
export type Speicherkopplung = 'dc' | 'ac';

export const EINSPEISEART_LABEL: Record<Einspeiseart, string> = {
  ueberschuss: 'Surplus feed-in',
  voll: 'Full feed-in',
};

export const SPEICHERKOPPLUNG_LABEL: Record<Speicherkopplung, string> = {
  dc: 'DC-coupled (with rectifier)',
  ac: 'AC-coupled',
};

// Volta installs for self-consumption → always surplus feed-in.
export function einspeiseart(_project: ProjectData): Einspeiseart {
  return 'ueberschuss';
}

// Volta: system always runs 3-phase → no threshold needed.
export function phasen(_project: ProjectData): Phasen {
  return 3;
}

export function phasenLabel(_project: ProjectData): string {
  return '3-phase';
}

// Grid protection (grid and system protection) is integrated in VDE-AR-N-4105
// compliant inverters → always yes.
export function naSchutzIntegriert(_project: ProjectData): boolean {
  return true;
}

// Volta: always DC-coupled storage with rectifier.
export function speicherkopplung(_project: ProjectData): Speicherkopplung {
  return 'dc';
}

// Backup power only if customer purchased the backup power package.
// Detection: Reonic component name contains "notstrom" or "ersatz" or "backup".
// With backup power: island-forming system = yes, black-start capable = yes.
const NOTSTROM_PATTERN = /notstrom|ersatz|backup|island|inselbild/i;

export function hatNotstrom(project: ProjectData): boolean {
  // Check if the battery name or other component names contain "backup power"
  if (project.battery && NOTSTROM_PATTERN.test(project.battery)) return true;
  return false;
}

export function inselbildend(project: ProjectData): boolean {
  return hatNotstrom(project);
}

export function schwarzstartfaehig(project: ProjectData): boolean {
  return hatNotstrom(project);
}

// Hint text for the UI, depends on confirmation status.
export function ruleHint(base: string): string {
  return RULES_CONFIRMED ? base : `${base} (Default rule — please confirm)`;
}
