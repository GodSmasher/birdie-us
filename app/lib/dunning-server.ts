// Server-only dunning / Mahnwesen module.
// Manages dunning templates stored in Supabase, consumed by n8n workflows.

import { getDb, tenantId } from './db';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface DunningTemplate {
  id: string;
  stufe: number;
  name: string;
  betreff: string;
  textHtml: string;
  textPlain: string;
  fristTage: number;
  gebuehr: number;
  aktiv: boolean;
  updatedAt: string;
}

export interface DunningTemplateUpdate {
  name?: string;
  betreff?: string;
  textHtml?: string;
  textPlain?: string;
  fristTage?: number;
  gebuehr?: number;
  aktiv?: boolean;
}

// ── Default templates (seeded on first access) ──────────────────────────────────

// HTML email shell — matches the Brevo Volta templates (logo, white card, footer)
const VOLTA_LOGO = 'https://onecdn.io/media/1e5218f8-bb6b-4d82-b8a5-a10d7f495bd6/md2x';
const htmlWrap = (heading: string, headingColor: string, body: string) => `<!DOCTYPE html>
<html>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7f9;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px 0;">
<table width="600" style="background:#ffffff;border-radius:8px;padding:30px;">
<tr>
<td align="center" style="padding-bottom:20px;">
<img src="${VOLTA_LOGO}" width="180" alt="Volta Solar">
</td>
</tr>
<tr>
<td>
<h2 style="color:${headingColor};">${heading}</h2>
${body}
<hr>
<p style="font-size:12px;color:#666;">
Volta Solar · Am Schenkberg 12 · 04349 Leipzig<br>
Telefon: 0341 92881147 ·
<a href="https://volta-solaranlagen.de">volta-solaranlagen.de</a>
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

const invoiceTable = `<table width="100%" style="background:#f3f4f6;border-radius:6px;padding:15px;">
<tr><td>Rechnungsnummer:</td><td><strong>{{rechnungsnummer}}</strong></td></tr>
<tr><td>Rechnungsdatum:</td><td>{{rechnungsdatum}}</td></tr>
<tr><td>Fällig am:</td><td>{{faelligkeitsdatum}}</td></tr>
<tr><td>Betrag:</td><td><strong>{{betrag}} €</strong></td></tr>
</table>`;

const invoiceTableMahnung = `<table width="100%" style="background:#f3f4f6;border-radius:6px;padding:15px;margin:20px 0;">
<tr><td>Rechnungsnummer:</td><td align="right"><strong>{{rechnungsnummer}}</strong></td></tr>
<tr><td>Rechnungsdatum:</td><td align="right">{{rechnungsdatum}}</td></tr>
<tr><td>Fällig am:</td><td align="right">{{faelligkeitsdatum}}</td></tr>
<tr><td>Betrag:</td><td align="right"><strong>{{betrag}} €</strong></td></tr>
<tr><td>Mahngebühr:</td><td align="right"><strong>{{gebuehr}}</strong></td></tr>
<tr><td><strong>Gesamtbetrag:</strong></td><td align="right"><strong>{{betrag_mit_gebuehr}} €</strong></td></tr>
</table>`;

const DEFAULTS: Omit<DunningTemplate, 'id' | 'updatedAt'>[] = [
  {
    stufe: 0,
    name: 'Vor Zahlungsziel',
    betreff: 'Zahlungserinnerung – Rechnung {{rechnungsnummer}}',
    textHtml: htmlWrap('Zahlungserinnerung', '#111', `
<p>Guten Tag {{kunde_name}},</p>
<p>wir möchten Sie freundlich daran erinnern, dass die folgende Rechnung in <strong>2 Tagen</strong> fällig wird.</p>
${invoiceTable}
<p style="font-size:14px; color:#333333;">
Bitte beachten Sie, dass bei weiterem Zahlungsverzug gemäß unseren Zahlungsbedingungen Verzugszinsen und Mahngebühren anfallen können.
</p>
<p>Vielen Dank und freundliche Grüße<br><strong>Volta Solar</strong></p>`),
    textPlain: `Guten Tag {{kunde_name}},

wir möchten Sie freundlich daran erinnern, dass die folgende Rechnung in 2 Tagen fällig wird.

Rechnungsnummer: {{rechnungsnummer}}
Rechnungsdatum: {{rechnungsdatum}}
Fällig am: {{faelligkeitsdatum}}
Betrag: {{betrag}} €

Bitte beachten Sie, dass bei weiterem Zahlungsverzug gemäß unseren Zahlungsbedingungen Verzugszinsen und Mahngebühren anfallen können.

