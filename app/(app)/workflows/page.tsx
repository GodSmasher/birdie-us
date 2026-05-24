import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { bots } from '@/lib/data';

export const dynamic = 'force-dynamic';

const catLabel: Record<string, string> = {
  FIN: 'Finanzen', VTR: 'Vertrieb', KOM: 'Kommunikation', ALL: 'Allgemein', PRJ: 'Projekte',
};

export default function WorkflowsPage() {
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
