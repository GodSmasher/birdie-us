'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DOC_STAGES, type DocStatus, type GeneratedDoc } from '@/app/lib/netzanmeldung';

const docTone: Record<DocStatus, string> = {
  offen: 'bg-surface-3 text-fg2',
  pruefen: 'bg-warning-bg text-warning',
  freigegeben: 'bg-info-bg text-info',
  eingereicht: 'bg-success-bg text-success',
};

async function post(body: Record<string, unknown>) {
  await fetch('/api/netzanmeldung', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}

// TEN-spezifische Formulare (Thüringer Energienetze)
const TEN_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'an005', label: 'Antragstellung EZA+Speicher', phase: 'ANA' },
  { form: 'ans',   label: 'Anmeldung Formblatt Strom',   phase: 'ANA' },
  { form: 'an002', label: 'Inbetriebsetzungsprotokoll',  phase: 'FM' },
];

// Sachsen Netze — NB-spezifische Formulare
const SN_FORMS: { form: string; label: string; phase: 'ANA' | 'FM'; needsBat?: boolean }[] = [
  { form: 'sn-eza',      label: 'Datenblatt Erzeugungsanlage',    phase: 'ANA' },
  { form: 'sn-speicher', label: 'Datenblatt Stromspeicher',       phase: 'ANA', needsBat: true },
  { form: 'sn-svr',      label: 'Steuerbare VE (§14a)',           phase: 'ANA', needsBat: true },
  { form: 'sn-ibn',      label: 'Inbetriebsetzungsprotokoll NS',  phase: 'FM' },
];

export function DocActions({
  offerId,
  ready,
  hasBattery,
  netzbetreiber,
  docStatus = 'offen',
  documents = [],
}: {
  offerId: string;
  ready: boolean;
  hasBattery: boolean;
  netzbetreiber?: string;
  docStatus?: DocStatus;
  documents?: GeneratedDoc[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const label = DOC_STAGES.find((s) => s.id === docStatus)?.label ?? 'Offen';

  const isTEN = netzbetreiber?.toUpperCase().includes('TEN') || netzbetreiber?.toLowerCase().includes('thüringer energienetze');
  const isSN = netzbetreiber?.toLowerCase().includes('sachsen netze') || netzbetreiber?.toLowerCase().includes('sachsennetze');

  async function generate(form: string) {
    setBusy(true);
    await post({ offerId, recordDraft: form });
    window.open(`/api/netzanmeldung/document?offerId=${offerId}&form=${form}`, '_blank', 'noopener');
    setBusy(false);
    router.refresh();
  }

  async function advance(next: DocStatus) {
    setBusy(true);
    await post({ offerId, docStatus: next });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-[13px] text-fg">Dokumente</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.12em] ${docTone[docStatus]}`}>
          {label.toUpperCase()}
        </span>
      </div>
      <p className="text-[11px] text-fg3 leading-[16px]">
        VDE-AR-N 4105 vorausgefüllt aus den Projektdaten. Vor dem Einreichen prüfen — Felder bleiben editierbar.
      </p>

      {ready ? (
        <button onClick={() => generate('e2')} disabled={busy} className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs text-center disabled:opacity-50">
          E.2 Anmeldung erzeugen ⤓
        </button>
      ) : (
        <button disabled className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs opacity-40 cursor-not-allowed">
          E.2 erzeugen (Daten fehlen)
        </button>
      )}
      {hasBattery && (
        <button onClick={() => generate('e3')} disabled={busy} className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-center disabled:opacity-50">
          E.3 Speicher erzeugen ⤓
        </button>
      )}

      {/* NB-spezifische Formulare */}
      {isTEN && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">TEN-Formulare</p>
          {TEN_FORMS.map((f) => (
            <button
              key={f.form}
              onClick={() => generate(f.form)}
              disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40"
            >
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSN && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Sachsen Netze</p>
          {SN_FORMS.filter((f) => !f.needsBat || hasBattery).map((f) => (
            <button
              key={f.form}
              onClick={() => generate(f.form)}
              disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40"
            >
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-line pt-2 mt-1">
          {documents.map((d) => (
            <a
              key={d.form}
              href={`/api/netzanmeldung/document?offerId=${offerId}&form=${d.form}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 text-[11px] text-fg3 hover:text-fg"
            >
              <span>
                {d.form.toUpperCase()} · {new Date(d.at).toLocaleDateString('de-DE')}
                {d.source === 'bot' && <span className="ml-1 text-purple">· Bot</span>}
                {d.draftRef && <span className="ml-1 text-fg4">#{d.draftRef}</span>}
              </span>
              <span className="text-accent">ansehen ↗</span>
            </a>
          ))}
        </div>
      )}

      {docStatus === 'pruefen' && (
        <button onClick={() => advance('freigegeben')} disabled={busy} className="px-3.5 py-2 bg-info-bg text-info rounded-lg font-semibold text-xs disabled:opacity-50">
          ✓ Prüfen &amp; freigeben
        </button>
      )}
      {docStatus === 'freigegeben' && (
        <button onClick={() => advance('eingereicht')} disabled={busy} className="px-3.5 py-2 bg-success-bg text-success rounded-lg font-semibold text-xs disabled:opacity-50">
          Als eingereicht markieren
        </button>
      )}
    </div>
  );
}
