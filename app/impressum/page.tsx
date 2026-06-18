import Link from 'next/link';

export const metadata = { title: 'Legal Notice | .birdie' };

export default function LegalNotice() {
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
        <h1 className="text-3xl font-extrabold mb-8">Legal Notice</h1>
        <div className="flex flex-col gap-6 text-[15px] text-[#1a1a1a]/60 leading-relaxed">
          <div>
            <h2 className="font-bold text-[#1a1a1a] mb-2">Company Information</h2>
            <p>.birdie<br />Sarah Vogel<br />Coppistra&szlig;e 83<br />04157 Leipzig</p>
          </div>
          <div>
            <h2 className="font-bold text-[#1a1a1a] mb-2">Contact</h2>
            <p>Email: info@birdie.solar</p>
          </div>
          <div>
            <h2 className="font-bold text-[#1a1a1a] mb-2">Responsible for content</h2>
            <p>Sarah Vogel<br />Coppistra&szlig;e 83<br />04157 Leipzig</p>
          </div>
        </div>
      </main>
    </div>
  );
}
