import { Suspense } from 'react';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill } from '@/components/ui';
import { StageSelect } from '@/components/stage-select';
import { NetzSearch } from '@/components/netz-search';
import {
  getRegistrations,
  getPortals,
  STAGES,
  DOC_STAGES,
  type StageId,
  type DocStatus,
  type Registration,
} from '@/app/lib/netzanmeldung';
import { getWpOfferIds } from '@/app/lib/waermepumpe';
import { getNetzEmails, getNetzEmailStats } from '@/app/lib/netz-email';
import { NetzEmailKanban } from '@/components/netz-email-kanban';
import { isDemoMode } from '@/app/lib/demo-mode';
import { OnboardingView } from '@/components/onboarding';
import { ONBOARDING_INTERCONNECTION } from '@/app/lib/onboarding-data';

export const dynamic = 'force-dynamic';

const dollar = (n: number) => (n > 0 ? '$' + Math.round(n).toLocaleString('en-US') : '—');
const overdue = (r: { status: StageId; dueDate?: string }) =>
  r.status === 'mastr' && !!r.dueDate && Date.parse(r.dueDate) < Date.now();
const docStatusOf = (r: Registration): DocStatus => {
  const s = r.docStatus ?? 'offen';
  // freigegeben is a transient status (approve → upload), map to hochgeladen for display
  return s === 'freigegeben' ? 'hochgeladen' : s;
};

const COLUMN_CAP = 12;

type ProjectType = 'alle' | 'pv' | 'wp';

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) { if (v) sp.set(k, v); }
  const qs = sp.toString();
  return `/netzanmeldung${qs ? '?' + qs : ''}`;
}

