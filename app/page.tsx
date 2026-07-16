'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      setStatus(res.ok ? 'sent' : 'error');
    } catch { setStatus('error'); }
  };
  if (status === 'sent') return (
    <div className="max-w-md mx-auto text-center py-8">
      <p className="text-2xl mb-2">✅</p>
      <p className="text-white font-bold text-lg">Got it! We&apos;ll reach out within 24h.</p>
      <p className="text-white/30 text-sm mt-2">Check your inbox for next steps.</p>
    </div>
  );
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 mb-8">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" name="first_name" placeholder="First Name" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
        <input type="text" name="last_name" placeholder="Last Name" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
      </div>
      <input type="email" name="email" required placeholder="Work Email *" className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
      <div className="grid grid-cols-2 gap-3">
        <input type="text" name="company" placeholder="Company" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
        <input type="text" name="job_title" placeholder="Job Title" className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FACC15]/40 transition" />
      </div>
      <button type="submit" disabled={status === 'sending'} className="w-full group px-10 py-4 bg-[#FACC15] text-[#0a0a0f] font-bold rounded-full text-[16px] hover:bg-[#fde047] hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-[#FACC15]/25 flex items-center gap-2 justify-center disabled:opacity-50">
        {status === 'sending' ? 'Sending...' : 'Apply for Free Pilot'}
        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
      </button>
    </form>
  );
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

const LOGOS = ['Aurora Solar', 'Enphase', 'SolarEdge', 'QuickBooks', 'Gmail', 'HubSpot', 'Salesforce', 'Google Calendar', 'Stripe', 'n8n', 'Zapier', 'IMAP'];

const FAQS = [
  { q: 'What exactly is birdie?', a: 'birdie is the transparency layer for solar installers. It connects your existing tools (CRM, accounting, inverters) and gives you a clear picture of your operations. Plus, it automates paperwork like utility interconnection applications with AI.' },
  { q: 'Do I have to replace my existing tools?', a: 'No. birdie replaces nothing — it connects everything. Your Aurora Solar, QuickBooks, Gmail, Enphase stays. birdie plugs in and shows you everything in one place.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted at rest and in transit. SOC 2 compliant infrastructure. Your data is never shared with third parties or used for AI training.' },
  { q: 'How fast can I get started?', a: 'One 30-minute call. We connect your tools, set up the bots, and you\'re good to go. No months-long implementation.' },
  { q: 'How much does birdie cost?', a: 'We set everything up personally for you. Pricing depends on which integrations and bots you need. Demo is free — just reach out.' },
  { q: 'What if I need a feature that doesn\'t exist?', a: 'Tell us what you need — we build it. No ticket system, no "added to the roadmap." Your feature request gets built.' },
];

function LiveTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const allLines = [
    '$ birdie connect --crm hubspot',
    '✓ HubSpot connected (247 contacts synced)',
    '$ birdie connect --accounting quickbooks',
    '✓ QuickBooks linked (12 open invoices found)',
    '$ birdie connect --inverter enphase',
    '✓ Enphase fleet: 89 systems, 97.2% online',
    '$ birdie bot interconnection --start',
    '✓ Bot active: 3 applications auto-filled',
    '$ birdie bot reminders --start',
    '✓ Reminder bot: 4 overdue invoices queued',
    '$ birdie status',
    '✓ All systems operational. 8 bots running.',
  ];
  const idx = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const add = () => {
          const i = idx.current;
          if (i < allLines.length) {
            const line = allLines[i];
            idx.current = i + 1;
            setLines(prev => [...prev, line]);
            setTimeout(add, (i + 1) % 2 === 0 ? 800 : 400);
          }
        };
        setTimeout(add, 600);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/40 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
        <span className="mx-auto text-[10px] text-white/20 font-mono">birdie — terminal</span>
      </div>
      <div className="p-5 font-mono text-[12px] leading-relaxed min-h-[280px]">
        {lines.map((line, i) => {
          if (!line) return null;
          return (
            <div key={i} className={`${line.startsWith('$') ? 'text-white/70' : line.startsWith('✓') ? 'text-[#4ADE80]/70' : 'text-white/30'} animate-fadeIn`}>
              {line}
            </div>
          );
        })}
        <span className="inline-block w-2 h-4 bg-[#FACC15] animate-pulse ml-0.5" />
      </div>
    </div>
  );
}

