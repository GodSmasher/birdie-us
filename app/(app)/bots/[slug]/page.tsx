import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardHeader, KpiCard, Pill, Tag } from '@/components/ui';
import { BarChart24h, HourAxis } from '@/components/sparkline';
import { bots, getBot } from '@/lib/data';

export function generateStaticParams() {
  return bots.map((b) => ({ slug: b.slug }));
}

const stateToColor = {
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  neutral: '#6B7280',
} as const;

const logColors: Record<string, string> = {
  INFO: 'text-info',
  WARN: 'text-warning',
  ERROR: 'text-error',
  SUCCESS: 'text-success',
  OUT: 'text-accent',
};

export default function BotDetailPage({ params }: { params: { slug: string } }) {
  const bot = getBot(params.slug);
  if (!bot) notFound();

  const chartColor = stateToColor[bot.state];

  return (
    <>
      <Sidebar active="bots" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        {/* Custom topbar */}
        <header className="h-[96px] shrink-0 bg-bg border-b border-line flex flex-col justify-center px-8 gap-2 sticky top-0 z-10">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Link href="/bots" className="text-fg3 hover:text-fg2">Bots</Link>
            <span className="text-fg4">/</span>
            <span className="text-fg2 font-medium">{bot.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-xl text-fg tracking-tightest">{bot.name}</h1>
            <Tag label={bot.version} tone="neutral" />
            <Pill label={bot.pill} tone={bot.state} />
            <span className="text-xs text-fg3">{bot.conns}</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="px-3.5 py-2 bg-surface-2 border border-line rounded-lg font-medium text-xs text-fg hover:border-line-2">
                Git-Diff
              </button>
              <button className="px-3.5 py-2 bg-surface-2 border border-line rounded-lg font-medium text-xs text-fg hover:border-line-2 flex items-center gap-1.5">
                <span className="text-success">▷</span> Test ausführen
              </button>
              <button className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs">
                {bot.pill === 'PAUSE' ? 'Bot aktivieren' : 'Bot pausieren'}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {/* KPIs */}
          <div className="flex gap-4">
            <KpiCard label="HEUTE AUSGEFÜHRT" value={bot.runs} sub="letzte 24h" />
            <KpiCard label="ERFOLGSQUOTE" value={bot.successRate} sub="rolling 30d" valueColor={bot.state === 'success' ? 'text-success' : 'text-fg'} />
            <KpiCard label="Ø DAUER" value={bot.avgDuration} sub="pro Ausführung" />
            <KpiCard label="LETZTER LAUF" value={bot.lastRun} sub={bot.schedule} />
          </div>

          {/* Chart */}
          <Card className="p-5">
            <div className="flex items-center mb-4">
              <h2 className="font-semibold text-sm text-fg">Aktivität · letzte 24 Stunden</h2>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-[11px] text-fg3">Ausführungen pro Stunde</span>
                <Pill label="LIVE" tone="success" />
              </div>
            </div>
            <BarChart24h data={bot.activity24h} color={chartColor} />
            <HourAxis />
          </Card>

          {/* 2-col: Runs + Config */}
          <div className="flex gap-4">
            {/* Runs table */}
            <Card className="flex-1 min-w-0 overflow-hidden">
              <CardHeader
                title="Letzte Ausführungen"
                right={<span className="text-[11px] text-fg3">{bot.recentRuns.length} sichtbar</span>}
              />
              <div className="grid grid-cols-[100px_120px_130px_1fr] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                <span>ZEIT</span>
                <span>DAUER</span>
                <span>STATUS</span>
                <span>OUTPUT</span>
              </div>
              {bot.recentRuns.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-fg3">Noch keine Ausführungen</div>
              ) : (
                bot.recentRuns.map((r, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[100px_120px_130px_1fr] h-[52px] items-center px-5 hover:bg-surface-2/40 transition-colors ${
                      i < bot.recentRuns.length - 1 ? 'border-b border-line' : ''
                    }`}
                  >
                    <span className="text-xs font-medium text-fg2">{r.time}</span>
                    <span className="text-xs text-fg2">{r.duration}</span>
                    <div>
                      <Pill
                        label={r.state === 'success' ? 'OK' : r.state === 'warning' ? 'WARN' : 'FEHLER'}
                        tone={r.state}
                      />
                    </div>
                    <span className="text-xs text-fg truncate">{r.output}</span>
                  </div>
                ))
              )}
            </Card>

            {/* Config */}
            <div className="w-[392px] shrink-0 flex flex-col gap-4">
              <Card className="p-5 flex flex-col gap-3.5">
                <h3 className="font-semibold text-[13px] text-fg">Konfiguration</h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center">
                    <span className="text-fg2">Trigger</span>
                    <span className="ml-auto font-medium text-fg">{bot.trigger}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-fg2">Schedule</span>
                    <span className="ml-auto font-medium text-fg">{bot.schedule}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-fg2">Connectoren</span>
                    <span className="ml-auto font-medium text-fg">{bot.conns}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-fg2">Version</span>
                    <span className="ml-auto font-medium text-fg">{bot.version}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 flex flex-col gap-3">
                <h3 className="font-semibold text-[13px] text-fg">Environment</h3>
                <div className="flex flex-col gap-2 bg-bg border border-line rounded-lg p-3">
                  {bot.envVars.map((v) => (
                    <div key={v.key} className="flex items-center text-[11px]">
                      <span className="font-medium text-fg2 font-mono">{v.key}</span>
                      <span className="ml-auto text-fg3 font-mono truncate max-w-[180px]">{v.value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 flex flex-col gap-2">
                <h3 className="font-semibold text-[13px] text-fg">Danger Zone</h3>
                <p className="text-[11px] text-fg3 leading-[16px]">
                  Konfiguration ändern oder Bot löschen → schreib direkt an Sarah, geht nicht selber.
                </p>
                <button className="mt-1 self-start px-3 py-1.5 bg-surface-2 border border-line rounded-md text-[11px] font-medium text-fg">
                  Anfrage an .birdie Team
                </button>
              </Card>
            </div>
          </div>

          {/* Logs */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Live-Logs"
              right={
                <div className="flex items-center gap-2">
                  <Pill label="LIVE" tone="success" />
                  <button className="text-[11px] text-fg3 hover:text-fg">Pause</button>
                  <button className="text-[11px] text-fg3 hover:text-fg">Download</button>
                </div>
              }
            />
            <div className="bg-bg/40 px-5 py-4 font-mono text-[11px] leading-[20px] max-h-[280px] overflow-y-auto">
              {bot.logs.length === 0 ? (
                <div className="text-center text-fg3 py-10">Keine Logs</div>
              ) : (
                bot.logs.map((l, i) => (
                  <div key={i} className="flex gap-3 hover:bg-surface-2/30 -mx-2 px-2 rounded">
                    <span className="text-fg4 shrink-0 w-[110px]">{l.ts}</span>
                    <span className={`shrink-0 w-[64px] font-semibold tracking-wider ${logColors[l.level]}`}>
                      {l.level}
                    </span>
                    <span className={l.level === 'OUT' ? 'text-fg2' : 'text-fg'}>{l.msg}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
