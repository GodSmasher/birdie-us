import { NextRequest, NextResponse } from 'next/server';
import { upsertEntry, deleteEntry } from '@/app/lib/cashflow-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await upsertEntry(body);
    if (!result) return NextResponse.json({ error: 'DB error' }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ok = await deleteEntry(id);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}
