// Bayernwerk — NB-spezifische PDF-Formularfüller.
//
// Bayernwerk-Workflow:
//   ANA: Nur Vollmacht — liegt schon unterschrieben in Reonic, wird per Files-API geholt
//   FM:  E.8 Inbetriebsetzungsprotokoll + ÜSB (manuell)
//
// Template: nb-templates/Bayernwerk/FM/E8_Inbetriebsetzungsprotokoll.pdf

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen, hatNotstrom, naSchutzIntegriert } from './geschaeftsregeln';

const VOLTA = {
  name: process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT || '04349 Leipzig',
  phone: process.env.INSTALLER_PHONE || '',
  email: process.env.INSTALLER_EMAIL || '',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'Bayernwerk');

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }

// ── E.8 Inbetriebsetzungsprotokoll ─────────────────────────────────────

// VDE-AR-N 4105 E.8 field mapping (confirmed from PDF field extraction):
//
// E8_Text1  = Anlagenbetreiber (Name)
// E8_Text2  = Straße, Hausnummer
// E8_Text3  = PLZ, Ort
// E8_Text4  = Errichter (Firma)
// E8_Text5  = Straße Errichter
// E8_Text6  = PLZ Ort Errichter
// E8_Text7  = Eintragungsnr. Installateurverzeichnis
// E8_Text8  = Datum der Inbetriebsetzung
// E8_Text9  = Zähler-/Anschlussnummer
// E8_Text10 = Hersteller WR
// E8_Text11 = Typ WR
// E8_Text12 = Nennleistung WR (kW/kVA)
// E8_Text14 = Anzahl WR
// E8_Text15 = Hersteller Speicher
// E8_Text16 = Typ Speicher
// E8_Text17 = Speicherkapazität (kWh)
// E8_Text18 = Anzahl Speicher
// E8_Text19 = Hersteller Module
// E8_Text21 = Typ Module
// E8_Text24 = Installierte Modulleistung (kWp)
// E8_Text38 = Bemerkungen
//
// Checkboxes:
// E8_Check Box26 = Sonne (Energieart)
// E8_Check Box28 = Wind
// E8_Check Box30 = Wasser
// E8_Check Box32 = Biogas
// E8_Check Box34 = Erdgas
// E8_Check Box36 = Sonstige
// E8_Check Box27 = 1-phasig
// E8_Check Box31 = 3-phasig / Drehstrom
// E8_Check Box35 = NA-Schutz vorhanden
// E8_E8_Check Box25 = Überschusseinspeisung
// E8_E8_Check Box33 = Volleinspeisung
// E8_E8_E8_Check Box29 = Inselbetrieb nein
// E8_E8_E8_E8_Check Box39 = Inselbetrieb ja
// E8_Check Box40 = Prüfung bestanden
//
// RadioGroups:
// E8_Group37 = Netzform (TN-C, TN-S, TT)
// E8_Group38 = Schutzeinrichtung
// E8_Group39 = Erdung

export type BayernwerkDocType = 'bw-e8' | 'bw-uesb';

export function bayernwerkDocLabel(form: string): string {
  if (form === 'bw-e8') return 'E.8 Inbetriebsetzungsprotokoll';
  if (form === 'bw-uesb') return 'Übersichtsschaltbild';
  return form;
}

export async function fillBayernwerkDoc(
  form: string,
  project: ProjectData,
  customer: string,
): Promise<Uint8Array | null> {
  if (form === 'bw-e8') return fillE8(project, customer);
  if (form === 'bw-uesb') return fillUeSB(project, customer);
  return null;
}

