import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { fillE2 } from '@/app/lib/vde-fill';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Generates the pre-filled VDE E.2 PDF for a registration. Gated by middleware.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('offerId');
  if (!id) return new Response('offerId fehlt', { status: 400 });

  const [project, regs] = await Promise.all([getProjectData(id), getRegistrations()]);
  if (!project) return new Response('Projekt nicht gefunden', { status: 404 });

  const customer = regs.find((r) => r.offerId === id)?.customer || project.name;
  const pdf = await fillE2(project, customer);
  if (!pdf) return new Response('Formularvorlage nicht erreichbar (Drive)', { status: 502 });

  const safe = customer.replace(/[^\w.-]+/g, '_');
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="E2-Anmeldung-${safe}.pdf"`,
    },
  });
}
