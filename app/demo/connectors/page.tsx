'use client';

import { useState } from 'react';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill, Tag } from '@/components/ui';

interface Connector {
  id: string;
  name: string;
  logo: string;
  category: 'utility' | 'design' | 'crm' | 'monitoring' | 'compliance' | 'finance' | 'comms';
  status: 'connected' | 'available' | 'coming_soon';
  description: string;
  dataPoints: string[];
  lastSync: string;
  syncFreq: string;
}

const CONNECTORS: Connector[] = [
  {
    id: 'C-01', name: 'NES (Nashville Electric Service)', logo: '⚡', category: 'utility',
    status: 'connected', description: 'Interconnection applications, inspection scheduling, PTO tracking via email automation',
    dataPoints: ['DG application status', 'Inspection dates', 'PTO approvals', 'Rate schedules'],
    lastSync: '2026-06-24T15:30:00', syncFreq: 'Real-time (email trigger)',
  },
  {
    id: 'C-02', name: 'TVA (Tennessee Valley Authority)', logo: '🏛️', category: 'utility',
    status: 'connected', description: 'DPP enrollment via green.mytva.com, QCN contractor network, generation credits',
    dataPoints: ['DPP enrollment status', 'QCN certification', 'Generation credit rates', 'Program eligibility'],
    lastSync: '2026-06-24T14:00:00', syncFreq: 'Daily',
  },
  {
    id: 'C-03', name: 'Aurora Solar', logo: '☀', category: 'design',
    status: 'connected', description: 'System designs, shade analysis, production estimates, panel layouts',
    dataPoints: ['System size (kW)', 'Panel count & layout', 'Shade analysis', 'Annual production (kWh)', 'Single-line diagram'],
    lastSync: '2026-06-24T15:30:00', syncFreq: 'Every 30 min',
  },
  {
    id: 'C-04', name: 'Close CRM', logo: '📊', category: 'crm',
    status: 'connected', description: 'Lead management, pipeline tracking, activity logging, email sequences',
    dataPoints: ['Leads & contacts', 'Deal stages', 'Activity history', 'Email engagement', 'Revenue forecasts'],
    lastSync: '2026-06-24T15:45:00', syncFreq: 'Every 5 min',
  },
  {
    id: 'C-05', name: 'SalesRabbit', logo: '🐰', category: 'crm',
    status: 'connected', description: 'Door-to-door canvassing, lead capture, territory management, rep tracking',
    dataPoints: ['D2D leads', 'Knock data', 'Territory maps', 'Rep performance', 'Disposition codes'],
    lastSync: '2026-06-24T15:00:00', syncFreq: 'Every 15 min',
  },
  {
    id: 'C-06', name: 'Enphase Enlighten', logo: '📡', category: 'monitoring',
    status: 'available', description: 'Real-time production monitoring, system health, microinverter status',
    dataPoints: ['Real-time production (W)', 'Daily/monthly energy (kWh)', 'System health alerts', 'Microinverter status'],
    lastSync: '—', syncFreq: 'Every 15 min (after setup)',
  },
  {
    id: 'C-07', name: 'Metro Nashville Permits', logo: '🏛️', category: 'compliance',
    status: 'connected', description: 'Building permit applications, status tracking, inspection scheduling',
    dataPoints: ['Permit status', 'Application number', 'Inspector assignment', 'Inspection results'],
    lastSync: '2026-06-24T12:00:00', syncFreq: 'Every 2 hours',
  },
  {
    id: 'C-08', name: 'QuickBooks Online', logo: '💰', category: 'finance',
    status: 'connected', description: 'Invoicing, payment tracking, project financials, tax credit documentation',
    dataPoints: ['Invoices', 'Payment status', 'Project costs', 'Profit margins', 'IRA credit tracking'],
    lastSync: '2026-06-24T08:00:00', syncFreq: 'Every hour',
  },
  {
    id: 'C-09', name: 'Google Workspace', logo: '📧', category: 'comms',
    status: 'connected', description: 'Email automation, calendar scheduling, document storage, team collaboration',
    dataPoints: ['Email threads', 'Calendar events', 'Shared documents', 'Contact sync'],
    lastSync: '2026-06-24T15:50:00', syncFreq: 'Real-time',
  },
  {
    id: 'C-10', name: 'SolarEdge Monitoring', logo: '📈', category: 'monitoring',
    status: 'available', description: 'Inverter monitoring, power optimizer status, string-level production',
    dataPoints: ['Inverter output', 'Optimizer performance', 'String currents', 'Error codes'],
    lastSync: '—', syncFreq: 'Every 15 min (after setup)',
  },
  {
    id: 'C-11', name: 'Sunrun / Vivint', logo: '🏠', category: 'crm',
    status: 'coming_soon', description: 'Partner lead sharing, co-branded proposals, subcontractor workflows',
    dataPoints: ['Shared leads', 'Co-branded proposals', 'Subcontractor assignments'],
    lastSync: '—', syncFreq: '—',
  },
  {
    id: 'C-12', name: 'Mosaic / GoodLeap', logo: '🏦', category: 'finance',
    status: 'coming_soon', description: 'Solar financing applications, loan status, payment schedules',
    dataPoints: ['Loan applications', 'Approval status', 'Payment schedules', 'Dealer fees'],
    lastSync: '—', syncFreq: '—',
  },
];

