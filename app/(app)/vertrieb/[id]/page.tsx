import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Card, CardHeader, Pill, KpiCard } from '@/components/ui';
import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { getProjectFiles, type ReonicFile } from '@/app/lib/reonic-files';
import { getNetzEmails, type NetzEmail } from '@/app/lib/netz-email';
import { getEntities } from '@/app/lib/db';
import type { RawOffer } from '@/app/lib/reonic-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const usd = (n: number) => (n === 0 ? '--' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }));
const fmtDate = (d: string | undefined) => {
  if (!d) return '--';
  try {
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return '--'; }
};
const fmtDateTime = (d: string | undefined) => {
  if (!d) return '--';
  try {
    return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '--'; }
};

const stateLabel: Record<string, string> = { Open: 'OPEN', Won: 'WON', Lost: 'LOST' };
const stateTone: Record<string, 'info' | 'success' | 'error' | 'neutral'> = { Open: 'info', Won: 'success', Lost: 'error' };

const docStatusLabel: Record<string, string> = {
  offen: 'Open', pruefen: 'Needs Review', hochgeladen: 'Uploaded',
  unterschrieben: 'Signed', eingereicht: 'Submitted', freigegeben: 'Approved',
};
const docStatusTone: Record<string, 'info' | 'success' | 'warning' | 'neutral' | 'accent'> = {
  offen: 'neutral', pruefen: 'warning', hochgeladen: 'info',
  unterschrieben: 'accent', eingereicht: 'success', freigegeben: 'success',
};

const stageLabelMap: Record<string, string> = {
  anfrage: 'Interconnection Request', zusage: 'Approval', inbetriebnahme: 'Commissioning',
  mastr: 'MaStR', abschluss: 'Completed',
};
const stageTone: Record<string, 'info' | 'success' | 'warning' | 'accent' | 'neutral'> = {
  anfrage: 'info', zusage: 'accent', inbetriebnahme: 'warning',
  mastr: 'warning', abschluss: 'success',
};

const emailCatLabel: Record<string, string> = {
  netz_status: 'Utility Status', netz_document: 'Utility Document', customer_update: 'Customer Inquiry',
  customer_doc: 'Customer Doc', customer_correction: 'Correction', bounce: 'Bounce', general: 'General',
};

const fileCatLabel: Record<string, string> = {
  vollmacht_nb: 'Utility Auth', vollmacht_mastr: 'MaStR Auth', anschlusszusage: 'Connection Approval',
  angebot: 'Quote', auftrag: 'Order', abnahmeprotokoll: 'Acceptance Report', lageplan: 'Site Plan',
  mastr_registrierung: 'MaStR', netzanmeldung: 'Interconnection', messkonzept: 'Metering Concept',
  rechnung: 'Invoice', sonstiges: 'Other',
};

// ── Timeline builder ──────────────────────────────────────────────────

interface TimelineEvent {
  date: string;
  icon: string;
  label: string;
  detail?: string;
  source: string;
}

