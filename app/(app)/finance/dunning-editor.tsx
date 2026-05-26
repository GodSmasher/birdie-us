'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, Pill } from '@/components/ui';

interface DunningTemplate {
  id: string;
  stufe: number;
  name: string;
  betreff: string;
  textHtml: string;
  textPlain: string;
  fristTage: number;
  gebuehr: number;
  aktiv: boolean;
  updatedAt: string;
}

const PLACEHOLDERS = [
  { key: 'kunde_name', label: 'Kundenname' },
  { key: 'rechnungsnummer', label: 'Rechnungsnummer' },
  { key: 'rechnungsdatum', label: 'Rechnungsdatum' },
  { key: 'betrag', label: 'Rechnungsbetrag' },
  { key: 'betrag_mit_gebuehr', label: 'Betrag inkl. Gebühren' },
  { key: 'faelligkeitsdatum', label: 'Fälligkeitsdatum' },
  { key: 'ueberfaellig_tage', label: 'Tage überfällig' },
  { key: 'gebuehr', label: 'Mahngebühr' },
  { key: 'firma_name', label: 'Firmenname' },
];

const STUFE_META: Record<number, { icon: string; tone: 'info' | 'warning' | 'error' | 'neutral' }> = {
  0: { icon: '🔔', tone: 'info' },
  1: { icon: '📅', tone: 'info' },
  2: { icon: '⚠️', tone: 'warning' },
  3: { icon: '📧', tone: 'warning' },
  4: { icon: '🔴', tone: 'error' },
  5: { icon: '⚡', tone: 'error' },
};

function fristLabel(tage: number): string {
  if (tage < 0) return `${Math.abs(tage)} Tage VOR Fälligkeit`;
  if (tage === 0) return 'Am Fälligkeitstag';
  return `${tage} Tage NACH Fälligkeit`;
}

