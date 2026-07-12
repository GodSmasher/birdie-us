import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader } from '@/components/ui';
import {
  repKpis, revMonths, revVals, donutLegend, pipeStages, stageValues, usd,
  pipeBgColors, crewRoster, icTurnData,
} from '../crm-data';

export const metadata = { title: 'Reports' };

export default function ReportsPage() {
  const sv = stageValues();
  const maxStage = Math.max(...sv);
  const crewHours = [32, 28, 36, 24, 18, 30];
  const crew6 = crewRoster.slice(0, 6);

  /* Revenue line chart helpers */
  const chartW = 560;
  const chartH = 200;
  const padL = 48;
  const padR = 16;
  const padT = 20;
  const padB = 32;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const minV = 60;
  const maxV = 140;
  const range = maxV - minV;

  function cx(i: number) { return padL + (i / (revMonths.length - 1)) * plotW; }
  function cy(v: number) { return padT + plotH - ((v - minV) / range) * plotH; }

  const polyPoints = revVals.map((v, i) => `${cx(i)},${cy(v)}`).join(' ');
  const areaPoints = `${cx(0)},${padT + plotH} ${polyPoints} ${cx(revVals.length - 1)},${padT + plotH}`;
  const goalY = cy(115);

  /* Grid lines */
  const gridVals = [80, 100, 120, 140];

  return (
    <>
      <CrmSidebar active="reports" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Reports" subtitle="Performance overview · this month" />
        <div className="flex-1 px-8 py-6 overflow-y-auto">

          {/* Date range tabs */}
          <div className="flex gap-1 mb-6">
            {['This Week', 'This Month', 'This Quarter', 'Custom'].map(tab => (
              <span
                key={tab}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  tab === 'This Month'
                    ? 'bg-surface-2 text-fg'
                    : 'text-fg3 hover:text-fg hover:bg-surface'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {repKpis.map(k => (
              <div key={k.k} className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
                <div className="flex items-center">
                  <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{k.k}</span>
                  <span className="ml-auto text-[10px] font-semibold px-[7px] py-px rounded-full bg-success-bg text-success">
                    {k.d}
                  </span>
                </div>
                <span className="font-semibold text-[28px] leading-none tracking-tightest text-fg">{k.v}</span>
              </div>
            ))}
          </div>

          {/* 2-column chart grid */}
          <div className="grid grid-cols-2 gap-4">

            {/* Revenue chart */}
            <Card className="overflow-hidden">
              <CardHeader title="Revenue" right={<span className="text-xs text-fg3">6-month trend</span>} />
              <div className="p-5">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" role="img" aria-label="Revenue line chart">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FACC15" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {gridVals.map(v => (
                    <g key={v}>
                      <line x1={padL} y1={cy(v)} x2={chartW - padR} y2={cy(v)} stroke="currentColor" className="text-line" strokeWidth="1" />
                      <text x={padL - 8} y={cy(v) + 4} textAnchor="end" className="text-fg3" fill="currentColor" fontSize="10">${v}K</text>
                    </g>
                  ))}

                  {/* Goal line */}
                  <line x1={padL} y1={goalY} x2={chartW - padR} y2={goalY} stroke="#FACC15" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
                  <text x={chartW - padR + 4} y={goalY + 3} fontSize="9" fill="#FACC15" opacity="0.7">$115K goal</text>

                  {/* Fill area */}
                  <polygon points={areaPoints} fill="url(#revGrad)" />

                  {/* Line */}
                  <polyline points={polyPoints} fill="none" stroke="#FACC15" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                  {/* Dots */}
                  {revVals.map((v, i) => (
                    <circle key={i} cx={cx(i)} cy={cy(v)} r="3.5" fill="#FACC15" />
                  ))}

                  {/* Month labels */}
                  {revMonths.map((m, i) => (
                    <text key={m} x={cx(i)} y={chartH - 6} textAnchor="middle" className="text-fg3" fill="currentColor" fontSize="11">{m}</text>
                  ))}
                </svg>
              </div>
            </Card>

            {/* Lead sources donut */}
            <Card className="overflow-hidden">
              <CardHeader title="Lead Sources" right={<span className="text-xs text-fg3">247 total leads</span>} />
              <div className="p-5 flex flex-col items-center gap-4">
                <div className="relative w-[160px] h-[160px]">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: 'conic-gradient(#FACC15 0% 42%, var(--color-info) 42% 70%, var(--color-purple) 70% 88%, var(--color-success) 88% 100%)',
                    }}
                  />
                  <div className="absolute inset-[30px] rounded-full bg-surface flex items-center justify-center">
                    <span className="font-semibold text-2xl text-fg">247</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                  {donutLegend.map(d => (
                    <div key={d.l} className="flex items-center gap-1.5 text-xs text-fg2">
                      <span className={`w-2.5 h-2.5 rounded-full ${d.c}`} />
                      <span>{d.l}</span>
                      <span className="text-fg3">{d.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Pipeline by stage */}
            <Card className="overflow-hidden">
              <CardHeader title="Pipeline by Stage" right={<span className="text-xs text-fg3">{usd(sv.reduce((a, b) => a + b, 0))} total</span>} />
              <div className="p-5 flex flex-col gap-3">
                {pipeStages.map((stage, i) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-[110px] text-xs text-fg2 shrink-0 truncate">{stage}</span>
                    <div className="flex-1 h-5 bg-surface-2 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${pipeBgColors[i]}`}
                        style={{ width: maxStage > 0 ? `${(sv[i] / maxStage) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="w-[56px] text-right text-xs text-fg font-medium shrink-0">{usd(sv[i])}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Crew utilization */}
            <Card className="overflow-hidden">
              <CardHeader title="Crew Utilization" right={<span className="text-xs text-fg3">40h capacity</span>} />
              <div className="p-5 flex flex-col gap-3">
                {crew6.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-[110px] text-xs text-fg2 shrink-0 truncate">{c.name}</span>
                    <div className="flex-1 h-5 bg-surface-2 rounded overflow-hidden">
                      <div
                        className="h-full rounded bg-accent"
                        style={{ width: `${(crewHours[i] / 40) * 100}%` }}
                      />
                    </div>
                    <span className="w-[42px] text-right text-xs text-fg font-medium shrink-0">{crewHours[i]}h</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* IC turnaround table */}
            <Card className="overflow-hidden col-span-2">
              <CardHeader title="IC Turnaround by Utility" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-line text-fg3">
                      <th className="text-left font-medium px-5 py-3 tracking-[0.12em]">UTILITY</th>
                      <th className="text-left font-medium px-5 py-3 tracking-[0.12em]">AVG</th>
                      <th className="text-left font-medium px-5 py-3 tracking-[0.12em]">APPS</th>
                      <th className="text-left font-medium px-5 py-3 tracking-[0.12em]">ON-TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {icTurnData.map(row => (
                      <tr key={row.u} className="border-b border-line last:border-0 hover:bg-surface-2 transition-colors">
                        <td className="px-5 py-3 text-fg font-medium">{row.u}</td>
                        <td className="px-5 py-3 text-fg2">{row.d}</td>
                        <td className="px-5 py-3 text-fg2">{row.n}</td>
                        <td className="px-5 py-3 text-fg2">{row.r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </div>
      </main>
    </>
  );
}
