'use client';

import { useState } from 'react';
import Link from 'next/link';

function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 48" className={className} aria-label=".birdie">
      <circle cx="12" cy="36" r="6" fill="#FACC15" />
      <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#fff" letterSpacing="-1">birdie</text>
    </svg>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-[16px] font-semibold text-white/80 pr-8 group-hover:text-white transition">{q}</span>
        <span className={`text-white/20 text-xl shrink-0 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-64 pb-5' : 'max-h-0'}`}>
        <p className="text-[14px] text-white/30 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

const tiers = [
  {
    name: 'Starter',
    target: '1–10 employees',
    setup: '$3,000',
    monthly: '500',
    users: 'Up to 5',
    projects: 'Up to 30/mo',
    automations: 'Basic',
    interconnection: '—',
    reporting: 'Standard',
    support: 'Email',
    onboarding: 'Self-serve',
    term: 'Monthly',
  },
  {
    name: 'Growth',
    target: '10–50 employees',
    setup: '$5,000',
    monthly: '1,500',
    users: 'Up to 20',
    projects: 'Up to 150/mo',
    automations: 'Advanced',
    interconnection: '1 provider',
    reporting: 'Advanced',
    support: 'Email + calls',
    onboarding: '2x sessions',
    term: 'Min. 6 mo',
  },
  {
    name: 'Enterprise',
    target: '50+ employees',
    setup: '$8,000–$15,000',
    monthly: '2,500–3,500',
    users: 'Unlimited',
    projects: 'Unlimited',
    automations: 'All + Custom',
    interconnection: 'Multi-provider',
    reporting: 'Custom + API',
    support: 'Dedicated',
    onboarding: 'White-glove',
    term: 'Min. 12 mo',
  },
];

const comparisonRows = [
  { label: 'Target', key: 'target' },
  { label: 'Setup (one-time)', key: 'setup' },
  { label: 'Monthly', key: 'monthly', prefix: '$', suffix: '/mo' },
  { label: 'Users', key: 'users' },
  { label: 'Projects', key: 'projects' },
  { label: 'Automations', key: 'automations' },
  { label: 'Interconnection', key: 'interconnection' },
  { label: 'Reporting', key: 'reporting' },
  { label: 'Support', key: 'support' },
  { label: 'Onboarding', key: 'onboarding' },
  { label: 'Term', key: 'term' },
] as const;

const included = [
  'Full access to birdie platform (web-based)',
  'All updates & new features within your plan',
  'Automatic backups & data security',
  'SSL encryption & SOC 2 compliant data handling',
  'Email support (Growth & Enterprise: video calls)',
  'Ongoing maintenance & bug fixes',
  'Knowledge base & documentation',
];

const addons = [
  { service: 'Custom feature development', price: '$130/hr' },
  { service: 'Additional utility integration', price: '$1,500 / provider' },
  { service: 'Data migration from legacy systems', price: 'Scoped individually' },
  { service: 'White-label / custom branding', price: 'From $2,000 one-time' },
  { service: 'API development for third-party tools', price: 'Billed hourly' },
];

const steps = [
  { step: '01', title: 'Discovery Call', desc: 'We learn about your business, understand your processes, and identify the biggest efficiency gains.' },
  { step: '02', title: 'Proposal & Planning', desc: 'Based on the call, we create a tailored proposal with a clear scope, timeline, and milestones.' },
  { step: '03', title: 'Setup & Onboarding', desc: 'We configure birdie for your team, migrate existing data, and train your staff — hands-on, white-glove.' },
  { step: '04', title: 'Go-Live & Optimization', desc: 'After launch, we continuously optimize workflows, fine-tune automations, and ensure everything runs smoothly.' },
];

