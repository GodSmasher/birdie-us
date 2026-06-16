import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alpen Energie — Kundengeschichte | .birdie',
  description: 'Wie Alpen Energie aus der Schweiz mit birdie Buchhaltung, Mahnwesen und Kundenkommunikation automatisiert hat.',
};

export default function AlpenEnergieCaseStudy() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a]">
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 200 48" className="h-6"><circle cx="12" cy="36" r="6" fill="#FACC15" /><text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#1a1a1a" letterSpacing="-1">birdie</text></svg>
          </Link>
          <Link href="/" className="text-[13px] text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition">&larr; Zur&uuml;ck</Link>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-6 pt-16 pb-8">
        <Link href="/" className="text-[13px] text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition">&larr; Alle Kundengeschichten</Link>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 mb-4 leading-[1.1]">
          Von 8 Tools zu einem Dashboard &mdash; wie Alpen Energie den &Uuml;berblick zur&uuml;ckgewonnen hat.
        </h1>
        <div className="flex items-center gap-3 mt-6">
          <span className="text-[15px] font-bold">Alpen Energie</span>
          <span className="text-[#1a1a1a]/20">&middot;</span>
          <span className="text-[13px] text-[#1a1a1a]/40">Solar &amp; Speicher &middot; Graub&uuml;nden, Schweiz</span>
        </div>
      </header>

      <div className="bg-gradient-to-br from-[#e8f0f5] to-[#c5d8e8] py-20 mb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <svg viewBox="0 0 200 48" className="h-8 mx-auto mb-4"><circle cx="12" cy="36" r="6" fill="#FACC15" /><text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#1a1a1a" letterSpacing="-1">birdie</text></svg>
          <p className="text-[#1a1a1a]/30 text-sm">&times; Alpen Energie</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-[280px_1fr] gap-16">
          <div className="flex flex-col gap-8">
            <div>
              <div className="text-4xl font-extrabold text-blue-500">80+</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">PV-Anlagen betreut</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-500">12</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">Bots im Einsatz</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-blue-500">1</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">Dashboard f&uuml;r alles</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#4ADE80]">0</div>
              <div className="text-[13px] text-[#1a1a1a]/40 mt-1">Tools ersetzt</div>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <section>
              <h2 className="text-xl font-extrabold mb-4">Herausforderung</h2>
              <p className="text-[16px] text-[#1a1a1a]/50 leading-relaxed">
                Alpen Energie aus Chur betreut &uuml;ber 80 PV-Anlagen in Graub&uuml;nden. Das Team arbeitete mit 8 verschiedenen Tools:
                CRM, Buchhaltung, E-Mail, Kalender, Excel-Tabellen, Cloud-Speicher, WhatsApp-Gruppen und einem separaten Monitoring-Portal.
              </p>
              <p className="text-[16px] text-[#1a1a1a]/50 leading-relaxed mt-4">
                Niemand hatte den gleichen Informationsstand. Rechnungen wurden vergessen, E-Mails landeten im falschen Postfach,
                und wenn ein Kunde anrief wusste keiner sofort den aktuellen Stand des Projekts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold mb-4">L&ouml;sung</h2>
              <p className="text-[16px] text-[#1a1a1a]/50 leading-relaxed">
                birdie wurde &uuml;ber alle bestehenden Tools gelegt &mdash; nichts wurde ersetzt. Innerhalb eines 30-Minuten-Calls
                waren CRM, sevDesk und Gmail verbunden. Die Bots &uuml;bernahmen Mahnwesen, E-Mail-Klassifizierung und t&auml;gliche Berichte.
              </p>
              <div className="bg-white rounded-2xl border border-black/[0.04] p-6 mt-6 flex flex-col gap-4">
                {[
                  'sevDesk-Rechnungen werden automatisch &uuml;berwacht, Mahnungen per Mail versendet',
                  'Eingehende E-Mails per KI dem richtigen Projekt zugeordnet',
                  'T&auml;glicher Report mit Pipeline-Status und offenen Aufgaben',
                  'Anlagen-Monitoring zeigt Produktion und St&ouml;rungen aller 80+ Anlagen',
                  'Team sieht alles auf einem Dashboard &mdash; B&uuml;ro, Baustelle, unterwegs',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-blue-500 text-[11px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[14px] text-[#1a1a1a]/60" dangerouslySetInnerHTML={{ __html: step }} />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#e8f0f5] rounded-2xl p-8">
              <p className="text-xl font-medium leading-relaxed text-[#1a1a1a]/70 italic">
                &ldquo;Wir hatten 8 verschiedene Tools und keinen &Uuml;berblick. Jetzt &ouml;ffne ich morgens birdie und sehe sofort was ansteht.
                Die Bots erledigen den Rest &mdash; Mahnungen, E-Mails, Berichte. Wir k&ouml;nnen uns endlich aufs Installieren konzentrieren.&rdquo;
              </p>
              <p className="text-[14px] font-bold text-[#1a1a1a]/50 mt-6">Gesch&auml;ftsf&uuml;hrung, Alpen Energie</p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold mb-4">Ergebnis</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { before: '8 Tools', after: '1 Dashboard', label: 'f&uuml;r den &Uuml;berblick' },
                  { before: 'Manuell', after: 'Automatisch', label: 'Mahnwesen' },
                  { before: 'Chaos', after: 'KI-sortiert', label: 'E-Mail-Zuordnung' },
                  { before: 'Kein Monitoring', after: 'Echtzeit', label: 'Anlagenstatus' },
                ].map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-black/[0.04] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px] text-[#1a1a1a]/25 line-through">{r.before}</span>
                      <span className="text-[#1a1a1a]/20">&rarr;</span>
                      <span className="text-[15px] font-bold text-blue-500">{r.after}</span>
                    </div>
                    <p className="text-[12px] text-[#1a1a1a]/35" dangerouslySetInnerHTML={{ __html: r.label }} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-20 text-center border-t border-black/[0.04] pt-16">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Auch den &Uuml;berblick verloren?</h2>
          <p className="text-[#1a1a1a]/40 mb-8">Wir zeigen dir in 20 Minuten wie birdie deinen Betrieb transparenter macht.</p>
          <a href="/#contact" className="inline-flex px-8 py-4 bg-[#1a1a1a] text-white font-semibold rounded-full text-[15px] hover:bg-black/80 transition-all">
            Demo anfragen &rarr;
          </a>
        </div>
      </div>

      <footer className="bg-[#1a1a1a] py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <svg viewBox="0 0 200 48" className="h-5"><circle cx="12" cy="36" r="6" fill="#FACC15" /><text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#ffffff" fillOpacity="0.3" letterSpacing="-1">birdie</text></svg>
          <div className="flex gap-6 text-[11px] text-white/20">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
