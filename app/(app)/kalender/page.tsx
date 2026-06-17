import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, Pill } from '@/components/ui';
import { getGoogleCalendar } from '@/app/lib/google-server';
import { isDemoMode } from '@/app/lib/demo-mode';
import { OnboardingView } from '@/components/onboarding';
import { ONBOARDING_CALENDAR } from '@/app/lib/onboarding-data';

export const dynamic = 'force-dynamic';

function fmtDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long' });
}
function fmtTime(e: { start: string; end?: string; allDay: boolean }): string {
  if (e.allDay) return 'all day';
  const s = new Date(e.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const en = e.end ? new Date(e.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  return en ? `${s}–${en}` : s;
}

export default async function KalenderPage() {
  let cal = await getGoogleCalendar();

  if (!cal.configured && isDemoMode()) {
    return (
      <>
        <Sidebar active="kalender" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Calendar" subtitle="Scheduling · Inspections · Site Surveys" />
          <div className="flex-1 px-8 py-7">
            <OnboardingView {...ONBOARDING_CALENDAR} />
          </div>
        </main>
      </>
    );
  }

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
        <TopBar title="Calendar" subtitle={cal.configured && !cal.error ? `${cal.events.length} events from ${cal.calendarCount} calendars · Google Workspace` : 'Google Workspace · Calendar'} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-4 max-w-[820px]">
          {!cal.configured && (
            <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[640px] mx-auto mt-8">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-accent text-xl">◷</div>
              <h2 className="font-semibold text-lg text-fg tracking-tightest">Google Workspace not connected</h2>
              <p className="text-[13px] text-fg2 leading-[20px] max-w-[460px]">Once Workspace is connected, upcoming events from Google Calendar will appear here live.</p>
            </Card>
          )}
          {cal.configured && cal.error && (
            <Card className="p-5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-error-bg flex items-center justify-center text-error font-bold">!</div>
              <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Calendar unreachable</span><span className="text-xs text-fg2">{cal.error}</span></div>
            </Card>
          )}
          {cal.configured && !cal.error && (
            cal.events.length === 0 ? (
              <Card className="p-10 text-center text-sm text-fg3">No upcoming events</Card>
            ) : (
              [...groups.entries()].map(([day, events]) => (
                <Card key={day} className="overflow-hidden">
                  <CardHeader title={fmtDay(day)} right={<Pill label="LIVE" tone="success" />} />
                  {events.map((e, i) => (
                    <div key={e.id} className={`flex items-center gap-4 px-5 py-2.5 hover:bg-surface-2/40 transition-colors ${i < events.length - 1 ? 'border-b border-line' : ''}`}>
                      <div className="w-[90px] shrink-0 text-xs font-medium text-fg2">{fmtTime(e)}</div>
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <span className="text-[13px] font-medium text-fg truncate">{e.title}</span>
                        {(e.location || e.attendees > 0) && (
                          <span className="text-[11px] text-fg3 truncate">
                            {e.location}{e.location && e.attendees > 0 ? ' · ' : ''}{e.attendees > 0 ? `${e.attendees} attendee${e.attendees > 1 ? 's' : ''}` : ''}
                          </span>
                        )}
                      </div>
                      {e.owner && <span className="text-[11px] text-fg2 shrink-0 max-w-[180px] truncate">{e.owner.split('@')[0]}</span>}
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
