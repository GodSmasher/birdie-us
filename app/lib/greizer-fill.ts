// Greizer Energienetze — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   gre-ana  = Anmeldung Netzanschluss Strom (WPA)    — 166 Felder, 4 Seiten
//   gre-wp   = Datenblatt Elektro-Wärmepumpen (WPA)   — 146 Felder, 2 Seiten
//   gre-14a  = Anmeldung steuerbare VE §14a (WPA)     — 31 Felder, 1 Seite
//
// Templates: nb-templates/Greizer Energienetze/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen } from './geschaeftsregeln';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
  phone:  process.env.INSTALLER_PHONE   || '',
  email:  process.env.INSTALLER_EMAIL   || '',
  ausweis: process.env.INSTALLER_AUSWEIS || '',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'Greizer Energienetze');
const TEMPLATES = {
  'gre-ana':  path.join(TMPL_DIR, 'WPA', '2025-ana.pdf'),
  'gre-wp':   path.join(TMPL_DIR, 'WPA', 'elektro-waermepumpen-und-waermespeicheranlagen.pdf'),
  'gre-14a':  path.join(TMPL_DIR, 'WPA', 'anmeldung-steuerbare-verbrauchseinrichtungen-14a.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }

// ═══════════════════════════════════════════════════════════════════════════
// gre-ana — Anmeldung Netzanschluss Strom (4 Seiten, 166 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Allgemeines Anmeldeformular für alle Anschlussarten (Haushalt, EEA,
// WPA, Speicher, Ladeeinrichtung, §14a etc.).
// Seite 1: Standort, Anschlussart
// Seite 2: Anschlussnutzer/Eigentümer, Errichter
// Seite 3-4: Zähler-Tabelle (vor Ort)
//
export async function fillGREAna(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('gre-ana'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ── Standort der Anlage ──
  text('Straße und Hausnummer ggf Anschlussnutzer', project.address?.line);
  text('Postleitzahl Ort', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ── Art der Anmeldung ──
  check('Neuanschluss');

  // ── PV? ──
  if (project.kwp > 0) {
    check('Erzeugungsanlagen einschl steckerfertige');
    text('Anschlussleistung kW', num(wrKw(project)));
  }

  // ── Steuerbare VE §14a (Speicher/WP) ──
  if (project.battery) {
    check('Steuerbarkeit  14a');
    check('Steuerbare Verbrauchseinrichtung  14a');
    check('modul1');
  }

  // ── Anschlussnutzer (Betreiber) ──
  text('Name Vorname bzw Firmenname', customer);
  text('Straße und Hausnummer', project.address?.line);
  text('Postleitzahl Ort-0', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('Telefon Fax EMail', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Grundstückseigentümer (= Betreiber bei Privat) ──
  text('Name Vorname bzw Firmenname-0', customer);
  text('Straße und Hausnummer-0', project.address?.line);
  text('Postleitzahl Ort-1', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('Telefon Fax EMail-0', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Errichter = Volta ──
  text('Firmenname', VOLTA.name);
  text('Eingetragen bei NB', 'ja');
  text('Straße und Hausnummer-1', VOLTA.street);
  text('Postleitzahl Ort-2', VOLTA.plzOrt);
  text('Telefon Fax EMail-1', [VOLTA.phone, VOLTA.email].filter(Boolean).join(' / '));
  text('Ausweisnummer', VOLTA.ausweis);

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// gre-wp — Elektro-Wärmepumpen und Wärmespeicheranlagen (2 Seiten, 146 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Wunderbar benannte Felder! Standort, WP-Typ, Leistungsdaten,
// Betriebsweise, Wärmequelle, Objektangaben.
// WP-spezifische technische Daten bleiben leer (nicht in ProjectData).
//
export async function fillGREWp(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('gre-wp'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ── Standort (Vorderseite) ──
  text('1. Straße und Hausnummer', project.address?.line);
  text('1. Postleitzahl, Ort', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ── Ansprechpartner ──
  text('1. Ansprechpartner (bei Rückfragen)', customer);
  text('1. Straße und Hausnummer (Ansprechpartner)', project.address?.line);
  text('1. Postleitzahl, Ort (Ansprechpartner)', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('1. Telefon', project.phone);

  // ── Standort (Rückseite — gleiche Daten) ──
  text('(Rückseite) 1. Straße und Hausnummer', project.address?.line);
  text('(Rückseite) 1. Postleitzahl, Ort', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('(Rückseite) 1. Ansprechpartner bei Rückfragen', customer);
  text('(Rückseite) 1. Straße und Hausnummer (Ansprechpartner)', project.address?.line);
  text('(Rückseite) 1. Postleitzahl, Ort (Ansprechpartner)', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('(Rückseite) 1. Telefon', project.phone);

  // ── Objektangaben (Vorderseite) ──
  check('5. Angaben zum Objekt (Einfamilienhaus - Ankreuzfeld)');

  // ── Objektangaben (Rückseite) ──
  check('(Rückseite) 3. Angaben zum Objekt (Einfamilienhaus - Ankreuzfeld)');

  // WP-spezifische technische Daten (Leistungsaufnahme, Heizleistung,
  // Betriebsweise, Wärmequelle) bleiben leer — nicht in ProjectData.
  // Techniker füllt vor Ort aus.

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// gre-14a — Anmeldung steuerbare VE §14a (1 Seite, 31 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Position-Mapping (Widget-Koordinaten, y absteigend):
//
//   Betreiber-Block:
//     TF1_5  (y=660, x=50)  = Name/Firma
//     TF1_2  (y=660, x=330) = Geburtsdatum/Registernr
//     TF1    (y=631, x=50)  = Straße
//     TF1_3  (y=631, x=330) = PLZ
//     TF1_4  (y=631, x=394) = Ort
//     TF1_6  (y=587, x=50)  = Telefon
//     TF1_8  (y=587, x=330) = Email
//     TF1_7  (y=559, x=50)  = Ansprechpartner / 2. Zeile
//     TF1_9  (y=559, x=330) = Fax
//
//   Art der Anlage (Checkboxen y=527-491):
//     Ankreuzfeld6  (y=509, x=122) = Wärmepumpe (links)
//     Ankreuzfeld50 (y=509, x=283) = ?
//     Ankreuzfeld7  (y=527, x=284) = ?
//     Ankreuzfeld8  (y=491, x=122) = Speicher (links)
//     Ankreuzfeld9  (y=491, x=283) = ?
//
//   Standort (y=470-413):
//     TF1_10 (y=470, x=50)  = Straße + HNr
//     TF1_11 (y=470, x=280) = PLZ Ort
//     TF1_16 (y=441, x=51)  = Gemarkung
//     TF1_17 (y=441, x=279) = Flurstück
//     TF1_14 (y=413, x=51)  = Zähler-Nr
//     TF1_15 (y=413, x=279) = Zählpunkt
//
//   Anmeldungsart (y=363):
//     Ankreuzfeld10 (y=363, x=54)  = Neuanmeldung
//     Ankreuzfeld20 (y=363, x=152) = Leistungserhöhung
//
//   Modul (y=325):
//     Ankreuzfeld11 (y=325, x=51)  = Modul 1
//     Ankreuzfeld12 (y=325, x=317) = Modul 2
//
//   Netzanschluss (y=301):
//     Markierfeld 2_2 (y=301, x=51)  = netzorientiert
//     Markierfeld 2   (y=300, x=317) = marktorientiert
//
//   TF1_13 (y=277) = Bemerkung
//   TF1_12 (y=155) = Ort, Datum
//
export async function fillGRE14a(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('gre-14a'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ═══ Betreiber ═══
  text('Textfeld 1_5', customer);
  text('Textfeld 1', project.address?.line);
  text('Textfeld 1_3', project.address?.zip);
  text('Textfeld 1_4', project.address?.city);
  text('Textfeld 1_6', project.phone);
  text('Textfeld 1_8', project.email);

  // ═══ Standort ═══
  text('Textfeld 1_10', project.address?.line);
  text('Textfeld 1_11', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ═══ Art der Anlage: Wärmepumpe ═══
  check('Ankreuzfeld6');

  // ═══ Speicher (falls vorhanden) ═══
  if (project.battery) {
    check('Ankreuzfeld8');
  }

  // ═══ Neuanmeldung ═══
  check('Ankreuzfeld10');

  // ═══ Modul 1 (netzorientierte Steuerung) ═══
  check('Ankreuzfeld11');
  check('Markierfeld 2_2');

  // ═══ Ort, Datum ═══
  text('Textfeld 1_12', 'Leipzig');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type GreDocType = 'gre-ana' | 'gre-wp' | 'gre-14a';

const FILLERS: Record<GreDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'gre-ana':  fillGREAna,
  'gre-wp':   fillGREWp,
  'gre-14a':  fillGRE14a,
};
const LABELS: Record<GreDocType, string> = {
  'gre-ana':  'GRE-Anmeldung-Strom',
  'gre-wp':   'GRE-Datenblatt-WP',
  'gre-14a':  'GRE-Anmeldung-14a',
};

export function greDocLabel(type: GreDocType): string { return LABELS[type]; }
export async function fillGreDoc(type: GreDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
