'use client';

import { useState } from 'react';

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/cashflow/sync', { method: 'POST' });
      const data = await res.json();
      setResult(`${data.matched} zugeordnet · ${data.updated} aktualisiert${data.unmatched?.length ? ` · ${data.unmatched.length} ohne Projekt` : ''}`);
      if (data.updated > 0) setTimeout(() => window.location.reload(), 1500);
    } catch {
      setResult('Fehler beim Sync');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="h-8 px-3 rounded-lg text-xs font-medium bg-info/10 text-info hover:bg-info/20 transition-colors disabled:opacity-50"
      >
        {loading ? 'Sync läuft…' : 'sevDesk abgleichen'}
      </button>
      {result && <span className="text-[11px] text-fg3">{result}</span>}
    </div>
  );
}
