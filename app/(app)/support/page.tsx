import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function SupportPage() {
  return (
    <>
      <Sidebar active="support" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Support" subtitle="Persönlich · keine Warteschleife" />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[820px]">
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center text-accent text-lg">✦</div>
            <h2 className="font-semibold text-lg text-fg tracking-tightest">Direkter Draht zu .birdie</h2>
            <p className="text-[13px] text-fg2 leading-[20px] max-w-[520px]">
              Connectoren, Bots und Anpassungen richten wir persönlich ein. Schreib uns einfach — Antwort in der Regel
              innerhalb von 24 Stunden, dringende Themen schneller.
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">E-MAIL</span>
              <span className="text-sm font-medium text-fg">sarah@birdie.app</span>
              <span className="text-xs text-fg3">für alle Anfragen & neue Connectoren</span>
            </Card>
            <Card className="p-5 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-fg3 tracking-[0.18em]">REAKTIONSZEIT</span>
              <span className="text-sm font-medium text-fg">&lt; 24 Std</span>
              <span className="text-xs text-fg3">Mo–Fr · dringend auch schneller</span>
            </Card>
          </div>

          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Häufige Anliegen</h3>
            {[
              ['Neuen Connector anbinden', 'z.B. weiterer Wechselrichter, Tarif, Tool'],
              ['Bot anpassen oder erstellen', 'neue Automatisierung oder Änderung bestehender'],
              ['Nutzer / Zugriff verwalten', 'Team-Mitglieder hinzufügen oder entfernen'],
              ['Daten-Export anfordern', 'CSV / Excel deiner Daten'],
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
