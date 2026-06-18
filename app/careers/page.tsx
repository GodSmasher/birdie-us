import Link from 'next/link';
import ApplyForm from '@/components/apply-form';

export const metadata = {
  title: 'Careers | .birdie — Join the Solar Transparency Movement',
  description: 'Earn commission selling birdie to solar installers. Tiered model from 14% to 28% with team-building opportunities.',
};

const tiers = [
  {
    name: 'Starter',
    commission: '14%',
    requirement: 'Get started',
    details: '0–4 closed deals',
    color: '#a3a3a3',
  },
  {
    name: 'Pro',
    commission: '19%',
    requirement: '5 closed deals',
    details: '5–14 closed deals',
    color: '#FACC15',
  },
  {
    name: 'Senior',
    commission: '23%',
    requirement: '15 closed deals',
    details: '15–29 closed deals',
    color: '#F59E0B',
  },
  {
    name: 'Partner',
    commission: '28%',
    requirement: '30+ closed deals',
    details: '30+ closed deals · Build your own team',
    color: '#EF4444',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a]">
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 200 48" className="h-6">
              <circle cx="12" cy="36" r="6" fill="#FACC15" />
              <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#1a1a1a" letterSpacing="-1">birdie</text>
            </svg>
          </Link>
          <a href="#apply" className="text-sm font-semibold bg-[#1a1a1a] text-white px-5 py-2 rounded-full hover:bg-[#333] transition">
            Apply Now
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20">
            <span className="text-[#FACC15] text-sm font-semibold tracking-wide">NOW HIRING</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Sell solar software.<br />
            <span className="text-[#FACC15]">Earn up to 28%.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            You already know how to sell in solar. Now add a recurring revenue stream
            by referring installers to birdie &mdash; the transparency platform they&apos;ve been missing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#apply" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#FACC15] text-[#1a1a1a] font-bold text-base hover:bg-[#fbbf24] transition">
              Apply as Sales Partner
            </a>
            <a href="#model" className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/20 text-white font-semibold text-base hover:bg-white/5 transition">
              See Commission Model
            </a>
          </div>
        </div>
      </section>

      {/* What is birdie */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">What you&apos;ll be selling</h2>
          <p className="text-[#1a1a1a]/50 text-lg max-w-2xl mx-auto">
            birdie gives solar installers a transparency layer that wins homeowner trust and closes more deals.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📍', title: 'Real-Time Tracking', desc: 'Homeowners see every project milestone as it happens.' },
            { icon: '🔔', title: 'Automated Updates', desc: 'No more "where\'s my project?" calls. birdie handles it.' },
            { icon: '⭐', title: 'Trust Layer', desc: 'Verified reviews and transparent pricing set installers apart.' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-white border border-black/[0.04] shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-[#1a1a1a]/50 text-[15px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commission Model */}
      <section id="model" className="bg-[#1a1a1a] text-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Commission Model</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Start at 14%. Climb to 28%. The more you close, the more you earn per deal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((tier, i) => (
              <div key={tier.name} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col">
                {i === 3 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FACC15] text-[#1a1a1a] text-xs font-bold">
                    TOP TIER
                  </div>
                )}
                <div className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: tier.color }}>
                  {tier.name}
                </div>
                <div className="text-5xl font-extrabold mb-1">{tier.commission}</div>
                <div className="text-white/40 text-sm mb-6">per closed deal</div>
                <div className="mt-auto pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60">{tier.details}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl border border-[#FACC15]/20 bg-[#FACC15]/5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="text-3xl">🚀</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Team Building at Partner Level</h3>
                <p className="text-white/50 text-[15px] leading-relaxed">
                  At 28%, you unlock the ability to recruit and manage your own sales team.
                  Earn override commissions on your team&apos;s deals and build a scalable income stream.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How it works</h2>
        </div>
        <div className="space-y-8">
          {[
            { step: '01', title: 'Apply', desc: 'Fill out the form below. We\'ll review and get back within 48 hours.' },
            { step: '02', title: 'Get Onboarded', desc: 'Quick intro call + access to your partner dashboard and sales materials.' },
            { step: '03', title: 'Start Referring', desc: 'Pitch birdie to solar installers in your network. We handle onboarding and support.' },
            { step: '04', title: 'Earn Commission', desc: 'Get paid when they sign. Climb the tiers as you close more deals.' },
          ].map((s) => (
            <div key={s.step} className="flex gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-full bg-[#FACC15]/10 flex items-center justify-center">
                <span className="text-[#FACC15] font-bold text-sm">{s.step}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-[#1a1a1a]/50 text-[15px]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who we're looking for */}
      <section className="bg-[#f5f5f0]">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Who we&apos;re looking for</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: '☀️', text: 'Experience in solar sales (residential or commercial)' },
              { icon: '🤝', text: 'Existing network of solar installers or contractors' },
              { icon: '📈', text: 'Self-motivated with a track record of closing deals' },
              { icon: '🌎', text: 'Based in the US (remote, work from anywhere)' },
              { icon: '💬', text: 'Strong communication skills' },
              { icon: '🔥', text: 'Hungry to build something — not just collect a paycheck' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-black/[0.04]">
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="text-[15px] text-[#1a1a1a]/70">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section id="apply" className="bg-[#1a1a1a] text-white">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to earn?</h2>
            <p className="text-white/50 text-lg">
              Fill out the form below and we&apos;ll get back to you within 48 hours.
            </p>
          </div>
          <ApplyForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.04] bg-[#fafaf9]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#1a1a1a]/40">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 200 48" className="h-5">
              <circle cx="12" cy="36" r="6" fill="#FACC15" />
              <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#1a1a1a" letterSpacing="-1">birdie</text>
            </svg>
          </Link>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#1a1a1a]/60 transition">Privacy</Link>
            <Link href="/impressum" className="hover:text-[#1a1a1a]/60 transition">Legal Notice</Link>
            <Link href="/" className="hover:text-[#1a1a1a]/60 transition">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
