import { type Connector, type ConnectorContext, type TestResult } from '../types.js';
import { googleConfig, googleAccessToken, hasGoogleAuth } from '../google.js';

// Google Drive API v3. OAuth2 Bearer (shared google.ts helper).
// Docs: https://developers.google.com/drive/api/reference/rest/v3

const API = 'https://www.googleapis.com/drive/v3';

interface DriveFile { id: string; name: string; mimeType: string; modifiedTime?: string; size?: string; webViewLink?: string }

export interface DriveOverview {
  usedBytes?: number;
  limitBytes?: number;
  recent: { id: string; name: string; type: string; modified?: string; link?: string }[];
}

function shortType(mime: string): string {
  if (mime.includes('folder')) return 'Ordner';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('spreadsheet')) return 'Tabelle';
  if (mime.includes('document')) return 'Dokument';
  if (mime.includes('image')) return 'Bild';
  return mime.split('/').pop() ?? 'Datei';
}

export const googleDrive: Connector<DriveOverview> = {
  manifest: {
    id: 'google-drive',
    name: 'Google Drive',
    vendor: 'Google',
    category: 'comms',
    regions: ['DE', 'AT', 'CH'],
    authType: 'oauth2',
    protocol: 'Drive API v3',
    capabilities: ['read', 'write'],
    config: [
      ...googleConfig,
      { key: 'folderId', label: 'Ordner-ID', required: false, help: 'optional — auf einen Ordner beschränken' },
    ],
    docsUrl: 'https://developers.google.com/drive/api/reference/rest/v3',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    if (!hasGoogleAuth(ctx)) return { ok: false, message: 'Fehlende Konfiguration: Google OAuth' };
    const t0 = Date.now();
    try {
      const token = await googleAccessToken(ctx);
      const res = await ctx.fetch(`${API}/about?fields=user(emailAddress)`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const j = (await res.json()) as { user?: { emailAddress?: string } };
      return { ok: true, message: `Drive erreichbar (${j.user?.emailAddress ?? 'ok'})`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<DriveOverview> {
    const token = await googleAccessToken(ctx);
    const auth = { Authorization: `Bearer ${token}` };

    const aboutRes = await ctx.fetch(`${API}/about?fields=storageQuota`, { headers: auth });
    const quota = aboutRes.ok ? ((await aboutRes.json()) as { storageQuota?: { usage?: string; limit?: string } }).storageQuota : undefined;

    const q = ctx.config.folderId ? `'${ctx.config.folderId}' in parents and trashed=false` : 'trashed=false';
    const params = new URLSearchParams({
      pageSize: '20',
      orderBy: 'modifiedTime desc',
      q,
      fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink)',
    });
    const filesRes = await ctx.fetch(`${API}/files?${params}`, { headers: auth });
    const files = filesRes.ok ? ((await filesRes.json()) as { files?: DriveFile[] }).files ?? [] : [];

    return {
      usedBytes: quota?.usage ? Number(quota.usage) : undefined,
      limitBytes: quota?.limit ? Number(quota.limit) : undefined,
      recent: files.map((f) => ({ id: f.id, name: f.name, type: shortType(f.mimeType), modified: f.modifiedTime, link: f.webViewLink })),
    };
  },
};
