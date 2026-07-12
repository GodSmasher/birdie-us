'use client';

import { useState } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { SlideDrawer } from '@/components/slide-drawer';
import { DealDetail } from '@/components/crm/deal-detail';
import {
  dealsByStage, stageValues, usd, pipeStages, pipeDotColors, pipeBgColors,
  heatColors, pipeSummary, forecast, deals, Deal,
} from '../crm-data';


export default function PipelinePage() {
  const [pipeView, setPipeView] = useState<'board' | 'table' | 'forecast'>('board');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const cols = dealsByStage();
  const sv = stageValues();
  const total = sv.slice(0, 5).reduce((a, b) => a + b, 0);

  return (
    <>
      <CrmSidebar active="pipeline" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Pipeline" subtitle="17 open deals · $486K weighted" />
        <div className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto space-y-6">

          {/* ── Summary row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {pipeSummary.map(s => (
              <Card key={s.k} className="p-5 flex flex-col gap-1.5">
                <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{s.k}</span>
                <span className="font-semibold text-[28px] leading-none tracking-tightest text-fg">{s.v}</span>
              </Card>
            ))}
          </div>

          {/* ── Funnel chart ── */}
          <Card className="p-5">
            <h3 className="font-semibold text-sm text-fg mb-4">Pipeline funnel</h3>
            <div className="flex flex-col gap-2">
              {pipeStages.slice(0, 5).map((stage, i) => {
                const pct = total > 0 ? Math.max((sv[i] / total) * 100, 6) : 6;
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-[110px] shrink-0 text-[11px] text-fg2 truncate">{stage}</span>
                    <div className="flex-1 h-7 bg-surface-2 rounded-md overflow-hidden">
                      <div
                        className={`h-full rounded-md flex items-center px-2.5 ${pipeBgColors[i]}`}
                        style={{ width: `${pct}%`, opacity: 0.25 }}
                      />
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pipeBgColors[i]}`} />
                    <span className="w-[70px] text-right text-[12px] font-medium text-fg">{usd(sv[i])}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── View toggle ── */}
          <div className="flex items-center gap-1 bg-surface border border-line rounded-lg p-1 w-fit">
            {(['board', 'table', 'forecast'] as const).map(v => (
              <button
                key={v}
                onClick={() => setPipeView(v)}
                className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium capitalize transition-colors ${
                  pipeView === v ? 'bg-surface-3 text-fg' : 'text-fg3 hover:text-fg2'
                }`}
              >
                {v === 'board' ? 'Board' : v === 'table' ? 'Table' : 'Forecast'}
              </button>
            ))}
          </div>

          {/* ── Board (kanban) view ── */}
          {pipeView === 'board' && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {cols.map((col, ci) => (
                <div key={col.name} className="min-w-[200px] w-[220px] shrink-0 bg-surface rounded-xl flex flex-col">
                  {/* Column header */}
                  <div className="px-3 py-3 flex items-center gap-2 border-b border-line">
                    <span className={`w-2 h-2 rounded-full ${pipeBgColors[ci]}`} />
                    <span className="text-[12px] font-semibold text-fg truncate">{col.name}</span>
                    <span className="ml-auto text-[10px] text-fg3 font-medium">{col.deals.length}</span>
                  </div>
                  {/* Cards */}
                  <div className="p-2 flex flex-col gap-2 flex-1">
                    {col.deals.map(d => (
                      <div
                        key={d.cust}
                        onClick={() => setSelectedDeal(d)}
                        className={`bg-surface-2 border border-line rounded-lg p-3 border-l-[3px] ${heatColors[d.heat]} cursor-pointer hover:border-line-2 transition-colors`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-[9px] font-semibold text-fg2 shrink-0">
                            {d.init}
                          </div>
                          <span className="text-[12px] font-medium text-fg truncate">{d.cust}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-fg3">
                          <span>{d.kw} kW</span>
                          <span>·</span>
                          <span className="font-medium text-fg2">{usd(d.value)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-fg3 mt-1">
                          <span>{d.days}d in stage</span>
                          <span className="ml-auto truncate">{d.rep}</span>
                        </div>
                      </div>
                    ))}
                    {col.deals.length === 0 && (
                      <div className="text-[11px] text-fg4 text-center py-6">No deals</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Table view ── */}
          {pipeView === 'table' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line">
                      {['CUSTOMER', 'STAGE', 'VALUE', 'SYSTEM', 'REP', 'AGE'].map(h => (
                        <th key={h} className="px-5 py-3 text-[10px] font-semibold text-fg3 tracking-[0.16em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map((d, i) => (
                      <tr key={d.cust} onClick={() => setSelectedDeal(d)} className={`border-b border-line hover:bg-surface transition-colors cursor-pointer ${i === deals.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-semibold text-fg2 shrink-0">
                              {d.init}
                            </div>
                            <span className="text-[13px] font-medium text-fg">{d.cust}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${pipeBgColors[d.stageIdx]}`} />
                            <span className="text-[12px] text-fg2">{pipeStages[d.stageIdx]}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[13px] font-medium text-fg">{usd(d.value)}</td>
                        <td className="px-5 py-3 text-[12px] text-fg2">{d.kw} kW</td>
                        <td className="px-5 py-3 text-[12px] text-fg2">{d.rep}</td>
                        <td className="px-5 py-3 text-[12px] text-fg3">{d.days}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── Forecast view ── */}
          {pipeView === 'forecast' && (
            <Card className="p-5">
              <h3 className="font-semibold text-sm text-fg mb-5">Revenue forecast · Jul — Dec</h3>
              <div className="flex items-end gap-3 h-[200px]">
                {forecast.map(f => (
                  <div key={f.m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[12px] font-medium text-fg">{f.v}</span>
                    <div
                      className="w-full bg-accent rounded-md"
                      style={{ height: f.h, opacity: 0.8 }}
                    />
                    <span className="text-[11px] text-fg3">{f.m}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      </main>

      <SlideDrawer
        open={selectedDeal !== null}
        onClose={() => setSelectedDeal(null)}
        title="Deal Details"
      >
        {selectedDeal && <DealDetail deal={selectedDeal} />}
      </SlideDrawer>
    </>
  );
}
