// Server-only Supabase access. Uses the service_role key (RLS-bypass) — never
// import this in a client component. Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function dbConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getDb(): SupabaseClient | null {
  if (!dbConfigured()) return null;
  if (!cached) {
    cached = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

const VOLTA_SLUG = 'volta';

/** Resolve a tenant's id by slug (defaults to the Volta pilot tenant). */
export async function tenantId(slug = VOLTA_SLUG): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('tenants').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

export interface Reading {
  connector: string;
  installationId?: string;
  metric: string;
  value: number;
  unit?: string;
  ts: string;
}

/** Upsert synced objects (offers/contacts/components/invoices/events/...). */
export async function upsertEntities(
  tenant: string,
  connector: string,
  kind: string,
  rows: { externalId: string; data: unknown }[],
): Promise<number> {
  const db = getDb();
  if (!db || rows.length === 0) return 0;
  const payload = rows.map((r) => ({
    tenant_id: tenant,
    connector,
    kind,
    external_id: r.externalId,
    data: r.data,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await db.from('entities').upsert(payload, { onConflict: 'tenant_id,connector,kind,external_id' });
  return error ? 0 : payload.length;
}

/** Read synced entities of a kind from the DB. Returns the stored `data` objects. */
export async function getEntities<T = unknown>(kind: string, slug = VOLTA_SLUG): Promise<T[]> {
  const db = getDb();
  if (!db) return [];
  const tid = await tenantId(slug);
  if (!tid) return [];
  const { data, error } = await db.from('entities').select('data').eq('tenant_id', tid).eq('kind', kind).limit(5000);
  if (error || !data) return [];
  return data.map((r) => (r as { data: T }).data);
}

/** Append time-series readings. */
export async function insertReadings(tenant: string, readings: Reading[]): Promise<number> {
  const db = getDb();
  if (!db || readings.length === 0) return 0;
  const payload = readings.map((r) => ({
    tenant_id: tenant,
    connector: r.connector,
    installation_id: r.installationId ?? null,
    metric: r.metric,
    value: r.value,
    unit: r.unit ?? null,
    ts: r.ts,
  }));
  const { error } = await db.from('readings').insert(payload);
  return error ? 0 : payload.length;
}

/** Record a sync run for observability; returns nothing on failure. */
export async function recordSyncRun(
  tenant: string,
  connector: string,
  result: { ok: boolean; itemCount: number; error?: string; startedAt: string },
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.from('sync_runs').insert({
    tenant_id: tenant,
    connector,
    started_at: result.startedAt,
    finished_at: new Date().toISOString(),
    ok: result.ok,
    item_count: result.itemCount,
    error: result.error ?? null,
  });
  await db.from('connectors').update({ last_sync_at: new Date().toISOString() }).eq('tenant_id', tenant).eq('type', connector);
}
