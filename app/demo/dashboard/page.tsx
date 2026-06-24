import Link from 'next/link';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill } from '@/components/ui';

export const metadata = { title: 'birdie — US Demo Dashboard' };

const usd = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

function greeting(): string {
  const h = Number(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }));
  if (h < 5) return 'Good evening';
  if (h < 11) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const PIPELINE = {
  open: 14, won: 8, lost: 2, pipelineValueOpen: 312500, wonValue: 196800,
  byStatus: [
    { status: 'New Lead', count: 5 },
    { status: 'Site Survey', count: 3 },
    { status: 'Proposal Sent', count: 4 },
    { status: 'Contract Signed', count: 6 },
    { status: 'Installed', count: 8 },
  ],
};

const LEAD_SOURCES = [
  { source: 'SalesRabbit', count: 9 },
  { source: 'Google Ads', count: 6 },
  { source: 'Referral', count: 4 },
  { source: 'Door-to-Door', count: 3 },
];

const NETZ_STATS = { total: 12, open: 3, review: 2, approved: 2, signed: 2, submitted: 3 };

const EVENTS = [
  { id: '1', title: 'Site Survey — Martinez, 4521 Elm Creek Dr', start: '2026-06-25T09:00:00-05:00' },
  { id: '2', title: 'Permit Review — Metro Nashville', start: '2026-06-25T14:00:00-05:00' },
  { id: '3', title: 'Install Day 1 — Thompson, 782 Oak Hill Rd', start: '2026-06-26T07:30:00-05:00' },
  { id: '4', title: 'NES Inspection — Rivera', start: '2026-06-27T10:00:00-05:00' },
];

const INSIGHTS = [
  { id: 'i1', severity: 'error' as const, icon: '⚠', message: 'NES application for Rivera (782 Oak Hill Rd) expires in 3 days — submit signed docs now', link: '/demo/interconnection' },
  { id: 'i2', severity: 'warning' as const, icon: '⏱', message: 'Martinez permit #MN-2026-4412 pending Metro Nashville review since Jun 18 — 6 business days', link: '/demo/interconnection' },
  { id: 'i3', severity: 'info' as const, icon: '✓', message: 'Thompson interconnection approved by NES — meter swap scheduled Jun 27', link: '/demo/interconnection' },
];

