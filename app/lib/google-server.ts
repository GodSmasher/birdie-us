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
    cache: 'no-store',
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

export interface GCalEvent { id: string; title: string; start: string; end?: string; allDay: boolean; location?: string; attendees: number; owner?: string }
export interface CalendarView { configured: boolean; error?: string; events: GCalEvent[]; calendarCount: number }

interface RawCalEvent { id: string; summary?: string; location?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; attendees?: unknown[] }

async function fetchEvents(token: string, calId: string, timeMin: string, owner?: string): Promise<GCalEvent[]> {
  const params = new URLSearchParams({ maxResults: '10', orderBy: 'startTime', singleEvents: 'true', timeMin });
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 120 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: RawCalEvent[] };
  return (json.items ?? []).map((e) => ({
    id: e.id,
    title: e.summary || 'Termin',
    start: e.start?.dateTime || e.start?.date || '',
    end: e.end?.dateTime || e.end?.date,
    allDay: !e.start?.dateTime,
    location: e.location,
    attendees: Array.isArray(e.attendees) ? e.attendees.length : 0,
    owner,
  }));
}

export async function getGoogleCalendar(): Promise<CalendarView> {
  const auth = googleAuth();
  if (!auth) return { configured: false, events: [], calendarCount: 0 };
  try {
    const token = await accessToken(auth);
    const timeMin = new Date().toISOString();

    // List all accessible calendars (employee calendars shared with this account).
    const listRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=50', {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 600 },
    });
    if (!listRes.ok) return { configured: true, error: `Calendar HTTP ${listRes.status}`, events: [], calendarCount: 0 };
    const calendars = ((await listRes.json()) as { items?: { id: string; summary?: string }[] }).items ?? [];

    // Aggregate upcoming events across up to 25 calendars.
    const batches = await Promise.all(
      calendars.slice(0, 25).map((c) => fetchEvents(token, c.id, timeMin, c.summary || c.id)),
    );
    const events = batches.flat().sort((a, b) => Date.parse(a.start) - Date.parse(b.start)).slice(0, 24);

    return { configured: true, events, calendarCount: calendars.length };
  } catch (e) {
    return { configured: true, error: (e as Error).message, events: [], calendarCount: 0 };
  }
}

// ---------------- Drive (Wissensablage / Dateien) ----------------

export interface DriveItem { id: string; name: string; type: string; modified?: string; link?: string; isFolder: boolean }
export interface DriveView {
  configured: boolean;
  scopeMissing?: boolean;
  error?: string;
  folders: DriveItem[];
  files: DriveItem[];
}

function driveType(mime: string): string {
  if (mime.includes('folder')) return 'Ordner';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('spreadsheet')) return 'Tabelle';
  if (mime.includes('document')) return 'Dokument';
  if (mime.includes('presentation')) return 'Präsentation';
  if (mime.includes('image')) return 'Bild';
  return mime.split('/').pop() ?? 'Datei';
}

export async function getDrive(folderId?: string): Promise<DriveView> {
  const auth = googleAuth();
  if (!auth) return { configured: false, folders: [], files: [] };
  try {
    const token = await accessToken(auth);
    const parent = folderId || 'root';
    const params = new URLSearchParams({
      q: `'${parent}' in parents and trashed=false`,
      orderBy: 'folder,name',
      pageSize: '100',
      fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
    });
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 120 },
    });
    if (res.status === 403) return { configured: true, scopeMissing: true, folders: [], files: [] };
    if (!res.ok) return { configured: true, error: `Drive HTTP ${res.status}`, folders: [], files: [] };

    const json = (await res.json()) as { files?: { id: string; name: string; mimeType: string; modifiedTime?: string; webViewLink?: string }[] };
    const items: DriveItem[] = (json.files ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      type: driveType(f.mimeType),
      modified: f.modifiedTime,
      link: f.webViewLink,
      isFolder: f.mimeType.includes('folder'),
    }));
    return { configured: true, folders: items.filter((i) => i.isFolder), files: items.filter((i) => !i.isFolder) };
  } catch (e) {
    return { configured: true, error: (e as Error).message, folders: [], files: [] };
  }
}

