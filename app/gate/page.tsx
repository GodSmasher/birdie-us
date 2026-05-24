'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Brand } from '@/components/ui';

function GateForm() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get('next') || '/dashboard';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace(next);
      router.refresh();
    } else {
      setError('Falsches Passwort');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-7">
      <Brand />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-semibold text-2xl tracking-tightest text-fg">Geschützter Bereich</h1>
        <p className="text-[13px] text-fg2">Diese Instanz zeigt echte Kundendaten. Bitte Zugangspasswort eingeben.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Zugangspasswort"
          className="h-11 bg-surface border border-line-2 rounded-[10px] px-3.5 text-[13px] text-fg outline-none focus:border-accent placeholder:text-fg3"
        />
        {error && <span className="text-xs text-error">{error}</span>}
        <button
          type="submit"
          disabled={loading || !password}
          className="h-[46px] bg-accent text-bg rounded-[10px] flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50"
        >
          {loading ? 'Prüfe…' : 'Eintreten'} <span className="font-bold">→</span>
        </button>
      </form>
      <p className="text-[11px] text-fg3 text-center">.birdie · interner Zugang</p>
    </div>
  );
}

export default function GatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <Suspense fallback={null}>
        <GateForm />
      </Suspense>
    </div>
  );
}
