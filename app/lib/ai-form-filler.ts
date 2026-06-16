// AI-powered PDF form filler — works with ANY Netzbetreiber template.
// Instead of hardcoded field mappings per NB, uses Claude to understand
// what each field expects and fills it from project data.
//
// Flow:
// 1. Extract all form field names from the template
// 2. Send field names + project data to Claude
// 3. Claude returns a mapping: { fieldName: value }
// 4. Fill the PDF with the AI-generated values

import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import type { ProjectData } from './projektdaten';
import { findInverter, findBattery } from './ecoflow-specs';

interface FieldInfo {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'button';
  currentValue?: string;
}

/** Extract all form fields from a PDF template. */
function extractFields(pdf: PDFDocument): FieldInfo[] {
  const form = pdf.getForm();
  return form.getFields().map((f) => {
    const name = f.getName();
    // Use instanceof instead of constructor.name — constructor names get minified in bundled code!
    let mappedType: FieldInfo['type'] = 'button';
    let currentValue: string | undefined;
    if (f instanceof PDFTextField) {
      mappedType = 'text';
      try { currentValue = f.getText() || undefined; } catch {}
    } else if (f instanceof PDFCheckBox) {
      mappedType = 'checkbox';
    } else if (f instanceof PDFDropdown) {
      mappedType = 'dropdown';
    } else if (f instanceof PDFRadioGroup) {
      mappedType = 'radio';
    }
    return { name, type: mappedType, currentValue };
  }).filter((f) => f.type !== 'button');
}

