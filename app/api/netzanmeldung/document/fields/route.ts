// GET  /api/netzanmeldung/document/fields?offerId=xxx&form=ai:...  → extract all field values
// POST /api/netzanmeldung/document/fields  → save overrides { offerId, form, overrides: {field: value} }

import { NextResponse } from 'next/server';
import { PDFDocument, PDFTextField, PDFCheckBox } from 'pdf-lib';
import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { aiFillForm } from '@/app/lib/ai-form-filler';
import { getDb, tenantId, upsertEntities } from '@/app/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

interface FieldValue {
  name: string;
  type: 'text' | 'checkbox';
  value: string | boolean;
}

/** Extract all field values from a generated PDF. */
async function extractFieldValues(pdfBytes: Uint8Array): Promise<FieldValue[]> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields: FieldValue[] = [];

  for (const f of form.getFields()) {
    const name = f.getName();
    if (f instanceof PDFTextField) {
      fields.push({ name, type: 'text', value: f.getText() || '' });
    } else if (f instanceof PDFCheckBox) {
      fields.push({ name, type: 'checkbox', value: f.isChecked() });
    }
  }
  return fields;
}

/** Load saved overrides from DB. */
async function loadOverrides(offerId: string, form: string): Promise<Record<string, string | boolean> | null> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return null;

  const key = `${offerId}::${form}`;
  const { data } = await db
    .from('entities').select('data')
    .eq('tenant_id', tid).eq('kind', 'doc_override').eq('external_id', key)
    .single();
  if (!data) return null;
  return (data as { data: { overrides: Record<string, string | boolean> } }).data.overrides;
}

/** Save overrides to DB. */
async function saveOverrides(offerId: string, form: string, overrides: Record<string, string | boolean>): Promise<boolean> {
  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return false;

  const key = `${offerId}::${form}`;
  const n = await upsertEntities(tid, 'reonic', 'doc_override', [{
    externalId: key,
    data: { offerId, form, overrides, updatedAt: new Date().toISOString() },
  }]);
  return n > 0;
}

// GET — Generate PDF and return all field values for editing
export async function GET(req: Request) {
  const url = new URL(req.url);
  const offerId = url.searchParams.get('offerId');
  const form = url.searchParams.get('form');
  if (!offerId || !form) return NextResponse.json({ error: 'offerId + form required' }, { status: 400 });

  const [project, regs] = await Promise.all([getProjectData(offerId), getRegistrations()]);
  if (!project) return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });

  const reg = regs.find(r => r.offerId === offerId);
  const customer = project.customerName || reg?.customer || project.name || '';
  const netzbetreiber = reg?.netzbetreiber ?? '';

  // Generate the AI-filled PDF
  if (!form.startsWith('ai:')) return NextResponse.json({ error: 'Nur AI-Formulare editierbar' }, { status: 400 });

  const fs = await import('fs');
  const path = await import('path');
  const tmplPath = path.join(process.cwd(), 'nb-templates', form.slice(3));
  if (!fs.existsSync(tmplPath)) return NextResponse.json({ error: 'Template nicht gefunden' }, { status: 404 });

  const templateBytes = fs.readFileSync(tmplPath);
  const result = await aiFillForm(templateBytes, project, customer, netzbetreiber, form.slice(3));

  // Extract field values from the generated PDF
  const fields = await extractFieldValues(result.pdf);

  // Load any saved overrides
  const overrides = await loadOverrides(offerId, form);

  // Apply overrides to field values for display
  if (overrides) {
    for (const f of fields) {
      if (f.name in overrides) {
        f.value = overrides[f.name];
      }
    }
  }

  const label = form.slice(3).split('/').pop()?.replace('.pdf', '').replace(/_/g, ' ') ?? form;

  return NextResponse.json({
    ok: true,
    offerId,
    form,
    label,
    customer,
    netzbetreiber,
    fields,
    hasOverrides: !!overrides,
    fieldCount: fields.length,
    filledCount: fields.filter(f => f.type === 'text' ? f.value : f.value === true).length,
  });
}

// POST — Save Katrin's corrections
export async function POST(req: Request) {
  const body = await req.json() as { offerId?: string; form?: string; overrides?: Record<string, string | boolean> };
  if (!body.offerId || !body.form || !body.overrides) {
    return NextResponse.json({ error: 'offerId, form, overrides required' }, { status: 400 });
  }

  const ok = await saveOverrides(body.offerId, body.form, body.overrides);

  // Invalidate PDF cache so next download includes overrides
  if (ok) {
    try {
      const tid = await tenantId('volta');
      if (tid) {
        const cacheKey = `pdf::${body.offerId}::${body.form}`;
        await getDb()?.from('entities')
          .delete()
          .eq('tenant_id', tid)
          .eq('kind', 'pdf_cache')
          .eq('external_id', cacheKey);
      }
    } catch { /* best-effort cache invalidation */ }
  }

  return NextResponse.json({ ok });
}
