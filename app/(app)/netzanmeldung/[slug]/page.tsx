import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardHeader, Pill } from '@/components/ui';
import { StageSelect } from '@/components/stage-select';
import { VbnSelect } from '@/components/vbn-select';
import { DocActions } from '@/components/doc-actions';
import { Timeline } from '@/components/timeline';
import { BotStatus } from '@/components/bot-status';
import { getRegistrations, STAGES, type StageId } from '@/app/lib/netzanmeldung';
import { getProjectData } from '@/app/lib/projektdaten';
import { netzbetreiberForPlz, CONFIDENCE_LABEL } from '@/app/lib/netzbetreiber';
import { buildMastrSheet, mastrOpenCount, type FieldSource } from '@/app/lib/mastr';
import { getWaermepumpeInfo } from '@/app/lib/waermepumpe';
import { getNetzEmails, type NetzEmail } from '@/app/lib/netz-email';
import { getProjectFiles } from '@/app/lib/reonic-files';
import { AnlagendatenCard } from '@/components/anlagendaten-card';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Auto-enrichment from Reonic docs can be slow on first load

const euro = (n: number) => (n > 0 ? '€ ' + Math.round(n).toLocaleString('de-DE') : '—');

export default async function RegistrationDetail({ params }: { params: { slug: string } }) {
  const [regs, project, wp, emails, reonicFiles] = await Promise.all([
    getRegistrations(),
    getProjectData(params.slug),
    getWaermepumpeInfo(params.slug),
    getNetzEmails({ registrationId: params.slug, limit: 20 }),
    getProjectFiles(params.slug),
  ]);
  const reg = regs.find((r) => r.offerId === params.slug);
  if (!reg && !project) notFound();
  const stageLabel = STAGES.find((s) => s.id === reg?.status)?.label ?? '—';
  const nb = netzbetreiberForPlz(project?.address?.zip);
  const nbTone = nb?.confidence === 'sicher' ? 'success' : nb?.confidence === 'wahrscheinlich' ? 'info' : 'warning';
  const mastr = project ? buildMastrSheet(project, reg) : [];
  const mastrOpen = mastrOpenCount(mastr);

  return (
    <>
      <Sidebar active="netzanmeldung" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <header className="min-h-[72px] lg:min-h-[96px] shrink-0 bg-bg border-b border-line flex flex-col justify-center px-4 pl-16 lg:pl-8 lg:px-8 gap-2 py-3 lg:py-4 sticky top-0 z-10">
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

        <div className="flex-1 px-4 py-5 lg:px-8 lg:py-7 flex flex-col gap-6">

          {/* ── Hinweis-Leiste (kompakt, nur wenn was fehlt) ── */}
          {project && !project.ready && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] ${reonicFiles.length === 0 ? 'bg-error-bg/40 border border-error/20 text-error' : 'bg-warning-bg/40 border border-warning/20 text-warning'}`}>
              <span className="font-bold shrink-0">{reonicFiles.length === 0 ? '⚠' : '!'}</span>
              <span>{reonicFiles.length === 0 ? 'Keine Dateien in Reonic — ' : ''}Fehlend: {project.missing.join(', ')}</span>
            </div>
          )}

          {/* ── BEREICH 1: Steuerung (Status + NB + Dokumente) ── */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Status */}
            <Card className="p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg">Status</h3>
              {reg && <StageSelect offerId={reg.offerId} status={reg.status as StageId} />}
              {reg && (
                <BotStatus docStatus={reg.docStatus} botErrors={reg.botErrors} botRetries={reg.botRetries} botSkipUntil={reg.botSkipUntil} />
              )}
            </Card>

            {/* Netzbetreiber */}
            <Card className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[13px] text-fg">Netzbetreiber</h3>
                {nb && <Pill label={CONFIDENCE_LABEL[nb.confidence].toUpperCase()} tone={nbTone} dot={false} />}
              </div>
              <VbnSelect offerId={reg?.offerId ?? project?.offerId ?? params.slug} current={reg?.netzbetreiber ?? nb?.name ?? '—'} />
              <span className="text-[10px] text-fg3 leading-tight">
                {nb ? `PLZ ${project?.address?.zip}` : 'Manuell wählen'}
              </span>
              {nb?.portalUrl && (
                <a href={nb.portalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-accent">Portal &nearr;</a>
              )}
            </Card>

            {/* Vollmacht */}
            <Card className="p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg">Vollmachten</h3>
              {(() => {
                const vollmachtNb = reonicFiles.find(f => f.docCategory === 'vollmacht_nb');
                const vollmachtMastr = reonicFiles.find(f => f.docCategory === 'vollmacht_mastr');
                return (vollmachtNb || vollmachtMastr) ? (
                  <div className="flex flex-col gap-2">
                    {vollmachtNb && (
                      <a href={`/api/netzanmeldung/files?offerId=${params.slug}&fileId=${vollmachtNb.id}&download=1`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 bg-surface-2 border border-line-2 rounded-lg text-[11px] hover:border-accent/40">
                        <span className="text-fg2">NB-Vollmacht</span><span className="text-accent">&#x2913;</span>
                      </a>
                    )}
                    {vollmachtMastr && (
                      <a href={`/api/netzanmeldung/files?offerId=${params.slug}&fileId=${vollmachtMastr.id}&download=1`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2 bg-surface-2 border border-line-2 rounded-lg text-[11px] hover:border-accent/40">
                        <span className="text-fg2">MaStR-Vollmacht</span><span className="text-accent">&#x2913;</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-warning-bg/60 border border-warning/30 rounded-lg px-3 py-2 text-[11px] text-warning">
                    Keine Vollmacht in Reonic gefunden.
                  </div>
                );
              })()}
            </Card>
          </div>

          {/* ── BEREICH 2: Projektdaten + Dokumente ── */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-4">
            {/* Projektdaten */}
            <AnlagendatenCard
              offerId={params.slug}
              hasDocs={reonicFiles.length > 0}
              rows={[
                { label: 'Anlagengröße', value: project?.kwp ? `${project.kwp} kWp` : '—' },
                { label: 'Module', value: project?.moduleCount ? `${project.moduleCount}× ${project.moduleType ?? ''}` : '—' },
                { label: 'Wechselrichter', value: project?.inverter ?? '—' },
                { label: 'WR Nennleistung', value: project?.inverterKw ? `${project.inverterKw} kW` : project?.inverterSpec ? `${project.inverterSpec.ratedPowerKw} kW` : '—' },
                { label: 'Speicher', value: project?.battery ? `${project.battery}${project.batteryKwh ? ` (${project.batteryKwh} kWh)` : ''}` : 'keiner' },
                { label: 'Adresse', value: project?.address?.zip ? `${project.address.line}, ${project.address.zip} ${project.address.city}` : '—' },
                { label: 'Auftragswert', value: euro(reg?.value ?? 0) },
              ]}
            />

            {/* Dokumente */}
            <Card className="p-5">
              <DocActions
                offerId={reg?.offerId ?? project?.offerId ?? params.slug}
                ready={!!project?.ready}
                hasBattery={!!project?.battery}
                netzbetreiber={reg?.netzbetreiber}
                docStatus={reg?.docStatus}
                phase={reg?.status === 'inbetriebnahme' || reg?.status === 'mastr' || reg?.status === 'abschluss' ? 'FM' : 'all'}
                documents={reg?.documents}
              />
            </Card>
          </div>

          {/* Timeline */}
          {reg && (
            <Card className="p-4 lg:p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg">Verlauf</h3>
              <Timeline
                startedAt={reg.startedAt}
                documents={reg.documents}
                pcloudUploads={reg.pcloudUploads}
                botErrors={reg.botErrors}
                emails={emails}
                portalUpdates={reg.portalUpdates}
              />
            </Card>
          )}

          {/* Reonic-Dokumente */}
          {reonicFiles.length > 0 && (
            <Card className="p-4 lg:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📁</span>
                <h3 className="font-semibold text-[13px] text-fg">Dokumente aus Reonic</h3>
                <Pill label={`${reonicFiles.length}`} tone="info" dot={false} />
                <a
                  href={`/api/netzanmeldung/files?offerId=${params.slug}&enrich=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[11px] font-medium text-accent hover:underline"
                >
                  ✨ KI-Extraktion starten
                </a>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {reonicFiles.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 bg-surface rounded-lg border border-line hover:border-accent/40 transition-colors"
                  >
                    <span className="text-sm shrink-0">{f.type === 'pdf' ? '📄' : '🖼'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-fg truncate">{f.name}</p>
                      <p className="text-[10px] text-fg3">{f.docCategory?.replace(/_/g, ' ') ?? f.type}</p>
                    </div>
                    <span className="text-[10px] text-fg4 shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Netz-Emails */}
          {emails.length > 0 && (
            <Card className="p-4 lg:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📧</span>
                <h3 className="font-semibold text-[13px] text-fg">Emails</h3>
                <Pill label={`${emails.length}`} tone="info" dot={false} />
              </div>
              <div className="flex flex-col gap-2">
                {emails.map((e) => (
                  <div key={e.id || e.message_id} className="flex items-start gap-3 py-2 border-b border-line last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      e.category === 'netz_status' ? 'bg-success' :
                      e.category === 'customer_update' ? 'bg-accent' :
                      e.category === 'customer_doc' ? 'bg-purple-500' :
                      e.category === 'customer_correction' ? 'bg-warning' :
                      'bg-fg4'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-medium text-fg">{e.from_name || e.from_email}</span>
                        <span className="text-[10px] text-fg4">{new Date(e.received_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        {e.auto_replied && <Pill label="Auto-Reply" tone="success" dot={false} />}
                      </div>
                      <p className="text-xs text-fg2 mt-0.5">{e.subject}</p>
                      {e.summary && <p className="text-[11px] text-fg3 mt-1 leading-[15px]">{e.summary}</p>}
                    </div>
                    <Pill label={
                      e.category === 'netz_status' ? 'NB-Status' :
                      e.category === 'customer_update' ? 'Kunde' :
                      e.category === 'customer_doc' ? 'Dokument' :
                      e.category === 'customer_correction' ? 'Klärung' :
                      e.category === 'netz_document' ? 'NB-Dokument' :
                      'Allgemein'
                    } tone={
                      e.category === 'netz_status' ? 'success' :
                      e.category.startsWith('customer') ? 'accent' :
                      'neutral'
                    } dot={false} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Wärmepumpe */}
          {wp?.hasWaermepumpe && (
            <Card className={`p-5 flex flex-col gap-3 ${wp.needsGasAbmeldung ? 'border-warning/40' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <h3 className="font-semibold text-[13px] text-fg">Wärmepumpe</h3>
                <Pill label={wp.heatingFuel === 'gas' ? 'GAS → ABMELDUNG' : wp.heatingFuel === 'oil' ? 'ÖL' : 'HEIZUNG UNBEKANNT'} tone={wp.needsGasAbmeldung ? 'warning' : 'info'} dot={false} />
              </div>
              {wp.waermepumpeType && <p className="text-xs text-fg2">{wp.waermepumpeType}</p>}
              {wp.needsGasAbmeldung && (
                <div className="flex flex-col gap-2 mt-1">
                  <p className="text-xs text-warning font-medium">Gaszähler muss abgemeldet werden:</p>
                  <div className="flex flex-col gap-1.5 text-[11px] text-fg2 leading-[15px]">
                    <span>① Kunde muss Gaszähler beim Versorger abmelden</span>
                    <span>② Bezirksschornsteinfeger über Stilllegung informieren</span>
                  </div>
                  <p className="text-[11px] text-fg3 mt-1">Mail-Vorlagen verfügbar unter /api/netzanmeldung/waermepumpe?offerId={reg?.offerId ?? project?.offerId}</p>
                </div>
              )}
            </Card>
          )}

          {/* MaStR data sheet */}
          {project && (
            <Card className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[13px] text-fg">MaStR-Datenblatt</h3>
                <Pill label={mastrOpen === 0 ? 'KOMPLETT' : `${mastrOpen} MANUELL`} tone={mastrOpen === 0 ? 'success' : 'warning'} dot={false} />
                <span className="text-[11px] text-fg3">Vorbereitung fürs Marktstammdatenregister — Frist 1 Monat nach Inbetriebnahme</span>
              </div>
              <p className="text-[11px] text-fg3 -mt-2 leading-[15px]">
                Es gibt keine MaStR-Schnittstelle — die Eintragung bleibt ein Portal-Schritt. Diese Felder sind aus Reonic
                vorbereitet, damit das Büro nur noch abtippt. <span className="text-warning">Gelb</span> = manuell ergänzen.
              </p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                {mastr.map((section) => (
                  <div key={section.title} className="flex flex-col gap-2">
                    <h4 className="text-[11px] font-semibold text-fg2 tracking-[0.12em] uppercase">{section.title}</h4>
                    <div className="flex flex-col gap-2 text-xs">
                      {section.fields.map((f) => (
                        <div key={f.label} className="flex flex-col gap-0.5 border-b border-line pb-2 last:border-0">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-fg3 shrink-0">{f.label}</span>
                            <span className={`text-right font-medium ${f.value ? 'text-fg' : 'text-fg4'}`}>{f.value || '—'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <SourceBadge source={f.source} />
                            {f.hint && <span className="text-[10px] text-fg4 text-right leading-tight">{f.hint}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

function SourceBadge({ source }: { source: FieldSource }) {
  const map: Record<FieldSource, { label: string; cls: string }> = {
    reonic: { label: 'aus Reonic', cls: 'bg-success-bg text-success' },
    auto: { label: 'automatisch', cls: 'bg-info-bg text-info' },
    manuell: { label: 'manuell', cls: 'bg-warning-bg text-warning' },
  };
  const m = map[source];
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${m.cls}`}>{m.label}</span>;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-2 last:border-0">
      <span className="text-fg3 shrink-0">{k}</span>
      <span className="text-fg font-medium text-right">{v}</span>
    </div>
  );
}
