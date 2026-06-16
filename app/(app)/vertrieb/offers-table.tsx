'use client';

import { useState } from 'react';
import { Pill } from '@/components/ui';

interface OfferRow {
  id: string;
  name: string;
  customer: string;
  status: string;
  state: string;
  type: string;
  value: number;
}

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));

const stateTone: Record<string, 'info' | 'success' | 'error' | 'neutral'> = { Open: 'info', Won: 'success', Lost: 'error' };
const stateLabel: Record<string, string> = { Open: 'OFFEN', Won: 'GEWONNEN', Lost: 'VERLOREN' };

type SortKey = 'name' | 'customer' | 'status' | 'state' | 'value';
type SortDir = 'asc' | 'desc';

function sortOffers(offers: OfferRow[], key: SortKey, dir: SortDir): OfferRow[] {
  return [...offers].sort((a, b) => {
    let cmp = 0;
    if (key === 'value') {
      cmp = a.value - b.value;
    } else {
      cmp = (a[key] || '').localeCompare(b[key] || '', 'de');
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: 'name', label: 'ANGEBOT / KUNDE', className: 'col-span-1' },
  { key: 'status', label: 'STUFE', className: '' },
  { key: 'state', label: 'STATE', className: '' },
  { key: 'value', label: 'WERT', className: '' },
];

export function OffersTable({ offers, total }: { offers: OfferRow[]; total: number }) {
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterState, setFilterState] = useState<string>('Won');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'value' ? 'desc' : 'asc');
    }
  };

  const filtered = filterState === 'all' ? offers : offers.filter((o) => o.state === filterState);
  const sorted = sortOffers(filtered, sortKey, sortDir);

  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '');

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      {/* Header */}
      <div className="h-13 px-5 border-b border-line flex items-center gap-3" style={{ height: 52 }}>
        <h3 className="font-semibold text-sm text-fg">Angebote</h3>
        <span className="text-[11px] text-fg3">{sorted.length} von {total}</span>
        <div className="ml-auto flex items-center gap-1 bg-surface-2 border border-line rounded-lg p-0.5">
          {[
            { key: 'all', label: 'Alle' },
            { key: 'Open', label: 'Offen' },
            { key: 'Won', label: 'Gewonnen' },
            { key: 'Lost', label: 'Verloren' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterState(f.key)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                filterState === f.key ? 'bg-accent text-bg' : 'text-fg3 hover:text-fg2 hover:bg-surface-3'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_130px_130px_120px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            onClick={() => handleSort(col.key)}
            className="text-left hover:text-fg2 transition-colors cursor-pointer select-none"
          >
            {col.label}{arrow(col.key)}
          </button>
        ))}
      </div>

      {/* Rows */}
      {sorted.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-fg3">Keine Angebote in diesem Filter</div>
      ) : (
        sorted.map((o, i) => (
          <a
            href={`/vertrieb/${encodeURIComponent(o.id)}`}
            key={o.id}
            className={`grid grid-cols-[1fr_130px_130px_120px] min-h-[48px] items-center px-5 py-2 hover:bg-surface-2/40 transition-colors cursor-pointer ${
              i < sorted.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <div className="flex flex-col min-w-0 pr-3">
              <span className="text-[13px] font-medium text-accent truncate">{o.name}</span>
              <span className="text-[11px] text-fg3 truncate">{o.customer}</span>
            </div>
            <span className="text-[11px] text-fg2 truncate pr-2">{o.status}</span>
            <div>
              <Pill label={stateLabel[o.state] ?? o.state} tone={stateTone[o.state] ?? 'neutral'} />
            </div>
            <span className="text-[13px] font-medium text-fg">{euro(o.value)}</span>
          </a>
        ))
      )}
    </div>
  );
}
