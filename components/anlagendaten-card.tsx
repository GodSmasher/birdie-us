'use client';

import { useState } from 'react';

interface ProjectRow {
  label: string;
  value: string;
  enrichedValue?: string;
  source?: string;
}

export function AnlagendatenCard({ offerId, rows, hasDocs }: {
  offerId: string;
  rows: ProjectRow[];
  hasDocs: boolean;
}) {
  const [enriched, setEnriched] = useState<Record<string, { value: string; source: string }>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const FIELD_MAP: Record<string, string[]> = {
    'Anlagengröße': ['kwp'],
    'Module': ['modulTyp', 'moduleCount'],
    'Wechselrichter': ['wechselrichterTyp'],
    'WR Nennleistung': ['anschlussLeistungKw'],
    'Speicher': ['speicherKwh'],
    'Adresse': ['adresse'],
    'Jahresverbrauch': ['jahresverbrauch'],
    'Zählernummer': ['zaehlerNummer'],
    'NB-Referenz': ['netzbetreiberRefNr'],
    'IBAN': ['iban'],
    'Eigentümer': ['grundstueckseigentuemer'],
    'Einspeisezusage': ['einspeiseZusage'],
    'MaStR-Nr.': ['mastrNummer'],
    'Flurstück': ['flurstuck'],
  };

  const enrich = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/netzanmeldung/files?offerId=${offerId}&enrich=1`);
      const json = await res.json();
      if (json.extracted) {
        const mapped: Record<string, { value: string; source: string }> = {};
        const ext = json.extracted as Record<string, unknown>;
        const sources = (json.sources || []) as string[];

        // Map extracted fields to display labels
        if (ext.kwp) mapped['Anlagengröße'] = { value: `${ext.kwp} kWp`, source: findSource(sources, 'kwp') };
        if (ext.speicherKwh) mapped['Speicher'] = { value: `${ext.speicherKwh} kWh`, source: findSource(sources, 'speicherKwh') };
        if (ext.wechselrichterTyp) mapped['Wechselrichter'] = { value: String(ext.wechselrichterTyp), source: findSource(sources, 'wechselrichterTyp') };
        if (ext.anschlussLeistungKw) mapped['WR Nennleistung'] = { value: `${ext.anschlussLeistungKw} kW`, source: findSource(sources, 'anschlussLeistungKw') };
        if (ext.modulTyp) mapped['Module'] = { value: String(ext.modulTyp), source: findSource(sources, 'modulTyp') };
        if (ext.zaehlerNummer) mapped['Zählernummer'] = { value: String(ext.zaehlerNummer), source: findSource(sources, 'zaehlerNummer') };
        if (ext.netzbetreiberRefNr) mapped['NB-Referenz'] = { value: String(ext.netzbetreiberRefNr), source: findSource(sources, 'netzbetreiberRefNr') };
        if (ext.iban) mapped['IBAN'] = { value: String(ext.iban), source: findSource(sources, 'iban') };
        if (ext.grundstueckseigentuemer) mapped['Eigentümer'] = { value: String(ext.grundstueckseigentuemer), source: findSource(sources, 'grundstueckseigentuemer') };
        if (ext.einspeiseZusage != null) mapped['Einspeisezusage'] = { value: ext.einspeiseZusage ? '✅ Bestätigt' : '❌ Nein', source: findSource(sources, 'einspeiseZusage') };
        if (ext.mastrNummer) mapped['MaStR-Nr.'] = { value: String(ext.mastrNummer), source: findSource(sources, 'mastrNummer') };
        if (ext.flurstuck) mapped['Flurstück'] = { value: String(ext.flurstuck), source: findSource(sources, 'flurstuck') };

        setEnriched(mapped);
        setDone(true);
        // Reload page after 1s so Vollständigkeits-Check and forms update
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch { /* best effort */ }
    setLoading(false);
  };

  function findSource(sources: string[], key: string): string {
    const match = sources.find((s) => s.startsWith(key));
    return match?.split('←')[1]?.trim() ?? '';
  }

  // Merge rows: original + enriched extras
  const displayRows = [...rows];
  const existingLabels = new Set(rows.map((r) => r.label));

  // Add enriched values to existing rows
  const mergedRows = displayRows.map((r) => {
    const e = enriched[r.label];
    if (e && (r.value === '—' || r.value === 'keiner')) {
      return { ...r, value: e.value, source: e.source };
    }
    return r;
  });

  // Add new rows from enriched that don't exist yet
  const extraRows: ProjectRow[] = [];
  for (const [label, e] of Object.entries(enriched)) {
    if (!existingLabels.has(label)) {
      extraRows.push({ label, value: e.value, source: e.source });
    }
  }

  return (
    <div className="flex-1 min-w-0 p-4 lg:p-5 flex flex-col gap-3 bg-surface border border-line rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[13px] text-fg">Anlagendaten</h3>
        {hasDocs && !done && (
          <button
            onClick={enrich}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent text-bg rounded-lg text-[10px] font-medium hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? (
              <><div className="w-2.5 h-2.5 border-[1.5px] border-bg border-t-transparent rounded-full animate-spin" /> Analysiere...</>
            ) : (
              <>✨ Aus Dokumenten ergänzen</>
            )}
          </button>
        )}
        {done && <span className="text-[10px] text-success font-medium">✓ Ergänzt</span>}
      </div>
      <div className="flex flex-col gap-2 text-xs">
        {mergedRows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-2 min-h-[24px]">
            <span className="text-fg3">{r.label}</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-right ${r.source ? 'text-accent font-medium' : 'text-fg'}`}>{r.value}</span>
              {r.source && (
                <span className="text-[9px] text-accent/60 shrink-0" title={r.source}>📄</span>
              )}
            </div>
          </div>
        ))}
        {extraRows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-2 min-h-[24px] border-t border-line/50 pt-1.5">
            <span className="text-fg3">{r.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-accent font-medium text-right">{r.value}</span>
              <span className="text-[9px] text-accent/60 shrink-0" title={r.source}>📄</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