export default async function NetzanmeldungPage({
  searchParams,
}: {
  searchParams?: { view?: string; type?: string; q?: string };
}) {
  const view = searchParams?.view === 'grid' ? 'grid' : 'docs';
  const typeFilter: ProjectType = (['pv', 'wp'] as const).includes(searchParams?.type as 'pv' | 'wp')
    ? (searchParams!.type as ProjectType)
    : 'alle';
  const searchQuery = (searchParams?.q ?? '').trim().toLowerCase();

  let [allRegs, portals, wpIds, unmatchedEmails, emailStats] = await Promise.all([
    getRegistrations(),
    getPortals(),
    getWpOfferIds(),
    getNetzEmails({ limit: 20 }),
    getNetzEmailStats(),
  ]);
  if (allRegs.length === 0 && isDemoMode()) {
    return (
      <>
        <Sidebar active="netzanmeldung" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Interconnection" subtitle="Utility Applications · AHJ Tracking · PTO" />
          <div className="flex-1 px-8 py-7">
            <OnboardingView {...ONBOARDING_INTERCONNECTION} />
          </div>
        </main>
      </>
    );
  }
  // Filter to only unmatched + netz-relevant emails
  const unmatched = unmatchedEmails.filter((e) => !e.matched_registration_id && e.category !== 'general');

  // Apply type filter
  let regs = allRegs;
  if (typeFilter === 'wp') regs = allRegs.filter((r) => wpIds.has(r.offerId));
  else if (typeFilter === 'pv') regs = allRegs.filter((r) => !wpIds.has(r.offerId));

  // Apply search filter
  if (searchQuery) {
    regs = regs.filter((r) => r.customer.toLowerCase().includes(searchQuery));
  }

  const wpCount = allRegs.filter((r) => wpIds.has(r.offerId)).length;
  const pvCount = allRegs.length - wpCount;
  const withAccess = portals.filter((p) => p.hasPassword).length;
  const open = regs.filter((r) => r.status !== 'abschluss').length;
  const review = regs.filter((r) => docStatusOf(r) === 'pruefen').length;
  const atPCloud = regs.filter((r) => docStatusOf(r) === 'hochgeladen').length;
  const signed = regs.filter((r) => docStatusOf(r) === 'unterschrieben').length;
  const overdueCount = regs.filter(overdue).length;


  const columns =
    view === 'grid'
      ? STAGES.map((s) => ({ id: s.id, label: s.label, desc: s.desc, items: regs.filter((r) => r.status === s.id) }))
      : DOC_STAGES.map((s) => ({ id: s.id, label: s.label, desc: s.desc, items: regs.filter((r) => docStatusOf(r) === s.id) }));

  return (
    <>
      <Sidebar active="netzanmeldung" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Interconnection" subtitle={`${regs.length}${regs.length !== allRegs.length ? ' / ' + allRegs.length : ''} Systems · Processing, Utility Status & AHJ Tracking`} />
        <div className="flex-1 px-4 py-5 lg:px-8 lg:py-7 flex flex-col gap-4 lg:gap-6">
          {regs.length === 0 ? (
            <Card className="p-8 text-center text-sm text-fg3 max-w-[620px] mx-auto mt-8">
              No interconnection applications yet. They are created automatically from won Aurora Solar projects
              (Sync · <code className="text-accent">/api/sync?resource=registrations</code>).
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* PV / WP / Alle type filter */}
                  <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
                    {([
                      { id: 'alle', label: 'All', count: allRegs.length },
                      { id: 'pv', label: 'PV', count: pvCount },
                      { id: 'wp', label: 'HP', count: wpCount },
                    ] as const).map((t) => (
                      <a
                        key={t.id}
                        href={buildUrl({ type: t.id === 'alle' ? undefined : t.id, view: view === 'grid' ? 'grid' : undefined, q: searchQuery || undefined })}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium ${typeFilter === t.id ? 'bg-surface-3 text-fg' : 'text-fg3 hover:text-fg2'}`}
                      >
                        {t.label} <span className="text-fg4">{t.count}</span>
                      </a>
                    ))}
                  </div>

                  {/* Processing / Utility Status view toggle */}
                  <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
                    <a
                      href={buildUrl({ view: undefined, type: typeFilter === 'alle' ? undefined : typeFilter, q: searchQuery || undefined })}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === 'docs' ? 'bg-surface-3 text-fg' : 'text-fg3 hover:text-fg2'}`}
                    >
                      Processing
                    </a>
                    <a
                      href={buildUrl({ view: 'grid', type: typeFilter === 'alle' ? undefined : typeFilter, q: searchQuery || undefined })}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === 'grid' ? 'bg-surface-3 text-fg' : 'text-fg3 hover:text-fg2'}`}
                    >
                      Utility Status
                    </a>
                  </div>

                  {/* Search */}
                  <Suspense fallback={<div className="w-[220px] h-[30px] rounded-lg border border-line bg-surface" />}>
                    <NetzSearch />
                  </Suspense>
                </div>

                <a href="/netzanmeldung/check" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-line rounded-lg text-xs font-medium text-fg2 hover:text-fg hover:border-line-2 transition-colors">
                  ✓ Data Check
                </a>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
                <KpiCard label="PLEASE REVIEW" value={String(review)} sub="Draft awaiting approval" valueColor={review > 0 ? 'text-warning' : 'text-fg'} />
                <KpiCard label="AT PCLOUD" value={String(atPCloud)} sub="Awaiting signature" valueColor={atPCloud > 0 ? 'text-accent' : 'text-fg'} />
                <KpiCard label="SIGNED" value={String(signed)} sub="Ready to submit" valueColor={signed > 0 ? 'text-success' : 'text-fg'} />
                <KpiCard label="IN PROGRESS" value={String(open)} sub="Active applications" />
                <KpiCard label="REGISTRY OVERDUE" value={String(overdueCount)} sub="utility deadline exceeded" valueColor={overdueCount > 0 ? 'text-error' : 'text-fg'} />
                <KpiCard label="TOTAL" value={String(regs.length)} sub="From won projects" />
              </div>

              <div className="flex gap-4 items-start overflow-x-auto pb-2">
                {columns.map((col) => {
                  const shown = col.items.slice(0, COLUMN_CAP);
                  const rest = col.items.length - shown.length;
                  return (
                    <div key={col.id} className="w-[260px] shrink-0 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[13px] text-fg">{col.label}</h3>
                        <span className="text-[11px] text-fg3">{col.items.length}</span>
                      </div>
                      <p className="text-[11px] text-fg3 -mt-2">{col.desc}</p>
                      <div className="flex flex-col gap-2">
                        {col.items.length === 0 && (
                          <div className="border border-dashed border-line rounded-lg py-6 text-center text-[11px] text-fg4">empty</div>
                        )}
                        {shown.map((r) => (
                          <Card key={r.offerId} className="p-3 flex flex-col gap-2">
                            <div className="flex items-start gap-2">
                              <span className="text-[13px] font-medium text-fg leading-tight truncate flex-1">{r.customer}</span>
                              {wpIds.has(r.offerId) && <Pill label="WP" tone="info" dot={false} />}
                              {docStatusOf(r) === 'hochgeladen' && <Pill label="☁ pCloud" tone="info" dot={false} />}
                              {docStatusOf(r) === 'unterschrieben' && <Pill label="✓ Signed" tone="success" dot={false} />}
                              {overdue(r) && <Pill label="OVERDUE" tone="error" dot={false} />}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-fg3">
                              <span>{dollar(r.value)}</span>
                              {r.dueDate && <span className={overdue(r) ? 'text-error' : ''}>due {new Date(r.dueDate).toLocaleDateString('en-US')}</span>}
                            </div>
                            {view === 'grid' ? (
                              <StageSelect offerId={r.offerId} status={r.status} />
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Pill label={STAGES.find((s) => s.id === r.status)?.label ?? r.status} tone="info" dot={false} />
                                {(r.documents?.length ?? 0) > 0 && <span className="text-[10px] text-fg4">{r.documents!.length} docs</span>}
                              </div>
                            )}
                            <a href={`/netzanmeldung/${r.offerId}`} className="text-[11px] font-medium text-accent self-end">Details & Review →</a>
                          </Card>
                        ))}
                        {rest > 0 && (
                          <a href={`/netzanmeldung/check`} className="border border-dashed border-line rounded-lg py-2 text-center text-[11px] text-fg3 hover:text-fg2">
                            + {rest} more
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Email Kanban */}
          {emailStats.total > 0 && (
            <section className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-semibold text-sm text-fg tracking-tightest">📧 Utility Emails</h2>
                <Pill label={`${emailStats.total} TOTAL`} tone="info" />
                {emailStats.unread > 0 && <Pill label={`${emailStats.unread} NEW`} tone="warning" />}
                {emailStats.matched > 0 && <Pill label={`${emailStats.matched} MATCHED`} tone="success" />}
              </div>
              <NetzEmailKanban emails={unmatchedEmails} />
            </section>
          )}

          {portals.length > 0 && (
            <section className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-sm text-fg tracking-tightest">Utility Portals</h2>
                <Pill label={`${withAccess} LOGINS`} tone="success" />
                <span className="text-[11px] text-fg3">{portals.length} utilities · Credentials stored securely</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {portals.map((p) => (
                  <div key={p.name} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-accent text-sm shrink-0">⚡</div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13px] font-medium text-fg truncate">{p.name}</span>
                      <span className="text-[10px] text-fg3">{p.hasPassword ? 'Credentials stored' : 'No login'}</span>
                    </div>
                    {p.portalUrl && (
                      <a href={p.portalUrl} target="_blank" rel="noopener noreferrer" className="text-fg3 hover:text-accent text-sm shrink-0" title="Open portal">↗</a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
