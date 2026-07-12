'use client';

import { useState, useEffect, useCallback } from 'react';

interface Integration {
  name: string;
  cat: string;
  abbr: string;
  color: string;
  connected: boolean;
}

const catDescriptions: Record<string, string> = {
  CRM: 'Enter your API key to sync leads, deals, and contacts',
  Accounting: 'Connect to sync invoices and payments',
  Monitoring: 'Connect to pull real-time system data',
  Communication: 'Connect to sync emails and messages',
  Scheduling: 'Connect to sync appointments and crew schedules',
};

type Step = 'form' | 'connecting' | 'done';

export function ConnectModal({
  integration,
  onClose,
  onConnected,
}: {
  integration: Integration;
  onClose: () => void;
  onConnected: (name: string) => void;
}) {
  const [step, setStep] = useState<Step>('form');
  const [apiKey, setApiKey] = useState('');
  const [subText, setSubText] = useState('Establishing connection...');

  const handleConnect = useCallback(() => {
    if (!apiKey.trim()) return;
    setStep('connecting');
  }, [apiKey]);

  useEffect(() => {
    if (step !== 'connecting') return;
    const t1 = setTimeout(() => setSubText('Syncing initial data...'), 800);
    const t2 = setTimeout(() => {
      setStep('done');
      onConnected(integration.name);
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [step, integration.name, onConnected]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line rounded-xl w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-line">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{
              background: `color-mix(in srgb, ${integration.color} 16%, transparent)`,
              color: integration.color,
            }}
          >
            {integration.abbr}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-fg">
              {step === 'done'
                ? 'Connected!'
                : step === 'connecting'
                  ? 'Connecting...'
                  : `Connect ${integration.name}`}
            </p>
            {step === 'form' && (
              <p className="text-[12px] text-fg3 mt-0.5">
                {catDescriptions[integration.cat] ?? 'Enter your credentials to connect'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-fg4 hover:text-fg transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-fg3 uppercase tracking-wider mb-1.5">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`sk_${integration.abbr.toLowerCase()}_...`}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-line text-fg text-[13px] placeholder:text-fg4 focus:outline-none focus:border-accent transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConnect();
                  }}
                  autoFocus
                />
              </div>
              <button
                onClick={handleConnect}
                disabled={!apiKey.trim()}
                className="w-full py-2.5 rounded-lg bg-accent text-bg text-[13px] font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Connect
              </button>
              <p className="text-[11px] text-fg4 text-center">
                Your credentials are encrypted and stored securely.
              </p>
            </div>
          )}

          {step === 'connecting' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px] text-fg2 animate-pulse">{subText}</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-fg">
                  Successfully connected to {integration.name}
                </p>
                <p className="text-[12px] text-fg3 mt-1">
                  Initial sync complete
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-lg bg-accent text-bg text-[13px] font-semibold transition-all hover:brightness-110"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Detail panel shown when clicking a connected integration */
export function IntegrationDetail({
  integration,
  onClose,
  onDisconnect,
  onSync,
}: {
  integration: Integration;
  onClose: () => void;
  onDisconnect: (name: string) => void;
  onSync: (name: string) => void;
}) {
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const records = Math.floor(Math.random() * 800) + 120;
  const minutesAgo = Math.floor(Math.random() * 55) + 2;

  const handleSync = useCallback(() => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      onSync(integration.name);
    }, 1200);
  }, [integration.name, onSync]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-line rounded-xl w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-line">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{
              background: `color-mix(in srgb, ${integration.color} 16%, transparent)`,
              color: integration.color,
            }}
          >
            {integration.abbr}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-fg">{integration.name}</p>
            <p className="text-[11px] text-fg4">{integration.cat}</p>
          </div>
          <button onClick={onClose} className="text-fg4 hover:text-fg transition-colors shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-2 rounded-lg p-3">
              <p className="text-[10px] font-medium text-fg4 uppercase tracking-wider">Last Sync</p>
              <p className="text-[14px] font-semibold text-fg mt-1">{minutesAgo}m ago</p>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <p className="text-[10px] font-medium text-fg4 uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <p className="text-[14px] font-semibold text-success">Healthy</p>
              </div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <p className="text-[10px] font-medium text-fg4 uppercase tracking-wider">Records</p>
              <p className="text-[14px] font-semibold text-fg mt-1">{records.toLocaleString()}</p>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <p className="text-[10px] font-medium text-fg4 uppercase tracking-wider">Sync Rate</p>
              <p className="text-[14px] font-semibold text-fg mt-1">Every 15m</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 py-2.5 rounded-lg bg-accent text-bg text-[13px] font-semibold transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync Now'
              )}
            </button>
            {!showDisconnectConfirm ? (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="px-4 py-2.5 rounded-lg border border-line text-fg2 text-[13px] font-medium hover:border-error hover:text-error transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    onDisconnect(integration.name);
                    onClose();
                  }}
                  className="px-3 py-2.5 rounded-lg bg-error text-white text-[13px] font-semibold transition-all hover:brightness-110"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="px-3 py-2.5 rounded-lg border border-line text-fg3 text-[13px] hover:text-fg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Gear dropdown for connected integrations */
export function GearDropdown({
  onSettings,
  onDisconnect,
  onClose,
}: {
  onSettings: () => void;
  onDisconnect: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div
      className="absolute right-0 top-8 z-40 bg-surface-2 border border-line rounded-lg shadow-xl py-1 min-w-[140px]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => { onSettings(); onClose(); }}
        className="w-full text-left px-3 py-2 text-[12px] text-fg2 hover:bg-surface-3 transition-colors flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M13.4 10a1.1 1.1 0 0 0 .2 1.2l.04.04a1.34 1.34 0 1 1-1.9 1.9l-.04-.04a1.1 1.1 0 0 0-1.2-.2 1.1 1.1 0 0 0-.67 1.01v.11a1.34 1.34 0 0 1-2.68 0v-.06A1.1 1.1 0 0 0 6.43 12.8a1.1 1.1 0 0 0-1.2.2l-.04.04a1.34 1.34 0 1 1-1.9-1.9l.04-.04a1.1 1.1 0 0 0 .2-1.2 1.1 1.1 0 0 0-1.01-.67h-.11a1.34 1.34 0 0 1 0-2.68h.06A1.1 1.1 0 0 0 3.2 6.43a1.1 1.1 0 0 0-.2-1.2l-.04-.04a1.34 1.34 0 1 1 1.9-1.9l.04.04a1.1 1.1 0 0 0 1.2.2h.05a1.1 1.1 0 0 0 .67-1.01v-.11a1.34 1.34 0 0 1 2.68 0v.06a1.1 1.1 0 0 0 .67 1.01 1.1 1.1 0 0 0 1.2-.2l.04-.04a1.34 1.34 0 1 1 1.9 1.9l-.04.04a1.1 1.1 0 0 0-.2 1.2v.05a1.1 1.1 0 0 0 1.01.67h.11a1.34 1.34 0 0 1 0 2.68h-.06a1.1 1.1 0 0 0-1.01.67Z" />
        </svg>
        Settings
      </button>
      <button
        onClick={() => { onDisconnect(); onClose(); }}
        className="w-full text-left px-3 py-2 text-[12px] text-error hover:bg-surface-3 transition-colors flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
        Disconnect
      </button>
    </div>
  );
}

/* Toast notification */
export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="flex items-center gap-2 bg-surface-2 border border-line rounded-xl px-4 py-3 shadow-2xl">
        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[13px] text-fg font-medium">{message}</p>
      </div>
    </div>
  );
}
