// Netze Magdeburg — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   nm-db     = Datenblatt EZA + Speicher (ANA)          — 92 Felder, 2 Seiten
//   nm-e2     = E.2 Anmeldung Erzeugungsanlage (ANA)     — 38 Felder, 1 Seite (NM-eigene VDE)
//   nm-e3     = E.3 Datenblatt Speicher (ANA)             — 42 Felder, 1 Seite (NM-eigene VDE)
//   nm-e8     = E.8 Inbetriebsetzungsprotokoll (FM)       — 47 Felder, 1 Seite
//   nm-inbe   = PV-Inbetriebnahme-Erklärung (FM)         — 14 Felder, 1 Seite
//
// Templates: nb-templates/Netze Magdeburg/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen, hatNotstrom, naSchutzIntegriert, speicherkopplung } from './geschaeftsregeln';

// ── Installer (Volta) ──────────────────────────────────────────────────────
const VOLTA = {
  name:    process.env.INSTALLER_COMPANY   || 'Volta Energietechnik GmbH',
  street:  process.env.INSTALLER_ADDRESS   || 'Am Schenkberg 12',
  plz:     process.env.INSTALLER_PLZ       || '04349',
  ort:     process.env.INSTALLER_CITY      || 'Leipzig',
  plzOrt:  process.env.INSTALLER_PLZORT    || '04349 Leipzig',
  phone:   process.env.INSTALLER_PHONE     || '',
  email:   process.env.INSTALLER_EMAIL     || '',
};

// ── Template paths ─────────────────────────────────────────────────────────
const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'Netze Magdeburg');
const TEMPLATES = {
  'nm-db':   path.join(TMPL_DIR, 'ANA', 'db_eza_speicher_092023.pdf'),
  'nm-e2':   path.join(TMPL_DIR, 'ANA', 'form_e2_eza_ns_vdearn4105.pdf'),
  'nm-e3':   path.join(TMPL_DIR, 'ANA', 'formular_e3_eza_ns_vdearn4105.pdf'),
  'nm-e8':   path.join(TMPL_DIR, 'FM',  'form_e8_ib_eza_ns.pdf'),
  'nm-inbe': path.join(TMPL_DIR, 'FM',  'form_inbe_pv_1023-1.pdf'),
};

