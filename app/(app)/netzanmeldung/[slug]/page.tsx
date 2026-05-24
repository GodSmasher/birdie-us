import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardHeader, Pill } from '@/components/ui';
import { StageSelect } from '@/components/stage-select';
import { getRegistrations, STAGES, type StageId } from '@/app/lib/netzanmeldung';
import { getProjectData } from '@/app/lib/projektdaten';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n > 0 ? '€ ' + Math.round(n).toLocaleString('de-DE') : '—');

export default async function RegistrationDetail({ params }: { params: { slug: string } }) {
  const [regs, project] = await Promise.all([getRegistrations(), getProjectData(params.slug)]);
  const reg = regs.find((r) => r.offerId === params.slug);
  if (!reg && !project) notFound();
  const stageLabel = STAGES.find((s) => s.id === reg?.status)?.label ?? '—';

  return (
    <>
      <Sidebar active="netzanmeldung" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <header className="min-h-[96px] shrink-0 bg-bg border-b border-line flex flex-col justify-center px-8 gap-2 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Link href="/netzanmeldung" className="text-fg3 hover:text-fg2">Netzanmeldung</Link>
            <span className="text-fg4">/</span>
            <span className="text-fg2 font-medium">{reg?.customer ?? project?.name}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-accent text-lg">⚡</span>
            <h1 className="font-semibold text-xl text-fg tracking-tightest">{reg?.customer ?? project?.name}</h1>
            <Pill label={stageLabel} tone="info" />
            {project && (project.ready ? <Pill label="DATEN VOLLSTÄNDIG" tone="success" /> : <Pill label={`${project.missing.length} FEHLT`} tone="warning" />)}
          </div>
        </header>

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[1000px]">
          {/* Completeness check */}
          {project && (
            <Card className={`p-5 flex flex-col gap-3 ${project.ready ? '' : 'border-warning/40'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${project.ready ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
                  {project.ready ? '✓' : '!'}
                </div>
                <h3 className="font-semibold text-[13px] text-fg">Vollständigkeits-Check</h3>
              </div>
              {project.ready ? (
                <p className="text-xs text-fg2">Alle für die Netzanmeldung nötigen Daten sind in Reonic vorhanden.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-fg2">Diese Angaben fehlen in Reonic — bitte vom Vertrieb nachtragen:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.missing.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-warning-bg text-warning rounded-md text-[11px] font-medium">
                        ✗ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="flex gap-4 items-start">
            {/* Project data */}
            <Card className="flex-1 min-w-0 p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg">Anlagendaten (aus Reonic)</h3>
              <div className="flex flex-col gap-2 text-xs">
                <Row k="Anlagengröße" v={project?.kwp ? `${project.kwp} kWp` : '—'} />
                <Row k="Module" v={project?.moduleCount ? `${project.moduleCount}× ${project.moduleType ?? ''}` : '—'} />
                <Row k="Wechselrichter" v={project?.inverter ?? '—'} />
                <Row k="Speicher" v={project?.battery ?? 'keiner'} />
                <Row k="Jahresverbrauch" v={project?.annualKwh ? `${project.annualKwh.toLocaleString('de-DE')} kWh` : '—'} />
                <Row k="Adresse" v={project?.address?.zip ? `${project.address.line}, ${project.address.zip} ${project.address.city}` : '—'} />
                <Row k="Auftragswert" v={euro(reg?.value ?? 0)} />
              </div>
            </Card>

            {/* Status + actions */}
            <Card className="w-[340px] shrink-0 p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-[13px] text-fg">Status</h3>
                {reg && <StageSelect offerId={reg.offerId} status={reg.status as StageId} />}
              </div>
              <div className="border-t border-line pt-4 flex flex-col gap-2">
                <h3 className="font-semibold text-[13px] text-fg">Dokumente</h3>
                <p className="text-[11px] text-fg3 leading-[16px]">
                  Auto-Fill der VDE-AR-N 4105 Formulare (E.2 Anmeldung, E.1 Datenblatt) aus diesen Daten — der nächste Schritt.
                </p>
                <button
                  disabled={!project?.ready}
                  className="px-3.5 py-2 bg-accent text-bg rounded-lg font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  title={project?.ready ? 'E.2 erzeugen' : 'Erst Daten vervollständigen'}
                >
                  E.2 erzeugen {project?.ready ? '' : '(Daten fehlen)'}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-2 last:border-0">
      <span className="text-fg3 shrink-0">{k}</span>
      <span className="text-fg font-medium text-right">{v}</span>
    </div>
  );
}
