import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { loadDashboard, type DashboardData } from '@/app/lib/reonic-data';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', {
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function berlinHour(): number {
  return Number(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin', hour: '2-digit', hour12: false }));
}
function greeting(): string {
  const h = berlinHour();
  if (h < 5) return 'Gute Nacht';
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default async function DashboardPage() {
  const data = await loadDashboard();
  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin',
  });
  return (
    <>
      <Sidebar active="dashboard" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title={`${greeting()}, Sarah`}
          subtitle={data.configured ? `${today} · Volta · ${data.source === 'DB-Cache' ? 'aus DB-Cache' : 'live aus Reonic'}` : today}
        />
        {data.configured ? <RealDashboard data={data} /> : <MockDashboard />}
      </main>
    </>
  );
}

// ============ REAL — Reonic ============
function RealDashboard({ data }: { data: DashboardData }) {
  const { pipeline: p, leads, events } = data;
  const closeRate = p.won + p.lost > 0 ? Math.round((p.won / (p.won + p.lost)) * 100) : 0;
  const maxStatus = Math.max(1, ...p.byStatus.map((s) => s.count));
  const maxSource = Math.max(1, ...leads.bySource.map((s) => s.count));

  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="PIPELINE OFFEN" value={euro(p.pipelineValueOpen)} sub={`${p.open} offene Angebote`} />
        <KpiCard label="GEWONNEN" value={euro(p.wonValue)} sub={`${p.won} Abschlüsse`} valueColor="text-success" />
        <KpiCard label="ABSCHLUSSQUOTE" value={`${closeRate}%`} sub={`${p.won} gewonnen · ${p.lost} verloren`} valueColor={closeRate >= 30 ? 'text-success' : 'text-fg'} />
        <KpiCard label="KONTAKTE" value={`${leads.total.toLocaleString('de-DE')}${leads.capped ? '+' : ''}`} sub="Leads & Kunden" />
      </div>

      <div className="flex gap-4 items-start">
        {/* Upcoming appointments */}
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader title="Anstehende Termine" right={<Pill label="LIVE" tone="success" />} />
          {events.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-fg3">Keine anstehenden Termine</div>
          ) : (
            events.map((e, i) => (
              <div key={e.id} className={`flex gap-3.5 px-5 py-3.5 ${i < events.length - 1 ? 'border-b border-line' : ''}`}>
                <div className="shrink-0 w-9 h-9 rounded-lg bg-info-bg flex items-center justify-center text-info">◷</div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-fg truncate">{e.title}</span>
                  <span className="text-[11px] text-fg3">
                    {fmtDate(e.start)}{e.location ? ` · ${e.location}` : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Right column */}
        <div className="w-[412px] shrink-0 flex flex-col gap-4">
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Pipeline nach Status</h3>
            {p.byStatus.slice(0, 6).map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-xs text-fg2 w-[150px] truncate" title={s.status}>{s.status}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / maxStatus) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-fg w-8 text-right">{s.count}</span>
              </div>
            ))}
          </Card>

          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Lead-Quellen</h3>
            {leads.bySource.slice(0, 6).map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-xs text-fg2 w-[150px] truncate" title={s.source}>{s.source}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                  <div className="h-full rounded-full bg-success" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-fg w-8 text-right">{s.count}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============ MOCK — public demo fallback ============
const activities = [
  ['10:42', 'Mahnbot', "3 Rechnungen mit Status 'überfällig' erkannt — Erinnerungsmails versendet", 'success'],
  ['10:38', 'Lead-Sync (Reonic)', '12 neue Leads importiert, 2 mit fehlender Telefonnummer markiert', 'info'],
  ['10:31', 'Termin-Bot', 'Beratungstermin von Michael K. bestätigt + Google Meet erstellt', 'success'],
  ['10:24', 'Bexio-Sync', "Rechnung #2026-0341 erstellt für 'Familie Huber' (€ 24.500)", 'info'],
  ['10:12', 'WhatsApp-Bot', '5 Kundenanfragen automatisch beantwortet · 1 an Sarah eskaliert', 'warning'],
  ['09:58', 'Call-Bot', '8 verpasste Anrufe erkannt — Rückruftermine vorgeschlagen', 'info'],
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
        <KpiCard label="AKTIVE BOTS" value="12" sub="von 14 konfiguriert" delta="+2" spark={[10, 10, 11, 11, 12, 11, 12]} sparkColor="#4ADE80" />
        <KpiCard label="HEUTE AUSGEFÜHRT" value="347" sub="ggü. gestern" delta="+18%" spark={[212, 238, 254, 271, 289, 294, 347]} sparkColor="#4ADE80" />
        <KpiCard label="FEHLERQUOTE" value="0.4%" sub="letzte 24h" delta="−0.2%" spark={[1.1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4]} sparkColor="#4ADE80" />
        <KpiCard label="CONNECTOREN" value="8/8" sub="alle synchron" spark={[8, 8, 7, 8, 8, 8, 8]} sparkColor="#FACC15" />
      </div>
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader title="Live-Aktivität" right={<Pill label="DEMO" tone="neutral" />} />
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
            <h3 className="font-semibold text-[13px] text-fg">Demo-Modus</h3>
          </div>
          <p className="text-xs text-fg2 leading-[18px]">
            Diese Ansicht zeigt Beispieldaten. Mit verbundenem Reonic-Connector erscheinen hier die echte Pipeline,
            Lead-Quellen und anstehende Termine.
          </p>
        </Card>
      </div>
    </div>
  );
}
