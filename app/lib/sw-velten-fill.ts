// SW Velten — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   swv-fm = Fertigmeldung Strom (FM) — 125 Felder, ~2 Seiten
//
// Hinweis: ANA-Formulare (E.1, E.2, E.3, E.8) haben korrupte
//          Objektreferenzen und können von pdf-lib nicht geladen werden.
//
// Templates: nb-templates/SW Velten/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
  ausweis: process.env.INSTALLER_AUSWEIS || '',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Velten');
const TEMPLATES = {
  'swv-fm': path.join(TMPL_DIR, 'FM', 'Fertigmeldung_-_Strom.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }

// ═══════════════════════════════════════════════════════════════════════════
// swv-fm — Fertigmeldung Strom (125 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Gut benannte Textfelder: Standort, Anschlussnutzer, Eigentümer,
// Errichter, Leistungsangaben nach Kategorie, Zähler.
// Checkboxen sind generisch (Check Box36-104).
//
export async function fillSWVFm(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swv-fm'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };

  // ── Standort ──
  text('Angaben zum Anschlussobjekt', project.address?.city || '');
  text('Straße und HausNr', project.address?.line);
  text('Postleitzahl', project.address?.zip);

  // ── Leistungsangaben ──
  if (project.kwp > 0) {
    text('EAnlagen  KennzeichnungsNr', 'PV ' + num(project.kwp) + ' kWp');
  }
  if (project.battery) {
    text('Speichersystem', project.battery);
  }

  // ── Anschlussnutzer (links) ──
  text('Name Vorname bzw Firmenname', customer);
  text('Straße und HausNr_2', project.address?.line);
  text('Postleitzahl_2', project.address?.zip);
  text('Telefon Fax EMail', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Anschlussnehmer (rechts, = Betreiber bei Privat) ──
  text('Name Vorname bzw Firmenname_2', customer);
  text('Straße und HausNr_3', project.address?.line);
  text('Postleitzahl_3', project.address?.zip);
  text('Telefon Fax EMail_2', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Errichter = Volta ──
  text('Name der eingetragenen verantwortlichen Elektrofachkraft 1', VOLTA.name);
  text('Ausweisnummer', VOLTA.ausweis);

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SwvDocType = 'swv-fm';

const FILLERS: Record<SwvDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'swv-fm': fillSWVFm,
};
const LABELS: Record<SwvDocType, string> = {
  'swv-fm': 'SWV-Fertigmeldung',
};

export function swvDocLabel(type: SwvDocType): string { return LABELS[type]; }
export async function fillSwvDoc(type: SwvDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
