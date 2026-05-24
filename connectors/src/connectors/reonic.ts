import {
  type Connector,
  type ConnectorContext,
  type TestResult,
  requireConfig,
} from '../types.js';
import { componentsToDatanorm, type ReonicComponentPayload } from '../datanorm.js';
import { inferComponentType } from '../categorize.js';

// Reonic REST API v2 — CRM/ERP for PV installers (the version Volta uses).
// Auth: header `x-authorization: Basic <base64(clientId:secret)>`
// Endpoints are client-scoped: /clients/{clientId}/...
// Prod base: https://api.reonic.de/rest/v2 · Docs: https://api.reonic.de/rest/v2/docs
//
// NOTE: v2 components are READ-ONLY (no create/update). With a v2 key we can read
// the catalog and EXPORT to DATANORM. Writing DATANORM back INTO Reonic (import)
// requires the v3 API (POST /components/create), i.e. a separate v3 key.

export interface ReonicV2Component {
  id: string;
  groupId?: string;
  name?: string;
  description?: string;
  brand?: string;
  articleNr?: string;
  price?: string | number;
  purchasePrice?: string | number;
  vat?: string | number;
}

function baseUrl(ctx: ConnectorContext): string {
  return (ctx.config.baseUrl || 'https://api.reonic.de/rest/v2').replace(/\/$/, '');
}

function authValue(apiKey: string): string {
  return apiKey.startsWith('Basic ') ? apiKey : `Basic ${apiKey}`;
}

async function reonicFetch<T>(ctx: ConnectorContext, path: string): Promise<T> {
  const res = await ctx.fetch(`${baseUrl(ctx)}${path}`, {
    headers: { 'x-authorization': authValue(ctx.config.apiKey), Accept: 'application/json' },
  });
  if (res.status === 401 || res.status === 403) throw new Error(`Reonic: Key abgelehnt (${res.status})`);
  if (!res.ok) throw new Error(`Reonic HTTP ${res.status}`);
  return (await res.json()) as T;
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
}

export async function reonicListComponents(ctx: ConnectorContext): Promise<ReonicV2Component[]> {
  requireConfig(ctx, ['apiKey', 'clientId']);
  const data = await reonicFetch<ReonicV2Component[]>(ctx, `/clients/${ctx.config.clientId}/components`);
  return Array.isArray(data) ? data : [];
}

/** Map a v2 component to the shared DATANORM-export payload. */
export function v2ToPayload(c: ReonicV2Component): ReonicComponentPayload {
  return {
    componentType: inferComponentType(c.name, c.description, c.brand),
    name: c.name ?? c.articleNr ?? c.id,
    description: c.description,
    articleNumber: c.articleNr ?? c.id,
    salesPrice: num(c.price),
    purchasePrice: c.purchasePrice != null ? num(c.purchasePrice) : undefined,
    vatRate: c.vat != null ? num(c.vat) : undefined,
    quantityUnit: 'Stck',
    brand: c.brand,
  };
}

/** Export the Reonic catalog to a DATANORM 4.0 file (Reonic → ERP/Großhandel). */
export async function reonicExportDatanorm(ctx: ConnectorContext): Promise<{ count: number; datanorm: string }> {
  const components = await reonicListComponents(ctx);
  const payloads = components.map(v2ToPayload);
  return { count: payloads.length, datanorm: componentsToDatanorm(payloads) };
}

export const reonic: Connector<ReonicV2Component[]> = {
  manifest: {
    id: 'reonic',
    name: 'Reonic CRM',
    vendor: 'Reonic GmbH',
    category: 'crm',
    regions: ['DE', 'AT', 'CH'],
    authType: 'token',
    protocol: 'REST v2',
    capabilities: ['read'],
    config: [
      { key: 'apiKey', label: 'API Key', required: true, secret: true, help: 'Basic-Token (base64) · Header x-authorization' },
      { key: 'clientId', label: 'Client ID', required: true, help: 'Reonic Mandanten-ID' },
      { key: 'baseUrl', label: 'Base URL', required: false, default: 'https://api.reonic.de/rest/v2' },
    ],
    docsUrl: 'https://api.reonic.de/rest/v2/docs',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['apiKey', 'clientId']);
    const t0 = Date.now();
    try {
      const components = await reonicListComponents(ctx);
      return { ok: true, message: `${components.length} Komponenten im Katalog`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<ReonicV2Component[]> {
    return reonicListComponents(ctx);
  },
};
