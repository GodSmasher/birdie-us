'use client';

import { useState } from 'react';

interface Project {
  id: string;
  customerName: string;
  title: string;
  orderValue: number;
  plannedIn: number;
  plannedOut: number;
  balance: number;
  status: string;
  flags: string[];
}

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));

export function ProjectTable({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? projects.filter((p) => {
        const q = search.toLowerCase();
        return p.customerName.toLowerCase().includes(q) || p.title.toLowerCase().includes(q);
      })
    : projects;

  return (
    <>
      <div className="px-5 py-3 border-b border-line">
        <input
          type="text"
          placeholder="Projekt oder Kunde suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-fg placeholder:text-fg3 outline-none"
        />
      </div>
      <div className="grid grid-cols-[1fr_120px_120px_120px_120px_100px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
        <span>PROJEKT</span><span>AUFTRAGSWERT</span><span>EINNAHMEN</span><span>AUSGABEN</span><span>SALDO</span><span>STATUS</span>
      </div>
      {filtered.length === 0 && (
        <div className="px-5 py-6 text-center text-xs text-fg3">
          {search ? `Keine Projekte für "${search}" gefunden` : 'Keine Projekte'}
        </div>
      )}
      {filtered.map((p, idx) => (
        <a key={p.id} href={`/finance/${p.id}`} className="block">
          <div className={`grid grid-cols-[1fr_120px_120px_120px_120px_100px] h-[52px] items-center px-5 hover:bg-surface-2/40 cursor-pointer transition-colors ${idx < filtered.length - 1 && p.flags.length === 0 ? 'border-b border-line' : ''}`}>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-fg truncate">{p.customerName}</div>
              <div className="text-[10px] text-fg3 truncate">{p.title}</div>
            </div>
            <span className="text-[13px] font-semibold text-fg">{euro(p.orderValue)}</span>
            <span className="text-xs text-success">{euro(p.plannedIn)}</span>
            <span className="text-xs text-warning">{euro(p.plannedOut)}</span>
            <span className={`text-xs font-semibold ${p.balance >= 0 ? 'text-success' : 'text-error'}`}>{euro(p.balance)}</span>
            <div>
              {p.flags.length > 0
                ? <span className="inline-flex items-center h-[22px] px-2.5 rounded text-[10px] font-semibold bg-warning/10 text-warning">WARNUNG</span>
                : p.status === 'completed'
                  ? <span className="inline-flex items-center h-[22px] px-2.5 rounded text-[10px] font-semibold bg-success/10 text-success">FERTIG</span>
                  : <span className="inline-flex items-center h-[22px] px-2.5 rounded text-[10px] font-semibold bg-info/10 text-info">AKTIV</span>
              }
            </div>
          </div>
          {p.flags.length > 0 && (
            <div className={`px-5 pb-3 flex flex-col gap-1 ${idx < filtered.length - 1 ? 'border-b border-line' : ''}`}>
              {p.flags.map((f, fi) => (
                <div key={fi} className="flex items-center gap-2 text-[11px] text-warning">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />{f}
                </div>
              ))}
            </div>
          )}
        </a>
      ))}
    </>
  );
}
