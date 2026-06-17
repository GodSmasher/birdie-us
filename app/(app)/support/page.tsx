import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card } from '@/components/ui';
import { isDemoMode } from '@/app/lib/demo-mode';
import { DemoView } from '@/components/birdie-guide';

export const dynamic = 'force-dynamic';

export default function SupportPage() {
  if (isDemoMode()) {
    return (
      <>
        <Sidebar active="support" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Support" subtitle="Personal · no hold times" />
          <DemoView message="Need help? Reach us at support@birdiesolar.com — no ticket queues. We handle connector setup, custom bots, and everything in between. Response time: under 24 hours." pose="wave">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 flex flex-col gap-1.5 opacity-75">
                <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">EMAIL</span>
                <span className="text-sm font-medium text-fg">support@birdiesolar.com</span>
                <span className="text-xs text-fg3">for all requests & new connectors</span>
              </Card>
              <Card className="p-5 flex flex-col gap-1.5 opacity-75">
                <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">RESPONSE TIME</span>
                <span className="text-sm font-medium text-fg">&lt; 24 hrs</span>
                <span className="text-xs text-fg3">Mon–Fri · urgent matters even faster</span>
              </Card>
            </div>
          </DemoView>
        </main>
      </>
    );
  }
  return (
    <>
      <Sidebar active="support" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Support" subtitle="Personal · no hold times" />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[820px]">
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center text-accent text-lg">✦</div>
            <h2 className="font-semibold text-lg text-fg tracking-tightest">Direct line to .birdie</h2>
            <p className="text-[13px] text-fg2 leading-[20px] max-w-[520px]">
              Connectors, bots, and customizations are set up personally by us. Just reach out — we typically respond
              within 24 hours, urgent matters faster.
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">EMAIL</span>
              <span className="text-sm font-medium text-fg">support@birdiesolar.com</span>
              <span className="text-xs text-fg3">for all requests & new connectors</span>
            </Card>
            <Card className="p-5 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">RESPONSE TIME</span>
              <span className="text-sm font-medium text-fg">&lt; 24 hrs</span>
              <span className="text-xs text-fg3">Mon–Fri · urgent matters even faster</span>
            </Card>
          </div>

          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Common Requests</h3>
            {[
              ['Connect a new connector', 'e.g. additional inverter, tariff, tool'],
              ['Customize or create a bot', 'new automation or changes to existing ones'],
              ['Manage users / access', 'add or remove team members'],
              ['Request data export', 'CSV / Excel of your data'],
            ].map(([t, d]) => (
              <div key={t} className="flex items-center gap-3 border-t border-line pt-3 first:border-0 first:pt-0">
                <span className="text-accent">→</span>
                <div className="flex flex-col">
                  <span className="text-[13px] text-fg">{t}</span>
                  <span className="text-[11px] text-fg3">{d}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </>
  );
}
