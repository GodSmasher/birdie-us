// Greizer Energienetze — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   gre-ana = Anmeldung Netzanschluss Strom (WPA)    — 166 Felder, 4 Seiten
//   gre-wp  = Datenblatt Elektro-Wärmepumpen (WPA)   — 146 Felder, 2 Seiten
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
  'gre-ana': path.join(TMPL_DIR, 'WPA', '2025-ana.pdf'),
  'gre-wp':  path.join(TMPL_DIR, 'WPA', 'elektro-waermepumpen-und-waermespeicheranlagen.pdf'),
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
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type GreDocType = 'gre-ana' | 'gre-wp';

const FILLERS: Record<GreDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'gre-ana': fillGREAna,
  'gre-wp':  fillGREWp,
};
const LABELS: Record<GreDocType, string> = {
  'gre-ana': 'GRE-Anmeldung-Strom',
  'gre-wp':  'GRE-Datenblatt-WP',
};

export function greDocLabel(type: GreDocType): string { return LABELS[type]; }
export async function fillGreDoc(type: GreDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
