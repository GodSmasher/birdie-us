// POST /api/emails/sync
// Triggers a Gmail → Supabase sync. Called by Vercel Cron or n8n.
// Returns: { ok, fetched, newEmails, matched, errors }

import { NextResponse } from 'next/server';
import { syncEmails } from '@/app/lib/email-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST() {
  try {
    const result = await syncEmails(30);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[emails/sync] Error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// Also support GET for easy cron triggering
export async function GET() {
  return POST();
}
