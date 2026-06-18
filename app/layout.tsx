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
        <script dangerouslySetInnerHTML={{ __html: `(function initApolloInbound(){var TIMEOUT_MS=15000;var timeoutId;var style=document.createElement('style');style.id='apollo-form-prehide-css';style.textContent='form:has(input[type=\"email\" i]),form:has(input[name=\"email\" i]),.hs-form-iframe{position:relative!important}form:has(input[type=\"email\" i])::before,form:has(input[name=\"email\" i])::before,.hs-form-iframe::before{content:\"\";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;width:50px;height:50px;margin:auto;border:2.5px solid #e1e1e1;border-top:2.5px solid #9ea3a6;border-radius:50%;animation:spin 1s linear infinite;background-color:transparent;pointer-events:auto;z-index:999999;opacity:1}form:has(input[type=\"email\" i]) *,form:has(input[name=\"email\" i]) *,.hs-form-iframe *{opacity:0!important;user-select:none!important;pointer-events:none!important}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';(document.head||document.documentElement).appendChild(style);function cleanup(){var styleEl=document.getElementById('apollo-form-prehide-css');if(styleEl)styleEl.remove();if(timeoutId)clearTimeout(timeoutId)}timeoutId=setTimeout(function(){cleanup()},TIMEOUT_MS);var nocache=Math.random().toString(36).substring(7);var script=document.createElement('script');script.src='https://assets.apollo.io/js/apollo-inbound.js?nocache='+nocache;script.defer=true;script.onerror=function(){cleanup()};script.onload=function(){try{window.ApolloInbound.formEnrichment.init({appId:'6a33ae7fe364ee000c4b5bda',onReady:function(){cleanup()},onError:function(){cleanup()}})}catch(e){cleanup()}};document.head.appendChild(script)})();` }} />
      </head>
      <body className="bg-bg text-fg min-h-screen">{children}</body>
    </html>
  );
}
