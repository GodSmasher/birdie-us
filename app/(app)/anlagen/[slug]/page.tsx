import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardHeader, Pill, Tag } from '@/components/ui';
import { BarChart24h, HourAxis } from '@/components/sparkline';
import { installations, getInstallation } from '@/lib/data';

export function generateStaticParams() {
  return installations.map((i) => ({ slug: i.slug }));
}

const statePill = {
  online: { label: 'ONLINE', tone: 'success' as const },
  warn: { label: 'HINWEIS', tone: 'warning' as const },
  offline: { label: 'OFFLINE', tone: 'error' as const },
};

const eventTone: Record<string, string> = {
  success: 'bg-success-bg text-success',
  info: 'bg-info-bg text-info',
  warning: 'bg-warning-bg text-warning',
  error: 'bg-error-bg text-error',
};

function FlowArrow({ kw, dir, label }: { kw: number; dir: 'left' | 'right'; label: string }) {
  const active = Math.abs(kw) > 0.05;
  return (
    <div className="flex flex-col items-center gap-1 min-w-[88px] px-1">
      <span className="text-[10px] text-fg3">{label}</span>
      <span className={`text-[13px] font-semibold ${active ? 'text-fg' : 'text-fg4'}`}>{Math.abs(kw).toFixed(1)} kW</span>
      <span className={`text-xl leading-none ${active ? 'text-accent' : 'text-fg4'}`}>{dir === 'right' ? '→' : '←'}</span>
    </div>
  );
}

function FlowNode({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-[150px]">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border"
        style={{ background: color + '1A', borderColor: color + '40', color }}
      >
        {icon}
      </div>
      <span className="text-[11px] text-fg3 tracking-wide">{label}</span>
      <span className="text-lg font-semibold text-fg leading-none tracking-tightest">{value}</span>
      <span className="text-[10px] text-fg3 text-center">{sub}</span>
    </div>
  );
}

