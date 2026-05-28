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

// Netze Magdeburg — NB-spezifische Formulare
const NM_FORMS: { form: string; label: string; phase: 'ANA' | 'FM'; needsBat?: boolean }[] = [
  { form: 'nm-db',   label: 'Datenblatt EZA+Speicher',    phase: 'ANA' },
  { form: 'nm-e2',   label: 'E.2 Anmeldung EZA',          phase: 'ANA' },
  { form: 'nm-e3',   label: 'E.3 Datenblatt Speicher',    phase: 'ANA', needsBat: true },
  { form: 'nm-e8',   label: 'E.8 Inbetriebsetzung',       phase: 'FM' },
  { form: 'nm-inbe', label: 'PV-Inbetriebnahme',          phase: 'FM' },
];

// Sachsen Netze — NB-spezifische Formulare
const SN_FORMS: { form: string; label: string; phase: 'ANA' | 'FM'; needsBat?: boolean }[] = [
  { form: 'sn-eza',      label: 'Datenblatt Erzeugungsanlage',    phase: 'ANA' },
  { form: 'sn-speicher', label: 'Datenblatt Stromspeicher',       phase: 'ANA', needsBat: true },
  { form: 'sn-svr',      label: 'Steuerbare VE (§14a)',           phase: 'ANA', needsBat: true },
  { form: 'sn-ibn',      label: 'Inbetriebsetzungsprotokoll NS',  phase: 'FM' },
];

// Werra Energie
const WE_FORMS: { form: string; label: string; phase: 'ANA' | 'FM'; needsBat?: boolean }[] = [
  { form: 'we-e2', label: 'E.2 Datenblatt EZA',   phase: 'ANA' },
  { form: 'we-e3', label: 'E.3 Datenblatt Speicher', phase: 'ANA', needsBat: true },
  { form: 'we-e8', label: 'E.8 Inbetriebsetzung',  phase: 'FM' },
];

// SW Ilmenau
const SWI_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'swi-f2', label: 'F.2 Datenblatt EZA', phase: 'ANA' },
];

// SWW Wunsiedel
const SWW_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'sww-ibn', label: 'Inbetriebsetzungsprotokoll', phase: 'FM' },
];

// SW Quedlinburg
const SWQ_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'swq-pv', label: 'Datenblatt PV-Anlagen', phase: 'ANA' },
];

// SW Merseburg
const SWM_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'swm-ana', label: 'Anmeldung Strom',      phase: 'ANA' },
  { form: 'swm-db',  label: 'Datenblatt EEA',        phase: 'ANA' },
  { form: 'swm-iba', label: 'Inbetriebsetzung',      phase: 'FM' },
];

// SW Weißenfels
const SWE_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'swe-ana', label: 'Anmeldung Strom',  phase: 'ANA' },
  { form: 'swe-db',  label: 'Datenblatt EEA',    phase: 'ANA' },
];

// SW Schkeuditz
const SWSK_FORMS: { form: string; label: string; phase: 'ANA' | 'FM'; needsBat?: boolean }[] = [
  { form: 'swsk-speicher', label: 'Datenblatt Speicher', phase: 'ANA', needsBat: true },
];

// SW Münchberg
const SWMB_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'swmb-pv',  label: 'Datenerfassung PV',    phase: 'ANA' },
  { form: 'swmb-ibn', label: 'Inbetriebsetzung EZA', phase: 'FM' },
];

// Greizer Energienetze
const GRE_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'gre-ana',  label: 'Anmeldung Netzanschluss', phase: 'ANA' },
  { form: 'gre-wp',   label: 'Datenblatt Wärmepumpe',   phase: 'ANA' },
  { form: 'gre-14a',  label: 'Anmeldung §14a sVE',      phase: 'ANA' },
];

// Zwickau
const ZW_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'zw-wp', label: 'Datenblatt Wärmepumpe', phase: 'ANA' },
];

// Redinet Burgenland
const RED_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'red-wp', label: 'Datenblatt WPA', phase: 'ANA' },
];

// SW Velten
const SWV_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'swv-fm', label: 'Fertigmeldung Strom', phase: 'FM' },
];

// EWP Potsdam
const EWP_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'ewp-pv', label: 'Datenerfassung PV', phase: 'ANA' },
];

