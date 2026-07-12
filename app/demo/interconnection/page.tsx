'use client';

import { useState } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { icRows, icSummary, icStatusTone, avPalette } from '../crm-data';

const TABS = ['All', 'Oncor', 'Duke Energy', 'PG&E', 'APS', 'Xcel'] as const;

export default function InterconnectionPage() {
  const [activeTab, setActiveTab] = useState<string>('All');

  const filtered = activeTab === 'All' ? icRows : icRows.filter(r => r.util === activeTab);

  return (
    <>
      <CrmSidebar active="interconnection" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar
          title="Interconnection"
          subtitle="28 utility applications · 3 need action"
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Summary cards */}
          <div className="px-6 pt-5 pb-3 shrink-0">
            <div className="grid grid-cols-4 gap-3">
              {icSummary.map(s => (
                <Card key={s.k} className="px-4 py-3">
                  <p className="text-[9px] text-fg4 uppercase tracking-wider font-medium">{s.k}</p>
                  <p className={`text-[20px] font-semibold mt-0.5 ${s.c}`}>{s.v}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-6 pb-3 flex items-center gap-1 shrink-0">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-accent text-white'
                    : 'text-fg2 border border-line hover:border-line-2 hover:text-fg'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-surface">
                    <th className="w-8 px-3 py-2.5" />
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Customer</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Utility</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Application #</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Filed</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Status</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Days</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Docs</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <tr
                      key={row.app}
                      className={`border-b border-line hover:bg-surface-2 transition-colors ${
                        row.flag === 'red' ? 'bg-error/[0.06]' : ''
                      }`}
                    >
                      {/* Flag dot */}
                      <td className="w-8 px-3 py-2.5">
                        <span
                          className={`block w-1.5 h-1.5 rounded-full ${
                            row.flag === 'red'
                              ? 'bg-error'
                              : row.flag === 'yellow'
                                ? 'bg-warning'
                                : 'bg-transparent'
                          }`}
                        />
                      </td>

                      {/* Customer with avatar */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${avPalette[Math.abs(row.cust.charCodeAt(0)) % avPalette.length][0]} ${avPalette[Math.abs(row.cust.charCodeAt(0)) % avPalette.length][1]}`}
                          >
                            {row.init}
                          </div>
                          <span className="text-[11px] font-medium text-fg">{row.cust}</span>
                        </div>
                      </td>

                      {/* Utility */}
                      <td className="px-4 py-2.5 text-[11px] text-fg2">{row.util}</td>

                      {/* Application # */}
                      <td className="px-4 py-2.5 text-[11px] text-fg font-mono">{row.app}</td>

                      {/* Filed */}
                      <td className="px-4 py-2.5 text-[11px] text-fg3">{row.filed}</td>

                      {/* Status */}
                      <td className="px-4 py-2.5">
                        <Pill label={row.status.toUpperCase()} tone={icStatusTone[row.status] as any} dot={false} />
                      </td>

                      {/* Days */}
                      <td className="px-4 py-2.5 text-[11px] text-fg">
                        {row.days > 0 ? `${row.days}d` : '—'}
                      </td>

                      {/* Docs */}
                      <td className="px-4 py-2.5">
                        {row.docs ? (
                          <span className="text-[11px] text-success font-medium">✓ Complete</span>
                        ) : (
                          <span className="text-[11px] text-error font-medium">⚠ Missing</span>
                        )}
                      </td>

                      {/* Assigned */}
                      <td className="px-4 py-2.5 text-[11px] text-fg2">{row.assigned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
