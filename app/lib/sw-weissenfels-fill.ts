// SW Weißenfels — NB-spezifische PDF-Formularfüller.
//
// Identisches Formularformat wie SW Merseburg (gleicher NB-Verbund).
//
// Formulare:
//   swe-ana = ANA Strom (Anmeldung Netzanschluss)     — 83 Felder, 1 Seite
//   swe-db  = DB_EEA (Datenblatt Erzeugungsanlagen)   — 369 Felder, 10 Seiten
//
// Templates: nb-templates/SW Weißenfels/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { hatNotstrom, phasen } from './geschaeftsregeln';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plz:    process.env.INSTALLER_PLZ     || '04349',
  ort:    process.env.INSTALLER_CITY    || 'Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Weißenfels');
const TEMPLATES = {
  'swe-ana': path.join(TMPL_DIR, 'ANA', 'ANA Strom_SWE_03.2026.pdf'),
  'swe-db':  path.join(TMPL_DIR, 'ANA', 'Datenblatt EEA zur Anmeldung SW Weißenfels.pdf'),
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
// swe-ana — ANA Strom (identisch mit SWM-ANA, andere Vorlage)
// ═══════════════════════════════════════════════════════════════════════════
export async function fillSWEAna(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swe-ana'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };
  const dropdown = (n: string, v: string) => { try { form.getDropdown(n).select(v); } catch {} };

  check('neuer NA');
  dropdown('Art Anlage 1', 'EEA');
  text('Art1 Endausbau', num(project.kwp));
  text('Einspeisung1', num(wrKw(project)));

  if (project.battery) {
    dropdown('Art Anlage 2', 'SP');
    text('Art2 Endausbau', project.batterySpec ? num(project.batterySpec.capacityKwh) : undefined);
  }

  text('Text1', customer);
  text('Text2', VOLTA.name);
  text('Text3', project.address?.line);
  text('Text4', project.address?.zip);
  text('Text5', project.address?.city);
  text('Text6', project.phone);
  text('Text7', project.email);

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// swe-db — DB_EEA (identisch mit SWM-DB, andere Vorlage)
// ═══════════════════════════════════════════════════════════════════════════
export async function fillSWEDb(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swe-db'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // Anmeldungsart
  check('Anmeldung zum Netzanschluss Strom  Anschlussän');
  check('Neuanlage');

  // Standort
  text('Straße Hausnummer', project.address?.line);
  text('2', project.address?.zip);
  text('2_2', project.address?.city);
  text('Anzahl baugleicher Anlagen', '1');
  text('bzw des Anlagenparks 1', project.name || customer + ' PV');

  // Energieträger
  check('Photovoltaik');

  // Vermarktungsform
  check('Überschusseinspeisung Eigenversorgung');

  // PV-Module
  if (project.moduleType) text('PVModule 1', project.moduleType);
  text('PVModule 2', num(project.kwp));
  text('Generatoren', String(project.moduleCount ?? 1));

  // Wechselrichter
  const wr = wrModelName(project);
  text('Wechselrichter 1', [wr.hersteller, wr.typ].join(' '));
  text('Wechselrichter 2', num(wrKw(project)));

  // Leistungsdaten
  text('max Leistung kW', num(wrKw(project)));
  text('eingespeiste Strom', project.annualKwh ? String(project.annualKwh) : undefined);

  // Phasen
  if (phasen(project) === 3) check('dreiphasig');
  else if (phasen(project) === 1) check('einphasig');

  // Generatortyp
  check('Umrichter');

  // Notstrom
  if (hatNotstrom(project)) check('Notstrom <= 100 ms');

  // NA-Schutz
  text('Anzahl NA Schutz', '1');

  // Speicher
  if (project.battery) {
    text('1_17 - Speicher', project.battery);
    text('Anzahl Speicher', String(project.batteryModuleCount ?? 1));
    check('Speicher mit Lieferung Netz und Bezug aus Netz');
    check('Ladung aus Netz ja');
  }

  // EEG §48(1) Nr.1 Gebäude-PV
  check('48 1 Nr 1 EEG');
  check('auf Gebäude');

  // Vermarktung
  check('Marktprämie');

  // Betreiber & Errichter
  text('Wer ist der Betreiber', customer);
  text('Wer ist der Errichter', VOLTA.name);
  text('Erklärung des Anlagenbetreiber', customer);
  text('Erklärung des Anlagenerrichters', VOLTA.name);
  check('Bestätigung Anlagenerrichter');

  // Inbetriebnahme — Datum wird vor Ort eingetragen

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SweDocType = 'swe-ana' | 'swe-db';

const FILLERS: Record<SweDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'swe-ana': fillSWEAna,
  'swe-db':  fillSWEDb,
};
const LABELS: Record<SweDocType, string> = {
  'swe-ana': 'SWE-Anmeldung-Strom',
  'swe-db':  'SWE-Datenblatt-EEA',
};

export function sweDocLabel(type: SweDocType): string { return LABELS[type]; }
export async function fillSweDoc(type: SweDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
