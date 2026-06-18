'use client';

import { useState, useEffect } from 'react';

const APOLLO_TRACKER_ID = '6a311e5801cc340010b47bfd';
const APOLLO_INBOUND_ID = '6a33ae7fe364ee000c4b5bda';

function loadApolloScripts() {
  const n = Math.random().toString(36).substring(7);
  const tracker = document.createElement('script');
  tracker.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${n}`;
  tracker.async = true;
  tracker.defer = true;
  tracker.onload = () => {
    (window as any).trackingFunctions?.onLoad({ appId: APOLLO_TRACKER_ID });
  };
  document.head.appendChild(tracker);

  const inbound = document.createElement('script');
  inbound.src = `https://assets.apollo.io/js/apollo-inbound.js?nocache=${n}`;
  inbound.defer = true;
  inbound.onload = () => {
    try {
      (window as any).ApolloInbound?.formEnrichment?.init({ appId: APOLLO_INBOUND_ID });
    } catch {}
  };
  document.head.appendChild(inbound);
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') {
      loadApolloScripts();
    } else if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
    loadApolloScripts();
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/95 backdrop-blur-md p-5 md:p-6 shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 text-sm text-[#1a1a1a]/60 leading-relaxed">
            <p className="font-medium text-[#1a1a1a] mb-1">Cookie Settings</p>
            <p>
              We use cookies and similar technologies to analyze website visits and improve our
              service. By clicking &ldquo;Accept&rdquo; you consent to the use of analytics
              cookies.{' '}
              <a href="/privacy" className="underline text-amber-500 hover:text-amber-600">
                Privacy Policy
              </a>
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={decline}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm text-[#1a1a1a]/60 hover:bg-black/5 transition"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-400 transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