export default function AnlageDetailPage({ params }: { params: { slug: string } }) {
  const a = getInstallation(params.slug);
  if (!a) notFound();

  const chartColor = a.state === 'offline' ? '#F87171' : a.state === 'warn' ? '#FBBF24' : '#FACC15';
  const battColor = a.batterySoc < 30 ? '#F87171' : a.batterySoc < 60 ? '#FBBF24' : '#4ADE80';
  const battLabel = a.flow.battery > 0 ? `lädt ${a.flow.battery.toFixed(1)} kW` : a.flow.battery < 0 ? `entlädt ${Math.abs(a.flow.battery).toFixed(1)} kW` : 'Standby';
  const gridLabel = a.flow.grid > 0 ? `Einspeisung` : a.flow.grid < 0 ? `Netzbezug` : 'kein Austausch';

  const forecast3 = [
    { day: 'Heute', icon: '☀', kwh: a.forecastTodayKwh },
    { day: 'Morgen', icon: '⛅', kwh: a.forecastTomorrowKwh },
    { day: 'Übermorgen', icon: '☁', kwh: Math.round(a.forecastTomorrowKwh * 0.72) },
  ];

  return (
    <>
      <Sidebar active="anlagen" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <header className="min-h-[96px] shrink-0 bg-bg border-b border-line flex flex-col justify-center px-8 gap-2 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Link href="/anlagen" className="text-fg3 hover:text-fg2">Anlagen</Link>
            <span className="text-fg4">/</span>
            <span className="text-fg2 font-medium">{a.customer}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-accent text-lg">☀</span>
            <h1 className="font-semibold text-xl text-fg tracking-tightest">{a.customer}</h1>
            <Pill label={statePill[a.state].label} tone={statePill[a.state].tone} />
            <Tag label={`${a.kwp} kWp`} tone="accent" />
            <span className="text-xs text-fg3">
              {a.address} · {a.inverter} · {a.batteryBrand} {a.battery} {a.batteryKwh} kWh
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button className="px-3.5 py-2 bg-surface-2 border border-line rounded-lg font-medium text-xs text-fg hover:border-line-2">
                Bericht exportieren
              </button>
              <button className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs">Fernzugriff</button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {/* ENERGY FLOW */}
          <Card className="p-6">
            <div className="flex items-center mb-5">
              <h2 className="font-semibold text-sm text-fg">Energiefluss · Echtzeit</h2>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-[11px] text-fg3">Eigenverbrauch {a.selfConsumption || '—'}%</span>
                <Pill label="LIVE" tone="success" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              <FlowNode icon="▰" label="Batterie" value={`${a.batterySoc}%`} sub={`${a.batteryBrand} · ${battLabel}`} color="#4ADE80" />
              <FlowArrow kw={a.flow.battery} dir={a.flow.battery >= 0 ? 'left' : 'right'} label={a.flow.battery >= 0 ? 'lädt' : 'liefert'} />

              <div className="flex flex-col items-center gap-2">
                <FlowNode icon="☀" label="Solar" value={`${a.flow.solar.toFixed(1)} kW`} sub={a.inverterBrand} color="#FACC15" />
                <span className="text-accent text-xl leading-none">↓</span>
                <FlowNode icon="⌂" label="Verbrauch" value={`${a.flow.house.toFixed(1)} kW`} sub="Haus / Betrieb" color="#F4F5F7" />
              </div>

              <FlowArrow kw={a.flow.grid} dir={a.flow.grid >= 0 ? 'right' : 'left'} label={gridLabel} />
              <FlowNode icon="⚡" label="Netz" value={a.flow.grid >= 0 ? 'Einspeisung' : 'Bezug'} sub={`${Math.abs(a.flow.grid).toFixed(1)} kW`} color="#60A5FA" />
            </div>
          </Card>

          {/* Row: Production chart + Tariff */}
          <div className="flex gap-4">
            <Card className="flex-1 min-w-0 p-5">
              <div className="flex items-center mb-4">
                <h2 className="font-semibold text-sm text-fg">Produktion heute</h2>
                <div className="ml-auto flex items-center gap-3 text-[11px] text-fg3">
                  <span>Ertrag <span className="text-fg font-semibold">{a.yieldTodayKwh} kWh</span></span>
                  <span>Prognose {a.forecastTodayKwh} kWh</span>
                </div>
              </div>
              <BarChart24h data={a.productionToday} color={chartColor} />
              <HourAxis />
            </Card>

            {/* Tariff optimization */}
            <Card className="w-[360px] shrink-0 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-info text-sm">⚡</div>
                <h3 className="font-semibold text-[13px] text-fg">Tarifoptimierung</h3>
                <span className="ml-auto text-[11px] text-fg3">{a.tariff.provider}</span>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-[32px] font-semibold text-fg leading-none tracking-tightest">{a.tariff.nowPrice.toFixed(1)}</span>
                <span className="text-sm text-fg2 mb-1">ct/kWh</span>
                <span className={`mb-1 text-xs font-medium ${a.tariff.trend === 'down' ? 'text-success' : 'text-error'}`}>
                  {a.tariff.trend === 'down' ? '↓ fallend' : '↑ steigend'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-fg3">Günstigstes Fenster</span>
                <span className="ml-auto font-medium text-success">{a.tariff.cheapWindow}</span>
              </div>

              <div className="bg-bg border border-line rounded-lg p-3 flex gap-2.5">
                <span className="text-accent text-sm shrink-0">✦</span>
                <p className="text-[11px] text-fg2 leading-[16px]">{a.tariff.recommendation}</p>
              </div>
            </Card>
          </div>

          {/* Row: Forecast + Devices */}
          <div className="flex gap-4">
            {/* Forecast */}
            <Card className="w-[360px] shrink-0 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent text-sm">☀</div>
                <h3 className="font-semibold text-[13px] text-fg">Solarprognose</h3>
                <span className="ml-auto text-[11px] text-fg3">Solcast · {a.forecastConfidence}% Konfidenz</span>
              </div>
              <div className="flex flex-col gap-1">
                {forecast3.map((f) => (
                  <div key={f.day} className="flex items-center gap-3 py-2 border-b border-line last:border-0">
                    <span className="text-lg w-6">{f.icon}</span>
                    <span className="text-xs text-fg2 w-24">{f.day}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (f.kwh / (a.kwp * 6)) * 100)}%` }} />
                    </div>
                    <span className="text-[13px] font-semibold text-fg w-16 text-right">{f.kwh} kWh</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Devices */}
            <Card className="flex-1 min-w-0 overflow-hidden">
              <CardHeader title="Geräte" right={<span className="text-[11px] text-fg3">{a.devices.length} angebunden</span>} />
              {a.devices.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-5 h-[52px] hover:bg-surface-2/40 transition-colors ${
                    i < a.devices.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      d.state === 'online' ? 'bg-success' : d.state === 'warn' ? 'bg-warning' : 'bg-error'
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-fg truncate">{d.name}</span>
                    <span className="text-[11px] text-fg3">{d.type}</span>
                  </div>
                  <span className="ml-auto text-[11px] text-fg2 text-right">{d.detail}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Events */}
          <Card className="overflow-hidden">
            <CardHeader title="Ereignisse" right={<Pill label="LIVE" tone="success" />} />
            {a.events.map((e, i) => (
              <div
                key={i}
                className={`flex gap-3.5 px-5 py-3.5 ${i < a.events.length - 1 ? 'border-b border-line' : ''}`}
              >
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${eventTone[e.kind]}`}>
                  {e.kind === 'error' ? '!' : e.kind === 'warning' ? '△' : '✓'}
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-fg3">{e.time}</span>
                  <span className="text-fg">{e.msg}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </main>
    </>
  );
}
