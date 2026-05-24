import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { getConnectorStatuses, type ConnStatus } from '@/app/lib/connector-status';

export const dynamic = 'force-dynamic';

function syncAgo(iso?: string): string {
  if (!iso) return '';
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (Number.isNaN(min)) return '';
  if (min < 1) return 'gerade eben';
  if (min < 60) return `vor ${min} Min`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std`;
  return `vor ${Math.round(h / 24)} Tagen`;
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
        {c.connected ? <Pill label="VERBUNDEN" tone="success" /> : <Pill label="VERFÜGBAR" tone="neutral" />}
        {c.connected && c.lastSync && <span className="text-[10px] text-fg3">Sync {syncAgo(c.lastSync)}</span>}
      </div>
    </div>
  );
}

export default async function ConnectorsPage() {
  const { connected, available } = await getConnectorStatuses();

  return (
    <>
      <Sidebar active="connectors" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Connectoren" subtitle={`${connected.length} verbunden · ${available.length} verfügbar`} />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="bg-surface border border-line rounded-[10px] px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-info font-bold text-sm">ℹ</div>
            <span className="text-xs text-fg2">
              Connectoren werden von .birdie eingerichtet. Hier siehst du den echten Live-Stand — was verbunden ist und
              wann zuletzt synchronisiert wurde.
            </span>
            <button className="ml-auto shrink-0 px-3.5 py-2 bg-surface-2 border border-line-2 rounded-lg text-xs font-medium text-fg">
              Connector anfragen
            </button>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-sm text-fg tracking-tightest">Verbunden</h2>
              <Pill label="LIVE" tone="success" />
              <span className="text-[11px] text-fg3">{connected.length} aktive Verbindungen</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {connected.map((c) => <ConnectorCard key={c.id} c={c} />)}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-sm text-fg tracking-tightest">Verfügbar</h2>
              <span className="text-[11px] text-fg3">in Vorbereitung / auf Anfrage aktivierbar</span>
            </div>
            <div className="grid grid-cols-4 gap-4 opacity-70">
              {available.map((c) => <ConnectorCard key={c.id} c={c} />)}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
