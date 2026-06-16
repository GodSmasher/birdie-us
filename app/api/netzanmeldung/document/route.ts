import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { fillE2, fillE3 } from '@/app/lib/vde-fill';
import { fillTenDoc, tenDocLabel, type TenDocType } from '@/app/lib/ten-fill';
import { fillSnDoc, snDocLabel, type SnDocType } from '@/app/lib/sachsen-netze-fill';
import { fillNmDoc, nmDocLabel, type NmDocType } from '@/app/lib/netze-magdeburg-fill';
import { fillWeDoc, weDocLabel, type WeDocType } from '@/app/lib/werra-energie-fill';
import { fillSwiDoc, swiDocLabel, type SwiDocType } from '@/app/lib/sw-ilmenau-fill';
import { fillSwwDoc, swwDocLabel, type SwwDocType } from '@/app/lib/sww-wunsiedel-fill';
import { fillSwqDoc, swqDocLabel, type SwqDocType } from '@/app/lib/sw-quedlinburg-fill';
import { fillSwmDoc, swmDocLabel, type SwmDocType } from '@/app/lib/sw-merseburg-fill';
import { fillSweDoc, sweDocLabel, type SweDocType } from '@/app/lib/sw-weissenfels-fill';
import { fillSwskDoc, swskDocLabel, type SwskDocType } from '@/app/lib/sw-schkeuditz-fill';
import { fillSwmbDoc, swmbDocLabel, type SwmbDocType } from '@/app/lib/sw-muenchberg-fill';
import { fillGreDoc, greDocLabel, type GreDocType } from '@/app/lib/greizer-fill';
import { fillZwDoc, zwDocLabel, type ZwDocType } from '@/app/lib/zwickau-fill';
import { fillRedDoc, redDocLabel, type RedDocType } from '@/app/lib/redinet-fill';
import { fillSwvDoc, swvDocLabel, type SwvDocType } from '@/app/lib/sw-velten-fill';
import { fillEwpDoc, ewpDocLabel, type EwpDocType } from '@/app/lib/ewp-potsdam-fill';
import { fillSeiDoc, seiDocLabel, type SeiDocType } from '@/app/lib/sw-eilenburg-fill';
import { fillBayernwerkDoc, bayernwerkDocLabel, type BayernwerkDocType } from '@/app/lib/bayernwerk-fill';
import { aiFillForm } from '@/app/lib/ai-form-filler';
import type { ProjectData } from '@/app/lib/projektdaten';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Auto-enrichment from docs can be slow on first call

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
// SW Quedlinburg
for (const f of ['swq-pv'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSwqDoc(_f as SwqDocType, p, c), label: (f2) => swqDocLabel(f2 as SwqDocType) });
// SW Merseburg
for (const f of ['swm-ana', 'swm-db', 'swm-iba'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSwmDoc(_f as SwmDocType, p, c), label: (f2) => swmDocLabel(f2 as SwmDocType) });
// SW Weißenfels
for (const f of ['swe-ana', 'swe-db'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSweDoc(_f as SweDocType, p, c), label: (f2) => sweDocLabel(f2 as SweDocType) });
// SW Schkeuditz
for (const f of ['swsk-speicher'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSwskDoc(_f as SwskDocType, p, c), label: (f2) => swskDocLabel(f2 as SwskDocType) });
// SW Münchberg
for (const f of ['swmb-pv', 'swmb-ibn'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSwmbDoc(_f as SwmbDocType, p, c), label: (f2) => swmbDocLabel(f2 as SwmbDocType) });
// Greizer Energienetze
for (const f of ['gre-ana', 'gre-wp', 'gre-14a'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillGreDoc(_f as GreDocType, p, c), label: (f2) => greDocLabel(f2 as GreDocType) });
// Zwickau
for (const f of ['zw-wp'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillZwDoc(_f as ZwDocType, p, c), label: (f2) => zwDocLabel(f2 as ZwDocType) });
// Redinet Burgenland
for (const f of ['red-wp'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillRedDoc(_f as RedDocType, p, c), label: (f2) => redDocLabel(f2 as RedDocType) });
// SW Velten
for (const f of ['swv-fm'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSwvDoc(_f as SwvDocType, p, c), label: (f2) => swvDocLabel(f2 as SwvDocType) });
// EWP Potsdam
for (const f of ['ewp-pv'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillEwpDoc(_f as EwpDocType, p, c), label: (f2) => ewpDocLabel(f2 as EwpDocType) });
// SW Eilenburg
for (const f of ['sei-ana', 'sei-wp'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillSeiDoc(_f as SeiDocType, p, c), label: (f2) => seiDocLabel(f2 as SeiDocType) });
// Bayernwerk
for (const f of ['bw-e8', 'bw-uesb'])
  FORM_MAP.set(f, { fill: (_f, p, c) => fillBayernwerkDoc(_f as BayernwerkDocType, p, c), label: (f2) => bayernwerkDocLabel(f2) });

// ── PDF Cache (prevents repeated AI calls) ──────────────────────────────────
async function loadCachedPdf(offerId: string, form: string): Promise<Buffer | null> {
  try {
    const { getDb, tenantId } = await import('@/app/lib/db');
    const db = getDb();
    const tid = await tenantId('volta');
    if (!db || !tid) return null;
    const key = `pdf::${offerId}::${form}`;
    const { data } = await db.from('entities').select('data')
      .eq('tenant_id', tid).eq('kind', 'pdf_cache').eq('external_id', key).single();
    if (!data) return null;
    const cached = (data as { data: { base64: string; cachedAt: string } }).data;
    // Cache valid for 24h
    if (Date.now() - Date.parse(cached.cachedAt) > 24 * 60 * 60 * 1000) return null;
    return Buffer.from(cached.base64, 'base64');
  } catch { return null; }
}

