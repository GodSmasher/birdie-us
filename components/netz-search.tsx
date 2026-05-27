'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

export function NetzSearch() {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const update = useCallback(
    (value: string) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set('q', value);
      else params.delete('q');
      startTransition(() => router.replace(`/netzanmeldung?${params.toString()}`));
    },
    [router, sp, startTransition],
  );

  return (
    <input
      type="search"
      placeholder="Name oder Adresse suchen…"
      defaultValue={sp.get('q') ?? ''}
      onChange={(e) => update(e.target.value)}
      className="px-3 py-1.5 rounded-lg border border-line bg-surface text-xs text-fg placeholder:text-fg4 w-[220px] focus:outline-none focus:border-accent transition-colors"
    />
  );
}
