'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DOC_STAGES, type DocStatus, type GeneratedDoc } from '@/app/lib/netzanmeldung';

const docTone: Record<DocStatus, string> = {
  offen: 'bg-surface-3 text-fg2',
  pruefen: 'bg-warning-bg text-warning',
  freigegeben: 'bg-info-bg text-info',
  hochgeladen: 'bg-accent/10 text-accent',
  unterschrieben: 'bg-accent/20 text-accent',
  eingereicht: 'bg-success-bg text-success',
};

const statusLabel: Record<DocStatus, string> = {
  offen: 'Open',
  pruefen: 'In Review',
  freigegeben: 'Approved',
  hochgeladen: 'Uploaded',
  unterschrieben: 'Signed',
  eingereicht: 'Submitted',
};

async function post(body: Record<string, unknown>) {
  await fetch('/api/netzanmeldung', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}

interface TemplateInfo {
  path: string;
  label: string;
  phase: 'ANA' | 'FM' | 'WP';
}

const phaseLabel: Record<string, string> = {
  ANA: 'Application',
  FM: 'Completion Notice',
  WP: 'Heat Pump',
};

export function DocActions({
  offerId,
  ready,
  hasBattery,
  netzbetreiber,
  docStatus = 'offen',
  documents = [],
  phase = 'all',
}: {
  offerId: string;
  ready: boolean;
  hasBattery: boolean;
  netzbetreiber?: string;
  docStatus?: DocStatus;
  documents?: GeneratedDoc[];
  phase?: 'ANA' | 'FM' | 'all';
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [aiTemplates, setAiTemplates] = useState<TemplateInfo[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const label = statusLabel[docStatus] ?? 'Open';

  useEffect(() => {
    if (!netzbetreiber) return;
    setLoadingTemplates(true);
    fetch(`/api/netzanmeldung/templates?nb=${encodeURIComponent(netzbetreiber)}`)
      .then(r => r.json())
      .then(data => {
        setAiTemplates(data.templates ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, [netzbetreiber]);

  const showPhase = (p: 'ANA' | 'FM' | 'WP') => {
    if (p === 'WP') return false;
    return phase === 'all' || p === phase;
  };

  const filteredAiTemplates = aiTemplates.filter(t => showPhase(t.phase));

  const aiByPhase = {
    ANA: filteredAiTemplates.filter(t => t.phase === 'ANA'),
    FM: filteredAiTemplates.filter(t => t.phase === 'FM'),
    WP: filteredAiTemplates.filter(t => t.phase === 'WP'),
  };

  async function generate(form: string) {
    setBusy(true);
    await post({ offerId, recordDraft: form });
    window.open(`/api/netzanmeldung/document?offerId=${offerId}&form=${encodeURIComponent(form)}`, '_blank', 'noopener');
    setBusy(false);
    router.refresh();
  }

  async function approveAndUpload() {
    setBusy(true);
    try {
      await post({ offerId, docStatus: 'freigegeben' });

      const forms: string[] = [];
      const relevantAi = aiTemplates.filter(t => {
        if (t.phase === 'WP') return false;
        return phase === 'all' || t.phase === phase;
      });

      if (relevantAi.length > 0) {
        forms.push(...relevantAi.map(t => `ai:${t.path}`));
      }

      const res = await fetch('/api/netzanmeldung/pcloud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, forms }),
      });
      const data = await res.json();
      if (data.ok) {
        alert(data.message || `${data.generated?.length ?? 0} document(s) generated`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Upload error: ${err}`);
    }
    setBusy(false);
    router.refresh();
  }

  async function checkSigned() {
    setBusy(true);
    try {
      const res = await fetch(`/api/netzanmeldung/pcloud?offerId=${offerId}`);
      const data = await res.json();
      if (data.matched?.length > 0) {
        alert(`Signed documents found! (${data.matched[0].signedFiles.join(', ')})`);
      } else {
        alert('No signed documents found yet.');
      }
    } catch {
      alert('Error checking signatures.');
    }
    setBusy(false);
    router.refresh();
  }

  const hasTemplates = aiTemplates.length > 0;

  const btnClass = "px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-[13px] text-fg">Documents</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.12em] ${docTone[docStatus]}`}>
          {label.toUpperCase()}
        </span>
      </div>
      <p className="text-[11px] text-fg3 leading-[16px]">
        {hasTemplates
          ? 'AI-filled forms from project data + CRM documents. Review before submitting — fields remain editable.'
          : 'Please assign a utility so the correct forms appear.'}
      </p>

      {!hasTemplates && !loadingTemplates && (
        <div className="bg-warning-bg/60 border border-warning/30 rounded-lg px-3 py-2 text-[11px] text-warning">
          No utility assigned or no templates available. Please set the utility above — the correct forms will appear automatically.
        </div>
      )}

      {loadingTemplates && (
        <p className="text-[11px] text-fg4 animate-pulse">Loading templates...</p>
      )}

      {!loadingTemplates && filteredAiTemplates.length > 0 && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">
            {netzbetreiber ?? 'Forms'}
          </p>

          {aiByPhase.ANA.length > 0 && showPhase('ANA') && (
            <>
              {aiByPhase.ANA.length > 3 && (
                <p className="text-[9px] text-fg4 uppercase tracking-wider mt-1">{phaseLabel.ANA}</p>
              )}
              {aiByPhase.ANA.map((t) => (
                <button key={t.path} onClick={() => generate(`ai:${t.path}`)} disabled={busy} className={btnClass}>
                  <span className="text-fg2">{t.label}</span>
                  <span className="ml-1.5 text-[10px] text-fg4">({t.phase})</span>
                  <span className="float-right text-accent">&#x2913;</span>
                </button>
              ))}
            </>
          )}

          {aiByPhase.FM.length > 0 && showPhase('FM') && (
            <>
              {filteredAiTemplates.length > 3 && (
                <p className="text-[9px] text-fg4 uppercase tracking-wider mt-1">{phaseLabel.FM}</p>
              )}
              {aiByPhase.FM.map((t) => (
                <button key={t.path} onClick={() => generate(`ai:${t.path}`)} disabled={busy} className={btnClass}>
                  <span className="text-fg2">{t.label}</span>
                  <span className="ml-1.5 text-[10px] text-fg4">({t.phase})</span>
                  <span className="float-right text-accent">&#x2913;</span>
                </button>
              ))}
            </>
          )}

          {aiByPhase.WP.length > 0 && (
            <>
              <p className="text-[9px] text-fg4 uppercase tracking-wider mt-1">{phaseLabel.WP}</p>
              {aiByPhase.WP.map((t) => (
                <button key={t.path} onClick={() => generate(`ai:${t.path}`)} disabled={busy} className={btnClass}>
                  <span className="text-fg2">{t.label}</span>
                  <span className="ml-1.5 text-[10px] text-fg4">({t.phase})</span>
                  <span className="float-right text-accent">&#x2913;</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {documents.filter(d => d.form.startsWith('ai:')).length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Generated Documents</p>
          {documents.filter(d => d.form.startsWith('ai:')).map((d) => {
            const cleanLabel = d.form.slice(3).split('/').pop()?.replace('.pdf', '').replace(/_/g, ' ') ?? d.form;
            const editPath = `/netzanmeldung/${offerId}/edit?form=${encodeURIComponent(d.form)}`;
            return (
            <a
              key={d.form + d.at}
              href={editPath}
              className="flex items-center justify-between px-3 py-2 bg-surface-2 border border-line-2 rounded-lg text-xs hover:border-accent/40"
            >
              <span className="text-fg2 truncate">{cleanLabel.slice(0, 42)}</span>
              <span className="text-accent font-medium shrink-0">Review &amp; Edit &rarr;</span>
            </a>
          );
          })}
        </div>
      )}

      {docStatus === 'pruefen' && (
        <button onClick={async () => {
          setBusy(true);
          await post({ offerId, docStatus: 'freigegeben' });
          setBusy(false);
          const signUrl = `${window.location.origin}/sign`;
          const msg = `New documents ready for signing: ${signUrl}`;
          window.open(`https://wa.me/4917661714746?text=${encodeURIComponent(msg)}`, '_blank');
          router.refresh();
        }} disabled={busy} className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs disabled:opacity-50">
          &#x2713; Approve &amp; send to electrician
        </button>
      )}
      {docStatus === 'freigegeben' && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-fg3">Approved — waiting for electrician&apos;s signature.</p>
          <a href="https://wa.me/4917661714746?text=Reminder%3A%20Documents%20waiting%20for%20your%20signature%20%F0%9F%91%89%20https%3A%2F%2Fbirdie-demo.vercel.app%2Fsign"
            target="_blank" rel="noopener noreferrer"
            className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-center hover:border-accent/40">
            Send reminder (WhatsApp)
          </a>
        </div>
      )}
      {docStatus === 'hochgeladen' && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-fg3">Waiting for electrician&apos;s signature — detected automatically.</p>
          <button onClick={checkSigned} disabled={busy} className={btnClass}>
            Check now
          </button>
        </div>
      )}
      {docStatus === 'unterschrieben' && (
        <p className="text-[11px] text-fg3">Signed — bot will submit to the utility.</p>
      )}
    </div>
  );
}
