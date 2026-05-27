// TEN (Thüringer Energienetze) — NB-spezifische PDF-Formularfüller.
//
// Drei Formulare:
//   AN005 = Antragstellung EZA + Speicher <= 30 kW  (ANA-Phase)
//   ANS   = Anmeldung Formblatt Strom               (ANA-Phase)
//   AN002 = Inbetriebsetzungsprotokoll <= 30 kW      (FM-Phase)
//
// Templates liegen als PDF in nb-templates/TEN/. Die Feldnamen wurden am
// 2026-05-27 per pdf-lib analysiert und hier hart gemappt.

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen, speicherkopplung, hatNotstrom, naSchutzIntegriert } from './geschaeftsregeln';

// ── Installer (Volta) ──────────────────────────────────────────────────────
const VOLTA = {
  name:  process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Kamenzer Str. 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04347 Leipzig',
  phone:  process.env.INSTALLER_PHONE   || '',
  email:  process.env.INSTALLER_EMAIL   || '',
};

// ── Template paths (relative to project root) ──────────────────────────────
const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'TEN');
const TEMPLATES = {
  an005: path.join(TMPL_DIR, 'ANA', 'AN005_Antragstellung_Erzeugung_und_Speicher_einschl_30kW.pdf'),
  ans:   path.join(TMPL_DIR, 'ANA', 'ANS_Anmeldung_Formblatt_Strom.pdf'),
  an002: path.join(TMPL_DIR, 'FM',  'AN002_Inbetriebsetzungsprotokoll_bis_30kW.pdf'),
};

// ── Helpers ────────────────────────────────────────────────────────────────
function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }

function loadTemplate(key: keyof typeof TEMPLATES): Buffer {
  return fs.readFileSync(TEMPLATES[key]);
}

function splitInverter(inv?: string): { hersteller: string; typ: string } {
  if (!inv) return { hersteller: '', typ: '' };
  const parts = inv.split(/\s+/);
  return { hersteller: parts[0], typ: parts.slice(1).join(' ') || inv };
}

function splitModule(mod?: string): { hersteller: string; typ: string } {
  if (!mod) return { hersteller: '', typ: '' };
  const parts = mod.split(/\s+/);
  return { hersteller: parts[0], typ: parts.slice(1).join(' ') || mod };
}

function splitBattery(bat?: string): { hersteller: string; typ: string } {
  if (!bat) return { hersteller: '', typ: '' };
  const parts = bat.split(/\s+/);
  return { hersteller: parts[0], typ: parts.slice(1).join(' ') || bat };
}

