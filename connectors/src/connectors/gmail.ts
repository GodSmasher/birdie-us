import { type Connector, type ConnectorContext, type TestResult } from '../types.js';
import { googleConfig, googleAccessToken, hasGoogleAuth } from '../google.js';

// Gmail API v1. OAuth2 Bearer. Scope: gmail.readonly (or more for send).
// Docs: https://developers.google.com/gmail/api/reference/rest

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface GProfile { emailAddress?: string; messagesTotal?: number; threadsTotal?: number }
interface GMessageMeta { id: string; payload?: { headers?: { name: string; value: string }[] }; snippet?: string }

export interface MailSummary {
  account?: string;
  messagesTotal?: number;
  unread: number;
  recent: { id: string; from: string; subject: string; snippet: string }[];
}

function header(m: GMessageMeta, name: string): string {
  return m.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

export const gmail: Connector<MailSummary> = {
  manifest: {
    id: 'gmail',
    name: 'Gmail',
    vendor: 'Google',
    category: 'comms',
    regions: ['DE', 'AT', 'CH'],
    authType: 'oauth2',
    protocol: 'Gmail API v1',
    capabilities: ['read', 'write'],
    config: googleConfig,
    docsUrl: 'https://developers.google.com/gmail/api/reference/rest',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    if (!hasGoogleAuth(ctx)) return { ok: false, message: 'Fehlende Konfiguration: Google OAuth' };
    const t0 = Date.now();
    try {
      const token = await googleAccessToken(ctx);
      const res = await ctx.fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const p = (await res.json()) as GProfile;
      return { ok: true, message: `${p.emailAddress} · ${p.messagesTotal ?? 0} Mails`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<MailSummary> {
    const token = await googleAccessToken(ctx);
    const auth = { Authorization: `Bearer ${token}` };

    const profileRes = await ctx.fetch(`${API}/profile`, { headers: auth });
    const profile = profileRes.ok ? ((await profileRes.json()) as GProfile) : {};

    const unreadRes = await ctx.fetch(`${API}/messages?q=is:unread&maxResults=1`, { headers: auth });
    const unread = unreadRes.ok ? ((await unreadRes.json()) as { resultSizeEstimate?: number }).resultSizeEstimate ?? 0 : 0;

    const listRes = await ctx.fetch(`${API}/messages?labelIds=INBOX&maxResults=10`, { headers: auth });
    const list = listRes.ok ? ((await listRes.json()) as { messages?: { id: string }[] }).messages ?? [] : [];

    const recent = await Promise.all(
      list.slice(0, 8).map(async (m) => {
        const r = await ctx.fetch(`${API}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`, { headers: auth });
        if (!r.ok) return { id: m.id, from: '', subject: '', snippet: '' };
        const meta = (await r.json()) as GMessageMeta;
        return { id: m.id, from: header(meta, 'From'), subject: header(meta, 'Subject'), snippet: meta.snippet ?? '' };
      }),
    );

    return { account: profile.emailAddress, messagesTotal: profile.messagesTotal, unread, recent };
  },
};