Vielen Dank und freundliche Grüße
Volta Solar`,
    fristTage: -3,
    gebuehr: 0,
    aktiv: true,
  },
  {
    stufe: 1,
    name: 'Zahlungsziel',
    betreff: 'Zahlungserinnerung – Rechnung {{rechnungsnummer}} ist heute fällig',
    textHtml: htmlWrap('Zahlungserinnerung', '#111', `
<p>Guten Tag {{kunde_name}},</p>
<p>heute ist das Zahlungsziel der folgenden Rechnung erreicht. Falls die Zahlung bereits erfolgt ist, können Sie diese Nachricht ignorieren.</p>
${invoiceTable}
<p style="font-size:14px; color:#333333;">
Bitte beachten Sie, dass bei weiterem Zahlungsverzug gemäß unseren Zahlungsbedingungen Verzugszinsen und Mahngebühren anfallen können.
</p>
<p>Vielen Dank und freundliche Grüße<br><strong>Volta Solar</strong></p>`),
    textPlain: `Guten Tag {{kunde_name}},

heute ist das Zahlungsziel der folgenden Rechnung erreicht. Falls die Zahlung bereits erfolgt ist, können Sie diese Nachricht ignorieren.

Rechnungsnummer: {{rechnungsnummer}}
Rechnungsdatum: {{rechnungsdatum}}
Fällig am: {{faelligkeitsdatum}}
Betrag: {{betrag}} €

Bitte beachten Sie, dass bei weiterem Zahlungsverzug gemäß unseren Zahlungsbedingungen Verzugszinsen und Mahngebühren anfallen können.

Vielen Dank und freundliche Grüße
Volta Solar`,
    fristTage: 0,
    gebuehr: 0,
    aktiv: true,
  },
  {
    stufe: 2,
    name: '2 Tage nach Zahlungsziel',
    betreff: 'Überfällig – Rechnung {{rechnungsnummer}}',
    textHtml: htmlWrap('Zahlungserinnerung', '#111', `
<p>Guten Tag {{kunde_name}},</p>
<p>leider konnten wir bisher keinen Zahlungseingang zur folgenden Rechnung feststellen. Bitte begleichen Sie den offenen Betrag zeitnah.</p>
${invoiceTable}
<p style="font-size:14px; color:#333333;">
Bitte beachten Sie, dass bei weiterem Zahlungsverzug gemäß unseren Zahlungsbedingungen Verzugszinsen und Mahngebühren anfallen können.
</p>
<p>Vielen Dank und freundliche Grüße<br><strong>Volta Solar</strong></p>`),
    textPlain: `Guten Tag {{kunde_name}},

leider konnten wir bisher keinen Zahlungseingang zur folgenden Rechnung feststellen. Bitte begleichen Sie den offenen Betrag zeitnah.

Rechnungsnummer: {{rechnungsnummer}}
Rechnungsdatum: {{rechnungsdatum}}
Fällig am: {{faelligkeitsdatum}}
Betrag: {{betrag}} €

Bitte beachten Sie, dass bei weiterem Zahlungsverzug gemäß unseren Zahlungsbedingungen Verzugszinsen und Mahngebühren anfallen können.

Vielen Dank und freundliche Grüße
Volta Solar`,
    fristTage: 2,
    gebuehr: 0,
    aktiv: true,
  },
  {
    stufe: 3,
    name: '1. Mahnung',
    betreff: '1. Mahnung – Rechnung {{rechnungsnummer}}',
    textHtml: htmlWrap('Erste Mahnung', '#b91c1c', `
<p>Guten Tag {{kunde_name}},</p>
<p>trotz unserer bisherigen Zahlungserinnerungen konnten wir bisher keinen Zahlungseingang zu der untenstehenden Rechnung feststellen.</p>
<p>Gemäß unseren Zahlungsbedingungen berechnen wir für diese erste Mahnung eine <strong>Mahngebühr</strong>.</p>
${invoiceTableMahnung}
<p style="font-size:14px; color:#333333;">
Zusätzlich weisen wir darauf hin, dass sich die Rechnung im Zahlungsverzug befindet. Ab diesem Zeitpunkt berechnen wir Verzugszinsen in gesetzlicher Höhe (Basiszinssatz zuzüglich 5 Prozentpunkte p. a.).
</p>
<p>Bitte begleichen Sie den offenen Gesamtbetrag zeitnah. Die Rechnung finden Sie erneut im Anhang bzw. über den folgenden Link.</p>
<p>Sollten Sie Rückfragen haben oder es Unklarheiten geben, melden Sie sich bitte kurz bei uns – wir klären das gerne.</p>
<p>Freundliche Grüße<br><strong>Volta Solar</strong></p>`),
    textPlain: `Guten Tag {{kunde_name}},

trotz unserer bisherigen Zahlungserinnerungen konnten wir bisher keinen Zahlungseingang zu der untenstehenden Rechnung feststellen.

