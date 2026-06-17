'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Brand } from '@/components/ui';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.replace(next);
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.message || 'Invalid credentials');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[600px] flex-col bg-surface border-r border-line p-[60px]">
        <Brand />

        <div className="flex-1" />

        <div className="flex flex-col gap-6">
          <h1 className="font-semibold text-[36px] leading-[44px] tracking-tightest text-fg whitespace-pre-line">
            {`One platform.\nAll tools connected.\nNo BS.`}
          </h1>
          <p className="text-sm leading-[22px] text-fg2 max-w-[460px]">
            Bots, connectors, and automations — set up by us, controlled by you. White-glove onboarding included.
          </p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-[11px] text-fg3">
          <span>US-hosted · SOC 2</span>
          <span className="text-fg4">·</span>
          <span>2FA required</span>
          <span className="text-fg4">·</span>
          <span>v1.0</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-[420px] flex flex-col gap-7 px-2 lg:px-10 py-10">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="font-semibold text-2xl tracking-tightest text-fg">Welcome back</h2>
            <p className="text-[13px] text-fg2">Sign in with your company email</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-fg2">Email</label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11 bg-surface border border-line-2 rounded-[10px] px-3.5 text-[13px] text-fg outline-none focus:border-accent placeholder:text-fg3"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center">
                <label className="text-xs font-medium text-fg2">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 bg-surface border border-line-2 rounded-[10px] px-3.5 text-[13px] text-fg outline-none focus:border-accent placeholder:text-fg3"
              />
            </div>

            {error && <span className="text-xs text-error">{error}</span>}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="h-[46px] bg-accent text-bg rounded-[10px] flex items-center justify-center gap-2 font-semibold text-sm hover:brightness-95 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Continue'} <span className="font-bold">→</span>
            </button>
          </form>

          <div className="relative flex items-center gap-3 mt-1">
            <div className="flex-1 h-px bg-line" />
            <span className="text-[11px] text-fg3">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <button
            type="button"
            disabled={demoLoading}
            onClick={async () => {
              setDemoLoading(true);
              await fetch('/api/auth/demo', { method: 'POST' });
              router.replace('/dashboard');
              router.refresh();
            }}
            className="h-[46px] bg-surface border border-line-2 rounded-[10px] flex items-center justify-center gap-2.5 font-semibold text-sm text-fg hover:border-accent/40 hover:bg-surface-2/50 transition-colors disabled:opacity-50"
          >
            <span className="text-lg">🐦</span>
            {demoLoading ? 'Loading demo…' : 'Try the interactive demo'}
          </button>

          <div className="flex flex-col items-center gap-1.5 mt-2">
            <span className="text-xs text-fg3">Don&apos;t have access yet?</span>
            <Link href="mailto:info@birdiesolar.com" className="text-xs font-medium text-accent">
              Email info@birdiesolar.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
