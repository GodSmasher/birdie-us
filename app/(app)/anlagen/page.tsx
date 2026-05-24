import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { KpiCard, Pill } from '@/components/ui';
import { Sparkline } from '@/components/sparkline';
import { installations, type InstallState } from '@/lib/data';

const statePill: Record<InstallState, { label: string; tone: 'success' | 'warning' | 'error' }> = {
  online: { label: 'ONLINE', tone: 'success' },
  warn: { label: 'HINWEIS', tone: 'warning' },
  offline: { label: 'OFFLINE', tone: 'error' },
};

export default function AnlagenPage() {
  const totalNow = installations.reduce((n, i) => n + i.nowProduction, 0);
  const totalKwp = installations.reduce((n, i) => n + i.kwp, 0);
  const online = installations.filter((i) => i.state === 'online');
  const avgSelf = Math.round(online.reduce((n, i) => n + i.selfConsumption, 0) / online.length);
  const alarms = installations.filter((i) => i.state !== 'online').length;
  const yieldToday = installations.reduce((n, i) => n + i.yieldTodayKwh, 0);

  return (
    <>
      <Sidebar active="anlagen" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Anlagen-Monitoring"
          subtitle={`${installations.length} PV-Anlagen · ${totalKwp.toFixed(1)} kWp installiert · Live über Wechselrichter-Connectoren`}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="bg-warning-bg/40 border border-warning/30 rounded-[10px] px-4 py-3 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-warning-bg flex items-center justify-center text-warning text-xs font-bold shrink-0">!</span>
            <span className="text-xs text-fg2">
              <span className="font-medium text-fg">Demo-Daten.</span> Echte Anlagen-Telemetrie (Produktion, Batterie, Energiefluss) erscheint hier, sobald der EcoFlow-Connector verbunden ist.
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <KpiCard label="LEISTUNG JETZT" value={`${totalNow.toFixed(1)} kW`} sub={`über ${installations.length} Anlagen`} spark={[88, 102, 124, 138, 149, 156, 159]} sparkColor="#FACC15" />
            <KpiCard label="ERTRAG HEUTE" value={`${(yieldToday / 1000).toFixed(2)} MWh`} sub="kumuliert" delta="+6%" spark={[0.4, 0.9, 1.4, 1.8, 2.2, 2.6, 3.0]} sparkColor="#4ADE80" />
            <KpiCard label="Ø EIGENVERBRAUCH" value={`${avgSelf}%`} sub="online-Anlagen" delta="+3%" spark={[71, 73, 74, 76, 77, 78, avgSelf]} sparkColor="#4ADE80" />
            <KpiCard label="AKTIVE ALARME" value={String(alarms)} sub="1 offline · 1 Hinweis" valueColor={alarms > 0 ? 'text-warning' : 'text-fg'} />
          </div>

          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_220px_150px_140px_130px_120px] bg-surface-2 border-b border-line h-11 items-center px-5">
              {['ANLAGE', 'SYSTEM', 'PRODUKTION', 'BATTERIE', 'EIGENVERBR.', 'STATUS'].map((c) => (
                <span key={c} className="font-semibold text-[10px] text-fg3 tracking-[0.18em]">{c}</span>
              ))}
            </div>

            {installations.map((inst, idx) => {
              const sparkColor = inst.state === 'offline' ? '#F87171' : inst.state === 'warn' ? '#FBBF24' : '#FACC15';
              return (
                <Link
                  key={inst.slug}
                  href={`/anlagen/${inst.slug}`}
                  className={`grid grid-cols-[1fr_220px_150px_140px_130px_120px] h-[68px] items-center px-5 hover:bg-surface-2/40 transition-colors ${
                    idx < installations.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                      <span className="text-accent text-sm">☀</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[13px] text-fg truncate">{inst.customer}</span>
                      <span className="text-[11px] text-fg3 truncate">{inst.address} · {inst.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-fg">{inst.inverterBrand} · {inst.kwp} kWp</span>
                    <span className="text-[11px] text-fg3">{inst.batteryBrand} {inst.batteryKwh} kWh</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className={`text-[15px] font-semibold ${inst.nowProduction > 0 ? 'text-fg' : 'text-fg3'}`}>
                        {inst.nowProduction.toFixed(1)} kW
                      </span>
                    </div>
                    <div className="opacity-70">
                      <Sparkline data={inst.productionToday} color={sparkColor} fill width={56} height={24} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-9 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${inst.batterySoc}%`,
                          background: inst.batterySoc < 30 ? '#F87171' : inst.batterySoc < 60 ? '#FBBF24' : '#4ADE80',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-fg2">{inst.batterySoc}%</span>
                  </div>

                  <span className="text-[13px] font-medium text-fg">
                    {inst.selfConsumption > 0 ? `${inst.selfConsumption}%` : '—'}
                  </span>

                  <div className="flex items-center justify-between">
                    <Pill label={statePill[inst.state].label} tone={statePill[inst.state].tone} />
                    <span className="text-fg3 text-sm">→</span>
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
