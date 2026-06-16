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

// Alles läuft über KI — keine hardcoded Filler mehr.

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
  const label = DOC_STAGES.find((s) => s.id === docStatus)?.label ?? 'Offen';

  // Load AI templates from nb-templates/ folder
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

  // Phase-Filter: WP-Dokumente bei PV-Projekten NICHT anzeigen
  const showPhase = (p: 'ANA' | 'FM' | 'WP') => {
    if (p === 'WP') return false; // WP-Dokumente nur über separaten WP-Workflow
    return phase === 'all' || p === phase;
  };

  // Filter AI templates by phase (exclude WP for PV projects)
  const filteredAiTemplates = aiTemplates.filter(t => showPhase(t.phase));

  // Group AI templates by phase
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

      // AI templates first — covers all NB. Exclude WP documents.
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
        alert(data.message || `${data.generated?.length ?? 0} Dokument(e) erzeugt`);
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch (err) {
      alert(`Upload-Fehler: ${err}`);
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
        alert(`Unterschriebene Dokumente gefunden! (${data.matched[0].signedFiles.join(', ')})`);
      } else {
        alert('Noch keine unterschriebenen Dokumente gefunden.');
      }
    } catch {
      alert('Fehler beim Prüfen.');
    }
    setBusy(false);
    router.refresh();
  }

  const hasTemplates = aiTemplates.length > 0;

  const btnClass = "px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-left disabled:opacity-50 hover:border-accent/40";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-[13px] text-fg">Dokumente</h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-[0.12em] ${docTone[docStatus]}`}>
          {label.toUpperCase()}
        </span>
      </div>
      <p className="text-[11px] text-fg3 leading-[16px]">
        {hasTemplates
          ? 'KI-ausgefüllte Formulare aus den Projektdaten + Reonic-Dokumenten. Vor dem Einreichen prüfen — Felder bleiben editierbar.'
          : 'Bitte Netzbetreiber zuweisen damit die passenden Formulare erscheinen.'}
      </p>

      {/* ── Kein NB / keine Templates → Hinweis ── */}
      {!hasTemplates && !loadingTemplates && (
        <div className="bg-warning-bg/60 border border-warning/30 rounded-lg px-3 py-2 text-[11px] text-warning">
          Kein Netzbetreiber zugewiesen oder keine Templates vorhanden. Bitte oben den VNB setzen — dann erscheinen die passenden Formulare automatisch.
        </div>
      )}

      {/* ── KI-Formulare (aus nb-templates/) ── */}
      {loadingTemplates && (
        <p className="text-[11px] text-fg4 animate-pulse">Templates laden...</p>
      )}

      {!loadingTemplates && filteredAiTemplates.length > 0 && ready && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">
            {netzbetreiber ?? 'Formulare'}
          </p>

          {aiByPhase.ANA.length > 0 && showPhase('ANA') && (
            <>
              {aiByPhase.ANA.length > 3 && (
                <p className="text-[9px] text-fg4 uppercase tracking-wider mt-1">Anmeldung</p>
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
                <p className="text-[9px] text-fg4 uppercase tracking-wider mt-1">Fertigmeldung</p>
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
              <p className="text-[9px] text-fg4 uppercase tracking-wider mt-1">Wärmepumpe</p>
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

      {/* ── Bereits generierte Dokumente (nur KI, keine alten hardcoded) ── */}
      {documents.filter(d => d.form.startsWith('ai:')).length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-2 mt-1">
          <p className="text-[10px] font-medium text-fg3 tracking-wide uppercase">Generierte Dokumente</p>
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
              <span className="text-accent font-medium shrink-0">Prüfen &amp; Bearbeiten &rarr;</span>
            </a>
          );
          })}
        </div>
      )}

      {/* ── Workflow-Buttons ── */}
      {docStatus === 'pruefen' && (
        <button onClick={async () => {
          setBusy(true);
          await post({ offerId, docStatus: 'freigegeben' });
          setBusy(false);
          // WhatsApp an Jan (Elektriker)
          const signUrl = `${window.location.origin}/sign`;
          const msg = `Hi Jan, neue Dokumente zum Unterschreiben bereit: ${signUrl}`;
          window.open(`https://wa.me/4917661714746?text=${encodeURIComponent(msg)}`, '_blank');
          router.refresh();
        }} disabled={busy} className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs disabled:opacity-50">
          &#x2713; Freigeben &amp; an Jan senden
        </button>
      )}
      {docStatus === 'freigegeben' && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-fg3">Freigegeben — wartet auf Jans Unterschrift.</p>
          <a href="https://wa.me/4917661714746?text=Hi%20Jan%2C%20Erinnerung%3A%20Dokumente%20warten%20auf%20deine%20Unterschrift%20%F0%9F%91%89%20https%3A%2F%2Fbirdie-demo.vercel.app%2Fsign"
            target="_blank" rel="noopener noreferrer"
            className="px-3.5 py-2 bg-surface-2 border border-line-2 text-fg rounded-lg font-medium text-xs text-center hover:border-accent/40">
            Jan nochmal erinnern (WhatsApp)
          </a>
        </div>
      )}
      {docStatus === 'hochgeladen' && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-fg3">Wartet auf Unterschrift vom Elektriker — wird automatisch erkannt.</p>
          <button onClick={checkSigned} disabled={busy} className={btnClass}>
            Jetzt prüfen
          </button>
        </div>
      )}
      {docStatus === 'unterschrieben' && (
        <p className="text-[11px] text-fg3">Unterschrieben — Bot reicht beim Netzbetreiber ein.</p>
      )}
    </div>
  );
}
