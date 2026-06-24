'use client';

import { useState } from 'react';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill, Tag } from '@/components/ui';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

type Stage = 'new' | 'survey' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

const STAGE_LABELS: Record<Stage, string> = {
  new: 'New Lead',
  survey: 'Site Survey',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

const STAGE_TONE: Record<Stage, 'neutral' | 'info' | 'accent' | 'warning' | 'success' | 'error'> = {
  new: 'neutral',
  survey: 'info',
  proposal: 'accent',
  negotiation: 'warning',
  closed_won: 'success',
  closed_lost: 'error',
};

interface Lead {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  source: string;
  stage: Stage;
  systemKw: number;
  value: number;
  rep: string;
  lastActivity: string;
  notes: string;
  nextStep: string;
}

const LEADS: Lead[] = [
  { id: 'L-1001', name: 'James & Patricia Thompson', address: '782 Oak Hill Rd, Nashville, TN 37214', phone: '(615) 555-0142', email: 'jthompson@gmail.com', source: 'SalesRabbit', stage: 'closed_won', systemKw: 8.4, value: 25200, rep: 'Marcus Cole', lastActivity: '2026-06-20', notes: 'Homeowner very enthusiastic — roof replaced 2024', nextStep: 'Install scheduled Jun 26' },
  { id: 'L-1002', name: 'Maria Rivera', address: '1204 Briley Pkwy, Nashville, TN 37217', phone: '(615) 555-0198', email: 'mrivera@outlook.com', source: 'Google Ads', stage: 'closed_won', systemKw: 6.8, value: 20400, rep: 'Sarah Mitchell', lastActivity: '2026-06-18', notes: 'Single-story ranch, south-facing, no shade', nextStep: 'NES application submitted' },
  { id: 'L-1003', name: 'David & Lisa Martinez', address: '4521 Elm Creek Dr, Nashville, TN 37211', phone: '(615) 555-0267', email: 'dmartinez@yahoo.com', source: 'Referral', stage: 'negotiation', systemKw: 10.2, value: 30600, rep: 'Marcus Cole', lastActivity: '2026-06-22', notes: 'Wants battery storage — comparing Tesla Powerwall vs Enphase', nextStep: 'Follow-up call Jun 25' },
  { id: 'L-1004', name: 'Robert Chen', address: '893 Gallatin Pike, Nashville, TN 37206', phone: '(615) 555-0334', email: 'rchen@gmail.com', source: 'SalesRabbit', stage: 'proposal', systemKw: 7.6, value: 22800, rep: 'Sarah Mitchell', lastActivity: '2026-06-21', notes: 'Condo HOA approval needed — board meets Jul 1', nextStep: 'Send HOA letter template' },
  { id: 'L-1005', name: 'Karen Washington', address: '567 Lebanon Pike, Nashville, TN 37210', phone: '(615) 555-0411', email: 'kwash@gmail.com', source: 'Door-to-Door', stage: 'proposal', systemKw: 9.0, value: 27000, rep: 'Marcus Cole', lastActivity: '2026-06-23', notes: 'Large roof, great solar potential — interested in IRA credit', nextStep: 'Proposal review meeting Jun 26' },
  { id: 'L-1006', name: 'Michael & Janet Brooks', address: '2341 Murfreesboro Pike, Nashville, TN 37217', phone: '(615) 555-0523', email: 'mbrooks@hotmail.com', source: 'Google Ads', stage: 'survey', systemKw: 11.4, value: 34200, rep: 'Sarah Mitchell', lastActivity: '2026-06-24', notes: 'Two-story, complex roof — needs detailed survey', nextStep: 'Site survey scheduled Jun 25' },
  { id: 'L-1007', name: 'Angela Foster', address: '1876 Dickerson Pike, Nashville, TN 37207', phone: '(615) 555-0645', email: 'afoster@gmail.com', source: 'SalesRabbit', stage: 'survey', systemKw: 5.6, value: 16800, rep: 'Marcus Cole', lastActivity: '2026-06-23', notes: 'Small bungalow, limited roof space — considering ground mount', nextStep: 'Ground mount assessment Jun 27' },
  { id: 'L-1008', name: 'Thomas & Rebecca Lee', address: '430 Old Hickory Blvd, Nashville, TN 37209', phone: '(615) 555-0712', email: 'tlee@icloud.com', source: 'Referral', stage: 'new', systemKw: 8.8, value: 26400, rep: 'Sarah Mitchell', lastActivity: '2026-06-24', notes: 'Referred by Thompson — saw their installation', nextStep: 'Initial call scheduled Jun 25' },
  { id: 'L-1009', name: 'Jennifer Patel', address: '2109 Charlotte Ave, Nashville, TN 37203', phone: '(615) 555-0834', email: 'jpatel@gmail.com', source: 'Google Ads', stage: 'new', systemKw: 7.2, value: 21600, rep: 'Marcus Cole', lastActivity: '2026-06-24', notes: 'Filled out web form — high electricity bill ($280/mo)', nextStep: 'Qualify and schedule intro call' },
  { id: 'L-1010', name: 'William Harris', address: '1550 West End Ave, Nashville, TN 37203', phone: '(615) 555-0956', email: 'wharris@gmail.com', source: 'Door-to-Door', stage: 'new', systemKw: 6.4, value: 19200, rep: 'Sarah Mitchell', lastActivity: '2026-06-23', notes: 'Interested but wants to wait until fall — follow up Sep', nextStep: 'Add to nurture sequence' },
  { id: 'L-1011', name: 'Steven & Amy Clark', address: '3322 Nolensville Pike, Nashville, TN 37211', phone: '(615) 555-1023', email: 'sclark@yahoo.com', source: 'SalesRabbit', stage: 'closed_won', systemKw: 9.6, value: 28800, rep: 'Marcus Cole', lastActivity: '2026-06-15', notes: 'Fast mover — signed within 5 days of survey', nextStep: 'Installation complete, PTO pending' },
  { id: 'L-1012', name: 'Nancy Gonzalez', address: '878 Harding Pl, Nashville, TN 37211', phone: '(615) 555-1145', email: 'ngonzalez@gmail.com', source: 'Google Ads', stage: 'closed_lost', systemKw: 7.0, value: 21000, rep: 'Sarah Mitchell', lastActivity: '2026-06-10', notes: 'Went with competitor — price was deciding factor', nextStep: '—' },
  { id: 'L-1013', name: 'Christopher Young', address: '2445 Shelby Ave, Nashville, TN 37206', phone: '(615) 555-1267', email: 'cyoung@outlook.com', source: 'Referral', stage: 'closed_lost', systemKw: 8.2, value: 24600, rep: 'Marcus Cole', lastActivity: '2026-06-12', notes: 'Roof too old — needs replacement first, will revisit 2027', nextStep: 'Nurture for 2027' },
  { id: 'L-1014', name: 'Amanda & Derek Wilson', address: '1901 12th Ave S, Nashville, TN 37203', phone: '(615) 555-1389', email: 'awilson@gmail.com', source: 'SalesRabbit', stage: 'negotiation', systemKw: 12.0, value: 36000, rep: 'Sarah Mitchell', lastActivity: '2026-06-22', notes: 'Large home, wants full offset — financing discussion pending', nextStep: 'Financing options presentation Jun 26' },
];

const STAGES: Stage[] = ['new', 'survey', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

const REPS = [
  { name: 'Marcus Cole', leads: 7, won: 3, pipeline: 142200, avatar: 'MC' },
  { name: 'Sarah Mitchell', leads: 7, won: 2, pipeline: 140400, avatar: 'SM' },
];

export default function SalesPage() {
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const totalPipeline = LEADS.filter(l => !['closed_won', 'closed_lost'].includes(l.stage)).reduce((a, l) => a + l.value, 0);
  const wonValue = LEADS.filter(l => l.stage === 'closed_won').reduce((a, l) => a + l.value, 0);
  const wonCount = LEADS.filter(l => l.stage === 'closed_won').length;
  const lostCount = LEADS.filter(l => l.stage === 'closed_lost').length;
  const closeRate = Math.round((wonCount / (wonCount + lostCount)) * 100);
  const avgDeal = Math.round(LEADS.reduce((a, l) => a + l.value, 0) / LEADS.length);

  const byStage = STAGES.map(stage => ({
    stage,
    label: STAGE_LABELS[stage],
    leads: LEADS.filter(l => l.stage === stage),
  }));

  return (
    <>
      <DemoSidebar active="sales" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar title="Sales Pipeline" subtitle="ReNew Solar Solutions · Nashville, TN · Close CRM" />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* KPIs */}
          <div className="px-6 pt-5 pb-3 shrink-0">
            <div className="grid grid-cols-5 gap-3">
              <KpiCard label="OPEN PIPELINE" value={usd(totalPipeline)} sub={`${LEADS.filter(l => !['closed_won', 'closed_lost'].includes(l.stage)).length} active deals`} />
              <KpiCard label="WON REVENUE" value={usd(wonValue)} sub={`${wonCount} closed`} valueColor="text-success" />
              <KpiCard label="CLOSE RATE" value={`${closeRate}%`} sub={`${wonCount}W / ${lostCount}L`} valueColor="text-success" />
              <KpiCard label="AVG DEAL SIZE" value={usd(avgDeal)} sub="per project" />
              <KpiCard label="LEADS THIS MONTH" value={String(LEADS.length)} sub="Jun 2026" />
            </div>
          </div>

          {/* View toggle + rep cards */}
          <div className="px-6 pb-3 flex items-center gap-4 shrink-0">
            <div className="flex bg-surface border border-line rounded-lg overflow-hidden">
              <button onClick={() => setView('pipeline')} className={`px-3 py-1.5 text-[11px] font-medium ${view === 'pipeline' ? 'bg-accent text-white' : 'text-fg2 hover:text-fg'}`}>Pipeline</button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 text-[11px] font-medium ${view === 'list' ? 'bg-accent text-white' : 'text-fg2 hover:text-fg'}`}>List</button>
            </div>
            <div className="flex gap-3 ml-auto">
              {REPS.map(r => (
                <div key={r.name} className="flex items-center gap-2 bg-surface border border-line rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-accent/10 text-accent text-[9px] font-bold flex items-center justify-center">{r.avatar}</div>
                  <div>
                    <span className="text-[11px] font-medium text-fg">{r.name}</span>
                    <span className="text-[10px] text-fg3 ml-2">{r.won}W · {usd(r.pipeline)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline / List view */}
          {view === 'pipeline' ? (
            <div className="flex-1 flex gap-3 overflow-x-auto px-6 pb-4 min-h-0">
              {byStage.map(col => (
                <div key={col.stage} className="flex flex-col w-[240px] shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Pill label={col.label.toUpperCase()} tone={STAGE_TONE[col.stage]} dot={false} />
                    <span className="text-[11px] text-fg3 font-medium">{col.leads.length}</span>
                    {col.stage !== 'closed_lost' && (
                      <span className="text-[10px] text-fg4 ml-auto">{usd(col.leads.reduce((a, l) => a + l.value, 0))}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    {col.leads.map(l => (
                      <Card
                        key={l.id}
                        className={`p-3 flex flex-col gap-1.5 cursor-pointer transition-colors ${
                          selectedLead?.id === l.id ? 'border-accent bg-accent/5' : 'hover:border-line-2'
                        }`}
                        onClick={() => setSelectedLead(selectedLead?.id === l.id ? null : l)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-fg truncate">{l.name}</span>
                          <span className="text-[9px] text-fg3">{l.id}</span>
                        </div>
                        <div className="text-[10px] text-fg3 truncate">{l.address}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Tag label={`${l.systemKw} kW`} tone="accent" />
                          <Tag label={l.source} tone="info" />
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-line mt-1">
                          <span className="text-[11px] font-medium text-fg">{usd(l.value)}</span>
                          <span className="text-[9px] text-fg3">{l.rep.split(' ')[0]}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <Card className="overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line bg-surface">
                      <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Lead</th>
                      <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Stage</th>
                      <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">System</th>
                      <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Value</th>
                      <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Source</th>
                      <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Rep</th>
                      <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Next Step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEADS.map(l => (
                      <tr
                        key={l.id}
                        className={`border-b border-line cursor-pointer transition-colors ${
                          selectedLead?.id === l.id ? 'bg-accent/5' : 'hover:bg-surface'
                        }`}
                        onClick={() => setSelectedLead(selectedLead?.id === l.id ? null : l)}
                      >
                        <td className="px-4 py-2.5">
                          <div className="text-[11px] font-medium text-fg">{l.name}</div>
                          <div className="text-[10px] text-fg3">{l.address}</div>
                        </td>
                        <td className="px-4 py-2.5"><Pill label={STAGE_LABELS[l.stage].toUpperCase()} tone={STAGE_TONE[l.stage]} dot={false} /></td>
                        <td className="px-4 py-2.5 text-[11px] text-fg">{l.systemKw} kW</td>
                        <td className="px-4 py-2.5 text-[11px] font-medium text-fg">{usd(l.value)}</td>
                        <td className="px-4 py-2.5"><Tag label={l.source} tone="info" /></td>
                        <td className="px-4 py-2.5 text-[11px] text-fg2">{l.rep}</td>
                        <td className="px-4 py-2.5 text-[10px] text-fg3 max-w-[180px] truncate">{l.nextStep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </div>

        {/* Lead detail overlay */}
        {selectedLead && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelectedLead(null)} />
            <div className="fixed top-0 right-0 h-full w-[440px] bg-bg border-l border-line shadow-2xl z-40 flex flex-col overflow-y-auto">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-fg">{selectedLead.name}</h2>
                    <Pill label={STAGE_LABELS[selectedLead.stage].toUpperCase()} tone={STAGE_TONE[selectedLead.stage]} dot={false} />
                  </div>
                  <p className="text-[11px] text-fg3 mt-0.5">{selectedLead.id} · {selectedLead.rep}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="text-fg3 hover:text-fg text-[18px] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface">×</button>
              </div>

              <div className="px-5 py-3 border-b border-line grid grid-cols-2 gap-3 shrink-0">
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Contact</p>
                  <p className="text-[11px] text-fg font-medium">{selectedLead.phone}</p>
                  <p className="text-[10px] text-fg3">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-[9px] text-fg4 uppercase tracking-wider">Deal</p>
                  <p className="text-[11px] text-fg font-medium">{usd(selectedLead.value)}</p>
                  <p className="text-[10px] text-fg3">{selectedLead.systemKw} kW system</p>
                </div>
              </div>

              <div className="px-5 py-3 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-1">Address</p>
                <p className="text-[11px] text-fg">{selectedLead.address}</p>
              </div>

              <div className="px-5 py-3 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-1">Source</p>
                <div className="flex items-center gap-2">
                  <Tag label={selectedLead.source} tone="info" />
                  <span className="text-[10px] text-fg3">Last activity: {new Date(selectedLead.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="px-5 py-3 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-[11px] text-fg2 leading-relaxed">{selectedLead.notes}</p>
              </div>

              <div className="px-5 py-4 shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-1">Next Step</p>
                <div className="bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-accent font-medium">{selectedLead.nextStep}</p>
                </div>
              </div>

              <div className="px-5 py-3 mt-auto border-t border-line shrink-0">
                <div className="flex gap-2">
                  <button className="flex-1 h-8 bg-accent text-white text-[11px] font-medium rounded-lg hover:bg-accent/90 transition-colors">Log Activity</button>
                  <button className="flex-1 h-8 bg-surface border border-line text-fg2 text-[11px] font-medium rounded-lg hover:border-line-2 transition-colors">Send Proposal</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
