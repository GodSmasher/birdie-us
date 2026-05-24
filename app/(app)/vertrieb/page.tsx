import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill, Tag } from '@/components/ui';
import { type SellerStat } from '@/app/lib/reonic-server';
import { loadPipeline, loadLeads } from '@/app/lib/reonic-data';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));

const stateTone: Record<string, 'info' | 'success' | 'error' | 'neutral'> = { Open: 'info', Won: 'success', Lost: 'error' };
const stateLabel: Record<string, string> = { Open: 'OFFEN', Won: 'GEWONNEN', Lost: 'VERLOREN' };

function StatTable({ title, rows }: { title: string; rows: SellerStat[] }) {
  return (
    <Card className="flex-1 min-w-0 overflow-hidden">
      <div className="h-13 px-5 border-b border-line flex items-center" style={{ height: 52 }}>
        <h3 className="font-semibold text-sm text-fg">{title}</h3>
      </div>
      <div className="grid grid-cols-[1fr_70px_110px_110px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
        <span>NAME</span><span>GEW.</span><span>GEW. WERT</span><span>PIPELINE</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-fg3">Keine Zuordnung</div>
      ) : (
        rows.map((s, i) => (
          <div key={s.name + i} className={`grid grid-cols-[1fr_70px_110px_110px] h-[44px] items-center px-5 hover:bg-surface-2/40 transition-colors ${i < rows.length - 1 ? 'border-b border-line' : ''}`}>
            <span className="text-[13px] font-medium text-fg truncate pr-2">{s.name}</span>
            <span className="text-xs text-fg2">{s.wonCount}</span>
            <span className="text-[13px] font-semibold text-success">{euro(s.wonValue)}</span>
            <span className="text-xs text-fg2">{euro(s.openValue)}</span>
          </div>
        ))
      )}
    </Card>
  );
}

export default async function VertriebPage() {
  const [pipe, leadsRes] = await Promise.all([loadPipeline(), loadLeads()]);
  const p = pipe.data;
  const leads = leadsRes.data;
  const configured = p.configured;
  const closeRate = p.won + p.lost > 0 ? Math.round((p.won / (p.won + p.lost)) * 100) : 0;
  const maxStatus = Math.max(1, ...p.byStatus.map((s) => s.count));
  const maxSource = Math.max(1, ...leads.bySource.map((s) => s.count));

  return (
    <>
      <Sidebar active="vertrieb" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Vertrieb"
          subtitle={configured && !p.error ? `${p.total.toLocaleString('de-DE')} Angebote · ${leads.total}${leads.capped ? '+' : ''} Leads · live aus Reonic` : 'Reonic-Connector · Angebote, Teams & Leads'}
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
              <div className="flex gap-4">
                <KpiCard label="PIPELINE OFFEN" value={euro(p.pipelineValueOpen)} sub={`${p.open} offene Angebote`} />
                <KpiCard label="GEWONNEN (WERT)" value={euro(p.wonValue)} sub={`${p.won} Abschlüsse`} valueColor="text-success" />
                <KpiCard label="ABSCHLUSSQUOTE" value={`${closeRate}%`} sub={`${p.won} gewonnen · ${p.lost} verloren`} valueColor={closeRate >= 30 ? 'text-success' : 'text-fg'} />
                <KpiCard label="LEADS" value={`${leads.total.toLocaleString('de-DE')}${leads.capped ? '+' : ''}`} sub="Kontakte im CRM" />
              </div>

              {/* Team + Verkäufer Performance */}
              <div className="flex gap-4 items-start">
                <StatTable title="Top Teams" rows={p.byTeam} />
                <StatTable title="Top Verkäufer" rows={p.bySeller} />
              </div>

              {/* Funnel + Lead sources */}
              <div className="flex gap-4 items-start">
                <Card className="flex-1 min-w-0 p-5 flex flex-col gap-3">
                  <h3 className="font-semibold text-[13px] text-fg">Status-Funnel</h3>
                  {p.byStatus.map((s) => (
                    <div key={s.status} className="flex items-center gap-3">
                      <span className="text-xs text-fg2 w-[160px] truncate" title={s.status}>{s.status}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / maxStatus) * 100}%` }} /></div>
                      <span className="text-xs font-medium text-fg w-8 text-right">{s.count}</span>
                    </div>
                  ))}
                  <div className="border-t border-line pt-3 flex flex-wrap gap-2">
                    {p.byType.map((t) => <Tag key={t.type} label={`${t.type}: ${t.count}`} tone="neutral" />)}
                  </div>
                </Card>

                <Card className="flex-1 min-w-0 p-5 flex flex-col gap-3">
                  <h3 className="font-semibold text-[13px] text-fg">Lead-Quellen</h3>
                  {leads.bySource.slice(0, 8).map((s) => (
                    <div key={s.source} className="flex items-center gap-3">
                      <span className="text-xs text-fg2 w-[160px] truncate" title={s.source}>{s.source}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden"><div className="h-full rounded-full bg-success" style={{ width: `${(s.count / maxSource) * 100}%` }} /></div>
                      <span className="text-xs font-medium text-fg w-8 text-right">{s.count}</span>
                    </div>
                  ))}
                </Card>
              </div>

              {/* Recent offers */}
              <Card className="overflow-hidden">
                <div className="h-13 px-5 border-b border-line flex items-center" style={{ height: 52 }}>
                  <h3 className="font-semibold text-sm text-fg">Neueste Angebote</h3>
                  <span className="ml-auto"><Pill label="LIVE" tone="success" /></span>
                </div>
                <div className="grid grid-cols-[1fr_160px_130px_120px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                  <span>ANGEBOT / KUNDE</span><span>STATUS</span><span>STATE</span><span>WERT</span>
                </div>
                {p.recent.map((o, i) => (
                  <div key={o.id} className={`grid grid-cols-[1fr_160px_130px_120px] min-h-[48px] items-center px-5 py-2 hover:bg-surface-2/40 transition-colors ${i < p.recent.length - 1 ? 'border-b border-line' : ''}`}>
                    <div className="flex flex-col min-w-0 pr-3"><span className="text-[13px] font-medium text-fg truncate">{o.name}</span><span className="text-[11px] text-fg3 truncate">{o.customer}</span></div>
                    <span className="text-[11px] text-fg2 truncate pr-2">{o.status}</span>
                    <div><Pill label={stateLabel[o.state] ?? o.state} tone={stateTone[o.state] ?? 'neutral'} /></div>
                    <span className="text-[13px] font-medium text-fg">{euro(o.value)}</span>
                  </div>
                ))}
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
}
