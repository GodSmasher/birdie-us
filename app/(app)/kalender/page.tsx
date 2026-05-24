import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, Pill } from '@/components/ui';
import { getGoogleCalendar } from '@/app/lib/google-server';

export const dynamic = 'force-dynamic';

function fmtDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
}
function fmtTime(e: { start: string; end?: string; allDay: boolean }): string {
  if (e.allDay) return 'ganztägig';
  const s = new Date(e.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const en = e.end ? new Date(e.end).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';
  return en ? `${s}–${en}` : s;
}

export default async function KalenderPage() {
  const cal = await getGoogleCalendar();

  // group events by day
  const groups = new Map<string, typeof cal.events>();
  for (const e of cal.events) {
    const key = e.start.slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return (
    <>
      <Sidebar active="kalender" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Kalender" subtitle={cal.configured && !cal.error ? `${cal.events.length} anstehende Termine · Google Workspace` : 'Google Workspace · Kalender'} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[900px]">
          {!cal.configured && (
            <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[640px] mx-auto mt-8">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-accent text-xl">◷</div>
              <h2 className="font-semibold text-lg text-fg tracking-tightest">Google Workspace nicht verbunden</h2>
              <p className="text-[13px] text-fg2 leading-[20px] max-w-[460px]">Mit verbundenem Workspace erscheinen hier die anstehenden Termine live aus Google Calendar.</p>
            </Card>
          )}
          {cal.configured && cal.error && (
            <Card className="p-5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-error-bg flex items-center justify-center text-error font-bold">!</div>
              <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Kalender nicht erreichbar</span><span className="text-xs text-fg2">{cal.error}</span></div>
            </Card>
          )}
          {cal.configured && !cal.error && (
            cal.events.length === 0 ? (
              <Card className="p-10 text-center text-sm text-fg3">Keine anstehenden Termine</Card>
            ) : (
              [...groups.entries()].map(([day, events]) => (
                <Card key={day} className="overflow-hidden">
                  <CardHeader title={fmtDay(day)} right={<Pill label="LIVE" tone="success" />} />
                  {events.map((e, i) => (
                    <div key={e.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2/40 transition-colors ${i < events.length - 1 ? 'border-b border-line' : ''}`}>
                      <div className="w-[90px] shrink-0 text-xs font-medium text-fg2">{fmtTime(e)}</div>
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <span className="text-[13px] font-medium text-fg truncate">{e.title}</span>
                        {(e.location || e.attendees > 0) && (
                          <span className="text-[11px] text-fg3 truncate">
                            {e.location}{e.location && e.attendees > 0 ? ' · ' : ''}{e.attendees > 0 ? `${e.attendees} Teilnehmer` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              ))
            )
          )}
        </div>
      </main>
    </>
  );
}
