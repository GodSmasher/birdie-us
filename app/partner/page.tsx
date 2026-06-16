import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner werden | .birdie',
  description: 'Werde birdie Partner — als Hersteller, Softwareanbieter oder Distributor in der Solarbranche.',
};

const PARTNERS = [
  { type: 'HERSTELLER', title: 'Wechselrichter & Speicher', desc: 'Deine Geräte direkt in birdie integriert. Monitoring, Alerts, Datenblätter — für alle Installateure die birdie nutzen.', examples: ['EcoFlow', 'Sungrow', 'Fronius', 'SMA', 'Kostal', 'Huawei'] },
  { type: 'SOFTWARE', title: 'CRM, ERP & Buchhaltung', desc: 'Offizielle Integration in birdie. Deine Kunden sehen ihre Daten nahtlos — ohne Export, ohne Doppelpflege.', examples: ['Reonic', 'sevDesk', 'lexoffice', 'HubSpot', 'Salesforce', 'FastBill'] },
  { type: 'VERTRIEB', title: 'Distributoren & Großhandel', desc: 'Biete deinen Installateuren birdie als Mehrwert an. White-Label möglich, Co-Branding, gemeinsame Leads.', examples: ['Baywa r.e.', 'Krannich Solar', 'Memodo', 'Sonepar'] },
];

const BENEFITS = [
  { title: 'Zugang zu Installateuren', desc: 'birdie-Nutzer sind aktive PV-Installateure die täglich mit der Plattform arbeiten. Dein Produkt wird Teil ihres Workflows.' },
  { title: 'Offizielle Integration', desc: 'Wir bauen die Anbindung an deine API. Dein Logo, deine Daten, nahtlos in birdie eingebettet.' },
  { title: 'Co-Marketing', desc: 'Gemeinsame Case Studies, Blog-Artikel, Webinare. Wir erzählen die Geschichte zusammen.' },
  { title: 'Kein Risiko', desc: 'Keine Vorabkosten. Wir starten mit einer Pilotintegration und skalieren wenn es passt.' },
];

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a]">
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 200 48" className="h-6"><circle cx="12" cy="36" r="6" fill="#FACC15" /><text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#1a1a1a" letterSpacing="-1">birdie</text></svg>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[13px] text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition">&larr; Startseite</Link>
            <a href="#contact" className="px-5 py-2 bg-[#1a1a1a] text-white rounded-full text-[13px] font-semibold">Partner werden</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 md:py-32 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[12px] font-semibold text-[#FACC15] tracking-[0.25em] uppercase mb-6">Partnerschaft</p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Lass uns die Branche<br />transparenter machen.
          </h1>
          <p className="text-lg text-[#1a1a1a]/40 max-w-xl mx-auto">
            Du bist Hersteller, Softwareanbieter oder Distributor? Werde birdie Partner und erreiche
            aktive PV-Installateure direkt in ihrem Workflow.
          </p>
        </div>
      </section>

      {/* Partner types */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {PARTNERS.map(p => (
            <div key={p.type} className="bg-[#fafaf9] rounded-2xl border border-black/[0.04] p-7 flex flex-col">
              <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase mb-4">{p.type}</span>
              <h3 className="text-xl font-bold mb-3">{p.title}</h3>
              <p className="text-[14px] text-[#1a1a1a]/40 leading-relaxed mb-6 flex-1">{p.desc}</p>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-black/[0.04]">
                {p.examples.map(e => (
                  <span key={e} className="px-3 py-1 bg-white rounded-full text-[11px] text-[#1a1a1a]/40 border border-black/[0.04]">{e}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-16">Was du als Partner bekommst.</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#FACC15] font-bold text-[13px]">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold mb-1">{b.title}</h3>
                  <p className="text-[14px] text-[#1a1a1a]/40 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24 bg-[#1a1a1a] text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Interesse?</h2>
          <p className="text-white/40 mb-10 text-lg">Schreib uns — wir melden uns innerhalb von 24 Stunden.</p>
          <a href="mailto:partner@birdie.solar?subject=Partnerschaft" className="inline-flex px-8 py-4 bg-white text-[#1a1a1a] font-bold rounded-full text-[15px] hover:bg-white/90 transition-all">
            partner@birdie.solar &rarr;
          </a>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] border-t border-white/[0.06] py-8">
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
