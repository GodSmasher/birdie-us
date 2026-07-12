'use client';

import { useState, useCallback } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card } from '@/components/ui';
import { integrations as integData, integCats } from '../crm-data';
import {
  ConnectModal,
  IntegrationDetail,
  GearDropdown,
  Toast,
} from '@/components/crm/connect-modal';

interface IntegState {
  name: string;
  cat: string;
  abbr: string;
  color: string;
  connected: boolean;
}

export default function IntegrationsPage() {
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState<IntegState[]>(
    () => integData.map((i) => ({ ...i })),
  );

  // Modal state
  const [connectTarget, setConnectTarget] = useState<IntegState | null>(null);
  const [detailTarget, setDetailTarget] = useState<IntegState | null>(null);
  const [gearOpen, setGearOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const connected = items.filter(
    (i) => i.connected && (filter === 'All' || i.cat === filter),
  );
  const available = items.filter(
    (i) => !i.connected && (filter === 'All' || i.cat === filter),
  );

  const totalConnected = items.filter((i) => i.connected).length;
  const pct = (totalConnected / items.length) * 100;

  const handleConnected = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((i) => (i.name === name ? { ...i, connected: true } : i)),
    );
    setToast(`${name} connected successfully`);
  }, []);

  const handleDisconnect = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((i) => (i.name === name ? { ...i, connected: false } : i)),
    );
    setToast(`${name} disconnected`);
  }, []);

  const handleSync = useCallback((name: string) => {
    setToast(`${name} synced successfully`);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return (
    <>
      <CrmSidebar active="integrations" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Integrations"
          subtitle={`${totalConnected} of ${items.length} connected`}
        />
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {/* Hero progress */}
          <Card className="p-5 mb-5">
            <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[12px] text-fg3 mt-2">
              {totalConnected} of {items.length} integrations connected
            </p>
          </Card>

          {/* Category filter tabs */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {integCats.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
                  filter === cat
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-surface text-fg2 border-line hover:border-fg4'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Connected section */}
          {connected.length > 0 && (
            <>
              <h3 className="text-[12px] font-semibold text-fg3 uppercase tracking-wider mb-3">
                Connected
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {connected.map((integ) => (
                  <div
                    key={integ.name}
                    className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-fg4 transition-colors"
                    onClick={() => setDetailTarget(integ)}
                  >
                    <div
                      className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[13px] font-bold shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${integ.color} 16%, transparent)`,
                        color: integ.color,
                      }}
                    >
                      {integ.abbr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-fg truncate">
                        {integ.name}
                      </p>
                      <p className="text-[11px] text-fg4">{integ.cat}</p>
                    </div>
                    <span className="text-[11px] text-success font-medium shrink-0">
                      Connected
                    </span>
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGearOpen(
                            gearOpen === integ.name ? null : integ.name,
                          );
                        }}
                        className="text-fg4 hover:text-fg transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                          <path d="M13.4 10a1.1 1.1 0 0 0 .2 1.2l.04.04a1.34 1.34 0 1 1-1.9 1.9l-.04-.04a1.1 1.1 0 0 0-1.2-.2 1.1 1.1 0 0 0-.67 1.01v.11a1.34 1.34 0 0 1-2.68 0v-.06A1.1 1.1 0 0 0 6.43 12.8a1.1 1.1 0 0 0-1.2.2l-.04.04a1.34 1.34 0 1 1-1.9-1.9l.04-.04a1.1 1.1 0 0 0 .2-1.2 1.1 1.1 0 0 0-1.01-.67h-.11a1.34 1.34 0 0 1 0-2.68h.06A1.1 1.1 0 0 0 3.2 6.43a1.1 1.1 0 0 0-.2-1.2l-.04-.04a1.34 1.34 0 1 1 1.9-1.9l.04.04a1.1 1.1 0 0 0 1.2.2h.05a1.1 1.1 0 0 0 .67-1.01v-.11a1.34 1.34 0 0 1 2.68 0v.06a1.1 1.1 0 0 0 .67 1.01 1.1 1.1 0 0 0 1.2-.2l.04-.04a1.34 1.34 0 1 1 1.9 1.9l-.04.04a1.1 1.1 0 0 0-.2 1.2v.05a1.1 1.1 0 0 0 1.01.67h.11a1.34 1.34 0 0 1 0 2.68h-.06a1.1 1.1 0 0 0-1.01.67Z" />
                        </svg>
                      </button>
                      {gearOpen === integ.name && (
                        <GearDropdown
                          onSettings={() => setDetailTarget(integ)}
                          onDisconnect={() => handleDisconnect(integ.name)}
                          onClose={() => setGearOpen(null)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Available section */}
          {available.length > 0 && (
            <>
              <h3 className="text-[12px] font-semibold text-fg3 uppercase tracking-wider mb-3">
                Available
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {available.map((integ) => (
                  <div
                    key={integ.name}
                    className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[13px] font-bold shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${integ.color} 16%, transparent)`,
                        color: integ.color,
                      }}
                    >
                      {integ.abbr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-fg truncate">
                        {integ.name}
                      </p>
                      <p className="text-[11px] text-fg4">{integ.cat}</p>
                    </div>
                    <button
                      onClick={() => setConnectTarget(integ)}
                      className="px-3 py-1 rounded-full text-[12px] font-medium border border-accent text-accent hover:bg-accent hover:text-bg transition-colors shrink-0"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Connect modal */}
      {connectTarget && (
        <ConnectModal
          integration={connectTarget}
          onClose={() => setConnectTarget(null)}
          onConnected={handleConnected}
        />
      )}

      {/* Detail modal */}
      {detailTarget && (
        <IntegrationDetail
          integration={detailTarget}
          onClose={() => setDetailTarget(null)}
          onDisconnect={handleDisconnect}
          onSync={handleSync}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={clearToast} />}
    </>
  );
}
