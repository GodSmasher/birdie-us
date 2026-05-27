import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Card, CardHeader, Pill } from '@/components/ui';
import { StageSelect } from '@/components/stage-select';
import { DocActions } from '@/components/doc-actions';
import { getRegistrations, STAGES, type StageId } from '@/app/lib/netzanmeldung';
import { getProjectData } from '@/app/lib/projektdaten';
import { netzbetreiberForPlz, CONFIDENCE_LABEL } from '@/app/lib/netzbetreiber';
import { buildMastrSheet, mastrOpenCount, type FieldSource } from '@/app/lib/mastr';
import { getWaermepumpeInfo } from '@/app/lib/waermepumpe';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n > 0 ? '€ ' + Math.round(n).toLocaleString('de-DE') : '—');

export default async function RegistrationDetail({ params }: { params: { slug: string } }) {
  const [regs, project, wp] = await Promise.all([getRegistrations(), getProjectData(params.slug), getWaermepumpeInfo(params.slug)]);
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

        <div className="flex-1 px-4 py-5 lg:px-8 lg:py-7 flex flex-col gap-5 lg:gap-6 max-w-[1000px]">
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

          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Project data */}
            <Card className="flex-1 min-w-0 p-4 lg:p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-[13px] text-fg">Anlagendaten (aus Reonic)</h3>
              <div className="flex flex-col gap-2 text-xs">
                <Row k="Anlagengröße" v={project?.kwp ? `${project.kwp} kWp` : '—'} />
                <Row k="Module" v={project?.moduleCount ? `${project.moduleCount}× ${project.moduleType ?? ''}` : '—'} />
                <Row k="Wechselrichter" v={project?.inverter ?? '—'} />
                <Row k="WR Nennleistung" v={project?.inverterKw ? `${project.inverterKw} kW` : project?.inverterSpec ? `${project.inverterSpec.ratedPowerKw} kW` : '—'} />
                <Row k="Speicher" v={project?.battery ?? 'keiner'} />
                {project?.batterySpec && (
                  <>
                    <Row k="Speicher-Kapazität" v={`${project.batterySpec.capacityKwh} kWh (nutzbar ${project.batterySpec.usableKwh} kWh)`} />
                    <Row k="Speicher-Chemie" v={project.batterySpec.chemistry} />
                    <Row k="Zyklen / DoD" v={`${project.batterySpec.cycleLife}× / ${project.batterySpec.dod}%`} />
                  </>
                )}
                <Row k="Jahresverbrauch" v={project?.annualKwh ? `${project.annualKwh.toLocaleString('de-DE')} kWh` : '—'} />
                <Row k="Adresse" v={project?.address?.zip ? `${project.address.line}, ${project.address.zip} ${project.address.city}` : '—'} />
                <Row k="Auftragswert" v={euro(reg?.value ?? 0)} />
              </div>
            </Card>

            {/* Status + actions */}
            <Card className="w-full lg:w-[340px] shrink-0 p-4 lg:p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-[13px] text-fg">Status</h3>
                {reg && <StageSelect offerId={reg.offerId} status={reg.status as StageId} />}
              </div>
              <div className="border-t border-line pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[13px] text-fg">Netzbetreiber</h3>
                  {nb && <Pill label={CONFIDENCE_LABEL[nb.confidence].toUpperCase()} tone={nbTone} dot={false} />}
                </div>
                {nb ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-fg font-medium">{nb.name}</span>
                    <span className="text-[11px] text-fg3 leading-[15px]">
                      Automatisch aus PLZ {project?.address?.zip} ermittelt. Bei „bitte prüfen" vor dem Einreichen verifizieren.
                    </span>
                    {nb.portalUrl && (
                      <a href={nb.portalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-accent self-start">
                        Einspeise-Portal öffnen ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-fg3 leading-[15px]">
                    {project?.address?.zip ? 'Kein Betreiber zur PLZ hinterlegt — manuell prüfen.' : 'Keine PLZ im Projekt — Adresse in Reonic nachtragen.'}
                  </p>
                )}
              </div>
              <div className="border-t border-line pt-4">
                <DocActions
                  offerId={reg?.offerId ?? project?.offerId ?? params.slug}
                  ready={!!project?.ready}
                  hasBattery={!!project?.battery}
                  docStatus={reg?.docStatus}
                  documents={reg?.documents}
                />
              </div>
            </Card>
          </div>

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
