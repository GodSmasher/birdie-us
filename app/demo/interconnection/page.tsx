'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill, Tag } from '@/components/ui';

type Stage = 'open' | 'review' | 'approved' | 'signed' | 'submitted' | 'complete';
const STAGE_LABELS: Record<Stage, string> = {
  open: 'Open', review: 'In Review', approved: 'Approved', signed: 'Signed', submitted: 'Submitted', complete: 'Complete',
};
const STAGE_TONE: Record<Stage, 'neutral' | 'warning' | 'info' | 'accent' | 'success' | 'purple'> = {
  open: 'neutral', review: 'warning', approved: 'info', signed: 'accent', submitted: 'success', complete: 'purple',
};

interface Project {
  id: string;
  customer: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  utility: string;
  systemKw: number;
  modules: string;
  inverter: string;
  stage: Stage;
  applicationId?: string;
  meterNumber?: string;
  permitNumber?: string;
  inspectionDate?: string;
  necCompliant: boolean;
  ieeeCompliant: boolean;
  iraEligible: boolean;
  value: number;
  dueDate?: string;
  notes?: string;
}

const PROJECTS: Project[] = [
  {
    id: 'P-1001', customer: 'Rivera Family', address: '782 Oak Hill Rd', city: 'Nashville', state: 'TN', zip: '37204',
    utility: 'NES', systemKw: 11.2, modules: 'REC Alpha Pure-R 400W x28', inverter: 'Enphase IQ8M-72',
    stage: 'signed', applicationId: 'NES-2026-44182', meterNumber: 'MTR-882441', permitNumber: 'MN-2026-3318',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 28500, dueDate: '2026-06-27',
    notes: 'Signed docs need upload to NES portal before Jun 27',
  },
  {
    id: 'P-1002', customer: 'Martinez Residence', address: '4521 Elm Creek Dr', city: 'Franklin', state: 'TN', zip: '37067',
    utility: 'NES', systemKw: 8.8, modules: 'Q CELLS Q.PEAK DUO ML-G11S 440W x20', inverter: 'SolarEdge SE7600H',
    stage: 'review', applicationId: 'NES-2026-44290', permitNumber: 'MN-2026-4412',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 22100,
    notes: 'Metro Nashville permit pending since Jun 18',
  },
  {
    id: 'P-1003', customer: 'Thompson Solar', address: '1190 Sunset Ridge', city: 'Brentwood', state: 'TN', zip: '37027',
    utility: 'NES', systemKw: 14.4, modules: 'Canadian Solar HiKu7 CS7L-600MS x24', inverter: 'SMA Sunny Boy 7.7',
    stage: 'approved', applicationId: 'NES-2026-43891', meterNumber: 'MTR-771092', permitNumber: 'MN-2026-2987',
    inspectionDate: '2026-06-27', necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 35200,
    notes: 'NES approved — meter swap scheduled Jun 27',
  },
  {
    id: 'P-1004', customer: 'Chen Family', address: '305 Pecan Valley Ct', city: 'Hendersonville', state: 'TN', zip: '37075',
    utility: 'NES', systemKw: 9.6, modules: 'Silfab SIL-420-BG x24', inverter: 'Enphase IQ8A-72',
    stage: 'submitted', applicationId: 'NES-2026-44501', meterNumber: 'MTR-993210', permitNumber: 'MN-2026-4718',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 24800,
  },
  {
    id: 'P-1005', customer: 'Williams Residence', address: '8812 Magnolia Ln', city: 'Nashville', state: 'TN', zip: '37211',
    utility: 'NES', systemKw: 7.2, modules: 'LONGi Hi-MO 6 555W x13', inverter: 'Enphase IQ8M-72',
    stage: 'open', necCompliant: false, ieeeCompliant: false, iraEligible: true, value: 18500,
    notes: 'Awaiting site survey completion',
  },
  {
    id: 'P-1006', customer: 'Patel Solar Project', address: '2200 Murfreesboro Pike', city: 'Nashville', state: 'TN', zip: '37217',
    utility: 'NES', systemKw: 12.0, modules: 'Trina Vertex S+ TSM-445NEG9R.28 x27', inverter: 'SolarEdge SE10000H',
    stage: 'submitted', applicationId: 'NES-2026-43650', meterNumber: 'MTR-550318',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 31000,
  },
  {
    id: 'P-1007', customer: 'Davis Home', address: '4100 Hillsboro Pike', city: 'Nashville', state: 'TN', zip: '37215',
    utility: 'NES', systemKw: 6.4, modules: 'REC Alpha Pure-R 400W x16', inverter: 'Enphase IQ8A-72',
    stage: 'review', applicationId: 'NES-2026-44622',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 16200,
  },
  {
    id: 'P-1008', customer: 'Johnson Family', address: '955 Belmont Blvd', city: 'Nashville', state: 'TN', zip: '37212',
    utility: 'NES', systemKw: 10.8, modules: 'Canadian Solar HiKu7 CS7L-600MS x18', inverter: 'SMA Sunny Boy 10.0',
    stage: 'complete', applicationId: 'NES-2026-42100', meterNumber: 'MTR-441287',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 27500,
  },
  {
    id: 'P-1009', customer: 'Garcia Residence', address: '7730 Nolensville Pike', city: 'Nashville', state: 'TN', zip: '37211',
    utility: 'NES', systemKw: 8.0, modules: 'Q CELLS Q.PEAK DUO ML-G11S 440W x18', inverter: 'Enphase IQ8M-72',
    stage: 'open', necCompliant: false, ieeeCompliant: false, iraEligible: true, value: 20100,
  },
  {
    id: 'P-1010', customer: 'Anderson Solar', address: '3320 Lebanon Pike', city: 'Mt. Juliet', state: 'TN', zip: '37122',
    utility: 'NES', systemKw: 15.6, modules: 'LONGi Hi-MO 6 555W x28', inverter: 'SolarEdge SE11400H',
    stage: 'submitted', applicationId: 'NES-2026-44100', meterNumber: 'MTR-667482',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 38900,
  },
  {
    id: 'P-1011', customer: 'Kim Residence', address: '1450 Old Hickory Blvd', city: 'Nashville', state: 'TN', zip: '37209',
    utility: 'NES', systemKw: 9.2, modules: 'Silfab SIL-420-BG x22', inverter: 'Enphase IQ8A-72',
    stage: 'approved', applicationId: 'NES-2026-44320', meterNumber: 'MTR-882190',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 23400,
  },
  {
    id: 'P-1012', customer: 'Nelson Home', address: '6200 Charlotte Pike', city: 'Nashville', state: 'TN', zip: '37209',
    utility: 'NES', systemKw: 5.6, modules: 'REC Alpha Pure-R 400W x14', inverter: 'Enphase IQ8M-72',
    stage: 'open', necCompliant: false, ieeeCompliant: false, iraEligible: true, value: 14200,
  },
];

