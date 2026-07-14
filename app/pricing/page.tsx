'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

function useLocale() {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'en';
    return window.location.hostname.endsWith('.de') ? 'de' : 'en';
  }, []);
}

function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 48" className={className} aria-label=".birdie">
      <circle cx="12" cy="36" r="6" fill="#FACC15" />
      <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#fff" letterSpacing="-1">birdie</text>
    </svg>
  );
}

const t = {
  en: {
    nav: { features: 'Features', how: 'How it Works', stories: 'Stories', partners: 'Partners', login: 'Login', cta: 'Book a Demo', pricing: 'Pricing' },
    hero: 'Simple pricing,\nbuilt around you.',
    sub: 'No hidden fees. No per-seat licensing. One platform — set up personally for your team.',
    currency: '$',
    setup: 'One-time setup',
    mo: '/mo',
    cta: 'Talk to us',
    ctaFree: 'Get started',
    popular: 'Most popular',
    includes: 'Everything in',
    plus: ', plus:',
    faq: 'Questions?',
    faqSub: 'Reach out anytime — we answer personally.',
    tiers: [
      {
        name: 'Starter',
        price: 'Free',
        setupPrice: null,
        desc: 'Connect your tools, see your data. No credit card required.',
        features: [
          'Email sync & unified inbox',
          'Operations dashboard',
          'System connections (CRM, accounting)',
          'Basic fleet overview',
          'Community support',
        ],
      },
      {
        name: 'Professional',
        price: '1,500',
        setupPrice: '5,000',
        desc: 'Automate post-install operations. The full birdie experience.',
        features: [
          'Interconnection bot (AI-powered)',
          'Custom workflows & automations',
          'Dunning & payment reminders',
          'Finance & cashflow tracking',
          'Document management',
          'Priority support',
        ],
      },
      {
        name: 'Enterprise',
        price: '3,500',
        setupPrice: '5,000',
        desc: 'For teams that need maximum automation and dedicated support.',
        features: [
          'Custom bots & integrations',
          'Advanced compliance checks',
          'Dedicated account manager',
          '24/7 phone & chat support',
          'Custom reporting & API access',
          'Multi-location support',
        ],
      },
    ],
    faqs: [
      { q: 'What\'s included in the setup fee?', a: 'We personally connect all your systems (CRM, accounting, email, inverter portals), configure your bots and workflows, and train your team. Usually done in under 2 weeks.' },
      { q: 'Can I start free and upgrade later?', a: 'Yes. Start with Starter, connect your tools, and see your data. When you\'re ready for automation, we hop on a call and set everything up.' },
      { q: 'Are there per-user fees?', a: 'No. The price covers your whole team. Add as many users as you need.' },
      { q: 'What if I need something custom?', a: 'Tell us. We build custom bots, integrations, and workflows for your specific setup. No ticket system — your request gets built.' },
      { q: 'Can I cancel anytime?', a: 'Yes. Monthly plans, no lock-in. But nobody has cancelled yet.' },
    ],
  },
  de: {
    nav: { features: 'Features', how: 'So funktioniert\'s', stories: 'Referenzen', partners: 'Partner', login: 'Login', cta: 'Demo buchen', pricing: 'Preise' },
    hero: 'Transparente Preise,\npassend für euch.',
    sub: 'Keine versteckten Kosten. Keine Lizenz pro Nutzer. Eine Plattform — persönlich für euer Team eingerichtet.',
    currency: '€',
    setup: 'Einmaliges Setup',
    mo: '/Mo.',
    cta: 'Kontakt aufnehmen',
    ctaFree: 'Kostenlos starten',
    popular: 'Beliebteste Wahl',
    includes: 'Alles aus',
    plus: ', plus:',
    faq: 'Fragen?',
    faqSub: 'Schreib uns — wir antworten persönlich.',
    tiers: [
      {
        name: 'Starter',
        price: 'Kostenlos',
        setupPrice: null,
        desc: 'Tools verbinden, eigene Daten sehen. Keine Kreditkarte nötig.',
        features: [
          'E-Mail-Sync & Unified Inbox',
          'Operations-Dashboard',
          'System-Anbindungen (CRM, Buchhaltung)',
          'Anlagenübersicht',
          'Community Support',
        ],
      },
      {
        name: 'Professional',
        price: '1.500',
        setupPrice: '5.000',
        desc: 'Post-Install-Prozesse automatisieren. Das volle birdie-Erlebnis.',
        features: [
          'Netzanmeldung-Bot (KI-gestützt)',
          'Eigene Workflows & Automatisierungen',
          'Mahnwesen & Zahlungserinnerungen',
          'Finanzen & Cashflow-Tracking',
          'Dokumentenmanagement',
          'Prioritäts-Support',
        ],
      },
      {
        name: 'Enterprise',
        price: '3.500',
        setupPrice: '5.000',
        desc: 'Für Teams die maximale Automatisierung und persönliche Betreuung brauchen.',
        features: [
          'Custom Bots & Integrationen',
          'Erweiterte Compliance-Prüfungen',
          'Persönlicher Ansprechpartner',
          '24/7 Telefon- & Chat-Support',
          'Custom Reporting & API-Zugang',
          'Multi-Standort-Support',
        ],
      },
    ],
    faqs: [
      { q: 'Was beinhaltet die Setup-Gebühr?', a: 'Wir verbinden persönlich alle eure Systeme (CRM, Buchhaltung, E-Mail, Netzbetreiber-Portale), konfigurieren Bots und Workflows und schulen euer Team. Dauert meist unter 2 Wochen.' },
      { q: 'Kann ich kostenlos starten und später upgraden?', a: 'Ja. Startet mit Starter, verbindet eure Tools und seht eure Daten. Wenn ihr bereit für Automatisierung seid, machen wir einen kurzen Call und richten alles ein.' },
      { q: 'Gibt es Kosten pro Nutzer?', a: 'Nein. Der Preis gilt für euer ganzes Team. Fügt so viele User hinzu wie ihr braucht.' },
      { q: 'Was wenn wir etwas Individuelles brauchen?', a: 'Sagt uns Bescheid. Wir bauen Custom Bots, Integrationen und Workflows für euren Setup. Kein Ticket-System — euer Feature wird gebaut.' },
      { q: 'Kann man jederzeit kündigen?', a: 'Ja. Monatliche Abrechnung, keine Vertragsbindung. Aber bisher hat noch niemand gekündigt.' },
    ],
  },
};

