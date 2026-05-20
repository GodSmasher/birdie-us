import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';

const activities = [
  ['10:42', 'Mahnbot', "3 Rechnungen mit Status 'überfällig' erkannt — Erinnerungsmails versendet", 'success'],
  ['10:38', 'Lead-Sync (Reonic)', '12 neue Leads importiert, 2 mit fehlender Telefonnummer markiert', 'info'],
  ['10:31', 'Termin-Bot', 'Beratungstermin von Michael K. bestätigt + Google Meet erstellt', 'success'],
  ['10:24', 'Bexio-Sync', "Rechnung #2026-0341 erstellt für 'Familie Huber' (€ 24.500)", 'info'],
  ['10:12', 'WhatsApp-Bot', '5 Kundenanfragen automatisch beantwortet · 1 an Sarah eskaliert', 'warning'],
  ['09:58', 'Call-Bot', '8 verpasste Anrufe erkannt — Rückruftermine vorgeschlagen', 'info'],
  ['09:45', 'Mahnbot', 'Auto-Mahnstufe 2 für Rechnung #2026-0298 ausgelöst', 'warning'],
] as const;

type DataTone = 'fg' | 'success' | 'warning' | 'error' | 'accent' | 'info';

const connectorData: {
  letter: string;
  name: string;
  category: string;
  sync: string;
  rows: { label: string; value: string; tone?: DataTone }[];
}[] = [
  {
    letter: 'R',
    name: 'Reonic CRM',
    category: 'Vertrieb · Leads',
    sync: 'vor 4 Min',
    rows: [
      { label: 'Neue Leads heute', value: '47', tone: 'success' },
      { label: 'Offerten offen', value: '23' },
      { label: 'Projekte aktiv', value: '8' },
    ],
  },
  {
    letter: 'B',
    name: 'Bexio',
    category: 'Buchhaltung',
    sync: 'vor 12 Min',
    rows: [
      { label: 'Offene Rechnungen', value: '€ 142.380', tone: 'fg' },
      { label: 'Davon überfällig', value: '4 · € 18.920', tone: 'warning' },
      { label: 'Eingang diese Woche', value: '€ 87.440', tone: 'success' },
    ],
  },
  {
    letter: 'G',
    name: 'Gmail',
    category: 'Kommunikation',
    sync: 'vor 2 Min',
    rows: [
      { label: 'Ungelesen', value: '87' },
      { label: 'Wichtig · markiert', value: '23', tone: 'warning' },
      { label: 'Ø Antwortzeit', value: '12 Min' },
    ],
  },
  {
    letter: 'C',
    name: 'Google Calendar',
    category: 'Termine',
    sync: 'vor 8 Min',
    rows: [
      { label: 'Termine heute', value: '14' },
      { label: 'Konflikte', value: '3', tone: 'error' },
      { label: 'Nächster Termin', value: '14:30' },
    ],
  },
  {
    letter: 'W',
    name: 'WhatsApp Business',
    category: 'Messaging',
    sync: 'vor 1 Min',
    rows: [
      { label: 'Ungelesen', value: '28' },
      { label: 'Wartet auf Antwort', value: '5', tone: 'warning' },
      { label: 'Ø Antwortzeit Bot', value: '4 Min', tone: 'success' },
    ],
  },
  {
    letter: 'S',
    name: 'Sevdesk',
    category: 'Buchhaltung',
    sync: 'vor 15 Min',
    rows: [
      { label: 'Buchungen Mai', value: '156' },
      { label: 'Noch ungebucht', value: '12', tone: 'warning' },
      { label: 'DATEV-Export bereit', value: 'Ja', tone: 'success' },
    ],
  },
];

const toneBg: Record<string, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  error: 'bg-error-bg text-error',
};

const toneText: Record<DataTone, string> = {
  fg: 'text-fg',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  accent: 'text-accent',
  info: 'text-info',
};

export default function DashboardPage() {
  return (
    <>
      <Sidebar active="dashboard" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Guten Morgen, Sarah" subtitle="Mittwoch · 20. Mai 2026" />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {/* Top KPIs */}
          <div className="flex gap-4">
            <KpiCard label="AKTIVE BOTS" value="12" sub="von 14 konfiguriert" delta="+2" />
            <KpiCard label="HEUTE AUSGEFÜHRT" value="347" sub="ggü. gestern" delta="+18%" />
            <KpiCard label="FEHLERQUOTE" value="0.4%" sub="letzte 24h" delta="−0.2%" />
            <KpiCard label="CONNECTOREN" value="8/8" sub="alle synchron" />
          </div>

          {/* Datenübersicht — connector data snapshots */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-sm text-fg tracking-tightest">Datenübersicht</h2>
              <span className="text-[11px] text-fg3">aggregierte Kennzahlen aus allen verbundenen Tools</span>
              <Pill label="LIVE" tone="success" />
              <span className="ml-auto text-[11px] text-fg3">Auto-Refresh alle 60 Sek</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {connectorData.map((c) => (
                <div
                  key={c.name}
                  className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-[13px] text-fg">
                      {c.letter}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-[13px] text-fg leading-tight">{c.name}</span>
                      <span className="text-[11px] text-fg3 leading-tight">{c.category}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-[10px] text-fg3">{c.sync}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-line pt-3">
                    {c.rows.map((r) => (
                      <div key={r.label} className="flex items-center">
                        <span className="text-xs text-fg2">{r.label}</span>
                        <span
                          className={`ml-auto text-[13px] font-semibold ${toneText[r.tone ?? 'fg']}`}
                        >
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom row: Activity + Briefing */}
          <div className="flex gap-4">
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

            <Card className="w-[412px] shrink-0 p-5 flex flex-col gap-3.5 self-start">
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
              <div className="flex flex-col gap-2 mt-1 border-t border-line pt-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  <span className="text-fg2">Reonic: 47 neue Leads heute (+12 vs. gestern)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  <span className="text-fg2">Bexio: 4 überfällige Rechnungen, € 18.920</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  <span className="text-fg2">Calendar: 3 Terminkonflikte heute Nachmittag</span>
                </div>
              </div>
              <button className="self-start inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent text-bg rounded-lg font-medium text-xs mt-1">
                Briefing öffnen <span className="font-bold">→</span>
              </button>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