async function fillE8(project: ProjectData, customer: string): Promise<Uint8Array> {
  const tmplPath = path.join(TMPL_DIR, 'FM', 'E8_Inbetriebsetzungsprotokoll.pdf');
  const pdf = await PDFDocument.load(fs.readFileSync(tmplPath));
  const form = pdf.getForm();

  const text = (name: string, val?: string) => {
    if (!val) return;
    try { form.getTextField(name).setText(val); } catch { /* absent */ }
  };
  const check = (name: string) => {
    try { form.getCheckBox(name).check(); } catch { /* absent */ }
  };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Anlagenbetreiber (Kunde) ──
  text('E8_Text1', customer);
  text('E8_Text2', project.address?.line);
  text('E8_Text3', plzOrt);

  // ── Errichter = Volta ──
  text('E8_Text4', VOLTA.name);
  text('E8_Text5', VOLTA.street);
  text('E8_Text6', VOLTA.plzOrt);

  // ── Datum (leer lassen — wird bei tatsächlicher IBN eingetragen) ──
  // text('E8_Text8', new Date().toLocaleDateString('de-DE'));

  // ── Feld-Mapping verifiziert über E8_FIELDMAP.pdf ──
  //
  // E8_Text7  = max. Scheinleistung S_Amax (kVA)
  // E8_Text8  = max. Wirkleistung P_Amax (kW)
  // E8_Text9  = Modulleistung P_Agen (kWp)
  // E8_Text10 = Integrierter NA-Schutz: Eingestellter Wert U>
  // E8_Text11 = Zentraler NA-Schutz: Eingestellter Wert U>
  // E8_Text12 = Eingestellte Wirkleistung P_AV,E (kW)
  // E8_Text14 = Summe S_Emax vorhandene L1 (kVA)
  // E8_Text15 = Summe S_Emax vorhandene L2 (kVA)
  // E8_Text16 = Summe S_Emax vorhandene L3 (kVA)
  // E8_Text17 = Summe S_Emax neu L1 (kVA)
  // E8_Text18 = Summe S_Emax neu L2 (kVA)
  // E8_Text19 = Summe S_Emax neu L3 (kVA)
  // E8_Text21 = Datum der Inbetriebsetzung
  // E8_Text24 = Ort, Datum (Unterschrift)
  // E8_Text38 = fester Verschiebungsfaktor cos φ

  // max. Scheinleistung = WR-Nennleistung (kVA ≈ kW bei cos φ = 1)
  const wrKwVal = project.inverterKw ?? (project.kwp > 0 ? project.kwp : undefined);
  text('E8_Text7', num(wrKwVal));  // kVA
  text('E8_Text8', num(wrKwVal));  // kW

  // Modulleistung kWp
  text('E8_Text9', num(project.kwp));

  // NA-Schutz Werte (Standard EcoFlow: U> = 253V)
  // Leer lassen — manuell eintragen je nach WR-Einstellung
  // text('E8_Text10', '253');
  // text('E8_Text11', '');

  // Eingestellte Wirkleistung P_AV,E = 60% der Modulleistung (§14a)
  if (project.kwp > 0) {
    const pavE = Math.round(project.kwp * 0.6 * 10) / 10;
    text('E8_Text12', num(pavE));
  }

  // Symmetrie L1/L2/L3 — bei 3-phasigem WR gleichmäßig verteilt
  if (wrKwVal && phasen(project) === 3) {
    const perPhase = num(Math.round((wrKwVal / 3) * 10) / 10);
    // Neu hinzukommende Anlagen (Zeile "neu")
    text('E8_Text17', perPhase);
    text('E8_Text18', perPhase);
    text('E8_Text19', perPhase);
    // Vorhandene leer lassen (keine Bestandsanlage)
  }

  // Datum der Inbetriebsetzung — leer lassen (wird bei IBN eingetragen)
  // text('E8_Text21', '');

  // Ort, Datum (Unterschriftszeile) — leer lassen
  // text('E8_Text24', '');

  // ── Checkboxen (aus Fieldmap verifiziert) ──
  // E8_Check Box26 = Übereinstimmung E.2/E.3 mit Anlagenaufbau → ja
  check('E8_Check Box26');
  // E8_Check Box28 = Abrechnungsmessung Vorinbetriebsetzung → nicht vorausfüllen
  // E8_Check Box30 = Einheitenzertifikat vorhanden → ja
  check('E8_Check Box30');
  // E8_Check Box32 = Leistungsflussüberwachung (P_AV,E) → ja bei §14a
  check('E8_Check Box32');
  // E8_Check Box34 = NA-Schutz Zertifikat vorhanden → ja
  check('E8_Check Box34');
  // E8_Check Box36 = Drosselung auf 60% eingestellt → ja (Standard)
  check('E8_Check Box36');
  // E8_Check Box40 = ferngesteuerte Leistungsreduzierung durch NB → ja (§14a)
  check('E8_Check Box40');
  // E8_Check Box27 = Auslösekreis Ruhestromprinzip → ja
  check('E8_Check Box27');
  // E8_Check Box31 = Drehstromgenerator/dreiphasiger Umrichter → ja bei 3-phasig
  if (phasen(project) === 3) check('E8_Check Box31');
  // E8_Check Box35 = Energieflussrichtungssensor Funktionstest → nicht vorausfüllen
  // E8_E8_Check Box25 = TF-Sperren eingebaut → ja
  check('E8_E8_Check Box25');
  // E8_E8_Check Box33 = Prüfprotokoll liegt vor → ja
  check('E8_E8_Check Box33');

  return pdf.save();
}

