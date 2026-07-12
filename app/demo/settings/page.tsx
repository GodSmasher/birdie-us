import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card } from '@/components/ui';
import { settingsTeam, notifRows, apiKeys } from '../crm-data';

export const metadata = { title: 'Settings' };

const roleTone: Record<string, string> = {
  Admin: 'bg-warning-bg text-warning',
  Manager: 'bg-info-bg text-info',
  Sales: 'bg-purple-bg text-purple',
  Installer: 'bg-surface-3 text-fg2',
};

export default function SettingsPage() {
  return (
    <>
      <CrmSidebar active="settings" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar title="Settings" subtitle="Volta Solar · Nashville, TN" />

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6 max-w-[720px]">

            {/* ── Company Info ── */}
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-[13px] font-semibold text-fg">Company Info</h2>
              <div className="grid grid-cols-[120px_1fr] gap-y-3 gap-x-4 items-center">
                <span className="text-fg2 text-[11px] font-medium">Company name</span>
                <input
                  readOnly
                  value="Volta Solar"
                  className="bg-surface-2 border border-line rounded-lg px-3 py-2 text-fg text-[13px] outline-none cursor-default"
                />
                <span className="text-fg2 text-[11px] font-medium">Address</span>
                <input
                  readOnly
                  value="2100 West End Ave, Nashville, TN 37203"
                  className="bg-surface-2 border border-line rounded-lg px-3 py-2 text-fg text-[13px] outline-none cursor-default"
                />
                <span className="text-fg2 text-[11px] font-medium">Phone</span>
                <input
                  readOnly
                  value="(615) 555-0100"
                  className="bg-surface-2 border border-line rounded-lg px-3 py-2 text-fg text-[13px] outline-none cursor-default"
                />
                <span className="text-fg2 text-[11px] font-medium">Website</span>
                <input
                  readOnly
                  value="voltasolar.com"
                  className="bg-surface-2 border border-line rounded-lg px-3 py-2 text-fg text-[13px] outline-none cursor-default"
                />
              </div>
            </Card>

            {/* ── Team ── */}
            <Card className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-fg">Team</h2>
                <button className="text-[11px] font-medium bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                  Invite member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-fg3 font-medium tracking-[0.12em]">
                      <th className="pb-2 pr-3">NAME</th>
                      <th className="pb-2 pr-3">EMAIL</th>
                      <th className="pb-2">ROLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settingsTeam.map(m => (
                      <tr key={m.email} className="border-t border-line">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-semibold text-fg2 shrink-0">
                              {m.init}
                            </span>
                            <span className="text-[12px] text-fg font-medium">{m.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-[12px] text-fg2">{m.email}</td>
                        <td className="py-2.5">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleTone[m.role] || 'bg-surface-3 text-fg2'}`}>
                            {m.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ── Notifications ── */}
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-[13px] font-semibold text-fg">Notifications</h2>
              <div className="grid grid-cols-[1fr_56px_56px_56px] gap-y-3 items-center">
                {/* Header row */}
                <span />
                <span className="text-[10px] text-fg3 font-medium text-center">Email</span>
                <span className="text-[10px] text-fg3 font-medium text-center">Push</span>
                <span className="text-[10px] text-fg3 font-medium text-center">SMS</span>

                {notifRows.map(r => (
                  <div key={r.label} className="contents">
                    <span className="text-[12px] text-fg">{r.label}</span>
                    {r.cells.map((on, ci) => (
                      <div key={ci} className="flex justify-center">
                        <span
                          className={`w-8 h-[18px] rounded-full flex items-center px-[2px] ${
                            on ? 'bg-success justify-end' : 'bg-surface-3 justify-start'
                          }`}
                        >
                          <span className="w-[14px] h-[14px] rounded-full bg-white" />
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Billing ── */}
            <Card className="p-5 flex flex-col gap-3">
              <h2 className="text-[13px] font-semibold text-fg">Billing</h2>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-fg">Plan:</span>
                <span className="text-[10px] font-medium bg-accent/15 text-accent px-2 py-0.5 rounded-full">Growth</span>
              </div>
              <span className="text-[22px] font-semibold text-fg leading-none">$2,500<span className="text-[12px] text-fg2 font-normal">/mo</span></span>
              <div className="flex gap-2 pt-1">
                <button className="text-[11px] font-medium bg-surface-2 border border-line text-fg px-3 py-1.5 rounded-lg hover:bg-surface-3 transition-colors">
                  Change plan
                </button>
                <button className="text-[11px] font-medium bg-surface-2 border border-line text-fg px-3 py-1.5 rounded-lg hover:bg-surface-3 transition-colors">
                  Billing history
                </button>
              </div>
            </Card>

            {/* ── API Keys ── */}
            <Card className="p-5 flex flex-col gap-3">
              <h2 className="text-[13px] font-semibold text-fg">API Keys</h2>
              <div className="flex flex-col gap-2">
                {apiKeys.map(k => (
                  <div key={k.label} className="flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-fg2 font-medium">{k.label}</span>
                      <span className="text-[12px] text-fg font-mono">{k.val}</span>
                    </div>
                    <button className="text-[11px] font-medium text-accent hover:opacity-80 transition-opacity">
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </main>
    </>
  );
}
