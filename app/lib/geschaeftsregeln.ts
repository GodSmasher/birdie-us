// Geschäftsregeln (business rules) für die Netzanmeldung.
//
// Diese Funktionen kodieren Entscheidungen, die sonst ein Mensch pro Formular
// trifft (Einspeiseart, Phasenanschluss, NA-Schutz, Speicherkopplung, Notstrom).
// Sie stehen NICHT in Reonic — sie sind Firmenpolitik von Volta.
//
// ✅ BESTÄTIGT am 2026-05-26 durch Volta:
//   1. Einspeiseart: immer Überschusseinspeisung
//   2. Phasenanschluss: immer 3-phasig (Anlage läuft 3-phasig)
//   3. NA-Schutz: ja, immer integriert im Wechselrichter
//   4. Speicher: immer DC-gekoppelt mit Gleichrichter
//   5. Notstrom: nur wenn Kunde Notstromersatzpaket gekauft hat
//      (dann auch: Inselbildendes System = ja, Schwarzstartfähig = ja)

import type { ProjectData } from './projektdaten';

export const RULES_CONFIRMED = true;

export type Einspeiseart = 'ueberschuss' | 'voll';
export type Phasen = 1 | 3;
export type Speicherkopplung = 'dc' | 'ac';

export const EINSPEISEART_LABEL: Record<Einspeiseart, string> = {
  ueberschuss: 'Überschusseinspeisung',
  voll: 'Volleinspeisung',
};

export const SPEICHERKOPPLUNG_LABEL: Record<Speicherkopplung, string> = {
  dc: 'DC-gekoppelt (mit Gleichrichter)',
  ac: 'AC-gekoppelt',
};

// Volta installiert für Eigenverbrauch → immer Überschusseinspeisung.
export function einspeiseart(_project: ProjectData): Einspeiseart {
  return 'ueberschuss';
}

// Volta: Anlage läuft immer 3-phasig → kein Schwellenwert nötig.
export function phasen(_project: ProjectData): Phasen {
  return 3;
}

export function phasenLabel(_project: ProjectData): string {
  return '3-phasig';
}

// NA-Schutz (Netz- und Anlagenschutz) ist bei VDE-AR-N-4105-konformen
// Wechselrichtern integriert → immer ja.
export function naSchutzIntegriert(_project: ProjectData): boolean {
  return true;
}

// Volta: immer DC-gekoppelter Speicher mit Gleichrichter.
export function speicherkopplung(_project: ProjectData): Speicherkopplung {
  return 'dc';
}

// Notstrom nur wenn Kunde das Notstromersatzpaket dazu gekauft hat.
// Erkennung: Reonic-Komponentenname enthält "notstrom" oder "ersatz" oder "backup".
// Bei Notstrom: Inselbildendes System = ja, Schwarzstartfähig = ja.
const NOTSTROM_PATTERN = /notstrom|ersatz|backup|island|inselbild/i;

export function hatNotstrom(project: ProjectData): boolean {
  // Prüfe ob im Batterienamen oder sonstigen Komponentennamen "Notstrom" vorkommt
  if (project.battery && NOTSTROM_PATTERN.test(project.battery)) return true;
  return false;
}

export function inselbildend(project: ProjectData): boolean {
  return hatNotstrom(project);
}

export function schwarzstartfaehig(project: ProjectData): boolean {
  return hatNotstrom(project);
}

// Hinweistext für die UI, abhängig vom Bestätigungsstatus.
export function ruleHint(base: string): string {
  return RULES_CONFIRMED ? base : `${base} (Standardregel — bitte bestätigen)`;
}