const STATUS_TONE: Record<string, 'success' | 'info' | 'neutral'> = { connected: 'success', available: 'info', coming_soon: 'neutral' };
const STATUS_LABEL: Record<string, string> = { connected: 'CONNECTED', available: 'AVAILABLE', coming_soon: 'COMING SOON' };
const CAT_TONE: Record<string, 'accent' | 'info' | 'success' | 'warning' | 'purple' | 'neutral'> = {
  utility: 'warning', design: 'accent', crm: 'info', monitoring: 'success', compliance: 'purple', finance: 'neutral', comms: 'info',
};
const CAT_LABEL: Record<string, string> = {
  utility: 'UTILITY', design: 'DESIGN', crm: 'CRM', monitoring: 'MONITORING', compliance: 'COMPLIANCE', finance: 'FINANCE', comms: 'COMMS',
};

export default function ConnectorsPage() {
  const [selectedConn, setSelectedConn] = useState<Connector | null>(null);
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');

  const filtered = filter === 'all' ? CONNECTORS : CONNECTORS.filter(c => c.status === filter || (filter === 'available' && c.status === 'coming_soon'));
  const connectedCount = CONNECTORS.filter(c => c.status === 'connected').length;

  return (
    <>
      <DemoSidebar active="connectors" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar title="Connectors" subtitle="ReNew Solar Solutions · Integration hub · 12 connectors" />

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-6 pt-5 pb-3 shrink-0">
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">CONNECTED</span>
                <span className="text-[28px] font-semibold text-success leading-none">{connectedCount}</span>
                <span className="text-[11px] text-fg3">active integrations</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">AVAILABLE</span>
                <span className="text-[28px] font-semibold text-info leading-none">{CONNECTORS.filter(c => c.status === 'available').length}</span>
                <span className="text-[11px] text-fg3">ready to connect</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">DATA POINTS</span>
                <span className="text-[28px] font-semibold text-fg leading-none">{CONNECTORS.filter(c => c.status === 'connected').reduce((a, c) => a + c.dataPoints.length, 0)}</span>
                <span className="text-[11px] text-fg3">synced fields</span>
              </Card>
              <Card className="p-4 flex flex-col gap-1">
                <span className="text-[10px] text-fg4 uppercase tracking-wider font-medium">COMING SOON</span>
                <span className="text-[28px] font-semibold text-fg3 leading-none">{CONNECTORS.filter(c => c.status === 'coming_soon').length}</span>
                <span className="text-[11px] text-fg3">in development</span>
              </Card>
            </div>
          </div>

          <div className="px-6 pb-3 flex items-center gap-2 shrink-0">
            {(['all', 'connected', 'available'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${filter === f ? 'bg-accent text-white' : 'bg-surface border border-line text-fg2 hover:text-fg'}`}>
                {f === 'all' ? 'All' : f === 'connected' ? 'Connected' : 'Available'}
              </button>
            ))}
          </div>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(conn => (
                <Card
                  key={conn.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedConn?.id === conn.id ? 'border-accent bg-accent/5' : 'hover:border-line-2'
                  } ${conn.status === 'coming_soon' ? 'opacity-60' : ''}`}
                  onClick={() => setSelectedConn(selectedConn?.id === conn.id ? null : conn)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[24px]">{conn.logo}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[12px] font-semibold text-fg truncate">{conn.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Tag label={CAT_LABEL[conn.category]} tone={CAT_TONE[conn.category]} />
                        <Pill label={STATUS_LABEL[conn.status]} tone={STATUS_TONE[conn.status]} dot={false} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-fg3 mb-2 leading-relaxed line-clamp-2">{conn.description}</p>
                  {conn.status === 'connected' && (
                    <div className="flex items-center gap-3 text-[9px] text-fg4">
                      <span>{conn.dataPoints.length} data points</span>
                      <span>·</span>
                      <span>{conn.syncFreq}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {selectedConn && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelectedConn(null)} />
            <div className="fixed top-0 right-0 h-full w-[460px] bg-bg border-l border-line shadow-2xl z-40 flex flex-col overflow-y-auto">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[28px]">{selectedConn.logo}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-semibold text-fg">{selectedConn.name}</h2>
                      <Pill label={STATUS_LABEL[selectedConn.status]} tone={STATUS_TONE[selectedConn.status]} dot={false} />
                    </div>
                    <p className="text-[10px] text-fg3 mt-0.5">{selectedConn.id} · {CAT_LABEL[selectedConn.category]}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedConn(null)} className="text-fg3 hover:text-fg text-[18px] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface">×</button>
              </div>

              <div className="px-5 py-3 border-b border-line shrink-0">
                <p className="text-[11px] text-fg2 leading-relaxed">{selectedConn.description}</p>
              </div>

              {selectedConn.status === 'connected' && (
                <div className="px-5 py-3 border-b border-line grid grid-cols-2 gap-3 shrink-0">
                  <div>
                    <p className="text-[9px] text-fg4 uppercase tracking-wider">Last Sync</p>
                    <p className="text-[11px] text-fg font-medium">{selectedConn.lastSync !== '—' ? new Date(selectedConn.lastSync).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-fg4 uppercase tracking-wider">Sync Frequency</p>
                    <p className="text-[11px] text-fg font-medium">{selectedConn.syncFreq}</p>
                  </div>
                </div>
              )}

              <div className="px-5 py-4 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-2">Data Points</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedConn.dataPoints.map(dp => (
                    <Tag key={dp} label={dp} tone={selectedConn.status === 'connected' ? 'success' : 'neutral'} />
                  ))}
                </div>
              </div>

              <div className="px-5 py-4 mt-auto shrink-0">
                {selectedConn.status === 'connected' ? (
                  <div className="flex gap-2">
                    <button className="flex-1 h-8 bg-surface border border-line text-fg2 text-[11px] font-medium rounded-lg hover:border-line-2 transition-colors">Sync Now</button>
                    <button className="flex-1 h-8 bg-surface border border-line text-fg2 text-[11px] font-medium rounded-lg hover:border-line-2 transition-colors">Settings</button>
                  </div>
                ) : selectedConn.status === 'available' ? (
                  <button className="w-full h-8 bg-accent text-white text-[11px] font-medium rounded-lg hover:bg-accent/90 transition-colors">Connect</button>
                ) : (
                  <button className="w-full h-8 bg-surface border border-line text-fg3 text-[11px] font-medium rounded-lg cursor-not-allowed" disabled>Coming Soon</button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
