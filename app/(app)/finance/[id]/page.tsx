import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getCashflowProject, categoryLabels } from '@/app/lib/cashflow-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('de-DE') : '—');

function statusPill(status: string) {
  if (status === 'paid') return <Pill label="BEZAHLT" tone="success" />;
  if (status === 'invoiced') return <Pill label="RECHNUNG" tone="info" />;
  if (status === 'overdue') return <Pill label="ÜBERFÄLLIG" tone="error" />;
  if (status === 'cancelled') return <Pill label="STORNIERT" tone="neutral" />;
  return <Pill label="GEPLANT" tone="warning" />;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getCashflowProject(id);
  if (!p) notFound();

  const inEntries = p.entries.filter((e) => e.direction === 'in');
  const outEntries = p.entries.filter((e) => e.direction === 'out');

  return (
    <>
      <Sidebar active="finance" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title={p.customerName}
          subtitle={p.title}
        />
        <div className="px-8 pt-4 pb-2">
          <Link href="/finance" className="text-xs text-fg3 hover:text-fg2 transition-colors">← Zurück zur Liquiditätsübersicht</Link>
        </div>

        <div className="flex-1 px-8 py-4 flex flex-col gap-6 overflow-y-auto">
          <div className="flex flex-wrap gap-4">
            <KpiCard label="AUFTRAGSWERT" value={euro(p.orderValue)} sub={p.orderDate ? `Auftrag vom ${fmtDate(p.orderDate)}` : 'Kein Datum'} />
            <KpiCard label="EINNAHMEN GEPLANT" value={euro(p.plannedIn)} sub={`davon ${euro(p.actualIn)} erhalten`} valueColor="text-success" />
            <KpiCard label="AUSGABEN GEPLANT" value={euro(p.plannedOut)} sub={`davon ${euro(p.actualOut)} bezahlt`} valueColor="text-warning" />
            <KpiCard
              label="SALDO"
              value={euro(p.balance)}
              sub={p.flags.length > 0 ? `${p.flags.length} Warnungen` : 'OK'}
              valueColor={p.balance >= 0 ? 'text-success' : 'text-error'}
            />
          </div>

          {p.flags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.flags.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-[11px] text-warning">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />{f}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 items-start">
            <Card className="flex-1 min-w-0 overflow-hidden">
              <CardHeader title="Einnahmen (Teilzahlungen)" right={<Pill label={`${inEntries.length} Positionen`} tone="success" />} />
              <div className="grid grid-cols-[1fr_120px_120px_110px_110px_100px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                <span>KATEGORIE</span><span>GEPLANT</span><span>TATSÄCHLICH</span><span>PLAN-DATUM</span><span>IST-DATUM</span><span>STATUS</span>
              </div>
              {inEntries.map((e, idx) => (
                <div key={e.id} className={`grid grid-cols-[1fr_120px_120px_110px_110px_100px] h-[48px] items-center px-5 hover:bg-surface-2/40 transition-colors ${idx < inEntries.length - 1 ? 'border-b border-line' : ''}`}>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-fg truncate">{categoryLabels[e.category] ?? e.category}</div>
                    {e.description && <div className="text-[10px] text-fg3 truncate">{e.description}</div>}
                  </div>
                  <span className="text-[13px] font-semibold text-success">{euro(e.plannedAmount)}</span>
                  <span className="text-xs text-fg2">{e.actualAmount != null ? euro(e.actualAmount) : '—'}</span>
                  <span className="text-xs text-fg2">{fmtDate(e.plannedDate)}</span>
                  <span className="text-xs text-fg2">{fmtDate(e.actualDate)}</span>
                  <div>{statusPill(e.status)}</div>
                </div>
              ))}
              {inEntries.length === 0 && <div className="px-5 py-4 text-xs text-fg3">Noch keine Einnahmen geplant</div>}
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader title="Ausgaben (Einkauf / Kosten)" right={<Pill label={`${outEntries.length} Positionen`} tone="warning" />} />
            <div className="grid grid-cols-[1fr_1fr_120px_120px_110px_110px_100px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
              <span>KATEGORIE</span><span>LIEFERANT</span><span>GEPLANT</span><span>TATSÄCHLICH</span><span>PLAN-DATUM</span><span>IST-DATUM</span><span>STATUS</span>
            </div>
            {outEntries.map((e, idx) => (
              <div key={e.id} className={`grid grid-cols-[1fr_1fr_120px_120px_110px_110px_100px] h-[48px] items-center px-5 hover:bg-surface-2/40 transition-colors ${idx < outEntries.length - 1 ? 'border-b border-line' : ''}`}>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-fg truncate">{categoryLabels[e.category] ?? e.category}</div>
                  {e.description && <div className="text-[10px] text-fg3 truncate">{e.description}</div>}
                </div>
                <span className="text-xs text-fg2 truncate">{e.supplier ?? '—'}</span>
                <span className="text-[13px] font-semibold text-warning">{euro(e.plannedAmount)}</span>
                <span className="text-xs text-fg2">{e.actualAmount != null ? euro(e.actualAmount) : '—'}</span>
                <span className="text-xs text-fg2">{fmtDate(e.plannedDate)}</span>
                <span className="text-xs text-fg2">{fmtDate(e.actualDate)}</span>
                <div>{statusPill(e.status)}</div>
              </div>
            ))}
            {outEntries.length === 0 && <div className="px-5 py-4 text-xs text-fg3">Noch keine Ausgaben geplant</div>}
          </Card>

          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Projektdaten</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div className="flex justify-between"><span className="text-fg3">Auftragsdatum</span><span className="text-fg">{fmtDate(p.orderDate)}</span></div>
              <div className="flex justify-between"><span className="text-fg3">Montagedatum</span><span className="text-fg">{fmtDate(p.installationDate)}</span></div>
              <div className="flex justify-between"><span className="text-fg3">Abschlussdatum</span><span className="text-fg">{fmtDate(p.completionDate)}</span></div>
              <div className="flex justify-between"><span className="text-fg3">Status</span><span className="text-fg">{p.status}</span></div>
              {p.reonicOfferId && <div className="flex justify-between col-span-2"><span className="text-fg3">Reonic-Angebot</span><span className="text-fg font-mono text-[10px]">{p.reonicOfferId}</span></div>}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
