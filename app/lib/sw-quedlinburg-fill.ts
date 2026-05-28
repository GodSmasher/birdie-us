// SW Quedlinburg — NB-spezifisches PDF-Formular.
//
// Formulare:
//   swq-pv = Datenblatt PV-Anlagen (ANA) — 135 Felder, 2 Seiten
//
// Templates: nb-templates/SW Quedlinburg/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { hatNotstrom } from './geschaeftsregeln';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Quedlinburg');
const TEMPLATES = {
  'swq-pv': path.join(TMPL_DIR, 'ANA', '24-001_Datenblatt_PV-Anlagen.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }
function wrModelName(p: ProjectData) {
  if (p.inverterSpec) return { hersteller: 'EcoFlow', typ: p.inverterSpec.model.replace('EcoFlow ', '') };
  const parts = (p.inverter || '').split(/\s+/);
  return { hersteller: parts[0] || '', typ: parts.slice(1).join(' ') || p.inverter || '' };
}

// ═══════════════════════════════════════════════════════════════════════════
// swq-pv — Datenblatt PV-Anlagen (2 Seiten, 135 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Seite 1: EEG-Vergütungsparagrafen, Vermarktungsform, IBN-Datum
// Seite 2: Anlage (Standort, Typ, Module, WR, Leistung, Inselbetrieb),
//          Errichter, Betreiber
//
export async function fillSWQPV(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swq-pv'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ═══ SEITE 1: EEG + Vermarktung ═══════════════════════════════════════

  // Neuanlage
  check('Neuanlage');

  // Überschusseinspeisung
  check('Überschusseinspeisung');

  // Vergütung §48(2) EEG (Gebäude-PV)
  check('Vergütung §48 1 Nr 1 EEG');

  // Errichtung in/an/auf Gebäude
  check('Errichtunginanauf Gebäude oder baulicher Anlage');

  // ═══ SEITE 2: Anlagendaten ════════════════════════════════════════════

  // ── Standort ──
  text('Bezeichnung der Anlage', project.name || customer + ' PV');
  text('Anzahl baugleicher Anlagen', '1');
  text('Standort_Straße', project.address?.line);
  text('Standort_Ort', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ── Anlagenart ──
  check('Art_Photovoltaik');

  // ── PV-Module (Row 1) ──
  text('PV-Module_Anzahl1', String(project.moduleCount));
  if (project.moduleType) {
    const parts = project.moduleType.split(/\s+/);
    text('PV-Typ-Hersteller1', parts.join(' '));
  }
  text('PV-Gesamtleistung1', num(project.kwp));

  // ── Wechselrichter (Row 1) ──
  const wr = wrModelName(project);
  text('Wechselrichter_Anzahl1', String(project.inverterCount ?? 1));
  text('WR-Typ-Hersteller1', [wr.hersteller, wr.typ].join(' '));
  text('WR-Gesamtleistung1', num(wrKw(project)));

  // ── Speicher als "Sonstige" (Row 1) ──
  if (project.battery) {
    text('Sonstige_Anzahl1', String(project.batteryModuleCount ?? 1));
    text('Sonstiges-Typ-Hersteller1', project.battery);
    text('Sonstiges_Funktion1', 'Batteriespeicher');
  }

  // ── Messkonzept ──
  text('Konzept', 'Überschusseinspeisung');

  // ── Leistungsdaten ──
  text('Einspeisung_Max_Leistung', num(wrKw(project)));
  text('Eingespeiste_Arbeit', project.annualKwh ? String(project.annualKwh) : undefined);
  text('Erzeugte_Arbeit', project.annualKwh ? String(project.annualKwh) : undefined);

  // ── Inselbetrieb ──
  if (hatNotstrom(project)) {
    check('Inselbetrieb_ja');
  } else {
    check('Inselbetrieb_nein');
  }

  // ── Oberschwingungen: selbstgeführter WR ──
  check('Oberschwingungen_selbtsgeführt');              // Note: typo in PDF "selbts"

  // ── Blindstromkompensation: nein (Standard PV) ──
  check('Blindstromkomp_nein');

  // ── Errichter = Volta ──
  text('Errichter_Name', VOLTA.name);
  text('Errichter_Strasse', VOLTA.street);
  text('Errichter_Ort', VOLTA.plzOrt);

  // ── Betreiber ──
  text('Betreiber_Name', customer);
  text('Betreiber_Strasse', project.address?.line);
  text('Betreiber_Ort', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SwqDocType = 'swq-pv';

const FILLERS: Record<SwqDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'swq-pv': fillSWQPV,
};
const LABELS: Record<SwqDocType, string> = {
  'swq-pv': 'SWQ-Datenblatt-PV',
};

export function swqDocLabel(type: SwqDocType): string { return LABELS[type]; }
export async function fillSwqDoc(type: SwqDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
