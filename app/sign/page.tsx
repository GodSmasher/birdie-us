'use client';

import { useState, useEffect, useCallback } from 'react';

interface SignDoc {
  form: string;
  label: string;
  downloadUrl: string;
}

interface SignProject {
  offerId: string;
  customer: string;
  netzbetreiber: string;
  kwp: string;
  address: string;
  documents: SignDoc[];
  signedCount: number;
}

export default function SignPage() {
  const [projects, setProjects] = useState<SignProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    const r = await fetch('/api/sign');
    if (r.ok) {
      const d = await r.json();
      setProjects(d.projects ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  async function handleUpload(offerId: string, file: File) {
    setUploading(offerId);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('offerId', offerId);

    const r = await fetch('/api/sign', { method: 'POST', body: formData });
    const d = await r.json();
    if (d.ok) {
      setMessage(`Hochgeladen: ${file.name}`);
      loadProjects(); // Refresh
    } else {
      setMessage(`Fehler: ${d.error}`);
    }
    setUploading(null);
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <svg viewBox="0 0 200 48" className="h-5" aria-label=".birdie">
              <circle cx="12" cy="36" r="6" fill="#FACC15" />
              <text x="28" y="38" fontFamily="system-ui,-apple-system,sans-serif" fontSize="38" fontWeight="700" fill="#ffffff" letterSpacing="-1">birdie</text>
            </svg>
            <p className="text-sm text-white/50 mt-1">Dokumente zum Unterschreiben</p>
          </div>
          <button onClick={() => { setLoading(true); loadProjects(); }} className="text-sm text-blue-400 hover:text-blue-300">
            Aktualisieren
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {message && (
          <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-white/40 text-center py-12 animate-pulse">Laden...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">&#x2713;</div>
            <p className="text-white/50 text-lg">Keine Dokumente zum Unterschreiben</p>
            <p className="text-white/30 text-sm mt-2">Alle erledigt! Seite offen lassen — neue Aufträge erscheinen automatisch.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <p className="text-white/40 text-sm">{projects.length} Projekt{projects.length !== 1 ? 'e' : ''} warten auf Unterschrift</p>

            {projects.map(p => (
              <div key={p.offerId} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {/* Project header */}
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-base">{p.customer}</h2>
                      <p className="text-sm text-white/40">{p.address} &middot; {p.kwp} kWp &middot; {p.netzbetreiber}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded">
                      UNTERSCHRIFT NÖTIG
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div className="px-5 py-3 flex flex-col gap-2">
                  <p className="text-xs text-white/30 font-medium uppercase tracking-wide">Dokumente herunterladen:</p>
                  {p.documents.map(d => (
                    <a
                      key={d.form}
                      href={d.downloadUrl}
                      download
                      className="flex items-center justify-between px-4 py-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      <span className="text-sm">{d.label}</span>
                      <span className="text-blue-400 text-sm font-medium">&#x2913; PDF</span>
                    </a>
                  ))}
                </div>

                {/* Upload signed version */}
                <div className="px-5 py-4 border-t border-white/10 bg-white/[0.02]">
                  <p className="text-xs text-white/30 font-medium uppercase tracking-wide mb-2">Unterschriebene Version hochladen:</p>
                  <label className={`flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition
                    ${uploading === p.offerId ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/20 hover:border-white/40'}`}>
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const files = e.target.files;
                        if (files) {
                          for (let i = 0; i < files.length; i++) {
                            handleUpload(p.offerId, files[i]);
                          }
                        }
                      }}
                    />
                    <span className="text-sm text-white/50">
                      {uploading === p.offerId ? 'Wird hochgeladen...' : 'PDF hier auswählen oder tippen'}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
