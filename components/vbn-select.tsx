'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const KNOWN_VBN = [
  'MITNETZ STROM',
  'TEN Thüringer Energienetze',
  'Avacon',
  'E.DIS',
  'Stromnetz Berlin',
  'Stromnetz Hamburg',
  'SWM Infrastruktur (München)',
  'Schleswig-Holstein Netz',
  'EWE Netz',
  'Westnetz',
  'Rheinische NETZGesellschaft',
  'Syna',
  'Netze BW',
  'Bayernwerk',
  'LEW Verteilnetz',
] as const;

export function VbnSelect({ offerId, current }: { offerId: string; current: string }) {
  const router = useRouter();
  const [val, setVal] = useState(current);
  const [saving, setSaving] = useState(false);
  const [custom, setCustom] = useState(false);

  const isKnown = KNOWN_VBN.includes(current as typeof KNOWN_VBN[number]) || current === '—' || !current;

  async function save(name: string) {
    if (!name || name === val) return;
    setVal(name);
    setSaving(true);
    await fetch('/api/netzanmeldung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, netzbetreiber: name }),
    }).catch(() => {});
    setSaving(false);
    setCustom(false);
    router.refresh();
  }

  if (custom || (!isKnown && current !== '—')) {
    return (
      <div className="flex gap-1.5">
        <input
          type="text"
          defaultValue={val === '—' ? '' : val}
          placeholder="VBN-Name eingeben…"
          autoFocus
          disabled={saving}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save((e.target as HTMLInputElement).value.trim());
            if (e.key === 'Escape') setCustom(false);
          }}
          className="flex-1 min-w-0 bg-bg border border-line-2 rounded-md px-2 py-1 text-[11px] text-fg outline-none focus:border-accent disabled:opacity-50"
        />
        <button
          disabled={saving}
          onClick={() => setCustom(false)}
          className="px-2 py-1 text-[10px] text-fg3 hover:text-fg border border-line rounded-md"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      <select
        value={val}
        disabled={saving}
        onChange={(e) => {
          if (e.target.value === '__custom') { setCustom(true); return; }
          save(e.target.value);
        }}
        className="flex-1 min-w-0 bg-bg border border-line-2 rounded-md px-2 py-1 text-[11px] text-fg outline-none focus:border-accent disabled:opacity-50"
      >
        {(!val || val === '—') && <option value="—">— VBN wählen —</option>}
        {KNOWN_VBN.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
        <option value="__custom">Anderer…</option>
      </select>
    </div>
  );
}
