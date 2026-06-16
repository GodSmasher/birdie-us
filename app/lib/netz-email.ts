// Netzanmeldung Email Integration (push-based via n8n)
// - n8n polls IMAP mailboxes and pushes emails here
// - Haiku classification for Netz-relevant emails
// - Matching to registrations by customer name / Netzbetreiber
// - Returns autoReply flag → n8n sends the reply via SMTP

import { getDb, tenantId, getEntities } from './db';
import type { Registration } from './netzanmeldung';
import { setRegistrationStatus, type StageId } from './netzanmeldung';

// ── Types ──────────────────────────────────────────────────────────────

export interface NetzEmail {
  id?: string;
  mailbox: string;
  message_id: string;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  body_plain: string;
  received_at: string;
  is_read: boolean;
  category: NetzEmailCategory;
  summary: string;
  intent: string;
  matched_registration_id: string | null;
  matched_customer: string | null;
  auto_replied: boolean;
  created_at?: string;
}

export type NetzEmailCategory =
  | 'netz_status'
  | 'netz_document'
  | 'customer_update'
  | 'customer_doc'
  | 'customer_correction'
  | 'bounce'
  | 'general';

/** Incoming email payload from n8n */
export interface IncomingEmail {
  mailbox: string;         // which mailbox it came from
  messageId: string;       // IMAP Message-ID
  from: string;            // email address
  fromName?: string;
  to: string;
  subject: string;
  body: string;            // plain text body
  date: string;            // ISO date
}

// ── Haiku Analysis ────────────────────────────────────────────────────

const NETZ_HAIKU_SYSTEM = `Du bist ein Email-Analyse-Bot für Volta Energietechnik (Solarinstallateur in Leipzig).
Analysiere eingehende Emails im Kontext der Netzanmeldung (Anmeldung von PV-Anlagen beim Netzbetreiber).

Antworte NUR mit validem JSON:
{
  "category": "netz_status|netz_document|customer_update|customer_doc|customer_correction|bounce|general",
  "summary": "1 Satz Zusammenfassung",
  "intent": "Was will der Absender?",
  "customer_name": "Name des Kunden/Anlagenbetreibers oder null",
  "netzbetreiber": "Name des Netzbetreibers oder null",
  "is_netz_relevant": true/false
}

Kategorien:
- netz_status: Netzbetreiber meldet Ergebnis (Zusage, Ablehnung, fehlende Unterlagen, Zählerwechsel-Termin)
- netz_document: Dokument-bezogen (Vollmacht, Lageplan, Datenblatt, Anschlussbegehren)
- customer_update: Kunde fragt nach aktuellem Stand der Netzanmeldung
- customer_doc: Kunde schickt ein benötigtes Dokument (Grundbuch, Personalausweis, etc.)
- customer_correction: Korrektur nötig (falsche Daten, Adressänderung, Klärungsbedarf)
- bounce: Unzustellbar / Delivery Failure
- general: Nicht netzanmeldungs-relevant (Newsletter, Werbung, interne Mails)

Typische Netzbetreiber: MITNETZ Strom, enviaM, Stadtwerke Leipzig, SW Jena Netze, TEN Thüringer Energienetze, Bayernwerk, E.DIS, Westnetz, Netz Leipzig, SachsenNetze`;

interface HaikuResult {
  category: NetzEmailCategory;
  summary: string;
  intent: string;
  customer_name: string | null;
  netzbetreiber: string | null;
  is_netz_relevant: boolean;
}

let _lastHaikuError = '';

async function analyzeWithHaiku(from: string, subject: string, body: string): Promise<HaikuResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { _lastHaikuError = 'no API key'; return null; }

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
        max_tokens: 400,
        system: NETZ_HAIKU_SYSTEM,
        messages: [{ role: 'user', content: `Von: ${from}\nBetreff: ${subject}\n\n${body.slice(0, 2000)}` }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      _lastHaikuError = `API ${res.status}: ${errText.slice(0, 200)}`;
      return null;
    }
    const data = (await res.json()) as { content?: { type: string; text: string }[] };
    let text = data.content?.[0]?.text ?? '{}';
    // Strip markdown code fences if Haiku wraps in ```json ... ```
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    _lastHaikuError = '';
    return JSON.parse(text) as HaikuResult;
  } catch (e) {
    _lastHaikuError = `parse: ${(e as Error).message}`;
    return null;
  }
}

