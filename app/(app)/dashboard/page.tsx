import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';

const activities = [
  ['10:42', 'Mahnbot', "3 Rechnungen mit Status 'überfällig' erkannt — Erinnerungsmails versendet", 'success'],
  ['10:38', 'Lead-Sync (Reonic)', '12 neue Leads importiert, 2 mit fehlender Telefonnummer markiert', 'info'],
  ['10:31', 'Termin-Bot', 'Beratungstermin von Michael K. bestätigt + Google Meet erstellt', 'success'],
  ['10:24', 'Bexio-Sync', "Rechnung #2026-0341 erstellt für 'Familie Huber' (CHF 24'500)", 'info'],
  ['10:12', 'WhatsApp-Bot', '5 Kundenanfragen automatisch beantwortet · 1 an Sarah eskaliert', 'warning'],
  ['09:58', 'Call-Bot', '8 verpasste Anrufe erkannt — Rückruftermine vorgeschlagen', 'info'],
  ['09:45', 'Mahnbot', 'Auto-Mahnstufe 2 für Rechnung #2026-0298 ausgelöst', 'warning'],
] as const;

const connectors = [
  ['Reonic CRM', 'vor 4 Min', 'R'],
  ['Bexio', 'vor 12 Min', 'B'],
  ['Gmail', 'vor 2 Min', 'G'],
  ['Google Calendar', 'vor 8 Min', 'C'],
  ['WhatsApp Business', 'vor 1 Min', 'W'],
  ['Sevdesk', 'vor 15 Min', 'S'],
];

const toneBg: Record<string, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  error: 'bg-error-bg text-error',
};

export default function DashboardPage() {
  return (
    <>
      <Sidebar active="dashboard" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Guten Morgen, Sarah" subtitle="Mittwoch · 20. Mai 2026" />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[1400px]">
          <div className="flex gap-4">
            <KpiCard label="AKTIVE BOTS" value="12" sub="von 14 konfiguriert" delta="+2" />
            <KpiCard label="HEUTE AUSGEFÜHRT" value="347" sub="ggü. gestern" delta="+18%" />
            <KpiCard label="FEHLERQUOTE" value="0.4%" sub="letzte 24h" delta="−0.2%" />
            <KpiCard label="CONNECTOREN" value="8/8" sub="alle synchron" />
          </div>

          <div className="flex gap-4">
            {/* Activity feed */}
            <Card className="flex-1 min-w-0 overflow-hidden">
              <CardHeader title="Live-Aktivität" right={<Pill label="LIVE" tone="success" />} />
              <div>
                {activities.map(([time, bot, msg, kind], i) => (
                  <div
                    key={i}
                    className={`flex gap-3.5 px-5 py-3.5 ${i < activities.length - 1 ? 'border-b border-line' : ''}`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${toneBg[kind]}`}
                    >
                      ✓
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="font-medium text-fg">{bot}</span>
                        <span className="text-fg3">·</span>
                        <span className="text-fg3">{time}</span>
                      </div>
                      <p className="text-xs text-fg2 leading-[18px]">{msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Right column */}
            <div className="w-[412px] shrink-0 flex flex-col gap-4">
              <Card className="overflow-hidden">
                <CardHeader title="Connectoren" right={<span className="text-[11px] text-fg2">8 verbunden</span>} />
                <div>
                  {connectors.map(([name, sync, letter], i) => (
                    <div
                      key={name}
                      className={`flex items-center gap-3 px-5 h-11 ${
                        i < connectors.length - 1 ? 'border-b border-line' : ''
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center text-[11px] font-semibold text-fg">
                        {letter}
                      </div>
                      <span className="text-xs font-medium text-fg">{name}</span>
                      <span className="ml-auto text-[11px] text-fg3">{sync}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 flex flex-col gap-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">
                    ✦
                  </div>
                  <h3 className="font-semibold text-[13px] text-fg">Tagesbriefing</h3>
                </div>
                <p className="text-xs text-fg2 leading-[18px]">
                  12 Aufgaben erledigt seit gestern. 3 Rechnungen brauchen deine Freigabe. Mahnstufe 2 wurde für Familie
                  Schmid ausgelöst — willst du persönlich nachfassen?
                </p>
                <button className="self-start inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent text-bg rounded-lg font-medium text-xs">
                  Briefing öffnen <span className="font-bold">→</span>
                </button>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
