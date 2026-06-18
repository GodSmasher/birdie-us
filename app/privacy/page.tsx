import Link from 'next/link';

export const metadata = { title: 'Privacy Policy | .birdie' };

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a1a]">
      <nav className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-2xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 200 48" className="h-6"><circle cx="12" cy="36" r="6" fill="#FACC15" /><text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#1a1a1a" letterSpacing="-1">birdie</text></svg>
          </Link>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-extrabold mb-8">Privacy Policy</h1>
        <div className="flex flex-col gap-8 text-[15px] text-[#1a1a1a]/60 leading-relaxed">

          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-2">1. Who We Are</h2>
            <p>
              .birdie &mdash; Sarah Vogel<br />
              Coppistra&szlig;e 83<br />
              04157 Leipzig, Germany<br />
              Email: info@birdie.solar
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-2">2. Information We Collect</h2>
            <p>
              When you visit our website, our hosting provider (Vercel Inc.) automatically
              collects standard server log data such as your IP address, browser type, and
              access times. This is necessary to provide and secure the website.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-2">3. Cookies &amp; Analytics</h2>
            <p>
              We use analytics cookies (Apollo.io website tracker) only after you give explicit
              consent via our cookie banner. These cookies help us understand how visitors
              use our website. You can withdraw your consent at any time by clearing cookies
              in your browser settings.
            </p>
            <p className="mt-2">
              <strong>Apollo.io:</strong> Apollo.io Inc., 535 Mission St, San Francisco, CA 94105, USA.
              For more information, see the{' '}
              <a href="https://www.apollo.io/privacy" className="text-[#FACC15] underline" target="_blank" rel="noopener noreferrer">
                Apollo.io Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-2">4. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and maintain our website</li>
              <li>Understand how visitors interact with our website</li>
              <li>Respond to inquiries and support requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-2">5. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with service providers
              (Vercel for hosting, Apollo.io for analytics) who process data on our behalf under
              appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-2">6. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access, correct, or delete your personal data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-2">
              <strong>California residents (CCPA):</strong> You have the right to know what
              personal information we collect, request deletion, and opt out of the sale of
              personal information. We do not sell personal information.
            </p>
            <p className="mt-2">
              <strong>EU/EEA residents (GDPR):</strong> Processing is based on your consent
              (Art.&nbsp;6(1)(a) GDPR) for analytics and our legitimate interest
              (Art.&nbsp;6(1)(f) GDPR) for website operation.
            </p>
            <p className="mt-2">
              To exercise your rights, contact us at info@birdie.solar.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-[#1a1a1a] mb-2">7. Changes</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on
              this page.
            </p>
            <p className="mt-2 text-xs">Last updated: June 2026</p>
          </section>

        </div>
      </main>
    </div>
  );
}
