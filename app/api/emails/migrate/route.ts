// One-time migration: add finance columns to emails table.
// Tests if columns exist, and if not, uses the Supabase Management API.
// DELETE THIS FILE after running once.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: 'no db config' }, { status: 500 });

  const db = createClient(url, key, { auth: { persistSession: false } });

  // Test if columns already exist by trying a select
  const { error: testError } = await db
    .from('emails')
    .select('extracted_amount, direction, extracted_supplier')
    .limit(1);

  if (!testError) {
    return NextResponse.json({ ok: true, message: 'Columns already exist' });
  }

  // Columns don't exist — return the SQL the user needs to run
  const sql = `
ALTER TABLE emails ADD COLUMN IF NOT EXISTS extracted_amount numeric;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS direction text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS extracted_supplier text;
CREATE INDEX IF NOT EXISTS idx_emails_finance ON emails (tenant_id, direction) WHERE extracted_amount IS NOT NULL;
  `.trim();

  return NextResponse.json({
    ok: false,
    message: 'Columns missing — run this SQL in Supabase SQL Editor',
    sql,
  });
}
