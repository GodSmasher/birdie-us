import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getSevdeskInvoices, getSevdeskExpenses, type Invoices, type Expenses } from '@/app/lib/sevdesk-server';
import Link from 'next/link';
import { getCashflowSummary, type CashflowSummary, type CashflowProject, categoryLabels } from '@/app/lib/cashflow-server';
import { getDunningTemplates } from '@/app/lib/dunning-server';
import { FinanceTabs } from './tabs';
import { ImportButton } from './import-button';
import { SyncButton } from './sync-button';
import { ProjectTable } from './project-search';
import { DunningEditor } from './dunning-editor';

export const dynamic = 'force-dynamic';

const usd = (n: number) => (n === 0 ? '—' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }));
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-US') : '—');
const fmtWeek = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
};

export default async function FinancePage() {
  const [inv, cf, exp, dunning] = await Promise.all([getSevdeskInvoices(), getCashflowSummary(), getSevdeskExpenses(), getDunningTemplates().catch(() => [])]);
  const hasInvoices = inv.configured && !inv.error;

  return (
    <>
      <Sidebar active="finance" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Finance"
          subtitle={hasInvoices ? `${inv.total} invoices · live from accounting` : 'Accounting · automated dunning runs'}
        />
        <FinanceTabs
          invoiceTab={hasInvoices ? <RealFinance inv={inv} /> : <MockFinance />}
          cashflowTab={<CashflowView cf={cf} />}
          dunningTab={<DunningEditor initial={dunning} />}
          internTab={<InternView inv={inv} exp={exp} />}
        />
      </main>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVOICES — accounting live
// ═══════════════════════════════════════════════════════════════════════════════

function statusPill(i: { status: string; overdue: boolean; reminderLevel?: string }) {
  if (i.reminderLevel === 'mahnung-1') return <Pill label="REMINDER 1" tone="error" />;
  if (i.reminderLevel === 'erinnerung-nach') return <Pill label="DUNNED" tone="warning" />;
  if (i.reminderLevel === 'erinnerung-am') return <Pill label="REMINDED" tone="warning" />;
  if (i.reminderLevel === 'erinnerung-vor') return <Pill label="REMINDED" tone="info" />;
  if (i.overdue) return <Pill label="OVERDUE" tone="error" />;
  if (i.status === 'paid') return <Pill label="PAID" tone="success" />;
  if (i.status === 'draft') return <Pill label="DRAFT" tone="neutral" />;
  return <Pill label="OPEN" tone="info" />;
}

function RealFinance({ inv }: { inv: Invoices }) {
  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="OPEN INVOICES" value={usd(inv.openSum)} sub={`${inv.openCount} invoices`} />
        <KpiCard label="OVERDUE" value={usd(inv.overdueSum)} sub={`${inv.overdueCount} overdue`} valueColor="text-warning" />
        <KpiCard label="RECEIVED / WEEK" value={usd(inv.paidWeekSum)} sub={`${inv.paidWeekCount} payments`} valueColor="text-success" />
        <KpiCard label="PAID TOTAL" value={usd(inv.paidSum)} sub={`${inv.paidCount} invoices`} />
      </div>
      <div className="flex gap-4 items-start">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader title="Invoices" right={<Pill label="LIVE" tone="success" />} />
          <div className="grid grid-cols-[120px_1fr_120px_120px_130px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
            <span>NO.</span><span>CUSTOMER</span><span>DUE</span><span>GROSS</span><span>STATUS</span>
          </div>
          {inv.invoices.slice(0, 80).map((i, idx) => (
            <div key={i.id} className={`grid grid-cols-[120px_1fr_120px_120px_130px] h-[48px] items-center px-5 hover:bg-surface-2/40 transition-colors ${idx < Math.min(80, inv.invoices.length) - 1 ? 'border-b border-line' : ''}`}>
              <span className="text-xs font-medium text-fg2">{i.number}</span>
              <span className="text-[13px] font-medium text-fg truncate pr-3">{i.customer}</span>
              <span className="text-xs text-fg2">{fmtDate(i.dueDate)}</span>
              <span className="text-[13px] font-semibold text-fg">{usd(i.gross)}</span>
              <div>{statusPill(i)}</div>
            </div>
          ))}
        </Card>
        <div className="w-[392px] shrink-0 flex flex-col gap-4">
          <Card>
            <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent-bg flex items-center justify-center text-accent font-bold text-sm">⚡</div>
              <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Dunning Bot</span><span className="text-[11px] text-fg2">{(() => { const r = inv.invoices.filter(i => i.reminderLevel && i.reminderLevel !== 'none').length; return r > 0 ? `${r} overdue invoices` : inv.overdueCount > 0 ? `${inv.overdueCount} overdue invoices` : 'none overdue'; })()}</span></div>
              <div className="ml-auto"><Pill label="LIVE" tone="success" /></div>
            </div>
            {(() => {
              const reminders = inv.invoices.filter(i => i.reminderLevel && i.reminderLevel !== 'none');
              const levels = [
                { key: 'erinnerung-vor', label: 'Reminder', days: '1–7 days' },
                { key: 'erinnerung-am', label: 'Reminder 1', days: '8–14 days' },
                { key: 'erinnerung-nach', label: 'Reminder 2', days: '15–30 days' },
                { key: 'mahnung-1', label: 'Collections', days: '30+ days' },
              ];
              const buckets = levels.map(l => {
                const items = reminders.filter(i => i.reminderLevel === l.key);
                return { ...l, count: items.length, sum: Math.round(items.reduce((s, i) => s + i.gross, 0)) };
              }).filter(b => b.count > 0);
              const fallback = inv.aging.length > 0 ? inv.aging : [];
              const display = buckets.length > 0 ? buckets : fallback;
              return display.length > 0 ? display.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 px-5 py-3.5 border-t border-line">
                  <div className="w-16 h-[22px] rounded bg-surface-2 flex items-center justify-center text-[10px] font-medium text-fg2 tracking-[0.12em]">{b.days}</div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-fg">{b.label}</span>
                    <span className="text-[10px] text-fg3">{b.count} invoices · {usd(b.sum)}</span>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-4 border-t border-line text-xs text-fg3">All invoices paid on time</div>
              );
            })()}
          </Card>
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-[13px] text-fg">Summary</h3>
            <div className="flex flex-col gap-1.5 text-xs text-fg2">
              <span>{inv.total} invoices total</span>
              <span>{inv.draftCount} drafts ({usd(inv.draftSum)})</span>
              <span>{inv.openCount} open ({usd(inv.openSum)})</span>
              <span>{inv.paidCount} paid ({usd(inv.paidSum)})</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUIDITY — Cashflow Planning
// ═══════════════════════════════════════════════════════════════════════════════

function CashflowView({ cf }: { cf: CashflowSummary }) {
  if (!cf.configured) {
    return (
      <div className="flex-1 px-8 py-7 flex flex-col gap-6">
        <Card className="p-8 text-center">
          <h3 className="font-semibold text-fg mb-2">Supabase not connected</h3>
          <p className="text-sm text-fg2">Liquidity planning requires a database connection. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.</p>
        </Card>
      </div>
    );
  }

  const t = cf.totals;

  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="TOTAL ORDER VALUE" value={usd(t.orderValueTotal)} sub={`${t.activeCount} active projects`} />
        <KpiCard label="PLANNED INCOME" value={usd(t.plannedInTotal)} sub={`${usd(t.actualInTotal)} received`} valueColor="text-success" />
        <KpiCard label="PLANNED EXPENSES" value={usd(t.plannedOutTotal)} sub={`${usd(t.actualOutTotal)} paid`} valueColor="text-warning" />
        <KpiCard
          label="OPEN BALANCE"
          value={usd(t.openBalance)}
          sub={t.flagCount > 0 ? `${t.flagCount} warnings` : 'no warnings'}
          valueColor={t.openBalance >= 0 ? 'text-success' : 'text-error'}
        />
      </div>

      {cf.timeline.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="Cashflow Timeline" right={<Pill label={`${cf.timeline.length} weeks`} tone="info" />} />
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[100px_repeat(auto-fill,minmax(80px,1fr))] min-w-[800px]">
              <div className="bg-surface-2 h-9 flex items-center px-3 text-[10px] font-semibold text-fg3 tracking-[0.12em]">WK</div>
              {cf.timeline.map((w) => (
                <div key={w.weekStart} className="bg-surface-2 h-9 flex items-center justify-center text-[10px] font-medium text-fg3">{fmtWeek(w.weekStart)}</div>
              ))}
              <div className="h-10 flex items-center px-3 text-[11px] text-fg2 border-b border-line">Income</div>
              {cf.timeline.map((w) => (
                <div key={w.weekStart} className="h-10 flex items-center justify-center text-[11px] font-medium text-success border-b border-line">
                  {w.plannedIn > 0 ? `+${Math.round(w.plannedIn / 1000)}k` : '—'}
                </div>
              ))}
              <div className="h-10 flex items-center px-3 text-[11px] text-fg2 border-b border-line">Expenses</div>
              {cf.timeline.map((w) => (
                <div key={w.weekStart} className="h-10 flex items-center justify-center text-[11px] font-medium text-warning border-b border-line">
                  {w.plannedOut > 0 ? `-${Math.round(w.plannedOut / 1000)}k` : '—'}
                </div>
              ))}
              <div className="h-10 flex items-center px-3 text-[11px] font-semibold text-fg">Balance</div>
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
          <CardHeader title="Projects" right={<div className="flex items-center gap-2"><SyncButton /><ImportButton /><Pill label={`${t.projectCount} projects`} tone="info" /></div>} />
          <ProjectTable projects={cf.projects} />
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <h3 className="font-semibold text-fg mb-2">No projects created yet</h3>
          <p className="text-sm text-fg2 mb-4">Create projects with payment schedules and procurement plans to manage liquidity.</p>
          <div className="mt-4"><ImportButton /></div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL — Operating costs, fixed costs, invoice receipt bot
// ═══════════════════════════════════════════════════════════════════════════════

function InternView({ inv, exp }: { inv: Invoices; exp: Expenses }) {
  const hasExpenses = exp.configured && !exp.error && exp.categories.length > 0;

  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <KpiCard
          label="EXPENSES / MONTH"
          value={hasExpenses ? usd(exp.totalMonthly) : '—'}
          sub={hasExpenses ? `avg over ${exp.months} months · accounting` : 'accounting not connected'}
          valueColor="text-warning"
        />
        <KpiCard
          label="EXPENSES / YEAR"
          value={hasExpenses ? usd(exp.totalYearly) : '—'}
          sub="12-month projection"
        />
        <KpiCard
          label="BREAK-EVEN"
          value={hasExpenses ? `${Math.ceil(exp.totalMonthly / 25000)} orders` : '—'}
          sub="per month at avg $25,000"
        />
        <KpiCard
          label="CATEGORIES"
          value={hasExpenses ? exp.categories.length.toString() : '0'}
          sub={hasExpenses ? `${exp.voucherCount} vouchers · chart of accounts` : 'no data'}
        />
      </div>

      <div className="flex gap-4 items-start">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader
            title="Expenses by Category"
            right={hasExpenses
              ? <Pill label={`LIVE · ${exp.months} mo.`} tone="success" />
              : <Pill label="NO DATA" tone="neutral" />
            }
          />
          {hasExpenses ? (
            <>
              <div className="grid grid-cols-[1fr_140px_100px_80px_80px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                <span>CATEGORY</span><span>TOTAL</span><span>AVG / MONTH</span><span>VOUCHERS</span><span>SUPPLIERS</span>
              </div>
              {exp.categories.map((c, i) => (
                <Link key={c.id} href={`/finance/category/${c.id}`} className="block">
                  <div className={`grid grid-cols-[1fr_140px_100px_80px_80px] h-[48px] items-center px-5 hover:bg-surface-2/40 cursor-pointer transition-colors ${i < exp.categories.length - 1 ? 'border-b border-line' : ''}`}>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-fg truncate">{c.name}</div>
                      <div className="text-[10px] text-fg3 truncate">{c.suppliers.slice(0, 3).map(s => s.name).join(', ')}</div>
                    </div>
                    <span className="text-[13px] font-semibold text-warning">{usd(c.totalGross)}</span>
                    <span className="text-xs text-fg2">{usd(Math.round(c.totalGross / exp.months))}</span>
                    <span className="text-xs text-fg3">{c.count}</span>
                    <span className="text-xs text-fg3">{c.suppliers.length}</span>
                  </div>
                </Link>
              ))}
              <div className="grid grid-cols-[1fr_140px_100px_80px_80px] h-[44px] items-center px-5 bg-surface-2 border-t border-line">
                <span className="text-[13px] font-bold text-fg">Total ({exp.voucherCount} vouchers)</span>
                <span className="text-[13px] font-bold text-warning">{usd(exp.totalAll)}</span>
                <span className="text-xs font-semibold text-fg">{usd(exp.totalMonthly)}</span>
                <span className="text-xs text-fg3">{exp.voucherCount}</span>
                <span className="text-xs text-fg3" />
              </div>
            </>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-fg3">
              No expense data available. Incoming invoices will be loaded from accounting once vouchers are recorded.
            </div>
          )}
        </Card>

        <div className="w-[392px] shrink-0 flex flex-col gap-4">
          <Card>
            <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center text-info font-bold text-sm">📨</div>
              <div className="flex flex-col">
                <span className="font-semibold text-[13px] text-fg">Invoice Receipts</span>
                <span className="text-[11px] text-fg2">Email → Liquidity Bot</span>
              </div>
              <div className="ml-auto"><Pill label="PLANNED" tone="neutral" /></div>
            </div>
            <div className="px-5 py-3 border-t border-line text-xs text-fg2 leading-[18px]">
              Incoming supplier invoices from the email inbox are automatically detected, matched to the corresponding projects, and recorded as expense entries in the liquidity plan.
            </div>
            <div className="px-5 py-3 border-t border-line flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                <span className="text-fg2">n8n webhook receives emails</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                <span className="text-fg2">Extract amount & supplier</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-fg3 shrink-0" />
                <span className="text-fg3">Project matching (TODO)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-fg3 shrink-0" />
                <span className="text-fg3">Create cashflow entry (TODO)</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-3.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center text-warning font-bold text-sm">📦</div>
              <div className="flex flex-col">
                <span className="font-semibold text-[13px] text-fg">Delivery Confirmations</span>
                <span className="text-[11px] text-fg2">Distributor → forward to customer</span>
              </div>
              <div className="ml-auto"><Pill label="n8n" tone="info" /></div>
            </div>
            <div className="px-5 py-3 border-t border-line text-xs text-fg2 leading-[18px]">
              Distributor confirmation emails with tracking links are automatically forwarded to the end customer. Runs via n8n workflow.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK — public demo fallback (no accounting configured)
// ═══════════════════════════════════════════════════════════════════════════════
type State = 'info' | 'warning' | 'error';
const invoices: { nr: string; kunde: string; faellig: string; betrag: string; state: State; pill: string }[] = [
  { nr: '#0341', kunde: 'The Johnsons', faellig: '06/01/2026', betrag: '$24,500', state: 'info', pill: 'OPEN' },
  { nr: '#0298', kunde: 'Smith Corp', faellig: '05/15/2026', betrag: '$12,400', state: 'error', pill: 'REMINDER 2' },
  { nr: '#0312', kunde: 'Apex Builders LLC', faellig: '05/22/2026', betrag: '$8,920', state: 'info', pill: 'OPEN' },
  { nr: '#0287', kunde: 'M. Davis', faellig: '05/08/2026', betrag: '$4,200', state: 'warning', pill: 'REMINDER 1' },
  { nr: '#0356', kunde: 'The Millers', faellig: '05/28/2026', betrag: '$36,800', state: 'info', pill: 'OPEN' },
  { nr: '#0334', kunde: 'SunPeak Solar Inc', faellig: '05/20/2026', betrag: '$18,400', state: 'info', pill: 'OPEN' },
];
const steps = [
  ['+7 days', 'Friendly reminder via email', '12 sent'],
  ['+14 days', 'Reminder 1 with $15 fee', '4 sent'],
  ['+30 days', 'Reminder 2 with $30 fee', '2 sent'],
  ['+60 days', 'Manual collections trigger', '0'],
];

function MockFinance() {
  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-5">
      <div className="flex flex-wrap gap-4">
        <KpiCard label="OPEN INVOICES" value="$142,380" sub="23 invoices" spark={[118, 124, 132, 128, 136, 140, 142]} sparkColor="#FACC15" />
        <KpiCard label="OVERDUE" value="$18,920" sub="4 · reminder level 1-2" valueColor="text-warning" spark={[24, 22, 21, 19, 20, 19, 18]} sparkColor="#FBBF24" />
        <KpiCard label="RECEIVED / WEEK" value="$87,440" sub="12 payments received" valueColor="text-success" spark={[42, 51, 58, 64, 72, 81, 87]} sparkColor="#4ADE80" />
        <KpiCard label="LIQUIDITY 30D" value="+$240k" sub="Forecast · Demo" spark={[180, 195, 210, 218, 225, 232, 240]} sparkColor="#4ADE80" />
      </div>
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-0 overflow-hidden">
          <CardHeader title="Open Invoices" right={<Pill label="DEMO" tone="neutral" />} />
          <div className="grid grid-cols-[70px_1fr_120px_130px_140px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
            <span>NO.</span><span>CUSTOMER</span><span>DUE</span><span>AMOUNT</span><span>STATUS</span>
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
              <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Dunning Bot</span><span className="text-[11px] text-fg2">active · 3 runs today</span></div>
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
            <h3 className="font-semibold text-[13px] text-fg">Connect accounting</h3>
            <p className="text-xs text-fg2 leading-[18px]">Once your accounting token is configured, real invoices, dunning status, and payment receipts will appear here live.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
