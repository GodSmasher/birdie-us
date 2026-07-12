'use client';

import { useState } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card } from '@/components/ui';
import {
  weekDays, crewRoster, schedGrid, schedSummary, unscheduledJobs, jobKindMap,
} from '../crm-data';
import type { JobKind } from '../crm-data';

export default function SchedulePage() {
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Week');

  return (
    <>
      <CrmSidebar active="schedule" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Schedule" subtitle="Crew dispatch · week of Jul 6" />
        <div className="flex-1 px-8 py-6 overflow-y-auto">

          {/* View toggle */}
          <div className="flex items-center gap-1 mb-5">
            {(['Day', 'Week', 'Month'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  view === v
                    ? 'bg-surface-2 text-fg'
                    : 'text-fg3 hover:text-fg hover:bg-surface'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Summary strip */}
          <div className="flex items-center gap-6 mb-5">
            {schedSummary.map(s => (
              <div key={s.l} className="flex items-center gap-1.5">
                <span className={`text-[18px] font-semibold ${s.c}`}>{s.v}</span>
                <span className="text-[11px] text-fg3">{s.l}</span>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="flex gap-5">

            {/* Left: Week grid */}
            <div className="flex-1 min-w-0">
              <Card className="overflow-hidden">
                {/* Header row */}
                <div className="grid" style={{ gridTemplateColumns: '120px repeat(5, 1fr)' }}>
                  <div className="min-h-[40px] border-b border-r border-line flex items-center px-3">
                    <span className="text-[10px] text-fg4 font-medium tracking-wider uppercase">Crew</span>
                  </div>
                  {weekDays.map(d => (
                    <div key={d} className="min-h-[40px] border-b border-r border-line last:border-r-0 flex items-center justify-center">
                      <span className="text-[11px] text-fg2 font-medium">{d}</span>
                    </div>
                  ))}
                </div>

                {/* Crew rows */}
                {schedGrid.map(row => (
                  <div key={row.crew} className="grid" style={{ gridTemplateColumns: '120px repeat(5, 1fr)' }}>
                    <div className="min-h-[60px] border-b border-r border-line flex items-center px-3">
                      <span className="text-[12px] font-medium text-fg">{row.crew}</span>
                    </div>
                    {row.cells.map((cell, ci) => (
                      <div
                        key={ci}
                        className="min-h-[60px] border-b border-r border-line last:border-r-0 p-1.5 flex items-start"
                      >
                        {cell && (
                          <div className={`${jobKindMap[cell.type].bg} rounded-lg p-2 w-full`}>
                            <span className={`text-[10px] font-semibold ${jobKindMap[cell.type].color} block`}>
                              {jobKindMap[cell.type].label}
                            </span>
                            <span className="text-[10px] text-fg2 block">{cell.cust}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            </div>

            {/* Right sidebar */}
            <div className="w-[260px] shrink-0 flex flex-col gap-4">

              {/* Crew roster */}
              <Card className="overflow-hidden">
                <div className="h-[44px] px-4 border-b border-line flex items-center">
                  <h3 className="text-[12px] font-semibold text-fg">Crew Roster</h3>
                  <span className="ml-auto text-[10px] text-fg3">{crewRoster.length} members</span>
                </div>
                <div className="flex flex-col">
                  {crewRoster.map(m => (
                    <div key={m.name} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-line last:border-b-0">
                      <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-fg2">{m.init}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-fg block">{m.name}</span>
                        <span className="text-[10px] text-fg3">{m.role} · {m.jobs} jobs</span>
                      </div>
                      {/* Availability toggle */}
                      <div
                        className={`w-8 h-[18px] rounded-full flex items-center px-[3px] shrink-0 transition-colors ${
                          m.avail ? 'bg-success justify-end' : 'bg-fg4 justify-start'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Unscheduled jobs */}
              <Card className="overflow-hidden">
                <div className="h-[44px] px-4 border-b border-line flex items-center">
                  <h3 className="text-[12px] font-semibold text-fg">Unscheduled</h3>
                  <span className="ml-auto text-[10px] text-fg3">{unscheduledJobs.length}</span>
                </div>
                <div className="flex flex-col">
                  {unscheduledJobs.map((j, i) => (
                    <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-line last:border-b-0">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${jobKindMap[j.type as JobKind].bg}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-semibold ${jobKindMap[j.type as JobKind].color} block`}>
                          {jobKindMap[j.type as JobKind].label}
                        </span>
                        <span className="text-[10px] text-fg2 block">{j.cust}</span>
                        <span className="text-[9px] text-fg4">{j.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
