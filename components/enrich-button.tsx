'use client';

import { useState } from 'react';

interface EnrichedData {
  zaehlerNummer?: string;
  mastrNummer?: string;
  anschlussLeistungKw?: number;
  einspeiseZusage?: boolean;
  netzbetreiberRefNr?: string;
  grundstueckseigentuemer?: string;
  iban?: string;
  kwp?: number;
  speicherKwh?: number;
  wechselrichterTyp?: string;
  modulTyp?: string;
  [key: string]: unknown;
}

const FIELD_LABELS: Record<string, string> = {
  zaehlerNummer: 'Meter Number',
  mastrNummer: 'MaStR Number',
  anschlussLeistungKw: 'Connection Capacity (kW)',
  einspeiseZusage: 'Feed-in Commitment',
  netzbetreiberRefNr: 'Utility Ref. Number',
  grundstueckseigentuemer: 'Property Owner',
  iban: 'IBAN',
  kwp: 'System Size (kW DC)',
  speicherKwh: 'Battery (kWh)',
  wechselrichterTyp: 'Inverter',
  modulTyp: 'Module Type',
  flurstuck: 'Parcel Number',
};

export function EnrichButton({ offerId, hasMissing }: { offerId: string; hasMissing: boolean }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EnrichedData | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [error, setError] = useState('');

  const enrich = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/netzanmeldung/files?offerId=${offerId}&enrich=1`);
      const json = await res.json();
      if (json.extracted) {
        setData(json.extracted);
        setSources(json.sources || []);
      } else {
        setError('No data extracted');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (data) {
    const entries = Object.entries(data).filter(([, v]) => v != null && v !== '');
    if (entries.length === 0) return <p className="text-[11px] text-fg3">No additional data found in documents.</p>;

    // Group into "System Data" (technical) and "Additional Data" (admin)
    const techFields = ['kwp', 'speicherKwh', 'wechselrichterTyp', 'modulTyp', 'anschlussLeistungKw'];
    const techEntries = entries.filter(([k]) => techFields.includes(k));
    const adminEntries = entries.filter(([k]) => !techFields.includes(k));

    return (
      <div className="flex flex-col gap-3 mt-2">
        {/* Technical data - show prominently as they fill missing fields */}
        {techEntries.length > 0 && (
          <div className="p-3 bg-success-bg/30 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📋</span>
              <span className="text-[11px] font-semibold text-success">System data enriched from documents</span>
            </div>
            <div className="flex flex-col gap-2">
              {techEntries.map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[12px] text-fg2">{FIELD_LABELS[key] ?? key}</span>
                  <span className="text-[13px] font-semibold text-fg">{String(val)}{key === 'kwp' ? ' kW DC' : key === 'speicherKwh' ? ' kWh' : key === 'anschlussLeistungKw' ? ' kW' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin data */}
        {adminEntries.length > 0 && (
          <div className="p-3 bg-accent-bg/30 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">✨</span>
              <span className="text-[11px] font-semibold text-accent">Additional data from documents</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {adminEntries.map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[11px] text-fg3 w-[160px] shrink-0">{FIELD_LABELS[key] ?? key}</span>
                  <span className="text-[12px] font-medium text-fg">
                    {typeof val === 'boolean' ? (val ? '✅ Yes' : '❌ No') : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sources.length > 0 && (
          <span className="text-[10px] text-fg4">Sources: {sources.map((s) => s.split('←')[1]?.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2">
      {error && <p className="text-[11px] text-error mb-1">{error}</p>}
      <button
        onClick={enrich}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent text-bg rounded-lg text-[11px] font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <div className="w-3 h-3 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            AI analyzing documents...
          </>
        ) : (
          <>
            ✨ {hasMissing ? 'Fill missing data from documents' : 'Load additional data from documents'}
          </>
        )}
      </button>
    </div>
  );
}
