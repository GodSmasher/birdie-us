import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { fillE2, fillE3 } from '@/app/lib/vde-fill';
import { fillTenDoc, tenDocLabel, type TenDocType } from '@/app/lib/ten-fill';
import { fillSnDoc, snDocLabel, type SnDocType } from '@/app/lib/sachsen-netze-fill';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const TEN_FORMS = new Set<string>(['an005', 'ans', 'an002']);
const SN_FORMS = new Set<string>(['sn-eza', 'sn-speicher', 'sn-svr', 'sn-ibn']);

// Generates a pre-filled PDF form (VDE E.2/E.3 or NB-specific). Gated by middleware.
// Query params: offerId, form (e2|e3|an005|ans|an002)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('offerId');
  const formType = (url.searchParams.get('form') || 'e2').toLowerCase();
  if (!id) return new Response('offerId fehlt', { status: 400 });

  const [project, regs] = await Promise.all([getProjectData(id), getRegistrations()]);
  if (!project) return new Response('Projekt nicht gefunden', { status: 404 });

  const regCustomer = regs.find((r) => r.offerId === id)?.customer;
  const customer = project.customerName || (regCustomer && regCustomer !== '—' ? regCustomer : '') || project.name;

  let pdf: Uint8Array | null;
  let label: string;

  if (TEN_FORMS.has(formType)) {
    // NB-specific TEN form
    pdf = await fillTenDoc(formType as TenDocType, project, customer);
    label = tenDocLabel(formType as TenDocType);
  } else if (SN_FORMS.has(formType)) {
    // NB-specific Sachsen Netze form
    pdf = await fillSnDoc(formType as SnDocType, project, customer);
    label = snDocLabel(formType as SnDocType);
  } else {
    // Generic VDE E.2 / E.3
    pdf = formType === 'e3' ? await fillE3(project, customer) : await fillE2(project, customer);
    label = formType === 'e3' ? 'E3-Speicher' : 'E2-Anmeldung';
  }

  if (!pdf) return new Response('Formularvorlage nicht erreichbar', { status: 502 });

  const safe = customer.replace(/[^\w.-]+/g, '_');
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${label}-${safe}.pdf"`,
    },
  });
}
