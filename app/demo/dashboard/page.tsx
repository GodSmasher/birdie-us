import Link from 'next/link';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import {
  dashKpis, dashAttention, dashToday, dashActivity, dashIcStrip,
  jobKindMap, dealsByStage, stageValues, usd, pipeDotColors, pipeStages,
} from '../crm-data';

export const metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  const sv = stageValues();
  const total = sv.slice(0, 5).reduce((a, b) => a + b, 0);
  const cols = dealsByStage();

  return (
    <>
      <CrmSidebar active="dashboard" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Good morning, Sarah" subtitle="Wednesday, July 8 · here's what needs you today" />
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {dashKpis.map(k => (
              <Link key={k.k} href={k.link} className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-2 hover:border-line-2 transition-colors">
                <div className="flex items-center">
                  <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.k}</span>
                  <span className={`ml-auto text-[10px] font-semibold px-[7px] py-px rounded-full ${k.up ? 'bg-success-bg text-success' : 'bg-error-bg text-error'}`}>
                    {k.d}
                  </span>
                </div>
                <span className="font-semibold text-[28px] leading-none tracking-tightest text-fg">{k.v}</span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-4">
            {/* Needs your attention */}
            <Card className="overflow-hidden">
              <div className="h-[52px] px-5 border-b border-line flex items-center">
                <h3 className="font-semibold text-sm text-fg">Needs your attention</h3>
                <span className="ml-auto"><Pill label={`${dashAttention.length}`} tone="error" dot={false} /></span>
              </div>
              <div className="flex flex-col">
                {dashAttention.map((a, i) => (
                  <Link key={i} href={a.link} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors ${i < dashAttention.length - 1 ? 'border-b border-line' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${a.tone === 'error' ? 'bg-error-bg text-error' : 'bg-warning-bg text-warning'}`}>
                      {a.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-fg2 leading-[18px]">{a.text}</p>
                      <p className="text-[10px] text-fg3 mt-0.5">{a.meta}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Today's schedule */}
            <Card className="overflow-hidden">
              <div className="h-[52px] px-5 border-b border-line flex items-center">
                <h3 className="font-semibold text-sm text-fg">Today&apos;s schedule</h3>
                <Link href="/demo/schedule" className="ml-auto text-[11px] text-accent font-medium">View all →</Link>
              </div>
              <div className="flex flex-col">
                {dashToday.map((t, i) => {
                  const jk = jobKindMap[t.kind];
                  return (
                    <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i < dashToday.length - 1 ? 'border-b border-line' : ''}`}>
                      <span className="text-[11px] text-fg3 w-11 shrink-0">{t.time}</span>
                      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] ${jk.bg} ${jk.color}`}>
                        {t.kind === 'install' ? '⚡' : t.kind === 'visit' ? '◎' : t.kind === 'inspect' ? '◔' : '⚙'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[12px] font-medium text-fg">{t.label} — {t.cust}</span>
                        <p className="text-[10px] text-fg3">{t.who}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Interconnection status */}
            <Card className="overflow-hidden">
              <div className="h-[52px] px-5 border-b border-line flex items-center">
                <h3 className="font-semibold text-sm text-fg">Interconnection</h3>
                <Link href="/demo/interconnection" className="ml-auto text-[11px] text-accent font-medium">Details →</Link>
              </div>
              <div className="flex items-center gap-5 px-5 py-4">
                {dashIcStrip.map(s => (
                  <div key={s.l} className="text-center">
                    <div className={`text-[22px] font-bold ${s.c}`}>{s.n}</div>
                    <div className="text-[10px] text-fg4 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pipeline donut */}
            <Card className="overflow-hidden">
              <div className="h-[52px] px-5 border-b border-line flex items-center">
                <h3 className="font-semibold text-sm text-fg">Pipeline</h3>
                <Link href="/demo/pipeline" className="ml-auto text-[11px] text-accent font-medium">Details →</Link>
              </div>
              <div className="flex items-center gap-6 px-5 py-4">
                <div className="w-[100px] h-[100px] rounded-full shrink-0 relative"
                  style={{
                    background: `conic-gradient(${
                      pipeStages.slice(0, 5).map((_, i) => {
                        const pct = (sv[i] / total) * 100;
                        const start = sv.slice(0, i).reduce((a, b) => a + b, 0) / total * 100;
                        const colors = ['#6B7280', '#60A5FA', '#A78BFA', '#FACC15', '#FBBF24'];
                        return `${colors[i]} ${start.toFixed(1)}% ${(start + pct).toFixed(1)}%`;
                      }).join(', ')
                    })`,
                  }}
                >
                  <div className="absolute inset-3 rounded-full bg-surface flex items-center justify-center">
                    <span className="text-[16px] font-bold text-fg">{usd(total)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {pipeStages.slice(0, 5).map((name, i) => (
                    <div key={name} className="flex items-center gap-2 text-[11px]">
                      <span className={`w-2 h-2 rounded-full ${['bg-fg3','bg-info','bg-purple','bg-accent','bg-warning'][i]}`} />
                      <span className="text-fg2 flex-1">{name}</span>
                      <span className="text-fg font-medium">{cols[i].deals.length}</span>
                      <span className="text-fg3 w-12 text-right">{usd(sv[i])}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recent activity */}
            <Card className="col-span-2 overflow-hidden">
              <div className="h-[52px] px-5 border-b border-line flex items-center">
                <h3 className="font-semibold text-sm text-fg">Recent activity</h3>
              </div>
              <div className="flex flex-col">
                {dashActivity.map((a, i) => (
                  <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i < dashActivity.length - 1 ? 'border-b border-line' : ''}`}>
                    <div className={`shrink-0 w-2 h-2 rounded-full ${a.color.replace('text-', 'bg-')}`} />
                    <span className="text-[12px] text-fg2 flex-1">{a.text}</span>
                    <span className="text-[10px] text-fg4">{a.src}</span>
                    <span className="text-[10px] text-fg3 w-8 text-right">{a.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
