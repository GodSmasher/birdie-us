import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getSevdeskInvoices, getSevdeskExpenses, type Invoices, type Expenses } from '@/app/lib/sevdesk-server';
import Link from 'next/link';
import { getCashflowSummary, type CashflowSummary, type CashflowProject, categoryLabels } from '@/app/lib/cashflow-server';
import { FinanceTabs } from './tabs';
import { ImportButton } from './import-button';
import { SyncButton } from './sync-button';
import { ProjectTable } from './project-search';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('de-DE') : '—');
const fmtWeek = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
};

export default async function FinancePage() {
  const [inv, cf, exp] = await Promise.all([getSevdeskInvoices(), getCashflowSummary(), getSevdeskExpenses()]);
  const hasInvoices = inv.configured && !inv.error;

  return (
    <>
      <Sidebar active="finance" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Finanzmanagement"
          subtitle={hasInvoices ? `${inv.total} Rechnungen · live aus sevDesk` : 'sevDesk · DATEV · automatische Mahnläufe'}
        />
        <FinanceTabs
          invoiceTab={hasInvoices ? <RealFinance inv={inv} /> : <MockFinance />}
          cashflowTab={<CashflowView cf={cf} />}
          internTab={<InternView inv={inv} exp={exp} />}
        />
      </main>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECHNUNGEN — sevDesk live
// ═══════════════════════════════════════════════════════════════════════════════

function statusPill(i: { status: string; overdue: boolean }) {
  if (i.overdue) return <Pill label="ÜBERFÄLLIG" tone="error" />;
  if (i.status === 'paid') return <Pill label="BEZAHLT" tone="success" />;
  if (i.status === 'draft') return <Pill label="ENTWURF" tone="neutral" />;
  return <Pill label="OFFEN" tone="info" />;
}

function RealFinance({ inv }: { inv: Invoices }) {
  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="OFFENE RECHNUNGEN" value={euro(inv.openSum)} sub={`${inv.openCount} Rechnungen`} />
        <KpiCard label="ÜBERFÄLLIG" value={euro(inv.overdueSum)} sub={`${inv.overdueCount} überfällig`} valueColor="text-warning" />
        <KpiCard label="EINGANG / WOCHE" value={euro(inv.paidWeekSum)} sub={`${inv.paidWeekCount} Zahlungen`} valueColor="text-success" />
        <KpiCard label="BEZAHLT GESAMT" value={euro(inv.paidSum)} sub={`${inv.paidCount} Rechnungen`} />
      </div>
      <div className="flex gap-4 items-start">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader title="Rechnungen" right={<Pill label="LIVE" tone="success" />} />
          <div className="grid grid-cols-[120px_1fr_120px_120px_130px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
            <span>NR.</span><span>KUNDE</span><span>FÄLLIG</span><span>BRUTTO</span><span>STATUS</span>
          </div>
          {inv.invoices.slice(0, 80).map((i, idx) => (
            <div key={i.id} className={`grid grid-cols-[120px_1fr_120px_120px_130px] h-[48px] items-center px-5 hover:bg-surface-2/40 transition-colors ${idx < Math.min(80, inv.invoices.length) - 1 ? 'border-b border-line' : ''}`}>
              <span className="text-xs font-medium text-fg2">{i.number}</span>
              <span className="text-[13px] font-medium text-fg truncate pr-3">{i.customer}</span>
              <span className="text-xs text-fg2">{fmtDate(i.dueDate)}</span>
              <span className="text-[13px] font-semibold text-fg">{euro(i.gross)}</span>
              <div>{statusPill(i)}</div>
            </div>
          ))}
        </Card>
        <div className="w-[392px] shrink-0 flex flex-col gap-4">
          <Card>
            <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">⚡</div>
              <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Mahnbot</span><span className="text-[11px] text-fg2">{inv.overdueCount > 0 ? `${inv.overdueCount} überfällige Rechnungen` : 'keine überfälligen'}</span></div>
              <div className="ml-auto"><Pill label="LIVE" tone="success" /></div>
            </div>
            {inv.aging.length > 0 ? inv.aging.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 px-5 py-3.5 border-t border-line">
                <div className="w-16 h-[22px] rounded bg-surface-2 flex items-center justify-center text-[10px] font-medium text-fg2 tracking-[0.12em]">{b.days}</div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-fg">{b.label}</span>
                  <span className="text-[10px] text-fg3">{b.count} Rechnungen · {euro(b.sum)}</span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-4 border-t border-line text-xs text-fg3">Alle Rechnungen pünktlich bezahlt</div>
            )}
          </Card>
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Zusammenfassung</h3>
            <div className="flex flex-col gap-1.5 text-xs text-fg2">
              <span>{inv.total} Rechnungen insgesamt</span>
              <span>{inv.draftCount} Entwürfe ({euro(inv.draftSum)})</span>
              <span>{inv.openCount} offen ({euro(inv.openSum)})</span>
              <span>{inv.paidCount} bezahlt ({euro(inv.paidSum)})</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUIDITÄT — Cashflow-Planung
// ═══════════════════════════════════════════════════════════════════════════════

function CashflowView({ cf }: { cf: CashflowSummary }) {
  if (!cf.configured) {
    return (
      <div className="flex-1 px-8 py-7 flex flex-col gap-6">
        <Card className="p-8 text-center">
          <h3 className="font-semibold text-fg mb-2">Supabase nicht verbunden</h3>
          <p className="text-sm text-fg2">Die Liquiditätsplanung benötigt eine Datenbankverbindung. Bitte SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY konfigurieren.</p>
        </Card>
      </div>
    );
  }

  const t = cf.totals;

  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="AUFTRAGSWERT GESAMT" value={euro(t.orderValueTotal)} sub={`${t.activeCount} aktive Projekte`} />
        <KpiCard label="GEPLANTE EINNAHMEN" value={euro(t.plannedInTotal)} sub={`davon ${euro(t.actualInTotal)} erhalten`} valueColor="text-success" />
        <KpiCard label="GEPLANTE AUSGABEN" value={euro(t.plannedOutTotal)} sub={`davon ${euro(t.actualOutTotal)} bezahlt`} valueColor="text-warning" />
        <KpiCard
          label="OFFENER SALDO"
          value={euro(t.openBalance)}
          sub={t.flagCount > 0 ? `${t.flagCount} Warnungen` : 'keine Warnungen'}
          valueColor={t.openBalance >= 0 ? 'text-success' : 'text-error'}
        />
      </div>

      {cf.timeline.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="Cashflow-Zeitachse" right={<Pill label={`${cf.timeline.length} Wochen`} tone="info" />} />
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[100px_repeat(auto-fill,minmax(80px,1fr))] min-w-[800px]">
              <div className="bg-surface-2 h-9 flex items-center px-3 text-[10px] font-semibold text-fg3 tracking-[0.12em]">KW</div>
              {cf.timeline.map((w) => (
                <div key={w.weekStart} className="bg-surface-2 h-9 flex items-center justify-center text-[10px] font-medium text-fg3">{fmtWeek(w.weekStart)}</div>
              ))}
              <div className="h-10 flex items-center px-3 text-[11px] text-fg2 border-b border-line">Einnahmen</div>
              {cf.timeline.map((w) => (
                <div key={w.weekStart} className="h-10 flex items-center justify-center text-[11px] font-medium text-success border-b border-line">
                  {w.plannedIn > 0 ? `+${Math.round(w.plannedIn / 1000)}k` : '—'}
                </div>
              ))}
              <div className="h-10 flex items-center px-3 text-[11px] text-fg2 border-b border-line">Ausgaben</div>
              {cf.timeline.map((w) => (
                <div key={w.weekStart} className="h-10 flex items-center justify-center text-[11px] font-medium text-warning border-b border-line">
                  {w.plannedOut > 0 ? `-${Math.round(w.plannedOut / 1000)}k` : '—'}
                </div>
              ))}
              <div className="h-10 flex items-center px-3 text-[11px] font-semibold text-fg">Saldo</div>
              {cf.timeline.map((w) => (
                <div key={w.weekStart} className={`h-10 flex items-center justify-center text-[11px] font-bold ${w.runningBalance >= 0 ? 'text-success' : 'text-error'}`}>
                  {w.runningBalance !== 0 ? `${w.runningBalance > 0 ? '+' : ''}${Math.round(w.runningBalance / 1000)}k` : '—'}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {cf.projects.length > 0 ? (
        <Card className="overflow-hidden">
          <CardHeader title="Projekte" right={<div className="flex items-center gap-2"><SyncButton /><ImportButton /><Pill label={`${t.projectCount} Projekte`} tone="info" /></div>} />
          <ProjectTable projects={cf.projects} />
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <h3 className="font-semibold text-fg mb-2">Noch keine Projekte angelegt</h3>
          <p className="text-sm text-fg2 mb-4">Lege Projekte mit Teilzahlungsplan und Einkaufsplanung an, um die Liquidität zu planen.</p>
          <div className="mt-4"><ImportButton /></div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERN — Betriebskosten, Fixkosten, Rechnungseingangs-Bot
// ═══════════════════════════════════════════════════════════════════════════════

function InternView({ inv, exp }: { inv: Invoices; exp: Expenses }) {
  const hasExpenses = exp.configured && !exp.error && exp.categories.length > 0;

  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard
          label="AUSGABEN / MONAT"
          value={hasExpenses ? euro(exp.totalMonthly) : '—'}
          sub={hasExpenses ? `Ø über ${exp.months} Monate · sevDesk` : 'sevDesk nicht verbunden'}
          valueColor="text-warning"
        />
        <KpiCard
          label="AUSGABEN / JAHR"
          value={hasExpenses ? euro(exp.totalYearly) : '—'}
          sub="Hochrechnung 12 Monate"
        />
        <KpiCard
          label="BREAK-EVEN"
          value={hasExpenses ? `${Math.ceil(exp.totalMonthly / 25000)} Aufträge` : '—'}
          sub="pro Monat bei Ø € 25.000"
        />
        <KpiCard
          label="KATEGORIEN"
          value={hasExpenses ? exp.categories.length.toString() : '0'}
          sub={hasExpenses ? `${exp.voucherCount} Belege · sevDesk SKR` : 'keine Daten'}
        />
      </div>

      <div className="flex gap-4 items-start">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader
            title="Ausgaben nach Kategorie (SKR)"
            right={hasExpenses
              ? <Pill label={`LIVE · ${exp.months} Mon.`} tone="success" />
              : <Pill label="KEINE DATEN" tone="neutral" />
            }
          />
          {hasExpenses ? (
            <>
              <div className="grid grid-cols-[1fr_140px_100px_80px_80px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                <span>KATEGORIE</span><span>GESAMT</span><span>Ø / MONAT</span><span>BELEGE</span><span>LIEFERANT.</span>
              </div>
              {exp.categories.map((c, i) => (
                <Link key={c.id} href={`/finance/kategorie/${c.id}`} className="block">
                  <div className={`grid grid-cols-[1fr_140px_100px_80px_80px] h-[48px] items-center px-5 hover:bg-surface-2/40 cursor-pointer transition-colors ${i < exp.categories.length - 1 ? 'border-b border-line' : ''}`}>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-fg truncate">{c.name}</div>
                      <div className="text-[10px] text-fg3 truncate">{c.suppliers.slice(0, 3).map(s => s.name).join(', ')}</div>
                    </div>
                    <span className="text-[13px] font-semibold text-warning">{euro(c.totalGross)}</span>
                    <span className="text-xs text-fg2">{euro(Math.round(c.totalGross / exp.months))}</span>
                    <span className="text-xs text-fg3">{c.count}</span>
                    <span className="text-xs text-fg3">{c.suppliers.length}</span>
                  </div>
                </Link>
              ))}
              <div className="grid grid-cols-[1fr_140px_100px_80px_80px] h-[44px] items-center px-5 bg-surface-2 border-t border-line">
                <span className="text-[13px] font-bold text-fg">Gesamt ({exp.voucherCount} Belege)</span>
                <span className="text-[13px] font-bold text-warning">{euro(exp.totalAll)}</span>
                <span className="text-xs font-semibold text-fg">{euro(exp.totalMonthly)}</span>
                <span className="text-xs text-fg3">{exp.voucherCount}</span>
                <span className="text-xs text-fg3" />
              </div>
            </>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-fg3">
              Keine Ausgaben-Daten verfügbar. Eingangsrechnungen werden aus sevDesk geladen, sobald Belege erfasst sind.
            </div>
          )}
        </Card>

        <div className="w-[392px] shrink-0 flex flex-col gap-4">
          <Card>
            <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center text-info font-bold text-sm">📨</div>
              <div className="flex flex-col">
                <span className="font-semibold text-[13px] text-fg">Rechnungseingang</span>
                <span className="text-[11px] text-fg2">E-Mail → Liquidität Bot</span>
              </div>
              <div className="ml-auto"><Pill label="GEPLANT" tone="neutral" /></div>
            </div>
            <div className="px-5 py-3 border-t border-line text-xs text-fg2 leading-[18px]">
              Eingehende Lieferantenrechnungen aus dem E-Mail-Postfach werden automatisch erkannt, den passenden Projekten zugeordnet und als Ausgaben-Einträge in der Liquiditätsplanung verbucht.
            </div>
            <div className="px-5 py-3 border-t border-line flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                <span className="text-fg2">n8n-Webhook empfängt Mails</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                <span className="text-fg2">Betrag & Lieferant extrahieren</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-fg3 shrink-0" />
                <span className="text-fg3">Projekt-Zuordnung (TODO)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-fg3 shrink-0" />
                <span className="text-fg3">Cashflow-Entry anlegen (TODO)</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center text-warning font-bold text-sm">📦</div>
              <div className="flex flex-col">
                <span className="font-semibold text-[13px] text-fg">Lieferbestätigungen</span>
                <span className="text-[11px] text-fg2">Großhändler → Kunde weiterleiten</span>
              </div>
              <div className="ml-auto"><Pill label="n8n" tone="info" /></div>
            </div>
            <div className="px-5 py-3 border-t border-line text-xs text-fg2 leading-[18px]">
              Bestätigungsmails der Großhändler mit Tracking-Links werden automatisch an den Endkunden weitergeleitet. Läuft über n8n-Workflow.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK — public demo fallback (kein sevDesk konfiguriert)
// ═══════════════════════════════════════════════════════════════════════════════
type State = 'info' | 'warning' | 'error';
const invoices: { nr: string; kunde: string; faellig: string; betrag: string; state: State; pill: string }[] = [
  { nr: '#0341', kunde: 'Familie Huber', faellig: '01.06.2026', betrag: '€ 24.500', state: 'info', pill: 'OFFEN' },
  { nr: '#0298', kunde: 'Schmid AG', faellig: '15.05.2026', betrag: '€ 12.400', state: 'error', pill: 'MAHNUNG 2' },
  { nr: '#0312', kunde: 'Bau Locher GmbH', faellig: '22.05.2026', betrag: '€ 8.920', state: 'info', pill: 'OFFEN' },
  { nr: '#0287', kunde: 'M. Egger', faellig: '08.05.2026', betrag: '€ 4.200', state: 'warning', pill: 'MAHNUNG 1' },
  { nr: '#0356', kunde: 'Familie Frey', faellig: '28.05.2026', betrag: '€ 36.800', state: 'info', pill: 'OFFEN' },
  { nr: '#0334', kunde: 'Solar Berg AG', faellig: '20.05.2026', betrag: '€ 18.400', state: 'info', pill: 'OFFEN' },
];
const steps = [
  ['+7 Tage', 'Freundliche Erinnerung per Mail', '12 versendet'],
  ['+14 Tage', 'Mahnung 1 mit Gebühr € 15', '4 versendet'],
  ['+30 Tage', 'Mahnung 2 mit Gebühr € 30', '2 versendet'],
  ['+60 Tage', 'Manueller Trigger Inkasso', '0'],
];

function MockFinance() {
  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-5">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="OFFENE RECHNUNGEN" value="€ 142.380" sub="23 Rechnungen" spark={[118, 124, 132, 128, 136, 140, 142]} sparkColor="#FACC15" />
        <KpiCard label="ÜBERFÄLLIG" value="€ 18.920" sub="4 · Mahnstufe 1-2" valueColor="text-warning" spark={[24, 22, 21, 19, 20, 19, 18]} sparkColor="#FBBF24" />
        <KpiCard label="EINGANG / WOCHE" value="€ 87.440" sub="12 Zahlungen erhalten" valueColor="text-success" spark={[42, 51, 58, 64, 72, 81, 87]} sparkColor="#4ADE80" />
        <KpiCard label="LIQUIDITÄT 30T" value="+€ 240k" sub="Prognose · Demo" spark={[180, 195, 210, 218, 225, 232, 240]} sparkColor="#4ADE80" />
      </div>
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader title="Offene Rechnungen" right={<Pill label="DEMO" tone="neutral" />} />
          <div className="grid grid-cols-[70px_1fr_120px_130px_140px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
            <span>NR.</span><span>KUNDE</span><span>FÄLLIG</span><span>BETRAG</span><span>STATUS</span>
          </div>
          {invoices.map((iv, i) => (
            <div key={iv.nr} className={`grid grid-cols-[70px_1fr_120px_130px_140px] h-[50px] items-center px-5 ${i < invoices.length - 1 ? 'border-b border-line' : ''}`}>
              <span className="text-xs font-medium text-fg2">{iv.nr}</span>
              <span className="text-[13px] font-medium text-fg">{iv.kunde}</span>
              <span className="text-xs text-fg2">{iv.faellig}</span>
              <span className="text-[13px] font-semibold text-fg">{iv.betrag}</span>
              <div><Pill label={iv.pill} tone={iv.state} /></div>
            </div>
          ))}
        </Card>
        <div className="w-[392px] shrink-0 flex flex-col gap-4">
          <Card>
            <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">⚡</div>
              <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Mahnbot</span><span className="text-[11px] text-fg2">aktiv · 3 Läufe heute</span></div>
              <div className="ml-auto"><Pill label="DEMO" tone="neutral" /></div>
            </div>
            {steps.map(([d, txt, count], i) => (
              <div key={i} className="flex items-center gap-2.5 px-5 py-3.5 border-t border-line">
                <div className="w-16 h-[22px] rounded bg-surface-2 flex items-center justify-center text-[10px] font-medium text-fg2 tracking-[0.12em]">{d}</div>
                <div className="flex flex-col gap-0.5"><span className="text-xs text-fg">{txt}</span><span className="text-[10px] text-fg3">{count}</span></div>
              </div>
            ))}
          </Card>
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">sevDesk verbinden</h3>
            <p className="text-xs text-fg2 leading-[18px]">Mit hinterlegtem sevDesk-Token erscheinen hier echte Rechnungen, Mahnstand und Zahlungseingänge live.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
