// GET  /api/dunning/templates         → all templates (for editor)
// GET  /api/dunning/templates?stufe=3  → single template (for n8n)
// PUT  /api/dunning/templates          → update a template (from editor)

import { NextResponse, type NextRequest } from 'next/server';
import { getDunningTemplates, getDunningTemplate, updateDunningTemplate, resetDunningTemplates } from '@/app/lib/dunning-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stufe = req.nextUrl.searchParams.get('stufe');
  if (stufe !== null) {
    const n = parseInt(stufe, 10);
    if (isNaN(n) || n < 0 || n > 5) {
      return NextResponse.json({ error: 'stufe must be 0-5' }, { status: 400 });
    }
    const t = await getDunningTemplate(n);
    if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(t);
  }
  const all = await getDunningTemplates();
  return NextResponse.json(all);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const result = await updateDunningTemplate(id, updates);
    if (!result) return NextResponse.json({ error: 'not found or no changes' }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
}

export async function DELETE() {
  const count = await resetDunningTemplates();
  return NextResponse.json({ ok: true, reset: count, message: 'Templates reset to Brevo defaults' });
}