async function saveCachedPdf(offerId: string, form: string, pdf: Uint8Array): Promise<void> {
  try {
    const { getDb, tenantId, upsertEntities } = await import('@/app/lib/db');
    const db = getDb();
    const tid = await tenantId('volta');
    if (!db || !tid) return;
    const key = `pdf::${offerId}::${form}`;
    await upsertEntities(tid, 'reonic', 'pdf_cache', [{
      externalId: key,
      data: { base64: Buffer.from(pdf).toString('base64'), cachedAt: new Date().toISOString() },
    }]);
  } catch { /* best-effort */ }
}

// Generates a pre-filled PDF form. Gated by middleware.
// Query params: offerId, form, regen=1 (force regeneration)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('offerId');
  const formRaw = url.searchParams.get('form') || 'e2';
  const formType = formRaw.startsWith('ai:') ? formRaw : formRaw.toLowerCase();
  const forceRegen = url.searchParams.get('regen') === '1';
  if (!id) return new Response('offerId fehlt', { status: 400 });

  // Check cache first (skip AI call if we have a recent version)
  if (!forceRegen && formType.startsWith('ai:')) {
    const cached = await loadCachedPdf(id, formType);
    if (cached) {
      const label = formType.slice(3).split('/').pop()?.replace('.pdf', '') ?? formType;
      const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline';
      return new Response(new Uint8Array(cached), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `${disposition}; filename="${label}.pdf"`,
          'X-Cache': 'hit',
        },
      });
    }
  }

  const [project, regs] = await Promise.all([getProjectData(id), getRegistrations()]);
  if (!project) return new Response('Projekt nicht gefunden', { status: 404 });

  const regCustomer = regs.find((r) => r.offerId === id)?.customer;
  const customer = project.customerName || (regCustomer && regCustomer !== '—' ? regCustomer : '') || project.name;

  let pdf: Uint8Array | null;
  let label: string;

  const nbHandler = FORM_MAP.get(formType);
  const reg = regs.find((r) => r.offerId === id);
  const netzbetreiber = reg?.netzbetreiber ?? '—';

  if (nbHandler) {
    pdf = await nbHandler.fill(formType, project, customer);
    label = nbHandler.label(formType);
  } else if (formType === 'e2' || formType === 'e3') {
    // Generic VDE E.2 / E.3
    pdf = formType === 'e3' ? await fillE3(project, customer) : await fillE2(project, customer);
    label = formType === 'e3' ? 'E3-Speicher' : 'E2-Anmeldung';
  } else if (formType.startsWith('ai:')) {
    // AI-powered form filler: form=ai:path/to/template.pdf
    // Loads any PDF from nb-templates and uses Claude to fill it
    const fs = await import('fs');
    const path = await import('path');
    const tmplPath = path.join(process.cwd(), 'nb-templates', formType.slice(3));
    if (!fs.existsSync(tmplPath)) return new Response('Template nicht gefunden: ' + formType.slice(3), { status: 404 });
    const templateBytes = fs.readFileSync(tmplPath);
    try {
      const aiResult = await aiFillForm(templateBytes, project, customer, netzbetreiber, formType.slice(3));
      let finalPdf = aiResult.pdf;

      // Apply Katrin's saved overrides (if any)
      try {
        const { getDb, tenantId: getTid } = await import('@/app/lib/db');
        const db = getDb();
        const tid = await getTid('volta');
        if (db && tid) {
          const key = `${id}::${formType}`;
          const { data: ovRow } = await db.from('entities').select('data')
            .eq('tenant_id', tid).eq('kind', 'doc_override').eq('external_id', key).single();
          if (ovRow) {
            const overrides = (ovRow as { data: { overrides: Record<string, string | boolean> } }).data.overrides;
            if (overrides && Object.keys(overrides).length > 0) {
              const { PDFDocument, PDFTextField, PDFCheckBox } = await import('pdf-lib');
              const doc = await PDFDocument.load(finalPdf, { ignoreEncryption: true });
              const form = doc.getForm();
              for (const [fieldName, value] of Object.entries(overrides)) {
                try {
                  if (typeof value === 'boolean') {
                    const cb = form.getCheckBox(fieldName);
                    value ? cb.check() : cb.uncheck();
                  } else if (typeof value === 'string') {
                    form.getTextField(fieldName).setText(value);
                  }
                } catch { /* field doesn't exist */ }
              }
              try { form.updateFieldAppearances(); } catch {}
              finalPdf = await doc.save();
            }
          }
        }
      } catch { /* overrides are best-effort */ }

      pdf = finalPdf;
      // Cache the generated PDF (saves ~$0.02-0.05 per future view)
      saveCachedPdf(id, formType, finalPdf instanceof Uint8Array ? finalPdf : new Uint8Array(finalPdf));
    } catch (aiErr) {
      console.log('[document] AI fill failed, returning original template:', (aiErr as Error).message?.slice(0, 80));
      pdf = new Uint8Array(templateBytes);
    }
    label = formType.slice(3).split('/').pop()?.replace('.pdf', '') ?? formType;
  } else {
    return new Response('Kein passendes Formular. Bitte NB-spezifisches Template nutzen (ai:Pfad) oder VNB zuweisen.', { status: 400 });
  }

  if (!pdf) return new Response('Formularvorlage nicht erreichbar', { status: 502 });

  const safe = customer.replace(/[^\w.-]+/g, '_');
  const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline';
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${label}-${safe}.pdf"`,
    },
  });
}