const STAGES_ORDER: Stage[] = ['open', 'review', 'approved', 'signed', 'submitted', 'complete'];

const usd = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const STAGE_STEP_INDEX: Record<Stage, number> = { open: 0, review: 3, approved: 6, signed: 7, submitted: 8, complete: 10 };

function getWorkflowSteps(p: Project) {
  const done = STAGE_STEP_INDEX[p.stage];
  return [
    { label: 'NES Application PDF', detail: `Auto-filled — ${p.systemKw} kW, ${p.inverter}`, date: 'Jun 10' },
    { label: 'Email to nesrenewables@nespower.com', detail: 'PDF + one-line diagram + equipment cut sheets', date: 'Jun 10' },
    { label: 'NEC 690 Compliance Check', detail: 'Rapid shutdown · Conductor sizing · Overcurrent protection', date: 'Jun 10' },
    { label: 'IEEE 1547 Validation', detail: 'Voltage ride-through · Frequency ride-through · Anti-islanding', date: 'Jun 11' },
    { label: 'Metro Nashville Building Permit', detail: p.permitNumber ? `Permit #${p.permitNumber}` : 'Pending filing', date: 'Jun 12' },
    { label: 'NES Review & Approval', detail: p.applicationId ? `Application ${p.applicationId}` : 'Awaiting submission', date: 'Jun 18' },
    { label: 'TVA DPP Registration', detail: 'Enrolled via green.mytva.com — IA uploaded, QCN verified', date: 'Jun 19' },
    { label: 'NES Inspection & Meter Swap', detail: p.inspectionDate ? `Scheduled ${new Date(p.inspectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Commissioning test + bi-directional meter', date: p.inspectionDate ? new Date(p.inspectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' },
    { label: 'Permission to Operate (PTO)', detail: 'NES final sign-off after inspection', date: '—' },
    { label: 'IRA §48 Tax Credit Filing', detail: `30% ITC — ${usd(Math.round(p.value * 0.3))} credit`, date: '—' },
  ].map((s, i) => ({
    ...s,
    step: i + 1,
    status: i < done ? 'complete' as const : i === done ? 'active' as const : 'waiting' as const,
  }));
}

function getBotLog(p: Project) {
  const logs: { icon: string; action: string; detail: string; status: 'done' | 'pending' }[] = [];
  const stage = STAGE_STEP_INDEX[p.stage];

  if (stage >= 1) {
    logs.push({ icon: '📄', action: 'Auto-filled NES Interconnection Application', detail: `${p.customer} — ${p.systemKw} kW, ${p.inverter}`, status: 'done' });
    logs.push({ icon: '📧', action: 'Sent application to nesrenewables@nespower.com', detail: `${p.customer} — PDF + one-line diagram + cut sheets`, status: 'done' });
  }
  if (stage >= 3) {
    logs.push({ icon: '📋', action: 'NEC 690 compliance check passed', detail: `${p.customer} — rapid shutdown, conductor sizing verified`, status: 'done' });
    logs.push({ icon: '📋', action: 'IEEE 1547 validation passed', detail: `${p.customer} — anti-islanding, voltage ride-through`, status: 'done' });
  }
  if (p.permitNumber) {
    logs.push({ icon: '🏛️', action: 'Metro Nashville building permit filed', detail: `${p.customer} — permit #${p.permitNumber}`, status: stage >= 5 ? 'done' : 'pending' });
  }
  if (stage >= 6 && p.applicationId) {
    logs.push({ icon: '✅', action: 'NES approval received via email', detail: `${p.customer} — ${p.applicationId} approved`, status: 'done' });
    logs.push({ icon: '🔄', action: 'TVA DPP enrollment on green.mytva.com', detail: `${p.customer} — registered, IA uploaded`, status: 'done' });
  }
  if (stage >= 8) {
    logs.push({ icon: '🔍', action: 'NES inspection passed', detail: `${p.customer} — commissioning test completed`, status: 'done' });
  }
  if (stage >= 10) {
    logs.push({ icon: '✅', action: 'Permission to Operate granted', detail: `${p.customer} — PTO received, system live`, status: 'done' });
    logs.push({ icon: '💰', action: 'IRA §48 tax credit docs generated', detail: `${p.customer} — ${usd(Math.round(p.value * 0.3))} ITC`, status: 'done' });
  }

  if (stage < 1) {
    logs.push({ icon: '⏳', action: 'Awaiting site survey completion', detail: `${p.customer} — survey needed before NES application`, status: 'pending' });
  } else if (stage < 6) {
    logs.push({ icon: '⏳', action: 'Awaiting NES review', detail: `${p.customer} — application under review`, status: 'pending' });
  } else if (stage < 8) {
    logs.push({ icon: '📅', action: 'NES inspection scheduling', detail: `${p.customer} — waiting for inspection slot`, status: 'pending' });
  }

  return logs;
}

export default function InterconnectionDemo() {
  const [selected, setSelected] = useState<Project | null>(null);

  const byStage = STAGES_ORDER.map(s => ({
    stage: s,
    label: STAGE_LABELS[s],
    projects: PROJECTS.filter(p => p.stage === s),
  }));
  const totalValue = PROJECTS.reduce((a, p) => a + p.value, 0);
  const submitted = PROJECTS.filter(p => p.stage === 'submitted' || p.stage === 'complete').length;

  const steps = selected ? getWorkflowSteps(selected) : [];
  const botLog = selected ? getBotLog(selected) : [];

  return (
    <>
      <DemoSidebar active="interconnection" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Interconnection"
          subtitle="Nashville Electric Service · Nashville Metro · NEC 690 / IEEE 1547 / IRA §48"
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-5 flex flex-col gap-4 shrink-0">
            {/* KPIs */}
            <div className="grid grid-cols-5 gap-3">
              <KpiCard label="TOTAL PROJECTS" value={String(PROJECTS.length)} sub="active" />
              <KpiCard label="PIPELINE VALUE" value={usd(totalValue)} sub="across all stages" />
              <KpiCard label="SUBMITTED" value={String(submitted)} sub="to NES" valueColor="text-success" />
              <KpiCard label="AVG SYSTEM" value={`${(PROJECTS.reduce((a, p) => a + p.systemKw, 0) / PROJECTS.length).toFixed(1)} kW`} sub="per project" />
              <KpiCard label="IRA ELIGIBLE" value={`${PROJECTS.filter(p => p.iraEligible).length}/${PROJECTS.length}`} sub="§48 tax credit" valueColor="text-success" />
            </div>
          </div>

          {/* Main area: Kanban */}
          <div className="flex-1 flex min-h-0">
            <div className="flex gap-3 overflow-x-auto px-6 pb-4 w-full">
              {byStage.filter(s => s.projects.length > 0).map(col => (
                <div key={col.stage} className="flex flex-col w-[260px] shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Pill label={col.label.toUpperCase()} tone={STAGE_TONE[col.stage]} dot={false} />
                    <span className="text-[11px] text-fg3 font-medium">{col.projects.length}</span>
                  </div>
                  <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    {col.projects.map(p => (
                      <Card
                        key={p.id}
                        className={`p-3.5 flex flex-col gap-2 transition-colors cursor-pointer ${
                          selected?.id === p.id ? 'border-accent bg-accent/5' : 'hover:border-line-2'
                        }`}
                        onClick={() => setSelected(selected?.id === p.id ? null : p)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-fg">{p.customer}</span>
                          <span className="text-[10px] text-fg3">{p.id}</span>
                        </div>
                        <div className="text-[11px] text-fg2">{p.address}, {p.city}, {p.state} {p.zip}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Tag label={`${p.systemKw} kW`} tone="accent" />
                          <Tag label={p.utility} tone="info" />
                          {p.necCompliant && <Tag label="NEC 690" tone="success" />}
                          {p.ieeeCompliant && <Tag label="IEEE 1547" tone="success" />}
                          {p.iraEligible && <Tag label="IRA §48" tone="purple" />}
                        </div>
                        {p.applicationId && <div className="text-[10px] text-fg3">App: {p.applicationId}</div>}
                        {p.permitNumber && <div className="text-[10px] text-fg3">Permit: {p.permitNumber}</div>}
                        {p.inspectionDate && (
                          <div className="text-[10px] text-accent">Inspection: {new Date(p.inspectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        )}
                        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-line">
                          <span className="text-[11px] font-medium text-fg">{usd(p.value)}</span>
                          {p.notes && <span className="text-[9px] text-fg3 truncate max-w-[140px]" title={p.notes}>{p.notes}</span>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel — overlay from right */}
          {selected && (
            <>
              <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 h-full w-[480px] bg-bg border-l border-line shadow-2xl z-40 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="px-5 py-4 border-b border-line flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-semibold text-fg">{selected.customer}</h2>
                      <Pill label={STAGE_LABELS[selected.stage].toUpperCase()} tone={STAGE_TONE[selected.stage]} dot={false} />
                    </div>
                    <p className="text-[11px] text-fg3 mt-0.5">{selected.address}, {selected.city}, {selected.state} {selected.zip} · {selected.systemKw} kW</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-fg3 hover:text-fg text-[18px] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface">×</button>
                </div>

                {/* Project info strip */}
                <div className="px-5 py-3 border-b border-line grid grid-cols-3 gap-3 shrink-0">
                  <div>
                    <p className="text-[9px] text-fg4 uppercase tracking-wider">System</p>
                    <p className="text-[11px] text-fg font-medium">{selected.systemKw} kW</p>
                    <p className="text-[10px] text-fg3">{selected.inverter}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-fg4 uppercase tracking-wider">Application</p>
                    <p className="text-[11px] text-fg font-medium">{selected.applicationId || '—'}</p>
                    <p className="text-[10px] text-fg3">Meter: {selected.meterNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-fg4 uppercase tracking-wider">Value</p>
                    <p className="text-[11px] text-fg font-medium">{usd(selected.value)}</p>
                    <p className="text-[10px] text-fg3">ITC: {usd(Math.round(selected.value * 0.3))}</p>
                  </div>
                </div>

                {/* Automation Workflow */}
                <div className="px-5 py-4 border-b border-line shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <h3 className="text-[12px] font-semibold text-fg">Automation Workflow</h3>
                    <span className="text-[9px] text-fg4 ml-auto">{steps.filter(s => s.status === 'complete').length}/{steps.length} complete</span>
                  </div>
                  <div className="flex flex-col">
                    {steps.map((s, i) => (
                      <div key={s.step} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            s.status === 'complete' ? 'bg-success text-white' :
                            s.status === 'active' ? 'bg-accent text-white' :
                            'bg-surface-3 text-fg3'
                          }`}>
                            {s.status === 'complete' ? '✓' : s.step}
                          </div>
                          {i < steps.length - 1 && <div className={`w-px min-h-[24px] ${
                            s.status === 'complete' ? 'bg-success/30' : 'bg-line'
                          }`} />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-medium ${
                              s.status === 'complete' ? 'text-fg' : s.status === 'active' ? 'text-accent' : 'text-fg3'
                            }`}>{s.label}</span>
                            <span className="text-[9px] text-fg4">{s.date}</span>
                          </div>
                          <p className="text-[10px] text-fg3 leading-[14px]">{s.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bot Activity */}
                <div className="px-5 py-4 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-[12px] font-semibold text-fg">NES Bot Activity</h3>
                    <Pill label="LIVE" tone="success" dot={false} />
                  </div>
                  <div className="flex flex-col gap-0 divide-y divide-line/50">
                    {botLog.map((entry, i) => (
                      <div key={i} className="flex gap-2.5 py-2">
                        <span className="text-[13px] shrink-0">{entry.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-fg">{entry.action}</span>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.status === 'done' ? 'bg-success' : 'bg-warning'}`} />
                          </div>
                          <p className="text-[9px] text-fg3 truncate">{entry.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Compliance footer */}
          <div className="shrink-0 mx-6 mb-4 rounded-xl bg-surface border border-line p-3 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[11px] text-fg2">NEC 690 — rapid shutdown, conductor sizing, overcurrent protection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[11px] text-fg2">IEEE 1547-2018 — voltage/frequency ride-through, anti-islanding</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[11px] text-fg2">IRA §48 — 30% investment tax credit eligibility tracked</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
