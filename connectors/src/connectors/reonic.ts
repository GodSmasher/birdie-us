import {
  type Connector,
  type ConnectorContext,
  type TestResult,
  requireConfig,
} from '../types.js';
import { parseDatanorm, articlesToComponents, type ReonicComponentPayload } from '../datanorm.js';

// Reonic REST API v3 — CRM/ERP for PV installers.
// Auth: API key in X-Authorization header.
// Prod base: https://api.reonic.de/rest/v3 · Staging: https://api.reonic.info/rest/v3
// Docs: https://api.reonic.de/rest/v3/docs

export interface ReonicComponent {
  id: string;
  componentType: string;
  name: string;
  brand?: string;
  articleNumber?: string;
  gtin?: string;
  salesPrice?: number;
  purchasePrice?: number;
  vatRate?: number;
  quantityUnit?: string;
}

function baseUrl(ctx: ConnectorContext): string {
  return (ctx.config.baseUrl || 'https://api.reonic.de/rest/v3').replace(/\/$/, '');
}

async function reonicFetch<T>(ctx: ConnectorContext, path: string, init: RequestInit = {}): Promise<T> {
  const res = await ctx.fetch(`${baseUrl(ctx)}${path}`, {
    ...init,
    headers: {
      'X-Authorization': ctx.config.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401 || res.status === 403) throw new Error(`Reonic: API-Key abgelehnt (${res.status})`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(`Reonic HTTP ${res.status}${body.message ? ` · ${body.message}` : ''}`);
  }
  return (await res.json()) as T;
}

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    for (const key of ['components', 'data', 'items', 'results']) {
      const v = (data as Record<string, unknown>)[key];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

export async function reonicListComponents(ctx: ConnectorContext): Promise<ReonicComponent[]> {
  const data = await reonicFetch<unknown>(ctx, '/components');
  return asList<ReonicComponent>(data);
}

export async function reonicCreateComponent(ctx: ConnectorContext, payload: ReonicComponentPayload): Promise<ReonicComponent> {
  return reonicFetch<ReonicComponent>(ctx, '/components/create', { method: 'POST', body: JSON.stringify(payload) });
}

export async function reonicUpdateComponent(ctx: ConnectorContext, id: string, payload: Partial<ReonicComponentPayload>): Promise<ReonicComponent> {
  return reonicFetch<ReonicComponent>(ctx, `/components/${id}/update`, { method: 'POST', body: JSON.stringify(payload) });
}

/**
 * DATANORM → Reonic sync. Parses a DATANORM file and upserts components,
 * matching existing ones by articleNumber. `dryRun` returns the plan without writing.
 */
export async function reonicSyncDatanorm(
  ctx: ConnectorContext,
  datanormText: string,
  opts: { componentType?: string; brand?: string; dryRun?: boolean } = {},
): Promise<{ created: number; updated: number; planned: ReonicComponentPayload[] }> {
  const articles = parseDatanorm(datanormText);
  const payloads = articlesToComponents(articles, { componentType: opts.componentType, brand: opts.brand });

  if (opts.dryRun) {
    return { created: 0, updated: 0, planned: payloads };
  }

  const existing = await reonicListComponents(ctx);
  const byArticle = new Map(existing.filter((c) => c.articleNumber).map((c) => [c.articleNumber as string, c]));

  let created = 0;
  let updated = 0;
  for (const p of payloads) {
    const match = p.articleNumber ? byArticle.get(p.articleNumber) : undefined;
    if (match) {
      await reonicUpdateComponent(ctx, match.id, p);
      updated++;
    } else {
      await reonicCreateComponent(ctx, p);
      created++;
    }
  }
  return { created, updated, planned: payloads };
}

export const reonic: Connector<ReonicComponent[]> = {
  manifest: {
    id: 'reonic',
    name: 'Reonic CRM',
    vendor: 'Reonic GmbH',
    category: 'crm',
    regions: ['DE', 'AT', 'CH'],
    authType: 'token',
    protocol: 'REST v3',
    capabilities: ['read', 'write'],
    config: [
      { key: 'apiKey', label: 'API Key', required: true, secret: true, help: 'X-Authorization · Reonic Einstellungen → API' },
      { key: 'baseUrl', label: 'Base URL', required: false, default: 'https://api.reonic.de/rest/v3', help: 'Prod .de · Staging .info' },
    ],
    docsUrl: 'https://api.reonic.de/rest/v3/docs',
    status: 'beta',
  },

  async testConnection(ctx: ConnectorContext): Promise<TestResult> {
    requireConfig(ctx, ['apiKey']);
    const t0 = Date.now();
    try {
      const components = await reonicListComponents(ctx);
      return { ok: true, message: `${components.length} Komponenten erreichbar`, latencyMs: Date.now() - t0 };
    } catch (e) {
      return { ok: false, message: (e as Error).message };
    }
  },

  async pull(ctx: ConnectorContext): Promise<ReonicComponent[]> {
    requireConfig(ctx, ['apiKey']);
    return reonicListComponents(ctx);
  },
};