// Module-Watt aus moduleType extrahieren (z.B. "JA Solar JAM54S30 410W" → 410)
function moduleWatt(mod?: string): number | undefined {
  if (!mod) return undefined;
  const m = /(\d{3,4})\s*[Ww](?:p|att)?/.exec(mod);
  return m ? parseInt(m[1], 10) : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// AN005 — Antragstellung Erzeugung und Speicher <= 30 kW
// ═══════════════════════════════════════════════════════════════════════════
export async function fillAN005(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('an005'));
  const form = pdf.getForm();

  const text = (name: string, val?: string) => {
    if (!val) return;
    try { form.getTextField(name).setText(val); } catch { /* field absent */ }
  };
  const check = (name: string) => {
    try { form.getCheckBox(name).check(); } catch { /* absent */ }
  };

  // ── 1. Betreiber / Anlagenbetreiber ──
  text('Vorname Name bzw Firmenname', customer);
  if (project.address) {
    text('Straße Hausnummer', project.address.line);
    text('PLZ Ort', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }

  // ── 2. Anlagenstandort (_2 suffix) — same as Betreiber for residential ──
  if (project.address) {
    text('Straße Hausnummer_2', project.address.line);
    text('PLZ Ort_2', [project.address.zip, project.address.city].filter(Boolean).join(' '));
    text('Vorname Name bzw Firmenname_2', customer);
  }

  // ── 3. Errichter = Volta (_3 suffix) ──
  text('Vorname Name bzw Firmenname_3', VOLTA.name);
  text('Straße Hausnummer_4', VOLTA.street);   // _4 = Errichter Straße (nach _3 Straße=Standort)
  text('PLZ Ort_4', VOLTA.plzOrt);
  text('Telefon_3', VOLTA.phone);
  text('EMail_3', VOLTA.email);

  // ── 4. Anlagenart / Energieart ──
  check('anlagenart');       // Neuanlage
  check('energieart');       // Sonne (Photovoltaik)
  check('niederspannung');   // Niederspannung
  check('einspeisung');      // Überschusseinspeisung

  // Datenblatt-Checkboxen
  check('Datenblatt Erzeugungsanlagen bis einschließlich 30 kW');
  if (project.battery) {
    check('Datenblatt Speicher bis einschließlich 30 kW');
  }

  // ── 5. Module (Erzeugungseinheit Zeile 1) ──
  const mod = splitModule(project.moduleType);
  const watt = moduleWatt(project.moduleType);
  if (watt) {
    text('leistung1', String(watt));                           // Leistung pro Modul in W
    text('anzahl1', String(project.moduleCount));              // Anzahl
    text('gesamtleistung1', num(project.kwp));                 // Gesamtleistung kWp
  }

  // ── 6. Wechselrichter (Zeile 4 = Nennleistung rows) ──
  const inv = splitInverter(project.inverter);
  text('Hersteller', inv.hersteller);
  text('TypModell', inv.typ);
  text('nennleistung4', num(project.inverterKw));
  text('anzahl4', String(project.inverterCount ?? 1));
  const wrGesamt = (project.inverterKw ?? 0) * (project.inverterCount ?? 1);
  text('gesamtleistung4', num(wrGesamt || undefined));

  // Summenfelder
  text('Summe in kW', num(project.inverterKw ?? wrGesamt));
  text('Summe in kWp', num(project.kwp));

  // ── 7. Speicher (falls vorhanden) ──
  if (project.battery) {
    const bat = splitBattery(project.battery);
    text('Hersteller_4', bat.hersteller);
    text('TypModell_4', bat.typ);
    text('Summe in kWh', num(project.batteryKwh));
    // Speicher-kW = Entladeleistung (aus Spec oder Schätzung)
    const speicherKw = project.batterySpec?.maxDischargekW ?? (project.batteryKwh ? Math.min(project.batteryKwh, 5) : undefined);
    text('Summe in kW_2', num(speicherKw));
  }

  // ── 8. Primärenergieträger ──
  text('Verwendete Primärenergieträger z B Sonne Wind Gas', 'Sonne');

  // ── 9. Phasen / NA-Schutz ──
  if (phasen(project) === 3) check('anschluss');  // 3-phasig (Drehstrom)
  if (naSchutzIntegriert(project)) check('Ja_5'); // NA-Schutz ja

  // Inselbetrieb-Checkboxen
  if (!hatNotstrom(project)) {
    check('inselbetrieb1'); // kein Inselbetrieb
  } else {
    check('inselbetrieb2'); // Inselbetrieb möglich
  }

  // Beigefügte Unterlagen
  check('Anmeldung zum Netzanschluss Strom beigefügt bitte');
  check('Übersichtsschaltplan einpolige Darstellung ab Netzanschluss beigefügt inkl Anordnung der');
  check('Einheitenzertifikate nach VDEARN 4105 beigefügt');
  check('Zertifikat für den NASchutz beigefügt');

  try { form.updateFieldAppearances(); } catch { /* on save */ }
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// ANS — Anmeldung Formblatt Strom (Netzanschluss-Anmeldung)
// ═══════════════════════════════════════════════════════════════════════════
export async function fillANS(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('ans'));
  const form = pdf.getForm();

  const text = (name: string, val?: string) => {
    if (!val) return;
    try { form.getTextField(name).setText(val); } catch { /* absent */ }
  };
  const check = (name: string) => {
    try { form.getCheckBox(name).check(); } catch { /* absent */ }
  };
  const dropdown = (name: string, val: string) => {
    try { form.getDropdown(name).select(val); } catch { /* absent/no match */ }
  };

  // ── Anschlussort (Anlagenstandort) ──
  if (project.address) {
    text('Straße und HausNr ggf Anschlussnutzer', project.address.line);
    text('Postleitzahl Ort', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }

  // ── Checkbox: Neuanmeldung ──
  check('anmeldung');
  check('Erzeugungsanlagen');

  // ── Abschnitt 5: Anschlussnutzer ──
  text('Name Vorname bzw Firmenname', customer);
  if (project.address) {
    text('Straße und HausNr', project.address.line);
    text('Postleitzahl Ort_3', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }

  // ── Abschnitt 5: Betreiber (= Anschlussnutzer bei Residential) ──
  text('Name Vorname bzw Firmenname_2', customer);
  if (project.address) {
    text('Straße und HausNr_2', project.address.line);
    text('Postleitzahl Ort_4', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }

  // ── Abschnitt 7: Errichter = Volta ──
  text('Firmenname', VOLTA.name);
  text('Straße und HausNr_3', VOLTA.street);
  text('Postleitzahl Ort_5', VOLTA.plzOrt);
  text('Telefon Fax EMail_3', [VOLTA.phone, VOLTA.email].filter(Boolean).join(' / '));

  // ── Geräteeintrag Zeile 1 (4_*) = Wechselrichter + EZA ──
  // 4_a = Verwendungszweck-Dropdown: b) = Erzeugungsanlagen
  dropdown('4_a', 'b)');
  // 4_b = Hersteller, 4_c = Typ
  const inv = splitInverter(project.inverter);
  text('4_b', inv.hersteller);
  text('4_c', inv.typ);
  // 4_d = Anzahl
  text('4_d', String(project.inverterCount ?? 1));
  // 4_e = Nennleistung kW
  text('4_e', num(project.inverterKw));
  // 4_g = kWp Erzeugung
  text('4_g', num(project.kwp));

  // ── Geräteeintrag Zeile 2 (41_*) = Speicher (falls vorhanden) ──
  if (project.battery) {
    dropdown('41_a', 'b)');
    const bat = splitBattery(project.battery);
    text('41_b', bat.hersteller);
    text('41_c', bat.typ);
    text('41_d', '1');
    const speicherKw = project.batterySpec?.maxDischargekW ?? (project.batteryKwh ? Math.min(project.batteryKwh, 5) : undefined);
    text('41_e', num(speicherKw));
    text('41_k', num(project.batteryKwh));
  }

  // ── Steuerbarkeit § 14a ──
  check('Steuerbarkeit § 14a');

  try { form.updateFieldAppearances(); } catch { /* on save */ }
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// AN002 — Inbetriebsetzungsprotokoll bis 30 kW
// ═══════════════════════════════════════════════════════════════════════════
export async function fillAN002(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('an002'));
  const form = pdf.getForm();

  const text = (name: string, val?: string) => {
    if (!val) return;
    try { form.getTextField(name).setText(val); } catch { /* absent */ }
  };
  const check = (name: string) => {
    try { form.getCheckBox(name).check(); } catch { /* absent */ }
  };

  // ── Betreiber ──
  text('Vorname Name bzw Firmenname', customer);
  if (project.address) {
    text('Straße Hausnummer', project.address.line);
    text('PLZ Ort', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }

  // ── Anlagenstandort (_2 suffix) ──
  if (project.address) {
    text('Straße Hausnummer_2', project.address.line);
    text('PLZ Ort_2', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }

  // ── Errichter = Volta (_3 suffix) ──
  text('Vorname Name bzw Firmenname_2', VOLTA.name);
  text('Straße Hausnummer_3', VOLTA.street);
  text('PLZ Ort_3', VOLTA.plzOrt);
  text('Telefon_2', VOLTA.phone);
  text('EMail_2', VOLTA.email);

  // ── Technische Daten ──
  // kVA = Scheinleistung des WR
  const kva = project.inverterSpec?.apparentPowerKva ?? project.inverterKw;
  text('kVA', num(kva));
  text('kW', num(project.inverterKw));
  text('kWp', num(project.kwp));

  if (project.battery) {
    text('kWh', num(project.batteryKwh));
    const speicherKva = project.batterySpec?.maxDischargekW ?? (project.batteryKwh ? Math.min(project.batteryKwh, 5) : undefined);
    text('kVA_2', num(speicherKva));
    text('kW_2', num(speicherKva));
  }

  // ── Checkboxen ──
  check('Übereinstimmung des ausgefüllten Datenblattes Datenerfassungsblatt oder EinspeiserPortal mit dem');
  if (naSchutzIntegriert(project)) {
    check('Integrierter NASchutz vorhanden');
    check('funktionstest'); // Funktionstest NA-Schutz durchgeführt
  }

  try { form.updateFieldAppearances(); } catch { /* on save */ }
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience: alle TEN-Dokumente auf einmal generieren
// ═══════════════════════════════════════════════════════════════════════════
export type TenDocType = 'an005' | 'ans' | 'an002';

const FILLERS: Record<TenDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  an005: fillAN005,
  ans:   fillANS,
  an002: fillAN002,
};

const LABELS: Record<TenDocType, string> = {
  an005: 'TEN-Antragstellung-EZA-Speicher',
  ans:   'TEN-Anmeldung-Formblatt-Strom',
  an002: 'TEN-Inbetriebsetzungsprotokoll',
};

export function tenDocLabel(type: TenDocType): string { return LABELS[type]; }

export async function fillTenDoc(type: TenDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}

/** Which TEN documents are applicable for a project. */
export function tenDocsForProject(project: ProjectData): TenDocType[] {
  // ANA phase: AN005 (Antragstellung) + ANS (Anmeldung Strom) — always
  // FM phase:  AN002 (IBN-Protokoll) — always (filled partially, completed after IBN)
  return ['an005', 'ans', 'an002'];
}