// ── ÜSB (Übersichtsschaltbild) ─────────────────────────────────────────
//
// Das ÜSB hat mehrere Varianten (Buttons):
//   "nur V3"                                    = Standard PV + Speicher
//   "V3 mit Wallbox"                            = PV + Speicher + Wallbox
//   "V3 mit weiterem Wechselrichter"            = PV + 2 WR
//   "V3 mit weiterem Wechselrichter und Wallbox" = PV + 2 WR + Wallbox
//   "V2.1"                                      = PV ohne Speicher
//   "V2.1 mit Wallbox"                          = PV ohne Speicher + Wallbox
//
// Felder (Textfelder — Nummern sind Positions-IDs im Schaltplan):
//   1  = Kunde/Anlagenbetreiber Name
//   4  = Adresse Straße
//   5  = PLZ Ort
//   11 = Installateur (Volta)
//   20 = Zählernummer (optional, aus Enrichment)
//   W2-Hersteller / W2-Typ / W2-Anzahl / W2-AC-Ausgangsleistung = Wechselrichter 1
//   W3-* = Wechselrichter 2 (nur bei Variante "weiterem WR")
//   24 = Modulleistung kWp
//   25 = Modultyp/Hersteller
//   26 = Modulanzahl
//   36 = Speicher Hersteller+Typ
//   59 = Speicher kWh
//   60 = Speicher Anzahl Module

async function fillUeSB(project: ProjectData, customer: string): Promise<Uint8Array> {
  const tmplPath = path.join(TMPL_DIR, 'FM', 'UeSB.pdf');
  const pdf = await PDFDocument.load(fs.readFileSync(tmplPath));
  const form = pdf.getForm();

  const text = (name: string, val?: string) => {
    if (!val) return;
    try { form.getTextField(name).setText(val); } catch { /* absent */ }
  };
  const check = (name: string) => {
    try { form.getCheckBox(name).check(); } catch { /* absent */ }
  };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Kunde ──
  text('1', customer);
  text('4', project.address?.line);
  text('5', plzOrt);

  // ── Installateur ──
  text('11', VOLTA.name);

  // ── Variante wählen: V3 = mit Speicher, V2.1 = ohne ──
  // Die "Button"-Felder steuern Sichtbarkeit von Schaltplan-Varianten.
  // Standard: "nur V3" (PV + Speicher, 1 WR, keine Wallbox)
  // Buttons sind PDF-Pushbuttons — nicht anklickbar per pdf-lib, Variante bleibt Default.

  // ── Wechselrichter 1 ──
  if (project.inverter) {
    const parts = project.inverter.split(/\s+/);
    text('W2-Hersteller', parts[0]);
    text('W2-Typ', parts.slice(1).join(' '));
    text('W2-Anzahl', String(project.inverterCount ?? 1));
    text('W2-AC-Ausgangsleistung', num(project.inverterKw));
    // Phase zuordnen — leere das nicht-zutreffende Feld explizit
    if (phasen(project) === 3) {
      text('Drehstrom', 'X');
      try { form.getTextField('Wechselstrom').setText(''); } catch {}
    } else {
      text('Wechselstrom', 'X');
      try { form.getTextField('Drehstrom').setText(''); } catch {}
    }
  }

  // ── Module ──
  text('24', num(project.kwp));
  if (project.moduleType) {
    text('25', project.moduleType);
  }
  text('26', project.moduleCount > 0 ? String(project.moduleCount) : undefined);

  // ── Speicher ──
  if (project.battery) {
    text('36', project.battery);
    text('59', num(project.batteryKwh));
    text('60', String(project.batteryModuleCount ?? 1));
  }

  return pdf.save();
}
