'use client';

import { useState, type ReactNode } from 'react';

const tabs = [
  { key: 'rechnungen', label: 'Invoices' },
  { key: 'liquiditaet', label: 'Cash Flow' },
  { key: 'mahnwesen', label: 'Dunning' },
  { key: 'intern', label: 'Internal' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export function FinanceTabs({ invoiceTab, cashflowTab, dunningTab, internTab }: { invoiceTab: ReactNode; cashflowTab: ReactNode; dunningTab: ReactNode; internTab: ReactNode }) {
  const [active, setActive] = useState<TabKey>('rechnungen');

  return (
    <>
      <div className="px-8 pt-4 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2.5 text-[13px] font-medium rounded-t-lg transition-colors ${
              active === t.key
                ? 'text-fg bg-surface-2 border-b-2 border-accent'
                : 'text-fg3 hover:text-fg2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {active === 'rechnungen' ? invoiceTab : active === 'liquiditaet' ? cashflowTab : active === 'mahnwesen' ? dunningTab : internTab}
    </>
  );
}