function buildTimeline(
  offer: RawOffer | null,
  reg: { startedAt: string; status: string; documents?: { form: string; at: string }[]; portalUpdates?: { at: string; type: string; content: string }[] } | null,
  emails: NetzEmail[],
  files: ReonicFile[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Project created
  if (offer?.createdAt) {
    events.push({ date: offer.createdAt, icon: '↗', label: 'Project created', detail: offer.name || undefined, source: 'Reonic' });
  }

  // Interconnection started
  if (reg?.startedAt) {
    events.push({ date: reg.startedAt, icon: '⚡', label: 'Interconnection started', detail: `Status: ${stageLabelMap[reg.status] ?? reg.status}`, source: 'birdie' });
  }

  // Documents generated
  if (reg?.documents) {
    for (const doc of reg.documents) {
      events.push({ date: doc.at, icon: '📄', label: `Document: ${doc.form}`, detail: undefined, source: 'birdie' });
    }
  }

  // Portal updates
  if (reg?.portalUpdates) {
    for (const pu of reg.portalUpdates) {
      events.push({ date: pu.at, icon: '🔔', label: `Portal: ${pu.type}`, detail: pu.content, source: 'Portal-Bot' });
    }
  }

  // Emails
  for (const em of emails) {
    events.push({
      date: em.received_at,
      icon: '✉',
      label: `${emailCatLabel[em.category] ?? em.category}: ${em.subject}`,
      detail: em.summary || `From: ${em.from_name || em.from_email}`,
      source: 'Email',
    });
  }

  // Files from Reonic (PDFs with dates only)
  for (const f of files) {
    if (f.createdAt) {
      events.push({
        date: f.createdAt,
        icon: '📎',
        label: `File: ${f.name}`,
        detail: fileCatLabel[f.docCategory ?? 'sonstiges'] ?? f.docCategory,
        source: 'Reonic',
      });
    }
  }

  // Sort newest first
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function CustomerFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offerId = decodeURIComponent(id);

  // Load all data in parallel
  const [project, regs, files, emails, allOffers] = await Promise.all([
    getProjectData(offerId),
    getRegistrations(),
    getProjectFiles(offerId),
    getNetzEmails({ registrationId: offerId, limit: 20 }).catch(() => [] as NetzEmail[]),
    getEntities<RawOffer>('offer'),
  ]);

  const reg = regs.find((r) => r.offerId === offerId);
  const offer = allOffers.find((o) => o.id === offerId) ?? null;

  // Derive price from offer
  const price = offer
    ? (typeof offer.totalPriceOverride === 'number' ? offer.totalPriceOverride : null)
      ?? (typeof offer.componentsTotalPrice === 'number' ? offer.componentsTotalPrice : null)
      ?? (typeof offer.totalPlannedPrice === 'number' ? offer.totalPlannedPrice : null)
      ?? 0
    : 0;
  const dealState = offer?.dealState ?? offer?.state ?? '--';

  const timeline = buildTimeline(offer, reg ?? null, emails, files);

  // Customer display values
  const customerName = project?.customerName || reg?.customer || offer?.name || offerId;
  const addressLine = project?.address
    ? [project.address.line, project.address.zip, project.address.city].filter(Boolean).join(', ')
    : '--';

  return (
    <>
      <Sidebar active="vertrieb" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        {/* Header with breadcrumb */}
        <header className="min-h-[72px] lg:min-h-[96px] shrink-0 bg-bg border-b border-line flex flex-col justify-center px-4 pl-16 lg:pl-8 lg:px-8 gap-2 py-3 lg:py-4 sticky top-0 z-10">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Link href="/vertrieb" className="text-fg3 hover:text-fg2">Sales</Link>
            <span className="text-fg4">/</span>
            <span className="text-fg2 font-medium truncate max-w-[300px]">{customerName}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-xl text-fg tracking-tightest">{customerName}</h1>
            <Pill label={stateLabel[dealState] ?? dealState} tone={stateTone[dealState] ?? 'neutral'} />
          </div>
          <p className="text-[12px] text-fg3">
            {addressLine}
            {project?.phone && <span className="ml-4">Phone: {project.phone}</span>}
            {project?.email && <span className="ml-4">{project.email}</span>}
          </p>
        </header>

        <div className="flex-1 px-4 py-5 lg:px-8 lg:py-7 flex flex-col gap-5 lg:gap-6 overflow-y-auto">

          {/* ── Section 1: Overview (3 columns) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Card: System */}
            <Card className="p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-accent-bg flex items-center justify-center text-accent text-xs">&#9728;</span>
                System
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px]">
                <span className="text-fg3">kW DC</span>
                <span className="text-fg font-medium">{project?.kwp ?? '--'}</span>
                <span className="text-fg3">Modules</span>
                <span className="text-fg font-medium">{project?.moduleCount ?? '--'}{project?.moduleType ? ` (${project.moduleType.slice(0, 40)})` : ''}</span>
                <span className="text-fg3">Inverter</span>
                <span className="text-fg font-medium truncate" title={project?.inverter}>{project?.inverter ?? '--'}</span>
                <span className="text-fg3">Inverter Power</span>
                <span className="text-fg font-medium">{project?.inverterKw ? `${project.inverterKw} kW` : '--'}</span>
                <span className="text-fg3">Battery</span>
                <span className="text-fg font-medium">{project?.batteryKwh ? `${project.batteryKwh} kWh` : '--'}{project?.battery ? ` (${project.battery.slice(0, 30)})` : ''}</span>
                <span className="text-fg3">Annual Usage</span>
                <span className="text-fg font-medium">{project?.annualKwh ? `${project.annualKwh.toLocaleString('en-US')} kWh` : '--'}</span>
              </div>
              {project && project.missing.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {project.missing.map((m) => (
                    <Pill key={m} label={m} tone="warning" dot={false} />
                  ))}
                </div>
              )}
            </Card>

            {/* Card: Sales */}
            <Card className="p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-success-bg flex items-center justify-center text-success text-xs">&#8599;</span>
                Sales
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px]">
                <span className="text-fg3">Quote Value</span>
                <span className="text-fg font-semibold">{usd(price)}</span>
                <span className="text-fg3">Status</span>
                <span><Pill label={stateLabel[dealState] ?? dealState} tone={stateTone[dealState] ?? 'neutral'} /></span>
                <span className="text-fg3">Created</span>
                <span className="text-fg font-medium">{fmtDate(offer?.createdAt)}</span>
                <span className="text-fg3">Stage</span>
                <span className="text-fg font-medium">{offer?.stage ?? '--'}</span>
                <span className="text-fg3">Project</span>
                <span className="text-fg font-medium truncate" title={offer?.name}>{offer?.name ?? '--'}</span>
              </div>
            </Card>

            {/* Card: Interconnection */}
            <Card className="p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-info-bg flex items-center justify-center text-info text-xs">&#9889;</span>
                Interconnection
              </h3>
              {reg ? (
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px]">
                  <span className="text-fg3">Status</span>
                  <span><Pill label={stageLabelMap[reg.status] ?? reg.status} tone={stageTone[reg.status] ?? 'neutral'} /></span>
                  <span className="text-fg3">Utility</span>
                  <span className="text-fg font-medium">{reg.netzbetreiber}</span>
                  <span className="text-fg3">Documents</span>
                  <span><Pill label={docStatusLabel[reg.docStatus ?? 'offen'] ?? reg.docStatus ?? 'offen'} tone={docStatusTone[reg.docStatus ?? 'offen'] ?? 'neutral'} /></span>
                  <span className="text-fg3">Started</span>
                  <span className="text-fg font-medium">{fmtDate(reg.startedAt)}</span>
                  {reg.dueDate && (
                    <>
                      <span className="text-fg3">Deadline</span>
                      <span className="text-fg font-medium">{fmtDate(reg.dueDate)}</span>
                    </>
                  )}
                  <span className="text-fg3">Documents</span>
                  <span className="text-fg font-medium">{reg.documents?.length ?? 0} generated</span>
                </div>
              ) : (
                <p className="text-[12px] text-fg3">No interconnection application on file</p>
              )}
            </Card>
          </div>

          {/* ── Section 2: Timeline ── */}
          <Card className="overflow-hidden">
            <CardHeader title="Timeline" right={<span className="text-[11px] text-fg3">{timeline.length} Events</span>} />
            {timeline.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-fg3">No events found</div>
            ) : (
              <div className="divide-y divide-line">
                {timeline.slice(0, 50).map((ev, i) => (
                  <div key={`${ev.date}-${i}`} className="flex items-start gap-4 px-5 py-3 hover:bg-surface-2/40 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-sm shrink-0 mt-0.5">
                      {ev.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-fg truncate">{ev.label}</span>
                        <span className="text-[10px] text-fg4 px-1.5 py-0.5 rounded bg-surface-2 shrink-0">{ev.source}</span>
                      </div>
                      {ev.detail && <p className="text-[11px] text-fg3 mt-0.5 truncate">{ev.detail}</p>}
                    </div>
                    <span className="text-[11px] text-fg3 shrink-0 whitespace-nowrap">{fmtDateTime(ev.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Section 3: Files ── */}
          <Card className="overflow-hidden">
            <CardHeader title="Files" right={<span className="text-[11px] text-fg3">{files.length} Files</span>} />
            {files.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-fg3">No files found</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-5">
                {files.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border border-line hover:border-line-2 hover:bg-surface-2/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-fg3 text-xs font-semibold shrink-0 uppercase">
                      {f.type === 'pdf' ? 'PDF' : f.type === 'image' ? 'IMG' : f.type.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-fg truncate group-hover:text-accent transition-colors">{f.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Pill label={fileCatLabel[f.docCategory ?? 'sonstiges'] ?? 'Other'} tone="neutral" dot={false} />
                        {f.createdAt && <span className="text-[10px] text-fg4">{fmtDate(f.createdAt)}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </Card>

          {/* ── Emails Detail ── */}
          {emails.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader title="Emails" right={<span className="text-[11px] text-fg3">{emails.length} Emails</span>} />
              <div className="divide-y divide-line">
                {emails.map((em) => (
                  <div key={em.message_id} className="flex items-start gap-4 px-5 py-3 hover:bg-surface-2/40 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${em.is_read ? 'bg-fg4' : 'bg-accent'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-fg truncate">{em.subject}</span>
                        <Pill label={emailCatLabel[em.category] ?? em.category} tone={em.category.startsWith('netz') ? 'info' : em.category.startsWith('customer') ? 'accent' : 'neutral'} dot={false} />
                      </div>
                      <p className="text-[11px] text-fg3 mt-0.5">
                        {em.from_name || em.from_email} &middot; {em.summary}
                      </p>
                    </div>
                    <span className="text-[11px] text-fg3 shrink-0 whitespace-nowrap">{fmtDateTime(em.received_at)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
