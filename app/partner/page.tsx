import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Partner | .birdie',
  description: 'Join birdie as a partner — manufacturers, software vendors, and distributors in the solar industry.',
};

const PARTNERS = [
  { type: 'MANUFACTURERS', title: 'Inverters & Storage', desc: 'Your devices integrated directly into birdie. Monitoring, alerts, spec sheets — for every installer using birdie.', examples: ['Enphase', 'SolarEdge', 'Tesla', 'SMA', 'Generac', 'Fronius'] },
  { type: 'SOFTWARE', title: 'CRM, ERP & Accounting', desc: 'Official integration into birdie. Your customers see their data seamlessly — no exports, no double entry.', examples: ['Aurora Solar', 'Salesforce', 'HubSpot', 'QuickBooks', 'Stripe', 'Close'] },
  { type: 'DISTRIBUTION', title: 'Distributors & Wholesale', desc: 'Offer birdie as a value-add to your installers. White-label options, co-branding, shared leads.', examples: ['CED Greentech', 'BayWa r.e.', 'Soligent', 'Rexel'] },
];

const BENEFITS = [
  { title: 'Access to Installers', desc: 'birdie users are active solar installers who work with the platform daily. Your product becomes part of their workflow.' },
  { title: 'Official Integration', desc: 'We build the connection to your API. Your logo, your data, seamlessly embedded in birdie.' },
  { title: 'Co-Marketing', desc: 'Joint case studies, blog posts, webinars. We tell the story together.' },
  { title: 'Zero Risk', desc: 'No upfront costs. We start with a pilot integration and scale when it works.' },
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
            <Link href="/" className="text-[13px] text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition">&larr; Home</Link>
            <a href="#contact" className="px-5 py-2 bg-[#1a1a1a] text-white rounded-full text-[13px] font-semibold">Become a Partner</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 md:py-32 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[12px] font-semibold text-[#FACC15] tracking-[0.25em] uppercase mb-6">Partnership</p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Let&apos;s make the industry<br />more transparent.
          </h1>
          <p className="text-lg text-[#1a1a1a]/40 max-w-xl mx-auto">
            You&apos;re a manufacturer, software vendor, or distributor? Become a birdie partner and reach
            active solar installers directly in their workflow.
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
          <h2 className="text-3xl font-extrabold text-center mb-16">What you get as a partner.</h2>
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
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Interested?</h2>
          <p className="text-white/40 mb-10 text-lg">Drop us a line — we&apos;ll get back to you within 24 hours.</p>
          <a href="mailto:partner@birdiesolar.com?subject=Partnership" className="inline-flex px-8 py-4 bg-white text-[#1a1a1a] font-bold rounded-full text-[15px] hover:bg-white/90 transition-all">
            partner@birdiesolar.com &rarr;
          </a>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] border-t border-white/[0.06] py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <svg viewBox="0 0 200 48" className="h-5"><circle cx="12" cy="36" r="6" fill="#FACC15" /><text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#ffffff" fillOpacity="0.3" letterSpacing="-1">birdie</text></svg>
          <div className="flex gap-6 text-[11px] text-white/20">
            <Link href="/impressum">Legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
