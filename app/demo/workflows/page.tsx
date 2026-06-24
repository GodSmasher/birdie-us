'use client';

import { useState } from 'react';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill, Tag } from '@/components/ui';

interface WorkflowStep {
  name: string;
  type: 'bot' | 'human' | 'condition' | 'wait';
  description: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'paused';
  trigger: string;
  runsTotal: number;
  runsActive: number;
  avgDuration: string;
  lastRun: string;
  steps: WorkflowStep[];
}

const WORKFLOWS: Workflow[] = [
  {
    id: 'WF-01', name: 'NES Interconnection — Full Cycle', description: 'End-to-end automation from application to Permission to Operate',
    status: 'active', trigger: 'Project moved to "Open" stage', runsTotal: 47, runsActive: 5, avgDuration: '18 days', lastRun: '2026-06-24T14:22:00',
    steps: [
      { name: 'Fill NES DG Application PDF', type: 'bot', description: 'AI Document Filler pulls project data into NES form' },
      { name: 'Attach single-line diagram', type: 'bot', description: 'Aurora Solar Sync fetches latest design' },
      { name: 'Review & approve application', type: 'human', description: 'Installer reviews filled form before submission' },
      { name: 'Email to NES', type: 'bot', description: 'NES Bot sends to nesrenewables@nespower.com' },
      { name: 'Wait for NES response', type: 'wait', description: 'Monitor inbox — 15-day follow-up if no response' },
      { name: 'NES approved?', type: 'condition', description: 'Branch: approved → continue, rejected → notify + manual review' },
      { name: 'File Metro Nashville permit', type: 'bot', description: 'AI Document Filler prepares building permit application' },
      { name: 'Schedule NES inspection', type: 'human', description: 'Coordinator books inspection date with NES' },
      { name: 'Run NEC 690 + IEEE 1547 check', type: 'bot', description: 'Compliance bots validate system before inspection' },
      { name: 'Enroll in TVA DPP', type: 'bot', description: 'Register on green.mytva.com, upload interconnection agreement' },
      { name: 'Generate IRA §48 docs', type: 'bot', description: 'IRA Tracker creates tax credit documentation' },
      { name: 'Mark PTO complete', type: 'bot', description: 'Update project status, notify customer' },
    ],
  },
  {
    id: 'WF-02', name: 'New Lead Qualification', description: 'Automatically qualify and route new leads from all sources',
    status: 'active', trigger: 'New lead created (SalesRabbit, Google Ads, Referral, D2D)', runsTotal: 89, runsActive: 3, avgDuration: '2 hours', lastRun: '2026-06-24T15:00:00',
    steps: [
      { name: 'Enrich lead data', type: 'bot', description: 'Pull address, roof data, utility territory from public records' },
      { name: 'Check NES service territory', type: 'bot', description: 'Verify address is in NES/TVA territory' },
      { name: 'Estimate system size', type: 'bot', description: 'Aurora Solar quick estimate based on roof area + orientation' },
      { name: 'Score lead', type: 'bot', description: 'Calculate lead score: roof age, shade, electricity bill, source quality' },
      { name: 'Score > 70?', type: 'condition', description: 'High-score → fast track, low-score → nurture sequence' },
      { name: 'Assign to sales rep', type: 'bot', description: 'Round-robin between Marcus Cole and Sarah Mitchell' },
      { name: 'Send intro email', type: 'bot', description: 'Personalized email with estimated savings + IRA credit info' },
      { name: 'Schedule follow-up', type: 'bot', description: 'Create task for rep — call within 24 hours' },
    ],
  },
  {
    id: 'WF-03', name: 'Installation Day Checklist', description: 'Ensures all pre-install requirements are met and coordinates crew dispatch',
    status: 'active', trigger: '24 hours before scheduled install date', runsTotal: 23, runsActive: 2, avgDuration: '18 hours', lastRun: '2026-06-23T16:00:00',
    steps: [
      { name: 'Verify permit status', type: 'bot', description: 'Check Metro Nashville permit is approved and on-site' },
      { name: 'Confirm equipment delivery', type: 'bot', description: 'Verify panels, inverter, racking are at warehouse' },
      { name: 'Run pre-install compliance', type: 'bot', description: 'NEC 690 + IEEE 1547 final check on design' },
      { name: 'All clear?', type: 'condition', description: 'Missing items → alert coordinator, all good → proceed' },
      { name: 'Assign crew + vehicle', type: 'human', description: 'Dispatcher assigns crew and loads truck' },
      { name: 'Send customer confirmation', type: 'bot', description: 'SMS + email with crew arrival time and what to expect' },
      { name: 'Generate install packet', type: 'bot', description: 'Print permit, design, safety docs, customer sign-off sheet' },
      { name: 'Post-install photo upload', type: 'human', description: 'Crew uploads photos for NES inspection file' },
    ],
  },
  {
    id: 'WF-04', name: 'Post-Install NES Inspection', description: 'Coordinates NES inspection scheduling and follow-up after installation',
    status: 'active', trigger: 'Installation marked complete', runsTotal: 15, runsActive: 1, avgDuration: '5 days', lastRun: '2026-06-22T09:00:00',
    steps: [
      { name: 'Generate inspection package', type: 'bot', description: 'Compile as-built, photos, test results, compliance certs' },
      { name: 'Request NES inspection', type: 'bot', description: 'Email NES with inspection request + package' },
      { name: 'Wait for inspection date', type: 'wait', description: 'Monitor for NES response — follow up after 5 business days' },
      { name: 'Prep customer for inspection', type: 'bot', description: 'Send customer what to expect, ensure panel access' },
      { name: 'Inspection passed?', type: 'condition', description: 'Pass → PTO, fail → generate correction list' },
      { name: 'Submit PTO request', type: 'bot', description: 'Request Permission to Operate from NES' },
    ],
  },
  {
    id: 'WF-05', name: 'Monthly Performance Report', description: 'Generate and send production reports for all installed systems',
    status: 'draft', trigger: '1st of each month', runsTotal: 0, runsActive: 0, avgDuration: '—', lastRun: '—',
    steps: [
      { name: 'Pull Enphase production data', type: 'bot', description: 'Aggregate daily kWh from Enlighten API' },
      { name: 'Compare vs Aurora estimate', type: 'bot', description: 'Calculate actual/expected ratio per system' },
      { name: 'Underperformance > 15%?', type: 'condition', description: 'Flag systems needing maintenance review' },
      { name: 'Generate customer report PDF', type: 'bot', description: 'Branded report with charts, savings, carbon offset' },
      { name: 'Email report to customer', type: 'bot', description: 'Personalized email with PDF attachment' },
    ],
  },
];