// ── Helpers ────────────────────────────────────────────────────────────────
function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }
function splitName(s?: string) {
  if (!s) return { hersteller: '', typ: '' };
  const parts = s.split(/\s+/);
  return { hersteller: parts[0], typ: parts.slice(1).join(' ') || s };
}

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }
function wrKva(p: ProjectData): number | undefined { return p.inverterSpec?.apparentPowerKva ?? wrKw(p); }
function batKwPerModule(p: ProjectData): number | undefined { return p.batterySpec?.maxDischargekW; }
function batKwTotal(p: ProjectData): number | undefined {
  const pm = batKwPerModule(p);
  if (pm && p.batteryModuleCount) return Math.round(pm * p.batteryModuleCount * 100) / 100;
  return pm;
}
function batKwhTotal(p: ProjectData): number | undefined {
  if (p.batterySpec && p.batteryModuleCount) return Math.round(p.batterySpec.capacityKwh * p.batteryModuleCount * 100) / 100;
  return p.batteryKwh;
}
function wrModelName(p: ProjectData) {
  if (p.inverterSpec) return { hersteller: 'EcoFlow', typ: p.inverterSpec.model.replace('EcoFlow ', '') };
  return splitName(p.inverter);
}
function batModelName(p: ProjectData) {
  if (p.batterySpec) return { hersteller: 'EcoFlow', typ: p.batterySpec.model.replace('EcoFlow ', '') };
  return splitName(p.battery);
}
function wrNennstromA(p: ProjectData): number | undefined {
  const kw = wrKw(p);
  return kw ? Math.round((kw * 1000) / (Math.sqrt(3) * 400)) : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// nm-db — Datenblatt EZA + Speicher (2 Seiten, 92 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Seite 1: 3 Personen-Blöcke (Betreiber, Standort, Errichter),
//          Anlagentyp, Generator, WR-Daten, Phasen, Inselbetrieb,
//          Speicher-Basisdaten (Kapazität, Kopplung, Phasen)
// Seite 2: Speicher-Details (Hersteller, Umrichter), Messkonzept-Checkboxen
//
export async function fillNMDatenblatt(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('nm-db'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  // ── Block 1: Betreiber (y=665–612) ──
  text('1', customer);                           // Name/Firma
  text('2', project.address?.line);               // Straße
  text('3', project.address?.zip);                // PLZ
  text('4', project.address?.city);               // Ort

  // ── Block 2: Anlagenstandort (y=590–537) ──
  text('1_2', customer);                          // Name/Firma
  text('2_2', project.address?.line);             // Straße
  text('3_2', project.address?.zip);              // PLZ
  text('4_2', project.address?.city);             // Ort

  // ── Block 3: Errichter = Volta (y=515–462) ──
  text('1_3', VOLTA.name);
  text('2_3', VOLTA.street);
  text('3_3', VOLTA.plz);
  text('4_3', VOLTA.ort);

  // ── Anlagentyp ──
  check('Neuerrichtung');
  check('Sonne');

  // ── Generator-Leistungsdaten ──
  const wr = wrModelName(project);
  text('kW', num(wrKw(project)));                 // install. Wirkleistung kW
  text('kVA', num(wrKva(project)));               // install. Scheinleistung kVA
  text('kWp', num(project.kwp));                  // Modulleistung kWp

  // Modulleistung nochmal (kWp_2) + max. WR-Leistung
  text('kW_2', num(wrKw(project)));               // max. Wirkleistung WR
  text('kVA_2', num(wrKva(project)));             // max. Scheinleistung WR
  text('Stk', String(project.moduleCount));       // Anzahl Module

  // Wechselrichter
  text('Typ', wr.typ);                            // WR Typ
  text('undefined_4', wr.hersteller);             // WR Hersteller (unnamed field)

  // Modul-Wp
  if (project.moduleType) {
    const wpMatch = /(\d{3,4})\s*[Ww]/.exec(project.moduleType);
    if (wpMatch) text('Wp', wpMatch[1]);
  }

  // ── Phasen ──
  if (phasen(project) === 3) {
    check('3phasig');
    check('Drehstrom');
  }

  // ── Inselbetrieb ──
  if (hatNotstrom(project)) {
    check('ja');                                   // Inselbetriebsfähig
    check('ja_2');                                 // Schwarzstartfähig
  } else {
    check('nein');
    check('nein_2');
  }

  // Nennstrom
  const nennstrom = wrNennstromA(project);
  text('A', nennstrom ? String(nennstrom) : undefined);

  // ── Speicher (unterer Teil Seite 1) ──
  if (project.battery) {
    text('Speicherkapazität', num(batKwhTotal(project)));
    text('kWh', project.batterySpec ? num(project.batterySpec.capacityKwh) : undefined);

    if (speicherkopplung(project) === 'dc') {
      check('DCgekoppelt');
    } else {
      check('ACgekoppelt');
    }

    if (phasen(project) === 3) {
      check('3phasig_2');
      check('Drehstrom_2');
    }

    // Netzersatzbetrieb
    if (hatNotstrom(project)) {
      check('ja_3');
    } else {
      check('nein_3');
    }

    // ── Seite 2: Speicher-Details ──
    const bat = batModelName(project);
    text('Hertseller Speicher', bat.hersteller);   // Note: typo in PDF "Hertseller"
    text('Speichertyp', bat.typ);

    // Umrichter = gleicher Hybrid-WR
    text('Hersteller Umrichter', wr.hersteller);
    text('Umrichtertyp', wr.typ);
    text('PA', num(wrKw(project)));                // Wirkleistung WR kW
    text('SA', num(wrKva(project)));               // Scheinleistung WR kVA
  }

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// nm-e2 — E.2 Anmeldung Erzeugungsanlage NS (1 Seite, 38 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// NM-eigene Version des VDE-AR-N 4105 E.2 mit E2_-Prefix.
// Betreiber, Energieträger, WR, Phasen, Inselbetrieb, Einspeisung.
//
export async function fillNME2(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('nm-e2'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber ──
  text('E2_Text1', customer);                     // Name/Firma
  text('E2_Text2', project.address?.line);         // Straße
  text('E2_Text3', plzOrt);                        // PLZ/Ort

  // ── Energieträger ──
  check('Sonne');

  // ── Wechselrichter ──
  const wr = wrModelName(project);
  text('Hersteller', wr.hersteller);
  text('Typ', wr.typ);
  text('E2_Text8', String(project.inverterCount ?? 1));  // Anzahl
  text('E2_Text9', num(wrKw(project)));                   // Nennleistung kW
  text('E2_Text10', num(wrKva(project)));                 // Scheinleistung kVA

  // ── Phasen ──
  if (phasen(project) === 3) {
    check('3-phasig');
    check('Drehstrom');
  }

  // ── Inselbetrieb ──
  if (hatNotstrom(project)) {
    check('Inselbetrieb ja.0.0');
  } else {
    check('Inselbetrieb nein');
  }

  // ── Einspeisung ──
  check('Überschusseinsp. ja');                    // Überschusseinspeisung = Ja

  // Momentananweisung (Einspeisemanagement) = Ja bei PV
  check('MoAn ja');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// nm-e3 — E.3 Datenblatt Speicher NS (1 Seite, 42 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// NM-eigene Version des VDE E.3. Betreiber, Speicher, WR, Kopplung, Phasen,
// Netzersatzbetrieb, Ladung/Entladung, Messkonzept.
//
export async function fillNME3(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('nm-e3'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber ──
  text('E3_Text1', customer);                      // Name
  text('E3_Text2', project.address?.line);          // Straße
  text('E3_Text3', plzOrt);                         // PLZ/Ort
  text('E3_Text4', project.phone);                  // Telefon
  text('E3_Text5', project.email);                  // E-Mail

  // ── Speicherdaten ──
  const bat = batModelName(project);
  text('E3_Text7', bat.hersteller);                 // Hersteller Speicher
  text('E3_Text8', bat.typ);                        // Typ Speicher
  text('E3_Text9', String(project.batteryModuleCount ?? 1)); // Anzahl

  // ── WR des Speichers (= Hybrid-WR) ──
  const wr = wrModelName(project);
  text('E3_Text10', wr.hersteller);                 // Hersteller WR
  text('E3_Text11', wr.typ);                        // Typ WR

  // ── Leistungsdaten ──
  text('E3_Text12', num(batKwhTotal(project)));     // nutzbare Speicherkapazität kWh
  text('E3_Text13', num(batKwTotal(project)));      // max. Wirkleistung Laden kW
  text('E3_Text14', num(batKwTotal(project)));      // max. Wirkleistung Entladen kW
  text('E3_Text15', num(wrKva(project)));           // max. Scheinleistung kVA
  const nennstrom = wrNennstromA(project);
  text('E3_Text16', nennstrom ? String(nennstrom) : undefined); // Nennstrom A

  // ── Kopplung ──
  if (speicherkopplung(project) === 'dc') {
    check('E3_Check Box26');                         // DC-gekoppelt (x=266)
  } else {
    check('E3_Check Box25');                         // AC-gekoppelt (x=172)
  }

  // ── Phasen ──
  if (phasen(project) === 3) {
    check('E3_Check Box30');                         // 3-phasig (x=291)
    check('E3_Check Box31');                         // Drehstrom (x=330)
  }

  // ── Netzersatzbetrieb ──
  if (hatNotstrom(project)) {
    check('E3_Check Box34');                         // Ja (y=511)
  } else {
    check('E3_Check Box35');                         // Nein (y=493)
  }

  // ── Ladung/Entladung ──
  check('E3_Check Box36');                           // Ladung aus EZA (y=353)
  check('E3_Check Box38');                           // Entladung in Kundenanlage (y=300)
  check('E3_Check Box39');                           // Entladung ins Netz (y=277, Überschuss)

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// nm-e8 — E.8 Inbetriebsetzungsprotokoll NS (1 Seite, 47 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Betreiber, Errichter, Leistungsdaten, Prüfungen, NA-Schutz.
//
export async function fillNME8(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('nm-e8'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber / Standort ──
  text('E8_Text1', customer);                      // Name Betreiber
  text('E8_Text2', project.address?.line);          // Straße
  text('E8_Text3', plzOrt);                         // PLZ/Ort
  text('E8_Text4', project.phone);                  // Telefon
  text('E8_Text5', project.email);                  // E-Mail

  // ── Errichter = Volta ──
  text('E8_Text6', VOLTA.name);

  // ── Leistungsdaten (y=611) ──
  text('E8_Text7', num(project.kwp));               // kWp
  text('E8_Text8', num(wrKw(project)));             // Wirkleistung kW
  text('E8_Text9', num(wrKva(project)));            // Scheinleistung kVA

  // ── Prüfungen (Checkboxen) ──
  check('E8_E8_Check Box25');                       // Übereinstimmung Unterlagen (y=583)
  check('E8_Check Box27');                          // Einheitenzertifikat (y=570)
  check('E8_Check Box26');                          // NA-Schutz vorhanden (y=559)

  if (naSchutzIntegriert(project)) {
    check('E8_E8_E8_Check Box29');                  // NA-Schutz integriert (y=497)
  }

  check('E8_Check Box28');                          // Aufstellung ordnungsgemäß (y=521)
  check('E8_Check Box31');                          // Erdung korrekt (y=429)
  check('E8_Check Box32');                          // Funktionstest (y=409)

  // ── Zähler ──
  // E8_Text10, E8_Text11 — Zähler-Daten (leer lassen, muss vor Ort eingetragen werden)

  // ── Ort/Datum Errichter ──
  text('E8_Text55', VOLTA.ort);                     // Ort Errichter
  text('E8_Text21', VOLTA.name);                    // Firma Errichter Unterschrift

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// nm-inbe — PV-Inbetriebnahme-Erklärung (1 Seite, 14 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Einfaches Formular: Betreiber, Errichter, 3 Nachweise-Checkboxen.
//
export async function fillNMInbe(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('nm-inbe'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Nachweise ──
  check('Bescheinigung über tatsächliche Stromerzeugung zB Glühlampentest');
  check('datierte Fotos der fest installierten Module und der Wechselrichter vom Tag der Inbetriebnahme');
  check('Anmeldung der Photovoltaikanlage im Marktstammdatenregister der Bundesnetzagentur');

  // ── Betreiber ──
  text('1', customer);                             // Name
  text('Straße Hausnummer 1', project.address?.line);
  text('Straße Hausnummer 2', plzOrt);

  // ── Errichter = Volta ──
  text('Anlagenerrichter  Installateur', VOLTA.name);
  text('Straße Hausnummer 1_2', VOLTA.street);
  text('Straße Hausnummer 2_2', VOLTA.plzOrt);
  text('Straße Hausnummer 3', [VOLTA.phone, VOLTA.email].filter(Boolean).join(' / '));

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type NmDocType = 'nm-db' | 'nm-e2' | 'nm-e3' | 'nm-e8' | 'nm-inbe';

const FILLERS: Record<NmDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'nm-db':   fillNMDatenblatt,
  'nm-e2':   fillNME2,
  'nm-e3':   fillNME3,
  'nm-e8':   fillNME8,
  'nm-inbe': fillNMInbe,
};

const LABELS: Record<NmDocType, string> = {
  'nm-db':   'NM-Datenblatt-EZA+Speicher',
  'nm-e2':   'NM-E2-Anmeldung',
  'nm-e3':   'NM-E3-Speicher',
  'nm-e8':   'NM-E8-Inbetriebsetzung',
  'nm-inbe': 'NM-PV-Inbetriebnahme',
};

export function nmDocLabel(type: NmDocType): string { return LABELS[type]; }

export async function fillNmDoc(type: NmDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}

export function nmDocsForProject(project: ProjectData): NmDocType[] {
  const docs: NmDocType[] = ['nm-db', 'nm-e2'];
  if (project.battery) docs.push('nm-e3');
  docs.push('nm-e8', 'nm-inbe');
  return docs;
}
