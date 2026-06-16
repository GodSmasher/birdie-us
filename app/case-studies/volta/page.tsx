import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Volta Energietechnik — Kundengeschichte | .birdie',
  description: 'Wie Volta Energietechnik mit birdie die Netzanmeldung von 45 Minuten auf 5 Minuten reduziert hat.',
};

export default function VoltaCaseStudy() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 200 48" className="h-6" aria-label=".birdie">
              <circle cx="12" cy="36" r="6" fill="#FACC15" />
              <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#1a1a1a" letterSpacing="-1">birdie</text>
            </svg>
          </Link>
          <Link href="/" className="text-[13px] text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition">&larr; Zur&uuml;ck</Link>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-8">
        <Link href="/#kundengeschichten" className="text-[13px] text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition">&larr; Alle Kundengeschichten</Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 mb-4 leading-[1.1]">
          Von 45 Minuten pro Netzanmeldung auf 5 &mdash; mit KI-Dokumenten und automatischer Einreichung.
        </h1>
        <div className="flex items-center gap-3 mt-6">
          <span className="text-[15px] font-bold">Volta Energietechnik GmbH</span>
          <span className="text-[#1a1a1a]/20">&middot;</span>
          <span className="text-[13px] text-[#1a1a1a]/40">PV-Installateur &middot; Leipzig</span>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-[#1a1a1a] py-20 mb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <svg viewBox="0 0 200 48" className="h-8 mx-auto mb-4" aria-label=".birdie">
            <circle cx="12" cy="36" r="6" fill="#FACC15" />
            <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#ffffff" letterSpacing="-1">birdie</text>
          </svg>
          <p className="text-white/30 text-sm">&times; Volta Energietechnik</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-[280px_1fr] gap-16">
          {/* Sidebar metrics */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="text-4xl font-extrabold text-[#FACC15]">50+</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">Projekte in der Pipeline</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#FACC15]">5 Min</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">pro Netzanmeldung (vorher 45 Min)</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#FACC15]">25+</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">Netzbetreiber automatisch</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#FACC15]">5</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">Bots laufen 24/7</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#4ADE80]">0 &euro;</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">Setup-Kosten</div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-10">
            <section>
              <h2 className="text-xl font-extrabold mb-4">Herausforderung</h2>
              <p className="text-[16px] text-[#1a1a1a]/50 leading-relaxed">
                Volta Energietechnik installiert PV-Anlagen in Sachsen und Th&uuml;ringen &mdash; &uuml;berwiegend EcoFlow PowerOcean Systeme.
                Mit wachsender Kundenzahl wurde der administrative Aufwand zum Engpass: Netzanmeldungen bei 25+ verschiedenen Netzbetreibern,
                jedes Mal andere Formulare, andere Portale, andere Regeln. Pro Anmeldung 45 Minuten manuelles Ausf&uuml;llen.
              </p>
              <p className="text-[16px] text-[#1a1a1a]/50 leading-relaxed mt-4">
                Dazu kamen 10 verschiedene Tools die nicht miteinander redeten: Reonic f&uuml;r CRM, sevDesk f&uuml;r Buchhaltung,
                Gmail f&uuml;r Kommunikation, Excel f&uuml;r &Uuml;bersichten. Jeder im Team hatte eine andere Version der Wahrheit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold mb-4">L&ouml;sung</h2>
              <p className="text-[16px] text-[#1a1a1a]/50 leading-relaxed">
                birdie wurde direkt in den bestehenden Stack integriert &mdash; Reonic als CRM blieb, sevDesk blieb, Gmail blieb.
                birdie verbindet alles und f&uuml;gt eine KI-Schicht hinzu die den Papierkram &uuml;bernimmt.
              </p>
              <div className="bg-white rounded-2xl border border-black/[0.04] p-6 mt-6 flex flex-col gap-4">
                {[
                  'KI liest Projektdaten aus Reonic-Dokumenten (Auftr&auml;ge, Angebote)',
                  'Erkennt den Netzbetreiber automatisch anhand der PLZ',
                  'F&uuml;llt alle Formulare mit Fachregeln (NA-Schutz 253V, Drosselung 60%, Q(U)-Kennlinie)',
                  'Katrin im B&uuml;ro pr&uuml;ft und bearbeitet direkt in birdie',
                  'Jan der Elektriker unterschreibt per Link auf dem Tablet',
                  'Bot reicht beim Netzbetreiber ein',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#FACC15]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#FACC15] text-[11px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[14px] text-[#1a1a1a]/60" dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#f0efe9] rounded-2xl p-8">
              <p className="text-xl font-medium leading-relaxed text-[#1a1a1a]/70 italic">
                &ldquo;Vorher hab ich pro Netzanmeldung 45 Minuten gebraucht. Jetzt pr&uuml;fe ich nur noch was die KI ausf&uuml;llt &mdash;
                5 Minuten, fertig. Die Bots machen den Rest. Ich komm endlich zum eigentlichen Arbeiten.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a]/10 flex items-center justify-center font-bold text-sm">KS</div>
                <div>
                  <p className="text-[14px] font-bold">Katrin</p>
                  <p className="text-[12px] text-[#1a1a1a]/40">B&uuml;roleitung, Volta Energietechnik</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-extrabold mb-4">Ergebnis</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { before: '45 Min', after: '5 Min', label: 'pro Netzanmeldung' },
                  { before: '10 Tools', after: '1 Dashboard', label: 'f&uuml;r den &Uuml;berblick' },
                  { before: 'Manuell', after: 'Automatisch', label: 'Formulare ausf&uuml;llen' },
                  { before: 'PDF per WhatsApp', after: '1-Klick Link', label: 'Elektriker-Unterschrift' },
                ].map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-black/[0.04] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px] text-[#1a1a1a]/25 line-through">{r.before}</span>
                      <span className="text-[#1a1a1a]/20">&rarr;</span>
                      <span className="text-[15px] font-bold text-[#FACC15]">{r.after}</span>
                    </div>
                    <p className="text-[12px] text-[#1a1a1a]/35" dangerouslySetInnerHTML={{ __html: r.label }} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-extrabold mb-4">Eingesetzte Bots</h2>
              <div className="flex flex-col gap-3">
                {[
                  { name: 'KI-Dokumenten-Filler', desc: '100+ NB-Templates, Claude KI mit Fachregeln' },
                  { name: 'Netzanmeldungs-Bot', desc: 'Automatische Portaleinreichung bei 25+ Netzbetreibern' },
                  { name: 'Email-Sync', desc: 'IMAP-Postf&auml;cher automatisch klassifiziert' },
                  { name: 'Mahnbot', desc: 'sevDesk-Rechnungen &rarr; automatische Zahlungserinnerung' },
                  { name: 'Enrichment-Bot', desc: 'Liest Projektdaten aus Reonic-PDFs per KI' },
                ].map((bot, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-black/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold">{bot.name}</p>
                      <p className="text-[11px] text-[#1a1a1a]/35" dangerouslySetInnerHTML={{ __html: bot.desc }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center border-t border-black/[0.04] pt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Auch Netzanmeldungen satt?</h2>
          <p className="text-[#1a1a1a]/40 mb-8">Wir zeigen dir in 20 Minuten wie birdie deinen Betrieb entlastet.</p>
          <a href="/#contact" className="inline-flex px-8 py-4 bg-[#1a1a1a] text-white font-semibold rounded-full text-[15px] hover:bg-black/80 transition-all">
            Demo anfragen &rarr;
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <svg viewBox="0 0 200 48" className="h-5" aria-label=".birdie">
            <circle cx="12" cy="36" r="6" fill="#FACC15" />
            <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#ffffff" fillOpacity="0.3" letterSpacing="-1">birdie</text>
          </svg>
          <div className="flex gap-6 text-[11px] text-white/20">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
