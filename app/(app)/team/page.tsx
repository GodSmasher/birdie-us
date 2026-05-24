import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getEntities } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

interface User { id: string; name: string; email?: string; role?: string }
interface Team { id: string; name: string }

const roleLabel: Record<string, string> = {
  admin: 'Admin', owner: 'Inhaber', member: 'Mitarbeiter', user: 'Mitarbeiter',
};

export default async function TeamPage() {
  const [users, teams] = await Promise.all([getEntities<User>('user'), getEntities<Team>('team')]);
  const configured = users.length > 0 || teams.length > 0;
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Sidebar active="team" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Team" subtitle={configured ? `${users.length} Mitarbeiter · ${teams.length} Teams · aus Reonic` : 'Team & Rollen'} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {!configured ? (
            <Card className="p-8 text-center text-sm text-fg3 max-w-[560px] mx-auto mt-8">
              Sobald Reonic verbunden + synchronisiert ist, erscheinen hier alle Mitarbeiter und Teams.
            </Card>
          ) : (
            <>
              <div className="flex gap-4">
                <KpiCard label="MITARBEITER" value={users.length.toLocaleString('de-DE')} sub="im CRM" />
                <KpiCard label="TEAMS" value={teams.length.toLocaleString('de-DE')} sub="Vertrieb & Backoffice" />
                <KpiCard label="QUELLE" value="Reonic" sub="live synchronisiert" />
                <KpiCard label="ZUGRIFF" value="read-only" sub="verwaltet durch .birdie" />
              </div>

              <div className="flex gap-4 items-start">
                <Card className="flex-1 min-w-0 overflow-hidden">
                  <CardHeader title="Mitarbeiter" right={<Pill label="LIVE" tone="success" />} />
                  <div className="grid grid-cols-[1fr_240px_140px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                    <span>NAME</span><span>E-MAIL</span><span>ROLLE</span>
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
