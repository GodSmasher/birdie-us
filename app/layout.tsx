import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '.birdie — The Transparency Layer for Solar Installers',
  description: 'birdie connects your existing tools into one clear picture. Utility registration, document AI, monitoring, workflows — for solar installers.',
  keywords: ['Solar installer software', 'Utility registration automation', 'PV platform', 'Solar document management', 'Solar ERP alternative'],
  openGraph: {
    title: '.birdie — The Transparency Layer for Solar Installers',
    description: 'Connects your tools. Makes visible what happens. Automates the rest.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"6a311e5801cc340010b47bfd"})},document.head.appendChild(o)}initApollo();` }} />
      </head>
      <body className="bg-bg text-fg min-h-screen">{children}</body>
    </html>
  );
}
