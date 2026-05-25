import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill } from '@/components/ui';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { getProjectDataBatch, type ProjectData } from '@/app/lib/projektdaten';
import { netzbetreiberForPlz } from '@/app/lib/netzbetreiber';

export const dynamic = 'force-dynamic';

export default async function DatencheckPage() {
  const regs = await getRegistrations();
  const projects = await getProjectDataBatch(regs.map((r) => r.offerId));
  const byId = new Map<string, ProjectData>(projects.map((p) => [p.offerId, p]));

  // One row per registration; projects we couldn't resolve count as "unbekannt".
  const rows = regs.map((r) => ({ reg: r, project: byId.get(r.offerId) ?? null }));
  const incomplete = rows.filter((x) => x.project && !x.project.ready);
  const complete = rows.filter((x) => x.project && x.project.ready);
  const unknown = rows.filter((x) => !x.project);

  // Frequency of each missing field — shows the office which gap is systemic.
  const gapCount = new Map<string, number>();
  for (const x of incomplete) for (const m of x.project!.missing) gapCount.set(m, (gapCount.get(m) ?? 0) + 1);
  const topGaps = [...gapCount.entries()].sort((a, b) => b[1] - a[1]);

  const sorted = [...incomplete, ...unknown, ...complete];

  return (
    <>
      <Sidebar active="netzanmeldung" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Datencheck" subtitle="Vollständigkeit aller Projekte für die Netzanmeldung" />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[1100px]">
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/netzanmeldung" className="text-fg3 hover:text-fg2">Netzanmeldung</Link>
            <span className="text-fg4">/</span>
            <span className="text-fg2 font-medium">Datencheck</span>
          </div>

          {regs.length === 0 ? (
            <Card className="p-8 text-center text-sm text-fg3 max-w-[620px] mx-auto mt-8">
              Noch keine Projekte zu prüfen. Sie entstehen aus gewonnenen Reonic-Aufträgen
              (Sync · <code className="text-accent">/api/sync?resource=registrations</code>).
            </Card>
          ) : (
            <>
              <div className="flex flex-wrap gap-4">
                <KpiCard label="VOLLSTÄNDIG" value={String(complete.length)} sub="bereit zur Anmeldung" valueColor="text-success" />
                <KpiCard label="LÜCKEN" value={String(incomplete.length)} sub="Daten fehlen in Reonic" valueColor={incomplete.length > 0 ? 'text-warning' : 'text-fg'} />
                <KpiCard label="NICHT LADBAR" value={String(unknown.length)} sub="Projekt nicht auffindbar" valueColor={unknown.length > 0 ? 'text-error' : 'text-fg'} />
                <KpiCard label="GESAMT" value={String(regs.length)} sub="gewonnene Projekte" />
              </div>

              {topGaps.length > 0 && (
                <Card className="p-5 flex flex-col gap-3">
                  <h3 className="font-semibold text-[13px] text-fg">Häufigste Lücken</h3>
                  <p className="text-[11px] text-fg3 -mt-1">Was am häufigsten fehlt — hier lohnt sich eine Ansage ans Vertriebsteam.</p>
                  <div className="flex flex-wrap gap-2">
                    {topGaps.map(([field, n]) => (
                      <span key={field} className="inline-flex items-center gap-2 px-2.5 py-1 bg-warning-bg text-warning rounded-md text-[11px] font-medium">
                        {field}<span className="px-1.5 py-0.5 rounded bg-warning/20 text-[10px]">{n}×</span>
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="flex flex-col">
                <div className="px-5 py-3 border-b border-line flex items-center gap-3">
                  <h3 className="font-semibold text-[13px] text-fg">Alle Projekte</h3>
                  <span className="text-[11px] text-fg3">Lücken zuerst</span>
                </div>
                <div className="flex flex-col">
                  {sorted.map(({ reg, project }) => {
                    const nb = netzbetreiberForPlz(project?.address?.zip);
                    return (
                      <Link
                        key={reg.offerId}
                        href={`/netzanmeldung/${reg.offerId}`}
                        className="px-5 py-3 border-b border-line last:border-0 flex items-center gap-4 hover:bg-surface-2 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: !project ? 'var(--error,#ef4444)' : project.ready ? '#22c55e' : '#f59e0b' }} />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[13px] font-medium text-fg truncate">{reg.customer}</span>
                          <span className="text-[11px] text-fg3 truncate">
                            {project?.address?.zip ? `${project.address.zip} ${project.address.city ?? ''}` : 'keine Adresse'}
                            {nb && ` · ${nb.name}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!project ? (
                            <Pill label="NICHT LADBAR" tone="error" dot={false} />
                          ) : project.ready ? (
                            <Pill label="VOLLSTÄNDIG" tone="success" dot={false} />
                          ) : (
                            <div className="flex flex-wrap gap-1.5 justify-end max-w-[420px]">
                              {project.missing.map((m) => (
                                <span key={m} className="inline-flex items-center px-2 py-0.5 bg-warning-bg text-warning rounded text-[10px] font-medium">
                                  ✗ {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
}
