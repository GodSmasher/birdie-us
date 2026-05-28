// Zwickau — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   zw-wp = Datenblatt Wärmepumpe (WP)  — 23 Felder, 3 Seiten
//
// Hinweis: Anmeldung_zum_Netzanschluss_Strom.pdf hat 0 Felder (Flat-PDF).
//
// Templates: nb-templates/Zwickau/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'Zwickau');
const TEMPLATES = {
  'zw-wp': path.join(TMPL_DIR, 'WP', 'Datenblatt_Waermepumpe.pdf'),
};

function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

// ═══════════════════════════════════════════════════════════════════════════
// zw-wp — Datenblatt Wärmepumpe (23 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Schön benannte Felder: betreiber_NameFirma, strasse_HNr, plzOrt,
// technDaten_*, sVE_Modul1/2/3
//
export async function fillZWWp(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('zw-wp'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ── Betreiber / Standort ──
  text('betreiber_NameFirma', customer);
  text('strasse_HNr', project.address?.line);
  text('plzOrt', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('gemarkungFlurstueck', '');

  // ── Steuerbare VE §14a ──
  check('(check)_sVE-Ja');
  check('(check)_sVE_Modul1');

  // WP-spezifische Daten (technDaten_Nennleistg-Warmwasser,
  // technDaten_Nennleistg-Raumheizg, technDaten_maxAnlaufstrom,
  // technDaten_Gesamtleistg, Kompressor-Tabelle) fehlen in ProjectData.
  // Werden vom Techniker vor Ort eingetragen.

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type ZwDocType = 'zw-wp';

const FILLERS: Record<ZwDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'zw-wp': fillZWWp,
};
const LABELS: Record<ZwDocType, string> = {
  'zw-wp': 'ZW-Datenblatt-WP',
};

export function zwDocLabel(type: ZwDocType): string { return LABELS[type]; }
export async function fillZwDoc(type: ZwDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
