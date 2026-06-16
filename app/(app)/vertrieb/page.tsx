import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Tag } from '@/components/ui';
import { type SellerStat } from '@/app/lib/reonic-server';
import { loadPipeline, loadLeads } from '@/app/lib/reonic-data';
import { OffersTable } from './offers-table';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));

function StatTable({ title, rows, exportBase }: { title: string; rows: SellerStat[]; exportBase?: string }) {
  return (
    <Card className="flex-1 min-w-0 overflow-hidden">
      <div className="h-13 px-5 border-b border-line flex items-center" style={{ height: 52 }}>
        <h3 className="font-semibold text-sm text-fg">{title}</h3>
        <span className="ml-auto text-[11px] text-fg3">Name klicken → Details</span>
      </div>
      <div className="grid grid-cols-[1fr_70px_110px_110px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
        <span>NAME</span><span>GEW.</span><span>GEW. WERT</span><span>PIPELINE</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-fg3">Keine Zuordnung</div>
      ) : (
        rows.map((s, i) => (
          <div key={s.id} className={`grid grid-cols-[1fr_70px_110px_110px] h-[44px] items-center px-5 hover:bg-surface-2/40 transition-colors ${i < rows.length - 1 ? 'border-b border-line' : ''}`}>
            <span className="text-[13px] font-medium truncate pr-2 flex items-center gap-2">
              <a href={`/vertrieb/${encodeURIComponent(s.id)}`} className="text-accent hover:underline truncate">{s.name}</a>
              {exportBase && (
                <a href={`${exportBase}?id=${encodeURIComponent(s.id)}`} className="text-fg4 text-[10px] hover:text-fg3 shrink-0" title="CSV">⤓</a>
              )}
            </span>
            <span className="text-xs text-fg2">{s.wonCount}</span>
            <span className="text-[13px] font-semibold text-success">{euro(s.wonValue)}</span>
            <span className="text-xs text-fg2">{euro(s.openValue)}</span>
          </div>
        ))
      )}
    </Card>
  );
}

const PERIODS: { key: string; label: string; cutoff: string | null }[] = [
  { key: '2026', label: '2026', cutoff: '2026-01-01' },
  { key: 'q2-26', label: 'Q2 2026', cutoff: '2026-04-01' },
  { key: 'alle', label: 'Gesamt', cutoff: null },
];

