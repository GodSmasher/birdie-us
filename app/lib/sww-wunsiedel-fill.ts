// SWW Wunsiedel — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   sww-ibn = Inbetriebsetzungsprotokoll für EZA am NS-Netz (FM) — 68 Felder
//
// Templates: nb-templates/SWW Wunsiedel/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plz:    process.env.INSTALLER_PLZ     || '04349',
  ort:    process.env.INSTALLER_CITY    || 'Leipzig',
  phone:  process.env.INSTALLER_PHONE   || '',
  email:  process.env.INSTALLER_EMAIL   || '',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SWW Wunsiedel');
const TEMPLATES = {
  'sww-ibn': path.join(TMPL_DIR, 'FM', 'inbetriebsetzungsprotokoll_fuer_erzeugungsanlagen_am_ns-netz-2026-komprimiert.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }
function wrKva(p: ProjectData): number | undefined { return p.inverterSpec?.apparentPowerKva ?? wrKw(p); }

// ═══════════════════════════════════════════════════════════════════════════
// sww-ibn — Inbetriebsetzungsprotokoll EZA NS (2 Seiten, 68 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Seite 1: Standort, Betreiber (links+rechts), Errichter, Energieträger, Leistung
// Seite 2: Prüfungen, Zähler, Unterschriften (viel vor Ort auszufüllen)
//
export async function fillSWWIbn(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('sww-ibn'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ── Standort der Anlage (oberer Block) ──
  text('Straße und HausNr', project.address?.line);
  text('PLZ', project.address?.zip);
  text('Ort', project.address?.city);

  // ── Anlagenbetreiber (linke Spalte) ──
  text('Name Vorname bzw Firmenname', customer);
  text('Straße und HausNr_2', project.address?.line);
  text('Postleitzahl', project.address?.zip);
  text('Ort_2', project.address?.city);
  text('Telefon', project.phone);
  text('EMail', project.email);

  // ── Anlagenbetreiber (rechte Spalte) — gleiche Daten ──
  text('Name Vorname bzw Firmenname_2', customer);
  text('Straße und HausNr_3', project.address?.line);
  text('Postleitzahl_2', project.address?.zip);
  text('Ort_3', project.address?.city);

  // ── Errichter = Volta ──
  text('Firmenname', VOLTA.name);
  text('Name Vorname', '');                            // Ansprechpartner (leer)
  text('Straße und HausNr_4', VOLTA.street);
  text('PLZ_2', VOLTA.plz);
  text('Ort_4', VOLTA.ort);
  text('Telefon_3', VOLTA.phone);
  text('EMail_3', VOLTA.email);

  // ── Energieträger ──
  check('Sonne');

  // ── Leistungsdaten ──
  text('kW', num(wrKw(project)));                      // Wirkleistung kW
  text('kVA', num(wrKva(project)));                    // Scheinleistung kVA

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SwwDocType = 'sww-ibn';

const FILLERS: Record<SwwDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'sww-ibn': fillSWWIbn,
};
const LABELS: Record<SwwDocType, string> = {
  'sww-ibn': 'SWW-Inbetriebsetzungsprotokoll',
};

export function swwDocLabel(type: SwwDocType): string { return LABELS[type]; }
export async function fillSwwDoc(type: SwwDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
