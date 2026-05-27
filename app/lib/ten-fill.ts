// TEN (Thüringer Energienetze) — NB-spezifische PDF-Formularfüller.
//
// Drei Formulare:
//   AN005 = Antragstellung EZA + Speicher <= 30 kW  (ANA-Phase)
//   ANS   = Anmeldung Formblatt Strom               (ANA-Phase)
//   AN002 = Inbetriebsetzungsprotokoll <= 30 kW      (FM-Phase)
//
// Templates liegen als PDF in nb-templates/TEN/. Die Feldnamen wurden am
// 2026-05-27 per pdf-lib analysiert und gemappt. EcoFlow-Datenblattspecs
// werden automatisch für korrekte technische Werte verwendet.

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen, speicherkopplung, hatNotstrom, naSchutzIntegriert } from './geschaeftsregeln';

// ── Installer (Volta) ──────────────────────────────────────────────────────
const VOLTA = {
  name:   process.env.INSTALLER_COMPANY  || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS  || 'Kamenzer Str. 12',
  plzOrt: process.env.INSTALLER_PLZORT   || '04347 Leipzig',
  phone:  process.env.INSTALLER_PHONE    || '',
  email:  process.env.INSTALLER_EMAIL    || '',
};

// ── Template paths ─────────────────────────────────────────────────────────
const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'TEN');
const TEMPLATES = {
  an005: path.join(TMPL_DIR, 'ANA', 'AN005_Antragstellung_Erzeugung_und_Speicher_einschl_30kW.pdf'),
  ans:   path.join(TMPL_DIR, 'ANA', 'ANS_Anmeldung_Formblatt_Strom.pdf'),
  an002: path.join(TMPL_DIR, 'FM',  'AN002_Inbetriebsetzungsprotokoll_bis_30kW.pdf'),
};

// ── Helpers ────────────────────────────────────────────────────────────────
/** Zahl → deutsches Format (Punkt→Komma) */
function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }

function loadTemplate(key: keyof typeof TEMPLATES): Buffer {
  return fs.readFileSync(TEMPLATES[key]);
}

/** "EcoFlow PowerOcean Hybrid-Wechselrichter 8 kW" → {hersteller:"EcoFlow", typ:"PowerOcean Hybrid-Wechselrichter 8 kW"} */
function splitName(s?: string): { hersteller: string; typ: string } {
  if (!s) return { hersteller: '', typ: '' };
  const parts = s.split(/\s+/);
  return { hersteller: parts[0], typ: parts.slice(1).join(' ') || s };
}

/** Module-Watt aus moduleType extrahieren (z.B. "Neostar 25+ AIKO 465W" → 465) */
function moduleWatt(mod?: string): number | undefined {
  if (!mod) return undefined;
  const m = /(\d{3,4})\s*[Ww](?:p|att)?/.exec(mod);
  return m ? parseInt(m[1], 10) : undefined;
}

/** Wechselrichter kW — bevorzugt aus EcoFlow-Datenblatt, sonst aus String-Parsing */
function wrKw(p: ProjectData): number | undefined {
  return p.inverterSpec?.ratedPowerKw ?? p.inverterKw;
}

/** Wechselrichter kVA — aus Datenblatt oder = kW als Fallback */
function wrKva(p: ProjectData): number | undefined {
  return p.inverterSpec?.apparentPowerKva ?? wrKw(p);
}

/** Speicher max. Entladeleistung kW pro Modul — aus Datenblatt */
function batKwPerModule(p: ProjectData): number | undefined {
  return p.batterySpec?.maxDischargekW;
}

/** Speicher gesamt kW */
function batKwTotal(p: ProjectData): number | undefined {
  const perModule = batKwPerModule(p);
  if (perModule && p.batteryModuleCount) return Math.round(perModule * p.batteryModuleCount * 100) / 100;
  return perModule;
}

/** Speicher gesamt kWh — bevorzugt exakt aus Spec × Module, sonst aus Reonic */
function batKwhTotal(p: ProjectData): number | undefined {
  if (p.batterySpec && p.batteryModuleCount) {
    return Math.round(p.batterySpec.capacityKwh * p.batteryModuleCount * 100) / 100;
  }
  return p.batteryKwh;
}

