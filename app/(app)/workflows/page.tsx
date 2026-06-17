import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { OnboardingView } from '@/components/onboarding';
import { ONBOARDING_WORKFLOWS } from '@/app/lib/onboarding-data';
import { isDemoMode } from '@/app/lib/demo-mode';
import { voltaBots as bots } from '@/lib/volta-bots';
import { getConnectorStatuses } from '@/app/lib/connector-status';

export const dynamic = 'force-dynamic';

const catLabel: Record<string, string> = {
  FIN: 'Finance', CRM: 'CRM & Data', KOM: 'Communication', PRJ: 'Projects & Grid', IOT: 'IoT & Monitoring',
};

function syncAgo(iso?: string): string {
  if (!iso) return '—';
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (Number.isNaN(min)) return '—';
  if (min < 60) return `${Math.max(1, min)} min ago`;
  const h = Math.round(min / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export default async function WorkflowsPage() {
  if (isDemoMode()) {
    return (
      <>
        <Sidebar active="workflows" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Workflows" subtitle="Automations · Triggers · End-to-End" />
          <div className="flex-1 px-8 py-7">
            <OnboardingView {...ONBOARDING_WORKFLOWS} />
          </div>
        </main>
      </>
    );
  }
  const { connected } = await getConnectorStatuses();
  const reonic = connected.find((c) => c.id === 'reonic');
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
        <TopBar title="Workflows" subtitle={`${bots.length} automations · n8n · managed by .birdie`} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="bg-surface border border-line rounded-[10px] px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">→</div>
            <span className="text-xs text-fg2">
              Workflows run isolated per customer (n8n). They connect your connectors into automations — setup &
              changes managed through .birdie.
            </span>
          </div>

          {reonic && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-sm text-fg tracking-tightest">Active (live)</h2>
                <Pill label="RUNNING" tone="success" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success-bg flex items-center justify-center text-success">↻</div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[13px] text-fg">CRM Sync</span>
                      <span className="text-[11px] text-fg3">Cron · daily 03:00</span>
                    </div>
                    <div className="ml-auto"><Pill label="LIVE" tone="success" /></div>
                  </div>
                  <p className="text-xs text-fg2 leading-[18px]">
                    Pulls offers, contacts, components, teams & users from CRM into the .birdie database.
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
            <h2 className="font-semibold text-sm text-fg tracking-tightest">Available Automations</h2>
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
