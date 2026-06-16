import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { KpiCard, Pill } from '@/components/ui';
import { getWonProjects } from '@/app/lib/reonic-server';
import { getProjectDataBatch } from '@/app/lib/projektdaten';

export const dynamic = 'force-dynamic';

/** Anlage = won project with enriched technical data */
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
  // Load won projects from Reonic (dealState=Won filter)
  const wonRaw = await getWonProjects(5);
  const offerIds = wonRaw.slice(0, 50).map((p) => p.id);

  // Load technical project data for won offers
  const projectDataList = await getProjectDataBatch(offerIds);

  // Build display list
  const anlagen: Anlage[] = projectDataList.map((pd) => {
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

  const totalKwp = anlagen.reduce((n, a) => n + a.kwp, 0);

  return (
    <>
      <Sidebar active="anlagen" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Anlagen-Monitoring"
          subtitle={`${anlagen.length} PV-Anlagen · ${totalKwp.toFixed(1)} kWp installiert`}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {/* EcoFlow banner */}
          <div className="bg-warning-bg/40 border border-warning/30 rounded-[10px] px-4 py-3 flex items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-warning-bg flex items-center justify-center text-warning text-xs font-bold shrink-0">!</span>
            <span className="text-xs text-fg2">
              <span className="font-medium text-fg">Live-Daten erscheinen sobald die EcoFlow-Geräte mit dem Volta-Account verknüpft sind.</span>{' '}
              Produktion, Batterie-SOC und Eigenverbrauch werden dann in Echtzeit angezeigt.
            </span>
          </div>

          {/* KPI cards */}
          <div className="flex flex-wrap gap-4">
            <KpiCard label="ANLAGEN GESAMT" value={String(anlagen.length)} sub={`${totalKwp.toFixed(1)} kWp installiert`} />
            <KpiCard label="LEISTUNG JETZT" value="—" sub="Nicht verbunden" />
            <KpiCard label="Ø EIGENVERBRAUCH" value="—" sub="Nicht verbunden" />
            <KpiCard label="AKTIVE ALARME" value="—" sub="Nicht verbunden" />
          </div>

          {/* Table */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_220px_150px_140px_130px_120px] bg-surface-2 border-b border-line h-11 items-center px-5">
              {['ANLAGE', 'SYSTEM', 'PRODUKTION', 'BATTERIE', 'EIGENVERBR.', 'STATUS'].map((c) => (
                <span key={c} className="font-semibold text-[10px] text-fg3 tracking-[0.18em]">{c}</span>
              ))}
            </div>

            {anlagen.length === 0 && (
              <div className="px-5 py-8 text-center text-fg3 text-sm">
                Keine gewonnenen Projekte gefunden.
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
                {/* Name + Address */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                    <span className="text-accent text-sm">☀</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[13px] text-fg truncate">{inst.customer}</span>
                    <span className="text-[11px] text-fg3 truncate">{inst.address}</span>
                  </div>
                </div>

                {/* System */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-fg">{inst.inverter.length > 28 ? inst.inverter.slice(0, 28) + '…' : inst.inverter} · {inst.kwp} kWp</span>
                  <span className="text-[11px] text-fg3">
                    {inst.batteryKwh ? `${inst.battery.length > 20 ? inst.battery.slice(0, 20) + '…' : inst.battery} ${inst.batteryKwh} kWh` : 'Kein Speicher'}
                  </span>
                </div>

                {/* Produktion — not connected */}
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-fg3">—</span>
                </div>

                {/* Batterie — not connected */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-fg3">—</span>
                </div>

                {/* Eigenverbrauch — not connected */}
                <span className="text-[13px] font-medium text-fg3">—</span>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Pill label="NICHT VERBUNDEN" tone="warning" />
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
