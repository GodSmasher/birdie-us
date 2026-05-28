// SW Merseburg — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   swm-ana    = ANA Strom (Anmeldung Netzanschluss)             — 83 Felder, 1 Seite
//   swm-db     = DB_EEA (Datenblatt Erzeugungsanlagen)           — 369 Felder, 10 Seiten
//   swm-iba    = IBA Strom (Inbetriebsetzungs-/Änderungsanzeige) — 90 Felder, 1 Seite
//
// Templates: nb-templates/SW Merseburg/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { hatNotstrom, phasen } from './geschaeftsregeln';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plz:    process.env.INSTALLER_PLZ     || '04349',
  ort:    process.env.INSTALLER_CITY    || 'Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Merseburg');
const TEMPLATES = {
  'swm-ana': path.join(TMPL_DIR, 'ANA', 'ANA Strom_SWM_03.2026.pdf'),
  'swm-db':  path.join(TMPL_DIR, 'ANA', 'DB_EEA_SG-SAS_02.2026.pdf'),
  'swm-iba': path.join(TMPL_DIR, 'FM-IBN', 'IBA Strom SWM_02-2026.pdf'),
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

// ═══════════════════════════════════════════════════════════════════════════
// swm-ana — ANA Strom (Anmeldung Netzanschluss, 1 Seite, 83 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Dropdowns: Art Anlage 1..7 (HH/GW/EEA/SP/WPA etc.)
// Tabelle: Bezug/Einspeisung/Endausbau je Anlage
// Checkboxen: neuer NA, Änderung NA, Rückbau NA
// Textfelder: Text1..Text7 (Kundendaten)
//
export async function fillSWMAna(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swm-ana'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };
  const dropdown = (n: string, v: string) => { try { form.getDropdown(n).select(v); } catch {} };

  // ── Neuanlage ──
  check('neuer NA');

  // ── Anlage 1 = EEA (Erzeugungsanlage = PV) ──
  dropdown('Art Anlage 1', 'EEA');
  text('Art1 Endausbau', num(project.kwp));
  text('Einspeisung1', num(wrKw(project)));

  // ── Anlage 2 = SP (Speicher), falls vorhanden ──
  if (project.battery) {
    dropdown('Art Anlage 2', 'SP');
    text('Art2 Endausbau', project.batterySpec ? num(project.batterySpec.capacityKwh) : undefined);
  }

  // ── Kundendaten (Text1..Text7 — Positionsmapping aus PDF) ──
  // Text1 = Kundenname, Text2 = Installationsfirma, Text3-7 = Adresse/Kontakt
  text('Text1', customer);
  text('Text2', VOLTA.name);
  text('Text3', project.address?.line);
  text('Text4', project.address?.zip);
  text('Text5', project.address?.city);
  text('Text6', project.phone);
  text('Text7', project.email);

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// swm-db — DB_EEA (Datenblatt Erzeugungsanlagen, 10 Seiten, 369 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// VDE-AR-N 4105 konformes Datenblatt, umfangreich:
// Anmeldungsart, Standort, EEG-Paragraphen, Energieträger, Module,
// Wechselrichter, Speicher, Leistung, Inselbetrieb, Vermarktungsform
//
export async function fillSWMDb(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swm-db'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ═══ Anmeldungsart ═══
  check('Anmeldung zum Netzanschluss Strom  Anschlussän');
  check('Neuanlage');

  // ═══ Standort ═══
  text('Straße Hausnummer', project.address?.line);
  text('2', project.address?.zip);
  text('2_2', project.address?.city);
  text('Anzahl baugleicher Anlagen', '1');
  text('bzw des Anlagenparks 1', project.name || customer + ' PV');

  // ═══ Energieträger ═══
  check('Photovoltaik');

  // ═══ Vermarktungsform ═══
  check('Überschusseinspeisung Eigenversorgung');

  // ═══ PV-Module (Tabelle Zeile 1) ═══
  // PVModule 1 = Hersteller+Typ, PVModule 2 = Leistung
  if (project.moduleType) text('PVModule 1', project.moduleType);
  text('PVModule 2', num(project.kwp));
  text('Generatoren', String(project.moduleCount ?? 1));

  // ═══ Wechselrichter ═══
  const wr = wrModelName(project);
  text('Wechselrichter 1', [wr.hersteller, wr.typ].join(' '));
  text('Wechselrichter 2', num(wrKw(project)));

  // ═══ Leistungsdaten ═══
  text('max Leistung kW', num(wrKw(project)));
  text('eingespeiste Strom', project.annualKwh ? String(project.annualKwh) : undefined);
  text('Eigenversorgungs', project.annualKwh ? String(project.annualKwh) : undefined);

  // ═══ Phasen ═══
  if (phasen(project) === 3) check('dreiphasig');
  else if (phasen(project) === 1) check('einphasig');

  // ═══ Generatortyp ═══
  check('Umrichter');                                    // selbstgeführter Wechselrichter

  // ═══ Inselbetrieb / Notstrom ═══
  if (hatNotstrom(project)) {
    check('Notstrom <= 100 ms');
  }

  // ═══ NA-Schutz ═══
  text('Anzahl NA Schutz', '1');

  // ═══ Speicher ═══
  if (project.battery) {
    text('1_17 - Speicher', project.battery);
    text('Anzahl Speicher', String(project.batteryModuleCount ?? 1));
    check('Speicher mit Lieferung Netz und Bezug aus Netz');
    check('Ladung aus Netz ja');
  }

  // ═══ EEG-Vergütung: §48(1) Nr.1 Gebäude-PV ═══
  check('48 1 Nr 1 EEG');

  // ═══ Gebäude ═══
  check('Errichtung ausschließlich');                    // falls vorhanden — Errichtung auf Gebäude
  check('auf Gebäude');

  // ═══ Vermarktung: Marktprämie ═══
  check('Marktprämie');

  // ═══ Betreiber & Errichter ═══
  text('Wer ist der Betreiber', customer);
  text('Wer ist der Errichter', VOLTA.name);
  text('Erklärung des Anlagenbetreiber', customer);
  text('Erklärung des Anlagenerrichters', VOLTA.name);
  check('Bestätigung Anlagenerrichter');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// swm-iba — IBA Strom (Inbetriebsetzungsanzeige, 1 Seite, 90 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Zähler, Leistungsdaten, Anschlussnehmer, Eigentümer
//
export async function fillSWMIba(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swm-iba'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ── Art: Neuanlage ──
  check('Neu');

  // ── Anschlussnehmer/Kunde ──
  text('Name AN Kunde', customer);
  text('Straße AN Kunde', project.address?.line);
  text('AN Kunde PLZ', project.address?.zip);
  text('AN Kunde Ort', project.address?.city);

  // ── Eigentümer (= Kunde bei Privatanlagen) ──
  text('Eigentümer Name', customer);
  text('Straße Eigentümer', project.address?.line);
  text('Eigentümer PLZ', project.address?.zip);
  text('Eigentümer Ort', project.address?.city);

  // ── Netzform ──
  check('DS');                                           // Drehstrom

  // ── Leistungen ──
  text('Leistung EEA', num(wrKw(project)));
  if (project.battery) {
    text('Leistung Speicher Heiz', project.batterySpec ? num(project.batterySpec.capacityKwh) : undefined);
  }

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SwmDocType = 'swm-ana' | 'swm-db' | 'swm-iba';

const FILLERS: Record<SwmDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'swm-ana': fillSWMAna,
  'swm-db':  fillSWMDb,
  'swm-iba': fillSWMIba,
};
const LABELS: Record<SwmDocType, string> = {
  'swm-ana': 'SWM-Anmeldung-Strom',
  'swm-db':  'SWM-Datenblatt-EEA',
  'swm-iba': 'SWM-Inbetriebsetzung',
};

export function swmDocLabel(type: SwmDocType): string { return LABELS[type]; }
export async function fillSwmDoc(type: SwmDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
