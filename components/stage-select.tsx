'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STAGES, type StageId } from '@/app/lib/netzanmeldung';

export function StageSelect({ offerId, status }: { offerId: string; status: StageId }) {
  const router = useRouter();
  const [val, setVal] = useState<StageId>(status);
  const [saving, setSaving] = useState(false);

  async function change(next: StageId) {
    setVal(next);
    setSaving(true);
    await fetch('/api/netzanmeldung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, status: next }),
    }).catch(() => {});
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={val}
      disabled={saving}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => change(e.target.value as StageId)}
      className="w-full bg-bg border border-line-2 rounded-md px-2 py-1 text-[11px] text-fg outline-none focus:border-accent disabled:opacity-50"
    >
      {STAGES.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