/** Build the project context string for the AI prompt. */
function buildProjectContext(project: ProjectData, customer: string, netzbetreiber: string): string {
  // Use EcoFlow spec sheets for accurate data (overrides Reonic component strings)
  const invSpec = project.inverterSpec ?? (project.inverter ? findInverter(project.inverter) : undefined);
  const batSpec = project.batterySpec ?? (project.battery ? findBattery(project.battery) : undefined);

  // Inverter: prefer spec sheet, fallback to Reonic string
  let inverterBrand = '—';
  let inverterModel = '—';
  let inverterFull = project.inverter ?? '—';
  let inverterKw = project.inverterKw;
  if (invSpec) {
    inverterBrand = 'EcoFlow';
    inverterModel = invSpec.model.replace('EcoFlow ', '');
    inverterFull = invSpec.model;
    inverterKw = invSpec.ratedPowerKw;
  } else if (inverterFull !== '—') {
    const parts = inverterFull.split(/\s+/);
    inverterBrand = parts[0] ?? '—';
    inverterModel = parts.slice(1).join(' ') || '—';
  }

  // Battery: prefer spec sheet
  let batteryBrand = '—';
  let batteryModel = '—';
  let batteryFull = project.battery ?? 'keiner';
  let batteryKwh = project.batteryKwh;
  if (batSpec) {
    batteryBrand = 'EcoFlow';
    batteryModel = batSpec.model.replace('EcoFlow ', '');
    batteryFull = batSpec.model;
    batteryKwh = batSpec.capacityKwh * (project.batteryModuleCount ?? 1);
  } else if (batteryFull !== 'keiner') {
    const parts = batteryFull.split(/\s+/);
    batteryBrand = parts[0] ?? '—';
    batteryModel = parts.slice(1).join(' ') || '—';
  }

  const lines: string[] = [
    `Kunde (Anlagenbetreiber):`,
    `  Name: ${customer}`,
    `  Straße: ${project.address?.line ?? '—'}`,
    `  PLZ: ${project.address?.zip ?? '—'}`,
    `  Ort: ${project.address?.city ?? '—'}`,
    `  Telefon: ${project.phone ?? '—'}`,
    `  E-Mail: ${project.email ?? '—'}`,
    ``,
    `PV-Anlage:`,
    `  Anlagengröße (kWp): ${project.kwp}`,
    `  Modulanzahl: ${project.moduleCount}`,
    `  Modultyp: ${project.moduleType ?? '—'}`,
    ``,
    `Wechselrichter:`,
    `  Hersteller: ${inverterBrand}`,
    `  Typ/Modell: ${inverterModel}`,
    `  Vollständige Bezeichnung: ${inverterFull}`,
    `  Nennleistung (kW): ${inverterKw ?? '—'}`,
    `  Scheinleistung (kVA): ${invSpec?.apparentPowerKva ?? inverterKw ?? '—'}`,
    `  Anzahl: ${project.inverterCount ?? 1}`,
    `  Phasen: ${invSpec?.phases === 3 ? '3 (Drehstrom)' : invSpec?.phases === 1 ? '1 (Wechselstrom)' : '3 (Drehstrom)'}`,
    ``,
    `Speicher:`,
    `  Hersteller: ${batteryBrand}`,
    `  Typ/Modell: ${batteryModel}`,
    `  Vollständige Bezeichnung: ${batteryFull}`,
    `  Kapazität gesamt (kWh): ${batteryKwh ?? '—'}`,
    `  Anzahl Module: ${project.batteryModuleCount ?? '—'}`,
    ``,
    `Jahresverbrauch: ${project.annualKwh ?? '—'} kWh`,
    `Netzbetreiber: ${netzbetreiber}`,
    ``,
    `Heutiges Datum: ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })}`,
    `Ort: Leipzig`,
    ``,
    `Installateur/Errichter:`,
    `Firma: Volta Energietechnik GmbH`,
    `Adresse: Am Schenkberg 12, 04349 Leipzig`,
    ``,
    `FACHREGELN (so füllt ein erfahrener Elektrofachbetrieb diese Formulare aus):`,
    ``,
    `Allgemein:`,
    `- Energieart: immer "Sonne" / Photovoltaik`,
    `- Immer 3-phasig / Drehstrom (nie Wechselstrom/1-phasig)`,
    `- Symmetriebedingung: "durch Drehstromgenerator oder dreiphasigen Umrichter" = ja/ankreuzen`,
    `- Überschusseinspeisung (NICHT Volleinspeisung)`,
    `- Kein Inselbetrieb`,
    `- Kein motorischer Anlauf`,
    `- Neuanlage (kein Austausch/Erweiterung)`,
    ``,
    `Leistungswerte:`,
    `- max. Scheinleistung S_Amax (kVA) = WR-Nennleistung (z.B. 10 kVA bei 10kW WR)`,
    `- max. Wirkleistung P_Amax (kW) = WR-Nennleistung (z.B. 10 kW)`,
    `- Modulleistung/Generatorleistung P_Agen (kWp) = Summe aller Module (z.B. 9,3 kWp)`,
    `- WICHTIG: kVA/kW ist die WR-Leistung, kWp ist die Modulleistung — nicht verwechseln!`,
    ``,
    `NA-Schutz (E8-Formulare):`,
    `- NA-Schutz ist IMMER integriert im Wechselrichter (nicht zentral)`,
    `- Integrierter NA-Schutz Spannungssteigerungsschutz U> = 253 (Standardwert EcoFlow)`,
    `- Zertifikat NA-Schutz: ja/vorhanden`,
    `- Einheitenzertifikat: ja/vorhanden`,
    `- Übereinstimmung E.2/E.3 mit Anlagenaufbau: ja`,
    ``,
    `Drosselung & Steuerung:`,
    `- Drosselung auf 60% (S) im Umrichter eingestellt: ja`,
    `- Zertifizierte technische Steuerung zur Drosselung auf 60%: ja`,
    `- Technische Einrichtung zur ferngesteuerten Leistungsreduzierung durch NB: ja`,
    `- Energieflussrichtungssensor Funktionstest bestanden: ja`,
    ``,
    `Blindleistung:`,
    `- Q(U)-Standard-Kennlinie: ja/ankreuzen (NICHT cos φ Standard-Kennlinie)`,
    `- TF-Sperren: normalerweise NICHT gefordert/eingebaut`,
    ``,
    `Symmetrie (bei L1/L2/L3 Aufteilung):`,
    `- Bei 3-phasigem WR: Leistung gleichmäßig auf L1, L2, L3 verteilen`,
    `- Pro Phase = WR-Nennleistung / 3 (z.B. 10kW / 3 = 3,3 kVA pro Phase)`,
    `- Zeile "vorhandene Anlagen" leer lassen (Neuanlage)`,
    `- Zeile "neu hinzukommende Anlagen" ausfüllen`,
    ``,
    `Datum & Unterschrift:`,
    `- Ort, Datum: "Leipzig, [heutiges Datum]" eintragen`,
    `- Datum der Inbetriebsetzung: LEER lassen (wird vor Ort eingetragen)`,
    `- Unterschrift: LEER lassen (kommt separat)`,
  ];
  return lines.join('\n');
}

