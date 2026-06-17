import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill } from '@/components/ui';
import { getWonProjects } from '@/app/lib/reonic-server';
import { getProjectDataBatch } from '@/app/lib/projektdaten';
import { isDemoMode } from '@/app/lib/demo-mode';
import { DemoView } from '@/components/birdie-guide';

export const dynamic = 'force-dynamic';

interface Anlage {
  id: string;
  slug: string;
  customer: string;
  address: string;
  kwp: number;
  inverter: string;
  batteryKwh: number | null;
  battery: string;
}

export default async function AnlagenPage() {
  const wonRaw = await getWonProjects(5);
  const offerIds = wonRaw.slice(0, 50).map((p) => p.id);
  const projectDataList = await getProjectDataBatch(offerIds);

  let anlagen: Anlage[] = projectDataList.map((pd) => {
    const addrStr = pd.address
      ? [pd.address.line, pd.address.zip, pd.address.city].filter(Boolean).join(', ')
      : '—';
    return {
      id: pd.offerId,
      slug: pd.offerId,
      customer: pd.customerName || '—',
      address: addrStr,
      kwp: pd.kwp,
      inverter: pd.inverter || '—',
      batteryKwh: pd.batteryKwh ?? null,
      battery: pd.battery || '—',
    };
  });

  if (anlagen.length === 0 && isDemoMode()) {
    return (
      <>
        <Sidebar active="anlagen" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Fleet Monitoring" subtitle="Systems · Production · Alerts" />
          <DemoView message="Fleet monitoring shows live production data from every system you've installed. Connect SolarEdge or Enphase to see real-time performance, alerts, and uptime.">
            <div className="grid grid-cols-3 gap-3">
              {[{ name: 'Martinez Residence', kw: '8.4 kW', s: 'Waiting' },{ name: 'Johnson Commercial', kw: '45 kW', s: 'Waiting' },{ name: 'Chen Duplex', kw: '12.6 kW', s: 'Waiting' },{ name: 'Williams Home', kw: '6.2 kW', s: 'Waiting' },{ name: 'Davis Property', kw: '9.8 kW', s: 'Waiting' },{ name: 'Brown Residence', kw: '7.1 kW', s: 'Waiting' }].map(sys => (
                <Card key={sys.name} className="p-4 flex flex-col gap-2 opacity-75">
                  <span className="text-[12px] font-semibold text-fg">{sys.name}</span>
                  <span className="text-[18px] font-bold text-fg3">— kW</span>
                  <span className="text-[10px] text-fg3">{sys.kw} installed · awaiting connection</span>
                </Card>
              ))}
            </div>
          </DemoView>
        </main>
      </>
    );
  }

  const totalKwp = anlagen.reduce((n, a) => n + a.kwp, 0);

  return (
    <>
      <Sidebar active="anlagen" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Fleet Monitoring"
          subtitle={`${anlagen.length} solar systems · ${totalKwp.toFixed(1)} kW DC installed`}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="bg-warning-bg/40 border border-warning/30 rounded-[10px] px-4 py-3 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-warning-bg flex items-center justify-center text-warning text-xs font-bold shrink-0">!</span>
            <span className="text-xs text-fg2">
              <span className="font-medium text-fg">Live data will appear once inverter accounts are linked.</span>{' '}
              Production, battery SoC, and self-consumption will be displayed in real time.
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <KpiCard label="TOTAL SYSTEMS" value={String(anlagen.length)} sub={`${totalKwp.toFixed(1)} kW DC installed`} />
            <KpiCard label="POWER NOW" value="—" sub="Not connected" />
            <KpiCard label="AVG SELF-CONSUMPTION" value="—" sub="Not connected" />
            <KpiCard label="ACTIVE ALERTS" value="—" sub="Not connected" />
          </div>

          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_220px_150px_140px_130px_120px] bg-surface-2 border-b border-line h-11 items-center px-5">
              {['SYSTEM', 'EQUIPMENT', 'PRODUCTION', 'BATTERY', 'SELF-CONS.', 'STATUS'].map((c) => (
                <span key={c} className="font-semibold text-[10px] text-fg3 tracking-[0.18em]">{c}</span>
              ))}
            </div>

            {anlagen.length === 0 && (
              <div className="px-5 py-8 text-center text-fg3 text-sm">
                No won projects found.
              </div>
            )}

            {anlagen.map((inst, idx) => (
              <Link
                key={inst.id}
                href={`/anlagen/${inst.slug}`}
                className={`grid grid-cols-[1fr_220px_150px_140px_130px_120px] h-[68px] items-center px-5 hover:bg-surface-2/40 transition-colors ${
                  idx < anlagen.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                    <span className="text-accent text-sm">☀</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[13px] text-fg truncate">{inst.customer}</span>
                    <span className="text-[11px] text-fg3 truncate">{inst.address}</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-medium text-fg">{inst.inverter.length > 28 ? inst.inverter.slice(0, 28) + '…' : inst.inverter} · {inst.kwp} kW</span>
                  <span className="text-[11px] text-fg3">
                    {inst.batteryKwh ? `${inst.battery.length > 20 ? inst.battery.slice(0, 20) + '…' : inst.battery} ${inst.batteryKwh} kWh` : 'No storage'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-fg3">—</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-fg3">—</span>
                </div>

                <span className="text-[13px] font-medium text-fg3">—</span>

                <div className="flex items-center justify-between">
                  <Pill label="NOT CONNECTED" tone="warning" />
                  <span className="text-fg3 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
