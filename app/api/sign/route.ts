// GET  /api/sign — List projects waiting for electrician signature (status=freigegeben)
// POST /api/sign — Upload signed PDF for a project

import { NextResponse } from 'next/server';
import { getRegistrations, setDocStatus } from '@/app/lib/netzanmeldung';
import { getProjectData } from '@/app/lib/projektdaten';
import { getDb, tenantId, upsertEntities } from '@/app/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// GET — List all projects with status "freigegeben" (waiting for signature)
export async function GET() {
  const regs = await getRegistrations();
  const waiting = regs.filter(r => r.docStatus === 'freigegeben');

  const projects = await Promise.all(waiting.map(async (reg) => {
    const project = await getProjectData(reg.offerId).catch(() => null);
    const docs = (reg.documents ?? []).filter(d => d.form.startsWith('ai:'));

    return {
      offerId: reg.offerId,
      customer: reg.customer ?? project?.customerName ?? '—',
      netzbetreiber: reg.netzbetreiber ?? '—',
      kwp: project?.kwp ? String(project.kwp) : '—',
      address: project?.address ? `${project.address.line}, ${project.address.zip} ${project.address.city}` : '—',
      documents: docs.map(d => ({
        form: d.form,
        label: d.form.startsWith('ai:')
          ? d.form.slice(3).split('/').pop()?.replace('.pdf', '').replace(/_/g, ' ') ?? d.form
          : d.form,
        downloadUrl: `/api/netzanmeldung/document?offerId=${reg.offerId}&form=${encodeURIComponent(d.form)}&download=1`,
      })),
      signedCount: 0, // TODO: count uploaded signed docs
    };
  }));

  return NextResponse.json({ ok: true, projects, count: projects.length });
}

// POST — Upload signed PDF
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const offerId = formData.get('offerId') as string | null;

    if (!file || !offerId) {
      return NextResponse.json({ ok: false, error: 'file + offerId required' }, { status: 400 });
    }

    // Store the signed PDF in DB
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = Buffer.from(bytes).toString('base64');

    const db = getDb();
    const tid = await tenantId('volta');
    if (!db || !tid) {
      return NextResponse.json({ ok: false, error: 'DB nicht verfügbar' }, { status: 500 });
    }

    const key = `signed::${offerId}::${file.name}`;
    await upsertEntities(tid, 'reonic', 'signed_doc', [{
      externalId: key,
      data: {
        offerId,
        filename: file.name,
        size: bytes.length,
        base64,
        uploadedAt: new Date().toISOString(),
      },
    }]);

    // Update status to "unterschrieben"
    await setDocStatus(offerId, 'unterschrieben');

    return NextResponse.json({ ok: true, filename: file.name, size: bytes.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