export function getLastHaikuError(): string { return _lastHaikuError; }

// ── Registration Matching ─────────────────────────────────────────────

function matchRegistration(
  regs: Registration[],
  customerName: string | null,
  fromEmail: string,
  subject: string,
): { regId: string; customer: string } | null {
  if (!customerName) return null;
  const searchStr = `${customerName} ${fromEmail} ${subject}`.toLowerCase();

  // Full name match
  for (const r of regs) {
    const rc = r.customer.toLowerCase();
    if (rc === '—' || rc.length < 3) continue;
    const parts = rc.split(/\s+/).filter((p) => p.length >= 3);
    if (parts.length > 0 && parts.every((p) => searchStr.includes(p))) {
      return { regId: r.offerId, customer: r.customer };
    }
  }

  // Last-name fallback
  for (const r of regs) {
    const parts = r.customer.split(/\s+/).filter((p) => p.length >= 4);
    const lastName = parts[parts.length - 1]?.toLowerCase();
    if (lastName && searchStr.includes(lastName)) {
      return { regId: r.offerId, customer: r.customer };
    }
  }

  return null;
}

// ── Ingest (called by n8n webhook) ────────────────────────────────────

export interface IngestResult {
  stored: boolean;
  duplicate: boolean;
  category: NetzEmailCategory;
  haikuError?: string;
  summary: string;
  matched_registration_id: string | null;
  matched_customer: string | null;
  autoReply: boolean;
  error?: string;
}

export async function ingestEmail(email: IncomingEmail): Promise<IngestResult> {
  const empty: IngestResult = {
    stored: false, duplicate: false, category: 'general',
    summary: '', matched_registration_id: null, matched_customer: null, autoReply: false,
  };

  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return { ...empty, error: 'DB/tenant not configured' };

  // Dedup check
  const { data: existing } = await db
    .from('netz_emails')
    .select('id')
    .eq('tenant_id', tid)
    .eq('mailbox', email.mailbox)
    .eq('message_id', email.messageId)
    .limit(1);
  if (existing && existing.length > 0) {
    return { ...empty, duplicate: true };
  }

  // Haiku analysis
  const analysis = await analyzeWithHaiku(
    `${email.fromName || ''} <${email.from}>`,
    email.subject,
    email.body,
  );

  // Skip non-relevant emails
  if (analysis && !analysis.is_netz_relevant) {
    return { ...empty, category: 'general', summary: analysis.summary };
  }

  const category: NetzEmailCategory = analysis?.category ?? 'general';
  const summary = analysis?.summary ?? '';
  const intent = analysis?.intent ?? '';

  // Match to registration
  const regs = await getEntities<Registration>('registration');
  const match = matchRegistration(regs, analysis?.customer_name ?? null, email.from, email.subject);

  // Auto-reply for customer emails
  const isCustomerMail = ['customer_update', 'customer_doc', 'customer_correction'].includes(category);
  const autoReply = isCustomerMail && !email.from.includes('volta-energietechnik.de');

  // Store in DB
  const { error } = await db.from('netz_emails').upsert({
    tenant_id: tid,
    mailbox: email.mailbox,
    message_id: email.messageId,
    from_email: email.from,
    from_name: email.fromName || '',
    to_email: email.to,
    subject: email.subject,
    body_plain: email.body.slice(0, 10000),
    received_at: email.date || new Date().toISOString(),
    is_read: false,
    category,
    summary,
    intent,
    matched_registration_id: match?.regId ?? null,
    matched_customer: match?.customer ?? null,
    auto_replied: autoReply,
  }, { onConflict: 'tenant_id,mailbox,message_id' });

  if (error) return { ...empty, error: error.message };

  // Auto-update registration status based on email category
  if (match && category === 'netz_status') {
    const intentLower = intent.toLowerCase();
    let newStatus: StageId | null = null;
    if (intentLower.includes('zusage') || intentLower.includes('genehmig') || intentLower.includes('bestätig') || intentLower.includes('netzverträglich')) {
      newStatus = 'zusage';
    } else if (intentLower.includes('inbetrieb') || intentLower.includes('zähler')) {
      newStatus = 'inbetriebnahme';
    }
    if (newStatus) {
      await setRegistrationStatus(match.regId, newStatus).catch(() => {});
    }
  }

  return {
    stored: true,
    duplicate: false,
    category,
    summary,
    matched_registration_id: match?.regId ?? null,
    matched_customer: match?.customer ?? null,
    autoReply,
    haikuError: _lastHaikuError || undefined,
  };
}