function FAQItem({ q, a }: { q: string; a: string }) {
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

export default function PricingPage() {
  const locale = useLocale();
  const l = t[locale];

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.6s ease-out both; }
        .fade-in-1 { animation-delay: 0.1s; }
        .fade-in-2 { animation-delay: 0.2s; }
        .fade-in-3 { animation-delay: 0.3s; }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#08080c]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo className="h-6" /></Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/35 font-medium">
            <Link href="/#features" className="hover:text-white transition">{l.nav.features}</Link>
            <Link href="/#how-it-works" className="hover:text-white transition">{l.nav.how}</Link>
            <Link href="/pricing" className="text-white transition">{l.nav.pricing}</Link>
            <Link href="/#stories" className="hover:text-white transition">{l.nav.stories}</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline text-[13px] text-white/35 font-medium hover:text-white transition">{l.nav.login}</Link>
            <Link href="/#contact" className="px-5 py-2.5 bg-[#FACC15] text-[#0a0a0f] rounded-full text-[13px] font-bold hover:bg-[#fde047] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FACC15]/20">
              {l.nav.cta}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 text-center px-6">
        <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-extrabold tracking-[-0.04em] leading-[1.1] mb-5 whitespace-pre-line fade-in">
          {l.hero}
        </h1>
        <p className="text-[clamp(0.95rem,1.8vw,1.15rem)] text-white/35 max-w-xl mx-auto leading-relaxed fade-in fade-in-1">
          {l.sub}
        </p>
      </section>

      {/* TIERS */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {l.tiers.map((tier, i) => {
            const isPro = i === 1;
            const isFree = i === 0;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl p-7 flex flex-col fade-in fade-in-${i + 1} ${
                  isPro
                    ? 'bg-gradient-to-b from-[#FACC15]/[0.08] to-transparent border-2 border-[#FACC15]/20 relative'
                    : 'bg-white/[0.03] border border-white/[0.06]'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FACC15] text-[#0a0a0f] text-[11px] font-bold rounded-full uppercase tracking-wide">
                    {l.popular}
                  </span>
                )}

                <h3 className="text-[20px] font-bold mb-1">{tier.name}</h3>
                <p className="text-[13px] text-white/30 mb-6 leading-relaxed">{tier.desc}</p>

                <div className="mb-6">
                  {isFree ? (
                    <span className="text-[40px] font-extrabold tracking-tight">{tier.price}</span>
                  ) : (
                    <>
                      <span className="text-[14px] text-white/30 align-top">{l.currency}</span>
                      <span className="text-[40px] font-extrabold tracking-tight">{tier.price}</span>
                      <span className="text-[14px] text-white/30">{l.mo}</span>
                    </>
                  )}
                  {tier.setupPrice && (
                    <div className="text-[12px] text-white/20 mt-1">
                      + {l.currency}{tier.setupPrice} {l.setup}
                    </div>
                  )}
                </div>

                <Link
                  href={isFree ? '/login' : '/#contact'}
                  className={`w-full py-3 rounded-xl text-[14px] font-bold text-center transition-all ${
                    isPro
                      ? 'bg-[#FACC15] text-[#0a0a0f] hover:bg-[#fde047] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FACC15]/20'
                      : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {isFree ? l.ctaFree : l.cta}
                </Link>

                <div className="mt-7 pt-6 border-t border-white/[0.06] flex-1">
                  {i > 0 && (
                    <p className="text-[12px] text-white/20 mb-3">
                      {l.includes} <span className="text-white/40">{l.tiers[i - 1].name}</span>{l.plus}
                    </p>
                  )}
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/50 leading-snug">
                        <span className="text-[#FACC15] mt-0.5 shrink-0">&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-[28px] font-bold text-center mb-2">{l.faq}</h2>
        <p className="text-[14px] text-white/30 text-center mb-10">{l.faqSub}</p>
        {l.faqs.map((faq) => (
          <FAQItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] py-10 text-center">
        <p className="text-[12px] text-white/15">&copy; {new Date().getFullYear()} birdie. All rights reserved.</p>
      </footer>
    </div>
  );
}
