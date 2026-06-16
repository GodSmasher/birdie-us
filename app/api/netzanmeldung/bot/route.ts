import { NextResponse } from 'next/server';
import { getBotJobsWithCredentials } from '@/app/lib/netzbot-jobs';
import { recordDraft, reportBotError, setDocStatus, seedRegistrations, addPortalUpdate } from '@/app/lib/netzanmeldung';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Schnittstelle für den netzbot-Worker. NICHT cookie-gegated (steht in den
// PUBLIC_PREFIXES der middleware) — stattdessen Bearer-Token-Auth via
// BIRDIE_BOT_TOKEN. So kann der externe Worker Jobs holen + Entwürfe melden.

function authorized(req: Request): boolean {
  const token = process.env.BIRDIE_BOT_TOKEN;
  if (!token) return false;
  return req.headers.get('authorization') === `Bearer ${token}`;
}

// GET → offene Jobs (datenvollständig, noch ohne Entwurf, Netzbetreiber erkannt).
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, message: 'unauthorized' }, { status: 401 });
  const jobs = await getBotJobsWithCredentials();
  return NextResponse.json(jobs);
}

// POST → Bot meldet Entwurf ODER Fehler zurück.
//   Entwurf: { offerId, recordDraft: 'e2'|'e3', draftRef }
//   Fehler:  { offerId, error: { step, error, screenshot? } }
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, message: 'unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    offerId?: string;
    recordDraft?: 'e2' | 'e3';
    draftRef?: string;
    error?: { step: string; error: string; screenshot?: string };
    submitted?: boolean; // Bot hat erfolgreich eingereicht
  };
  if (!body.offerId) {
    return NextResponse.json({ ok: false, message: 'offerId nötig' }, { status: 400 });
  }

  // Error report
  if (body.error) {
    const ok = await reportBotError(body.offerId, body.error);
    return NextResponse.json({ ok, backoff: true }, { status: ok ? 200 : 404 });
  }

  // Successful submission — Bot meldet Einreichung
  if (body.submitted) {
    const ok = await setDocStatus(body.offerId, 'eingereicht');
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  }

  // Portal update — Bot hat Nachricht/Status aus Portal gescrapt
  if ((body as { portalUpdate?: unknown }).portalUpdate) {
    const pu = (body as { portalUpdate: { type: string; content: string; source?: string } }).portalUpdate;
    const ok = await addPortalUpdate(body.offerId, {
      type: (pu.type as 'message' | 'status' | 'document' | 'error') ?? 'message',
      content: pu.content,
      source: pu.source,
    });
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  }

  // Draft report
  if (body.recordDraft !== 'e2' && body.recordDraft !== 'e3') {
    return NextResponse.json({ ok: false, message: 'recordDraft (e2|e3), error, oder submitted nötig' }, { status: 400 });
  }
  const ok = await recordDraft(body.offerId, body.recordDraft, { source: 'bot', draftRef: body.draftRef });
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}

// PATCH → Registrations reseed (Kundennamen + Werte aus Offers aktualisieren).
export async function PATCH(req: Request) {
  if (!authorized(req)) return NextResponse.json({ ok: false, message: 'unauthorized' }, { status: 401 });
  const n = await seedRegistrations();
  return NextResponse.json({ ok: true, updated: n });
}
