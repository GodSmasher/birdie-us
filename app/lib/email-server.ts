// Email sync + matching engine.
// Fetches emails from Gmail API, stores in Supabase.
// Uses Claude Haiku for intelligent categorization and invoice matching.

import { getDb, tenantId } from './db';

// ── Types ──────────────────────────────────────────────────────────────

export interface StoredEmail {
  id: string;
  gmail_id: string;
  thread_id?: string;
  from_email: string;
  from_name?: string;
  to_email?: string;
  subject?: string;
  snippet?: string;
  body_plain?: string;
  received_at: string;
  is_read: boolean;
  matched_invoice?: string;
  matched_project_id?: string;
  category: string;
  summary?: string;
  intent?: string;
  labels: string[];
  created_at: string;
}

// ── Haiku Email Analysis ──────────────────────────────────────────────

interface HaikuAnalysis {
  category: 'dunning_reply' | 'payment_info' | 'bounce' | 'invoice' | 'inquiry' | 'general';
  invoice_number: string | null;
  summary: string;
  intent: string;
  customer_name: string | null;
}

const HAIKU_SYSTEM = `Du bist ein Email-Analyse-Bot für ein Solarunternehmen (Volta Energietechnik GmbH).
Analysiere eingehende Emails und extrahiere strukturierte Informationen.

Antworte NUR mit validem JSON (kein Markdown, kein Text drumherum):
{
  "category": "dunning_reply|payment_info|bounce|invoice|inquiry|general",
  "invoice_number": "RE-xxxx oder null",
  "summary": "1 Satz Zusammenfassung auf Deutsch",
  "intent": "Was will der Absender? (z.B. 'Zahlung angekündigt', 'Rechnung angefragt', 'Reklamation')",
  "customer_name": "Name der Firma/Person oder null"
}

Kategorien:
- dunning_reply: Antwort auf Mahnung/Zahlungserinnerung
- payment_info: Zahlungsbestätigung oder Zahlungsankündigung
- bounce: Unzustellbar, Delivery Failure
- invoice: Rechnung (eingehend von Lieferant)
- inquiry: Kundenanfrage, Angebot, Termin
- general: Alles andere (Newsletter, Notifications, etc.)`;