export function DunningEditor({ initial }: { initial: DunningTemplate[] }) {
  const [templates, setTemplates] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const current = templates.find((t) => t.id === editing);
  const previewTpl = templates.find((t) => t.id === preview);

  const save = useCallback(async (tpl: DunningTemplate) => {
    setSaving(true);
    try {
      const res = await fetch('/api/dunning/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tpl.id,
          name: tpl.name,
          betreff: tpl.betreff,
          textHtml: tpl.textHtml,
          textPlain: tpl.textPlain,
          fristTage: tpl.fristTage,
          gebuehr: tpl.gebuehr,
          aktiv: tpl.aktiv,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setSaved(tpl.id);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const update = (id: string, patch: Partial<DunningTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  // Preview: replace placeholders with example values
  const exampleVars: Record<string, string> = {
    kunde_name: 'Max Mustermann',
    rechnungsnummer: 'RE-2026-0341',
    rechnungsdatum: '01.04.2026',
    betrag: '24.500',
    betrag_mit_gebuehr: '€ 24.515',
    faelligkeitsdatum: '15.05.2026',
    ueberfaellig_tage: '12',
    gebuehr: '€ 15,00',
    zahlungsziel: '01.06.2026',
    firma_name: 'Volta Energietechnik GmbH',
  };
  const renderPreview = (html: string) =>
    html.replace(/\{\{(\w+)\}\}/g, (_, key) => exampleVars[key] ?? `{{${key}}}`);

  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      {/* Timeline overview */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Mahnlauf — Zeitstrahl"
          right={<Pill label={`${templates.filter((t) => t.aktiv).length} aktiv`} tone="success" />}
        />
        <div className="flex items-center px-5 py-4 gap-1 overflow-x-auto">
          {templates.map((t, i) => {
            const meta = STUFE_META[t.stufe] ?? { icon: '📄', tone: 'neutral' as const };
            return (
              <div key={t.id} className="flex items-center">
                <button
                  onClick={() => { setEditing(editing === t.id ? null : t.id); setPreview(null); }}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all min-w-[120px] ${
                    editing === t.id
                      ? 'bg-accent/10 ring-2 ring-accent'
                      : t.aktiv
                      ? 'bg-surface-2 hover:bg-surface-3'
                      : 'bg-surface-2/50 opacity-50 hover:opacity-75'
                  }`}
                >
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-[11px] font-semibold text-fg truncate max-w-[100px]">{t.name}</span>
                  <span className="text-[10px] text-fg3">{fristLabel(t.fristTage)}</span>
                  <Pill label={t.aktiv ? 'AKTIV' : 'AUS'} tone={t.aktiv ? meta.tone : 'neutral'} dot={false} />
                </button>
                {i < templates.length - 1 && (
                  <div className="w-6 h-px bg-line mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Editor */}
      {current && (
        <Card className="overflow-hidden">
          <CardHeader
            title={`${STUFE_META[current.stufe]?.icon ?? '📄'} ${current.name} bearbeiten`}
            right={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreview(preview === current.id ? null : current.id)}
                  className="px-3 py-1.5 text-[11px] font-medium text-fg2 bg-surface-2 rounded-lg hover:bg-surface-3 transition-colors"
                >
                  {preview === current.id ? 'Vorschau schließen' : '👁 Vorschau'}
                </button>
                <button
                  onClick={() => save(current)}
                  disabled={saving}
                  className="px-3 py-1.5 text-[11px] font-medium text-bg bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Speichert…' : saved === current.id ? '✓ Gespeichert' : 'Speichern'}
                </button>
              </div>
            }
          />

          <div className="p-5 flex flex-col gap-4">
            {/* Row: Name + Aktiv toggle */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-fg3 tracking-[0.16em] mb-1 block">NAME</label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => update(current.id, { name: e.target.value })}
                  className="w-full h-9 px-3 text-[13px] text-fg bg-surface-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="w-32">
                <label className="text-[10px] font-semibold text-fg3 tracking-[0.16em] mb-1 block">GEBÜHR (€)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={current.gebuehr}
                  onChange={(e) => update(current.id, { gebuehr: parseFloat(e.target.value) || 0 })}
                  className="w-full h-9 px-3 text-[13px] text-fg bg-surface-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="w-36">
                <label className="text-[10px] font-semibold text-fg3 tracking-[0.16em] mb-1 block">FRIST (TAGE)</label>
                <input
                  type="number"
                  value={current.fristTage}
                  onChange={(e) => update(current.id, { fristTage: parseInt(e.target.value, 10) || 0 })}
                  className="w-full h-9 px-3 text-[13px] text-fg bg-surface-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                onClick={() => { update(current.id, { aktiv: !current.aktiv }); }}
                className={`h-9 px-4 rounded-lg text-[11px] font-medium transition-colors ${
                  current.aktiv
                    ? 'bg-success/10 text-success hover:bg-success/20'
                    : 'bg-surface-2 text-fg3 hover:bg-surface-3'
                }`}
              >
                {current.aktiv ? '✓ Aktiv' : '○ Inaktiv'}
              </button>
            </div>

            {/* Subject */}
            <div>
              <label className="text-[10px] font-semibold text-fg3 tracking-[0.16em] mb-1 block">BETREFF</label>
              <input
                type="text"
                value={current.betreff}
                onChange={(e) => update(current.id, { betreff: e.target.value })}
                className="w-full h-9 px-3 text-[13px] text-fg bg-surface-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Body HTML */}
            <div>
              <label className="text-[10px] font-semibold text-fg3 tracking-[0.16em] mb-1 block">E-MAIL TEXT (HTML)</label>
              <textarea
                value={current.textHtml}
                onChange={(e) => update(current.id, { textHtml: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 text-[13px] text-fg bg-surface-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono leading-relaxed resize-y"
              />
            </div>

            {/* Placeholders help */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-fg3 font-semibold tracking-[0.16em] self-center mr-1">PLATZHALTER:</span>
              {PLACEHOLDERS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    const tag = `{{${p.key}}}`;
                    update(current.id, { textHtml: current.textHtml + tag });
                  }}
                  className="px-2 py-1 text-[10px] font-mono bg-surface-2 border border-line rounded text-fg2 hover:bg-accent/10 hover:text-accent transition-colors"
                  title={p.label}
                >
                  {`{{${p.key}}}`}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Preview */}
      {previewTpl && preview && (
        <Card className="overflow-hidden">
          <CardHeader title="📨 Vorschau" right={<Pill label="BEISPIELDATEN" tone="neutral" />} />
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-fg3 tracking-[0.16em]">BETREFF:</span>
              <span className="text-[13px] font-medium text-fg">
                {renderPreview(previewTpl.betreff)}
              </span>
            </div>
            <div className="border border-line rounded-lg p-5 bg-white">
              <div
                className="text-[13px] text-[#333] leading-relaxed [&_p]:mb-3 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: renderPreview(previewTpl.textHtml) }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* No selection prompt */}
      {!editing && (
        <div className="text-center py-8 text-sm text-fg3">
          Klicke auf eine Stufe im Zeitstrahl, um das Template zu bearbeiten.
        </div>
      )}
    </div>
  );
}
