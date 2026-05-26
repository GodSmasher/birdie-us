// GET /api/emails — list stored emails (with optional filters)
// Query params: category, unreadOnly, limit
// PATCH /api/emails — mark email as read { id: string }

import { NextResponse, type NextRequest } from 'next/server';
import { getEmails, markEmailRead, getEmailStats } from '@/app/lib/email-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get('category') || undefined;
  const unreadOnly = sp.get('unreadOnly') === 'true';
  const limit = parseInt(sp.get('limit') || '50', 10);

  // If ?stats=true, return counts instead of list
  if (sp.get('stats') === 'true') {
    const stats = await getEmailStats();
    return NextResponse.json(stats);
  }

  const emails = await getEmails({ category, unreadOnly, limit });
  return NextResponse.json({ emails, count: emails.length });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const ok = await markEmailRead(id);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
