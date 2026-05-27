import { NextResponse } from 'next/server';
import { tenantId, upsertEntities, recordSyncRun } from '@/app/lib/db';
import { getReonicCatalog, getReonicOffersRaw, getReonicContactsRaw, getReonicDirectoryRaw } from '@/app/lib/reonic-server';
import { seedRegistrations, assignNetzbetreiber, assignNetzbetreiberBot } from '@/app/lib/netzanmeldung';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pull connector data into the DB. Protected by SYNC_SECRET (header x-sync-key or ?key=).
// Sync one resource per call to stay within serverless time limits:
//   /api/sync?key=...&resource=components|offers|contacts

async function run(req: Request) {
  const url = new URL(req.url);
  const key = req.headers.get('x-sync-key') || url.searchParams.get('key');
  const secret = process.env.SYNC_SECRET || process.env.BIRDIE_ACCESS_PASSWORD;
  const cronOk = !!process.env.CRON_SECRET && req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
  if (!cronOk && (!secret || key !== secret)) return NextResponse.json({ ok: false, message: 'unauthorized' }, { status: 401 });

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
  if (resource === 'directory' || resource === 'all') {
    await sync('user', async () => (await getReonicDirectoryRaw('users')).map((u) => ({ externalId: u.id, data: u.data })));
    await sync('team', async () => (await getReonicDirectoryRaw('teams')).map((t) => ({ externalId: t.id, data: t.data })));
  }

  if (resource === 'registrations' || resource === 'all') {
    try {
      const seed = await seedRegistrations();
      results.registration = seed;
    } catch (e) {
      results.registration = `error: ${(e as Error).message}`;
    }
  }

  if (resource === 'netzbetreiber') {
    try {
      results.netzbetreiber = await assignNetzbetreiber();
    } catch (e) {
      results.netzbetreiber = `error: ${(e as Error).message}`;
    }
  }

  // Bot-basierte VNB-Zuordnung über vnbdigital.de (exakt per Adresse)
  if (resource === 'vnb-bot') {
    try {
      results.vnbBot = await assignNetzbetreiberBot(url.searchParams.get('force') === '1');
    } catch (e) {
      results.vnbBot = `error: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({ ok: true, tenant: 'volta', synced: results });
}

export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}