// ── Read from DB ──────────────────────────────────────────────────────

export async function getNetzEmails(opts?: {
  registrationId?: string;
  category?: NetzEmailCategory;
  unreadOnly?: boolean;
  limit?: number;
}): Promise<NetzEmail[]> {
  const db = getDb();
  if (!db) return [];
  const tid = await tenantId('volta');
  if (!tid) return [];

  let q = db
    .from('netz_emails')
    .select('*')
    .eq('tenant_id', tid)
    .order('received_at', { ascending: false })
    .limit(opts?.limit ?? 50);

  if (opts?.registrationId) q = q.eq('matched_registration_id', opts.registrationId);
  if (opts?.category) q = q.eq('category', opts.category);
  if (opts?.unreadOnly) q = q.eq('is_read', false);

  const { data } = await q;
  return (data ?? []) as NetzEmail[];
}

export async function markNetzEmailRead(emailId: string, isRead = true): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const { error } = await db.from('netz_emails').update({ is_read: isRead }).eq('id', emailId);
  return !error;
}

export async function getNetzEmailStats(): Promise<{
  total: number;
  unread: number;
  matched: number;
  byCategory: Record<string, number>;
}> {
  const db = getDb();
  if (!db) return { total: 0, unread: 0, matched: 0, byCategory: {} };
  const tid = await tenantId('volta');
  if (!tid) return { total: 0, unread: 0, matched: 0, byCategory: {} };

  const { count: total } = await db.from('netz_emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid);
  const { count: unread } = await db.from('netz_emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('is_read', false);
  const { count: matched } = await db.from('netz_emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).not('matched_registration_id', 'is', null);

  const { data: cats } = await db.from('netz_emails').select('category').eq('tenant_id', tid);
  const byCategory: Record<string, number> = {};
  for (const row of (cats ?? []) as { category: string }[]) {
    byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
  }

  return { total: total ?? 0, unread: unread ?? 0, matched: matched ?? 0, byCategory };
}

// ── Auto-Reply Text (for n8n to use) ──────────────────────────────────

export const AUTO_REPLY_TEXT = `Sehr geehrte Damen und Herren,

vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und werden diese schnellstmöglich bearbeiten.

Wir melden uns spätestens innerhalb einer Woche bei Ihnen.

Mit freundlichen Grüßen

--
Netzanmeldung | Volta Solar
Tel.: +49 1511 1051305
Mail: netzanmeldung@volta-solaranlagen.de
Web: volta-solaranlagen.de
Hauptsitz: Am Schenkberg 12 | 04349 | Leipzig`;

export const AUTO_REPLY_HTML = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
<p>Sehr geehrte Damen und Herren,</p>
<p>vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und werden diese schnellstmöglich bearbeiten.</p>
<p>Wir melden uns spätestens innerhalb einer Woche bei Ihnen.</p>
<p>Mit freundlichen Grüßen</p>
<br/>
<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #333;">
  <tr>
    <td style="padding-right: 15px; border-right: 2px solid #c8d83c; vertical-align: top;">
      <img src="https://volta-solaranlagen.de/wp-content/uploads/2023/09/volta-solar-logo.png" alt="Volta Solar" width="120" style="display: block;" />
    </td>
    <td style="padding-left: 15px; vertical-align: top;">
      <strong style="font-size: 14px;">Netzanmeldung</strong><br/>
      <span style="color: #666;">Volta Solar</span><br/><br/>
      <strong>Tel.:</strong> <a href="tel:+4917014757 82" style="color: #c8d83c; text-decoration: none;">+49 1511 1051305</a><br/>
      <strong>Mail:</strong> <a href="mailto:netzanmeldung@volta-solaranlagen.de" style="color: #c8d83c; text-decoration: none;">netzanmeldung@volta-solaranlagen.de</a><br/>
      <strong>Web:</strong> <a href="https://volta-solaranlagen.de" style="color: #c8d83c; text-decoration: none;">volta-solaranlagen.de</a><br/>
      <strong>Hauptsitz:</strong> Am Schenkberg 12 | 04349 | Leipzig
    </td>
  </tr>
</table>
</div>`;
