import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { fillE2, fillE3 } from '@/app/lib/vde-fill';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Generates a pre-filled VDE form (E.2 Anmeldung / E.3 Speicher). Gated by middleware.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('offerId');
  const formType = (url.searchParams.get('form') || 'e2').toLowerCase();
  if (!id) return new Response('offerId fehlt', { status: 400 });

  const [project, regs] = await Promise.all([getProjectData(id), getRegistrations()]);
  if (!project) return new Response('Projekt nicht gefunden', { status: 404 });

  const regCustomer = regs.find((r) => r.offerId === id)?.customer;
  const customer = project.customerName || (regCustomer && regCustomer !== '—' ? regCustomer : '') || project.name;

  const pdf = formType === 'e3' ? await fillE3(project, customer) : await fillE2(project, customer);
  if (!pdf) return new Response('Formularvorlage nicht erreichbar (Drive)', { status: 502 });

  const safe = customer.replace(/[^\w.-]+/g, '_');
  const label = formType === 'e3' ? 'E3-Speicher' : 'E2-Anmeldung';
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${label}-${safe}.pdf"`,
    },
  });
}
