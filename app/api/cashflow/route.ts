import { NextRequest, NextResponse } from 'next/server';
import { upsertProject } from '@/app/lib/cashflow-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await upsertProject(body);
    if (!result) return NextResponse.json({ error: 'DB error' }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
