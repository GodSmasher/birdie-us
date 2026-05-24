import { NextResponse } from 'next/server';
import { setRegistrationStatus, STAGE_IDS, type StageId } from '@/app/lib/netzanmeldung';

export const dynamic = 'force-dynamic';

// Gated by middleware (cookie) — only logged-in users can advance a registration.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { offerId?: string; status?: string };
  if (!body.offerId || !body.status || !STAGE_IDS.includes(body.status as StageId)) {
    return NextResponse.json({ ok: false, message: 'offerId + gültiger status nötig' }, { status: 400 });
  }
  const ok = await setRegistrationStatus(body.offerId, body.status as StageId);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
