// Server-only Google Workspace client (Gmail + Calendar). Reads OAuth creds from
// env, mints an access token from the refresh token. Never shipped to the browser.
// Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID

interface GoogleAuth { clientId: string; clientSecret: string; refreshToken: string; calendarId: string }

function googleAuth(): GoogleAuth | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken, calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary' };
}

export function googleConfigured(): boolean {
  return googleAuth() !== null;
}

async function accessToken(auth: GoogleAuth): Promise<string> {
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
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`Google OAuth ${res.status}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Google OAuth: kein access_token');
  return json.access_token;
}

// ---------------- Gmail ----------------

export interface Mailbox {
  configured: boolean;
  error?: string;
  account?: string;
  messagesTotal: number;
  unread: number;
  recent: { id: string; from: string; subject: string; snippet: string; date?: string }[];
}

function decodeFrom(raw: string): string {
  const m = raw.match(/^(.*?)\s*<.*>$/);
  return (m ? m[1] : raw).replace(/"/g, '').trim() || raw;
}

export async function getMailbox(): Promise<Mailbox> {
  const auth = googleAuth();
  if (!auth) return { configured: false, messagesTotal: 0, unread: 0, recent: [] };
  try {
    const token = await accessToken(auth);
    const h = { Authorization: `Bearer ${token}` };
    const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

    const [profileRes, unreadRes, listRes] = await Promise.all([
      fetch(`${API}/profile`, { headers: h, next: { revalidate: 120 } }),
      fetch(`${API}/messages?q=is:unread&maxResults=1`, { headers: h, next: { revalidate: 120 } }),
      fetch(`${API}/messages?labelIds=INBOX&maxResults=12`, { headers: h, next: { revalidate: 120 } }),
    ]);
    if (!profileRes.ok) return { configured: true, error: `Gmail HTTP ${profileRes.status}`, messagesTotal: 0, unread: 0, recent: [] };

    const profile = (await profileRes.json()) as { emailAddress?: string; messagesTotal?: number };
    const unread = unreadRes.ok ? ((await unreadRes.json()) as { resultSizeEstimate?: number }).resultSizeEstimate ?? 0 : 0;
    const ids = listRes.ok ? ((await listRes.json()) as { messages?: { id: string }[] }).messages ?? [] : [];

    const recent = await Promise.all(
      ids.slice(0, 10).map(async (m) => {
        const r = await fetch(`${API}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, { headers: h, next: { revalidate: 120 } });
        if (!r.ok) return { id: m.id, from: '', subject: '(ohne Betreff)', snippet: '' };
        const meta = (await r.json()) as { snippet?: string; payload?: { headers?: { name: string; value: string }[] } };
        const hd = (n: string) => meta.payload?.headers?.find((x) => x.name.toLowerCase() === n)?.value ?? '';
        return { id: m.id, from: decodeFrom(hd('from')), subject: hd('subject') || '(ohne Betreff)', snippet: meta.snippet ?? '', date: hd('date') };
      }),
    );

    return { configured: true, account: profile.emailAddress, messagesTotal: profile.messagesTotal ?? 0, unread, recent };
  } catch (e) {
    return { configured: true, error: (e as Error).message, messagesTotal: 0, unread: 0, recent: [] };
  }
}

// ---------------- Calendar ----------------

export interface GCalEvent { id: string; title: string; start: string; end?: string; allDay: boolean; location?: string; attendees: number }
export interface CalendarView { configured: boolean; error?: string; events: GCalEvent[] }

export async function getGoogleCalendar(): Promise<CalendarView> {
  const auth = googleAuth();
  if (!auth) return { configured: false, events: [] };
  try {
    const token = await accessToken(auth);
    const cal = encodeURIComponent(auth.calendarId);
    const params = new URLSearchParams({ maxResults: '25', orderBy: 'startTime', singleEvents: 'true', timeMin: new Date().toISOString() });
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal}/events?${params}`, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 120 } });
    if (!res.ok) return { configured: true, error: `Calendar HTTP ${res.status}`, events: [] };
    const json = (await res.json()) as { items?: { id: string; summary?: string; location?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; attendees?: unknown[] }[] };
    const events: GCalEvent[] = (json.items ?? []).map((e) => ({
      id: e.id,
      title: e.summary || 'Termin',
      start: e.start?.dateTime || e.start?.date || '',
      end: e.end?.dateTime || e.end?.date,
      allDay: !e.start?.dateTime,
      location: e.location,
      attendees: Array.isArray(e.attendees) ? e.attendees.length : 0,
    }));
    return { configured: true, events };
  } catch (e) {
    return { configured: true, error: (e as Error).message, events: [] };
  }
}
