import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Pill } from '@/components/ui';
import { connectorGroups, type ConnState } from '@/lib/data';

const stateToPill: Record<ConnState, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  online: { label: 'ONLINE', tone: 'success' },
  warn: { label: 'HINWEIS', tone: 'warning' },
  paused: { label: 'PAUSE', tone: 'neutral' },
};

export default function ConnectorsPage() {
  const total = connectorGroups.reduce((n, g) => n + g.items.length, 0);
  const online = connectorGroups.reduce((n, g) => n + g.items.filter((i) => i.state === 'online').length, 0);

  return (
    <>
      <Sidebar active="connectors" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Connectoren" subtitle={`${total} Tools · ${online} online · konfiguriert durch .birdie Team`} />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {/* Banner */}
          <div className="bg-surface border border-line rounded-[10px] px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-info font-bold text-sm">ℹ</div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-[13px] text-fg">Connectoren werden persönlich eingerichtet</span>
              <span className="text-xs text-fg2">
                Wechselrichter, Speicher, Tarife & Wetter pro Anlage angebunden. Für neue Verbindungen schreib uns — Antwort
                innert 24h.
              </span>
            </div>
            <button className="ml-auto shrink-0 px-3.5 py-2 bg-surface-2 border border-line-2 rounded-lg text-xs font-medium text-fg">
              Connector anfragen
            </button>
          </div>

          {connectorGroups.map((group) => (
            <section key={group.group} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <h2 className="font-semibold text-sm text-fg tracking-tightest">{group.group}</h2>
                <span className="text-[11px] text-fg3">{group.desc}</span>
                <span className="ml-auto text-[11px] text-fg3">{group.items.length} Connectoren</span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {group.items.map((c) => (
                  <div
                    key={c.name}
                    className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3 hover:border-line-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">
                        {c.letter}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[13px] text-fg leading-tight truncate">{c.name}</span>
                        <span className="text-[10px] text-fg3">{c.protocol}</span>
                      </div>
                      <div className="ml-auto">
                        <span
                          className={`w-2 h-2 rounded-full block ${
                            c.state === 'online' ? 'bg-success' : c.state === 'warn' ? 'bg-warning' : 'bg-fg4'
                          }`}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-fg2 leading-[15px] min-h-[30px]">{c.detail}</p>

                    <div className="border-t border-line pt-2.5 flex items-center justify-between">
                      <Pill label={stateToPill[c.state].label} tone={stateToPill[c.state].tone} />
                      <span className="text-[10px] text-fg3">{c.sync}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
