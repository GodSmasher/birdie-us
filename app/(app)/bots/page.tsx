import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Pill } from '@/components/ui';
import { Sparkline } from '@/components/sparkline';
import { voltaBots as bots } from '@/lib/volta-bots';

const tabs = [
  ['All', true, '8'],
  ['CRM', false, ''],
  ['Projects', false, ''],
  ['Finance', false, ''],
  ['Communication', false, ''],
  ['IoT', false, ''],
] as const;

export default function BotsPage() {
  return (
    <>
      <Sidebar active="bots" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Bots" subtitle={`${bots.length} Bots · ${bots.filter(b => b.state === 'success').length} active · Fleet Overview`} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-5">
          <div className="flex gap-2">
            {tabs.map(([n, active, cnt]) => (
              <button
                key={n}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
                  active ? 'bg-surface-2 text-fg border border-line-2 font-medium' : 'text-fg2 hover:text-fg'
                }`}
              >
                {n}
                {cnt && (
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-3 text-fg2 text-[10px] font-medium">
                    {cnt}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {bots.map((b) => {
              const sparkColor =
                b.state === 'success' ? '#4ADE80' : b.state === 'warning' ? '#FBBF24' : b.state === 'error' ? '#F87171' : '#6B7280';
              return (
                <Link
                  key={b.slug}
                  href={`/bots/${b.slug}`}
                  className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3 min-h-[208px] hover:border-line-2 hover:bg-surface-2/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center">
                      <span className="text-accent font-semibold text-[9px] tracking-[0.18em]">{b.cat}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-fg leading-tight">{b.name}</span>
                      <span className="text-[11px] text-fg3">{b.conns}</span>
                    </div>
                    <div className="ml-auto">
                      <Pill label={b.pill} tone={b.state} />
                    </div>
                  </div>

                  <p className="text-xs text-fg2 leading-[18px] flex-1">{b.desc}</p>

                  <div className="border-t border-line pt-3 flex items-end gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-fg3 tracking-[0.18em] font-semibold">TODAY</span>
                      <span className="text-base font-semibold text-fg leading-none">{b.runs}</span>
                    </div>
                    <div className="ml-auto opacity-80">
                      <Sparkline data={b.activity24h} color={sparkColor} fill width={120} height={32} />
                    </div>
                  </div>

                  <div className="flex items-center text-[11px]">
                    <span className="text-fg3">Success {b.successRate} · Avg {b.avgDuration}</span>
                    <span className="ml-auto font-medium text-accent">Details →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
