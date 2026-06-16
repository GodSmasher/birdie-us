// Sachsen Netze — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   sn-eza     = Datenblatt Stromerzeugungsanlage (Anmeldung)   (ANA)
//   sn-speicher = Datenblatt Stromspeicheranlagen (Anmeldung)   (ANA)
//   sn-svr     = Datenblatt Steuerbare Verbrauchseinrichtungen  (ANA, §14a)
//   sn-ibn     = Inbetriebsetzungsprotokoll NS                  (FM)
//
// Templates: nb-templates/Sachsen Netze/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen, hatNotstrom, naSchutzIntegriert, speicherkopplung } from './geschaeftsregeln';

// ── Installer (Volta) ──────────────────────────────────────────────────────
const VOLTA = {
  name:    process.env.INSTALLER_COMPANY   || 'Volta Energietechnik GmbH',
  street:  process.env.INSTALLER_ADDRESS   || 'Am Schenkberg 12',
  plzOrt:  process.env.INSTALLER_PLZORT    || '04349 Leipzig',
  phone:   process.env.INSTALLER_PHONE     || '',
  email:   process.env.INSTALLER_EMAIL     || '',
};

// ── Template paths ─────────────────────────────────────────────────────────
const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'Sachsen Netze');
const TEMPLATES = {
  'sn-eza':      path.join(TMPL_DIR, 'ANA', 'Datenblatt+Stromerzeugungsanlage+Anmeldung.pdf'),
  'sn-speicher': path.join(TMPL_DIR, 'ANA', 'Datenblatt+Stromspeicheranlagen+Anmeldung.pdf'),
  'sn-svr':      path.join(TMPL_DIR, 'ANA', 'Datenblatt-Steuerbare-Verbrauchseinrichtungen.pdf'),
  'sn-ibn':      path.join(TMPL_DIR, 'FM',  'Inbetriebsetzungsprotokoll-für-Erzeugungsanlagen-Niederspannung.pdf'),
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

/** Nennstrom WR in A (3-phasig: P / (√3 × 400V) ≈ P / 692) */
function wrNennstromA(p: ProjectData): number | undefined {
  const kw = wrKw(p);
  return kw ? Math.round((kw * 1000) / (Math.sqrt(3) * 400)) : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// sn-eza — Datenblatt Stromerzeugungsanlage (2 Seiten)
// ═══════════════════════════════════════════════════════════════════════════
//
// Seite 1: Betreiber/Standort, Energieträger, Generator/WR, NA-Schutz, Solarmodule
// Seite 2: Einspeisung, Messkonzept, Unterschrift
//
export async function fillSNEza(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('sn-eza'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Anlagenbetreiber (linke Spalte) ──
  text('PLZ Ort', plzOrt);
  text('Str HausNr', project.address?.line);
  // Ortsteil, Gemarkung, Flurstück — nicht vorhanden

  // ── Betreiber (rechte Spalte) ──
  text('Name Firma', customer);
  text('PLZ Ort_2', plzOrt);
  text('Str HausNr_2', project.address?.line);
  text('Telefon', project.phone);
  text('EMail', project.email);

  // ── Energieträger ──
  check('Solar');

  // ── Erzeugungseinheit (Generator = Wechselrichter) ──
  const wr = wrModelName(project);
  text('Hersteller', wr.hersteller);
  text('Typ', wr.typ);
  text('Anzahl baugleiche Anlagen außer Wechselrichter', String(project.inverterCount ?? 1));

  // Generatorart
  check('Wechselrichter');
  if (phasen(project) === 3) {
    check('an 3 x 400230 V mit symmetrischer Belastung mit bzw ohne Neutralleiter');
  }
  if (hatNotstrom(project)) {
    check('inselbetriebsfähig');
    check('schwarzstartfähig');
  }

  // Generator-Leistungsdaten
  text('install. Generatorwirkleistung (AC) \nin kW/kWp', num(project.kwp));   // kWp
  text('stall. Generatorscheinleistung', num(wrKva(project)));                  // kVA
  text('Generatornennspannung AC in V', '400');                                  // 3-phasig = 400V
  const nennstrom = wrNennstromA(project);
  text('Generatornennstrom AC in A', nennstrom ? String(nennstrom) : undefined);
  text('Bemessungsstrom in A', nennstrom ? String(nennstrom) : undefined);

  // ── Wechselrichter-Tabelle (Row 1) ──
  text('Hersteller Wechselrichter 1', wr.hersteller);
  text('Typ 1', wr.typ);
  text('S ENenn 1', num(wrKw(project)));                    // Nennleistung kW
  text('Anzahl 1', String(project.inverterCount ?? 1));
  text('kVA 1', num(wrKva(project)));                       // Scheinleistung kVA

  // ── NA-Schutz ──
  if (naSchutzIntegriert(project)) {
    check('integriert');                                     // integrierter NA-Schutz
  }

  // ── Solarmodule-Tabelle (Row 5 = erste Zeile) ──
  if (project.moduleType) {
    const modParts = splitName(project.moduleType);
    text('Hersteller Solarmodule 5', modParts.hersteller);
    text('Typ 5', modParts.typ);
    text('Anzahl 5', String(project.moduleCount));
    // Einzelmodulleistung aus moduleType extrahieren
    const wpMatch = /(\d{3,4})\s*[Ww]/.exec(project.moduleType);
    if (wpMatch) text('Nennleistung je Modul in Wp 5', wpMatch[1]);
    text('kWp 5', num(project.kwp));
  }

  // ═══ SEITE 2: Einspeisung & Messkonzept ════════════════════════════════

  // Teileinspeisung (Überschuss) mit Eigenverbrauch
  check('Teileinspeisung Eigenbedarfsdeckung in bestehende Kundenanlage über ZählerNr');

  // Speicher vorhanden?
  if (project.battery) {
    check('mit Stromspeicheranlage Separates Datenblatt');
    check('Erzeugungsanlage mit Speicher');
  }

  // §14a: Speicher ≥ 4,2kW = steuerbare VE
  if (project.battery) {
    const batTotal = batKwTotal(project) ?? 0;
    if (batTotal >= 4.2) {
      check('wenn Bezug Stromspeicheranlage  42 kW gilt steuerbare Verbrauchseinrichtung Separates Datenblatt');
    }
  }

  // Netzsicherheitsmanagement = Ja (bei PV immer)
  check('Ja');

  // max. Wirkleistungseinspeisung (70% oder 100% seit 2023)
  text('in kW', num(wrKw(project)));

  // Messkonzept: b = Überschusseinspeisung mit 2-Richtungs-Zähler
  check('b');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// sn-speicher — Datenblatt Stromspeicheranlagen (4 Seiten)
// ═══════════════════════════════════════════════════════════════════════════
//
// Seite 1: Betreiber, Standort, Errichter, Speicherdaten, WR, Ladung/Entladung
// Seite 2-4: Messkonzept-Auswahl
//
export async function fillSNSpeicher(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('sn-speicher'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber (linke Spalte oben) ──
  text('PLZ Ort 1', plzOrt);
  text('Str HausNr', project.address?.line);
  // Gemarkung, Flurstück — nicht vorhanden

  // ── Betreiber (rechte Spalte oben) ──
  text('Name Firma 1', customer);
  text('PLZ Ort 2', plzOrt);
  text('Str HausNr 1', project.address?.line);

  // ── Errichter = Volta (mittlerer Block) ──
  text('Name Firma', VOLTA.name);
  text('PLZ Ort', VOLTA.plzOrt);
  text('Str HausNr_2', VOLTA.street);
  text('Telefon 1', VOLTA.phone);
  text('Telefon 2', VOLTA.email);   // Feld heißt "Telefon 2", wird für Email genutzt

  // ── Speicherdaten ──
  const bat = batModelName(project);
  text('Hersteller', bat.hersteller);
  text('Typ', bat.typ);
  text('Anzahl', String(project.batteryModuleCount ?? 1));

  // Kopplung: DC-gekoppelt mit Gleichrichter (Volta-Standard)
  if (speicherkopplung(project) === 'dc') {
    check('DCgekoppelt mit');
    check('Gleichrichter');
  } else {
    check('ACgekoppelt');
  }

  // Anschlussart
  if (phasen(project) === 3) {
    check('Drehstrom');
    check('an 3 x400230 V mit symmetrischer Belastung mit bzw ohne Neutralleiter');
  } else {
    check('Wechselstrom');
  }

  // Notstrom
  if (hatNotstrom(project)) {
    check('Netzersatzbetrieb');
    check('Inselbetriebsfähigkeit');
    check('Schwarzstartfähigkeit');
  }

  // Kapazität und Leistung
  text('Speicherkapazität', num(batKwhTotal(project)));                       // kWh gesamt
  text('Maximale Wirkleistung Bezug1', num(batKwTotal(project)));             // max Ladeleistung kW
  text('Maximale Wirkleistung Einspeisung1', num(batKwTotal(project)));       // max Entladeleistung kW

  // ── Wechselrichter des Speichers (= gleicher Hybrid-WR) ──
  const wr = wrModelName(project);
  text('Hersteller_2', wr.hersteller);
  text('Typ_2', wr.typ);
  text('Anzahl_2', String(project.inverterCount ?? 1));
  text('max Wirkleistung Wechselrichter', num(wrKw(project)));
  text('max Scheinleistung Wechselrichter', num(wrKva(project)));
  const nennstrom = wrNennstromA(project);
  text('A', nennstrom ? String(nennstrom) : undefined);                       // Bemessungsstrom A

  // ── Ladung ──
  check('durch Strom aus einer Stromerzeugungsanlage');     // Ladung aus PV
  // DC-gekoppelt: KEIN Bezug aus öff. Netz
  // check('durch Strom aus dem öffentlichen Netz');

  // ── Entladung ──
  check('in die Kundenanlage');                              // Eigenverbrauch
  check('in das öffentliche Netz');                          // Überschusseinspeisung

  // ── Inselbetrieb (Entladung in Kundenanlage bei Netzausfall) ──
  if (hatNotstrom(project)) {
    check('möglich');
  } else {
    check('technisch ausgeschlossen');
  }

  // ═══ SEITE 2-4: Messkonzept ═══════════════════════════════════════════
  // Standard PV+Speicher ohne Volleinspeisung:
  // "Speichersystem mit Stromerzeugungsanlage ohne [Lieferung]" = Abb. auf Seite 2
  check('Speichersystem mit Stromerzeugungsanlage ohne');

  // Gemeinsamer Zähler? Ja (PV+Speicher über einen 2-Richtungszähler)
  check('ja_5');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// sn-svr — Datenblatt Steuerbare Verbrauchseinrichtungen (§14a, 1 Seite)
// ═══════════════════════════════════════════════════════════════════════════
export async function fillSNSvr(project: ProjectData, _customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('sn-svr'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  text('Straße, Hausnummer', project.address?.line);
  text('PLZ, Ort', plzOrt);

  // Speicher = steuerbare VE (SP = Speicher)
  if (project.battery) {
    check('SP dir');       // Speicher direkt gesteuert
    check('Sp1Z');         // Speicher über 1 Zähler
    check('Sp M1');        // Messkonzept M1 (Standard)
  }

  // Netzverträglichkeitsprüfung
  check('ja1');            // §14a Vereinbarung gewünscht

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// sn-ibn — Inbetriebsetzungsprotokoll NS (3 Seiten)
// ═══════════════════════════════════════════════════════════════════════════
//
// Komplexes Formular mit tief verschachtelten Feldnamen (Kontrollkästchen5.0.1.0.0...)
// Seite 1: Betreiber, Errichter, Leistungsdaten
// Seite 2: Prüfungen, NA-Schutz, Zähler
// Seite 3: Einstellungen, Blindleistung, Unterschrift
//
export async function fillSNIbn(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('sn-ibn'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ═══ SEITE 1: IBN-Protokoll (verifiziert über FIELDMAP_sn-ibn.pdf) ════

  // ── Anlagenanschrift (linke Spalte) ──
  text('Name, Vorname_1', customer);
  text('Straße, Hausnr_1', project.address?.line);
  text('PLZ,Ort', plzOrt);

  // ── Anschlussnehmer (rechte Spalte = Kunde bei Residential) ──
  text('Name, Vorname_2', customer);
  text('Straße, Hausn_2', project.address?.line);
  text('PLZ, Ort', plzOrt);

  // ── Anlagenerrichter = Volta ──
  text('Firma', VOLTA.name);
  text('Straße, Hausnr', VOLTA.street);
  text('Telefon, E-Mail', [VOLTA.phone, VOLTA.email].filter(Boolean).join(' / '));

  // ── Leistungsdaten ──
  const wrKwVal = wrKw(project) ?? (project.kwp > 0 ? project.kwp : undefined);
  text('Scheinleistung', num(wrKva(project) ?? wrKwVal));  // max kVA
  text('Wirkleistung', num(wrKwVal));                       // max kW
  text('Modulleistung', num(project.kwp));                  // kWp

  // ── Eingestellte Wirkleistung am Netzanschluss (60%) ──
  if (project.kwp > 0) {
    const pavE = Math.round(project.kwp * 0.6 * 10) / 10;
    text('Wirkleistung am NA', num(pavE));
  }

  // ── Symmetrie L1/L2/L3 ──
  if (wrKwVal && phasen(project) === 3) {
    const perPhase = num(Math.round(((wrKva(project) ?? wrKwVal) / 3) * 10) / 10);
    text('Text4.1.0.0', perPhase);  // L1 neu
    text('Text4.1.0.1', perPhase);  // L2 neu
    text('Text4.1.1', perPhase);    // L3 neu
  }

  // ── Checkboxen Seite 1 ──
  check('Kontrollkästchen2.0');     // Übereinstimmung Datenblatt ✓
  check('Kontrollkästchen2.1');     // Abrechnungsmessung ✓
  check('Kontrollkästchen2.2');     // Einheitenzertifikat ✓
  check('Kontrollkästchen2.3');     // P_AV,E Zertifikat ✓
  check('Kontrollkästchen2.6.0');   // Auslösetest zentraler NA-Schutz ✓
  check('Kontrollkästchen2.6.1');   // Ruhestromprinzip ✓
  check('Kontrollkästchen2.7');     // P_AV,E Funktionstest ✓
  check('Kontrollkästchen5.0');     // Wirkleistungsbegrenzung 60% ✓
  check('Kontrollkästchen5.1');     // Funkrundsteuerempfänger ✓
  check('Kontrollkästchen5.2');     // Energieflussrichtungssensor ✓
  if (phasen(project) === 3) {
    check('Kontrollkästchen5.0.1.0.0');   // Drehstrom-Symmetrie ✓
  }

  // ═══ SEITE 2: Anlage 1 — NA-Schutz ════════════════════════════════════

  const addrLine = project.address?.line ? `${customer}, ${project.address.line}, ${plzOrt}` : customer;
  text('Anlagenanschrift', addrLine);

  // ═══ SEITE 3: Anlage 2 — Parameter EZA ════════════════════════════════

  text('Anlagenanschrift_2', addrLine);

  // Gerät 1 = Wechselrichter
  const wr = wrModelName(project);
  text('Gerät 1', `${wr.hersteller} ${wr.typ}`.trim());
  text('Anzahl', String(project.inverterCount ?? 1));

  // Gerät 2 = Speicher (wenn vorhanden)
  if (project.battery) {
    const bat = batModelName(project);
    text('Gerät 2', `${bat.hersteller} ${bat.typ}`.trim());
    text('Anzahl_3', String(project.batteryModuleCount ?? 1));
  }

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SnDocType = 'sn-eza' | 'sn-speicher' | 'sn-svr' | 'sn-ibn';

const FILLERS: Record<SnDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'sn-eza':      fillSNEza,
  'sn-speicher': fillSNSpeicher,
  'sn-svr':      fillSNSvr,
  'sn-ibn':      fillSNIbn,
};

const LABELS: Record<SnDocType, string> = {
  'sn-eza':      'SN-Datenblatt-EZA',
  'sn-speicher': 'SN-Datenblatt-Speicher',
  'sn-svr':      'SN-Steuerbare-VE-§14a',
  'sn-ibn':      'SN-Inbetriebsetzungsprotokoll',
};

export function snDocLabel(type: SnDocType): string { return LABELS[type]; }

export async function fillSnDoc(type: SnDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}

export function snDocsForProject(project: ProjectData): SnDocType[] {
  const docs: SnDocType[] = ['sn-eza'];
  if (project.battery) docs.push('sn-speicher');
  if (project.battery && (batKwTotal(project) ?? 0) >= 4.2) docs.push('sn-svr');
  docs.push('sn-ibn');
  return docs;
}
