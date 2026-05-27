import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill } from '@/components/ui';
import { StageSelect } from '@/components/stage-select';
import {
  getRegistrations,
  getPortals,
  STAGES,
  DOC_STAGES,
  type StageId,
  type DocStatus,
  type Registration,
} from '@/app/lib/netzanmeldung';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n > 0 ? '€ ' + Math.round(n).toLocaleString('de-DE') : '—');
const overdue = (r: { status: StageId; dueDate?: string }) =>
  r.status === 'mastr' && !!r.dueDate && Date.parse(r.dueDate) < Date.now();
const docStatusOf = (r: Registration): DocStatus => r.docStatus ?? 'offen';

const COLUMN_CAP = 12; // keep tall columns (e.g. "Offen") from scrolling forever

export default async function NetzanmeldungPage({
  searchParams,
}: {
  searchParams?: { view?: string };
}) {
  const view = searchParams?.view === 'grid' ? 'grid' : 'docs';
  const [regs, portals] = await Promise.all([getRegistrations(), getPortals()]);
  const withAccess = portals.filter((p) => p.hasPassword).length;
  const open = regs.filter((r) => r.status !== 'abschluss').length;
  const review = regs.filter((r) => docStatusOf(r) === 'pruefen').length;
  const overdueCount = regs.filter(overdue).length;

  const columns =
    view === 'grid'
      ? STAGES.map((s) => ({ id: s.id, label: s.label, desc: s.desc, items: regs.filter((r) => r.status === s.id) }))
      : DOC_STAGES.map((s) => ({ id: s.id, label: s.label, desc: s.desc, items: regs.filter((r) => docStatusOf(r) === s.id) }));

  return (
    <>
      <Sidebar active="netzanmeldung" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Netzanmeldung" subtitle={`${regs.length} Anlagen · Bearbeitung, Netz-Status & MaStR`} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {regs.length === 0 ? (
            <Card className="p-8 text-center text-sm text-fg3 max-w-[620px] mx-auto mt-8">
              Noch keine Netzanmeldungen. Sie werden automatisch aus gewonnenen Reonic-Projekten angelegt
              (Sync · <code className="text-accent">/api/sync?resource=registrations</code>).
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
                  <a
                    href="/netzanmeldung?view=docs"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === 'docs' ? 'bg-surface-3 text-fg' : 'text-fg3 hover:text-fg2'}`}
                  >
                    Bearbeitung
                  </a>
                  <a
                    href="/netzanmeldung?view=grid"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${view === 'grid' ? 'bg-surface-3 text-fg' : 'text-fg3 hover:text-fg2'}`}
                  >
                    Netz-Status
                  </a>
                </div>
                <a href="/netzanmeldung/check" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-line rounded-lg text-xs font-medium text-fg2 hover:text-fg hover:border-line-2 transition-colors">
                  ✓ Datencheck
                </a>
              </div>

              <div className="flex flex-wrap gap-4">
                <KpiCard label="BITTE PRÜFEN" value={String(review)} sub="Entwurf wartet auf Freigabe" valueColor={review > 0 ? 'text-warning' : 'text-fg'} />
                <KpiCard label="IN BEARBEITUNG" value={String(open)} sub="laufende Anmeldungen" />
                <KpiCard label="MaStR ÜBERFÄLLIG" value={String(overdueCount)} sub="Frist 1 Monat überschritten" valueColor={overdueCount > 0 ? 'text-error' : 'text-fg'} />
                <KpiCard label="GESAMT" value={String(regs.length)} sub="aus gewonnenen Projekten" />
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
                          <div className="border border-dashed border-line rounded-lg py-6 text-center text-[11px] text-fg4">leer</div>
                        )}
                        {shown.map((r) => (
                          <Card key={r.offerId} className="p-3 flex flex-col gap-2">
                            <div className="flex items-start gap-2">
                              <span className="text-[13px] font-medium text-fg leading-tight truncate flex-1">{r.customer}</span>
                              {/\bWP\b/i.test(r.customer) && <Pill label="WP" tone="info" dot={false} />}
                              {overdue(r) && <Pill label="FRIST" tone="error" dot={false} />}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-fg3">
                              <span>{euro(r.value)}</span>
                              {r.dueDate && <span className={overdue(r) ? 'text-error' : ''}>bis {new Date(r.dueDate).toLocaleDateString('de-DE')}</span>}
                            </div>
                            {view === 'grid' ? (
                              <StageSelect offerId={r.offerId} status={r.status} />
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Pill label={STAGES.find((s) => s.id === r.status)?.label ?? r.status} tone="info" dot={false} />
                                {(r.documents?.length ?? 0) > 0 && <span className="text-[10px] text-fg4">{r.documents!.length} Dok.</span>}
                              </div>
                            )}
                            <a href={`/netzanmeldung/${r.offerId}`} className="text-[11px] font-medium text-accent self-end">Details & Check →</a>
                          </Card>
                        ))}
                        {rest > 0 && (
                          <a href={`/netzanmeldung/check`} className="border border-dashed border-line rounded-lg py-2 text-center text-[11px] text-fg3 hover:text-fg2">
                            + {rest} weitere
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {portals.length > 0 && (
            <section className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-sm text-fg tracking-tightest">Netzbetreiber-Portale</h2>
                <Pill label={`${withAccess} ZUGÄNGE`} tone="success" />
                <span className="text-[11px] text-fg3">{portals.length} Betreiber · Logins sicher hinterlegt</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {portals.map((p) => (
                  <div key={p.name} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-accent text-sm shrink-0">⚡</div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13px] font-medium text-fg truncate">{p.name}</span>
                      <span className="text-[10px] text-fg3">{p.hasPassword ? 'Zugang hinterlegt' : 'kein Login'}</span>
                    </div>
                    {p.portalUrl && (
                      <a href={p.portalUrl} target="_blank" rel="noopener noreferrer" className="text-fg3 hover:text-accent text-sm shrink-0" title="Portal öffnen">↗</a>
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
