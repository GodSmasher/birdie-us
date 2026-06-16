// GET  /api/netzanmeldung/emails  — list netz emails
// POST /api/netzanmeldung/emails  — ingest email from n8n webhook
//
// n8n sends: { mailbox, messageId, from, fromName, to, subject, body, date }
// Response:  { stored, category, autoReply, autoReplyText, matched_customer }

import { NextResponse, type NextRequest } from 'next/server';
import { ingestEmail, getNetzEmails, getNetzEmailStats, markNetzEmailRead, AUTO_REPLY_TEXT, AUTO_REPLY_HTML } from '@/app/lib/netz-email';
import type { IncomingEmail, NetzEmailCategory } from '@/app/lib/netz-email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  if (sp.get('stats') === 'true') {
    return NextResponse.json(await getNetzEmailStats());
  }

  const emails = await getNetzEmails({
    registrationId: sp.get('registrationId') || undefined,
    category: (sp.get('category') as NetzEmailCategory) || undefined,
    unreadOnly: sp.get('unreadOnly') === 'true',
    limit: parseInt(sp.get('limit') || '50', 10),
  });

  return NextResponse.json({ emails, count: emails.length });
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as IncomingEmail;

    if (!payload.messageId || !payload.from || !payload.mailbox) {
      return NextResponse.json({ error: 'Missing required fields: mailbox, messageId, from' }, { status: 400 });
    }

    const result = await ingestEmail(payload);

    return NextResponse.json({
      ...result,
      // If autoReply is true, include the reply text so n8n can send it
      autoReplyText: result.autoReply ? AUTO_REPLY_TEXT : undefined,
      autoReplyHtml: result.autoReply ? AUTO_REPLY_HTML : undefined,
      autoReplySubject: result.autoReply ? `Re: ${payload.subject}` : undefined,
      autoReplyFrom: payload.mailbox,
      autoReplyTo: payload.from,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH — mark email as read / update status
export async function PATCH(req: NextRequest) {
  try {
    const { id, is_read } = (await req.json()) as { id: string; is_read?: boolean };
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const ok = await markNetzEmailRead(id, is_read ?? true);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
