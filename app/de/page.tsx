'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('rev'); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}
function R({ children, className = '', d = 0 }: { children: React.ReactNode; className?: string; d?: number }) {
  const ref = useReveal();
  return <div ref={ref} className={`rv ${className}`} style={{ transitionDelay: `${d}ms` }}>{children}</div>;
}

function Logo({ variant = 'dark', className = '' }: { variant?: 'dark' | 'light'; className?: string }) {
  return (
    <svg viewBox="0 0 200 48" className={className} aria-label=".birdie">
      <circle cx="12" cy="36" r="6" fill="#FACC15" />
      <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill={variant === 'dark' ? '#1a1a1a' : '#fff'} letterSpacing="-1">birdie</text>
    </svg>
  );
}

function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

const NETZBETREIBER = ['MITNETZ', 'Bayernwerk', 'E.DIS', 'Sachsen Netze', 'SH Netz', 'Westnetz', 'Netze BW', 'Avacon', 'EnviaM', 'EWE Netz', 'Stromnetz Berlin', 'Stadtwerke'];

const FAQS = [
  { q: 'Was genau ist birdie?', a: 'birdie verbindet eure bestehenden Tools (CRM, Buchhaltung, Wechselrichter) und gibt euch eine klare Sicht auf euren Betrieb. Dazu automatisiert birdie Papierkram wie Netzanmeldungen mit KI.' },
  { q: 'Muss ich meine bestehenden Tools ersetzen?', a: 'Nein. birdie ersetzt nichts -- es verbindet alles. Reonic, sevDesk, Gmail, Enphase bleiben. birdie steckt sich dran und zeigt alles an einem Ort.' },
  { q: 'Wie schnell bin ich startklar?', a: 'Ein 30-Minuten-Call. Wir verbinden eure Tools, richten die Bots ein, fertig. Keine monatelange Implementierung.' },
  { q: 'Sind meine Daten sicher?', a: 'Ja. Alle Daten sind verschluesselt (at rest und in transit). DSGVO-konform. Eure Daten werden nie an Dritte weitergegeben.' },
  { q: 'Was kostet birdie?', a: 'Wir richten alles persoenlich fuer euch ein. Der Preis haengt von den Integrationen und Bots ab. Demo ist kostenlos.' },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-[16px] font-semibold text-white/80 pr-8 group-hover:text-white transition">{q}</span>
        <span className={`text-white/20 text-xl shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
        <p className="text-[14px] text-white/30 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function DELandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div className="min-h-screen bg-[#08080c] text-white overflow-x-hidden">
      <style jsx global>{`
        .rv { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1); }
        .rv.rev { opacity: 1; transform: none; }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .logo-scroll { animation: scroll 30s linear infinite; }
        .gradient-text { background: linear-gradient(135deg, #FACC15 0%, #F59E0B 50%, #FACC15 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background-size: 200% auto; animation: shimmer 3s ease-in-out infinite; }
        @keyframes shimmer { 0% { background-position: 0% center; } 50% { background-position: 100% center; } 100% { background-position: 0% center; } }
        .bento-card { background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); transition: all 0.5s cubic-bezier(.16,1,.3,1); }
        .bento-card:hover { border-color: rgba(250,204,21,0.2); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(250,204,21,0.05); }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .float { animation: float 6s ease-in-out infinite; }
        .float-slow { animation: float 8s ease-in-out infinite; }
        @keyframes glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .glow { animation: glow 4s ease-in-out infinite; }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#08080c]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/de"><Logo variant="light" className="h-6" /></Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/35 font-medium">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#so-funktionierts" className="hover:text-white transition">So funktioniert&apos;s</a>
            <a href="#referenzen" className="hover:text-white transition">Referenzen</a>
            <Link href="/pricing" className="hover:text-white transition">Preise</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline text-[13px] text-white/35 font-medium hover:text-white transition">Anmelden</Link>
            <a href="#kontakt" className="px-5 py-2.5 bg-[#FACC15] text-[#0a0a0f] rounded-full text-[13px] font-bold hover:bg-[#fde047] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FACC15]/20">
              Demo buchen
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 text-center px-6 overflow-hidden">
        <FloatingOrb className="w-[600px] h-[600px] bg-[#FACC15]/[0.04] top-[-200px] left-[-200px] float" />
        <FloatingOrb className="w-[500px] h-[500px] bg-blue-500/[0.03] top-[-100px] right-[-200px] float-slow" />
        <FloatingOrb className="w-[300px] h-[300px] bg-[#FACC15]/[0.06] bottom-0 left-[50%] glow" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
            transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        <div className="relative z-10">
          <R>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-[12px] text-white/40 font-medium">Pilotprogramm aktiv &mdash; Jetzt starten</span>
            </div>
          </R>

          <R d={100}>
            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold tracking-[-0.04em] leading-[1.02] mb-6 max-w-5xl mx-auto">
              Die <span className="gradient-text">Transparenzschicht</span>
              <br />f&uuml;r euren Solarbetrieb.
            </h1>
          </R>

          <R d={200}>
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-white/35 max-w-2xl mx-auto mb-12 leading-relaxed">
              birdie verbindet eure Tools, automatisiert Netzanmeldungen mit KI
              und zeigt euch, was wirklich passiert. Pers&ouml;nlich eingerichtet.
            </p>
          </R>

          <R d={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="#kontakt" className="group px-8 py-4 bg-[#FACC15] text-[#0a0a0f] font-bold rounded-full text-[16px] hover:bg-[#fde047] hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-[#FACC15]/20 flex items-center gap-2 justify-center">
                Kostenlose Demo
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
              <Link href="/login" className="px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white/60 font-medium rounded-full text-[16px] hover:bg-white/[0.1] hover:text-white transition-all flex items-center gap-2 justify-center">
                Anmelden &rarr;
              </Link>
            </div>
          </R>

          <R d={500}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/20">
              <span className="flex items-center gap-2"><span className="text-[#FACC15]">&#9733;&#9733;&#9733;&#9733;&#9733;</span> Pilot aktiv</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>DSGVO-konform</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>Server in der EU</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>Pers&ouml;nliches Setup</span>
            </div>
          </R>
        </div>
      </section>

      {/* NETZBETREIBER CAROUSEL */}
      <section className="py-8 border-y border-white/[0.04] overflow-hidden">
        <p className="text-center text-[10px] text-white/15 uppercase tracking-[0.25em] font-medium mb-6">Unterst&uuml;tzte Netzbetreiber</p>
        <div className="relative">
          <div className="flex gap-14 logo-scroll" style={{ width: 'max-content' }}>
            {[...NETZBETREIBER, ...NETZBETREIBER].map((name, i) => (
              <span key={i} className="text-[15px] font-semibold text-white/10 whitespace-nowrap hover:text-white/30 transition-colors duration-500">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">Features</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Alles, was euer Solarbetrieb braucht.</h2>
            <p className="text-white/25 mt-4 max-w-xl mx-auto">Eine Plattform. Alle Tools verbunden. KI erledigt den Rest.</p>
          </R>

          <div className="grid md:grid-cols-3 gap-4">
            <R className="md:col-span-2">
              <div className="bento-card rounded-3xl p-8 md:p-10 h-full">
                <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase">NETZANMELDUNGS-KI</span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-4 mb-4">Netzanmeldung in<br />30 Sekunden.</h3>
                <p className="text-[15px] text-white/30 leading-relaxed mb-6 max-w-lg">
                  birdie liest Projektdaten aus eurem CRM, erkennt den Netzbetreiber anhand der PLZ und f&uuml;llt alle Formulare mit KI aus.
                  VDE-AR-N 4105, TAR, Marktstammdatenregister &mdash; alles integriert.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['MITNETZ', 'Bayernwerk', 'E.DIS', 'Sachsen Netze', 'SH Netz'].map(u => (
                    <span key={u} className="px-3 py-1.5 bg-white/[0.05] rounded-full text-[11px] text-white/30">{u}</span>
                  ))}
                  <span className="px-3 py-1.5 bg-[#FACC15]/10 rounded-full text-[11px] text-[#FACC15] font-medium">+20 weitere</span>
                </div>
              </div>
            </R>

            <R d={100}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#4ADE80] tracking-[0.2em] uppercase">MONITORING</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">Jede Anlage. Live.</h3>
                <p className="text-[13px] text-white/25 leading-relaxed mb-5">Produktion, Batterie-SoC, St&ouml;rungen &mdash; bevor der Kunde anruft.</p>
                <div className="bg-white/[0.03] rounded-xl p-3">
                  <div className="flex items-end gap-[3px] h-20">
                    {[12, 22, 38, 55, 72, 88, 95, 100, 92, 78, 58, 35, 18, 8].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: 'linear-gradient(to top, rgba(74,222,128,0.4), rgba(74,222,128,0.1))' }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] text-white/15">
                    <span>6:00</span><span>12:00</span><span>18:00</span>
                  </div>
                </div>
              </div>
            </R>

            <R d={200}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#60A5FA] tracking-[0.2em] uppercase">KI-BOT</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">E-Mail-Routing</h3>
                <p className="text-[13px] text-white/25 leading-relaxed">KI klassifiziert E-Mails und ordnet sie dem richtigen Projekt zu. Einspeisezusagen, Abnahmen &mdash; alles sortiert.</p>
              </div>
            </R>

            <R d={300}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#F87171] tracking-[0.2em] uppercase">KI-BOT</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">Zahlungserinnerungen</h3>
                <p className="text-[13px] text-white/25 leading-relaxed">&Uuml;berf&auml;llige Rechnungen? Der Bot schickt automatisch freundliche Follow-ups. Konfigurierbares Mahnstufen-System.</p>
              </div>
            </R>

            <R d={400}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#A78BFA] tracking-[0.2em] uppercase">DOKUMENT-KI</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">PDFs &rarr; Daten</h3>
                <p className="text-[13px] text-white/25 leading-relaxed">Angebote, Datenbl&auml;tter, PVSol-Berichte hochladen. birdie extrahiert Wechselrichter, Module, Speicher &mdash; automatisch.</p>
              </div>
            </R>
          </div>
        </div>
      </section>

      {/* SO FUNKTIONIERT'S */}
      <section id="so-funktionierts" className="py-20 md:py-28 relative">
        <FloatingOrb className="w-[400px] h-[400px] bg-[#FACC15]/[0.03] top-[50%] left-[-100px] glow" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">So funktioniert&apos;s</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Startklar in<br /><span className="gradient-text">unter 30 Minuten.</span></h2>
          </R>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {[
              { num: '01', title: 'Wir verbinden eure Tools', desc: 'CRM, Buchhaltung, Wechselrichter-Plattformen. Ein Call. Wir machen das.', icon: '🔗' },
              { num: '02', title: 'Sofort alles sehen', desc: 'Pipeline, Projekte, Rechnungen, Anlagenstatus -- ein Dashboard, ab Tag eins.', icon: '📊' },
              { num: '03', title: 'Bots uebernehmen', desc: 'Netzanmeldungen, Mahnungen, E-Mail-Routing -- Bots erledigen das. Ihr gebt frei.', icon: '🤖' },
            ].map((s, i) => (
              <R key={s.num} d={i * 150}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center mx-auto mb-5 text-2xl">
                    {s.icon}
                  </div>
                  <div className="text-[10px] font-bold text-[#FACC15] tracking-widest mb-2">{s.num}</div>
                  <h3 className="text-[18px] font-bold mb-3">{s.title}</h3>
                  <p className="text-[14px] text-white/25 leading-relaxed">{s.desc}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* REFERENZ */}
      <section id="referenzen" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">Referenzen</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Wie Installateure mit birdie arbeiten.</h2>
          </R>

          <R>
            <div className="bento-card rounded-3xl p-8 md:p-10 max-w-2xl mx-auto">
              <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase bg-[#FACC15]/10 px-3 py-1.5 rounded-full inline-block mb-6">SACHSEN-ANHALT &middot; PILOTKUNDE</span>
              <h3 className="text-2xl font-extrabold tracking-tight mb-3">Volta Energietechnik</h3>
              <p className="text-[15px] text-white/30 leading-relaxed mb-6">
                Netzanmeldungen bei MITNETZ, die fr&uuml;her 45 Minuten pro Antrag dauerten, erledigt der Bot jetzt in 5 Minuten. Dazu automatische Zahlungserinnerungen und E-Mail-Zuordnung.
              </p>
              <div className="bg-white/[0.03] rounded-2xl p-5 mb-6">
                <p className="text-[15px] italic text-white/40 leading-relaxed">
                  &ldquo;Ich pr&uuml;fe nur noch, was die KI ausf&uuml;llt &mdash; 5 Minuten, fertig. Den Rest machen die Bots.&rdquo;
                </p>
              </div>
              <div className="flex gap-6">
                {[{ v: '45→5 Min', l: 'Pro Antrag' }, { v: '3', l: 'Bots aktiv' }, { v: '0', l: 'Tools ersetzt' }].map(m => (
                  <div key={m.l}>
                    <div className="text-[15px] font-extrabold text-[#FACC15]">{m.v}</div>
                    <div className="text-[9px] text-white/20">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* DACH MARKT */}
      <section className="py-20 md:py-28 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#4ADE80] tracking-[0.25em] uppercase mb-4">F&uuml;r den DACH-Markt gebaut</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">VDE-konform. DSGVO-ready. Netzbetreiber-aware.</h2>
          </R>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: 'VDE-AR-N 4105 & TAR', desc: 'Formulare korrekt ausgefuellt mit NA-Schutz, Blindleistung, Wirkleistungssteuerung. Keine manuellen Nachschlagen.', color: '#FACC15' },
              { icon: '🏛', title: 'Marktstammdatenregister', desc: 'Automatische Registrierung und Abgleich eurer Anlagen im MaStR.', color: '#4ADE80' },
              { icon: '📋', title: 'Regionale Netzbetreiber', desc: 'Jeder Netzbetreiber hat eigene Regeln und Portale. birdie kennt die Anforderungen fuer jedes Netzgebiet.', color: '#60A5FA' },
            ].map((item, i) => (
              <R key={item.title} d={i * 100}>
                <div className="bento-card rounded-3xl p-7 h-full">
                  <div className="text-2xl mb-4">{item.icon}</div>
                  <h3 className="text-[16px] font-bold mb-2">{item.title}</h3>
                  <p className="text-[13px] text-white/25 leading-relaxed">{item.desc}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <R>
            <img src="/founder.jpeg" alt="Sarah Vogel" className="w-20 h-20 rounded-full object-cover mx-auto mb-8 shadow-lg shadow-[#FACC15]/20 border-2 border-[#FACC15]/30" />
            <p className="text-[20px] md:text-[26px] font-medium leading-relaxed text-white/40 max-w-2xl mx-auto mb-8">
              &ldquo;Ich hab als Entwicklerin bei einem Solarbetrieb angefangen und schnell gemerkt, was fehlt. Netzanmeldungen per Hand, 10 Tools, kein &Uuml;berblick. birdie ist die L&ouml;sung, die ich mir gew&uuml;nscht h&auml;tte.&rdquo;
            </p>
            <p className="text-[15px] font-bold">Sarah Vogel</p>
            <p className="text-[13px] text-white/25">Gr&uuml;nderin, .birdie</p>
          </R>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-6">
          <R className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">H&auml;ufige Fragen</h2>
          </R>
          <R>
            <div className="border-t border-white/[0.06]">
              {FAQS.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
            </div>
          </R>
        </div>
      </section>

      {/* CTA + LOGIN */}
      <section id="kontakt" className="py-20 md:py-32 relative overflow-hidden">
        <FloatingOrb className="w-[600px] h-[600px] bg-[#FACC15]/[0.06] top-[-200px] left-[50%] ml-[-300px] glow" />
        <R className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <Logo variant="light" className="h-10 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">
            Bereit f&uuml;r <span className="gradient-text">Transparenz?</span>
          </h2>
          <p className="text-white/30 mb-12 text-lg leading-relaxed">20 Minuten. Wir zeigen euch, was birdie f&uuml;r euren Betrieb tun kann.<br />Pers&ouml;nlich, kein Sales-Pitch.</p>
          <form action="https://formspree.io/f/hello@birdiesolar.com" method="POST" className="max-w-md mx-auto space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="first_name" placeholder="Vorname" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
              <input type="text" name="last_name" placeholder="Nachname" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
            </div>
            <input type="email" name="email" required placeholder="Firmen-E-Mail *" className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" name="company" placeholder="Firma" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
              <input type="text" name="job_title" placeholder="Position" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
            </div>
            <button type="submit" className="w-full group px-10 py-4 bg-[#FACC15] text-[#0a0a0f] font-bold rounded-full text-[16px] hover:bg-[#fde047] hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-[#FACC15]/25 flex items-center gap-2 justify-center">
              Demo buchen
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </form>

          <div className="relative flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/15">oder</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <Link href="/login" className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white/60 font-semibold rounded-full text-[15px] hover:bg-white/[0.1] hover:text-white hover:border-white/20 transition-all">
            Bereits Kunde? Anmelden &rarr;
          </Link>
        </R>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" className="h-5 mb-4" />
              <p className="text-[12px] text-white/15 leading-relaxed">Die Transparenzschicht<br />f&uuml;r Solarinstallateure.</p>
              <p className="text-[12px] text-white/15 mt-3">hello@birdiesolar.com</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">Produkt</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/20">
                <a href="#features" className="hover:text-white/40 transition">Features</a>
                <a href="#so-funktionierts" className="hover:text-white/40 transition">So funktioniert&apos;s</a>
                <a href="#referenzen" className="hover:text-white/40 transition">Referenzen</a>
                <a href="#kontakt" className="hover:text-white/40 transition">Demo buchen</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">Unternehmen</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/20">
                <Link href="/impressum" className="hover:text-white/40 transition">Impressum</Link>
                <Link href="/datenschutz" className="hover:text-white/40 transition">Datenschutz</Link>
                <Link href="/login" className="hover:text-white/40 transition">Anmelden</Link>
                <a href="mailto:hello@birdiesolar.com" className="hover:text-white/40 transition">Kontakt</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">International</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/20">
                <Link href="/" className="hover:text-white/40 transition">English (US) &rarr;</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/10">&copy; 2026 .birdie</p>
            <div className="flex items-center gap-4 text-[11px] text-white/10">
              <span>EU-hosted</span>
              <span>DSGVO-konform</span>
              <span>Made with &hearts; for Solar</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
