import { NextResponse } from 'next/server';
import {
  setRegistrationStatus,
  setDocStatus,
  setNetzbetreiber,
  recordDraft,
  STAGE_IDS,
  DOC_STATUS_IDS,
  type StageId,
  type DocStatus,
} from '@/app/lib/netzanmeldung';

export const dynamic = 'force-dynamic';

// Gated by middleware (cookie) — only logged-in users can change a registration.
// Handles three actions: grid `status`, review `docStatus`, or `recordDraft`.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    offerId?: string;
    status?: string;
    docStatus?: string;
    recordDraft?: 'e2' | 'e3';
    netzbetreiber?: string;
  };
  if (!body.offerId) {
    return NextResponse.json({ ok: false, message: 'offerId nötig' }, { status: 400 });
  }

  if (body.netzbetreiber && typeof body.netzbetreiber === 'string') {
    const ok = await setNetzbetreiber(body.offerId, body.netzbetreiber.trim());
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  }
  if (body.recordDraft === 'e2' || body.recordDraft === 'e3') {
    const ok = await recordDraft(body.offerId, body.recordDraft);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  }
  if (body.docStatus && DOC_STATUS_IDS.includes(body.docStatus as DocStatus)) {
    const ok = await setDocStatus(body.offerId, body.docStatus as DocStatus);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  }
  if (body.status && STAGE_IDS.includes(body.status as StageId)) {
    const ok = await setRegistrationStatus(body.offerId, body.status as StageId);
    return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
  }
  return NextResponse.json({ ok: false, message: 'kein gültiger Statuswert' }, { status: 400 });
}