async function analyzeWithHaiku(
  from: string,
  subject: string,
  body: string,
): Promise<HaikuAnalysis | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const emailText = `Von: ${from}\nBetreff: ${subject}\n\n${body.slice(0, 2000)}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-20250414',
        max_tokens: 300,
        system: HAIKU_SYSTEM,
        messages: [{ role: 'user', content: emailText }],
      }),
    });

    if (!res.ok) {
      console.error('[email-haiku] API error:', res.status);
      return null;
    }

    const data = (await res.json()) as {
      content?: { type: string; text: string }[];
    };
    const text = data.content?.[0]?.text ?? '';
    const parsed = JSON.parse(text) as HaikuAnalysis;
    return parsed;
  } catch (e) {
    console.error('[email-haiku] Parse error:', e);
    return null;
  }
}

// Fallback: simple keyword-based classification (when Haiku unavailable)
function classifyFallback(subject: string, body: string, fromEmail: string): string {
  const text = `${subject} ${body}`.toLowerCase();
  if (fromEmail.includes('mailer-daemon') || fromEmail.includes('postmaster') ||
      text.includes('delivery failed') || text.includes('nicht zustellbar')) return 'bounce';
  if (text.includes('zahlung') || text.includes('überwiesen') || text.includes('bezahlt')) return 'payment_info';
  if (text.includes('mahnung') || text.includes('zahlungserinnerung') || text.includes('fällig')) return 'dunning_reply';
  return 'general';
}

function extractInvoiceFallback(text: string): string | null {
  const patterns = [/(?:RE|RG|INV)[- _]?\d{4}[- _]\d{2,6}/gi];
  for (const p of patterns) { p.lastIndex = 0; const m = p.exec(text); if (m) return m[0].trim(); }
  return null;
}

// ── Gmail API helpers ──────────────────────────────────────────────────

interface GmailAuth { clientId: string; clientSecret: string; refreshToken: string }

function gmailAuth(): GmailAuth | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken(auth: GmailAuth): Promise<string> {
  const body = new URLSearchParams({
    client_id: auth.clientId,
    client_secret: auth.clientSecret,
    refresh_token: auth.refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google OAuth ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Google OAuth: kein access_token');
  return json.access_token;
}

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface GmailMessage {
  id: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: { name: string; value: string }[];
    body?: { data?: string };
    parts?: { mimeType?: string; body?: { data?: string } }[];
  };
}

function header(msg: GmailMessage, name: string): string {
  return msg.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function parseFrom(raw: string): { email: string; name: string } {
  const m = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (m) return { name: m[1].replace(/"/g, '').trim(), email: m[2].trim() };
  return { email: raw.trim(), name: '' };
}

function decodeBase64Url(data: string): string {
  const b64 = data.replace(/-/g, '+').replace(/_/g, '/');
  try { return Buffer.from(b64, 'base64').toString('utf-8'); } catch { return ''; }
}

function extractPlainBody(msg: GmailMessage): string {
  // Try parts first
  if (msg.payload?.parts) {
    const textPart = msg.payload.parts.find((p) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) return decodeBase64Url(textPart.body.data);
  }
  // Fallback: direct body
  if (msg.payload?.body?.data) return decodeBase64Url(msg.payload.body.data);
  return '';
}

// ── Sync engine ────────────────────────────────────────────────────────

export interface SyncResult {
  fetched: number;
  newEmails: number;
  matched: number;
  errors: string[];
}

/**
 * Sync recent emails from Gmail into Supabase.
 * Only fetches emails not yet stored (deduplication via gmail_id).
 */
export async function syncEmails(maxResults = 25): Promise<SyncResult> {
  const result: SyncResult = { fetched: 0, newEmails: 0, matched: 0, errors: [] };

  const auth = gmailAuth();
  if (!auth) { result.errors.push('Google not configured'); return result; }

  const db = getDb();
  if (!db) { result.errors.push('DB not configured'); return result; }

  const tid = await tenantId();
  if (!tid) { result.errors.push('Tenant not found'); return result; }

  try {
    const token = await getAccessToken(auth);
    const h = { Authorization: `Bearer ${token}` };

    // Fetch recent message IDs from INBOX
    const listRes = await fetch(
      `${API}/messages?labelIds=INBOX&maxResults=${maxResults}`,
      { headers: h, cache: 'no-store' },
    );
    if (!listRes.ok) { result.errors.push(`Gmail list ${listRes.status}`); return result; }

    const listData = (await listRes.json()) as { messages?: { id: string }[] };
    const messageIds = listData.messages?.map((m) => m.id) ?? [];
    result.fetched = messageIds.length;

    if (messageIds.length === 0) return result;

    // Check which are already stored
    const { data: existing } = await db
      .from('emails')
      .select('gmail_id')
      .eq('tenant_id', tid)
      .in('gmail_id', messageIds);
    const existingIds = new Set((existing ?? []).map((e: { gmail_id: string }) => e.gmail_id));

    const newIds = messageIds.filter((id) => !existingIds.has(id));
    if (newIds.length === 0) return result;

    // Fetch full message data for new emails
    const messages = await Promise.all(
      newIds.map(async (id) => {
        const res = await fetch(`${API}/messages/${id}?format=full`, { headers: h, cache: 'no-store' });
        if (!res.ok) return null;
        return (await res.json()) as GmailMessage;
      }),
    );

    // Also load cashflow projects for matching
    const { data: projects } = await db
      .from('cashflow_projects')
      .select('id, customer_name, reonic_offer_id')
      .eq('tenant_id', tid);

    for (const msg of messages) {
      if (!msg) continue;
      try {
        const from = parseFrom(header(msg, 'from'));
        const subject = header(msg, 'subject') || '(ohne Betreff)';
        const body = extractPlainBody(msg);
        const received = msg.internalDate
          ? new Date(parseInt(msg.internalDate)).toISOString()
          : new Date().toISOString();

        // ── Haiku analysis (with fallback) ──────────────────────
        const haiku = await analyzeWithHaiku(
          `${from.name} <${from.email}>`,
          subject,
          body,
        );

        const category = haiku?.category ?? classifyFallback(subject, body, from.email);
        const invoiceNr = haiku?.invoice_number ?? extractInvoiceFallback(`${subject} ${body}`);
        const summary = haiku?.summary ?? '';
        const intent = haiku?.intent ?? '';

        // Try to match project by customer name
        let matchedProjectId: string | null = null;
        const customerName = haiku?.customer_name || from.name;
        if (projects && customerName) {
          const searchStr = `${customerName} ${from.email}`.toLowerCase();
          const match = projects.find((p: { customer_name?: string }) =>
            p.customer_name && searchStr.includes(p.customer_name.toLowerCase()),
          );
          if (match) matchedProjectId = (match as { id: string }).id;
        }

        const { error } = await db.from('emails').upsert({
          tenant_id: tid,
          gmail_id: msg.id,
          thread_id: msg.threadId,
          from_email: from.email,
          from_name: from.name,
          to_email: header(msg, 'to'),
          subject,
          snippet: msg.snippet ?? '',
          body_plain: body.slice(0, 10000),
          received_at: received,
          is_read: !(msg.labelIds ?? []).includes('UNREAD'),
          matched_invoice: invoiceNr,
          matched_project_id: matchedProjectId,
          category,
          summary,
          intent,
          labels: msg.labelIds ?? [],
        }, { onConflict: 'tenant_id,gmail_id' });

        if (error) {
          result.errors.push(`Insert ${msg.id}: ${error.message}`);
        } else {
          result.newEmails++;
          if (invoiceNr || matchedProjectId) result.matched++;
        }
      } catch (e) {
        result.errors.push(`Process ${msg.id}: ${(e as Error).message}`);
      }
    }
  } catch (e) {
    result.errors.push((e as Error).message);
  }

  return result;
}

// ── Read from DB ───────────────────────────────────────────────────────

export async function getEmails(opts?: {
  category?: string;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<StoredEmail[]> {
  const db = getDb();
  if (!db) return [];
  const tid = await tenantId();
  if (!tid) return [];

  let q = db
    .from('emails')
    .select('*')
    .eq('tenant_id', tid)
    .order('received_at', { ascending: false })
    .limit(opts?.limit ?? 50);

  if (opts?.category) q = q.eq('category', opts.category);
  if (opts?.unreadOnly) q = q.eq('is_read', false);

  const { data } = await q;
  return (data ?? []) as StoredEmail[];
}

export async function markEmailRead(emailId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const { error } = await db.from('emails').update({ is_read: true }).eq('id', emailId);
  return !error;
}

export async function getEmailStats(): Promise<{
  total: number;
  unread: number;
  dunningReplies: number;
  paymentInfos: number;
  bounces: number;
}> {
  const db = getDb();
  if (!db) return { total: 0, unread: 0, dunningReplies: 0, paymentInfos: 0, bounces: 0 };
  const tid = await tenantId();
  if (!tid) return { total: 0, unread: 0, dunningReplies: 0, paymentInfos: 0, bounces: 0 };

  const { count: total } = await db.from('emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid);
  const { count: unread } = await db.from('emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('is_read', false);
  const { count: dunningReplies } = await db.from('emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('category', 'dunning_reply');
  const { count: paymentInfos } = await db.from('emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('category', 'payment_info');
  const { count: bounces } = await db.from('emails').select('*', { count: 'exact', head: true }).eq('tenant_id', tid).eq('category', 'bounce');

  return {
    total: total ?? 0,
    unread: unread ?? 0,
    dunningReplies: dunningReplies ?? 0,
    paymentInfos: paymentInfos ?? 0,
    bounces: bounces ?? 0,
  };
}
