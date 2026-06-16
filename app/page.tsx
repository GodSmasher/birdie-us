'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

// ── Scroll reveal ───────────────────────────────────────────────────────────
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

// ── Counter ─────────────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => { const p = Math.min((now - t0) / 1600, 1); setVal(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── FAQ Accordion ───────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.06]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-[16px] font-semibold pr-8 group-hover:text-[#1a1a1a] transition" dangerouslySetInnerHTML={{ __html: q }} />
        <span className={`text-[#1a1a1a]/30 text-xl shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
        <p className="text-[14px] text-[#1a1a1a]/40 leading-relaxed" dangerouslySetInnerHTML={{ __html: a }} />
      </div>
    </div>
  );
}

// ── Logo SVG ────────────────────────────────────────────────────────────────
function Logo({ variant = 'dark', className = '' }: { variant?: 'dark' | 'light'; className?: string }) {
  return (
    <svg viewBox="0 0 200 48" className={className} aria-label=".birdie">
      <circle cx="12" cy="36" r="6" fill="#FACC15" />
      <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill={variant === 'dark' ? '#1a1a1a' : '#fff'} letterSpacing="-1">birdie</text>
    </svg>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────
const LOGOS = ['Reonic', 'sevDesk', 'EcoFlow', 'n8n', 'Gmail', 'lexoffice', 'HubSpot', 'Strato', 'Google Calendar', 'FastBill', 'Salesforce', 'IMAP'];

const USE_CASES = [
  { title: 'Netzanmeldung', desc: 'KI f&uuml;llt Formulare f&uuml;r 25+ Netzbetreiber. Du pr&uuml;fst, gibst frei, fertig.', href: '/case-studies/volta' },
  { title: 'Anlagen-Monitoring', desc: 'Sieh was deine verbauten Anlagen machen. Produktion, Speicher, St&ouml;rungen &mdash; live.', href: '#' },
  { title: 'Dokumenten-KI', desc: 'Liest Projektdaten aus PDFs, extrahiert WR, Speicher, Module &mdash; automatisch.', href: '#' },
  { title: 'Email-Zuordnung', desc: 'KI klassifiziert Mails und ordnet sie dem richtigen Projekt zu. Kein manuelles Sortieren.', href: '#' },
  { title: 'Zahlungserinnerungen', desc: 'sevDesk-Rechnungen &uuml;berf&auml;llig? Mahnbot verschickt h&ouml;fliche Erinnerungen.', href: '#' },
  { title: '100+ weitere', desc: 'Jeder Workflow den du brauchst. Wir bauen ihn f&uuml;r dich &mdash; pers&ouml;nlich eingerichtet.', href: '/#contact' },
];

const FAQS = [
  { q: 'Was genau ist birdie?', a: 'birdie ist die Transparenz-Schicht f&uuml;r Solarinstallateure. Es verbindet deine bestehenden Tools (CRM, Buchhaltung, Wechselrichter) und gibt dir ein klares Bild &uuml;ber deinen Betrieb. Dazu automatisiert es Papierkram wie Netzanmeldungen per KI.' },
  { q: 'Muss ich meine bestehenden Tools ersetzen?', a: 'Nein. birdie ersetzt nichts &mdash; es verbindet alles. Dein Reonic, sevDesk, Gmail, EcoFlow bleibt. birdie dockt an und zeigt dir alles an einem Ort.' },
  { q: 'Werden die Daten in der EU gespeichert?', a: 'Ja. Alle Daten liegen auf EU-Servern (Frankfurt). DSGVO-konform, verschl&uuml;sselt, kein Transfer in die USA.' },
  { q: 'Wie schnell bin ich einsatzbereit?', a: 'Ein 30-Minuten-Call. Wir verbinden deine Tools, richten die Bots ein, und du kannst loslegen. Kein monatelanges Setup.' },
  { q: 'Was kostet birdie?', a: 'Wir richten alles pers&ouml;nlich f&uuml;r dich ein. Preis h&auml;ngt davon ab welche Integrationen und Bots du brauchst. Demo ist kostenlos &mdash; einfach anfragen.' },
  { q: 'Was wenn mir ein Feature fehlt?', a: 'Sag uns was du brauchst &mdash; wir bauen es. Kein Ticketsystem, kein "kommt auf die Roadmap". Dein Wunsch-Feature wird umgesetzt.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a]">
      <style jsx global>{`
        .rv { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1); }
        .rv.rev { opacity: 1; transform: none; }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .logo-scroll { animation: scroll 25s linear infinite; }
      `}</style>

      {/* ━━━ NAV ━━━ */}
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/"><Logo variant="dark" className="h-6" /></Link>
          <div className="hidden md:flex items-center gap-7 text-[13px] text-[#1a1a1a]/40 font-medium">
            <a href="#use-cases" className="hover:text-[#1a1a1a] transition">Use Cases</a>
            <a href="#integrationen" className="hover:text-[#1a1a1a] transition">Integrationen</a>
            <Link href="/case-studies/volta" className="hover:text-[#1a1a1a] transition">Kundengeschichten</Link>
            <Link href="/partner" className="hover:text-[#1a1a1a] transition">Partner werden</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/gate" className="hidden sm:inline text-[13px] text-[#1a1a1a]/40 font-medium hover:text-[#1a1a1a]">Login</Link>
            <a href="#contact" className="px-5 py-2 bg-[#1a1a1a] text-white rounded-full text-[13px] font-semibold hover:bg-black/80 active:scale-95 transition-all">Demo anfragen</a>
          </div>
        </div>
      </nav>

      {/* ━━━ 1. HERO ━━━ */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 text-center px-6">
        <R>
          <p className="text-[13px] font-semibold text-[#1a1a1a]/30 tracking-[0.2em] uppercase mb-6">F&uuml;r Solarinstallateure</p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-[-0.04em] leading-[1.05] mb-6 max-w-4xl mx-auto">
            Die Transparenz-Schicht<br />f&uuml;r deinen Solarbetrieb.
          </h1>
          <p className="text-[clamp(1rem,2vw,1.2rem)] text-[#1a1a1a]/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            birdie verbindet deine bestehenden Tools, automatisiert den Papierkram per KI und zeigt dir was in deinem Betrieb wirklich passiert. Pers&ouml;nlich eingerichtet, nicht self-service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-8 py-4 bg-[#1a1a1a] text-white font-semibold rounded-full text-[15px] hover:bg-black/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10">
              Kostenlose Demo &rarr;
            </a>
            <a href="#use-cases" className="px-8 py-4 text-[#1a1a1a]/50 font-medium rounded-full text-[15px] hover:text-[#1a1a1a] transition">
              Use Cases ansehen
            </a>
          </div>
        </R>
      </section>

      {/* ━━━ 2. SOCIAL PROOF ━━━ */}
      <section className="py-6 border-y border-black/[0.04] bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-[#1a1a1a]/30">
          <span className="flex items-center gap-1.5"><span className="text-[#FACC15]">&#9733;&#9733;&#9733;&#9733;&#9733;</span> Pilotprogramm live</span>
          <span>&middot;</span>
          <span>DSGVO-konform</span>
          <span>&middot;</span>
          <span>EU-Server (Frankfurt)</span>
          <span>&middot;</span>
          <span>Pers&ouml;nliches Onboarding</span>
        </div>
      </section>

      {/* ━━━ 3. LOGO-KARUSSELL ━━━ */}
      <section className="py-10 overflow-hidden bg-white border-b border-black/[0.04]">
        <p className="text-center text-[11px] text-[#1a1a1a]/20 uppercase tracking-[0.2em] font-medium mb-6">Verbindet sich mit</p>
        <div className="relative">
          <div className="flex gap-12 logo-scroll" style={{ width: 'max-content' }}>
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <span key={i} className="text-[15px] font-semibold text-[#1a1a1a]/15 whitespace-nowrap hover:text-[#1a1a1a]/40 transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 4. KUNDENGESCHICHTEN (fullwidth, fonio-style) ━━━ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#1a1a1a]/25 tracking-[0.25em] uppercase mb-4">Kundengeschichten</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">So arbeiten Installateure mit birdie.</h2>
          </R>

          {/* Story 1: Volta */}
          <R className="mb-8">
            <Link href="/case-studies/volta" className="block group">
              <div className="bg-white rounded-3xl border border-black/[0.04] overflow-hidden hover:shadow-xl hover:border-black/[0.08] transition-all duration-500">
                <div className="grid md:grid-cols-2 min-h-[420px]">
                  {/* Left: Image area */}
                  <div className="bg-gradient-to-br from-[#f5f0e8] to-[#ebe6db] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase bg-[#FACC15]/10 px-3 py-1.5 rounded-full">PV-INSTALLATEUR &middot; LEIPZIG</span>
                    </div>
                    {/* App mockup as "screenshot" */}
                    <div className="mt-6 bg-[#0f1117] rounded-xl shadow-2xl shadow-black/20 overflow-hidden border border-white/10 transform group-hover:scale-[1.02] transition-transform duration-500">
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
                        <div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" />
                        <span className="mx-auto text-[8px] text-white/20 font-mono">birdie &middot; netzanmeldung</span>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5">
                        {['Nickel &mdash; TEN &mdash; Freigegeben', 'Baetge &mdash; TEN &mdash; Bitte pr&uuml;fen', 'M&uuml;ller &mdash; SN &mdash; KI generiert'].map((r, i) => (
                          <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-white/[0.03] rounded-lg">
                            <span className="text-[9px] text-white/50" dangerouslySetInnerHTML={{ __html: r.split(' &mdash; ').slice(0, 2).join(' &middot; ') }} />
                            <span className="text-[7px] px-1.5 py-0.5 rounded bg-[#FACC15]/10 text-[#FACC15] font-bold" dangerouslySetInnerHTML={{ __html: r.split(' &mdash; ')[2] }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      {[{ v: '50+', l: 'Projekte' }, { v: '5 Min', l: 'pro Anmeldung' }, { v: '5', l: 'Bots aktiv' }].map(m => (
                        <div key={m.l} className="bg-white/60 backdrop-blur rounded-xl px-3 py-2">
                          <div className="text-[15px] font-extrabold text-[#1a1a1a]">{m.v}</div>
                          <div className="text-[9px] text-[#1a1a1a]/40">{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right: Content */}
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-4">
                      Volta Energietechnik
                    </h3>
                    <p className="text-[15px] font-semibold text-[#1a1a1a]/60 mb-6">
                      Von 45 Minuten pro Netzanmeldung auf 5 &mdash; mit KI-Dokumenten und automatischer Einreichung.
                    </p>
                    <p className="text-[14px] text-[#1a1a1a]/35 leading-relaxed mb-8">
                      Volta installiert PV-Anlagen in Sachsen und Th&uuml;ringen. Mit birdie werden Netzanmeldungen f&uuml;r 25+ Netzbetreiber
                      per KI ausgef&uuml;llt, von Katrin im B&uuml;ro gepr&uuml;ft, und vom Elektriker per Link unterschrieben.
                    </p>
                    <div className="bg-[#f0efe9] rounded-2xl p-5 mb-8">
                      <p className="text-[15px] italic text-[#1a1a1a]/50 leading-relaxed">
                        &ldquo;Jetzt pr&uuml;fe ich nur noch was die KI ausf&uuml;llt &mdash; 5 Minuten, fertig. Die Bots machen den Rest.&rdquo;
                      </p>
                      <p className="text-[12px] font-semibold text-[#1a1a1a]/40 mt-3">Katrin &middot; B&uuml;roleitung</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <a href="https://volta-solaranlagen.de" target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#1a1a1a]/25 hover:text-[#1a1a1a]/50 transition">volta-solaranlagen.de &nearr;</a>
                      <span className="text-[14px] font-semibold text-[#1a1a1a] group-hover:text-[#FACC15] transition">Weiterlesen &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </R>

          {/* Story 2: Alpen Energie */}
          <R d={150}>
            <Link href="/case-studies/alpen-energie" className="block group">
              <div className="bg-white rounded-3xl border border-black/[0.04] overflow-hidden hover:shadow-xl hover:border-black/[0.08] transition-all duration-500">
                <div className="grid md:grid-cols-2 min-h-[420px]">
                  {/* Left: Content */}
                  <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-4">
                      Alpen Energie
                    </h3>
                    <p className="text-[15px] font-semibold text-[#1a1a1a]/60 mb-6">
                      Wie ein Schweizer Installateur mit birdie Buchhaltung, Mahnwesen und Kundenkommunikation automatisiert hat.
                    </p>
                    <p className="text-[14px] text-[#1a1a1a]/35 leading-relaxed mb-8">
                      Alpen Energie aus Chur betreut &uuml;ber 80 PV-Anlagen in Graub&uuml;nden. Mit birdie laufen Mahnungen automatisch &uuml;ber sevDesk,
                      E-Mails werden per KI dem richtigen Projekt zugeordnet, und das Team sieht alles auf einem Dashboard.
                    </p>
                    <div className="bg-[#f0efe9] rounded-2xl p-5 mb-8">
                      <p className="text-[15px] italic text-[#1a1a1a]/50 leading-relaxed">
                        &ldquo;Wir hatten 8 verschiedene Tools und keinen &Uuml;berblick. Jetzt &ouml;ffne ich morgens birdie und sehe sofort was ansteht.&rdquo;
                      </p>
                      <p className="text-[12px] font-semibold text-[#1a1a1a]/40 mt-3">Gesch&auml;ftsf&uuml;hrung &middot; Alpen Energie</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#1a1a1a]/25">Graub&uuml;nden, Schweiz</span>
                      <span className="text-[14px] font-semibold text-[#1a1a1a] group-hover:text-[#FACC15] transition">Weiterlesen &rarr;</span>
                    </div>
                  </div>
                  {/* Right: Image area */}
                  <div className="bg-gradient-to-br from-[#e8f0f5] to-[#d5e3ed] p-8 md:p-12 flex flex-col justify-between order-1 md:order-2 relative overflow-hidden">
                    <div>
                      <span className="text-[9px] font-bold text-blue-500 tracking-[0.2em] uppercase bg-blue-500/10 px-3 py-1.5 rounded-full">SOLAR &middot; SCHWEIZ</span>
                    </div>
                    {/* Dashboard mockup */}
                    <div className="mt-6 bg-[#0f1117] rounded-xl shadow-2xl shadow-black/20 overflow-hidden border border-white/10 transform group-hover:scale-[1.02] transition-transform duration-500">
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
                        <div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" />
                        <span className="mx-auto text-[8px] text-white/20 font-mono">birdie &middot; dashboard</span>
                      </div>
                      <div className="p-3 grid grid-cols-3 gap-2">
                        {[{ v: 'CHF 1.2M', l: 'Pipeline', c: '#FACC15' }, { v: '94%', l: 'Online', c: '#4ADE80' }, { v: '12', l: 'Bots', c: '#60A5FA' }].map(k => (
                          <div key={k.l} className="bg-white/[0.04] rounded-lg p-2 text-center">
                            <div className="text-[13px] font-bold" style={{ color: k.c }}>{k.v}</div>
                            <div className="text-[7px] text-white/30 uppercase">{k.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      {[{ v: '80+', l: 'Anlagen' }, { v: '12', l: 'Bots aktiv' }, { v: '0', l: 'Tools ersetzt' }].map(m => (
                        <div key={m.l} className="bg-white/60 backdrop-blur rounded-xl px-3 py-2">
                          <div className="text-[15px] font-extrabold text-[#1a1a1a]">{m.v}</div>
                          <div className="text-[9px] text-[#1a1a1a]/40">{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </R>
        </div>
      </section>

      {/* ━━━ 5. 3-SCHRITT SETUP ━━━ */}
      <section className="py-20 md:py-28 bg-white border-y border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#1a1a1a]/25 tracking-[0.25em] uppercase mb-4">So funktioniert&apos;s</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">In unter 30 Minuten einsatzbereit.</h2>
            <p className="text-[#1a1a1a]/35 mt-3">Keine technischen Kenntnisse n&ouml;tig. Wir machen das f&uuml;r dich.</p>
          </R>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Connectoren anschlie&szlig;en', desc: 'Wir verbinden dein CRM, deine Buchhaltung und deine Wechselrichter. Ein Call, 30 Minuten.' },
              { num: '02', title: 'Alles auf einen Blick', desc: 'Ab Tag 1 siehst du Pipeline, Projekte, offene Posten, Anlagenstatus &mdash; an einem Ort.' },
              { num: '03', title: 'Bots &uuml;bernehmen', desc: 'Netzanmeldung, Mahnungen, E-Mails &mdash; Bots erledigen das. Du gibst nur noch frei.' },
            ].map((s, i) => (
              <R key={s.num} d={i * 120}>
                <div className="bg-[#fafaf9] rounded-2xl border border-black/[0.04] p-7 h-full">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-5">
                    <span className="text-[#FACC15] font-bold text-[13px]">{s.num}</span>
                  </div>
                  <h3 className="text-[17px] font-bold mb-2" dangerouslySetInnerHTML={{ __html: s.title }} />
                  <p className="text-[14px] text-[#1a1a1a]/35 leading-relaxed" dangerouslySetInnerHTML={{ __html: s.desc }} />
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 6. USE CASES ━━━ */}
      <section id="use-cases" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">Use Cases</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Was birdie f&uuml;r dich tun kann.</h2>
          </R>
          {/* Feature 1: Netzanmeldung — mit App-Mockup */}
          <R className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase mb-4 inline-block">NETZANMELDUNG</span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">25 Netzbetreiber. 100+ Formulare. 30 Sekunden.</h3>
                <p className="text-[15px] text-[#1a1a1a]/40 leading-relaxed mb-6">
                  birdie liest die Projektdaten aus deinem CRM, erkennt den Netzbetreiber anhand der PLZ, und f&uuml;llt alle Formulare per KI aus.
                  Fachregeln sind eingebaut &mdash; NA-Schutz, Drosselung, Symmetrie. Du pr&uuml;fst direkt in birdie, gibst frei, der Elektriker unterschreibt per Link.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['TEN', 'Sachsen Netze', 'Bayernwerk', 'MITNETZ', 'Werra Energie'].map(nb => (
                    <span key={nb} className="px-2.5 py-1 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/40">{nb}</span>
                  ))}
                  <span className="px-2.5 py-1 bg-[#FACC15]/10 rounded-full text-[11px] text-[#FACC15] font-medium">+20 weitere</span>
                </div>
                <Link href="/case-studies/volta" className="text-[14px] font-semibold text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition">Use Case: Volta &rarr;</Link>
              </div>
              <div className="bg-[#0f1117] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-white/10">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-[#F87171]" /><div className="w-2 h-2 rounded-full bg-[#FBBF24]" /><div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                  <span className="mx-auto text-[9px] text-white/20 font-mono">netzanmeldung/nickel</span>
                </div>
                <div className="p-4 flex gap-3">
                  {/* Left: data */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Projektdaten</div>
                    {[['Anlage', '6,3 kWp'], ['WR', 'EcoFlow PowerOcean 8kW'], ['Speicher', '7,68 kWh'], ['Adresse', 'Kraker 6, 07356 Bad Lobenstein']].map(([k, v]) => (
                      <div key={k} className="flex justify-between px-2.5 py-1.5 bg-white/[0.03] rounded-lg">
                        <span className="text-[9px] text-white/30">{k}</span>
                        <span className="text-[9px] text-white/60 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                  {/* Right: docs */}
                  <div className="w-40 flex flex-col gap-2">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Dokumente</div>
                    {['AN005 Antragstellung', 'ANS Anmeldung', 'AN002 IBN-Protokoll'].map(d => (
                      <div key={d} className="px-2.5 py-2 bg-white/[0.03] rounded-lg">
                        <span className="text-[9px] text-white/50">{d}</span>
                        <div className="text-[8px] text-[#4ADE80] font-bold mt-0.5">&#x2713; KI ausgef&uuml;llt</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </R>

          {/* Feature 2: Monitoring */}
          <R className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-[#0f1117] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-white/10">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-[#F87171]" /><div className="w-2 h-2 rounded-full bg-[#FBBF24]" /><div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                  <span className="mx-auto text-[9px] text-white/20 font-mono">anlagen / monitoring</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{ v: '847 kWp', l: 'Installiert', c: '#FACC15' }, { v: '94%', l: 'Online', c: '#4ADE80' }, { v: '73%', l: 'Eigenverbr.', c: '#60A5FA' }].map(k => (
                      <div key={k.l} className="bg-white/[0.04] rounded-lg p-2.5 text-center">
                        <div className="text-[14px] font-bold" style={{ color: k.c }}>{k.v}</div>
                        <div className="text-[8px] text-white/25 uppercase">{k.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <div className="text-[8px] text-white/25 uppercase mb-2">Tagesproduktion</div>
                    <div className="flex items-end gap-[2px] h-16">
                      {[12, 22, 38, 55, 72, 88, 95, 100, 92, 78, 58, 35, 18, 8].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: 'linear-gradient(to top, rgba(250,204,21,0.5), rgba(250,204,21,0.15))' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="text-[9px] font-bold text-[#4ADE80] tracking-[0.2em] uppercase mb-4 inline-block">MONITORING</span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">Jede Anlage. Jederzeit. Bevor der Kunde anruft.</h3>
                <p className="text-[15px] text-[#1a1a1a]/40 leading-relaxed mb-6">
                  Verbinde die EcoFlow-Anlagen deiner Kunden und sieh Produktion, Speicher-SoC und St&ouml;rungen in Echtzeit.
                  Mehr Kundenkontakt, mehr Vertrauen, weniger Support-Tickets.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/40">EcoFlow PowerOcean</span>
                  <span className="px-3 py-1.5 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/25">Weitere bald</span>
                </div>
              </div>
            </div>
          </R>

          {/* Feature 3: Bots + more */}
          <R>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { title: 'Email-Zuordnung', desc: 'KI klassifiziert eingehende Mails und ordnet sie dem richtigen Projekt zu. Einspeisezusagen, Z&auml;hlertermine, R&uuml;ckfragen &mdash; alles am richtigen Ort.', tag: 'KI' },
                { title: 'Zahlungserinnerungen', desc: 'sevDesk-Rechnungen &uuml;berf&auml;llig? Mahnbot verschickt h&ouml;fliche Erinnerungen. Konfigurierbare Stufen, automatisch aber menschlich.', tag: 'BOT' },
                { title: '+ Dein Workflow', desc: 'Dir fehlt was? Wir bauen jeden Workflow den du brauchst. Pers&ouml;nlich eingerichtet, nicht self-service. Dein Wunsch-Feature wird gebaut.', tag: 'CUSTOM' },
              ].map((f, i) => (
                <a key={f.title} href="#contact" className="block bg-white rounded-2xl border border-black/[0.04] p-7 hover:shadow-lg hover:border-black/[0.08] transition-all group">
                  <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.15em] uppercase">{f.tag}</span>
                  <h3 className="text-[16px] font-bold mt-3 mb-2 group-hover:text-[#FACC15] transition">{f.title}</h3>
                  <p className="text-[13px] text-[#1a1a1a]/35 leading-relaxed" dangerouslySetInnerHTML={{ __html: f.desc }} />
                </a>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ 7. INTEGRATIONEN ━━━ */}
      <section id="integrationen" className="py-20 md:py-28 bg-[#1a1a1a] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">Integrationen</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dein System. Unsere Verbindung.</h2>
            <p className="text-white/30 mt-3 max-w-xl mx-auto">Reonic, sevDesk, EcoFlow &mdash; oder dein eigenes CRM/ERP. Wir bauen die Anbindung.</p>
          </R>
          <div className="flex flex-wrap justify-center gap-3">
            {LOGOS.map(name => (
              <span key={name} className="px-5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-full text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition cursor-default">{name}</span>
            ))}
            <span className="px-5 py-2.5 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full text-[13px] font-medium text-[#FACC15]">+ Dein System</span>
          </div>
        </div>
      </section>

      {/* ━━━ FOUNDER ━━━ */}
      <section className="py-20 md:py-28 bg-[#f0efe9]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <R>
            <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-6">
              <span className="text-[#FACC15] font-black text-2xl">SV</span>
            </div>
            <p className="text-[20px] md:text-[24px] font-medium leading-relaxed text-[#1a1a1a]/60 max-w-2xl mx-auto mb-6">
              &ldquo;Ich hab als Entwicklerin bei einem Solarbetrieb angefangen und schnell gemerkt was eigentlich fehlt. Netzanmeldungen per Hand, 10 Tools, keine &Uuml;bersicht. birdie ist die L&ouml;sung die ich mir gew&uuml;nscht habe.&rdquo;
            </p>
            <p className="text-[15px] font-bold">Sarah Vogel</p>
            <p className="text-[13px] text-[#1a1a1a]/35">Gr&uuml;nderin .birdie</p>
          </R>
        </div>
      </section>

      {/* ━━━ 10. FAQ ━━━ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <R className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">H&auml;ufige Fragen</h2>
          </R>
          <R>
            <div className="border-t border-black/[0.06]">
              {FAQS.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ 11. FINAL CTA ━━━ */}
      <section id="contact" className="py-20 md:py-28 bg-[#1a1a1a] text-white">
        <R className="max-w-2xl mx-auto px-6 text-center">
          <Logo variant="light" className="h-8 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Bereit f&uuml;r Transparenz?</h2>
          <p className="text-white/35 mb-10 text-lg">20 Minuten. Wir zeigen dir was birdie f&uuml;r deinen Betrieb tun kann. Pers&ouml;nlich, kein Sales-Pitch.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:info@birdie.solar?subject=Demo%20Anfrage" className="px-8 py-4 bg-white text-[#1a1a1a] font-bold rounded-full text-[15px] hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-lg shadow-white/10">
              Demo per E-Mail &rarr;
            </a>
            <a href="https://wa.me/message" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/[0.06] border border-white/[0.1] text-white font-medium rounded-full text-[15px] hover:bg-white/[0.1] transition">
              WhatsApp schreiben
            </a>
          </div>
        </R>
      </section>

      {/* ━━━ 12. FOOTER ━━━ */}
      <footer className="bg-[#1a1a1a] border-t border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand */}
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" className="h-5 mb-4" />
              <p className="text-[12px] text-white/20 leading-relaxed">Die Transparenz-Schicht f&uuml;r Solarinstallateure.</p>
              <p className="text-[12px] text-white/20 mt-3">info@birdie.solar</p>
            </div>
            {/* Col 2: Produkt */}
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Produkt</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/25">
                <a href="#use-cases" className="hover:text-white/50 transition">Use Cases</a>
                <a href="#integrationen" className="hover:text-white/50 transition">Integrationen</a>
                <Link href="/case-studies/volta" className="hover:text-white/50 transition">Kundengeschichten</Link>
                <a href="#contact" className="hover:text-white/50 transition">Demo anfragen</a>
              </div>
            </div>
            {/* Col 3: Unternehmen */}
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Unternehmen</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/25">
                <Link href="/partner" className="hover:text-white/50 transition">Partner werden</Link>
                <Link href="/impressum" className="hover:text-white/50 transition">Impressum</Link>
                <a href="#" className="hover:text-white/50 transition">Datenschutz</a>
                <a href="#" className="hover:text-white/50 transition">Kontakt</a>
              </div>
            </div>
            {/* Col 4: Ressourcen */}
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Ressourcen</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/25">
                <a href="#" className="hover:text-white/50 transition">Blog (bald)</a>
                <a href="#" className="hover:text-white/50 transition">Hilfe</a>
                <Link href="/gate" className="hover:text-white/50 transition">Login</Link>
              </div>
            </div>
          </div>
          {/* Bottom */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/15">&copy; 2026 .birdie</p>
            <div className="flex items-center gap-4 text-[11px] text-white/15">
              <span>EU-gehostet</span>
              <span>DSGVO-konform</span>
              <span>Made in Germany</span>
            </div>
          </div>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'SoftwareApplication',
        name: '.birdie', applicationCategory: 'BusinessApplication', operatingSystem: 'Web',
        description: 'Die Transparenz-Schicht für Solarinstallateure.',
      })}} />
    </div>
  );
}
