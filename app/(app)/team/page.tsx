import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getEntities } from '@/app/lib/db';
import { isDemoMode } from '@/app/lib/demo-mode';
import { DemoView } from '@/components/birdie-guide';

export const dynamic = 'force-dynamic';

interface User { id: string; name: string; email?: string; role?: string }
interface Team { id: string; name: string }

const roleLabel: Record<string, string> = {
  admin: 'Admin', owner: 'Owner', member: 'Member', user: 'Member',
};

export default async function TeamPage() {
  let [users, teams] = await Promise.all([getEntities<User>('user'), getEntities<Team>('team')]);

  if (!users.length && !teams.length && isDemoMode()) {
    return (
      <>
        <Sidebar active="team" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Team" subtitle="Members · Roles · Access Control" />
          <DemoView message="Invite your team — sales reps, installers, admins. Everyone sees only what they need. Role-based access keeps things clean.">
            <div className="grid grid-cols-3 gap-3">
              {[{ name: 'Sarah Vogel', role: 'Owner', team: 'Admin' },{ name: 'John Miller', role: 'Sales Rep', team: 'Sales West' },{ name: 'Sarah Parker', role: 'Sales Rep', team: 'Sales East' },{ name: 'Mike Chen', role: 'Project Mgr', team: 'Operations' },{ name: 'Lisa Torres', role: 'Installer', team: 'Crew A' }].map(u => (
                <Card key={u.name} className="p-4 flex items-center gap-3 opacity-75">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">{u.name.split(' ').map(w => w[0]).join('')}</div>
                  <div className="flex flex-col min-w-0"><span className="text-[12px] font-semibold text-fg truncate">{u.name}</span><span className="text-[10px] text-fg3">{u.role} · {u.team}</span></div>
                </Card>
              ))}
              <Card className="p-4 flex items-center justify-center border-dashed border-accent/20 opacity-75"><span className="text-accent text-[13px] font-medium">+ Invite Member</span></Card>
            </div>
          </DemoView>
        </main>
      </>
    );
  }

  const configured = users.length > 0 || teams.length > 0;
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Sidebar active="team" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Team" subtitle={configured ? `${users.length} members · ${teams.length} teams · from Reonic` : 'Team & Roles'} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {!configured ? (
            <Card className="p-8 text-center text-sm text-fg3 max-w-[560px] mx-auto mt-8">
              Once Reonic is connected and synced, all members and teams will appear here.
            </Card>
          ) : (
            <>
              <div className="flex flex-wrap gap-4">
                <KpiCard label="MEMBERS" value={users.length.toLocaleString('en-US')} sub="in CRM" />
                <KpiCard label="TEAMS" value={teams.length.toLocaleString('en-US')} sub="Sales & Back Office" />
                <KpiCard label="SOURCE" value="Reonic" sub="live synced" />
                <KpiCard label="ACCESS" value="read-only" sub="managed by .birdie" />
              </div>

              <div className="flex gap-4 items-start">
                <Card className="flex-1 min-w-0 overflow-hidden">
                  <CardHeader title="Members" right={<Pill label="LIVE" tone="success" />} />
                  <div className="grid grid-cols-[1fr_240px_140px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                    <span>NAME</span><span>EMAIL</span><span>ROLE</span>
                  </div>
                  <div className="max-h-[560px] overflow-y-auto">
                    {sorted.map((u, i) => (
                      <div key={u.id} className={`grid grid-cols-[1fr_240px_140px] h-[44px] items-center px-5 hover:bg-surface-2/40 transition-colors ${i < sorted.length - 1 ? 'border-b border-line' : ''}`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-semibold text-fg shrink-0">
                            {u.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-[13px] font-medium text-fg truncate">{u.name}</span>
                        </div>
                        <span className="text-xs text-fg2 truncate pr-2">{u.email ?? '—'}</span>
                        <span className="text-xs text-fg2">{u.role ? roleLabel[u.role] ?? u.role : '—'}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="w-[320px] shrink-0 overflow-hidden self-start">
                  <CardHeader title="Teams" right={<span className="text-[11px] text-fg3">{teams.length}</span>} />
                  <div className="max-h-[560px] overflow-y-auto">
                    {[...teams].sort((a, b) => a.name.localeCompare(b.name)).map((t, i) => (
                      <div key={t.id} className={`flex items-center gap-2.5 px-5 h-11 ${i < teams.length - 1 ? 'border-b border-line' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-[13px] text-fg truncate">{t.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