export default async function VertriebPage({ searchParams }: { searchParams: { period?: string } }) {
  const selectedPeriod = searchParams?.period || 'alle';
  const periodConfig = PERIODS.find((pp) => pp.key === selectedPeriod) ?? PERIODS[2];

  const [pipe, leadsRes] = await Promise.all([
    loadPipeline(periodConfig.cutoff ?? undefined),
    loadLeads(),
  ]);
  const p = pipe.data;
  const leads = leadsRes.data;
  const configured = p.configured;
  const closeRate = p.won + p.lost > 0 ? Math.round((p.won / (p.won + p.lost)) * 100) : 0;
  const lostValue = p.recent.filter((o) => o.state === 'Lost').reduce((s, o) => s + o.value, 0);
  const maxStatus = Math.max(1, ...p.byStatus.map((s) => s.count));
  const maxSource = Math.max(1, ...leads.bySource.map((s) => s.count));

  return (
    <>
      <Sidebar active="vertrieb" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Vertrieb"
          subtitle={configured && !p.error ? `${p.total.toLocaleString('de-DE')} Angebote · ${leads.total}${leads.capped ? '+' : ''} Leads · ${periodConfig.label}` : 'Reonic-Connector · Angebote, Teams & Leads'}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {!configured && (
            <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[640px] mx-auto mt-8">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-accent text-xl">↗</div>
              <h2 className="font-semibold text-lg text-fg tracking-tightest">Reonic-Connector nicht verbunden</h2>
              <p className="text-[13px] text-fg2 leading-[20px] max-w-[460px]">
                Mit Reonic-Key erscheinen hier echte Pipeline, Team-Performance (wer/welches Team verkauft hat) und
                Lead-Quellen — alles live aus dem CRM.
              </p>
            </Card>
          )}

          {configured && p.error && (
            <Card className="p-5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-error-bg flex items-center justify-center text-error font-bold">!</div>
              <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Reonic nicht erreichbar</span><span className="text-xs text-fg2">{p.error}</span></div>
            </Card>
          )}

          {configured && !p.error && (
            <>
              <div className="flex items-center gap-1 bg-surface border border-line rounded-lg p-0.5 self-start">
                {PERIODS.map((pp) => (
                  <a
                    key={pp.key}
                    href={`/vertrieb?period=${pp.key}`}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                      pp.key === selectedPeriod ? 'bg-accent text-bg' : 'text-fg3 hover:text-fg2 hover:bg-surface-2'
                    }`}
                  >
                    {pp.label}
                  </a>
                ))}
              </div>

              {/* KPIs — compact row */}
              <div className="grid grid-cols-5 gap-3">
                <KpiCard label="PIPELINE" value={euro(p.pipelineValueOpen)} sub={`${p.open} offen`} />
                <KpiCard label="GEWONNEN" value={euro(p.wonValue)} sub={`${p.won}`} valueColor="text-success" />
                <KpiCard label="VERLOREN" value={euro(lostValue)} sub={`${p.lost}`} valueColor="text-error" />
                <KpiCard label="QUOTE" value={`${closeRate}%`} sub={`${p.won}/${p.won + p.lost}`} valueColor={closeRate >= 30 ? 'text-success' : 'text-fg'} />
                <KpiCard label="LEADS" value={`${leads.total.toLocaleString('de-DE')}${leads.capped ? '+' : ''}`} sub="Kontakte" />
              </div>

              {/* Main: 2 columns — left: table, right: analytics */}
              <div className="grid lg:grid-cols-[1fr_340px] gap-4 flex-1 min-h-0">
                {/* Left: Offers table */}
                <OffersTable offers={p.recent} total={p.total} />

                {/* Right: Analytics sidebar */}
                <div className="flex flex-col gap-4">
                  {/* Funnel */}
                  <Card className="p-4 flex flex-col gap-2">
                    <h3 className="font-semibold text-[12px] text-fg mb-1">Status-Funnel</h3>
                    {p.byStatus.slice(0, 6).map((s) => (
                      <div key={s.status} className="flex items-center gap-2">
                        <span className="text-[10px] text-fg3 w-[100px] truncate" title={s.status}>{s.status}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / maxStatus) * 100}%` }} /></div>
                        <span className="text-[10px] font-medium text-fg w-5 text-right">{s.count}</span>
                      </div>
                    ))}
                  </Card>

                  {/* Lead sources */}
                  <Card className="p-4 flex flex-col gap-2">
                    <h3 className="font-semibold text-[12px] text-fg mb-1">Lead-Quellen</h3>
                    {leads.bySource.slice(0, 5).map((s) => (
                      <div key={s.source} className="flex items-center gap-2">
                        <span className="text-[10px] text-fg3 w-[100px] truncate" title={s.source}>{s.source}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden"><div className="h-full rounded-full bg-success" style={{ width: `${(s.count / maxSource) * 100}%` }} /></div>
                        <span className="text-[10px] font-medium text-fg w-5 text-right">{s.count}</span>
                      </div>
                    ))}
                  </Card>

                  {/* Teams */}
                  <Card className="p-4 flex flex-col gap-2 max-h-[280px] overflow-hidden">
                    <div className="flex items-center justify-between mb-1 shrink-0">
                      <h3 className="font-semibold text-[12px] text-fg">Verk&auml;ufer ({p.bySeller.length})</h3>
                      <a href="/api/export/sellers" className="text-[10px] text-accent font-medium">CSV &darr;</a>
                    </div>
                    <div className="overflow-y-auto flex flex-col gap-1">
                    {p.bySeller.map((s) => (
                      <Link key={s.id} href={`/vertrieb/seller/${encodeURIComponent(s.id)}`} className="flex items-center justify-between text-[11px] hover:bg-surface-2/40 -mx-1 px-1 py-1 rounded transition-colors shrink-0">
                        <span className="text-accent truncate flex-1">{s.name}</span>
                        <span className="text-[10px] text-fg3 mx-2">{s.wonCount} gew.</span>
                        <span className="text-success font-semibold">{euro(s.wonValue)}</span>
                      </Link>
                    ))}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
