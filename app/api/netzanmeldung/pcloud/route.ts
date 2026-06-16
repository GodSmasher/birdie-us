import { NextResponse } from 'next/server';
import { getRegistrations, recordPCloudUpload, setDocStatus } from '@/app/lib/netzanmeldung';
import { getProjectData } from '@/app/lib/projektdaten';
import { uploadToDrive, ensureDriveFolder, googleConfigured, getDrive } from '@/app/lib/google-server';
import { aiFillForm } from '@/app/lib/ai-form-filler';
import type { ProjectData } from '@/app/lib/projektdaten';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// ── PDF generation (AI-first, hardcoded fallback) ──────────────────────────

async function generatePdf(
  formType: string,
  project: ProjectData,
  customer: string,
  netzbetreiber: string,
): Promise<{ pdf: Uint8Array | null; label: string }> {
  const ft = formType.startsWith('ai:') ? formType : formType.toLowerCase();

  // AI filler for ai: prefix
  if (ft.startsWith('ai:')) {
    const fs = await import('fs');
    const path = await import('path');
    const tmplPath = path.join(process.cwd(), 'nb-templates', ft.slice(3));
    if (!fs.existsSync(tmplPath)) return { pdf: null, label: ft };
    const templateBytes = fs.readFileSync(tmplPath);
    try {
      const result = await aiFillForm(templateBytes, project, customer, netzbetreiber, ft.slice(3));
      const shortLabel = ft.slice(3).split('/').pop()?.replace('.pdf', '') ?? ft;
      return { pdf: result.pdf, label: shortLabel };
    } catch {
      return { pdf: null, label: ft };
    }
  }

  // Hardcoded fillers as fallback
  if (['an005', 'ans', 'an002'].includes(ft)) {
    const { fillTenDoc } = await import('@/app/lib/ten-fill');
    return { pdf: await fillTenDoc(ft as 'an005' | 'ans' | 'an002', project, customer), label: ft };
  }
  if (['sn-eza', 'sn-speicher', 'sn-svr', 'sn-ibn'].includes(ft)) {
    const { fillSnDoc } = await import('@/app/lib/sachsen-netze-fill');
    return { pdf: await fillSnDoc(ft as 'sn-eza' | 'sn-speicher' | 'sn-svr' | 'sn-ibn', project, customer), label: ft };
  }
  if (['nm-db', 'nm-e2', 'nm-e3', 'nm-e8', 'nm-inbe'].includes(ft)) {
    const { fillNmDoc } = await import('@/app/lib/netze-magdeburg-fill');
    return { pdf: await fillNmDoc(ft as 'nm-db' | 'nm-e2' | 'nm-e3' | 'nm-e8' | 'nm-inbe', project, customer), label: ft };
  }
  if (['bw-e8', 'bw-uesb'].includes(ft)) {
    const { fillBayernwerkDoc } = await import('@/app/lib/bayernwerk-fill');
    return { pdf: await fillBayernwerkDoc(ft as 'bw-e8' | 'bw-uesb', project, customer), label: ft };
  }

  // Generic VDE fallback
  const { fillE2, fillE3 } = await import('@/app/lib/vde-fill');
  if (ft === 'e3') return { pdf: await fillE3(project, customer), label: 'E3' };
  return { pdf: await fillE2(project, customer), label: 'E2' };
}

/** Find the existing Netzanmeldungen folder on Drive (read-only search). */
async function findNetzFolder(): Promise<string | null> {
  try {
    const root = await getDrive();
    const netz = root.folders.find(f => f.name.toLowerCase().includes('netzanmeldung'));
    return netz?.id ?? null;
  } catch { return null; }
}

// ── POST — Generate + upload PDFs to Google Drive ──────────────────────────
// Body: { offerId, forms: ['an005', 'ai:Sachsen Netze/ANA/template.pdf', ...] }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { offerId?: string; forms?: string[] };
    if (!body.offerId) return NextResponse.json({ ok: false, error: 'offerId fehlt' }, { status: 400 });

    const project = await getProjectData(body.offerId);
    if (!project) return NextResponse.json({ ok: false, error: 'Projekt nicht gefunden' }, { status: 404 });

    const regs = await getRegistrations();
    const reg = regs.find((r) => r.offerId === body.offerId);
    const customer = project.customerName || reg?.customer || project.name || 'Kunde';
    const netzbetreiber = reg?.netzbetreiber ?? '';
    const safeName = customer.replace(/[^\w\-äöüÄÖÜß ]+/g, '').trim() || 'Kunde';

    const forms = body.forms ?? ['e2'];
    const generated: { form: string; filename: string; label: string }[] = [];

    // Try Google Drive upload first
    let driveFolder: string | null = null;
    if (googleConfigured()) {
      try {
        // Find existing Netzanmeldungen folder (read-only search)
        driveFolder = await findNetzFolder();
        if (driveFolder) {
          // Try to upload — will fail if scope is readonly, that's OK
          const customerFolder = await ensureDriveFolder(safeName, driveFolder);
          if (customerFolder) driveFolder = customerFolder;
        }
      } catch { driveFolder = null; }
    }

    for (const formType of forms) {
      const { pdf, label } = await generatePdf(formType, project, customer, netzbetreiber);
      if (!pdf) {
        console.warn(`[upload] PDF generation failed for ${formType}`);
        continue;
      }

      const safeLabel = label.replace(/[^\w.\-äöüÄÖÜß]+/g, '_');
      const filename = `${safeLabel}_${safeName.replace(/\s+/g, '_')}.pdf`;

      // Try Drive upload
      if (driveFolder) {
        const result = await uploadToDrive(filename, pdf, 'application/pdf', driveFolder);
        if (result) {
          generated.push({ form: formType, filename: result.name, label });
          await recordPCloudUpload(body.offerId, { fileid: 0, filename: result.name });
          continue;
        }
      }

      // Fallback: just record that we generated it (user downloads manually)
      generated.push({ form: formType, filename, label });
      await recordPCloudUpload(body.offerId, { fileid: 0, filename });
    }

    if (generated.length === 0) {
      return NextResponse.json({ ok: false, error: 'Keine PDFs konnten erzeugt werden' }, { status: 500 });
    }

    await setDocStatus(body.offerId, 'hochgeladen');

    return NextResponse.json({
      ok: true,
      generated,
      storage: driveFolder ? 'google-drive' : 'download',
      message: driveFolder
        ? `${generated.length} Dokument(e) auf Google Drive hochgeladen`
        : `${generated.length} Dokument(e) erzeugt — bitte manuell herunterladen`,
    });
  } catch (err) {
    console.error('[drive-upload] error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// ── GET — Info endpoint ────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    ok: true,
    storage: 'google-drive',
    configured: googleConfigured(),
    folder: 'Netzanmeldungen/{Kundenname}',
  });
}
