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
const LOGOS = ['Aurora Solar', 'Enphase', 'SolarEdge', 'QuickBooks', 'Gmail', 'HubSpot', 'Salesforce', 'Google Calendar', 'Stripe', 'n8n', 'Zapier', 'IMAP'];

const USE_CASES = [
  { title: 'Interconnection', desc: 'AI fills utility forms for 50+ utilities. You review, approve, done.', href: '#' },
  { title: 'Fleet Monitoring', desc: 'See what your installed systems are doing. Production, storage, faults &mdash; live.', href: '#' },
  { title: 'Document AI', desc: 'Reads project data from PDFs, extracts inverters, storage, modules &mdash; automatically.', href: '#' },
  { title: 'Email Routing', desc: 'AI classifies emails and assigns them to the right project. No manual sorting.', href: '#' },
  { title: 'Payment Reminders', desc: 'Overdue invoices? The reminder bot sends polite follow-ups automatically.', href: '#' },
  { title: '100+ more', desc: 'Any workflow you need. We build it for you &mdash; personally configured.', href: '/#contact' },
];

const FAQS = [
  { q: 'What exactly is birdie?', a: 'birdie is the transparency layer for solar installers. It connects your existing tools (CRM, accounting, inverters) and gives you a clear picture of your operations. Plus, it automates paperwork like utility interconnection applications with AI.' },
  { q: 'Do I have to replace my existing tools?', a: 'No. birdie replaces nothing &mdash; it connects everything. Your Aurora Solar, QuickBooks, Gmail, Enphase stays. birdie plugs in and shows you everything in one place.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted at rest and in transit. SOC 2 compliant infrastructure. Your data is never shared with third parties or used for AI training.' },
  { q: 'How fast can I get started?', a: 'One 30-minute call. We connect your tools, set up the bots, and you&apos;re good to go. No months-long implementation.' },
  { q: 'How much does birdie cost?', a: 'We set everything up personally for you. Pricing depends on which integrations and bots you need. Demo is free &mdash; just reach out.' },
  { q: 'What if I need a feature that doesn&apos;t exist?', a: 'Tell us what you need &mdash; we build it. No ticket system, no &ldquo;added to the roadmap.&rdquo; Your feature request gets built.' },
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
            <a href="#integrations" className="hover:text-[#1a1a1a] transition">Integrations</a>
            <a href="#" className="hover:text-[#1a1a1a] transition">Customer Stories</a>
            <Link href="/partner" className="hover:text-[#1a1a1a] transition">Become a Partner</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/gate" className="hidden sm:inline text-[13px] text-[#1a1a1a]/40 font-medium hover:text-[#1a1a1a]">Login</Link>
            <a href="#contact" className="px-5 py-2 bg-[#1a1a1a] text-white rounded-full text-[13px] font-semibold hover:bg-black/80 active:scale-95 transition-all">Book a Demo</a>
          </div>
        </div>
      </nav>

      {/* ━━━ 1. HERO ━━━ */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 text-center px-6">
        <R>
          <p className="text-[13px] font-semibold text-[#1a1a1a]/30 tracking-[0.2em] uppercase mb-6">For Solar Installers</p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-[-0.04em] leading-[1.05] mb-6 max-w-4xl mx-auto">
            The transparency layer<br />for your solar business.
          </h1>
          <p className="text-[clamp(1rem,2vw,1.2rem)] text-[#1a1a1a]/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            birdie connects your existing tools, automates paperwork with AI, and shows you what&apos;s really happening in your business. Personally set up, not self-service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-8 py-4 bg-[#1a1a1a] text-white font-semibold rounded-full text-[15px] hover:bg-black/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10">
              Free Demo &rarr;
            </a>
            <a href="#use-cases" className="px-8 py-4 text-[#1a1a1a]/50 font-medium rounded-full text-[15px] hover:text-[#1a1a1a] transition">
              See Use Cases
            </a>
          </div>
        </R>
      </section>

      {/* ━━━ 2. SOCIAL PROOF ━━━ */}
      <section className="py-6 border-y border-black/[0.04] bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-[#1a1a1a]/30">
          <span className="flex items-center gap-1.5"><span className="text-[#FACC15]">&#9733;&#9733;&#9733;&#9733;&#9733;</span> Pilot program live</span>
          <span>&middot;</span>
          <span>SOC 2 compliant</span>
          <span>&middot;</span>
          <span>US-hosted infrastructure</span>
          <span>&middot;</span>
          <span>White-glove onboarding</span>
        </div>
      </section>

      {/* ━━━ 3. LOGO CAROUSEL ━━━ */}
      <section className="py-10 overflow-hidden bg-white border-b border-black/[0.04]">
        <p className="text-center text-[11px] text-[#1a1a1a]/20 uppercase tracking-[0.2em] font-medium mb-6">Connects with</p>
        <div className="relative">
          <div className="flex gap-12 logo-scroll" style={{ width: 'max-content' }}>
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <span key={i} className="text-[15px] font-semibold text-[#1a1a1a]/15 whitespace-nowrap hover:text-[#1a1a1a]/40 transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 4. CUSTOMER STORIES ━━━ */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#1a1a1a]/25 tracking-[0.25em] uppercase mb-4">Customer Stories</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How installers work with birdie.</h2>
          </R>

          {/* Story 1: SunPeak Solar (fictional US example) */}
          <R className="mb-8">
            <div className="block">
              <div className="bg-white rounded-3xl border border-black/[0.04] overflow-hidden hover:shadow-xl hover:border-black/[0.08] transition-all duration-500">
                <div className="grid md:grid-cols-2 min-h-[420px]">
                  <div className="bg-gradient-to-br from-[#f5f0e8] to-[#ebe6db] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase bg-[#FACC15]/10 px-3 py-1.5 rounded-full">SOLAR INSTALLER &middot; TEXAS</span>
                    </div>
                    <div className="mt-6 bg-[#0f1117] rounded-xl shadow-2xl shadow-black/20 overflow-hidden border border-white/10">
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
                        <div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" />
                        <span className="mx-auto text-[8px] text-white/20 font-mono">birdie &middot; interconnection</span>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5">
                        {['Johnson &mdash; Oncor &mdash; Approved', 'Martinez &mdash; AEP &mdash; Under Review', 'Williams &mdash; CenterPoint &mdash; AI Generated'].map((r, i) => (
                          <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-white/[0.03] rounded-lg">
                            <span className="text-[9px] text-white/50" dangerouslySetInnerHTML={{ __html: r.split(' &mdash; ').slice(0, 2).join(' &middot; ') }} />
                            <span className="text-[7px] px-1.5 py-0.5 rounded bg-[#FACC15]/10 text-[#FACC15] font-bold" dangerouslySetInnerHTML={{ __html: r.split(' &mdash; ')[2] }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      {[{ v: '200+', l: 'Projects' }, { v: '5 min', l: 'per application' }, { v: '8', l: 'Bots active' }].map(m => (
                        <div key={m.l} className="bg-white/60 backdrop-blur rounded-xl px-3 py-2">
                          <div className="text-[15px] font-extrabold text-[#1a1a1a]">{m.v}</div>
                          <div className="text-[9px] text-[#1a1a1a]/40">{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-4">
                      SunPeak Solar
                    </h3>
                    <p className="text-[15px] font-semibold text-[#1a1a1a]/60 mb-6">
                      From 45 minutes per interconnection application to 5 &mdash; with AI-generated documents and automatic submission.
                    </p>
                    <p className="text-[14px] text-[#1a1a1a]/35 leading-relaxed mb-8">
                      SunPeak installs residential solar across Texas. With birdie, interconnection applications for 15+ utilities
                      are AI-filled, reviewed by the office team, and signed by the electrician via link.
                    </p>
                    <div className="bg-[#f0efe9] rounded-2xl p-5 mb-8">
                      <p className="text-[15px] italic text-[#1a1a1a]/50 leading-relaxed">
                        &ldquo;I just review what the AI fills in &mdash; 5 minutes, done. The bots handle the rest.&rdquo;
                      </p>
                      <p className="text-[12px] font-semibold text-[#1a1a1a]/40 mt-3">Office Manager &middot; SunPeak Solar</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#1a1a1a]/25">Austin, TX</span>
                      <span className="text-[14px] font-semibold text-[#1a1a1a]">Read more &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </R>

          {/* Story 2: Mountain West Energy */}
          <R d={150}>
            <div className="block">
              <div className="bg-white rounded-3xl border border-black/[0.04] overflow-hidden hover:shadow-xl hover:border-black/[0.08] transition-all duration-500">
                <div className="grid md:grid-cols-2 min-h-[420px]">
                  <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-4">
                      Mountain West Energy
                    </h3>
                    <p className="text-[15px] font-semibold text-[#1a1a1a]/60 mb-6">
                      How a Colorado installer automated invoicing, payment reminders, and customer communications with birdie.
                    </p>
                    <p className="text-[14px] text-[#1a1a1a]/35 leading-relaxed mb-8">
                      Mountain West Energy manages 120+ residential systems across the Front Range. With birdie, payment reminders run automatically,
                      emails are AI-routed to the right project, and the team sees everything on one dashboard.
                    </p>
                    <div className="bg-[#f0efe9] rounded-2xl p-5 mb-8">
                      <p className="text-[15px] italic text-[#1a1a1a]/50 leading-relaxed">
                        &ldquo;We had 8 different tools and no overview. Now I open birdie in the morning and immediately see what needs attention.&rdquo;
                      </p>
                      <p className="text-[12px] font-semibold text-[#1a1a1a]/40 mt-3">Operations Lead &middot; Mountain West Energy</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#1a1a1a]/25">Denver, CO</span>
                      <span className="text-[14px] font-semibold text-[#1a1a1a]">Read more &rarr;</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#e8f0f5] to-[#d5e3ed] p-8 md:p-12 flex flex-col justify-between order-1 md:order-2 relative overflow-hidden">
                    <div>
                      <span className="text-[9px] font-bold text-blue-500 tracking-[0.2em] uppercase bg-blue-500/10 px-3 py-1.5 rounded-full">SOLAR &middot; COLORADO</span>
                    </div>
                    <div className="mt-6 bg-[#0f1117] rounded-xl shadow-2xl shadow-black/20 overflow-hidden border border-white/10">
                      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
                        <div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" /><div className="w-2 h-2 rounded-full bg-white/10" />
                        <span className="mx-auto text-[8px] text-white/20 font-mono">birdie &middot; dashboard</span>
                      </div>
                      <div className="p-3 grid grid-cols-3 gap-2">
                        {[{ v: '$2.4M', l: 'Pipeline', c: '#FACC15' }, { v: '97%', l: 'Online', c: '#4ADE80' }, { v: '12', l: 'Bots', c: '#60A5FA' }].map(k => (
                          <div key={k.l} className="bg-white/[0.04] rounded-lg p-2 text-center">
                            <div className="text-[13px] font-bold" style={{ color: k.c }}>{k.v}</div>
                            <div className="text-[7px] text-white/30 uppercase">{k.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      {[{ v: '120+', l: 'Systems' }, { v: '12', l: 'Bots active' }, { v: '0', l: 'Tools replaced' }].map(m => (
                        <div key={m.l} className="bg-white/60 backdrop-blur rounded-xl px-3 py-2">
                          <div className="text-[15px] font-extrabold text-[#1a1a1a]">{m.v}</div>
                          <div className="text-[9px] text-[#1a1a1a]/40">{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ 5. 3-STEP SETUP ━━━ */}
      <section className="py-20 md:py-28 bg-white border-y border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#1a1a1a]/25 tracking-[0.25em] uppercase mb-4">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Up and running in under 30 minutes.</h2>
            <p className="text-[#1a1a1a]/35 mt-3">No technical skills needed. We do it for you.</p>
          </R>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Connect your tools', desc: 'We connect your CRM, accounting, and inverter platforms. One call, 30 minutes.' },
              { num: '02', title: 'See everything at a glance', desc: 'From day one you see pipeline, projects, outstanding invoices, system status &mdash; in one place.' },
              { num: '03', title: 'Bots take over', desc: 'Interconnection apps, payment reminders, email routing &mdash; bots handle it. You just approve.' },
            ].map((s, i) => (
              <R key={s.num} d={i * 120}>
                <div className="bg-[#fafaf9] rounded-2xl border border-black/[0.04] p-7 h-full">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-5">
                    <span className="text-[#FACC15] font-bold text-[13px]">{s.num}</span>
                  </div>
                  <h3 className="text-[17px] font-bold mb-2">{s.title}</h3>
                  <p className="text-[14px] text-[#1a1a1a]/35 leading-relaxed">{s.desc}</p>
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
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">What birdie can do for you.</h2>
          </R>
          {/* Feature 1: Interconnection */}
          <R className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase mb-4 inline-block">INTERCONNECTION</span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">50 utilities. 200+ forms. 30 seconds.</h3>
                <p className="text-[15px] text-[#1a1a1a]/40 leading-relaxed mb-6">
                  birdie reads project data from your CRM, identifies the utility by zip code, and fills all forms with AI.
                  NEC 690 compliance, IEEE 1547 standards, rapid shutdown &mdash; all built in.
                  You review in birdie, approve, the electrician signs via link.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Oncor', 'PG&E', 'Duke Energy', 'AEP', 'CenterPoint'].map(nb => (
                    <span key={nb} className="px-2.5 py-1 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/40">{nb}</span>
                  ))}
                  <span className="px-2.5 py-1 bg-[#FACC15]/10 rounded-full text-[11px] text-[#FACC15] font-medium">+45 more</span>
                </div>
              </div>
              <div className="bg-[#0f1117] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-white/10">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-[#F87171]" /><div className="w-2 h-2 rounded-full bg-[#FBBF24]" /><div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                  <span className="mx-auto text-[9px] text-white/20 font-mono">interconnection/johnson</span>
                </div>
                <div className="p-4 flex gap-3">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Project Data</div>
                    {[['System', '8.4 kW DC'], ['Inverter', 'Enphase IQ8+'], ['Storage', 'Tesla Powerwall 3'], ['Address', '1234 Oak St, Austin TX']].map(([k, v]) => (
                      <div key={k} className="flex justify-between px-2.5 py-1.5 bg-white/[0.03] rounded-lg">
                        <span className="text-[9px] text-white/30">{k}</span>
                        <span className="text-[9px] text-white/60 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-40 flex flex-col gap-2">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Documents</div>
                    {['Interconnection App', 'Single-Line Diagram', 'Electrical Permit'].map(d => (
                      <div key={d} className="px-2.5 py-2 bg-white/[0.03] rounded-lg">
                        <span className="text-[9px] text-white/50">{d}</span>
                        <div className="text-[8px] text-[#4ADE80] font-bold mt-0.5">&#x2713; AI filled</div>
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
                  <span className="mx-auto text-[9px] text-white/20 font-mono">fleet / monitoring</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{ v: '1.2 MW', l: 'Installed', c: '#FACC15' }, { v: '97%', l: 'Online', c: '#4ADE80' }, { v: '82%', l: 'Self-cons.', c: '#60A5FA' }].map(k => (
                      <div key={k.l} className="bg-white/[0.04] rounded-lg p-2.5 text-center">
                        <div className="text-[14px] font-bold" style={{ color: k.c }}>{k.v}</div>
                        <div className="text-[8px] text-white/25 uppercase">{k.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <div className="text-[8px] text-white/25 uppercase mb-2">Daily Production</div>
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
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">Every system. Anytime. Before the customer calls.</h3>
                <p className="text-[15px] text-[#1a1a1a]/40 leading-relaxed mb-6">
                  Connect your customers&apos; Enphase, SolarEdge, or Tesla systems and see production, battery SoC, and faults in real time.
                  More customer touchpoints, more trust, fewer support tickets.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/40">Enphase</span>
                  <span className="px-3 py-1.5 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/40">SolarEdge</span>
                  <span className="px-3 py-1.5 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/40">Tesla</span>
                  <span className="px-3 py-1.5 bg-[#1a1a1a]/[0.04] rounded-full text-[11px] text-[#1a1a1a]/25">More soon</span>
                </div>
              </div>
            </div>
          </R>

          {/* Feature 3: Bots + more */}
          <R>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { title: 'Email Routing', desc: 'AI classifies incoming emails and assigns them to the right project. Utility approvals, inspection dates, customer questions &mdash; all in the right place.', tag: 'AI' },
                { title: 'Payment Reminders', desc: 'Overdue invoices in QuickBooks? The reminder bot sends polite follow-ups. Configurable escalation, automatic but human.', tag: 'BOT' },
                { title: '+ Your Workflow', desc: 'Missing something? We build any workflow you need. Personally configured, not self-service. Your feature request gets built.', tag: 'CUSTOM' },
              ].map((f, i) => (
                <a key={f.title} href="#contact" className="block bg-white rounded-2xl border border-black/[0.04] p-7 hover:shadow-lg hover:border-black/[0.08] transition-all group">
                  <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.15em] uppercase">{f.tag}</span>
                  <h3 className="text-[16px] font-bold mt-3 mb-2 group-hover:text-[#FACC15] transition">{f.title}</h3>
                  <p className="text-[13px] text-[#1a1a1a]/35 leading-relaxed">{f.desc}</p>
                </a>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ 7. INTEGRATIONS ━━━ */}
      <section id="integrations" className="py-20 md:py-28 bg-[#1a1a1a] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">Integrations</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your system. Our connection.</h2>
            <p className="text-white/30 mt-3 max-w-xl mx-auto">Aurora Solar, Enphase, QuickBooks &mdash; or your own CRM/ERP. We build the integration.</p>
          </R>
          <div className="flex flex-wrap justify-center gap-3">
            {LOGOS.map(name => (
              <span key={name} className="px-5 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-full text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition cursor-default">{name}</span>
            ))}
            <span className="px-5 py-2.5 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-full text-[13px] font-medium text-[#FACC15]">+ Your System</span>
          </div>
        </div>
      </section>

      {/* ━━━ IRA / INCENTIVES SECTION ━━━ */}
      <section className="py-20 md:py-28 bg-white border-y border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#4ADE80] tracking-[0.25em] uppercase mb-4">Built for the US Market</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">IRA-ready. NEC-compliant. State-aware.</h2>
            <p className="text-[#1a1a1a]/35 mt-3 max-w-xl mx-auto">birdie understands US solar regulations so you don&apos;t have to look them up.</p>
          </R>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'NEC 690 & IEEE 1547', desc: 'Interconnection forms are filled with the correct rapid shutdown, anti-islanding, and voltage ride-through specs. No manual lookups.' },
              { icon: '🏛', title: 'IRA Tax Credit Tracking', desc: 'Track 30% ITC eligibility, domestic content bonus, and low-income adders across your project portfolio.' },
              { icon: '📋', title: 'AHJ & Utility Rules', desc: 'Every Authority Having Jurisdiction has different rules. birdie knows the requirements for each utility territory and state.' },
            ].map((item, i) => (
              <R key={item.title} d={i * 100}>
                <div className="bg-[#fafaf9] rounded-2xl border border-black/[0.04] p-7 h-full">
                  <div className="text-2xl mb-4">{item.icon}</div>
                  <h3 className="text-[16px] font-bold mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[#1a1a1a]/35 leading-relaxed">{item.desc}</p>
                </div>
              </R>
            ))}
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
              &ldquo;I started as a developer at a solar company and quickly realized what was missing. Interconnection apps by hand, 10 tools, no overview. birdie is the solution I wished existed.&rdquo;
            </p>
            <p className="text-[15px] font-bold">Sarah Vogel</p>
            <p className="text-[13px] text-[#1a1a1a]/35">Founder, .birdie</p>
          </R>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <R className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          </R>
          <R>
            <div className="border-t border-black/[0.06]">
              {FAQS.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section id="contact" className="py-20 md:py-28 bg-[#1a1a1a] text-white">
        <R className="max-w-2xl mx-auto px-6 text-center">
          <Logo variant="light" className="h-8 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Ready for transparency?</h2>
          <p className="text-white/35 mb-10 text-lg">20 minutes. We&apos;ll show you what birdie can do for your business. Personal, no sales pitch.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:hello@birdie.solar?subject=Demo%20Request" className="px-8 py-4 bg-white text-[#1a1a1a] font-bold rounded-full text-[15px] hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] transition-all shadow-lg shadow-white/10">
              Book a Demo &rarr;
            </a>
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/[0.06] border border-white/[0.1] text-white font-medium rounded-full text-[15px] hover:bg-white/[0.1] transition">
              Schedule a Call
            </a>
          </div>
        </R>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="bg-[#1a1a1a] border-t border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" className="h-5 mb-4" />
              <p className="text-[12px] text-white/20 leading-relaxed">The transparency layer for solar installers.</p>
              <p className="text-[12px] text-white/20 mt-3">hello@birdie.solar</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Product</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/25">
                <a href="#use-cases" className="hover:text-white/50 transition">Use Cases</a>
                <a href="#integrations" className="hover:text-white/50 transition">Integrations</a>
                <a href="#" className="hover:text-white/50 transition">Customer Stories</a>
                <a href="#contact" className="hover:text-white/50 transition">Book a Demo</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Company</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/25">
                <Link href="/partner" className="hover:text-white/50 transition">Become a Partner</Link>
                <a href="#" className="hover:text-white/50 transition">Privacy Policy</a>
                <a href="#" className="hover:text-white/50 transition">Terms of Service</a>
                <a href="#" className="hover:text-white/50 transition">Contact</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Resources</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/25">
                <a href="#" className="hover:text-white/50 transition">Blog (coming soon)</a>
                <a href="#" className="hover:text-white/50 transition">Help Center</a>
                <Link href="/gate" className="hover:text-white/50 transition">Login</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/15">&copy; 2026 .birdie</p>
            <div className="flex items-center gap-4 text-[11px] text-white/15">
              <span>US-hosted</span>
              <span>SOC 2 compliant</span>
              <span>Made with &hearts; for solar</span>
            </div>
          </div>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'SoftwareApplication',
        name: '.birdie', applicationCategory: 'BusinessApplication', operatingSystem: 'Web',
        description: 'The transparency layer for solar installers.',
      })}} />
    </div>
  );
}