/** Search Drive by filename (for the command palette). */
export async function searchDrive(query: string): Promise<{ name: string; link?: string; type: string }[]> {
  const auth = googleAuth();
  if (!auth) return [];
  const q = query.replace(/['"\\]/g, '').trim();
  if (q.length < 2) return [];
  try {
    const token = await accessToken(auth);
    const params = new URLSearchParams({
      q: `name contains '${q}' and trashed=false`,
      pageSize: '5',
      fields: 'files(name,mimeType,webViewLink)',
      orderBy: 'modifiedTime desc',
    });
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { files?: { name: string; mimeType: string; webViewLink?: string }[] };
    return (json.files ?? []).map((f) => ({ name: f.name, link: f.webViewLink, type: driveType(f.mimeType) }));
  } catch {
    return [];
  }
}

/** Upload a file to Google Drive. Returns file ID and web link. */
export async function uploadToDrive(
  filename: string,
  content: Buffer | Uint8Array,
  mimeType: string = 'application/pdf',
  parentFolderId?: string,
): Promise<{ id: string; name: string; link: string } | null> {
  const auth = googleAuth();
  if (!auth) return null;
  try {
    const token = await accessToken(auth);

    // Multipart upload: metadata + file content
    const boundary = '---birdie-upload-' + Date.now();
    const metadata = JSON.stringify({
      name: filename,
      mimeType,
      ...(parentFolderId ? { parents: [parentFolderId] } : {}),
    });

    const parts = [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(content).toString('base64')}\r\n`,
      `--${boundary}--`,
    ];
    const body = parts.join('');

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!res.ok) {
      console.error('[drive] Upload failed:', res.status, await res.text().catch(() => ''));
      return null;
    }

    const json = (await res.json()) as { id: string; name: string; webViewLink?: string };
    return { id: json.id, name: json.name, link: json.webViewLink ?? `https://drive.google.com/file/d/${json.id}/view` };
  } catch (e) {
    console.error('[drive] Upload error:', (e as Error).message);
    return null;
  }
}

/** Ensure a folder exists inside a parent (create if needed). Returns folder ID. */
export async function ensureDriveFolder(name: string, parentId?: string): Promise<string | null> {
  const auth = googleAuth();
  if (!auth) return null;
  try {
    const token = await accessToken(auth);
    const h = { Authorization: `Bearer ${token}` };

    // Check if folder already exists
    console.log(`[drive] ensureFolder name="${name}" parent=${parentId ?? 'root'}`);
    const q = parentId
      ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`;
    const searchRes = await fetch(searchUrl, { headers: h });
    console.log(`[drive] Search status=${searchRes.status}`);
    if (searchRes.ok) {
      const data = (await searchRes.json()) as { files?: { id: string }[] };
      if (data.files?.length) { console.log(`[drive] Found existing: ${data.files[0].id}`); return data.files[0].id; }
    } else {
      console.error(`[drive] Search failed: ${searchRes.status}`, await searchRes.text().catch(() => ''));
    }

    // Create folder
    console.log(`[drive] Creating folder "${name}"...`);
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
      method: 'POST',
      headers: { ...h, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId ? { parents: [parentId] } : {}),
      }),
    });
    if (!createRes.ok) {
      console.error(`[drive] Folder create failed: ${createRes.status}`, await createRes.text().catch(() => ''));
      return null;
    }
    const folder = (await createRes.json()) as { id: string };
    console.log(`[drive] Folder created: ${folder.id}`);
    return folder.id;
  } catch (e) {
    console.error('[drive] ensureFolder error:', (e as Error).message);
    return null;
  }
}

/** Download a Drive file's raw bytes (server-only). */
export async function downloadDriveFile(fileId: string): Promise<Uint8Array | null> {
  const auth = googleAuth();
  if (!auth) return null;
  try {
    const token = await accessToken(auth);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}
