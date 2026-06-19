import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '.birdie — Die Transparenzschicht für Solarbetriebe',
  description: 'birdie verbindet eure Tools zu einem klaren Bild. Netzanmeldung, Dokument-KI, Monitoring, Workflows — für Solarbetriebe.',
  keywords: ['Solar Software', 'Netzanmeldung Automatisierung', 'PV Plattform', 'Solar Dokumentenmanagement', 'Solar ERP Alternative'],
  openGraph: {
    title: '.birdie — Die Transparenzschicht für Solarbetriebe',
    description: 'Verbindet eure Tools. Macht sichtbar, was passiert. Automatisiert den Rest.',
    type: 'website',
    locale: 'de_DE',
  },
};

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
