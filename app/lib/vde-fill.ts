// Fills the VDE-AR-N 4105 Formular E.2 (Anmeldung Erzeugungsanlage) from project
// data. Field mapping confirmed by decoding the form labels. Only high-confidence
// fields are pre-filled; the rest stays editable for human review before submission.

import { PDFDocument } from 'pdf-lib';
import { downloadDriveFile } from './google-server';
import type { ProjectData } from './projektdaten';
import { phasen, speicherkopplung, hatNotstrom, naSchutzIntegriert } from './geschaeftsregeln';

const E2_TEMPLATE_ID = process.env.VDE_E2_TEMPLATE_ID || '1chcs6b0Zp6PYXJxGviY4au2zCDqegxYE';
const E3_TEMPLATE_ID = process.env.VDE_E3_TEMPLATE_ID || '1t_ErQV7Xj7NWmKvr2H_XTXE5gTEn4PpZ';

// Installer (Errichter) — constant across all forms. Overridable via env.
const INSTALLER = {
  company: process.env.INSTALLER_COMPANY || 'Volta Energietechnik GmbH',
  address: process.env.INSTALLER_ADDRESS || '',
  contact: process.env.INSTALLER_CONTACT || '',
};

export async function fillE2(project: ProjectData, customerName: string): Promise<Uint8Array | null> {
  const bytes = await downloadDriveFile(E2_TEMPLATE_ID);
  if (!bytes) return null;

  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const text = (name: string, val?: string) => {
    if (!val) return;
    try {
      form.getTextField(name).setText(val);
    } catch {
      /* field absent in this template variant */
    }
  };
  const check = (name: string) => {
    try {
      form.getCheckBox(name).check();
    } catch {
      /* ignore */
    }
  };

  // Anlagenanschrift (E2_Text1 Name · E2_Text2 Straße · E2_Text3 PLZ/Ort)
  text('E2_Text1', customerName);
  if (project.address) {
    text('E2_Text2', project.address.line);
    text('E2_Text3', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }
  // Energieart = Sonne
  check('Sonne');
  // Erzeugungseinheit = WECHSELRICHTER (nicht Module!)
  // Hersteller = erstes Wort des Inverter-Strings, Typ = Rest
  if (project.inverter) {
    const parts = project.inverter.split(/\s+/);
    text('Hersteller', parts[0]);
    text('Typ', parts.slice(1).join(' ') || project.inverter);
  }
  // Anzahl baugleicher Einheiten = Anzahl Wechselrichter (i.d.R. 1)
  text('E2_Text8', String(project.inverterCount ?? 1));
  // max. Wirkleistung = Wechselrichter-Nennleistung in kW
  const wrKw = project.inverterKw ?? (project.kwp > 0 ? project.kwp : undefined);
  if (wrKw) text('E2_Text9', String(wrKw).replace('.', ','));
  // Netzanschluss-Phasen — Volta: immer 3-phasig (bestätigt 2026-05-26)
  check(phasen(project) === 3 ? '3-phasig' : '1-phasig');
  // NA-Schutz — immer integriert im Wechselrichter
  if (naSchutzIntegriert(project)) check('NA-Schutz');
  // Überschusseinspeisung (bestätigt)
  check('Ueberschusseinspeisung');
  // Speicherkopplung: DC-gekoppelt
  if (project.battery) {
    check(speicherkopplung(project) === 'dc' ? 'DC-gekoppelt' : 'AC-gekoppelt');
    if (hatNotstrom(project)) {
      check('Notstrom');
      check('Inselbildend');
      check('Schwarzstartfaehig');
    }
  }

  try {
    form.updateFieldAppearances();
  } catch {
    /* appearances generated on save */
  }
  return pdf.save();
}

// VDE-AR-N 4105 E.3 — Errichtungsbestätigung Stromspeicher (battery projects).
export async function fillE3(project: ProjectData, customerName: string): Promise<Uint8Array | null> {
  const bytes = await downloadDriveFile(E3_TEMPLATE_ID);
  if (!bytes) return null;
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const text = (name: string, val?: string) => {
    if (!val) return;
    try { form.getTextField(name).setText(val); } catch { /* absent */ }
  };
  const check = (name: string) => {
    try { form.getCheckBox(name).check(); } catch { /* absent */ }
  };

  // Anlagenanschrift
  text('E3_Text1', customerName);
  if (project.address) {
    text('E3_Text2', project.address.line);
    text('E3_Text3', [project.address.zip, project.address.city].filter(Boolean).join(' '));
  }
  // Errichter (Volta — konstant)
  text('E3_Text4', INSTALLER.company);
  text('E3_Text5', INSTALLER.address);
  text('E3_Text6', INSTALLER.contact);
  // Speichersystem
  if (project.battery) {
    text('E3_Text7', project.battery);
    text('E3_Text8', '1');
  }
  if (project.batteryKwh) text('E3_Text9', String(project.batteryKwh).replace('.', ','));
  // Kopplung: immer DC-gekoppelt (bestätigt 2026-05-26)
  check(speicherkopplung(project) === 'dc' ? 'DC-gekoppelt' : 'AC-gekoppelt');
  // Notstrom nur bei Notstromersatzpaket
  if (hatNotstrom(project)) {
    check('Notstrom');
    check('Inselbildend');
    check('Schwarzstartfaehig');
  }

  try { form.updateFieldAppearances(); } catch { /* on save */ }
  return pdf.save();
}
