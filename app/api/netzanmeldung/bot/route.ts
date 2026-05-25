import { NextResponse } from 'next/server';
import { getBotJobs } from '@/app/lib/netzbot-jobs';
import { recordDraft } from '@/app/lib/netzanmeldung';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Schnittstelle für den netzbot-Worker. NICHT cookie-gegated (steht in den
// PUBLIC_PREFIXES der middleware) — stattdessen Bearer-Token-Auth via
// BIRDIE_BOT_TOKEN. So kann der externe Worker Jobs holen + Entwürfe melden.

function authorized(req: Request): boolean {
  const token = process.env.BIRDIE_BOT_TOKEN;
  if (!token) return false; // ohne gesetztes Token bleibt die Schnittstelle dicht
  return req.headers.get('authorization') === `Bearer ${token}`;
}

// GET → offene Jobs (datenvollständig, noch ohne Entwurf, Netzbetreiber erkannt).
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, message: 'unauthorized' }, { status: 401 });
  const jobs = await getBotJobs();
  return NextResponse.json(jobs);
}

// POST → Bot meldet einen erzeugten Portal-Entwurf zurück → Status 'bitte prüfen'.
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, message: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { offerId?: string; recordDraft?: 'e2' | 'e3'; draftRef?: string };
  if (!body.offerId || (body.recordDraft !== 'e2' && body.recordDraft !== 'e3')) {
    return NextResponse.json({ ok: false, message: 'offerId + recordDraft (e2|e3) nötig' }, { status: 400 });
  }
  const ok = await recordDraft(body.offerId, body.recordDraft, { source: 'bot', draftRef: body.draftRef });
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
