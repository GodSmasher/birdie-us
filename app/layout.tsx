import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '.birdie',
  description: 'Eine Plattform. Alle Tools verbunden.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="font-sans">
      <body className="bg-bg text-fg min-h-screen">{children}</body>
    </html>
  );
}