Gemäß unseren Zahlungsbedingungen berechnen wir für diese erste Mahnung eine Mahngebühr.

Rechnungsnummer: {{rechnungsnummer}}
Rechnungsdatum: {{rechnungsdatum}}
Fällig am: {{faelligkeitsdatum}}
Betrag: {{betrag}} €
Mahngebühr: {{gebuehr}}
Gesamtbetrag: {{betrag_mit_gebuehr}} €

Zusätzlich weisen wir darauf hin, dass sich die Rechnung im Zahlungsverzug befindet. Ab diesem Zeitpunkt berechnen wir Verzugszinsen in gesetzlicher Höhe (Basiszinssatz zuzüglich 5 Prozentpunkte p. a.).

Bitte begleichen Sie den offenen Gesamtbetrag zeitnah.

Sollten Sie Rückfragen haben oder es Unklarheiten geben, melden Sie sich bitte kurz bei uns – wir klären das gerne.

Freundliche Grüße
Volta Solar`,
    fristTage: 9,
    gebuehr: 0,
    aktiv: true,
  },
  {
    stufe: 4,
    name: '2. Mahnung',
    betreff: '2. Mahnung – Rechnung {{rechnungsnummer}} – letzte Zahlungsaufforderung',
    textHtml: htmlWrap('Zweite Mahnung', '#b91c1c', `
<p>Guten Tag {{kunde_name}},</p>
<p>wir haben Sie bereits mehrfach an die ausstehende Zahlung der Rechnung <strong>{{rechnungsnummer}}</strong> über <strong>{{betrag}} €</strong> erinnert. Leider ist bis heute kein Zahlungseingang erfolgt.</p>
<p><strong>Dies ist unsere letzte Zahlungsaufforderung.</strong></p>
${invoiceTableMahnung}
<p style="font-size:14px; color:#333333;">
Wir fordern Sie auf, den Gesamtbetrag innerhalb von <strong>7 Tagen</strong> auf unser Konto zu überweisen.
</p>
<p><strong>Sollte der Betrag nicht fristgerecht eingehen, werden wir die Forderung ohne weitere Ankündigung an ein Inkassounternehmen übergeben.</strong> Die dadurch entstehenden zusätzlichen Kosten gehen zu Ihren Lasten.</p>
<p>Freundliche Grüße<br><strong>Volta Solar</strong></p>`),
    textPlain: `Guten Tag {{kunde_name}},

wir haben Sie bereits mehrfach an die ausstehende Zahlung der Rechnung {{rechnungsnummer}} über {{betrag}} € erinnert. Leider ist bis heute kein Zahlungseingang erfolgt.

DIES IST UNSERE LETZTE ZAHLUNGSAUFFORDERUNG.

Rechnungsnummer: {{rechnungsnummer}}
Rechnungsdatum: {{rechnungsdatum}}
Fällig am: {{faelligkeitsdatum}}
Betrag: {{betrag}} €
Mahngebühr: {{gebuehr}}
Gesamtbetrag: {{betrag_mit_gebuehr}} €

Wir fordern Sie auf, den Gesamtbetrag innerhalb von 7 Tagen auf unser Konto zu überweisen.

Sollte der Betrag nicht fristgerecht eingehen, werden wir die Forderung ohne weitere Ankündigung an ein Inkassounternehmen übergeben. Die dadurch entstehenden zusätzlichen Kosten gehen zu Ihren Lasten.

Freundliche Grüße
Volta Solar`,
    fristTage: 16,
    gebuehr: 15,
    aktiv: true,
  },
  {
    stufe: 5,
    name: 'Inkasso-Übergabe',
    betreff: 'Inkassoübergabe – Rechnung {{rechnungsnummer}}',
    textHtml: htmlWrap('Inkassoübergabe', '#b91c1c', `
<p>Guten Tag {{kunde_name}},</p>
<p>da Sie trotz mehrfacher Mahnung die Rechnung <strong>{{rechnungsnummer}}</strong> über <strong>{{betrag_mit_gebuehr}} €</strong> nicht beglichen haben, übergeben wir die Forderung an unser Inkassounternehmen.</p>
<p>Ab sofort ist ausschließlich das Inkassounternehmen Ihr Ansprechpartner. Die zusätzlich anfallenden Inkassokosten werden Ihnen in Rechnung gestellt.</p>
<p><strong>Volta Solar</strong></p>`),
    textPlain: `Guten Tag {{kunde_name}},

da Sie trotz mehrfacher Mahnung die Rechnung {{rechnungsnummer}} über {{betrag_mit_gebuehr}} € nicht beglichen haben, übergeben wir die Forderung an unser Inkassounternehmen.

Ab sofort ist ausschließlich das Inkassounternehmen Ihr Ansprechpartner. Die zusätzlich anfallenden Inkassokosten werden Ihnen in Rechnung gestellt.

