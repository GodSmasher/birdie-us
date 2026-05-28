// SW Eilenburg — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   sei-ana = Anmeldung Strom (ANA)     — 210 Felder, 2 Seiten
//   sei-wp  = Anmeldung Strom (WP)      — 210 Felder, 2 Seiten (gleiche Felder)
//
// Hinweis: Generische Feldnamen (Auswahl 1-38, Text_1-90).
//          Mapping per Widget-Positionsanalyse:
//          Seite 1 oben: 2 Adressblöcke (Betreiber + Standort)
//          Seite 1 unten: Zähler/Anlagen-Tabelle
//          Seite 2: weitere Tabelle + Errichter + Unterschriften
//          DB_EEA, DB_WPA, IB_Erkl, Erkl_VZ = flat PDFs (0 Felder)
//
// Templates: nb-templates/SW Eilenburg/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Eilenburg');
const TEMPLATES = {
  'sei-ana': path.join(TMPL_DIR, 'ANA', 'ANA_SE_2021-01.pdf'),
  'sei-wp':  path.join(TMPL_DIR, 'WP', 'ANA_SE_2021-01.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }

// ═══════════════════════════════════════════════════════════════════════════
// sei-ana — Anmeldung Strom (2 Seiten, 210 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Position-Mapping der Textfelder (Seite 1, y absteigend):
//
//   Text_1  (y=699, full)   = Anlagenbezeichnung / Objekt
//   Text_2  (y=673, links)  = Betreiber Name
//   Text_3  (y=673, rechts) = Geburtsdatum / Register
//   Text_4  (y=650, links)  = Straße
//   Text_5  (y=649, mitte)  = PLZ
//   Text_6  (y=649, rechts) = Ort
//   Text_7  (y=624, links)  = Telefon
//   Text_8  (y=625, mitte)  = Fax
//   Text_9  (y=625, rechts) = Email
//
//   Text_10 (y=589, links)  = Eigentümer Straße
//   Text_11 (y=590, mitte)  = Eigentümer PLZ
//   Text_12 (y=590, rechts) = Eigentümer Ort
//   Text_13 (y=565, links)  = Eigentümer Tel
//   Text_14 (y=565, rechts) = Eigentümer Email
//
//   Text_15 (y=499, full)   = Standort / Anlagenanschrift
//   Text_16 (y=475, links)  = Standort Straße
//   Text_17 (y=475, rechts) = Standort PLZ Ort
//   Text_18 (y=451, links)  = Standort Gemarkung
//   ...
//
// Seite 2 unterer Teil:
//   Text_75 (y=321) = Errichter Firma Zeile
//   Text_76 (y=300) = Errichter Name
//   Text_77 (y=300) = Errichter Ort
//   Text_78 (y=300) = Errichter PLZ
//   Text_82 (y=168) = Unterschrift Errichter Name
//   Text_88 (y=168) = Unterschrift Betreiber Name
//
export async function fillSEIAna(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('sei-ana'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ═══ Betreiber / Anschlussnehmer (Seite 1, oberer Block) ═══
  text('Text_1', project.name || customer + ' PV');
  text('Text_2', customer);
  text('Text_4', project.address?.line);
  text('Text_5', project.address?.zip);
  text('Text_6', project.address?.city);
  text('Text_7', project.phone);
  text('Text_9', project.email);

  // ═══ Grundstückseigentümer (= Betreiber bei Privat) ═══
  text('Text_10', project.address?.line);
  text('Text_11', project.address?.zip);
  text('Text_12', project.address?.city);
  text('Text_13', project.phone);
  text('Text_14', project.email);

  // ═══ Anlagenstandort ═══
  text('Text_15', project.address?.line + ', ' + [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('Text_16', project.address?.line);
  text('Text_17', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ═══ Anmeldungsart: Neuanschluss ═══
  check('Auswahl 1');                                    // Neuanschluss (erstes Kästchen)

  // ═══ Errichter (Seite 2, unterer Block) ═══
  text('Text_75', VOLTA.name);
  text('Text_76', VOLTA.name);
  text('Text_78', VOLTA.plzOrt);

  // ═══ Unterschriften-Block ═══
  text('Text_82', VOLTA.name);
  text('Text_88', customer);

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// sei-wp — Anmeldung Strom WP-Variante (gleiche 210 Felder, WP-Template)
// ═══════════════════════════════════════════════════════════════════════════
export async function fillSEIWp(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('sei-wp'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ═══ Betreiber / Anschlussnehmer ═══
  text('Text_1', customer + ' WP');
  text('Text_2', customer);
  text('Text_4', project.address?.line);
  text('Text_5', project.address?.zip);
  text('Text_6', project.address?.city);
  text('Text_7', project.phone);
  text('Text_9', project.email);

  // ═══ Grundstückseigentümer (= Betreiber) ═══
  text('Text_10', project.address?.line);
  text('Text_11', project.address?.zip);
  text('Text_12', project.address?.city);
  text('Text_13', project.phone);
  text('Text_14', project.email);

  // ═══ Anlagenstandort ═══
  text('Text_15', project.address?.line + ', ' + [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('Text_16', project.address?.line);
  text('Text_17', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ═══ Anmeldungsart: Neuanschluss ═══
  check('Auswahl 1');

  // ═══ Errichter ═══
  text('Text_75', VOLTA.name);
  text('Text_76', VOLTA.name);
  text('Text_78', VOLTA.plzOrt);

  // ═══ Unterschriften ═══
  text('Text_82', VOLTA.name);
  text('Text_88', customer);

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SeiDocType = 'sei-ana' | 'sei-wp';

const FILLERS: Record<SeiDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'sei-ana': fillSEIAna,
  'sei-wp':  fillSEIWp,
};
const LABELS: Record<SeiDocType, string> = {
  'sei-ana': 'SEI-Anmeldung-Strom',
  'sei-wp':  'SEI-Anmeldung-WP',
};

export function seiDocLabel(type: SeiDocType): string { return LABELS[type]; }
export async function fillSeiDoc(type: SeiDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