const severityStyles = {
  error: { bg: 'bg-error-bg', border: 'border-error/20', text: 'text-error', iconBg: 'bg-error/10' },
  warning: { bg: 'bg-warning-bg', border: 'border-warning/20', text: 'text-warning', iconBg: 'bg-warning/10' },
  success: { bg: 'bg-success-bg', border: 'border-success/20', text: 'text-success', iconBg: 'bg-success/10' },
  info: { bg: 'bg-info-bg', border: 'border-info/20', text: 'text-info', iconBg: 'bg-info/10' },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function DemoDashboard() {
  const closeRate = Math.round((PIPELINE.won / (PIPELINE.won + PIPELINE.lost)) * 100);
  const maxStatus = Math.max(1, ...PIPELINE.byStatus.map(s => s.count));
  const maxSource = Math.max(1, ...LEAD_SOURCES.map(s => s.count));
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/New_York',
  });

  return (
    <>
      <DemoSidebar active="dashboard" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title={`${greeting()}, Sarah`}
          subtitle={`${today} · ReNew Solar Demo · NES / TVA Service Territory`}
        />
        <div className="flex-1 px-6 py-5 flex flex-col gap-4 h-[calc(100vh-64px)] overflow-hidden">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 shrink-0">
            <KpiCard label="PIPELINE" value={usd(PIPELINE.pipelineValueOpen)} sub={`${PIPELINE.open} open`} />
            <KpiCard label="WON" value={usd(PIPELINE.wonValue)} sub={`${PIPELINE.won} closed`} valueColor="text-success" />
            <KpiCard label="CLOSE RATE" value={`${closeRate}%`} sub={`${PIPELINE.won}/${PIPELINE.won + PIPELINE.lost}`} valueColor="text-success" />
            <KpiCard label="INTERCONNECTION" value={String(NETZ_STATS.total)} sub={`${NETZ_STATS.review} in review · ${NETZ_STATS.submitted} submitted`} />
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-[1fr_1fr] lg:grid-rows-2 gap-3 flex-1 min-h-0">
            {/* Action Required */}
            <Card className="overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-line flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-[12px] text-fg">Action Required</h3>
                <Pill label={`${INSIGHTS.length}`} tone="warning" dot={false} />
              </div>
              <div className="flex-1 overflow-y-auto">
                {INSIGHTS.map((insight, i) => {
                  const s = severityStyles[insight.severity];
                  return (
                    <Link key={insight.id} href={insight.link}
                      className={`flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface-2 transition-colors ${i < INSIGHTS.length - 1 ? 'border-b border-line' : ''}`}>
                      <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs ${s.iconBg}`}>{insight.icon}</div>
                      <p className="text-[11px] text-fg2 leading-[16px] flex-1">{insight.message}</p>
                    </Link>
                  );
                })}
              </div>
            </Card>

            {/* Schedule & Interconnection */}
            <Card className="overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-line flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-[13px] text-fg">Schedule &amp; Interconnection</h3>
                <Link href="/demo/interconnection" className="text-[10px] text-accent font-medium">Interconnection &rarr;</Link>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-3 border-b border-line">
                  <div className="flex gap-3">
                    {[
                      { label: 'Open', count: NETZ_STATS.open, color: 'text-fg3' },
                      { label: 'Review', count: NETZ_STATS.review, color: 'text-warning' },
                      { label: 'Approved', count: NETZ_STATS.approved, color: 'text-info' },
                      { label: 'Signed', count: NETZ_STATS.signed, color: 'text-accent' },
                      { label: 'Submitted', count: NETZ_STATS.submitted, color: 'text-success' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <div className={`text-[18px] font-bold ${s.color}`}>{s.count}</div>
                        <div className="text-[9px] text-fg4">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {EVENTS.map((e, i) => (
                  <div key={e.id} className={`flex gap-3 px-5 py-3 ${i < EVENTS.length - 1 ? 'border-b border-line' : ''}`}>
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-info text-[10px]">&#x25F7;</div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-[12px] font-medium text-fg truncate">{e.title}</span>
                      <span className="text-[10px] text-fg3">{fmtDate(e.start)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pipeline & Leads */}
            <Card className="overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-line shrink-0">
                <h3 className="font-semibold text-[13px] text-fg">Pipeline &amp; Leads</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                <div>
                  <p className="text-[10px] text-fg4 uppercase tracking-wider mb-2">Status Funnel</p>
                  <div className="flex flex-col gap-1.5">
                    {PIPELINE.byStatus.map(s => (
                      <div key={s.status} className="flex items-center gap-2">
                        <span className="text-[11px] text-fg2 w-[120px] truncate">{s.status}</span>
                        <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                        </div>
                        <span className="text-[11px] font-medium text-fg w-6 text-right">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-fg4 uppercase tracking-wider mb-2">Lead Sources</p>
                  <div className="flex flex-col gap-1.5">
                    {LEAD_SOURCES.map(s => (
                      <div key={s.source} className="flex items-center gap-2">
                        <span className="text-[11px] text-fg2 w-[120px] truncate">{s.source}</span>
                        <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                          <div className="h-full rounded-full bg-success" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                        </div>
                        <span className="text-[11px] font-medium text-fg w-6 text-right">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Bots & System */}
            <Card className="overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-line flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-[13px] text-fg">Bots &amp; System</h3>
                <Pill label="US" tone="accent" dot={false} />
              </div>
              <div className="flex-1 p-5 flex flex-col gap-2.5">
                {[
                  { name: 'AI Document Filler', status: 'live' },
                  { name: 'NES Interconnection Bot', status: 'live' },
                  { name: 'NEC 690 Compliance Check', status: 'live' },
                  { name: 'IEEE 1547 Validator', status: 'live' },
                  { name: 'IRA Incentive Tracker', status: 'live' },
                  { name: 'Aurora Solar Sync', status: 'live' },
                  { name: 'Enphase Monitoring', status: 'setup' },
                ].map(bot => (
                  <div key={bot.name} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${bot.status === 'live' ? 'bg-success' : 'bg-warning'}`} />
                    <span className="text-[12px] text-fg2 flex-1">{bot.name}</span>
                    <span className={`text-[9px] font-bold tracking-wider uppercase ${bot.status === 'live' ? 'text-success' : 'text-warning'}`}>
                      {bot.status === 'live' ? 'LIVE' : 'SETUP'}
                    </span>
                  </div>
                ))}
                <div className="mt-auto bg-surface rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                    <span className="text-[11px] text-fg2">All systems online — NES / Nashville</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