Volta Solar`,
    fristTage: 23,
    gebuehr: 30,
    aktiv: true,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

interface RawRow {
  id: string; stufe: number; name: string; betreff: string;
  text_html: string; text_plain: string; frist_tage: number;
  gebuehr: number; aktiv: boolean; updated_at: string;
}

function toTemplate(r: RawRow): DunningTemplate {
  return {
    id: r.id,
    stufe: r.stufe,
    name: r.name,
    betreff: r.betreff,
    textHtml: r.text_html,
    textPlain: r.text_plain,
    fristTage: r.frist_tage,
    gebuehr: Number(r.gebuehr),
    aktiv: r.aktiv,
    updatedAt: r.updated_at,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────────

/** Seed default templates for the tenant if table is empty. */
async function ensureDefaults(tid: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  const { count } = await db.from('dunning_templates').select('id', { count: 'exact', head: true }).eq('tenant_id', tid);
  if ((count ?? 0) > 0) return;
  const rows = DEFAULTS.map((d) => ({
    tenant_id: tid,
    stufe: d.stufe,
    name: d.name,
    betreff: d.betreff,
    text_html: d.textHtml,
    text_plain: d.textPlain,
    frist_tage: d.fristTage,
    gebuehr: d.gebuehr,
    aktiv: d.aktiv,
  }));
  await db.from('dunning_templates').insert(rows);
}

/** Get all dunning templates for the tenant, sorted by stufe. */
export async function getDunningTemplates(): Promise<DunningTemplate[]> {
  const db = getDb();
  if (!db) return [];
  const tid = await tenantId();
  if (!tid) return [];
  await ensureDefaults(tid);
  const { data } = await db
    .from('dunning_templates')
    .select('*')
    .eq('tenant_id', tid)
    .order('stufe', { ascending: true });
  return (data ?? []).map(toTemplate);
}

/** Get a single template by stufe (for n8n). */
export async function getDunningTemplate(stufe: number): Promise<DunningTemplate | null> {
  const db = getDb();
  if (!db) return null;
  const tid = await tenantId();
  if (!tid) return null;
  await ensureDefaults(tid);
  const { data } = await db
    .from('dunning_templates')
    .select('*')
    .eq('tenant_id', tid)
    .eq('stufe', stufe)
    .single();
  return data ? toTemplate(data as RawRow) : null;
}

/** Update a dunning template. */
export async function updateDunningTemplate(
  id: string,
  updates: DunningTemplateUpdate,
): Promise<DunningTemplate | null> {
  const db = getDb();
  if (!db) return null;
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.betreff !== undefined) payload.betreff = updates.betreff;
  if (updates.textHtml !== undefined) payload.text_html = updates.textHtml;
  if (updates.textPlain !== undefined) payload.text_plain = updates.textPlain;
  if (updates.fristTage !== undefined) payload.frist_tage = updates.fristTage;
  if (updates.gebuehr !== undefined) payload.gebuehr = updates.gebuehr;
  if (updates.aktiv !== undefined) payload.aktiv = updates.aktiv;
  if (Object.keys(payload).length === 0) return null;
  const { data } = await db
    .from('dunning_templates')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  return data ? toTemplate(data as RawRow) : null;
}

/** Reset templates to defaults (re-seed from Brevo originals). */
export async function resetDunningTemplates(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  const tid = await tenantId();
  if (!tid) return 0;
  await db.from('dunning_templates').delete().eq('tenant_id', tid);
  await ensureDefaults(tid);
  return DEFAULTS.length;
}

/** Render a template with actual values (preview or n8n). */
export function renderTemplate(
  template: DunningTemplate,
  vars: Record<string, string>,
): { subject: string; html: string; plain: string } {
  const replace = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
  return {
    subject: replace(template.betreff),
    html: replace(template.textHtml),
    plain: replace(template.textPlain),
  };
}

// Available placeholders for the UI help text
export const PLACEHOLDERS = [
  { key: 'kunde_name', label: 'Kundenname' },
  { key: 'rechnungsnummer', label: 'Rechnungsnummer' },
  { key: 'rechnungsdatum', label: 'Rechnungsdatum' },
  { key: 'betrag', label: 'Rechnungsbetrag' },
  { key: 'betrag_mit_gebuehr', label: 'Betrag inkl. Mahngebühren' },
  { key: 'faelligkeitsdatum', label: 'Fälligkeitsdatum' },
  { key: 'ueberfaellig_tage', label: 'Tage überfällig' },
  { key: 'gebuehr', label: 'Mahngebühr' },
  { key: 'zahlungsziel', label: 'Neues Zahlungsziel' },
  { key: 'firma_name', label: 'Firmenname (Absender)' },
] as const;
