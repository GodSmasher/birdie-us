import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';

type State = 'info' | 'warning' | 'error';

const invoices: { nr: string; kunde: string; faellig: string; betrag: string; state: State; pill: string }[] = [
  { nr: '#0341', kunde: 'Familie Huber', faellig: '01.06.2026', betrag: "CHF 24'500", state: 'info', pill: 'OFFEN' },
  { nr: '#0298', kunde: 'Schmid AG', faellig: '15.05.2026', betrag: "CHF 12'400", state: 'error', pill: 'MAHNUNG 2' },
  { nr: '#0312', kunde: 'Bau Locher GmbH', faellig: '22.05.2026', betrag: "CHF 8'920", state: 'info', pill: 'OFFEN' },
  { nr: '#0287', kunde: 'M. Egger', faellig: '08.05.2026', betrag: "CHF 4'200", state: 'warning', pill: 'MAHNUNG 1' },
  { nr: '#0356', kunde: 'Familie Frey', faellig: '28.05.2026', betrag: "CHF 36'800", state: 'info', pill: 'OFFEN' },
  { nr: '#0334', kunde: 'Solar Berg AG', faellig: '20.05.2026', betrag: "CHF 18'400", state: 'info', pill: 'OFFEN' },
  { nr: '#0301', kunde: 'K. Lüthi', faellig: '12.05.2026', betrag: "CHF 6'300", state: 'warning', pill: 'MAHNUNG 1' },
  { nr: '#0362', kunde: 'Holzbau Meier', faellig: '30.05.2026', betrag: "CHF 14'100", state: 'info', pill: 'OFFEN' },
];

const steps = [
  ['+7 Tage', 'Freundliche Erinnerung per Mail', '12 versendet'],
  ['+14 Tage', 'Mahnung 1 mit Gebühr CHF 15', '4 versendet'],
  ['+30 Tage', 'Mahnung 2 mit Gebühr CHF 30', '2 versendet'],
  ['+60 Tage', 'Manueller Trigger Inkasso', '0'],
];

export default function FinancePage() {
  return (
    <>
      <Sidebar active="finance" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Finanzmanagement" subtitle="Bexio · DATEV · automatische Mahnläufe" />
        <div className="flex-1 px-8 py-7 flex flex-col gap-5 max-w-[1400px]">
          <div className="flex gap-4">
            <KpiCard label="OFFENE RECHNUNGEN" value="CHF 142'380" sub="23 Rechnungen" />
            <KpiCard label="ÜBERFÄLLIG" value="CHF 18'920" sub="4 · Mahnstufe 1-2" valueColor="text-warning" />
            <KpiCard label="EINGANG / WOCHE" value="CHF 87'440" sub="12 Zahlungen erhalten" valueColor="text-success" />
            <KpiCard label="LIQUIDITÄT 30T" value="+CHF 240k" sub="Prognose Bexio + Cashflow" />
          </div>

          <div className="flex gap-4">
            <Card className="flex-1 min-w-0 overflow-hidden">
              <CardHeader
                title="Offene Rechnungen"
                right={
                  <button className="px-2.5 py-1.5 bg-surface-2 border border-line rounded-md text-[11px] text-fg2 flex items-center gap-1.5">
                    Alle <span className="text-fg3">⌄</span>
                  </button>
                }
              />
              <div className="grid grid-cols-[70px_1fr_120px_130px_140px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                <span>NR.</span>
                <span>KUNDE</span>
                <span>FÄLLIG</span>
                <span>BETRAG</span>
                <span>STATUS</span>
              </div>
              {invoices.map((iv, i) => (
                <div
                  key={iv.nr}
                  className={`grid grid-cols-[70px_1fr_120px_130px_140px] h-[50px] items-center px-5 ${
                    i < invoices.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span className="text-xs font-medium text-fg2">{iv.nr}</span>
                  <span className="text-[13px] font-medium text-fg">{iv.kunde}</span>
                  <span className="text-xs text-fg2">{iv.faellig}</span>
                  <span className="text-[13px] font-semibold text-fg">{iv.betrag}</span>
                  <div>
                    <Pill label={iv.pill} tone={iv.state} />
                  </div>
                </div>
              ))}
            </Card>

            <div className="w-[392px] shrink-0 flex flex-col gap-4">
              <Card>
                <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">
                    ⚡
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[13px] text-fg">Mahnbot</span>
                    <span className="text-[11px] text-fg2">aktiv · 3 Läufe heute</span>
                  </div>
                  <div className="ml-auto">
                    <Pill label="LIVE" tone="success" />
                  </div>
                </div>
                {steps.map(([d, txt, count], i) => (
                  <div key={i} className="flex items-center gap-2.5 px-5 py-3.5 border-t border-line">
                    <div className="w-16 h-[22px] rounded bg-surface-2 flex items-center justify-center text-[10px] font-medium text-fg2 tracking-[0.12em]">
                      {d}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-fg">{txt}</span>
                      <span className="text-[10px] text-fg3">{count}</span>
                    </div>
                  </div>
                ))}
              </Card>

              <Card className="p-5 flex flex-col gap-3">
                <h3 className="font-semibold text-[13px] text-fg">DATEV-Export</h3>
                <p className="text-xs text-fg2 leading-[18px]">Letzter Export · 30. April 2026 · 247 Buchungen</p>
                <div className="flex items-center gap-2">
                  <button className="px-3.5 py-2 bg-accent text-bg rounded-lg font-medium text-xs">
                    Mai-Export anfordern
                  </button>
                  <button className="px-3.5 py-2 bg-surface-2 border border-line rounded-lg font-medium text-xs text-fg">
                    Historie
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
