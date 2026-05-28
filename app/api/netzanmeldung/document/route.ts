import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { fillE2, fillE3 } from '@/app/lib/vde-fill';
import { fillTenDoc, tenDocLabel, type TenDocType } from '@/app/lib/ten-fill';
import { fillSnDoc, snDocLabel, type SnDocType } from '@/app/lib/sachsen-netze-fill';
import { fillNmDoc, nmDocLabel, type NmDocType } from '@/app/lib/netze-magdeburg-fill';
import { fillWeDoc, weDocLabel, type WeDocType } from '@/app/lib/werra-energie-fill';
import { fillSwiDoc, swiDocLabel, type SwiDocType } from '@/app/lib/sw-ilmenau-fill';
import { fillSwwDoc, swwDocLabel, type SwwDocType } from '@/app/lib/sww-wunsiedel-fill';
import type { ProjectData } from '@/app/lib/projektdaten';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Flat lookup: form ID → { fill, label }
const FORM_MAP = new Map<string, { fill: (form: string, p: ProjectData, c: string) => Promise<Uint8Array | null>; label: (form: string) => string }>();

// TEN
for (const f of ['an005', 'ans', 'an002'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillTenDoc(_f as TenDocType, p, c), label: (f2) => tenDocLabel(f2 as TenDocType) });
// Sachsen Netze
for (const f of ['sn-eza', 'sn-speicher', 'sn-svr', 'sn-ibn'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSnDoc(_f as SnDocType, p, c), label: (f2) => snDocLabel(f2 as SnDocType) });
// Netze Magdeburg
for (const f of ['nm-db', 'nm-e2', 'nm-e3', 'nm-e8', 'nm-inbe'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillNmDoc(_f as NmDocType, p, c), label: (f2) => nmDocLabel(f2 as NmDocType) });
// Werra Energie
for (const f of ['we-e2', 'we-e3', 'we-e8'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillWeDoc(_f as WeDocType, p, c), label: (f2) => weDocLabel(f2 as WeDocType) });
// SW Ilmenau
for (const f of ['swi-f2'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSwiDoc(_f as SwiDocType, p, c), label: (f2) => swiDocLabel(f2 as SwiDocType) });
// SWW Wunsiedel
for (const f of ['sww-ibn'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSwwDoc(_f as SwwDocType, p, c), label: (f2) => swwDocLabel(f2 as SwwDocType) });

// Generates a pre-filled PDF form (VDE E.2/E.3 or NB-specific). Gated by middleware.
// Query params: offerId, form
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

  const nbHandler = FORM_MAP.get(formType);
  if (nbHandler) {
    pdf = await nbHandler.fill(formType, project, customer);
    label = nbHandler.label(formType);
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