/** WR-Modellname aus EcoFlow-Spec (sauberer als Reonic-String) */
function wrModelName(p: ProjectData): { hersteller: string; typ: string } {
  if (p.inverterSpec) {
    return { hersteller: 'EcoFlow', typ: p.inverterSpec.model.replace('EcoFlow ', '') };
  }
  return splitName(p.inverter);
}

/** Batterie-Modellname aus Spec */
function batModelName(p: ProjectData): { hersteller: string; typ: string } {
  if (p.batterySpec) {
    return { hersteller: 'EcoFlow', typ: p.batterySpec.model.replace('EcoFlow ', '') };
  }
  return splitName(p.battery);
}

// ═══════════════════════════════════════════════════════════════════════════
// AN005 — Antragstellung Erzeugung und Speicher <= 30 kW (4 Seiten)
// ═══════════════════════════════════════════════════════════════════════════
//
// Seite 1: Betreiber, Standort, Eigentümer, Errichter, Anlagenart
// Seite 2: Beigefügte Unterlagen, Netzanschluss, Bemerkungen
// Seite 3: Datenblatt Erzeugungsanlagen (WR-Rows 1-3, Summen, Einspeisung)
// Seite 4: Datenblatt Speicher (Bat-Rows 4-5, Summen, Primärenergie)
//
export async function fillAN005(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('an005'));
  const form = pdf.getForm();

  const text = (name: string, val?: string) => {
    if (!val) return;
    try { form.getTextField(name).setText(val); } catch { /* absent */ }
  };
  const check = (name: string) => {
    try { form.getCheckBox(name).check(); } catch { /* absent */ }
  };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ═══ SEITE 1: Personendaten ═══════════════════════════════════════════

  // ── 1. Anlagenbetreiber (Kunde) ──
  text('Vorname Name bzw Firmenname', customer);
  text('Telefon', project.phone);
  text('Straße Hausnummer', project.address?.line);
  text('PLZ Ort', plzOrt);
  text('EMail', project.email);

  // ── 2. Anlagenstandort (= Betreiber-Adresse bei Residential) ──
  text('Straße Hausnummer_2', project.address?.line);
  text('PLZ Ort_2', plzOrt);

  // ── 3. Grundstückseigentümer (= Betreiber bei Residential) ──
  text('Vorname Name bzw Firmenname_2', customer);
  text('Telefon_2', project.phone);
  text('Straße Hausnummer_3', project.address?.line);
  text('PLZ Ort_3', plzOrt);
  text('EMail_2', project.email);

  // ── 4. Anlagenerrichter = Volta (Felder mit _3/_4 Suffix) ──
  text('Vorname Name bzw Firmenname_3', VOLTA.name);
  text('Telefon_3', VOLTA.phone);
  text('Straße Hausnummer_4', VOLTA.street);
  text('PLZ Ort_4', VOLTA.plzOrt);
  text('EMail_3', VOLTA.email);

  // ── Anlagenart (4 Checkboxen: Neuanlage, Erweiterung, Rückbau, Austausch) ──
  check('anlagenart'); // 1. Widget = Neuanlage

  // Funkrundsteuerempfänger — ja, immer bei PV
  check('Funkrundsteuerempfänger');

  // ═══ SEITE 2: Unterlagen & Netzanschluss ══════════════════════════════

  // Beigefügte Unterlagen
  check('Anmeldung zum Netzanschluss Strom beigefügt bitte');
  check('Lageplan mit Aufstellungsort der Erzeugungsanlage beigefügt');
  check('Einheitenzertifikate nach VDEARN 4105 beigefügt');
  check('Zertifikat für den NASchutz beigefügt');
  check('Übersichtsschaltplan einpolige Darstellung ab Netzanschluss beigefügt inkl Anordnung der');
  check('Vollmacht für AnlagenerrichterElektrofachbetrieb beigefügt');

  // Netzanschluss
  check('niederspannung');   // Niederspannung

  // Datenblatt-Checkboxen
  check('Datenblatt Erzeugungsanlagen bis einschließlich 30 kW');
  if (project.battery) {
    check('Datenblatt Speicher bis einschließlich 30 kW');
  }

  // ═══ SEITE 3: Datenblatt Erzeugungsanlagen ════════════════════════════
  // Erzeugungseinheit = Wechselrichter (das Gerät am Netz)

  // Energieart = Sonne (Photovoltaik)
  check('energieart');

  // ── Row 1: Wechselrichter ──
  const wr = wrModelName(project);
  text('Hersteller', wr.hersteller);
  text('TypModell', wr.typ);
  const wrPower = wrKw(project);
  text('leistung1', num(wrPower));                        // Nennleistung pro WR (kW)
  text('anzahl1', String(project.inverterCount ?? 1));    // Anzahl WR
  const wrTotal = (wrPower ?? 0) * (project.inverterCount ?? 1);
  text('gesamtleistung1', num(wrTotal || undefined));     // Gesamt WR kW

  // Inselbetrieb der Erzeugungseinheit
  if (!hatNotstrom(project)) {
    check('inselbetrieb1'); // kein Inselbetrieb
  } else {
    check('inselbetrieb2'); // Inselbetrieb möglich
  }

  // Summenfelder
  text('Summe in kW', num(wrTotal || wrPower));           // Gesamt Wirkleistung WR
  text('Summe in kWp', num(project.kwp));                 // Gesamt installierte Modulleistung

  // Einspeisung
  check('einspeisung'); // Überschusseinspeisung
  text('Überschussstromeinspeisung über derzeitigen Bezugszähler', 'ja');

  // ═══ SEITE 4: Datenblatt Speicher ═════════════════════════════════════

  // Phasen-Anschluss (Drehstrom/Wechselstrom)
  if (phasen(project) === 3) check('anschluss'); // 1. Widget = Drehstrom (3-phasig)

  if (project.battery) {
    // ── Row 4: Speichereinheit ──
    const bat = batModelName(project);
    text('Hersteller_4', bat.hersteller);
    text('TypModell_4', bat.typ);
    const batDischargePerModule = batKwPerModule(project);
    text('nennleistung4', num(batDischargePerModule));                    // Entladeleistung pro Modul kW
    text('anzahl4', String(project.batteryModuleCount ?? 1));             // Anzahl Batterie-Module
    text('gesamtleistung4', num(batKwTotal(project)));                    // Gesamt Entladeleistung kW

    // Speicher-Inselbetrieb
    if (!hatNotstrom(project)) {
      check('inselbetrieb4'); // kein Inselbetrieb
    } else {
      check('inselbetrieb5'); // Inselbetrieb möglich
    }

    // Summenfelder Speicher
    text('Summe in kW_2', num(batKwTotal(project)));                     // Gesamt Speicher kW
    text('Summe in kWh', num(batKwhTotal(project)));                     // Gesamt Speicher kWh
  }

  // Primärenergieträger
  text('Verwendete Primärenergieträger z B Sonne Wind Gas', 'Sonne');

  // NA-Schutz
  if (naSchutzIntegriert(project)) check('Ja_5'); // Integrierter NA-Schutz

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

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Anschlussort (Anlagenstandort) ──
  text('Straße und HausNr ggf Anschlussnutzer', project.address?.line);
  text('Postleitzahl Ort', plzOrt);

  // ── Art der Anmeldung ──
  check('anmeldung');           // Neuanmeldung
  check('Erzeugungsanlagen');   // Erzeugungsanlagen
  check('Steuerbarkeit § 14a'); // Steuerbarkeit §14a EnWG

  // ── Abschnitt 5: Anschlussnutzer (= Kunde) ──
  text('Name Vorname bzw Firmenname', customer);
  text('Straße und HausNr', project.address?.line);
  text('Postleitzahl Ort_3', plzOrt);
  text('Telefon Fax EMail', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Abschnitt 5: Betreiber (= Anschlussnutzer bei Residential) ──
  text('Name Vorname bzw Firmenname_2', customer);
  text('Straße und HausNr_2', project.address?.line);
  text('Postleitzahl Ort_4', plzOrt);
  text('Telefon Fax EMail_2', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Abschnitt 7: Errichter = Volta ──
  text('Firmenname', VOLTA.name);
  text('Straße und HausNr_3', VOLTA.street);
  text('Postleitzahl Ort_5', VOLTA.plzOrt);
  text('Telefon Fax EMail_3', [VOLTA.phone, VOLTA.email].filter(Boolean).join(' / '));

  // ── Geräteeintrag Zeile 1 (4_*): Wechselrichter / EZA ──
  // 4_a = Verwendungszweck: b) = Erzeugungsanlagen
  dropdown('4_a', 'b)');
  const wr = wrModelName(project);
  text('4_b', wr.hersteller);                              // Hersteller
  text('4_c', wr.typ);                                      // Typ/Modell
  text('4_d', String(project.inverterCount ?? 1));           // Anzahl
  text('4_e', num(wrKw(project)));                           // Nennleistung kW
  text('4_g', num(project.kwp));                             // kWp Modulleistung
  // 4_i = Strom pro Phase → WR kW / 3 Phasen / 230V ≈ A pro Phase
  const wrA = wrKw(project) ? Math.round((wrKw(project)! * 1000) / (3 * 230)) : undefined;
  text('4_i', wrA ? String(wrA) : undefined);

  // ── Geräteeintrag Zeile 2 (41_*): Speicher ──
  if (project.battery) {
    dropdown('41_a', 'b)');
    const bat = batModelName(project);
    text('41_b', bat.hersteller);
    text('41_c', bat.typ);
    text('41_d', String(project.batteryModuleCount ?? 1));   // Anzahl Module
    text('41_e', num(batKwTotal(project)));                  // Gesamt Entladeleistung kW
    text('41_k', num(batKwhTotal(project)));                 // Gesamt kWh
  }

  // ── Terminwunsch ──
  // text('6 Terminwunsch', ''); // Leer lassen — Katrin füllt manuell

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

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber ──
  text('Vorname Name bzw Firmenname', customer);
  text('Telefon', project.phone);
  text('Straße Hausnummer', project.address?.line);
  text('PLZ Ort', plzOrt);
  text('EMail', project.email);

  // ── Anlagenstandort (_2 suffix) ──
  text('Straße Hausnummer_2', project.address?.line);
  text('PLZ Ort_2', plzOrt);

  // ── Errichter = Volta ──
  text('Vorname Name bzw Firmenname_2', VOLTA.name);
  text('Telefon_2', VOLTA.phone);
  text('Straße Hausnummer_3', VOLTA.street);
  text('PLZ Ort_3', VOLTA.plzOrt);
  text('EMail_2', VOLTA.email);

  // ── Technische Daten (aus EcoFlow-Datenblatt) ──
  text('kVA', num(wrKva(project)));                          // Scheinleistung WR (kVA)
  text('kW', num(wrKw(project)));                            // Wirkleistung WR (kW)
  text('kWp', num(project.kwp));                             // Installierte Modulleistung (kWp)

  if (project.battery) {
    text('kWh', num(batKwhTotal(project)));                  // Speicher gesamt kWh
    text('kVA_2', num(batKwTotal(project)));                 // Speicher Scheinleistung kVA
    text('kW_2', num(batKwTotal(project)));                  // Speicher Wirkleistung kW
    // kW_3 = Notstrom-Ausgangsleistung (wenn vorhanden)
    if (hatNotstrom(project) && project.inverterSpec?.backupPowerKw) {
      text('kW_3', num(project.inverterSpec.backupPowerKw));
    }
  }

  // ── Checkboxen ──
  check('Übereinstimmung des ausgefüllten Datenblattes Datenerfassungsblatt oder EinspeiserPortal mit dem');
  if (naSchutzIntegriert(project)) {
    check('Integrierter NASchutz vorhanden');
    check('funktionstest'); // Funktionstest NA-Schutz durchgeführt
  }
  // Funkrundsteuerempfänger eingebaut
  check('funkrundsteuerempfänger');

  try { form.updateFieldAppearances(); } catch { /* on save */ }
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
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

export function tenDocsForProject(_project: ProjectData): TenDocType[] {
  return ['an005', 'ans', 'an002'];
}