/** Extract visible text from PDF to give AI context about field labels. */
async function extractPdfText(pdfBytes: Buffer | Uint8Array): Promise<string> {
  try {
    const { extractText } = await import('unpdf');
    const { text: pages } = await extractText(new Uint8Array(pdfBytes));
    // pages is string[] — one per page
    const text = Array.isArray(pages) ? pages.join('\n--- Seite ---\n') : String(pages);
    return text.slice(0, 6000); // Cap to avoid huge prompts
  } catch (e) {
    console.log('[ai-form-filler] text extraction failed: ' + (e as Error).message);
    return '';
  }
}

/** Use Claude to determine what values to fill in each field. */
async function getAIMapping(
  fields: FieldInfo[],
  projectContext: string,
  formType: string,
  pdfBytes: Buffer | Uint8Array,
): Promise<Record<string, string | boolean>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return {};

  const textFields = fields.filter((f) => f.type === 'text').map((f) => f.name);
  const checkFields = fields.filter((f) => f.type === 'checkbox').map((f) => f.name);

  // Extract visible text from template — this shows labels like "Vorname, Name", "Straße"
  // next to where form fields are, helping the AI understand what E8_Text1 means
  const templateText = await extractPdfText(pdfBytes);
  console.log('[ai-form-filler] template text len=' + templateText.length);

  const prompt = `Du bist ein erfahrener Elektrofachbetrieb der regelmäßig Netzanmeldungs-Formulare
für PV-Anlagen ausfüllt. Du kennst die VDE-AR-N 4105 und weißt genau welche technischen
Werte wohin gehören. Du füllst Formulare so aus wie Katrin von Volta — korrekt und vollständig.

Formulartyp: ${formType}

SICHTBARER TEXT IM FORMULAR (zeigt Labels neben den Feldern — nutze dies NUR um zu verstehen
welches Feld was BEDEUTET, NICHT um Werte daraus zu übernehmen!):
---
${templateText || '(konnte nicht extrahiert werden)'}
---

FORMULARFELDER:

TEXTFELDER:
${textFields.map(n => `  "${n}"`).join('\n')}

CHECKBOX-FELDER:
${checkFields.map(n => `  "${n}"`).join('\n')}

═══════════════════════════════════════════════
VERBINDLICHE PROJEKTDATEN — NUR DIESE WERTE VERWENDEN!
ABSOLUT KEINE Werte erfinden! Wenn ein Wert "—" oder "keiner" ist,
setze das Feld auf null. Übernimm NIEMALS Beispielwerte, Herstellernamen
oder Modellbezeichnungen aus dem Formulartext oben!
═══════════════════════════════════════════════
${projectContext}

AUFGABE: Fülle das Formular wie ein erfahrener Fachbetrieb aus.

Regeln für die Feldzuordnung:
- Nutze den sichtbaren Text NUR um zu verstehen welches Feld was BEDEUTET
- Die WERTE kommen EXAKT aus den Projektdaten — NIEMALS aus dem Formulartext
- Wenn der Formulartext Beispielwerte enthält (z.B. "Solplanet", "SMA"), IGNORIERE diese

Regeln für den Inhalt:
- Kundenname/Anlagenbetreiber → Namens-Felder
- Kundenadresse → Anlagenanschrift-Felder
- Volta Energietechnik GmbH, Am Schenkberg 12, 04349 Leipzig → Errichter/Installateur-Felder
- max. Scheinleistung S_Amax (kVA) = WR-Nennleistung (NICHT kWp!)
- max. Wirkleistung P_Amax (kW) = WR-Nennleistung (NICHT kWp!)
- Modulleistung/Generatorleistung P_Agen (kWp) = Summe Modulleistung
- NA-Schutz: immer INTEGRIERT, U> = 253 (Standard EcoFlow)
- Drosselung 60%: ja, eingestellt, zertifiziert, ferngesteuert → alles ankreuzen
- Q(U)-Standard-Kennlinie: ja (NICHT cos φ)
- Drehstromgenerator/dreiphasiger Umrichter: ja
- Symmetrie L1/L2/L3: WR-Leistung / 3 pro Phase (nur "neu", nicht "vorhanden")
- Energieflussrichtungssensor bestanden: ja
- TF-Sperren: nein / nicht eingebaut
- Ort/Datum Felder: "Leipzig, [heutiges Datum aus Projektdaten]" eintragen
- Datum der Inbetriebsetzung: null (wird vor Ort eingetragen)
- Unterschrift: null (kommt separat)
- Zahlen deutsch formatieren: "9,3" statt "9.3"

Gib ein JSON-Objekt zurück: { "feldname": "wert" oder true/false }
Felder die leer bleiben sollen: null

Antworte NUR mit dem JSON-Objekt, kein anderer Text.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.log('[ai-form-filler] RESULT: API_ERROR status=' + res.status + ' body=' + body.slice(0, 200));
      return {};
    }
    const data = (await res.json()) as { content?: { text: string }[] };
    const raw = data.content?.[0]?.text ?? '';

    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      console.log('[ai-form-filler] RESULT: NO_JSON rawLen=' + raw.length + ' raw=' + raw.slice(0, 300));
      return {};
    }
    const jsonStr = raw.slice(start, end + 1);
    try {
      const result = JSON.parse(jsonStr);
      const nonNull = Object.entries(result).filter(([, v]) => v !== null && v !== undefined).length;
      const sample = Object.entries(result).filter(([, v]) => v != null).slice(0, 5).map(([k, v]) => k + '=' + String(v).slice(0, 30)).join(', ');
      console.log('[ai-form-filler] RESULT: OK total=' + Object.keys(result).length + ' nonNull=' + nonNull + ' sample=[' + sample + ']');
      return result;
    } catch (parseErr) {
      console.log('[ai-form-filler] RESULT: PARSE_FAIL err=' + (parseErr as Error).message + ' json=' + jsonStr.slice(0, 200));
      return {};
    }
  } catch (e) {
    console.log('[ai-form-filler] RESULT: OUTER_ERROR ' + (e as Error).message);
    return {};
  }
}

/** Fill a PDF template using AI-determined field values. */
export async function aiFillForm(
  templateBytes: Buffer | Uint8Array,
  project: ProjectData,
  customer: string,
  netzbetreiber: string,
  formType: string,
): Promise<{ pdf: Uint8Array; debug: string }> {
  const pdf = await PDFDocument.load(templateBytes, { ignoreEncryption: true });
  const fields = extractFields(pdf);

  if (fields.length === 0) {
    // PDF has no fillable form fields — return as-is with debug info
    return { pdf: await pdf.save(), debug: 'fields=0 (no fillable fields — encrypted or static PDF)' };
  }

  const context = buildProjectContext(project, customer, netzbetreiber);
  const mapping = await getAIMapping(fields, context, formType, templateBytes);

  const form = pdf.getForm();
  let appliedCount = 0;
  const errors: string[] = [];
  for (const [fieldName, value] of Object.entries(mapping)) {
    if (value === null || value === undefined) continue;

    try {
      if (typeof value === 'boolean') {
        if (value) { form.getCheckBox(fieldName).check(); appliedCount++; }
      } else if (typeof value === 'string' && value.trim()) {
        form.getTextField(fieldName).setText(value); appliedCount++;
      }
    } catch (e) {
      errors.push(fieldName + ':' + (e as Error).message.slice(0, 30));
    }
  }

  const mappingKeys = Object.keys(mapping).length;
  const nonNull = Object.entries(mapping).filter(([, v]) => v != null).length;
  const sample = Object.entries(mapping).filter(([, v]) => v != null).slice(0, 3).map(([k, v]) => k + '=' + String(v).slice(0, 20)).join('|');
  const debug = `fields=${fields.length} mapped=${mappingKeys} nonNull=${nonNull} applied=${appliedCount} errs=${errors.length} sample=${sample}`;
  console.log('[ai-form-filler] ' + debug);

  try { form.updateFieldAppearances(); } catch {}
  return { pdf: await pdf.save(), debug };
}
