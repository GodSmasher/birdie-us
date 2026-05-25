import { PDFDocument } from 'pdf-lib';
import { downloadDriveFile } from '@/app/lib/google-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const E2 = process.env.VDE_E2_TEMPLATE_ID || '1chcs6b0Zp6PYXJxGviY4au2zCDqegxYE';
const E3 = process.env.VDE_E3_TEMPLATE_ID || '1t_ErQV7Xj7NWmKvr2H_XTXE5gTEn4PpZ';

// TEMP diagnostic: lists the form fields of a VDE template so the exact field
// names can be mapped in vde-fill.ts. Gated by middleware. Remove once mapped.
export async function GET(req: Request) {
  const form = (new URL(req.url).searchParams.get('form') || 'e2').toLowerCase();
  const id = form === 'e3' ? E3 : E2;

  const bytes = await downloadDriveFile(id);
  if (!bytes) return new Response('Vorlage nicht erreichbar (Drive)', { status: 502 });

  const pdf = await PDFDocument.load(bytes);
  const fields = pdf.getForm().getFields().map((f) => ({
    name: f.getName(),
    type: f.constructor.name.replace(/^PDF/, ''),
  }));

  return Response.json({ form, templateId: id, count: fields.length, fields });
}
