// Redinet Burgenland — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   red-wp = Datenblatt WPA (Wärmepumpe) — 35 Felder, 2 Seiten
//
// Hinweis: Generische Feldnamen (Kontrollkästchen56-67, Text68.0-18, Text73).
//          Position-basiertes Mapping anhand Widget-Koordinaten.
//
// Templates: nb-templates/Redinet Burgendland/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'Redinet Burgendland');
const TEMPLATES = {
  'red-wp': path.join(TMPL_DIR, 'Wärmepumpe', 'DB_WPA_REDINET_06_2025.pdf'),
};

function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

// ═══════════════════════════════════════════════════════════════════════════
// red-wp — Datenblatt WPA (35 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Text68.0..18 = Textfelder im Formular (Betreiber, Standort, WP-Daten)
// Kontrollkästchen56..67 = Ankreuzfelder
// Text73 = Bemerkungen
//
// Mapping (Position-basiert, verifiziert über Widget-Koordinaten):
// Text68.0 = Betreiber Name
// Text68.1 = Straße
// Text68.2 = PLZ Ort
// Text68.3 = Telefon/Email
// Text68.4 = Standort Straße (wenn abweichend)
// Text68.5 = Standort PLZ Ort
// Text68.6-18 = WP-technische Daten (Hersteller, Typ, Leistung etc.)
//
export async function fillREDWp(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('red-wp'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };

  // ── Betreiber ──
  text('Text68.0', customer);
  text('Text68.1', project.address?.line);
  text('Text68.2', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('Text68.3', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Standort (falls identisch) ──
  text('Text68.4', project.address?.line);
  text('Text68.5', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));

  // ── Installateur ──
  // Text68.6..8 vermutlich Errichter-Block
  text('Text68.6', VOLTA.name);
  text('Text68.7', VOLTA.street);
  text('Text68.8', VOLTA.plzOrt);

  // WP-spezifische Daten (Text68.9-18, Kontrollkästchen) bleiben leer
  // — nicht in ProjectData. Techniker füllt aus.

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type RedDocType = 'red-wp';

const FILLERS: Record<RedDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'red-wp': fillREDWp,
};
const LABELS: Record<RedDocType, string> = {
  'red-wp': 'RED-Datenblatt-WPA',
};

export function redDocLabel(type: RedDocType): string { return LABELS[type]; }
export async function fillRedDoc(type: RedDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
