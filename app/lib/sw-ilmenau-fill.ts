// SW Ilmenau — NB-spezifische PDF-Formularfüller.
//
// Formulare:
//   swi-f2  = F.2 Technisches Datenblatt Erzeugungsanlagen (ANA) — 50 Felder
//
// Templates: nb-templates/SW Ilmenau/

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import type { ProjectData } from './projektdaten';
import { phasen, hatNotstrom } from './geschaeftsregeln';

const TMPL_DIR = path.join(process.cwd(), 'nb-templates', 'SW Ilmenau');
const TEMPLATES = {
  'swi-f2': path.join(TMPL_DIR, 'ANA', 'Anlage_3a_-_Technisches_Datenblatt_für_Erzeugungsanlagen__F.2_ (1).pdf'),
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
function wrNennstromA(p: ProjectData): number | undefined {
  const kw = wrKw(p);
  return kw ? Math.round((kw * 1000) / (Math.sqrt(3) * 400)) : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// swi-f2 — F.2 Technisches Datenblatt Erzeugungsanlagen (1 Seite)
// ═══════════════════════════════════════════════════════════════════════════
//
// Betreiber, Energieträger, Generator (WR), Phasen, Inselbetrieb,
// Synchron/Asynchron, Leistungsdaten, Bemerkungen
//
export async function fillSWIF2(project: ProjectData, customer: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(loadTemplate('swi-f2'));
  const form = pdf.getForm();
  const text = (n: string, v?: string) => { if (!v) return; try { form.getTextField(n).setText(v); } catch {} };
  const check = (n: string) => { try { form.getCheckBox(n).check(); } catch {} };

  const plzOrt = project.address ? [project.address.zip, project.address.city].filter(Boolean).join(' ') : '';

  // ── Betreiber ──
  text('Name Vorname', customer);
  text('Straße Hausnummer', project.address?.line);
  text('PLZ Ort', plzOrt);
  text('TelefonEmail', [project.phone, project.email].filter(Boolean).join(' / '));

  // ── Energieträger ──
  check('Kontrollkästchen1');                          // Sonne (y=575, x=174)

  // ── Phasen ──
  if (phasen(project) === 3) {
    check('Kontrollkästchen10');                        // 3-phasig (y=481, x=367)
    check('Kontrollkästchen11');                        // Drehstrom (y=480, x=459)
  }

  // ── Inselbetrieb ──
  if (hatNotstrom(project)) {
    check('Kontrollkästchen12');                        // Inselbetriebsfähig = Ja (y=461, x=457)
    check('Kontrollkästchen14');                        // Schwarzstartfähig = Ja (y=444, x=457)
  } else {
    check('Kontrollkästchen13');                        // Inselbetriebsfähig = Nein (y=461, x=525)
    check('Kontrollkästchen15');                        // Schwarzstartfähig = Nein (y=444, x=525)
  }

  // ── Leistungsdaten ──
  text('kW', num(wrKw(project)));                      // Wirkleistung kW
  text('kVA', num(wrKva(project)));                    // Scheinleistung kVA
  const nennstrom = wrNennstromA(project);
  text('A', nennstrom ? String(nennstrom) : undefined); // Nennstrom A

  // ── Wechselrichter ──
  const wr = wrModelName(project);
  text('Hersteller', wr.hersteller);
  text('Typ', wr.typ);
  text('Anzahl baugleicher Einheiten', String(project.inverterCount ?? 1));

  // ── Generator-Leistungsdaten ──
  text('P', num(project.kwp));                         // Generator-Wirkleistung kWp
  text('S', num(wrKva(project)));                      // Generator-Scheinleistung kVA
  text('Un', '400');                                    // Nennspannung 400V (3-phasig)
  text('Ir', nennstrom ? String(nennstrom) : undefined); // Nennstrom

  // ── Umrichtertyp: selbstgeführt (WR = Wechselrichter) ──
  check('Kontrollkästchen22');                          // selbstgeführt (y=210, x=291)
  check('Kontrollkästchen23');                          // mit Pulsweitenmodulation (y=211, x=399)

  try { form.updateFieldAppearances(); } catch {}
  return pdf.save();
}

// ═══════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════
export type SwiDocType = 'swi-f2';

const FILLERS: Record<SwiDocType, (p: ProjectData, c: string) => Promise<Uint8Array>> = {
  'swi-f2': fillSWIF2,
};
const LABELS: Record<SwiDocType, string> = {
  'swi-f2': 'SWI-F2-Datenblatt-EZA',
};

export function swiDocLabel(type: SwiDocType): string { return LABELS[type]; }
export async function fillSwiDoc(type: SwiDocType, project: ProjectData, customer: string): Promise<Uint8Array> {
  return FILLERS[type](project, customer);
}
