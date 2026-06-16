// Reonic v3 Files API — fetch project documents and extract data from them.
// Used to enrich project data for more accurate form filling.

import { getDb, tenantId, upsertEntities, getEntities } from './db';

// ── Types ──────────────────────────────────────────────────────────────

export interface ReonicFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | string;
  url: string;            // signed S3 download URL (24h valid)
  parentId: string;       // residentialProject ID
  folderId?: string;
  createdAt: string;
  /** Extracted/classified metadata (set after AI analysis) */
  docCategory?: DocCategory;
}

export type DocCategory =
  | 'vollmacht_nb'          // Vollmacht Netzbetreiber
  | 'vollmacht_mastr'       // Vollmacht Marktstammdatenregister
  | 'anschlusszusage'       // Zusage vom Netzbetreiber
  | 'angebot'               // Angebot/Vertrag
  | 'auftrag'               // Auftragsbestätigung
  | 'abnahmeprotokoll'      // DC/AC-Abnahmeprotokoll
  | 'lageplan'              // Lageplan/Dachbild
  | 'mastr_registrierung'   // MaStR-Registrierungsbestätigung
  | 'netzanmeldung'         // Ausgefülltes NB-Formular
  | 'messkonzept'           // Messkonzept
  | 'rechnung'              // Rechnung
  | 'sonstiges';

export interface ExtractedFields {
  zaehlerNummer?: string;
  mastrNummer?: string;
  anschlussLeistungKw?: number;
  einspeiseZusage?: boolean;
  zaehlerwechselTermin?: string;
  netzbetreiberRefNr?: string;
  grundstueckseigentuemer?: string;
  flurstuck?: string;
  iban?: string;
  kwp?: number;
  speicherKwh?: number;
  speicherTyp?: string;
  wechselrichterTyp?: string;
  modulTyp?: string;
  modulAnzahl?: number;
  strasse?: string;
  plz?: string;
  ort?: string;
  kundenName?: string;
  [key: string]: unknown;
}

// ── Reonic API ─────────────────────────────────────────────────────────

function reonicAuth() {
  const raw = process.env.REONIC_API_KEY;
  if (!raw) return null;
  const apiKey = raw.replace(/^﻿/, '').trim();
  return { apiKey, baseUrl: (process.env.REONIC_BASE_URL || 'https://api.reonic.de/rest/v3').replace(/\/$/, '') };
}

/** Fetch all files for a residential project from Reonic v3. */
export async function getProjectFiles(projectId: string): Promise<ReonicFile[]> {
  const auth = reonicAuth();
  if (!auth) return [];

  try {
    const res = await fetch(
      `${auth.baseUrl}/files?parentId=${projectId}&parentType=residentialProject`,
      {
        headers: { 'x-authorization': auth.apiKey, Accept: 'application/json' },
        cache: 'no-store',
      },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Array<{
      id: string; name: string; type: string; url: string;
      parent?: { id: string }; folderId?: string; createdAt?: string;
    }> };

    return (json.data ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      url: f.url,
      parentId: f.parent?.id ?? projectId,
      folderId: f.folderId ?? undefined,
      createdAt: f.createdAt ?? '',
      docCategory: classifyByName(f.name),
    }));
  } catch {
    return [];
  }
}

/** Simple name-based classification (fast, no AI needed). */
function classifyByName(name: string): DocCategory {
  const n = name.toLowerCase();
  // Auftrag/AB first — contains most complete data
  if (/\bab[-_]?\d/i.test(n) || n.includes('auftrag') || n.includes('auftragsbestätigung')) return 'auftrag';
  if (n.includes('vollmacht') && (n.includes('markt') || n.includes('mastr'))) return 'vollmacht_mastr';
  if (n.includes('vollmacht')) return 'vollmacht_nb';
  if (n.includes('zusage') || n.includes('anschlusszusage')) return 'anschlusszusage';
  if (n.includes('abnahme') || n.includes('abnahmeprotokoll')) return 'abnahmeprotokoll';
  if (/dc[-_]/.test(n) && !n.includes('anmeldung')) return 'abnahmeprotokoll';
  if (n.includes('angebot') || /\d+[.,]?\d*\s*kwp/i.test(n)) return 'angebot';
  if (n.includes('lageplan') || n.includes('dach') || n.includes('satellit')) return 'lageplan';
  if (n.includes('mastr') || n.includes('registrierung') || n.includes('marktstamm') || /\bsee\d/i.test(n)) return 'mastr_registrierung';
  if (n.includes('anmeldung') || n.includes('formblatt') || /\ban\d{3}/i.test(n) || n.includes('ans_') || n.includes('nts')) return 'netzanmeldung';
  if (n.includes('messkonzept')) return 'messkonzept';
  if (/\bre[-_]?\d/i.test(n) || n.includes('rechnung')) return 'rechnung';
  return 'sonstiges';
}

// ── PDF Text Extraction ────────────────────────────────────────────────

/** Download a file and extract text content (for PDFs). */
export async function extractPdfText(fileUrl: string): Promise<string> {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) return '';
    const buffer = await res.arrayBuffer();

    // Use unpdf (already installed) for text extraction
    const { extractText } = await import('unpdf');
    const { text } = await extractText(new Uint8Array(buffer));
    const joined = Array.isArray(text) ? text.join('\n') : String(text);
    return joined.slice(0, 15000); // cap at 15K chars
  } catch {
    return '';
  }
}

// ── AI Field Extraction ────────────────────────────────────────────────

