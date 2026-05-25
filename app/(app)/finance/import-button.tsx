'use client';

import { useState } from 'react';

export function ImportButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function handleImport() {
    setState('loading');
    try {
      const res = await fetch('/api/cashflow/import', { method: 'POST' });
      const data = await res.json();
      if (data.imported > 0) {
        setMsg(`${data.imported} Projekte importiert${data.skipped ? `, ${data.skipped} übersprungen` : ''}`);
        setState('done');
        setTimeout(() => window.location.reload(), 1500);
      } else if (data.skipped > 0) {
        setMsg(`Alle ${data.skipped} Aufträge bereits importiert`);
        setState('done');
      } else if (data.errors?.length) {
        setMsg(data.errors[0]);
        setState('error');
      } else {
        setMsg('Keine gewonnenen Aufträge gefunden');
        setState('done');
      }
    } catch {
      setMsg('Import fehlgeschlagen');
      setState('error');
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleImport}
        disabled={state === 'loading'}
        className="px-4 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {state === 'loading' ? 'Importiere…' : 'Reonic-Aufträge importieren'}
      </button>
      {msg && (
        <span className={`text-xs ${state === 'error' ? 'text-error' : 'text-fg2'}`}>{msg}</span>
      )}
    </div>
  );
}
