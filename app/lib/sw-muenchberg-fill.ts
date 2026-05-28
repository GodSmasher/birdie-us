// SW Münchberg — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   swmb-pv  = Datenerfassung PV-Anlagen NS (ANA) — 78 Felder, 1 Seite (XFA)
//   swmb-ibn = Inbetriebsetzungsprotokoll EZA (FM) — 101 Felder, 2 Seiten (XFA)
//
// Hinweis: XFA-Formulare — pdf-lib strippt XFA-Daten, nutzt AcroForm-Fallback.
//          Feldnamen haben XFA-Pfade: topmostSubform[0].Page1[0].FieldName[0]
//
// Templates: nb-templates/SW Münchberg/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen } from './geschaeftsregeln';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plz:    process.env.INSTALLER_PLZ     || '04349',
  ort:    process.env.INSTALLER_CITY    || 'Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Münchberg');
const TEMPLATES = {
  'swmb-pv':  path.join(TMPL_DIR, 'ANA', 'Datenerfassung_PV-Anlagen_Niederspannungsnetz.pdf'),
  'swmb-ibn': path.join(TMPL_DIR, 'FM', 'Inbetriebsetzungsprotokoll_Eigenerzeugungsanlagen.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }
function wrKva(p: ProjectData): number | undefined { return p.inverterSpec?.apparentPowerKva ?? wrKw(p); }
function wrModelName(p: ProjectData) {
  if (p.inverterSpec) return { hersteller: 'EcoFlow', typ: p.inverterSpec.model.replace('EcoFlow ', '') };
  const parts = (p.inverter || '').split(/\s+/);
  return { hersteller: parts[0] || '', typ: parts.slice(1).join(' ') || p.inverter || '' };
}

// XFA field name helper
const xfa = (page: string, field: string) => `topmostSubform[0].${page}.${field}`;
const p1 = (field: string) => xfa('Page1[0]', field);
const s1 = (field: string) => xfa('#subform[1]', field);

// ═══════════════════════════════════════════════════════════════════════════
// swmb-pv — Datenerfassung PV-Anlagen NS (1 Seite, 78 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Betreiber (Tex22/Text18..21a), Anlagenstandort, Neuerrichtung,
// Einspeiseart, Module (Anzahl/Hersteller/Typ/kWp), WR (Typ/kW),
// Phasen (einph/dreiph), IBN-Datum
//
export async function fillSWMBPv(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swmb-pv'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ── Betreiber (oberer Block) ──
  // Tex22[0] = Name, Text18[0] = Straße, Text19[0] = PLZ,
  // Tex20[0] = Ort, Text21[0] = Telefon, Text21a[0] = Email
  text(p1('Tex22[0]'), customer);
  text(p1('Text18[0]'), project.address?.line);
  text(p1('Text19[0]'), project.address?.zip);
  text(p1('Tex20[0]'), project.address?.city);
  text(p1('Text21[0]'), project.phone);
  text(p1('Text21a[0]'), project.email);

  // ── Installateur (zweiter Block) ──
  // Tex22[1] = Firma, Text18[1] = Straße, Text19[1] = PLZ,
  // Text21[1] = Telefon, Text21a[1] = Email
  text(p1('Tex22[1]'), VOLTA.name);
  text(p1('Text18[1]'), VOLTA.street);
  text(p1('Text19[1]'), VOLTA.plz);

  // ── Anlagenstandort ──
  // Text26[0] = Standort Straße, Text35[0] = PLZ, Text28[0] = Ort
  text(p1('Text26[0]'), project.address?.line);
  text(p1('Text35[0]'), project.address?.zip);
  text(p1('Text28[0]'), project.address?.city);

  // ── Flurstück etc. ──
  // Text30[0] = Flur, Text31[0] = Gemarkung, Text31a[0] = Flurstück

  // ── Art der Änderung: Neuerrichtung ──
  check(p1('Neuerrichtung[0]'));

  // ── Einspeiseart: Selbstverbrauch (= Überschusseinspeisung) ──
  check(p1('Selbstverbrauch_bis_30_kWp_gemäß_33_EEG[0]'));

  // ── PV-Module (Zeile 1) ──
  // Text5[0] = Anzahl Module, Text6[0] = Hersteller+Typ
  text(p1('Text5[0]'), String(project.moduleCount ?? 1));
  text(p1('Text6[0]'), project.moduleType || '');

  // ── Wechselrichter (Zeile 1) ──
  const wr = wrModelName(project);
  // Text7[0]=Anzahl, Text8[0]=Hersteller, Text9[0]=Typ,
  // Text10[0]=Nennleistung kW, Text11[0]=cos phi
  text(p1('Text7[0]'), String(project.inverterCount ?? 1));
  text(p1('Text8[0]'), wr.hersteller);
  text(p1('Text9[0]'), wr.typ);
  text(p1('Text10[0]'), num(wrKw(project)));

  // ── Gesamtleistung ──
  // Text15[0] = Gesamtleistung PV kWp, Text16[0] = Gesamt WR kW
  text(p1('Text15[0]'), num(project.kwp));
  text(p1('Text16[0]'), num(wrKw(project)));
  text(p1('Text17[0]'), num(wrKva(project)));

  // ── Phasen ──
  if (phasen(project) === 3) check(p1('dreiph_WR[0]'));
  else check(p1('einph_WR[0]'));

  // Inbetriebnahmedatum — wird vor Ort eingetragen

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// swmb-ibn — Inbetriebsetzungsprotokoll EZA (2 Seiten, 101 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Seite 1: Betreiber, Installateur, Prüfungen (ja/nein Checkboxen)
// Seite 2: Anlagendaten, Messwerte, Unterschriften
//
export async function fillSWMBIbn(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swmb-ibn'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };

  // ── Betreiber ──
  text(p1('Tex22[0]'), customer);
  text(p1('Text18[0]'), project.address?.line);
  text(p1('Text19[0]'), project.address?.zip);
  text(p1('Tex20[0]'), project.address?.city);
  text(p1('Text21[0]'), project.phone);
  text(p1('Text21a[0]'), project.email);

  // ── Installateur ──
  text(p1('Tex22[1]'), VOLTA.name);
  text(p1('Text18[1]'), VOLTA.street);
  text(p1('Text19[1]'), VOLTA.plz);
  text(p1('Text21[1]'), '');
  text(p1('Text21a[1]'), '');

  // ── Seite 2: Anlagendaten ──
  // Standort
  text(s1('Text26[0]'), project.address?.line);
  text(s1('Text35[0]'), project.address?.zip);
  text(s1('Text28[0]'), project.address?.city);

  // Anlagendaten
  text(s1('Text29[0]'), num(wrKw(project)));       // Wirkleistung kW
  text(s1('Text32[0]'), num(wrKva(project)));       // Scheinleistung kVA
  text(s1('Text33[0]'), num(project.kwp));           // Modulleistung kWp

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SwmbDocType = 'swmb-pv' | 'swmb-ibn';

const FILLERS: Record<SwmbDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'swmb-pv':  fillSWMBPv,
  'swmb-ibn': fillSWMBIbn,
};
const LABELS: Record<SwmbDocType, string> = {
  'swmb-pv':  'SWMB-Datenerfassung-PV',
  'swmb-ibn': 'SWMB-Inbetriebsetzung',
};

export function swmbDocLabel(type: SwmbDocType): string { return LABELS[type]; }
export async function fillSwmbDoc(type: SwmbDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
