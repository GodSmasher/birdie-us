// Werra Energie — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   we-e2  = E.2 Datenblatt Erzeugungsanlagen NS   (ANA)
//   we-e3  = E.3 Datenblatt Speicher NS              (ANA)
//   we-e8  = E.8 Inbetriebsetzungsprotokoll EZA NS  (FM)
//
// Templates: nb-templates/Werra Energie/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen, hatNotstrom, naSchutzIntegriert, speicherkopplung } from './geschaeftsregeln';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
  phone:  process.env.INSTALLER_PHONE   || '',
  email:  process.env.INSTALLER_EMAIL   || '',
};

// Note: folder name has encoding issue (ÂNA instead of ANA)
const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'Werra Energie');
const TEMPLATES = {
  'we-e2': path.join(TMPL_DIR, 'ÂNA', 'E.2 Datenblatt Erzeugungsanlagen NS.pdf'),
  'we-e3': path.join(TMPL_DIR, 'ÂNA', 'E.3 Datenblatt Speicher NS.pdf'),
  'we-e8': path.join(TMPL_DIR, 'FM',  'E.8 Inbetriebsetzungsprotokoll Erzeugungsanlagen NS.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }
function wrKva(p: ProjectData): number | undefined { return p.inverterSpec?.apparentPowerKva ?? wrKw(p); }
function batKwTotal(p: ProjectData): number | undefined {
  const pm = p.batterySpec?.maxDischargekW;
  if (pm && p.batteryModuleCount) return Math.round(pm * p.batteryModuleCount * 100) / 100;
  return pm;
}
function batKwhTotal(p: ProjectData): number | undefined {
  if (p.batterySpec && p.batteryModuleCount) return Math.round(p.batterySpec.capacityKwh * p.batteryModuleCount * 100) / 100;
  return p.batteryKwh;
}
function wrModelName(p: ProjectData) {
  if (p.inverterSpec) return { hersteller: 'EcoFlow', typ: p.inverterSpec.model.replace('EcoFlow ', '') };
  const parts = (p.inverter || '').split(/\s+/);
  return { hersteller: parts[0] || '', typ: parts.slice(1).join(' ') || p.inverter || '' };
}
function batModelName(p: ProjectData) {
  if (p.batterySpec) return { hersteller: 'EcoFlow', typ: p.batterySpec.model.replace('EcoFlow ', '') };
  const parts = (p.battery || '').split(/\s+/);
  return { hersteller: parts[0] || '', typ: parts.slice(1).join(' ') || p.battery || '' };
}
function wrNennstromA(p: ProjectData): number | undefined {
  const kw = wrKw(p);
  return kw ? Math.round((kw * 1000) / (Math.sqrt(3) * 400)) : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// we-e2 — E.2 Datenblatt Erzeugungsanlagen NS (1 Seite)
// ═══════════════════════════════════════════════════════════════════════════
//
// Betreiber, Energieträger, WR, Phasen, Inselbetrieb, Einspeisung.
// Uses RadioGroups (Auswahl1/2/3) for ja/nein pairs.
//
export async function fillWEE2(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('we-e2'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };
  const radio = (n: string, v: string) => { try { form.getRadioGroup(n).select(v); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber ──
  text('E2_Text1', customer);
  text('E2_Text2', project.address?.line);
  text('E2_Text3', plzOrt);

  // ── Energieträger ──
  check('E2_Check Box15');                           // Sonne

  // ── Wechselrichter ──
  const wr = wrModelName(project);
  text('E2_Text6', wr.hersteller);                   // Hersteller
  text('E2_Text7', wr.typ);                           // Typ
  text('E2_Text8', String(project.inverterCount ?? 1)); // Anzahl
  text('E2_Text9', num(wrKw(project)));               // Nennleistung kW
  text('E2_Text10', num(wrKva(project)));             // Scheinleistung kVA

  // ── Phasen ──
  if (phasen(project) === 3) {
    check('E2_Check Box24');                           // 3-phasig
    check('E2_Check Box25');                           // Drehstrom
  }

  // ── Inselbetrieb (RadioGroup: Auswahl1=ja, Auswahl2=nein) ──
  radio('E2_Group26', hatNotstrom(project) ? 'Auswahl1' : 'Auswahl2');

  // ── Einspeisemanagement MoAn = Ja (Auswahl3=ja) ──
  radio('E2_Group27', 'Auswahl3');

  // ── Überschusseinspeisung = Ja (Auswahl2=ja) ──
  radio('E2_Group28', 'Auswahl2');

  // ── Volleinspeisung = Nein (Auswahl1=nein) ──
  radio('E2_Group29', 'Auswahl1');

  // ── Bemerkungen ──
  text('E2_Text11', num(project.kwp) + ' kWp');      // cos phi / Leistung

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// we-e3 — E.3 Datenblatt Speicher NS (1 Seite)
// ═══════════════════════════════════════════════════════════════════════════
export async function fillWEE3(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('we-e3'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber ──
  text('E3_Text1', customer);
  text('E3_Text2', project.address?.line);
  text('E3_Text3', plzOrt);
  text('E3_Text4', project.phone);
  text('E3_Text5', project.email);

  // ── Speicher ──
  const bat = batModelName(project);
  text('E3_Text7', bat.hersteller);
  text('E3_Text8', bat.typ);
  text('E3_Text9', String(project.batteryModuleCount ?? 1));

  // ── WR des Speichers ──
  const wr = wrModelName(project);
  text('E3_Text10', wr.hersteller);
  text('E3_Text11', wr.typ);

  // ── Leistungsdaten ──
  text('E3_Text12', num(batKwhTotal(project)));       // Speicherkapazität kWh
  text('E3_Text13', num(batKwTotal(project)));        // max. Laden kW
  text('E3_Text14', num(batKwTotal(project)));        // max. Entladen kW
  text('E3_Text15', num(wrKva(project)));             // Scheinleistung kVA
  const nennstrom = wrNennstromA(project);
  text('E3_Text16', nennstrom ? String(nennstrom) : undefined); // Nennstrom A

  // ── Kopplung ──
  if (speicherkopplung(project) === 'dc') {
    check('E3_Check Box26');                           // DC-gekoppelt
  } else {
    check('E3_Check Box25');                           // AC-gekoppelt
  }

  // ── Phasen ──
  if (phasen(project) === 3) {
    check('E3_Check Box30');                           // 3-phasig
    check('E3_Check Box31');                           // Drehstrom
  }

  // ── Netzersatzbetrieb ──
  if (hatNotstrom(project)) {
    check('E3_Check Box34');                           // Ja
  } else {
    check('E3_Check Box35');                           // Nein
  }

  // ── Ladung / Entladung ──
  check('E3_Check Box36');                             // Ladung aus EZA
  check('E3_Check Box38');                             // Entladung in Kundenanlage
  check('E3_Check Box39');                             // Entladung ins Netz

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// we-e8 — E.8 Inbetriebsetzungsprotokoll EZA NS (1 Seite)
// ═══════════════════════════════════════════════════════════════════════════
export async function fillWEE8(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('we-e8'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };
  const radio = (n: string, v: string) => { try { form.getRadioGroup(n).select(v); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber / Standort ──
  text('E8_Text1', customer);
  text('E8_Text2', project.address?.line);
  text('E8_Text3', plzOrt);
  text('E8_Text4', project.phone);
  text('E8_Text5', project.email);

  // ── Errichter ──
  text('E8_Text6', VOLTA.name);

  // ── Leistungsdaten ──
  text('E8_Text7', num(project.kwp));                 // kWp
  text('E8_Text8', num(wrKw(project)));               // Wirkleistung kW
  text('E8_Text9', num(wrKva(project)));              // Scheinleistung kVA

  // ── Prüfungen ──
  check('E8_E8_Check Box25');                          // Übereinstimmung Unterlagen
  check('E8_Check Box27');                             // Einheitenzertifikat
  check('E8_Check Box26');                             // NA-Schutz vorhanden
  check('E8_E8_E8_Check Box29');                       // NA-Schutz integriert
  check('E8_Check Box28');                             // Aufstellung ordnungsgemäß
  check('E8_Check Box31');                             // Erdung
  check('E8_Check Box32');                             // Funktionstest

  // ── NA-Schutz Typ (RadioGroup: Auswahl1=integriert) ──
  if (naSchutzIntegriert(project)) {
    radio('E8_Group37', 'Auswahl1');                   // integriert
  }

  // ── Ort/Datum ──
  text('E8_Text24', 'Leipzig');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type WeDocType = 'we-e2' | 'we-e3' | 'we-e8';

const FILLERS: Record<WeDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'we-e2': fillWEE2,
  'we-e3': fillWEE3,
  'we-e8': fillWEE8,
};

const LABELS: Record<WeDocType, string> = {
  'we-e2': 'WE-E2-Anmeldung-EZA',
  'we-e3': 'WE-E3-Speicher',
  'we-e8': 'WE-E8-Inbetriebsetzung',
};

export function weDocLabel(type: WeDocType): string { return LABELS[type]; }

export async function fillWeDoc(type: WeDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}

export function weDocsForProject(project: ProjectData): WeDocType[] {
  const docs: WeDocType[] = ['we-e2'];
  if (project.battery) docs.push('we-e3');
  docs.push('we-e8');
  return docs;
}