const STATUS_TONE: Record<string, 'success' | 'warning' | 'neutral'> = { active: 'success', draft: 'neutral', paused: 'warning' };
const STEP_ICON: Record<string, string> = { bot: '⚙', human: '👤', condition: '◇', wait: '⏳' };
const STEP_TONE: Record<string, 'accent' | 'info' | 'warning' | 'neutral'> = { bot: 'accent', human: 'info', condition: 'warning', wait: 'neutral' };

export default function WorkflowsPage() {
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);

  return (
    <>
      <DemoSidebar active="workflows" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar title="Workflows" subtitle="ReNew Solar Solutions · Automation orchestration · 5 workflows" />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-6 pt-5 pb-3 shrink-0">
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">ACTIVE</span>
                <span className="text-[28px] font-semibold text-success leading-none">{WORKFLOWS.filter(w => w.status === 'active').length}</span>
                <span className="text-[11px] text-fg3">workflows running</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">IN PROGRESS</span>
                <span className="text-[28px] font-semibold text-accent leading-none">{WORKFLOWS.reduce((a, w) => a + w.runsActive, 0)}</span>
                <span className="text-[11px] text-fg3">active runs</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">COMPLETED</span>
                <span className="text-[28px] font-semibold text-fg leading-none">{WORKFLOWS.reduce((a, w) => a + w.runsTotal, 0)}</span>
                <span className="text-[11px] text-fg3">total runs</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">TOTAL STEPS</span>
                <span className="text-[28px] font-semibold text-fg leading-none">{WORKFLOWS.reduce((a, w) => a + w.steps.length, 0)}</span>
                <span className="text-[11px] text-fg3">automated actions</span>
              </Card>
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-3">
            {WORKFLOWS.map(wf => (
              <Card
                key={wf.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedWf?.id === wf.id ? 'border-accent bg-accent/5' : 'hover:border-line-2'
                }`}
                onClick={() => setSelectedWf(selectedWf?.id === wf.id ? null : wf)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-fg">{wf.name}</h3>
                    <Pill label={wf.status.toUpperCase()} tone={STATUS_TONE[wf.status]} dot={false} />
                  </div>
                  <span className="text-[10px] text-fg3">{wf.id}</span>
                </div>
                <p className="text-[10px] text-fg3 mb-3">{wf.description}</p>
                <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                  {wf.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${
                        s.type === 'bot' ? 'bg-accent/10 text-accent' :
                        s.type === 'human' ? 'bg-info/10 text-info' :
                        s.type === 'condition' ? 'bg-warning/10 text-warning' :
                        'bg-surface-3 text-fg3'
                      }`}>{STEP_ICON[s.type]}</span>
                      {i < wf.steps.length - 1 && <span className="text-fg4 text-[8px]">→</span>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="text-fg2">Trigger: <span className="text-fg font-medium">{wf.trigger}</span></span>
                  <span className="text-fg4">·</span>
                  <span className="text-fg2">{wf.steps.length} steps</span>
                  <span className="text-fg4">·</span>
                  <span className="text-fg2">Avg: {wf.avgDuration}</span>
                  {wf.runsActive > 0 && <><span className="text-fg4">·</span><span className="text-accent font-medium">{wf.runsActive} active</span></>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {selectedWf && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelectedWf(null)} />
            <div className="fixed top-0 right-0 h-full w-[520px] bg-bg border-l border-line shadow-2xl z-40 flex flex-col overflow-y-auto">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-fg">{selectedWf.name}</h2>
                    <Pill label={selectedWf.status.toUpperCase()} tone={STATUS_TONE[selectedWf.status]} dot={false} />
                  </div>
                  <p className="text-[11px] text-fg3 mt-0.5">{selectedWf.id} · {selectedWf.steps.length} steps · Avg {selectedWf.avgDuration}</p>
                </div>
                <button onClick={() => setSelectedWf(null)} className="text-fg3 hover:text-fg text-[18px] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface">×</button>
              </div>

              <div className="px-5 py-3 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-1">Trigger</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-accent">⚡</span>
                  <span className="text-[11px] text-fg">{selectedWf.trigger}</span>
                </div>
              </div>

              <div className="px-5 py-3 border-b border-line grid grid-cols-3 gap-3 shrink-0">
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Active Runs</p>
                  <p className="text-[16px] font-bold text-accent">{selectedWf.runsActive}</p>
                </div>
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Total Runs</p>
                  <p className="text-[16px] font-bold text-fg">{selectedWf.runsTotal}</p>
                </div>
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Avg Duration</p>
                  <p className="text-[16px] font-bold text-fg">{selectedWf.avgDuration}</p>
                </div>
              </div>

              <div className="px-5 py-4 flex-1">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-3">Workflow Steps</p>
                <div className="flex flex-col">
                  {selectedWf.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] shrink-0 ${
                          s.type === 'bot' ? 'bg-accent/10 text-accent' :
                          s.type === 'human' ? 'bg-info/10 text-info' :
                          s.type === 'condition' ? 'bg-warning/10 text-warning' :
                          'bg-surface-3 text-fg3'
                        }`}>{STEP_ICON[s.type]}</div>
                        {i < selectedWf.steps.length - 1 && <div className="w-px h-6 bg-line" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-fg">{s.name}</span>
                          <Tag label={s.type.toUpperCase()} tone={STEP_TONE[s.type]} />
                        </div>
                        <p className="text-[10px] text-fg3 leading-[14px] mt-0.5">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 border-t border-line shrink-0">
                <div className="flex gap-1.5">
                  <Tag label={`${selectedWf.steps.filter(s => s.type === 'bot').length} Bot`} tone="accent" />
                  <Tag label={`${selectedWf.steps.filter(s => s.type === 'human').length} Human`} tone="info" />
                  <Tag label={`${selectedWf.steps.filter(s => s.type === 'condition').length} Condition`} tone="warning" />
                  <Tag label={`${selectedWf.steps.filter(s => s.type === 'wait').length} Wait`} tone="neutral" />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
