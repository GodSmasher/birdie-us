import { type Connector, type ConnectorContext, type TestResult, requireConfig } from '../types.js';

// WhatsApp Business — Meta Cloud API (Graph). Auth: Bearer system-user token.
// Inbound messages arrive via webhook (not pollable); pull returns phone status
// + approved message templates. Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

const GRAPH = 'https://graph.facebook.com/v21.0';

interface Template { name: string; status: string; category: string; language: string }

export interface WhatsAppInfo {
  phone?: { displayPhoneNumber?: string; verifiedName?: string; qualityRating?: string };
  templates: Template[];
}

export const whatsapp: Connector<WhatsAppInfo> = {
  manifest: {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    vendor: 'Meta',
    category: 'comms',
    regions: ['DE', 'AT', 'CH'],
    authType: 'token',
    protocol: 'Cloud API + Webhook',
    capabilities: ['read', 'write', 'webhook'],
    config: [
      { key: 'accessToken', label: 'Access Token', required: true, secret: true, help: 'System-User Token (permanent)' },
      { key: 'phoneNumberId', label: 'Phone Number ID', required: true },
      { key: 'wabaId', label: 'WhatsApp Business Account ID', required: false, help: 'für Templates' },
    ],
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['accessToken', 'phoneNumberId']);
    const t0 = Date.now();
    try {
      const res = await ctx.fetch(`${GRAPH}/${ctx.config.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`, {
        headers: { Authorization: `Bearer ${ctx.config.accessToken}` },
      });
      if (res.status === 401) return { ok: false, message: 'Token ungültig (401)' };
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const p = (await res.json()) as { verified_name?: string; display_phone_number?: string };
      return { ok: true, message: `${p.verified_name ?? ''} · ${p.display_phone_number ?? 'verbunden'}`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<WhatsAppInfo> {
    requireConfig(ctx, ['accessToken', 'phoneNumberId']);
    const auth = { Authorization: `Bearer ${ctx.config.accessToken}` };

    const phoneRes = await ctx.fetch(`${GRAPH}/${ctx.config.phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`, { headers: auth });
    const phoneRaw = phoneRes.ok ? ((await phoneRes.json()) as { display_phone_number?: string; verified_name?: string; quality_rating?: string }) : {};

    let templates: Template[] = [];
    if (ctx.config.wabaId) {
      const tRes = await ctx.fetch(`${GRAPH}/${ctx.config.wabaId}/message_templates?limit=20`, { headers: auth });
      if (tRes.ok) {
        const json = (await tRes.json()) as { data?: Template[] };
        templates = json.data ?? [];
      }
    }

    return {
      phone: { displayPhoneNumber: phoneRaw.display_phone_number, verifiedName: phoneRaw.verified_name, qualityRating: phoneRaw.quality_rating },
      templates,
    };
  },
};
