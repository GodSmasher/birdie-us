import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '.birdie — Die Transparenz-Schicht für Solarinstallateure',
  description: 'birdie verbindet deine bestehenden Tools zu einem klaren Bild. Netzanmeldung, Dokumenten-KI, Monitoring, Workflows — für PV-Installateure.',
  keywords: ['Solarinstallateur Software', 'Netzanmeldung automatisieren', 'PV Plattform', 'Photovoltaik Dokumentenverwaltung', 'Solar ERP Alternative'],
  openGraph: {
    title: '.birdie — Die Transparenz-Schicht für Solarinstallateure',
    description: 'Verbindet deine Tools. Macht sichtbar was passiert. Automatisiert den Rest.',
    type: 'website',
    locale: 'de_DE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="font-sans">
      <body className="bg-bg text-fg min-h-screen">{children}</body>
    </html>
  );
}
