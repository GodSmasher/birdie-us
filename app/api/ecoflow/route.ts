import { NextResponse } from 'next/server';
import { isConfigured, getDeviceList, getDeviceQuota, parsePoData } from '@/app/lib/ecoflow';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET /api/ecoflow — List devices and optionally get quota for a specific SN
// Query: ?sn=SERIAL_NUMBER (optional, returns quota for that device)
export async function GET(req: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ ok: false, error: 'EcoFlow nicht konfiguriert (ECOFLOW_ACCESS_KEY fehlt)' }, { status: 503 });
  }

  const url = new URL(req.url);
  const sn = url.searchParams.get('sn');

  // Debug: log key lengths to check for invisible chars
  const ak = process.env.ECOFLOW_ACCESS_KEY ?? '';
  const sk = process.env.ECOFLOW_SECRET_KEY ?? '';
  console.log(`[ecoflow] AK len=${ak.length} first3=${ak.slice(0,3)} last3=${ak.slice(-3)} SK len=${sk.length} first3=${sk.slice(0,3)} last3=${sk.slice(-3)}`);

  try {
    if (sn) {
      // Get quota for specific device
      const quota = await getDeviceQuota(sn);
      const parsed = parsePoData(quota);
      return NextResponse.json({ ok: true, sn, parsed, quotaKeys: Object.keys(quota).length });
    }

    // List all devices
    const devices = await getDeviceList();
    return NextResponse.json({ ok: true, devices, count: devices.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[ecoflow] API error:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
