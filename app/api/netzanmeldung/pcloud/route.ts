import { NextResponse } from 'next/server';
import { getRegistrations, recordPCloudUpload, recordSigned, setDocStatus } from '@/app/lib/netzanmeldung';
import { getProjectData } from '@/app/lib/projektdaten';
import { uploadFile, listFolder, getUnterschriebenFolder, VOLTA_FOLDERS } from '@/app/lib/pcloud';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// POST — Upload generated PDF(s) to pCloud for signing.
// Body: { offerId, forms: ['e2','e3','an005',...] }
// Generates each PDF on-the-fly and uploads to /Netzanmeldungen/Anmeldung/
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { offerId?: string; forms?: string[] };
    if (!body.offerId) return NextResponse.json({ ok: false, error: 'offerId fehlt' }, { status: 400 });

    const project = await getProjectData(body.offerId);
    if (!project) return NextResponse.json({ ok: false, error: 'Projekt nicht gefunden' }, { status: 404 });

    const regs = await getRegistrations();
    const reg = regs.find((r) => r.offerId === body.offerId);
    const customer = project.customerName || reg?.customer || project.name || 'Kunde';

    // Which forms to generate? Default to whatever the document route supports.
    const forms = body.forms ?? ['e2'];

    const uploaded: { form: string; fileid: number; filename: string }[] = [];

    for (const formType of forms) {
      // Generate PDF via the document API (reuse existing fill logic)
      const docUrl = new URL('/api/netzanmeldung/document', req.url);
      docUrl.searchParams.set('offerId', body.offerId);
      docUrl.searchParams.set('form', formType);

      const pdfRes = await fetch(docUrl.toString());
      if (!pdfRes.ok) {
        console.warn(`[pcloud] PDF generation failed for ${formType}: ${pdfRes.status}`);
        continue;
      }

      const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
      const safeName = customer.replace(/[^\w.\-äöüÄÖÜß]+/g, '_');
      const filename = `${formType.toUpperCase()}_${safeName}.pdf`;

      // Upload to /Netzanmeldungen/Anmeldung/
      const result = await uploadFile(VOLTA_FOLDERS.anmeldung, filename, pdfBuffer);
      uploaded.push({ form: formType, fileid: result.fileid, filename: result.name });

      // Record in registration
      await recordPCloudUpload(body.offerId, { fileid: result.fileid, filename: result.name });
    }

    if (uploaded.length === 0) {
      return NextResponse.json({ ok: false, error: 'Keine PDFs konnten erzeugt werden' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, uploaded });
  } catch (err) {
    console.error('[pcloud] upload error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// GET — Check for signed documents in pCloud's "Unterschrieben" folder.
// Query: ?offerId=xxx (optional — checks all if omitted)
// Scans /Netzanmeldungen/Anmeldung/Unterschrieben/ for files matching upload names.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const offerId = url.searchParams.get('offerId');

    const unterschriebenId = await getUnterschriebenFolder();
    const contents = await listFolder(unterschriebenId);

    const regs = await getRegistrations();
    const candidates = offerId ? regs.filter((r) => r.offerId === offerId) : regs.filter((r) => r.docStatus === 'hochgeladen');

    const matched: { offerId: string; customer: string; signedFiles: string[] }[] = [];

    for (const reg of candidates) {
      if (!reg.pcloudUploads || reg.pcloudUploads.length === 0) continue;

      // Check if any uploaded filename appears in the Unterschrieben folder
      const signedFiles: string[] = [];
      for (const upload of reg.pcloudUploads) {
        if (upload.signedFileid) continue; // already recorded
        // Match by filename prefix (signed files might have slightly different names)
        const baseName = upload.filename.replace('.pdf', '').toLowerCase();
        const found = contents.files.find((f) =>
          f.name.toLowerCase().includes(baseName) ||
          baseName.includes(f.name.replace('.pdf', '').toLowerCase())
        );
        if (found) {
          await recordSigned(reg.offerId, found.fileid);
          signedFiles.push(found.name);
        }
      }

      if (signedFiles.length > 0) {
        matched.push({ offerId: reg.offerId, customer: reg.customer, signedFiles });
      }
    }

    return NextResponse.json({ ok: true, checked: candidates.length, matched });
  } catch (err) {
    console.error('[pcloud] check error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
