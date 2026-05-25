// Geschäftsregeln (business rules) für die Netzanmeldung.
//
// Diese Funktionen kodieren Entscheidungen, die sonst ein Mensch pro Formular
// trifft (Einspeiseart, Phasenanschluss, NA-Schutz). Sie stehen NICHT in Reonic
// — sie sind Firmenpolitik. Die Defaults hier folgen dem Standardfall eines
// Wohngebäude-PV-Installateurs; sobald Volta die Regeln bestätigt, werden hier
// nur die Konstanten angepasst und alles fließt automatisch in Formulare + MaStR.
//
// Solange RULES_CONFIRMED=false ist, markiert die UI die Werte als „Standardregel
// — bitte bestätigen", damit nichts ungeprüft eingereicht wird.

import type { ProjectData } from './projektdaten';

export const RULES_CONFIRMED = false;

export type Einspeiseart = 'ueberschuss' | 'voll';
export type Phasen = 1 | 3;

export const EINSPEISEART_LABEL: Record<Einspeiseart, string> = {
  ueberschuss: 'Überschusseinspeisung',
  voll: 'Volleinspeisung',
};

// Volta installiert für Eigenverbrauch → standardmäßig Überschusseinspeisung.
export function einspeiseart(_project: ProjectData): Einspeiseart {
  return 'ueberschuss';
}

// VDE-AR-N 4105: ab 4,6 kVA Schieflast ist 3-phasiger Anschluss nötig. Die
// Wechselrichter-Scheinleistung steht nicht separat in Reonic; bei PV ist die
// kWp ein brauchbarer Näherungswert für die WR-Leistung.
export function phasen(project: ProjectData): Phasen {
  return project.kwp > 4.6 ? 3 : 1;
}

export function phasenLabel(project: ProjectData): string {
  return `${phasen(project)}-phasig`;
}

// NA-Schutz (Netz- und Anlagenschutz) ist bei VDE-AR-N-4105-konformen
// Wechselrichtern integriert → immer ja.
export function naSchutzIntegriert(_project: ProjectData): boolean {
  return true;
}

// Hinweistext für die UI, abhängig vom Bestätigungsstatus.
export function ruleHint(base: string): string {
  return RULES_CONFIRMED ? base : `${base} (Standardregel — bitte bestätigen)`;
}
