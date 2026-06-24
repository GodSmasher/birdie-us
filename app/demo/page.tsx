'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/ui';

const DEMO_PASSWORD = 'renew2026';

export default function DemoLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password === DEMO_PASSWORD) {
      await fetch('/api/auth/demo', { method: 'POST' });
      router.replace('/demo/dashboard');
    } else {
      setError('Invalid access code');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[560px] flex-col bg-surface border-r border-line p-[60px]">
        <Brand />
        <div className="flex-1" />
        <div className="flex flex-col gap-6">
          <h1 className="font-semibold text-[36px] leading-[44px] tracking-tightest text-fg whitespace-pre-line">
            {'Solar operations.\nFully automated.\nBuilt for scale.'}
          </h1>
          <p className="text-sm leading-[22px] text-fg2 max-w-[460px]">
            Interconnection filings, permit tracking, compliance checks, crew scheduling — one platform handles it all. No portals. No spreadsheets. No dropped balls.
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4 text-[11px] text-fg3">
          <span>US-hosted · SOC 2</span>
          <span className="text-fg4">·</span>
          <span>NES / TVA territory</span>
          <span className="text-fg4">·</span>
          <span>Demo v1.0</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-[420px] flex flex-col gap-7 px-2 lg:px-10 py-10">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-semibold text-2xl tracking-tightest text-fg">Welcome to the demo</h2>
            <p className="text-[13px] text-fg2">Enter your access code to explore the platform.</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-fg2">Access Code</label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter code"
                className="h-11 bg-surface border border-line-2 rounded-[10px] px-3.5 text-[13px] text-fg outline-none focus:border-accent placeholder:text-fg3"
              />
            </div>

            {error && <span className="text-xs text-error">{error}</span>}

            <button
              type="submit"
              disabled={loading || !password}
              className="h-[46px] bg-accent text-bg rounded-[10px] flex items-center justify-center gap-2 font-semibold text-sm hover:brightness-95 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Enter Demo'} <span className="font-bold">→</span>
            </button>
          </form>

          <div className="flex flex-col items-center gap-1.5 mt-4">
            <span className="text-xs text-fg3">Questions about birdie?</span>
            <a href="mailto:info@birdiesolar.com" className="text-xs font-medium text-accent">
              info@birdiesolar.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
