import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getSevdeskExpenses } from '@/app/lib/sevdesk-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const euro = (n: number) => (n === 0 ? '—' : '€ ' + n.toLocaleString('de-DE', { maximumFractionDigits: 0 }));
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('de-DE') : '—');

export default async function KategorieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exp = await getSevdeskExpenses();
  if (!exp.configured || exp.error) notFound();

  const cat = exp.categories.find(c => c.id === id);
  if (!cat) notFound();

  const catVouchers = exp.vouchers
    .filter(v => v.categoryId === id)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <>
      <Sidebar active="finance" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title={cat.name} subtitle={`${cat.count} Belege · sevDesk SKR-Kategorie`} />
        <div className="px-8 pt-4 pb-2">
          <Link href="/finance" className="text-xs text-fg3 hover:text-fg2 transition-colors">← Zurück zu Finanzen</Link>
        </div>

        <div className="flex-1 px-8 py-4 flex flex-col gap-6 overflow-y-auto">
          <div className="flex flex-wrap gap-4">
            <KpiCard label="GESAMT" value={euro(cat.totalGross)} sub={`${cat.count} Belege`} valueColor="text-warning" />
            <KpiCard label="Ø / MONAT" value={euro(Math.round(cat.totalGross / exp.months))} sub={`über ${exp.months} Monate`} />
            <KpiCard label="LIEFERANTEN" value={cat.suppliers.length.toString()} sub="in dieser Kategorie" />
            <KpiCard label="ANTEIL" value={`${Math.round((cat.totalGross / exp.totalAll) * 100)}%`} sub="der Gesamtausgaben" />
          </div>

          <Card className="overflow-hidden">
            <CardHeader title="Top-Lieferanten" right={<Pill label={`${cat.suppliers.length} Lieferanten`} tone="warning" />} />
            <div className="grid grid-cols-[1fr_140px_100px_80px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
              <span>LIEFERANT</span><span>GESAMT</span><span>Ø / MONAT</span><span>BELEGE</span>
            </div>
            {cat.suppliers.map((s, i) => (
              <div key={s.name} className={`grid grid-cols-[1fr_140px_100px_80px] h-[44px] items-center px-5 hover:bg-surface-2/40 transition-colors ${i < cat.suppliers.length - 1 ? 'border-b border-line' : ''}`}>
                <span className="text-[13px] font-medium text-fg truncate">{s.name}</span>
                <span className="text-[13px] font-semibold text-warning">{euro(Math.round(s.total))}</span>
                <span className="text-xs text-fg2">{euro(Math.round(s.total / exp.months))}</span>
                <span className="text-xs text-fg3">{s.count}</span>
              </div>
            ))}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Alle Belege" right={<Pill label={`${catVouchers.length} Belege`} tone="info" />} />
            <div className="grid grid-cols-[110px_1fr_1fr_120px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
              <span>DATUM</span><span>LIEFERANT</span><span>BESCHREIBUNG</span><span>BETRAG</span>
            </div>
            {catVouchers.slice(0, 100).map((v, i) => (
              <div key={v.id} className={`grid grid-cols-[110px_1fr_1fr_120px] h-[44px] items-center px-5 hover:bg-surface-2/40 transition-colors ${i < Math.min(100, catVouchers.length) - 1 ? 'border-b border-line' : ''}`}>
                <span className="text-xs text-fg2">{fmtDate(v.date)}</span>
                <span className="text-[13px] font-medium text-fg truncate">{v.supplier}</span>
                <span className="text-xs text-fg3 truncate">{v.description || '—'}</span>
                <span className="text-[13px] font-semibold text-warning">{euro(Math.round(v.gross))}</span>
              </div>
            ))}
            {catVouchers.length > 100 && (
              <div className="px-5 py-3 text-xs text-fg3 text-center">
                +{catVouchers.length - 100} weitere Belege
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
