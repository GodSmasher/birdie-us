import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Pill } from '@/components/ui';

type State = 'success' | 'warning' | 'neutral';

const rows: { name: string; letter: string; typ: string; sync: string; access: string; state: State; pill: string }[] = [
  { name: 'Reonic CRM', letter: 'R', typ: 'ERP / CRM', sync: 'vor 4 Min · alle 15 Min', access: 'lesen · schreiben', state: 'success', pill: 'ONLINE' },
  { name: 'Bexio', letter: 'B', typ: 'Buchhaltung', sync: 'vor 12 Min · stündlich', access: 'lesen · schreiben', state: 'success', pill: 'ONLINE' },
  { name: 'Sevdesk', letter: 'S', typ: 'Buchhaltung', sync: 'vor 18 Min · stündlich', access: 'lesen · schreiben', state: 'success', pill: 'ONLINE' },
  { name: 'Gmail (Sarah)', letter: 'G', typ: 'Kommunikation', sync: 'vor 2 Min · Echtzeit', access: 'lesen · schreiben (Freigabe)', state: 'success', pill: 'ONLINE' },
  { name: 'Google Calendar', letter: 'C', typ: 'Kalender', sync: 'vor 8 Min · alle 15 Min', access: 'lesen · schreiben', state: 'success', pill: 'ONLINE' },
  { name: 'WhatsApp Business', letter: 'W', typ: 'Messaging', sync: 'vor 1 Min · Webhook', access: 'lesen · schreiben', state: 'success', pill: 'ONLINE' },
  { name: 'Google Drive', letter: 'D', typ: 'Dateien', sync: 'vor 6 Min · alle 30 Min', access: 'lesen · schreiben', state: 'success', pill: 'ONLINE' },
  { name: '3CX Cloud', letter: '3', typ: 'Telefonie', sync: 'vor 23 Min · alle 15 Min', access: 'lesen', state: 'warning', pill: 'HINWEIS' },
  { name: 'DATEV', letter: 'D', typ: 'Lohnbüro', sync: '—', access: 'lesen · schreiben', state: 'neutral', pill: 'PAUSE' },
  { name: 'n8n Worker', letter: 'n', typ: 'Automation', sync: 'live', access: 'intern', state: 'success', pill: 'ONLINE' },
];

export default function ConnectorsPage() {
  return (
    <>
      <Sidebar active="connectors" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Connectoren" subtitle="Übersicht aller verbundenen Tools · konfiguriert durch .birdie Team" />

        <div className="flex-1 px-8 py-7 flex flex-col gap-5">
          {/* Banner */}
          <div className="bg-surface border border-line rounded-[10px] px-4 py-3.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-info-bg flex items-center justify-center text-info font-bold text-sm">
              ℹ
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-semibold text-[13px] text-fg">Connectoren werden persönlich eingerichtet</span>
              <span className="text-xs text-fg2">
                Du siehst hier den aktuellen Stand. Für neue Verbindungen oder Änderungen schreib uns direkt — Antwort
                innert 24h.
              </span>
            </div>
            <button className="ml-auto shrink-0 px-3.5 py-2 bg-surface-2 border border-line-2 rounded-lg text-xs font-medium text-fg">
              Anfrage stellen
            </button>
          </div>

          {/* Table */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="grid grid-cols-[320px_160px_180px_220px_140px] bg-surface-2 border-b border-line h-11 items-center px-5">
              {['TOOL', 'TYP', 'LETZTER SYNC', 'ZUGRIFF', 'STATUS'].map((c) => (
                <span key={c} className="font-semibold text-[10px] text-fg3 tracking-[0.18em]">
                  {c}
                </span>
              ))}
            </div>
            {rows.map((r, i) => (
              <div
                key={r.name}
                className={`grid grid-cols-[320px_160px_180px_220px_140px] h-[60px] items-center px-5 ${
                  i < rows.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center font-semibold text-xs text-fg">
                    {r.letter}
                  </div>
                  <span className="font-medium text-[13px] text-fg">{r.name}</span>
                </div>
                <span className="text-xs text-fg2">{r.typ}</span>
                <span className="text-xs text-fg2">{r.sync}</span>
                <span className="text-xs text-fg2">{r.access}</span>
                <div>
                  <Pill label={r.pill} tone={r.state} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
