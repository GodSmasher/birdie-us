import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { voltaBots as bots } from '@/lib/volta-bots';
import { getConnectorStatuses } from '@/app/lib/connector-status';

export const dynamic = 'force-dynamic';

const catLabel: Record<string, string> = {
  FIN: 'Finanzen', CRM: 'CRM & Daten', KOM: 'Kommunikation', PRJ: 'Projekte & Netz', IOT: 'IoT & Monitoring',
};

function syncAgo(iso?: string): string {
  if (!iso) return '—';
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (Number.isNaN(min)) return '—';
  if (min < 60) return `vor ${Math.max(1, min)} Min`;
  const h = Math.round(min / 60);
  return h < 24 ? `vor ${h} Std` : `vor ${Math.round(h / 24)} Tagen`;
}

export default async function WorkflowsPage() {
  const { connected } = await getConnectorStatuses();
  const reonic = connected.find((c) => c.id === 'reonic');
  // Group automations by category
  const groups = new Map<string, typeof bots>();
  for (const b of bots) {
    const k = b.cat;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(b);
  }

  return (
    <>
      <Sidebar active="workflows" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Workflows" subtitle={`${bots.length} Automatisierungen · n8n · verwaltet durch .birdie`} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="bg-surface border border-line rounded-[10px] px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">→</div>
            <span className="text-xs text-fg2">
              Workflows laufen isoliert pro Kunde (n8n). Sie verbinden deine Connectoren zu Automationen — Einrichtung &
              Änderung über .birdie.
            </span>
          </div>

          {reonic && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-sm text-fg tracking-tightest">Aktiv (live)</h2>
                <Pill label="LÄUFT" tone="success" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success-bg flex items-center justify-center text-success">↻</div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[13px] text-fg">Reonic-Sync</span>
                      <span className="text-[11px] text-fg3">Cron · täglich 03:00</span>
                    </div>
                    <div className="ml-auto"><Pill label="LIVE" tone="success" /></div>
                  </div>
                  <p className="text-xs text-fg2 leading-[18px]">
                    Zieht Angebote, Kontakte, Komponenten, Teams & Nutzer aus Reonic in die .birdie-Datenbank.
                  </p>
                  <div className="border-t border-line pt-2.5 flex items-center justify-between text-[11px] text-fg3">
                    <span>{reonic.detail}</span>
                    <span>Sync {syncAgo(reonic.lastSync)}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex items-center gap-3 pt-1">
            <h2 className="font-semibold text-sm text-fg tracking-tightest">Verfügbare Automatisierungen</h2>
            <Pill label="DEMO" tone="neutral" />
          </div>

          {[...groups.entries()].map(([cat, items]) => (
            <section key={cat} className="flex flex-col gap-3">
              <h2 className="font-semibold text-sm text-fg tracking-tightest">{catLabel[cat] ?? cat}</h2>
              <div className="grid grid-cols-3 gap-4">
                {items.map((b) => (
                  <div key={b.slug} className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-accent">→</div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[13px] text-fg">{b.name}</span>
                        <span className="text-[11px] text-fg3">{b.trigger}</span>
                      </div>
                      <div className="ml-auto">
                        <Pill label={b.pill} tone={b.state} />
                      </div>
                    </div>
                    <p className="text-xs text-fg2 leading-[18px]">{b.desc}</p>
                    <div className="border-t border-line pt-2.5 flex items-center justify-between text-[11px] text-fg3">
                      <span>{b.conns}</span>
                      <span>{b.schedule}</span>
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
