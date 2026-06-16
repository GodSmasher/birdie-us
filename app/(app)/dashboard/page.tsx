import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { loadDashboard, type DashboardData } from '@/app/lib/reonic-data';
import { getRegistrations } from '@/app/lib/netzanmeldung';
import { generateInsights, type Insight, type InsightSeverity } from '@/app/lib/insights';

export const dynamic = 'force-dynamic';

const usd = (n: number) => (n === 0 ? '—' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }));

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function easternHour(): number {
  return Number(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }));
}
function greeting(): string {
  const h = easternHour();
  if (h < 5) return 'Good evening';
  if (h < 11) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const [data, regs, insights] = await Promise.all([loadDashboard(), getRegistrations(), generateInsights()]);
  const netzStats = {
    total: regs.length,
    offen: regs.filter(r => !r.docStatus || r.docStatus === 'offen').length,
    pruefen: regs.filter(r => r.docStatus === 'pruefen').length,
    freigegeben: regs.filter(r => r.docStatus === 'freigegeben').length,
    unterschrieben: regs.filter(r => r.docStatus === 'unterschrieben').length,
    eingereicht: regs.filter(r => r.docStatus === 'eingereicht').length,
  };
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/New_York',
  });
  return (
    <>
      <Sidebar active="dashboard" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title={`${greeting()}, Sarah`}
          subtitle={data.configured ? `${today} · Volta · ${data.source === 'DB-Cache' ? 'from DB cache' : 'live from Reonic'}` : today}
        />
        {data.configured ? <RealDashboard data={data} netzStats={netzStats} insights={insights} /> : <MockDashboard />}
      </main>
    </>
  );
}

// ============ Insight severity styles ============
const severityStyles: Record<InsightSeverity, { bg: string; border: string; text: string; iconBg: string }> = {
  error:   { bg: 'bg-error-bg',   border: 'border-error/20',   text: 'text-error',   iconBg: 'bg-error/10' },
  warning: { bg: 'bg-warning-bg', border: 'border-warning/20', text: 'text-warning', iconBg: 'bg-warning/10' },
  success: { bg: 'bg-success-bg', border: 'border-success/20', text: 'text-success', iconBg: 'bg-success/10' },
  info:    { bg: 'bg-info-bg',    border: 'border-info/20',    text: 'text-info',    iconBg: 'bg-info/10' },
};