/** Use Haiku to extract structured fields from document text. */
export async function extractFieldsFromDoc(
  docName: string,
  docCategory: DocCategory,
  pdfText: string,
): Promise<ExtractedFields | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !pdfText.trim()) return null;

  const prompt = `Du extrahierst Daten aus einem Dokument einer Solaranlage-Netzanmeldung.

Dokumentname: ${docName}
Dokumenttyp: ${docCategory}

Extrahiere ALLE verfügbaren strukturierten Felder. Antworte NUR mit validem JSON:
{
  "zaehlerNummer": "Zählernummer oder null",
  "mastrNummer": "MaStR-Nummer (SEE...) oder null",
  "anschlussLeistungKw": Anschlussleistung in kW oder null,
  "einspeiseZusage": true/false wenn erkennbar sonst null,
  "zaehlerwechselTermin": "Termin ISO-Datum oder null",
  "netzbetreiberRefNr": "Referenznummer des Netzbetreibers oder null",
  "grundstueckseigentuemer": "Name des Eigentümers oder null",
  "flurstuck": "Flurstücknummer oder null",
  "iban": "IBAN falls vorhanden oder null",
  "kwp": Anlagenleistung in kWp oder null,
  "speicherKwh": Speicherkapazität in kWh oder null,
  "speicherTyp": "Vollständige Speicher-Bezeichnung inkl. Hersteller (z.B. EcoFlow PowerOcean LFP 5kWh) oder null",
  "wechselrichterTyp": "Vollständige WR-Bezeichnung inkl. Hersteller (z.B. EcoFlow PowerOcean Hybrid-Wechselrichter 10kW) oder null",
  "modulTyp": "Modul-Bezeichnung inkl. Hersteller und Leistung (z.B. AIKO Neostar 2S+ 465Wp) oder null",
  "modulAnzahl": Anzahl Module oder null,
  "strasse": "Straße + Hausnummer des Anlagenstandorts oder null",
  "plz": "PLZ des Anlagenstandorts oder null",
  "ort": "Ort/Stadt des Anlagenstandorts oder null",
  "kundenName": "Vollständiger Name des Anlagenbetreibers/Kunden oder null"
}`;

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
        max_tokens: 800,
        messages: [{ role: 'user', content: `${prompt}\n\nDokument-Text:\n${pdfText.slice(0, 6000)}` }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { text: string }[] };
    let text = data.content?.[0]?.text ?? '{}';
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(text) as ExtractedFields;
  } catch {
    return null;
  }
}

// ── High-level: Enrich project from documents ──────────────────────────

/** Fetch all project files, extract text from key documents, and return enriched fields. */
export async function enrichFromDocuments(projectId: string): Promise<{
  files: ReonicFile[];
  extracted: ExtractedFields;
  sources: string[];
}> {
  const files = await getProjectFiles(projectId);
  const extracted: ExtractedFields = {};
  const sources: string[] = [];

  // Analyse ALL PDFs — priority order so important docs fill fields first
  const pdfFiles = files
    .filter((f) => f.type === 'pdf')
    .sort((a, b) => {
      const order: Record<string, number> = {
        auftrag: 0, angebot: 1, anschlusszusage: 2, netzanmeldung: 3,
        abnahmeprotokoll: 4, messkonzept: 5, vollmacht_nb: 6,
        mastr_registrierung: 7, vollmacht_mastr: 8, rechnung: 9, sonstiges: 10,
      };
      return (order[a.docCategory ?? 'sonstiges'] ?? 9) - (order[b.docCategory ?? 'sonstiges'] ?? 9);
    });

  // Process all PDFs (sorted by priority — important docs first)
  for (const doc of pdfFiles) {
    const text = await extractPdfText(doc.url);
    if (!text) continue;

    const fields = await extractFieldsFromDoc(doc.name, doc.docCategory ?? 'sonstiges', text);
    if (!fields) continue;

    for (const [k, v] of Object.entries(fields)) {
      if (v != null && v !== '' && !(k in extracted)) {
        (extracted as Record<string, unknown>)[k] = v;
        sources.push(`${k} ← ${doc.name}`);
      }
    }
  }

  // Save enrichment to DB so getProjectData() can use it
  if (Object.keys(extracted).length > 0) {
    await saveEnrichment(projectId, extracted, sources);
  }

  return { files, extracted, sources };
}

// ── DB persistence for enrichments ─────────────────────────────────────

/** Save extracted fields to DB as entity kind='enrichment'. */
async function saveEnrichment(projectId: string, fields: ExtractedFields, sources: string[]): Promise<void> {
  const tid = await tenantId('volta');
  if (!tid) return;
  await upsertEntities(tid, 'documents', 'enrichment', [{
    externalId: projectId,
    data: { ...fields, _sources: sources, _enrichedAt: new Date().toISOString() },
  }]);
}

/** Load enrichment from DB for a project. */
export async function loadEnrichment(projectId: string): Promise<ExtractedFields | null> {
  const enrichments = await getEntities<ExtractedFields & { _sources?: string[] }>('enrichment');
  // getEntities returns all enrichments — find the one for this project
  // Since we store with externalId=projectId, we need to find it
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return null;
  const { data } = await db
    .from('entities')
    .select('data')
    .eq('tenant_id', tid)
    .eq('kind', 'enrichment')
    .eq('external_id', projectId)
    .single();
  if (!data) return null;
  const cached = (data as { data: ExtractedFields }).data;
  // Invalidate old cache that doesn't have key fields — force re-extraction with Sonnet
  if (!cached.wechselrichterTyp && !cached.modulTyp) return null;
  return cached;
}
