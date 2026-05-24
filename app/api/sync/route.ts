import { NextResponse } from 'next/server';
import { tenantId, upsertEntities, recordSyncRun } from '@/app/lib/db';
import { getReonicCatalog, getReonicOffersRaw, getReonicContactsRaw } from '@/app/lib/reonic-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pull connector data into the DB. Protected by SYNC_SECRET (header x-sync-key or ?key=).
// Sync one resource per call to stay within serverless time limits:
//   /api/sync?key=...&resource=components|offers|contacts

async function run(req: Request) {
  const url = new URL(req.url);
  const key = req.headers.get('x-sync-key') || url.searchParams.get('key');
  const secret = process.env.SYNC_SECRET || process.env.BIRDIE_ACCESS_PASSWORD;
  if (!secret || key !== secret) return NextResponse.json({ ok: false, message: 'unauthorized' }, { status: 401 });

  const tenant = await tenantId('volta');
  if (!tenant) return NextResponse.json({ ok: false, message: 'DB nicht erreichbar oder Migration fehlt' }, { status: 503 });

  const resource = (url.searchParams.get('resource') || 'all').toLowerCase();
  const results: Record<string, unknown> = {};

  async function sync(kind: string, fetchRows: () => Promise<{ externalId: string; data: unknown }[]>) {
    const startedAt = new Date().toISOString();
    try {
      const rows = await fetchRows();
      const n = await upsertEntities(tenant!, 'reonic', kind, rows);
      await recordSyncRun(tenant!, 'reonic', { ok: true, itemCount: n, startedAt });
      results[kind] = n;
    } catch (e) {
      await recordSyncRun(tenant!, 'reonic', { ok: false, itemCount: 0, error: (e as Error).message, startedAt });
      results[kind] = `error: ${(e as Error).message}`;
    }
  }

  if (resource === 'components' || resource === 'all')
    await sync('component', async () => (await getReonicCatalog()).components.map((c) => ({ externalId: c.id, data: c })));
  if (resource === 'offers' || resource === 'all')
    await sync('offer', async () => (await getReonicOffersRaw()).map((o) => ({ externalId: o.id, data: o.data })));
  if (resource === 'contacts' || resource === 'all')
    await sync('contact', async () => (await getReonicContactsRaw()).map((c) => ({ externalId: c.id, data: c.data })));

  return NextResponse.json({ ok: true, tenant: 'volta', synced: results });
}

export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}
