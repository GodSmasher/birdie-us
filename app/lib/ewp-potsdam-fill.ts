// EWP Potsdam — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   ewp-pv = Datenerfassungsblatt Photovoltaikanlagen — 58 Felder, 3 Seiten
//
// Hinweis: Generische Feldnamen (Textfeld 36-85, Kontrollkästchen 2-11,
//          Optionsfeld 2/4/5). Mapping per Widget-Positionsanalyse.
//
// Templates: nb-templates/EWP Potsdam/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'EWP Potsdam');
// Nested folder structure: file.pdf/file.pdf (Drive-Download-Artefakt)
const TEMPLATES = {
  'ewp-pv': path.join(TMPL_DIR, 'datenerfassungsblatt_photovoltaikanlagen_1.pdf', 'datenerfassungsblatt_photovoltaikanlagen_1.pdf'),
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
// ewp-pv — Datenerfassungsblatt Photovoltaikanlagen (3 Seiten, 58 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Position-Mapping (Widget-Koordinaten, Seite 1 y absteigend):
//
// Seite 1 — Betreiber + Anlagendaten:
//   y=629: TF44 (Name links) | TF45 (Name rechts/Firma)
//   y=601: TF46 (Straße)     | TF47 (PLZ Ort)
//   y=574: TF48 (Telefon)    | TF49 (Email)
//   y=545: TF50 (Standort Anschrift — ganzes Feld)
//   y=462: TF52 (Anlagenstandort Straße — ganzes Feld)
//   y=433: TF53 (Anlagenstandort PLZ Ort — ganzes Feld)
//   y=405: TF54 (Gemarkung/Flurstück — ganzes Feld)
//   y=322: TF55 (Modul Hersteller) | TF56 (Modul Typ/Leistung)
//   y=294: TF57 (Modul Anzahl)     | TF58 (Gesamt kWp)
//   y=266: TF59 (WR Hersteller)    | TF60 (WR Typ)
//   y=238: TF61 (WR Anzahl)        | TF62 (WR Leistung kW)
//   y=154: TF63 (Speicher Hersteller) | TF64 (Speicher Typ)
//   y=126: TF65 (Speicher Kapazität)  | TF66 (Speicher Anzahl)
//   y=99:  TF67 (Speicher sonstiges)  | TF68 (Bemerkung)
//
// Seite 2 — Tabelle + Optionsfelder:
//   TF36-43 + TF69-71: Modul/WR-Detailtabelle
//   Optionsfeld 4 (3 opt): Neuanlage/Änderung/Erweiterung
//   Optionsfeld 2 (2 opt): Überschuss/Volleinspeisung
//
// Seite 3 — Errichter + Bestätigungen:
//   TF79 (Errichter Name), TF80/81 (Ort/Datum)
//   TF82-85 (Unterschriften)
//
export async function fillEWPPv(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('ewp-pv'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const radio = (n: string, v: string) => { try { form.getRadioGroup(n).select(v); } catch {} };

  // ═══ SEITE 1: Betreiber ═══
  text('Textfeld 44', customer);
  text('Textfeld 46', project.address?.line);
  text('Textfeld 47', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('Textfeld 48', project.phone);
  text('Textfeld 49', project.email);

  // ═══ Anlagenstandort ═══
  text('Textfeld 50', project.address?.line);
  text('Textfeld 52', project.address?.line);
  text('Textfeld 53', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ═══ PV-Module ═══
  if (project.moduleType) {
    const parts = project.moduleType.split(/\s+/);
    text('Textfeld 55', parts[0] || '');                   // Hersteller
    text('Textfeld 56', parts.slice(1).join(' ') || '');   // Typ/Leistung
  }
  text('Textfeld 57', String(project.moduleCount ?? 1));  // Anzahl
  text('Textfeld 58', num(project.kwp));                  // Gesamt kWp

  // ═══ Wechselrichter ═══
  const wr = wrModelName(project);
  text('Textfeld 59', wr.hersteller);
  text('Textfeld 60', wr.typ);
  text('Textfeld 61', String(project.inverterCount ?? 1));
  text('Textfeld 62', num(wrKw(project)));

  // ═══ Speicher ═══
  if (project.battery) {
    text('Textfeld 63', project.battery.split(/\s+/)[0] || '');
    text('Textfeld 64', project.battery);
    text('Textfeld 65', project.batterySpec ? num(project.batterySpec.capacityKwh) + ' kWh' : '');
    text('Textfeld 66', String(project.batteryModuleCount ?? 1));
  }

  // ═══ SEITE 2: Optionen ═══
  // Optionsfeld 4: Neuanlage (erste Option)
  radio('Optionsfeld 4', 'Auswahl1');
  // Optionsfeld 2: Überschusseinspeisung (erste Option)
  radio('Optionsfeld 2', 'Auswahl1');

  // ═══ SEITE 3: Errichter ═══
  text('Textfeld 79', VOLTA.name);
  text('Textfeld 80', 'Leipzig');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type EwpDocType = 'ewp-pv';

const FILLERS: Record<EwpDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'ewp-pv': fillEWPPv,
};
const LABELS: Record<EwpDocType, string> = {
  'ewp-pv': 'EWP-Datenerfassung-PV',
};

export function ewpDocLabel(type: EwpDocType): string { return LABELS[type]; }
export async function fillEwpDoc(type: EwpDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