function InsightsCard({ insights }: { insights: Insight[] }) {
  const allGood = insights.length === 1 && insights[0].severity === 'success';
  const headerTone = allGood ? 'success' : 'warning';
  const count = allGood ? 0 : insights.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Action Required"
        right={
          <Pill
            label={allGood ? 'ALL GOOD' : `${count} OPEN`}
            tone={headerTone}
          />
        }
      />
      <div className="flex flex-col">
        {insights.map((insight, i) => {
          const s = severityStyles[insight.severity];
          return (
            <Link
              key={insight.id}
              href={insight.link}
              className={`flex items-start gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors ${
                i < insights.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${s.iconBg}`}>
                {insight.icon}
              </div>
              <div className="min-w-0 flex flex-col gap-0.5 flex-1">
                <span className={`text-[12px] font-medium ${s.text}`}>
                  {insight.severity === 'error' ? 'Urgent' : insight.severity === 'warning' ? 'Notice' : insight.severity === 'success' ? 'All good' : 'Info'}
                </span>
                <p className="text-[12px] text-fg2 leading-[18px]">{insight.message}</p>
              </div>
              <span className="text-[11px] text-fg3 shrink-0 mt-1">&rarr;</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

// ============ REAL — Reonic + Interconnection + Bots ============
function RealDashboard({ data, netzStats, insights }: { data: DashboardData; netzStats: { total: number; offen: number; pruefen: number; freigegeben: number; unterschrieben: number; eingereicht: number }; insights: Insight[] }) {
  const { pipeline: p, leads, events } = data;
  const closeRate = p.won + p.lost > 0 ? Math.round((p.won / (p.won + p.lost)) * 100) : 0;
  const maxStatus = Math.max(1, ...p.byStatus.map((s) => s.count));
  const maxSource = Math.max(1, ...leads.bySource.map((s) => s.count));

  return (
    <div className="flex-1 px-6 py-5 flex flex-col gap-4 h-[calc(100vh-64px)] overflow-hidden">
      {/* Row 1: KPIs */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        <KpiCard label="PIPELINE" value={usd(p.pipelineValueOpen)} sub={`${p.open} open`} />
        <KpiCard label="WON" value={usd(p.wonValue)} sub={`${p.won} closed`} valueColor="text-success" />
        <KpiCard label="CLOSE RATE" value={`${closeRate}%`} sub={`${p.won}/${p.won + p.lost}`} valueColor={closeRate >= 30 ? 'text-success' : 'text-fg'} />
        <KpiCard label="INTERCONNECTION" value={String(netzStats.total)} sub={`${netzStats.pruefen} in review · ${netzStats.eingereicht} submitted`} />
      </div>

      {/* Row 2: Main — 2 rows of 2 columns */}
      <div className="grid lg:grid-cols-[1fr_1fr] lg:grid-rows-2 gap-3 flex-1 min-h-0">

        {/* Col 1: Action Required (Insights) */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-line flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-[12px] text-fg">Action Required</h3>
            <Pill label={insights.length === 1 && insights[0].severity === 'success' ? 'OK' : `${insights.length}`} tone={insights.length === 1 && insights[0].severity === 'success' ? 'success' : 'warning'} dot={false} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {insights.map((insight, i) => {
              const s = severityStyles[insight.severity];
              return (
                <Link key={insight.id} href={insight.link}
                  className={`flex items-start gap-2.5 px-4 py-2.5 hover:bg-surface-2 transition-colors ${i < insights.length - 1 ? 'border-b border-line' : ''}`}>
                  <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs ${s.iconBg}`}>{insight.icon}</div>
                  <p className="text-[11px] text-fg2 leading-[16px] flex-1">{insight.message}</p>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Top-right: Schedule + Interconnection */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-line flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-[13px] text-fg">Schedule &amp; Interconnection</h3>
            <div className="flex gap-2">
              <Link href="/netzanmeldung" className="text-[10px] text-accent font-medium">Interconnection &rarr;</Link>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Interconnection mini */}
            <div className="px-5 py-3 border-b border-line">
              <div className="flex gap-3">
                {[
                  { label: 'Open', count: netzStats.offen, color: 'text-fg3' },
                  { label: 'Review', count: netzStats.pruefen, color: 'text-warning' },
                  { label: 'Approved', count: netzStats.freigegeben, color: 'text-info' },
                  { label: 'Signed', count: netzStats.unterschrieben, color: 'text-accent' },
                  { label: 'Submitted', count: netzStats.eingereicht, color: 'text-success' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className={`text-[18px] font-bold ${s.color}`}>{s.count}</div>
                    <div className="text-[9px] text-fg4">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Appointments */}
            {events.length === 0 ? (
              <div className="px-5 py-6 text-center text-[12px] text-fg3">No appointments</div>
            ) : (
              events.slice(0, 5).map((e, i) => (
                <div key={e.id} className={`flex gap-3 px-5 py-3 ${i < Math.min(events.length, 5) - 1 ? 'border-b border-line' : ''}`}>
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-info text-[10px]">&#x25F7;</div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[12px] font-medium text-fg truncate">{e.title}</span>
                    <span className="text-[10px] text-fg3">{fmtDate(e.start)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Bottom-left: Pipeline + Lead Sources */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-line shrink-0">
            <h3 className="font-semibold text-[13px] text-fg">Pipeline &amp; Leads</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-fg4 uppercase tracking-wider mb-2">Status Funnel</p>
              <div className="flex flex-col gap-1.5">
                {p.byStatus.slice(0, 5).map((s) => (
                  <div key={s.status} className="flex items-center gap-2">
                    <span className="text-[11px] text-fg2 w-[120px] truncate" title={s.status}>{s.status}</span>
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
                {leads.bySource.slice(0, 4).map((s) => (
                  <div key={s.source} className="flex items-center gap-2">
                    <span className="text-[11px] text-fg2 w-[120px] truncate" title={s.source}>{s.source}</span>
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

        {/* Bottom-right: Bots */}
        <Card className="overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-line flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-[13px] text-fg">Bots &amp; System</h3>
            <Link href="/bots" className="text-[10px] text-accent font-medium">Details &rarr;</Link>
          </div>
          <div className="flex-1 p-5 flex flex-col gap-2.5">
            {[
              { name: 'AI Document Filler', status: 'live' },
              { name: 'Interconnection Bot', status: 'live' },
              { name: 'Email Sync', status: 'live' },
              { name: 'Dunning Bot', status: 'live' },
              { name: 'Enrichment Bot', status: 'live' },
              { name: 'EcoFlow Connector', status: 'setup' },
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
                <span className="text-[11px] text-fg2">All systems online</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ MOCK — public demo fallback ============
const activities = [
  ['10:42', 'Dunning Bot', "3 invoices flagged as 'overdue' — reminder emails sent", 'success'],
  ['10:38', 'Lead Sync (Reonic)', '12 new leads imported, 2 flagged with missing phone number', 'info'],
  ['10:31', 'Appointment Bot', 'Consultation with Michael K. confirmed + Google Meet created', 'success'],
  ['10:24', 'Accounting Sync', "Invoice #2026-0341 created for 'Huber Family' ($24,500)", 'info'],
  ['10:12', 'WhatsApp Bot', '5 customer inquiries auto-replied · 1 escalated to Sarah', 'warning'],
  ['09:58', 'Call Bot', '8 missed calls detected — callback appointments suggested', 'info'],
] as const;

const toneBg: Record<string, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  error: 'bg-error-bg text-error',
};

function MockDashboard() {
  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="ACTIVE BOTS" value="12" sub="of 14 configured" delta="+2" spark={[10, 10, 11, 11, 12, 11, 12]} sparkColor="#4ADE80" />
        <KpiCard label="EXECUTED TODAY" value="347" sub="vs. yesterday" delta="+18%" spark={[212, 238, 254, 271, 289, 294, 347]} sparkColor="#4ADE80" />
        <KpiCard label="ERROR RATE" value="0.4%" sub="last 24h" delta="−0.2%" spark={[1.1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4]} sparkColor="#4ADE80" />
        <KpiCard label="CONNECTORS" value="8/8" sub="all in sync" spark={[8, 8, 7, 8, 8, 8, 8]} sparkColor="#FACC15" />
      </div>
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader title="Live Activity" right={<Pill label="DEMO" tone="neutral" />} />
          {activities.map(([time, bot, msg, kind], i) => (
            <div key={i} className={`flex gap-3.5 px-5 py-3.5 ${i < activities.length - 1 ? 'border-b border-line' : ''}`}>
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${toneBg[kind]}`}>✓</div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="font-medium text-fg">{bot}</span>
                  <span className="text-fg3">·</span>
                  <span className="text-fg3">{time}</span>
                </div>
                <p className="text-xs text-fg2 leading-[18px]">{msg}</p>
              </div>
            </div>
          ))}
        </Card>
        <Card className="w-[412px] shrink-0 p-5 flex flex-col gap-3.5 self-start">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">✦</div>
            <h3 className="font-semibold text-[13px] text-fg">Demo Mode</h3>
          </div>
          <p className="text-xs text-fg2 leading-[18px]">
            This view shows sample data. Once the Reonic connector is linked, the real pipeline,
            lead sources, and upcoming appointments will appear here.
          </p>
        </Card>
      </div>
    </div>
  );
}
