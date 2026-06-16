'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchIndex, type SearchItem } from '@/lib/data';

const groupOrder = ['Page', 'Quote', 'Contact', 'Article', 'File', 'Bot', 'Customer', 'Invoice', 'Action'];

function groupOf(item: SearchItem) {
  return item.category.split(' ')[0];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [dyn, setDyn] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function go(href: string) {
    setOpen(false);
    if (/^https?:\/\//.test(href)) window.open(href, '_blank', 'noopener');
    else router.push(href);
  }

  // Live DB search (offers/contacts/components), debounced.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setDyn([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const json = (await res.json()) as { results: SearchItem[] };
        setDyn(json.results ?? []);
      } catch {
        setDyn([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Expose a global open() so the topbar button can trigger this
  useEffect(() => {
    (window as unknown as { __birdieOpenPalette?: () => void }).__birdieOpenPalette = () => setOpen(true);
    return () => {
      delete (window as unknown as { __birdieOpenPalette?: () => void }).__birdieOpenPalette;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const staticMatches = q
    ? searchIndex.filter((i) => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    : searchIndex;
  const filtered = q ? [...staticMatches, ...dyn] : searchIndex;

  // Group ordering
  const grouped: { group: string; items: SearchItem[] }[] = [];
  for (const g of groupOrder) {
    const items = filtered.filter((i) => groupOf(i) === g);
    if (items.length) grouped.push({ group: g, items });
  }
  const flat = grouped.flatMap((g) => g.items);

  function onItemKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flat[selected];
      if (item) go(item.href);
    }
  }

  if (!open) return null;

  let runningIdx = -1;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[120px] bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[640px] max-w-[92vw] bg-surface border border-line-2 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-12 border-b border-line">
          <span className="text-fg2 text-lg">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={onItemKey}
            placeholder="Search — Bots, Customers, Invoices, Actions..."
            className="flex-1 bg-transparent outline-none text-fg placeholder:text-fg3 text-sm"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface-3 text-fg2 text-[10px] font-medium">ESC</kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto py-1">
          {grouped.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-fg3">No results for "{query}"</div>
          )}
          {grouped.map((g) => (
            <div key={g.group} className="py-1">
              <div className="px-4 py-1.5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                {g.group.toUpperCase()}
              </div>
              {g.items.map((item) => {
                runningIdx++;
                const active = runningIdx === selected;
                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setSelected(flat.indexOf(item))}
                    onClick={() => go(item.href)}
                    className={`w-full flex items-center gap-3 px-4 h-10 text-left ${
                      active ? 'bg-surface-2' : 'hover:bg-surface-2/50'
                    }`}
                  >
                    <span className={`text-base ${active ? 'text-accent' : 'text-fg2'}`}>{item.icon}</span>
                    <span className="text-[13px] text-fg">{item.label}</span>
                    <span className="ml-auto text-[11px] text-fg3">{item.category}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-line px-4 h-9 flex items-center gap-4 text-[10px] text-fg3">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 rounded bg-surface-3 text-fg2">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 rounded bg-surface-3 text-fg2">⏎</kbd> open
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 rounded bg-surface-3 text-fg2">⌘K</kbd> toggle
          </span>
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteTrigger({ className = '' }: { className?: string }) {
  return (
    <button
      className={className}
      onClick={() => {
        const open = (window as unknown as { __birdieOpenPalette?: () => void }).__birdieOpenPalette;
        open?.();
      }}
    >
      ⌘K
    </button>
  );
}
