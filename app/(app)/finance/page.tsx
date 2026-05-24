import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getSevdeskInvoices, type Invoices } from '@/app/lib/sevdesk-server';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('de-DE') : '—');

export default async function FinancePage() {
  const inv = await getSevdeskInvoices();
  return (
    <>
      <Sidebar active="finance" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Finanzmanagement"
          subtitle={inv.configured && !inv.error ? `${inv.total} Rechnungen · live aus sevDesk` : 'sevDesk · DATEV · automatische Mahnläufe'}
        />
        {inv.configured && !inv.error ? <RealFinance inv={inv} /> : <MockFinance />}
      </main>
    </>
  );
}

// ============ REAL — sevDesk live ============
function statusPill(i: { status: string; overdue: boolean }) {
  if (i.overdue) return <Pill label="ÜBERFÄLLIG" tone="error" />;
  if (i.status === 'paid') return <Pill label="BEZAHLT" tone="success" />;
  if (i.status === 'draft') return <Pill label="ENTWURF" tone="neutral" />;
  return <Pill label="OFFEN" tone="info" />;
}

function RealFinance({ inv }: { inv: Invoices }) {
  return (
    <div className="flex-1 px-8 py-7 flex flex-col gap-6">
      <div className="flex gap-4">
        <KpiCard label="OFFENE RECHNUNGEN" value={euro(inv.openSum)} sub={`${inv.openCount} Rechnungen`} />
        <KpiCard label="ÜBERFÄLLIG" value={euro(inv.overdueSum)} sub={`${inv.overdueCount} überfällig`} valueColor="text-warning" />
        <KpiCard label="BEZAHLT" value={euro(inv.paidSum)} sub={`${inv.paidCount} Rechnungen`} valueColor="text-success" />
        <KpiCard label="RECHNUNGEN GESAMT" value={inv.total.toLocaleString('de-DE')} sub="geladen" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Rechnungen" right={<Pill label="LIVE" tone="success" />} />
        <div className="grid grid-cols-[120px_1fr_120px_120px_130px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
          <span>NR.</span><span>KUNDE</span><span>FÄLLIG</span><span>BRUTTO</span><span>STATUS</span>
        </div>
        {inv.invoices.slice(0, 120).map((i, idx) => (
          <div
            key={i.id}
            className={`grid grid-cols-[120px_1fr_120px_120px_130px] h-[48px] items-center px-5 hover:bg-surface-2/40 transition-colors ${
              idx < Math.min(120, inv.invoices.length) - 1 ? 'border-b border-line' : ''
            }`}
          >
            <span className="text-xs font-medium text-fg2">{i.number}</span>
            <span className="text-[13px] font-medium text-fg truncate pr-3">{i.customer}</span>
            <span className="text-xs text-fg2">{fmtDate(i.dueDate)}</span>
            <span className="text-[13px] font-semibold text-fg">{euro(i.gross)}</span>
            <div>{statusPill(i)}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ============ MOCK — public demo fallback ============
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
      <div className="flex gap-4">
        <KpiCard label="OFFENE RECHNUNGEN" value="€ 142.380" sub="23 Rechnungen" spark={[118, 124, 132, 128, 136, 140, 142]} sparkColor="#FACC15" />
        <KpiCard label="ÜBERFÄLLIG" value="€ 18.920" sub="4 · Mahnstufe 1-2" valueColor="text-warning" spark={[24, 22, 21, 19, 20, 19, 18]} sparkColor="#FBBF24" />
        <KpiCard label="EINGANG / WOCHE" value="€ 87.440" sub="12 Zahlungen erhalten" valueColor="text-success" spark={[42, 51, 58, 64, 72, 81, 87]} sparkColor="#4ADE80" />
        <KpiCard label="LIQUIDITÄT 30T" value="+€ 240k" sub="Prognose · Demo" spark={[180, 195, 210, 218, 225, 232, 240]} sparkColor="#4ADE80" />
      </div>
      <div className="flex gap-4">
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
