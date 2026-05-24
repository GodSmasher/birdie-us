// Fills the VDE-AR-N 4105 Formular E.2 (Anmeldung Erzeugungsanlage) from project
// data. Field mapping confirmed by decoding the form labels. Only high-confidence
// fields are pre-filled; the rest stays editable for human review before submission.

import { PDFDocument } from 'pdf-lib';
import { downloadDriveFile } from './google-server';
import type { ProjectData } from './projektdaten';

const E2_TEMPLATE_ID = process.env.VDE_E2_TEMPLATE_ID || '1chcs6b0Zp6PYXJxGviY4au2zCDqegxYE';

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
  // Erzeugungseinheit Hersteller/Typ (Modul)
  if (project.moduleType) {
    text('Hersteller', project.moduleType.split(' ')[0]);
    text('Typ', project.moduleType);
  }
  // Anzahl baugleicher Einheiten + max. Wirkleistung (kW)
  if (project.moduleCount) text('E2_Text8', String(project.moduleCount));
  if (project.kwp > 0) text('E2_Text9', String(project.kwp).replace('.', ','));

  try {
    form.updateFieldAppearances();
  } catch {
    /* appearances generated on save */
  }
  return pdf.save();
}
