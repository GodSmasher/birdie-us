import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { DemoView } from '@/components/birdie-guide';
import { isDemoMode } from '@/app/lib/demo-mode';
import { getConnectorStatuses, type ConnStatus } from '@/app/lib/connector-status';

export const dynamic = 'force-dynamic';

function syncAgo(iso?: string): string {
  if (!iso) return '';
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (Number.isNaN(min)) return '';
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} hrs ago`;
  return `${Math.round(h / 24)} days ago`;
}

function ConnectorCard({ c }: { c: ConnStatus }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">
          {c.name.slice(0, 2)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-[13px] text-fg leading-tight truncate">{c.name}</span>
          <span className="text-[10px] text-fg3">{c.category} · {c.protocol}</span>
        </div>
        <span className={`ml-auto w-2 h-2 rounded-full ${c.connected ? 'bg-success' : 'bg-fg4'}`} />
      </div>
      <p className="text-[11px] text-fg2 leading-[15px] min-h-[30px]">{c.detail}</p>
      <div className="border-t border-line pt-2.5 flex items-center justify-between">
        {c.connected ? <Pill label="CONNECTED" tone="success" /> : <Pill label="AVAILABLE" tone="neutral" />}
        {c.connected && c.lastSync && <span className="text-[10px] text-fg3">Sync {syncAgo(c.lastSync)}</span>}
      </div>
    </div>
  );
}

export default async function ConnectorsPage() {
  if (isDemoMode()) {
    return (
      <>
        <Sidebar active="connectors" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Connectors" subtitle="Integrations · APIs · Data Bridges" />
          <DemoView message="Connectors bridge .birdie and your existing tools. Here's what it looks like once a few are connected — each green dot means live data flowing in.">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3"><h2 className="font-semibold text-sm text-fg">Connected</h2><Pill label="LIVE" tone="success" /></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[{ name: 'Google Workspace', cat: 'Email · Calendar · Drive' },{ name: 'Aurora Solar', cat: 'CRM · Proposals' },{ name: 'QuickBooks', cat: 'Accounting' },{ name: 'SolarEdge', cat: 'Monitoring · Fleet' },{ name: 'Slack', cat: 'Team Chat' }].map(c => (
                    <div key={c.name} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">{c.name.slice(0, 2)}</div>
                        <div className="flex flex-col min-w-0"><span className="font-semibold text-[12px] text-fg truncate">{c.name}</span><span className="text-[10px] text-fg3">{c.cat}</span></div>
                        <span className="ml-auto w-2.5 h-2.5 rounded-full bg-success" />
                      </div>
                      <div className="border-t border-line pt-2"><Pill label="CONNECTED" tone="success" /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3"><h2 className="font-semibold text-sm text-fg">Available</h2></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 opacity-70">
                  {[{ name: 'Enphase', cat: 'Monitoring · Fleet' },{ name: 'Salesforce', cat: 'CRM · Pipeline' },{ name: 'HubSpot', cat: 'CRM · Marketing' },{ name: 'Stripe', cat: 'Payments' },{ name: 'Calendly', cat: 'Scheduling' },{ name: 'Zapier', cat: 'Integration Hub' }].map(c => (
                    <div key={c.name} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">{c.name.slice(0, 2)}</div>
                        <div className="flex flex-col min-w-0"><span className="font-semibold text-[12px] text-fg truncate">{c.name}</span><span className="text-[10px] text-fg3">{c.cat}</span></div>
                        <span className="ml-auto w-2.5 h-2.5 rounded-full bg-fg4" />
                      </div>
                      <div className="border-t border-line pt-2"><Pill label="AVAILABLE" tone="neutral" /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DemoView>
        </main>
      </>
    );
  }
  const { connected, available } = await getConnectorStatuses();

  return (
    <>
      <Sidebar active="connectors" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Connectors" subtitle={`${connected.length} connected · ${available.length} available`} />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="bg-surface border border-line rounded-[10px] px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-info font-bold text-sm">ℹ</div>
            <span className="text-xs text-fg2">
              Connectors are set up by .birdie. Here you can see the real-time status — what is connected and
              when it was last synced.
            </span>
            <button className="ml-auto shrink-0 px-3.5 py-2 bg-surface-2 border border-line-2 rounded-lg text-xs font-medium text-fg">
              Request connector
            </button>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-sm text-fg tracking-tightest">Connected</h2>
              <Pill label="LIVE" tone="success" />
              <span className="text-[11px] text-fg3">{connected.length} active connections</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {connected.map((c) => <ConnectorCard key={c.id} c={c} />)}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-sm text-fg tracking-tightest">Available</h2>
              <span className="text-[11px] text-fg3">in preparation / available on request</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-70">
              {available.map((c) => <ConnectorCard key={c.id} c={c} />)}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