// SW Eilenburg
const SEI_FORMS: { form: string; label: string; phase: 'ANA' | 'FM' }[] = [
  { form: 'sei-ana', label: 'Anmeldung Strom (PV)', phase: 'ANA' },
  { form: 'sei-wp',  label: 'Anmeldung Strom (WP)', phase: 'ANA' },
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

  const isTEN = /\bTEN\b/.test(netzbetreiber ?? '') || netzbetreiber?.toLowerCase().includes('thüringer energienetze');
  const isSN = netzbetreiber?.toLowerCase().includes('sachsen netze') || netzbetreiber?.toLowerCase().includes('sachsennetze');
  const isNM = netzbetreiber?.toLowerCase().includes('netze magdeburg') || netzbetreiber?.toLowerCase().includes('netzmagdeburg');
  const isWE = netzbetreiber?.toLowerCase().includes('werra energie') || netzbetreiber?.toLowerCase().includes('werraenergie');
  const isSWI = netzbetreiber?.toLowerCase().includes('ilmenau');
  const isSWW = netzbetreiber?.toLowerCase().includes('wunsiedel');
  const isSWQ = netzbetreiber?.toLowerCase().includes('quedlinburg');
  const isSWM = netzbetreiber?.toLowerCase().includes('merseburg');
  const isSWE = netzbetreiber?.toLowerCase().includes('weißenfels') || netzbetreiber?.toLowerCase().includes('weissenfels');
  const isSWSK = netzbetreiber?.toLowerCase().includes('schkeuditz');
  const isSWMB = netzbetreiber?.toLowerCase().includes('münchberg') || netzbetreiber?.toLowerCase().includes('muenchberg');
  const isGRE = netzbetreiber?.toLowerCase().includes('greizer') || netzbetreiber?.toLowerCase().includes('greiz');
  const isZW = netzbetreiber?.toLowerCase().includes('zwickau');
  const isRED = netzbetreiber?.toLowerCase().includes('redinet') || netzbetreiber?.toLowerCase().includes('burgenland');
  const isSWV = netzbetreiber?.toLowerCase().includes('velten');
  const isEWP = netzbetreiber?.toLowerCase().includes('potsdam') || netzbetreiber?.toLowerCase().includes('ewp');
  const isSEI = netzbetreiber?.toLowerCase().includes('eilenburg');

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

  // NB-spezifische Formulare vorhanden → generische E.2/E.3 ausblenden
  const hasNbForms = isTEN || isSN || isNM || isWE || isSWI || isSWW || isSWQ || isSWM || isSWE || isSWSK || isSWMB || isGRE || isZW || isRED || isSWV || isEWP || isSEI;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-[13px] text-fg">Dokumente</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.12em] ${docTone[docStatus]}`}>
          {label.toUpperCase()}
        </span>
      </div>
      <p className="text-[11px] text-fg3 leading-[16px]">
        {hasNbForms
          ? 'NB-spezifische Formulare vorausgefüllt aus den Projektdaten. Vor dem Einreichen prüfen — Felder bleiben editierbar.'
          : 'VDE-AR-N 4105 vorausgefüllt aus den Projektdaten. Vor dem Einreichen prüfen — Felder bleiben editierbar.'}
      </p>

      {!hasNbForms && (ready ? (
        <button onClick={() => generate('e2')} disabled={busy} className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs text-center disabled:opacity-50">
          E.2 Anmeldung erzeugen ⤓
        </button>
      ) : (
        <button disabled className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs opacity-40 cursor-not-allowed">
          E.2 erzeugen (Daten fehlen)
        </button>
      ))}
      {!hasNbForms && hasBattery && (
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
      {isNM && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Netze Magdeburg</p>
          {NM_FORMS.filter((f) => !f.needsBat || hasBattery).map((f) => (
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
      {isWE && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Werra Energie</p>
          {WE_FORMS.filter((f) => !f.needsBat || hasBattery).map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWI && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Ilmenau</p>
          {SWI_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWW && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SWW Wunsiedel</p>
          {SWW_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWQ && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Quedlinburg</p>
          {SWQ_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWM && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Merseburg</p>
          {SWM_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWE && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Weißenfels</p>
          {SWE_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWSK && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Schkeuditz</p>
          {SWSK_FORMS.filter((f) => !f.needsBat || hasBattery).map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWMB && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Münchberg</p>
          {SWMB_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isGRE && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Greizer Energienetze</p>
          {GRE_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isZW && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Zwickauer Energieversorgung</p>
          {ZW_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isRED && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Redinet Burgenland</p>
          {RED_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSWV && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Velten</p>
          {SWV_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isEWP && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">EWP Potsdam</p>
          {EWP_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
              <span className="text-fg2">{f.label}</span>
              <span className="ml-1.5 text-[10px] text-fg4">({f.phase})</span>
              <span className="float-right text-accent">⤓</span>
            </button>
          ))}
        </div>
      )}
      {isSEI && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">SW Eilenburg</p>
          {SEI_FORMS.map((f) => (
            <button key={f.form} onClick={() => generate(f.form)} disabled={busy}
              className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40">
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
