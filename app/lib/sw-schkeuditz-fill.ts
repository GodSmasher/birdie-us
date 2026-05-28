// SW Schkeuditz — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   swsk-speicher = Datenblatt für Speicher (ANA) — 42 Felder, 2 Seiten
//
// Hinweis: ANA_SWSK (208 Felder) und DB_EEA_SWSK (350 Felder) haben
//          generische Feldnamen (Check Box1, Text2 etc.) — ohne
//          visuelles Positionsmapping nicht sicher befüllbar.
//
// Templates: nb-templates/SW Schkeuditz/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';

const VOLTA = {
  name:   process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  street: process.env.INSTALLER_ADDRESS || 'Am Schenkberg 12',
  plzOrt: process.env.INSTALLER_PLZORT  || '04349 Leipzig',
};

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Schkeuditz');
const TEMPLATES = {
  'swsk-speicher': path.join(TMPL_DIR, 'ANA', 'Datenblatt_fuer_Speicher_2021.pdf'),
};

function num(v?: number): string { return v != null ? String(v).replace('.', ',') : ''; }
function loadTemplate(key: keyof typeof TEMPLATES): Buffer { return fs.readFileSync(TEMPLATES[key]); }

function wrKw(p: ProjectData): number | undefined { return p.inverterSpec?.ratedPowerKw ?? p.inverterKw; }
function wrKva(p: ProjectData): number | undefined { return p.inverterSpec?.apparentPowerKva ?? wrKw(p); }

// ═══════════════════════════════════════════════════════════════════════════
// swsk-speicher — Datenblatt für Speicher (2 Seiten, 42 Felder)
// ═══════════════════════════════════════════════════════════════════════════
//
// Betreiber, Installateur, Speicherdaten (Hersteller, Typ, Kapazität,
// Entladeleistung), Wechselrichter, Primärenergie, Anschlussbild
//
export async function fillSWSKSpeicher(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swsk-speicher'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };

  // ── Betreiber ──
  text('Vorname Name', customer);
  text('Straße Hausnummer', project.address?.line);
  text('PLZ Ort', [project.address?.zip, project.address?.city].filter(Boolean).join(' '));
  text('Telefon EMail', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Installateur ──
  text('Firma Ort', VOLTA.name + ', ' + VOLTA.plzOrt);
  text('Straße Hausnummer_2', VOLTA.street);

  // ── Speicher ──
  if (project.battery) {
    text('Hersteller Typ', project.battery);
    text('Batterietechnologie', 'LiFePO4');
    text('Nutzbare Speicherkapazität', project.batterySpec ? num(project.batterySpec.capacityKwh) : undefined);
    text('Maximale Entladeleistung', project.batterySpec ? num(project.batterySpec.capacityKwh) : undefined);
    text('Anzahl', String(project.batteryModuleCount ?? 1));
  }

  // ── Wechselrichter ──
  const wr = project.inverterSpec
    ? 'EcoFlow ' + project.inverterSpec.model.replace('EcoFlow ', '')
    : project.inverter || '';
  text('HerstellerTyp', wr);
  text('kVA', num(wrKva(project)));
  text('KW', num(wrKw(project)));

  // ── Primärenergie ──
  text('Verwendete Primärenergieträger zB Sonne Wind Gas', 'Sonne');

  // ── Netzbetreiber ──
  text('Netzbetreiber', 'SW Schkeuditz');

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SwskDocType = 'swsk-speicher';

const FILLERS: Record<SwskDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'swsk-speicher': fillSWSKSpeicher,
};
const LABELS: Record<SwskDocType, string> = {
  'swsk-speicher': 'SWSK-Datenblatt-Speicher',
};

export function swskDocLabel(type: SwskDocType): string { return LABELS[type]; }
export async function fillSwskDoc(type: SwskDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
