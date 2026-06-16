'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';

interface FieldValue {
  name: string;
  type: 'text' | 'checkbox';
  value: string | boolean;
}

export default function EditDocPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fields, setFields] = useState<FieldValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState('');
  const [pdfVersion, setPdfVersion] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const fullForm = searchParams.get('form') ?? '';
  // pdfVersion in URL forces embed refresh after save, regen=1 bypasses cache
  const pdfUrl = `/api/netzanmeldung/document?offerId=${params.slug}&form=${encodeURIComponent(fullForm)}${pdfVersion > 0 ? `&regen=1&v=${pdfVersion}` : ''}`;

  useEffect(() => {
    if (!fullForm) { setLoading(false); return; }
    fetch(`/api/netzanmeldung/document/fields?offerId=${params.slug}&form=${encodeURIComponent(fullForm)}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setFields(d.fields); setLabel(d.label); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug, fullForm]);

  const doSave = useCallback(async (currentFields: FieldValue[]) => {
    setSaving(true);
    const overrides: Record<string, string | boolean> = {};
    for (const f of currentFields) overrides[f.name] = f.value;
    await fetch('/api/netzanmeldung/document/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId: params.slug, form: fullForm, overrides }),
    });
    setSaving(false);
    setLastSaved(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [params.slug, fullForm]);

  function updateField(name: string, value: string | boolean) {
    setFields(prev => {
      const next = prev.map(f => f.name === name ? { ...f, value } : f);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => doSave(next), 1500);
      return next;
    });
    setLastSaved(null);
  }

  async function handleFreigeben() {
    setBusy(true);
    await doSave(fields);
    await fetch('/api/netzanmeldung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId: params.slug, docStatus: 'freigegeben' }),
    });
    setBusy(false);
    const signUrl = `${window.location.origin}/sign`;
    const msg = `Hi Jan, new documents ready for signature: ${signUrl}`;
    window.open(`https://wa.me/4917661714746?text=${encodeURIComponent(msg)}`, '_blank');
    router.push(`/netzanmeldung/${params.slug}`);
    router.refresh();
  }

  const textFields = fields.filter(f => f.type === 'text');
  const checkFields = fields.filter(f => f.type === 'checkbox');
  const filledText = textFields.filter(f => f.value);
  const checkedBoxes = checkFields.filter(f => f.value === true);

  return (
    <>
      <Sidebar active="netzanmeldung" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <header className="shrink-0 bg-bg border-b border-line flex items-center justify-between px-4 pl-16 lg:pl-8 lg:px-8 py-2.5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link href={`/netzanmeldung/${params.slug}`} className="text-fg3 hover:text-fg text-sm">&larr;</Link>
            <div className="flex flex-col">
              <h1 className="font-semibold text-[14px] text-fg tracking-tight">{label || 'Loading document...'}</h1>
              <span className="text-[10px] text-fg4">
                {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved}` : loading ? 'Loading...' : 'Ready'}
                {' '}&middot; {filledText.length}/{textFields.length} fields
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPdfVersion(v => v + 1)}
              className="px-3 py-1.5 bg-surface-2 border border-line-2 rounded-lg text-[11px] text-fg2 hover:border-accent/40">
              &#x21bb; Preview
            </button>
            <a href={pdfUrl + '&download=1'} download
              className="px-3 py-1.5 bg-surface-2 border border-line-2 rounded-lg text-[11px] text-fg2 hover:border-accent/40">
              &#x2913; PDF
            </a>
            <button onClick={handleFreigeben} disabled={busy || loading}
              className="px-4 py-1.5 bg-accent text-bg rounded-lg font-semibold text-[11px] disabled:opacity-50">
              {busy ? '...' : 'Approve'}
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* PDF Preview */}
          <div className="flex-1 bg-[#525659] min-w-0">
            {fullForm ? (
              <embed src={pdfUrl + '#toolbar=0&navpanes=0&view=FitH'} type="application/pdf" className="w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-white/40">No form selected</div>
            )}
          </div>

          {/* Field Editor */}
          <div className="w-[380px] shrink-0 border-l border-line bg-bg overflow-y-auto">
            {loading ? (
              <div className="p-5 text-center text-fg3 text-xs animate-pulse">Loading fields...</div>
            ) : (
              <>
                <div className="border-b border-line">
                  <div className="px-4 py-2.5 bg-surface-2 border-b border-line">
                    <span className="text-[10px] font-semibold text-fg3 tracking-wide uppercase">
                      Text Fields ({filledText.length}/{textFields.length})
                    </span>
                  </div>
                  {textFields.map(f => (
                    <div key={f.name} className="flex flex-col gap-0.5 px-4 py-1.5 border-b border-line/50 last:border-0">
                      <label className="text-[9px] text-fg4 truncate" title={f.name}>{f.name}</label>
                      <input type="text" value={f.value as string}
                        onChange={e => updateField(f.name, e.target.value)}
                        className="bg-transparent text-[12px] text-fg px-0 py-0.5 border-b border-transparent focus:border-accent focus:outline-none"
                        placeholder="(empty)" />
                    </div>
                  ))}
                </div>
                {checkFields.length > 0 && (
                  <div>
                    <div className="px-4 py-2.5 bg-surface-2 border-b border-line">
                      <span className="text-[10px] font-semibold text-fg3 tracking-wide uppercase">
                        Checkboxes ({checkedBoxes.length}/{checkFields.length})
                      </span>
                    </div>
                    {checkFields.map(f => (
                      <label key={f.name} className="flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:bg-surface-2/40 border-b border-line/50 last:border-0">
                        <input type="checkbox" checked={f.value as boolean}
                          onChange={e => updateField(f.name, e.target.checked)}
                          className="accent-accent w-3.5 h-3.5" />
                        <span className="text-[10px] text-fg2 truncate" title={f.name}>{f.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
