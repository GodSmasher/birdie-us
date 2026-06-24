'use client';

import { useState } from 'react';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill, Tag } from '@/components/ui';

interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'live' | 'setup' | 'paused';
  type: 'document' | 'compliance' | 'monitoring' | 'filing' | 'finance';
  runsToday: number;
  runsTotal: number;
  lastRun: string;
  successRate: number;
  triggers: string[];
  actions: string[];
  logs: { time: string; event: string; status: 'success' | 'error' | 'info' }[];
}

const BOTS: Bot[] = [
  {
    id: 'B-01', name: 'NES Interconnection Bot', description: 'Fills NES DG interconnection PDF, emails to nesrenewables@nespower.com, tracks response',
    status: 'live', type: 'filing', runsToday: 3, runsTotal: 47, lastRun: '2026-06-24T14:22:00', successRate: 98,
    triggers: ['New project reaches "Submitted" stage', 'Manual trigger from Interconnection page'],
    actions: ['Fill NES DG Application PDF with project data', 'Attach single-line diagram + site plan', 'Email to nesrenewables@nespower.com', 'Log submission in project timeline', 'Set 15-day follow-up reminder'],
    logs: [
      { time: '14:22', event: 'Submitted NES application for Clark Residence — NES-2026-0412', status: 'success' },
      { time: '11:05', event: 'Submitted NES application for Rivera — NES-2026-0389', status: 'success' },
      { time: '09:30', event: 'Submitted NES application for Thompson — NES-2026-0401', status: 'success' },
    ],
  },
  {
    id: 'B-02', name: 'AI Document Filler', description: 'Auto-fills PDF forms using project data — permits, applications, interconnection docs',
    status: 'live', type: 'document', runsToday: 8, runsTotal: 156, lastRun: '2026-06-24T15:10:00', successRate: 99,
    triggers: ['Document template assigned to project', 'Workflow step requires document'],
    actions: ['Parse PDF form fields', 'Map project data to form fields', 'Fill and flatten PDF', 'Attach to project record', 'Notify assignee for review'],
    logs: [
      { time: '15:10', event: 'Filled Metro Nashville building permit for Washington', status: 'success' },
      { time: '14:45', event: 'Filled NES DG application for Clark', status: 'success' },
      { time: '13:20', event: 'Filled TVA DPP enrollment form for Rivera', status: 'success' },
      { time: '11:30', event: 'Filled electrical permit for Thompson', status: 'success' },
    ],
  },
  {
    id: 'B-03', name: 'NEC 690 Compliance Check', description: 'Validates system designs against NEC 690 — rapid shutdown, conductor sizing, overcurrent protection',
    status: 'live', type: 'compliance', runsToday: 4, runsTotal: 89, lastRun: '2026-06-24T13:45:00', successRate: 100,
    triggers: ['System design finalized', 'Equipment change on project'],
    actions: ['Check rapid shutdown compliance (690.12)', 'Verify conductor sizing (690.31)', 'Validate overcurrent protection (690.9)', 'Check ground-fault protection (690.5)', 'Generate compliance report PDF'],
    logs: [
      { time: '13:45', event: 'Brooks 11.4 kW — PASS — all NEC 690 checks', status: 'success' },
      { time: '11:15', event: 'Martinez 10.2 kW — PASS — rapid shutdown verified', status: 'success' },
      { time: '09:00', event: 'Washington 9.0 kW — PASS — conductor sizing OK', status: 'success' },
      { time: '08:30', event: 'Foster 5.6 kW — PASS — ground-fault protection verified', status: 'success' },
    ],
  },
  {
    id: 'B-04', name: 'IEEE 1547 Validator', description: 'Checks inverter settings against IEEE 1547-2018 — anti-islanding, voltage/frequency ride-through',
    status: 'live', type: 'compliance', runsToday: 4, runsTotal: 89, lastRun: '2026-06-24T13:45:00', successRate: 100,
    triggers: ['Inverter model selected', 'NEC 690 check passes'],
    actions: ['Verify anti-islanding response time', 'Check voltage ride-through settings (Cat II)', 'Validate frequency ride-through curves', 'Verify power quality (THD < 5%)', 'Append to compliance report'],
    logs: [
      { time: '13:46', event: 'Brooks — Enphase IQ8M — IEEE 1547 PASS', status: 'success' },
      { time: '11:16', event: 'Martinez — SolarEdge SE10000H — IEEE 1547 PASS', status: 'success' },
      { time: '09:01', event: 'Washington — Enphase IQ8A — IEEE 1547 PASS', status: 'success' },
    ],
  },
  {
    id: 'B-05', name: 'IRA Incentive Tracker', description: 'Tracks IRA §48 investment tax credit eligibility and generates documentation for filing',
    status: 'live', type: 'finance', runsToday: 2, runsTotal: 34, lastRun: '2026-06-24T10:00:00', successRate: 100,
    triggers: ['Project reaches "Closed Won"', 'Installation completed'],
    actions: ['Calculate 30% ITC amount', 'Verify domestic content bonus eligibility', 'Generate IRS Form 3468 worksheet', 'Create customer tax credit summary PDF', 'Log in project financial record'],
    logs: [
      { time: '10:00', event: 'Thompson $25,200 → ITC $7,560 — docs generated', status: 'success' },
      { time: '09:15', event: 'Clark $28,800 → ITC $8,640 — docs generated', status: 'success' },
    ],
  },
  {
    id: 'B-06', name: 'Aurora Solar Sync', description: 'Syncs project designs from Aurora Solar — system specs, shade analysis, production estimates',
    status: 'live', type: 'monitoring', runsToday: 6, runsTotal: 112, lastRun: '2026-06-24T15:30:00', successRate: 96,
    triggers: ['Every 30 minutes', 'Manual sync from project page'],
    actions: ['Pull latest design from Aurora API', 'Update system kW, panel count, inverter', 'Sync shade analysis report', 'Update production estimate (kWh/yr)', 'Flag design changes for review'],
    logs: [
      { time: '15:30', event: 'Synced 12 projects — 2 design updates detected', status: 'success' },
      { time: '15:00', event: 'Synced 12 projects — no changes', status: 'info' },
      { time: '14:30', event: 'Synced 12 projects — Brooks redesign pulled', status: 'success' },
    ],
  },
  {
    id: 'B-07', name: 'Enphase Monitoring', description: 'Connects to Enphase Enlighten API for real-time production monitoring of installed systems',
    status: 'setup', type: 'monitoring', runsToday: 0, runsTotal: 0, lastRun: '—', successRate: 0,
    triggers: ['Every 15 minutes (after setup)'],
    actions: ['Pull production data from Enlighten', 'Compare actual vs estimated output', 'Alert on underperformance (>15% delta)', 'Generate monthly performance report'],
    logs: [
      { time: '—', event: 'Awaiting Enphase API credentials', status: 'info' },
    ],
  },
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'neutral'> = { live: 'success', setup: 'warning', paused: 'neutral' };
const TYPE_TONE: Record<string, 'accent' | 'info' | 'success' | 'warning' | 'purple'> = { document: 'accent', compliance: 'success', monitoring: 'info', filing: 'warning', finance: 'purple' };

export default function BotsPage() {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  const liveCount = BOTS.filter(b => b.status === 'live').length;
  const totalRuns = BOTS.reduce((a, b) => a + b.runsToday, 0);

  return (
    <>
      <DemoSidebar active="bots" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar title="Bots" subtitle="ReNew Solar Solutions · 7 bots configured · Automation Engine" />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-6 pt-5 pb-3 shrink-0">
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">BOTS LIVE</span>
                <span className="text-[28px] font-semibold text-success leading-none">{liveCount}</span>
                <span className="text-[11px] text-fg3">of {BOTS.length} configured</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">RUNS TODAY</span>
                <span className="text-[28px] font-semibold text-fg leading-none">{totalRuns}</span>
                <span className="text-[11px] text-fg3">across all bots</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">SUCCESS RATE</span>
                <span className="text-[28px] font-semibold text-success leading-none">98.7%</span>
                <span className="text-[11px] text-fg3">last 30 days</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">TIME SAVED</span>
                <span className="text-[28px] font-semibold text-accent leading-none">~14h</span>
                <span className="text-[11px] text-fg3">this week (estimated)</span>
              </Card>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {BOTS.map(bot => (
                <Card
                  key={bot.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedBot?.id === bot.id ? 'border-accent bg-accent/5' : 'hover:border-line-2'
                  }`}
                  onClick={() => setSelectedBot(selectedBot?.id === bot.id ? null : bot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bot.status === 'live' ? 'bg-success animate-pulse' : bot.status === 'setup' ? 'bg-warning' : 'bg-fg3'}`} />
                      <h3 className="text-[13px] font-semibold text-fg">{bot.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag label={bot.type.toUpperCase()} tone={TYPE_TONE[bot.type]} />
                      <Pill label={bot.status.toUpperCase()} tone={STATUS_TONE[bot.status]} dot={false} />
                    </div>
                  </div>
                  <p className="text-[10px] text-fg3 mb-3 leading-relaxed">{bot.description}</p>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="text-fg2"><span className="font-medium text-fg">{bot.runsToday}</span> runs today</span>
                    <span className="text-fg2"><span className="font-medium text-fg">{bot.runsTotal}</span> total</span>
                    {bot.successRate > 0 && <span className="text-success font-medium">{bot.successRate}% success</span>}
                    {bot.lastRun !== '—' && <span className="text-fg4 ml-auto">Last: {new Date(bot.lastRun).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {selectedBot && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelectedBot(null)} />
            <div className="fixed top-0 right-0 h-full w-[480px] bg-bg border-l border-line shadow-2xl z-40 flex flex-col overflow-y-auto">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedBot.status === 'live' ? 'bg-success animate-pulse' : 'bg-warning'}`} />
                    <h2 className="text-[14px] font-semibold text-fg">{selectedBot.name}</h2>
                    <Pill label={selectedBot.status.toUpperCase()} tone={STATUS_TONE[selectedBot.status]} dot={false} />
                  </div>
                  <p className="text-[11px] text-fg3 mt-0.5">{selectedBot.id} · {selectedBot.type}</p>
                </div>
                <button onClick={() => setSelectedBot(null)} className="text-fg3 hover:text-fg text-[18px] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface">×</button>
              </div>

              <div className="px-5 py-3 border-b border-line shrink-0">
                <p className="text-[11px] text-fg2 leading-relaxed">{selectedBot.description}</p>
              </div>

              <div className="px-5 py-3 border-b border-line grid grid-cols-3 gap-3 shrink-0">
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Today</p>
                  <p className="text-[16px] font-bold text-fg">{selectedBot.runsToday}</p>
                </div>
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Total</p>
                  <p className="text-[16px] font-bold text-fg">{selectedBot.runsTotal}</p>
                </div>
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Success</p>
                  <p className="text-[16px] font-bold text-success">{selectedBot.successRate}%</p>
                </div>
              </div>

              <div className="px-5 py-4 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-2">Triggers</p>
                <div className="flex flex-col gap-1.5">
                  {selectedBot.triggers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-accent">⚡</span>
                      <span className="text-[11px] text-fg">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-4 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-2">Actions</p>
                <div className="flex flex-col gap-1.5">
                  {selectedBot.actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] text-fg3 shrink-0 w-4 text-right">{i + 1}.</span>
                      <span className="text-[11px] text-fg">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-4 flex-1">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-2">Recent Activity</p>
                <div className="flex flex-col divide-y divide-line/50">
                  {selectedBot.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${log.status === 'success' ? 'bg-success' : log.status === 'error' ? 'bg-error' : 'bg-info'}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-fg">{log.event}</span>
                        <span className="text-[9px] text-fg4 ml-2">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