const faqs = [
  { q: 'What\'s included in the setup fee?', a: 'We personally connect all your systems (CRM, accounting, email, inverter portals), configure your bots and workflows, and train your team. Usually done in 1–4 weeks depending on plan.' },
  { q: 'Can I start with Starter and upgrade later?', a: 'Yes. Start with Starter, connect your tools, and see your data. When you\'re ready for more automation, we upgrade you seamlessly.' },
  { q: 'Are there per-user fees?', a: 'No. Pricing is per company, not per user. Starter includes up to 5, Growth up to 20, Enterprise unlimited.' },
  { q: 'What if I need something custom?', a: 'Tell us. We build custom bots, integrations, and workflows for your specific setup. No ticket system — your request gets built.' },
  { q: 'Custom packages available?', a: 'Yes. We tailor birdie to your processes. Talk to us — we\'ll find the right setup.' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.6s ease-out both; }
        .fade-in-1 { animation-delay: 0.1s; }
        .fade-in-2 { animation-delay: 0.2s; }
        .fade-in-3 { animation-delay: 0.3s; }
        .fade-in-4 { animation-delay: 0.4s; }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#08080c]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo className="h-6" /></Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/35 font-medium">
            <Link href="/#features" className="hover:text-white transition">Features</Link>
            <Link href="/#how-it-works" className="hover:text-white transition">How it Works</Link>
            <Link href="/pricing" className="text-white transition">Pricing</Link>
            <Link href="/#stories" className="hover:text-white transition">Stories</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline text-[13px] text-white/35 font-medium hover:text-white transition">Login</Link>
            <Link href="/#contact" className="px-5 py-2.5 bg-[#FACC15] text-[#0a0a0f] rounded-full text-[13px] font-bold hover:bg-[#fde047] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FACC15]/20">
              Book a Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 text-center px-6">
        <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-4 fade-in">Pricing</p>
        <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] leading-[1.1] mb-5 fade-in fade-in-1">
          Scales with your business.
        </h1>
        <p className="text-[clamp(0.95rem,1.8vw,1.1rem)] text-white/35 max-w-lg mx-auto leading-relaxed fade-in fade-in-2">
          Our pricing scales with the size of your business. All prices excl. VAT where applicable.
        </p>
      </section>

      {/* TIER CARDS */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => {
            const isGrowth = i === 1;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl p-7 flex flex-col fade-in fade-in-${i + 1} ${
                  isGrowth
                    ? 'bg-gradient-to-b from-[#FACC15]/[0.08] to-transparent border-2 border-[#FACC15]/20 relative'
                    : 'bg-white/[0.03] border border-white/[0.06]'
                }`}
              >
                {isGrowth && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FACC15] text-[#0a0a0f] text-[11px] font-bold rounded-full uppercase tracking-wide">
                    Most popular
                  </span>
                )}

                <h3 className="text-[20px] font-bold mb-0.5">{tier.name}</h3>
                <p className="text-[12px] text-white/25 mb-5">{tier.target}</p>

                <div className="mb-1">
                  <span className="text-[14px] text-white/30 align-top">$</span>
                  <span className="text-[38px] font-extrabold tracking-tight">{tier.monthly}</span>
                  <span className="text-[14px] text-white/30">/mo</span>
                </div>
                <p className="text-[12px] text-white/20 mb-6">+ {tier.setup} setup (one-time)</p>

                <Link
                  href="/#contact"
                  className={`w-full py-3 rounded-xl text-[14px] font-bold text-center transition-all block ${
                    isGrowth
                      ? 'bg-[#FACC15] text-[#0a0a0f] hover:bg-[#fde047] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FACC15]/20'
                      : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  Book a Demo
                </Link>

                <div className="mt-6 pt-5 border-t border-white/[0.06] flex-1 space-y-2.5">
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Users</span><span className="font-medium">{tier.users}</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Projects</span><span className="font-medium">{tier.projects}</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Automations</span><span className="font-medium">{tier.automations}</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Interconnection</span><span className="font-medium">{tier.interconnection}</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Reporting</span><span className="font-medium">{tier.reporting}</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Support</span><span className="font-medium">{tier.support}</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Onboarding</span><span className="font-medium">{tier.onboarding}</span></div>
                  <div className="flex justify-between text-[12px]"><span className="text-white/30">Term</span><span className="font-medium">{tier.term}</span></div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[13px] text-white/20 mt-6">
          Custom packages available — we tailor birdie to your processes.
        </p>
      </section>

      {/* COMPARISON TABLE (desktop) */}
      <section className="max-w-4xl mx-auto px-6 pb-20 hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-white/[0.08]">
                <th className="text-left py-4 pr-6 font-medium text-white/30 w-[180px]"></th>
                {tiers.map((t, i) => (
                  <th key={t.name} className={`text-center py-4 px-4 font-bold text-[15px] ${i === 1 ? 'text-white' : 'text-white/60'}`}>
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-white/[0.04]">
                  <td className="py-3.5 pr-6 text-white/30 font-medium">{row.label}</td>
                  {tiers.map((t, i) => {
                    const val = t[row.key as keyof typeof t];
                    const prefix = 'prefix' in row ? row.prefix : '';
                    const suffix = 'suffix' in row ? row.suffix : '';
                    const display = val === '—' ? '—' : (row.key === 'setup' ? val : `${prefix}${val}${suffix}`);
                    return (
                      <td key={t.name} className={`py-3.5 px-4 text-center font-medium ${i === 1 ? 'bg-[#FACC15]/[0.03]' : ''} ${val === '—' ? 'text-white/15' : ''}`}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* INCLUDED */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-3 text-center">What&apos;s included</p>
        <h2 className="text-[28px] font-bold text-center mb-2">Every month. Everything included.</h2>
        <p className="text-[14px] text-white/30 text-center mb-8">Regardless of your plan.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {included.map((item) => (
            <div key={item} className="flex items-start gap-3 bg-white/[0.03] rounded-xl px-5 py-4 border border-white/[0.06]">
              <span className="text-[#FACC15] font-bold mt-0.5 shrink-0">✓</span>
              <span className="text-[13px] text-white/50 leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-3 text-center">Add-Ons</p>
        <h2 className="text-[28px] font-bold text-center mb-8">Need more?</h2>
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
          {addons.map((addon, i) => (
            <div key={addon.service} className={`flex items-center justify-between px-6 py-4 ${i < addons.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
              <span className="text-[14px] text-white/60">{addon.service}</span>
              <span className="text-[13px] font-semibold text-white/80 shrink-0 ml-4">{addon.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <p className="text-[10px] font-bold text-[#FACC15] tracking-[0.25em] uppercase mb-3 text-center">Process</p>
        <h2 className="text-[28px] font-bold text-center mb-10">Connected in minutes. Not months.</h2>
        <div className="space-y-0">
          {steps.map((p, i) => (
            <div key={p.step} className={`flex gap-6 ${i < steps.length - 1 ? 'pb-8 border-l-2 border-[#FACC15]/30 ml-5 pl-8' : 'ml-5 pl-8'} relative`}>
              <span className="absolute -left-[13px] top-0 w-[26px] h-[26px] rounded-full bg-[#FACC15] text-[#0a0a0f] text-[11px] font-bold flex items-center justify-center">{p.step}</span>
              <div>
                <h3 className="text-[16px] font-bold mb-1">{p.title}</h3>
                <p className="text-[13px] text-white/30 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-[28px] font-bold text-center mb-2">Questions?</h2>
        <p className="text-[14px] text-white/30 text-center mb-10">Reach out anytime — we answer personally.</p>
        {faqs.map((faq) => (
          <FAQItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-[24px] font-bold mb-3">Ready to get started?</h2>
        <p className="text-[14px] text-white/30 mb-6">20 minutes. We&apos;ll show you what birdie can do for your business.</p>
        <Link href="/#contact" className="inline-block px-8 py-3.5 bg-[#FACC15] text-[#0a0a0f] rounded-full text-[14px] font-bold hover:bg-[#fde047] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FACC15]/20">
          Book a Free Demo →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.04] py-10 text-center">
        <p className="text-[12px] text-white/15">&copy; {new Date().getFullYear()} birdie. All rights reserved.</p>
      </footer>
    </div>
  );
}