export default function LandingPage() {
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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out both; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .float { animation: float 6s ease-in-out infinite; }
        .float-slow { animation: float 8s ease-in-out infinite; }
        @keyframes glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .glow { animation: glow 4s ease-in-out infinite; }
        .gradient-text { background: linear-gradient(135deg, #FACC15 0%, #F59E0B 50%, #FACC15 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; background-size: 200% auto; animation: shimmer 3s ease-in-out infinite; }
        @keyframes shimmer { 0% { background-position: 0% center; } 50% { background-position: 100% center; } 100% { background-position: 0% center; } }
        .card-glow { position: relative; }
        .card-glow::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(250,204,21,0.15), transparent 50%, rgba(250,204,21,0.1)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .bento-card { background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); transition: all 0.5s cubic-bezier(.16,1,.3,1); }
        .bento-card:hover { border-color: rgba(250,204,21,0.2); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(250,204,21,0.05); }
        @keyframes bannerShimmer { 0% { background-position: 0% center; } 50% { background-position: 100% center; } 100% { background-position: 0% center; } }
        @keyframes bannerPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      `}</style>

      {/* ━━━ PILOT BANNER ━━━ */}
      <div className="fixed top-0 w-full z-[60] overflow-hidden bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#FACC15] text-[#0a0a0f] text-center py-2.5 px-4" style={{ backgroundSize: '200% 100%', animation: 'bannerShimmer 3s ease-in-out infinite' }}>
        <p className="text-[13px] font-bold flex items-center justify-center gap-2">
          <span style={{ animation: 'bannerPulse 2s ease-in-out infinite' }}>🔥</span>
          <span>3 Pilot Spots Left — Use birdie free for 3 months.</span>
          <a href="#contact" className="underline underline-offset-2 hover:no-underline font-extrabold">Apply now →</a>
        </p>
      </div>

      {/* ━━━ NAV ━━━ */}
      <nav className="fixed top-[36px] w-full z-50 bg-[#08080c]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo variant="light" className="h-6" /></Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/35 font-medium">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#stories" className="hover:text-white transition">Stories</a>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/partner" className="hover:text-white transition">Partners</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline text-[13px] text-white/35 font-medium hover:text-white transition">Login</Link>
            <a href="#contact" className="px-5 py-2.5 bg-[#FACC15] text-[#0a0a0f] rounded-full text-[13px] font-bold hover:bg-[#fde047] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FACC15]/20">
              Book a Demo
            </a>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#08080c]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-[#08080c]/90" />
        </div>
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
            <span className="text-[12px] text-white/40 font-medium">Pilot program live &mdash; Limited spots</span>
          </div>
        </R>

        <R d={100}>
          <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold tracking-[-0.04em] leading-[1.02] mb-6 max-w-5xl mx-auto">
            The <span className="gradient-text">transparency layer</span>
            <br />for your solar business.
          </h1>
        </R>

        <R d={200}>
          <p className="text-[clamp(1rem,2vw,1.25rem)] text-white/35 max-w-2xl mx-auto mb-12 leading-relaxed">
            birdie connects your tools, automates paperwork with AI, and shows you
            what&apos;s really happening. Personally set up. Not self-service.
          </p>
        </R>

        <R d={300}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="#contact" className="group px-8 py-4 bg-[#FACC15] text-[#0a0a0f] font-bold rounded-full text-[16px] hover:bg-[#fde047] hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-[#FACC15]/20 flex items-center gap-2 justify-center">
              Book a Free Demo
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
            <a href="#how-it-works" className="px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white/60 font-medium rounded-full text-[16px] hover:bg-white/[0.1] hover:text-white transition-all">
              See How It Works
            </a>
          </div>
        </R>

        <R d={500}>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/20">
            <span className="flex items-center gap-2"><span className="text-[#FACC15]">&#9733;&#9733;&#9733;&#9733;&#9733;</span> Pilot live</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>SOC 2 compliant</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>US-hosted</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>White-glove setup</span>
          </div>
        </R>
        </div>
      </section>

      {/* ━━━ LOGO CAROUSEL ━━━ */}
      <section className="py-8 border-y border-white/[0.04] overflow-hidden">
        <p className="text-center text-[10px] text-white/15 uppercase tracking-[0.25em] font-medium mb-6">Connects with your stack</p>
        <div className="relative">
          <div className="flex gap-14 logo-scroll" style={{ width: 'max-content' }}>
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <span key={i} className="text-[15px] font-semibold text-white/10 whitespace-nowrap hover:text-white/30 transition-colors duration-500">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ LIVE TERMINAL ━━━ */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-4xl mx-auto px-6">
          <R className="text-center mb-12">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">See It In Action</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Connected in minutes. Not months.</h2>
          </R>
          <R d={200}>
            <LiveTerminal />
          </R>
        </div>
      </section>

      {/* ━━━ STATS ━━━ */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 50, suffix: '+', label: 'Utilities Supported' },
              { value: 200, suffix: '+', label: 'Forms Automated' },
              { value: 5, suffix: ' min', label: 'Per Application' },
              { value: 97, suffix: '%', label: 'Fleet Uptime' },
            ].map((s, i) => (
              <R key={s.label} d={i * 100}>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text">
                    <Counter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[12px] text-white/25 mt-2 uppercase tracking-wider">{s.label}</div>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FEATURES BENTO ━━━ */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">Features</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Everything your solar business needs.</h2>
            <p className="text-white/25 mt-4 max-w-xl mx-auto">One platform. All your tools connected. AI doing the boring stuff.</p>
          </R>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Big feature: Interconnection */}
            <R className="md:col-span-2">
              <div className="bento-card rounded-3xl p-8 md:p-10 h-full">
                <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase">INTERCONNECTION AI</span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-4 mb-4">50 utilities. 200+ forms.<br />30 seconds.</h3>
                <p className="text-[15px] text-white/30 leading-relaxed mb-6 max-w-lg">
                  birdie reads project data from your CRM, identifies the utility by zip code, and fills all forms with AI.
                  NEC 690, IEEE 1547, rapid shutdown &mdash; all built in.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Oncor', 'PG&E', 'Duke Energy', 'AEP', 'CenterPoint'].map(u => (
                    <span key={u} className="px-3 py-1.5 bg-white/[0.05] rounded-full text-[11px] text-white/30">{u}</span>
                  ))}
                  <span className="px-3 py-1.5 bg-[#FACC15]/10 rounded-full text-[11px] text-[#FACC15] font-medium">+45 more</span>
                </div>
              </div>
            </R>

            {/* Monitoring */}
            <R d={100}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#4ADE80] tracking-[0.2em] uppercase">MONITORING</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">Every system. Live.</h3>
                <p className="text-[13px] text-white/25 leading-relaxed mb-5">Production, battery SoC, faults &mdash; before the customer calls.</p>
                <div className="bg-white/[0.03] rounded-xl p-3">
                  <div className="flex items-end gap-[3px] h-20">
                    {[12, 22, 38, 55, 72, 88, 95, 100, 92, 78, 58, 35, 18, 8].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm transition-all duration-500" style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(74,222,128,0.4), rgba(74,222,128,0.1))` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] text-white/15">
                    <span>6am</span><span>12pm</span><span>6pm</span>
                  </div>
                </div>
              </div>
            </R>

            {/* Email Routing */}
            <R d={200}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#60A5FA] tracking-[0.2em] uppercase">AI BOT</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">Email Routing</h3>
                <p className="text-[13px] text-white/25 leading-relaxed">AI classifies emails and assigns them to the right project. Utility approvals, inspections &mdash; all sorted.</p>
              </div>
            </R>

            {/* Payment Reminders */}
            <R d={300}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#F87171] tracking-[0.2em] uppercase">AI BOT</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">Payment Reminders</h3>
                <p className="text-[13px] text-white/25 leading-relaxed">Overdue invoices? The bot sends polite follow-ups automatically. Configurable escalation.</p>
              </div>
            </R>

            {/* Document AI */}
            <R d={400}>
              <div className="bento-card rounded-3xl p-8 h-full">
                <span className="text-[9px] font-bold text-[#A78BFA] tracking-[0.2em] uppercase">DOCUMENT AI</span>
                <h3 className="text-xl font-extrabold tracking-tight mt-4 mb-3">PDFs &rarr; Data</h3>
                <p className="text-[13px] text-white/25 leading-relaxed">Upload proposals, datasheets, PVSol reports. birdie extracts inverters, modules, storage &mdash; automatically.</p>
              </div>
            </R>
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="py-20 md:py-28 relative">
        <FloatingOrb className="w-[400px] h-[400px] bg-[#FACC15]/[0.03] top-[50%] left-[-100px] glow" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Up and running in<br /><span className="gradient-text">under 30 minutes.</span></h2>
          </R>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {[
              { num: '01', title: 'We connect your tools', desc: 'CRM, accounting, inverter platforms. One call. We do it for you.', icon: '🔗' },
              { num: '02', title: 'See everything instantly', desc: 'Pipeline, projects, invoices, system status — one dashboard, day one.', icon: '📊' },
              { num: '03', title: 'Bots take over', desc: 'Interconnection apps, reminders, email routing — bots handle it. You approve.', icon: '🤖' },
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

      {/* ━━━ CUSTOMER STORIES ━━━ */}
      <section id="stories" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4">Customer Stories</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">How installers work with birdie.</h2>
          </R>

          {/* Featured Testimonial */}
          <R>
            <div className="bento-card rounded-3xl p-8 md:p-12 mb-6">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                <div className="shrink-0 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#FACC15]/40 via-[#FACC15]/10 to-transparent p-[3px]">
                    <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-2xl md:text-3xl font-bold text-[#FACC15]">MR</div>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-white/80">Mike Reynolds</p>
                    <p className="text-[11px] text-white/25">CEO &middot; SunPeak Solar</p>
                    <p className="text-[11px] text-white/25">Nashville, TN</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold text-[#FACC15] tracking-[0.2em] uppercase bg-[#FACC15]/10 px-3 py-1.5 rounded-full inline-block mb-5">TENNESSEE &middot; 200+ PROJECTS</span>
                  <blockquote className="text-[18px] md:text-[22px] font-medium text-white/70 leading-relaxed mb-6">
                    &ldquo;Before birdie we were drowning in paperwork. <span className="text-[#FACC15] font-semibold">Duke Energy alone has twelve different forms</span> depending on the system size. Now we just plug in the project info and birdie handles the submission. Last month we pushed through <span className="text-[#FACC15] font-semibold">47 applications in a week</span>.&rdquo;
                  </blockquote>
                  <div className="flex gap-6">
                    {[{ v: '47x', l: 'Apps / week' }, { v: '90%', l: 'Time saved' }, { v: '15+', l: 'Utilities' }].map(m => (
                      <div key={m.l}>
                        <div className="text-[17px] font-extrabold text-[#FACC15]">{m.v}</div>
                        <div className="text-[9px] text-white/20 uppercase tracking-wider">{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </R>

          {/* Two smaller testimonials */}
          <div className="grid md:grid-cols-2 gap-6">
            <R d={100}>
              <div className="bento-card rounded-3xl p-8 md:p-10 h-full">
                <span className="text-[9px] font-bold text-[#60A5FA] tracking-[0.2em] uppercase bg-[#60A5FA]/10 px-3 py-1.5 rounded-full inline-block mb-6">COLORADO &middot; 120+ SYSTEMS</span>
                <h3 className="text-2xl font-extrabold tracking-tight mb-3">Mountain West Energy</h3>
                <p className="text-[15px] text-white/30 leading-relaxed mb-6">
                  8 different tools and no overview. Now invoicing, payment reminders, and customer communications run on autopilot.
                </p>
                <div className="bg-white/[0.03] rounded-2xl p-5 mb-6">
                  <p className="text-[15px] italic text-white/40 leading-relaxed">
                    &ldquo;I open birdie in the morning and immediately see what needs attention. No more digging through 8 tools.&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#60A5FA]/30 to-[#60A5FA]/5 flex items-center justify-center text-[10px] font-bold text-[#60A5FA]">SC</div>
                    <div>
                      <p className="text-[12px] font-semibold text-white/50">Sarah Chen</p>
                      <p className="text-[10px] text-white/20">Operations Lead &middot; Mountain West Energy</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  {[{ v: '120+', l: 'Systems' }, { v: '12', l: 'Bots' }, { v: '0', l: 'Tools replaced' }].map(m => (
                    <div key={m.l}>
                      <div className="text-[15px] font-extrabold text-[#60A5FA]">{m.v}</div>
                      <div className="text-[9px] text-white/20">{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </R>

            <R d={200}>
              <div className="bento-card rounded-3xl p-8 md:p-10 h-full">
                <span className="text-[9px] font-bold text-[#4ADE80] tracking-[0.2em] uppercase bg-[#4ADE80]/10 px-3 py-1.5 rounded-full inline-block mb-6">TEXAS &middot; 85+ INSTALLS</span>
                <h3 className="text-2xl font-extrabold tracking-tight mb-3">BrightPath Energy</h3>
                <p className="text-[15px] text-white/30 leading-relaxed mb-6">
                  Cash flow was unpredictable &mdash; now automated payment reminders and real-time tracking cut average collection time from 45 to 18 days.
                </p>
                <div className="bg-white/[0.03] rounded-2xl p-5 mb-6">
                  <p className="text-[15px] italic text-white/40 leading-relaxed">
                    &ldquo;The cash flow visibility alone paid for birdie in the first month. I finally know exactly where every dollar is.&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4ADE80]/30 to-[#4ADE80]/5 flex items-center justify-center text-[10px] font-bold text-[#4ADE80]">MW</div>
                    <div>
                      <p className="text-[12px] font-semibold text-white/50">Marcus Williams</p>
                      <p className="text-[10px] text-white/20">Founder &middot; BrightPath Energy</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  {[{ v: '18 days', l: 'Avg collection' }, { v: '$240k', l: 'Recovered' }, { v: '85+', l: 'Installs' }].map(m => (
                    <div key={m.l}>
                      <div className="text-[15px] font-extrabold text-[#4ADE80]">{m.v}</div>
                      <div className="text-[9px] text-white/20">{m.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </R>
          </div>

          {/* Stats bar */}
          <R d={300}>
            <div className="mt-8 bento-card rounded-2xl p-6 flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { v: '4.9/5', icon: '⭐', l: 'Avg rating' },
                { v: <Counter target={47} suffix="x" />, icon: '⚡', l: 'Faster submissions' },
                { v: <><Counter target={200} />+</>, icon: '🔌', l: 'Utilities supported' },
                { v: <><Counter target={18} /> days</>, icon: '💰', l: 'Avg collection time' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-[20px] md:text-[24px] font-extrabold text-white/90">{s.v}</div>
                  <div className="text-[10px] text-white/25 uppercase tracking-wider mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ IRA / US MARKET ━━━ */}
      <section className="py-20 md:py-28 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <R className="text-center mb-16">
            <p className="text-[10px] font-bold text-[#4ADE80] tracking-[0.25em] uppercase mb-4">Built for the US Market</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">IRA-ready. NEC-compliant. State-aware.</h2>
          </R>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: 'NEC 690 & IEEE 1547', desc: 'Forms filled with correct rapid shutdown, anti-islanding, and voltage specs. No manual lookups.', color: '#FACC15' },
              { icon: '🏛', title: 'IRA Tax Credits', desc: 'Track 30% ITC, domestic content bonus, low-income adders across your portfolio.', color: '#4ADE80' },
              { icon: '📋', title: 'AHJ & Utility Rules', desc: 'Every jurisdiction has different rules. birdie knows requirements for each territory and state.', color: '#60A5FA' },
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

      {/* ━━━ FOUNDER ━━━ */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <R>
            <img src="/founder.jpeg" alt="Sarah Vogel" className="w-20 h-20 rounded-full object-cover mx-auto mb-8 shadow-lg shadow-[#FACC15]/20 border-2 border-[#FACC15]/30" />
            <p className="text-[20px] md:text-[26px] font-medium leading-relaxed text-white/40 max-w-2xl mx-auto mb-8">
              &ldquo;I started as a developer at a solar company and quickly realized what was missing. Interconnection apps by hand, 10 tools, no overview. birdie is the solution I wished existed.&rdquo;
            </p>
            <p className="text-[15px] font-bold">Sarah Vogel</p>
            <p className="text-[13px] text-white/25">Founder, .birdie</p>
          </R>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className="py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-6">
          <R className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          </R>
          <R>
            <div className="border-t border-white/[0.06]">
              {FAQS.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ FINAL CTA ━━━ */}
      <section id="contact" className="py-20 md:py-32 relative overflow-hidden">
        <FloatingOrb className="w-[600px] h-[600px] bg-[#FACC15]/[0.06] top-[-200px] left-[50%] ml-[-300px] glow" />
        <R className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <Logo variant="light" className="h-10 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">
            Ready for <span className="gradient-text">transparency?</span>
          </h2>
          <p className="text-white/30 mb-4 text-lg leading-relaxed">20 minutes. We&apos;ll show you what birdie can do for your business.<br />Personal, no sales pitch.</p>
          <p className="text-[#FACC15] font-bold text-sm mb-10">🔥 3 pilot spots — free for 3 months. No credit card required.</p>
          <ContactForm />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <Link href="/demo" className="text-white/30 text-sm hover:text-white/50 transition">
              Or try the live demo first &rarr;
            </Link>
            <a href="https://app.apollo.io/#/meet/sarah_vogel_429" target="_blank" rel="noopener noreferrer" className="text-white/30 text-sm hover:text-white/50 transition">
              Schedule a call directly &rarr;
            </a>
          </div>
        </R>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" className="h-5 mb-4" />
              <p className="text-[12px] text-white/15 leading-relaxed">The transparency layer<br />for solar installers.</p>
              <p className="text-[12px] text-white/15 mt-3">hello@birdiesolar.com</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">Product</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/20">
                <a href="#features" className="hover:text-white/40 transition">Features</a>
                <a href="#how-it-works" className="hover:text-white/40 transition">How It Works</a>
                <a href="#stories" className="hover:text-white/40 transition">Customer Stories</a>
                <a href="#contact" className="hover:text-white/40 transition">Book a Demo</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">Company</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/20">
                <Link href="/partner" className="hover:text-white/40 transition">Partners</Link>
                <Link href="/careers" className="hover:text-white/40 transition">Careers</Link>
                <Link href="/privacy" className="hover:text-white/40 transition">Privacy Policy</Link>
                <Link href="/impressum" className="hover:text-white/40 transition">Legal Notice</Link>
                <a href="mailto:hello@birdiesolar.com" className="hover:text-white/40 transition">Contact</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">Resources</p>
              <div className="flex flex-col gap-2.5 text-[13px] text-white/20">
                <a href="#" className="hover:text-white/40 transition">Blog (coming soon)</a>
                <a href="#" className="hover:text-white/40 transition">Help Center</a>
                <Link href="/login" className="hover:text-white/40 transition">Login</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/10">&copy; 2026 .birdie</p>
            <div className="flex items-center gap-4 text-[11px] text-white/10">
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
