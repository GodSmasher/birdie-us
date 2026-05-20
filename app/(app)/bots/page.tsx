import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Pill } from '@/components/ui';

const tabs = [
  ['Alle', true, '14'],
  ['Vertrieb', false, ''],
  ['Finanzen', false, ''],
  ['Kommunikation', false, ''],
  ['Projekte', false, ''],
  ['Inaktiv', false, ''],
] as const;

type BotState = 'success' | 'warning' | 'error' | 'neutral';

const bots: { name: string; cat: string; desc: string; state: BotState; pill: string; runs: string; conns: string }[] = [
  { name: 'Mahnbot', cat: 'FIN', desc: 'Sendet automatische Zahlungserinnerungen anhand Bexio-Status', state: 'success', pill: 'LIVE', runs: '247', conns: 'Bexio · Gmail' },
  { name: 'Lead-Sync', cat: 'VTR', desc: 'Importiert Leads aus Reonic + reichert mit Telefon/Mail an', state: 'success', pill: 'LIVE', runs: '1.382', conns: 'Reonic · Gmail' },
  { name: 'Termin-Bot', cat: 'VTR', desc: 'Erstellt Termine bei Anfrage + verschickt Google Meet Einladung', state: 'success', pill: 'LIVE', runs: '89', conns: 'Calendar · WA' },
  { name: 'Call-Bot', cat: 'VTR', desc: 'Wertet 3CX-Anrufe aus, schlägt Rückrufe vor', state: 'success', pill: 'LIVE', runs: '412', conns: '3CX · Reonic' },
  { name: 'Rechnungs-Bot', cat: 'FIN', desc: "Erstellt Bexio-Rechnung sobald Projekt-Status 'fertig'", state: 'success', pill: 'LIVE', runs: '63', conns: 'Bexio · Reonic' },
  { name: 'WhatsApp-Concierge', cat: 'KOM', desc: 'Antwortet auf Standardfragen, eskaliert komplexe Themen', state: 'success', pill: 'LIVE', runs: '1.847', conns: 'WhatsApp · Reonic' },
  { name: 'Tagesreport', cat: 'ALL', desc: 'Generiert jeden Morgen 7:00 das Briefing für Geschäftsführung', state: 'success', pill: 'LIVE', runs: '138', conns: 'Claude · Mail' },
  { name: 'DATEV-Export', cat: 'FIN', desc: 'Exportiert monatlich Buchungen als DATEV-CSV', state: 'neutral', pill: 'PAUSE', runs: '12', conns: 'Bexio · Drive' },
  { name: 'Mahnstufe-3', cat: 'FIN', desc: 'Inkasso-Übergabe nach 60 Tagen, manueller Trigger', state: 'warning', pill: 'HINWEIS', runs: '—', conns: 'Bexio · Mail' },
];

export default function BotsPage() {
  return (
    <>
      <Sidebar active="bots" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Bots" subtitle="14 Bots · 12 aktiv · alle nur lesbar — Anpassungen über Sarah" />
        <div className="flex-1 px-8 py-7 flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(([n, active, cnt]) => (
              <button
                key={n}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
                  active
                    ? 'bg-surface-2 text-fg border border-line-2 font-medium'
                    : 'text-fg2 hover:text-fg'
                }`}
              >
                {n}
                {cnt && <span className="px-1.5 py-0.5 rounded-full bg-surface-3 text-fg2 text-[10px] font-medium">{cnt}</span>}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-4">
            {bots.map((b) => (
              <div key={b.name} className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-3 min-h-[188px]">
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

                <div className="flex items-center text-[11px]">
                  <span className="text-fg3 mr-1.5">↻</span>
                  <span className="text-fg2">{b.runs} heute</span>
                  <span className="ml-auto font-medium text-accent">Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
