import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill } from '@/components/ui';
import { loadPipeline } from '@/app/lib/reonic-data';

export const dynamic = 'force-dynamic';

const usd = (n: number) => (n === 0 ? '—' : '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }));
const stateTone: Record<string, 'success' | 'error' | 'info' | 'neutral'> = { Won: 'success', Lost: 'error', Open: 'info' };
const stateLabel: Record<string, string> = { Won: 'WON', Lost: 'LOST', Open: 'OPEN' };

export default async function SellerPage({ params }: { params: { id: string } }) {
  const sellerId = decodeURIComponent(params.id);
  const { data: pipe } = await loadPipeline();

  // Find seller in stats
  const seller = pipe.bySeller.find(s => s.id === sellerId);
  if (!seller && !pipe.configured) notFound();

  const sellerName = seller?.name ?? sellerId;

  // Filter offers for this seller
  // We need to get all offers and filter by assignedToId
  // The recent list doesn't have assignedToId, so we need to load raw offers
  const { getEntities } = await import('@/app/lib/db');
  const allOffers = await getEntities<{
    id?: string; name?: string; totalPlannedPrice?: number; componentsTotalPrice?: number;
    dealState?: string; status?: string; assignedToId?: string; createdAt?: string;
    customerContact?: { fullName?: string };
  }>('offer');

  const sellerOffers = allOffers.filter(o => o.assignedToId === sellerId);
  const won = sellerOffers.filter(o => o.dealState === 'Won');
  const lost = sellerOffers.filter(o => o.dealState === 'Lost');
  const open = sellerOffers.filter(o => o.dealState === 'Open' || (!o.dealState && o.dealState !== 'Won' && o.dealState !== 'Lost'));
  const wonValue = won.reduce((s, o) => s + (o.componentsTotalPrice ?? o.totalPlannedPrice ?? 0), 0);
  const lostValue = lost.reduce((s, o) => s + (o.componentsTotalPrice ?? o.totalPlannedPrice ?? 0), 0);
  const openValue = open.reduce((s, o) => s + (o.componentsTotalPrice ?? o.totalPlannedPrice ?? 0), 0);
  const closeRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;

  // Sort by value desc
  const sortedOffers = [...sellerOffers].sort((a, b) =>
    (b.componentsTotalPrice ?? b.totalPlannedPrice ?? 0) - (a.componentsTotalPrice ?? a.totalPlannedPrice ?? 0)
  );

  return (
    <>
      <Sidebar active="vertrieb" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title={sellerName}
          subtitle={`${sellerOffers.length} Offers · ${usd(wonValue)} won · Close rate ${closeRate}%`}
        />

        <div className="flex-1 px-6 py-5 flex flex-col gap-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <Link href="/vertrieb" className="text-fg3 hover:text-fg2">Sales</Link>
            <span className="text-fg4">/</span>
            <span className="text-fg2 font-medium">{sellerName}</span>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-5 gap-3">
            <KpiCard label="OFFERS" value={String(sellerOffers.length)} sub="total" />
            <KpiCard label="WON" value={usd(wonValue)} sub={`${won.length} projects`} valueColor="text-success" />
            <KpiCard label="LOST" value={usd(lostValue)} sub={`${lost.length}`} valueColor="text-error" />
            <KpiCard label="OPEN" value={usd(openValue)} sub={`${open.length} in pipeline`} />
            <KpiCard label="CLOSE RATE" value={`${closeRate}%`} sub={`${won.length}/${won.length + lost.length}`} valueColor={closeRate >= 30 ? 'text-success' : 'text-fg'} />
          </div>

          {/* Main: 2 columns */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-4 flex-1 min-h-0">
            {/* Left: Offers table */}
            <Card className="overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-line flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-[13px] text-fg">Offers by {sellerName}</h3>
                <span className="text-[11px] text-fg3">{sellerOffers.length} total</span>
              </div>
              <div className="grid grid-cols-[1fr_100px_100px_90px] bg-surface-2 h-9 items-center px-5 text-[9px] font-semibold text-fg3 tracking-[0.18em] shrink-0">
                <span>CUSTOMER / PROJECT</span><span>STATUS</span><span>VALUE</span><span>DATE</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sortedOffers.map((o, i) => {
                  const val = o.componentsTotalPrice ?? o.totalPlannedPrice ?? 0;
                  const state = o.dealState ?? 'Open';
                  const name = o.customerContact?.fullName || o.name?.split(' - ')[0] || o.name || '—';
                  const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '—';
                  return (
                    <Link key={o.id ?? i} href={`/vertrieb/${o.id}`}
                      className={`grid grid-cols-[1fr_100px_100px_90px] h-[44px] items-center px-5 hover:bg-surface-2/40 transition-colors ${i < sortedOffers.length - 1 ? 'border-b border-line' : ''}`}>
                      <span className="text-[12px] font-medium text-fg truncate pr-2">{name}</span>
                      <Pill label={stateLabel[state] ?? state} tone={stateTone[state] ?? 'neutral'} />
                      <span className={`text-[12px] font-semibold ${state === 'Won' ? 'text-success' : state === 'Lost' ? 'text-fg3' : 'text-fg'}`}>{usd(val)}</span>
                      <span className="text-[11px] text-fg3">{date}</span>
                    </Link>
                  );
                })}
              </div>
            </Card>

            {/* Right: Stats */}
            <div className="flex flex-col gap-4">
              {/* Performance ring */}
              <Card className="p-5 flex flex-col items-center gap-3">
                <h3 className="font-semibold text-[12px] text-fg self-start">Close Rate</h3>
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-surface-3" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-success"
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${closeRate * 2.64} ${264 - closeRate * 2.64}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-extrabold text-fg">{closeRate}%</span>
                  </div>
                </div>
                <div className="flex gap-4 text-[11px]">
                  <span className="text-success font-medium">{won.length} won</span>
                  <span className="text-error font-medium">{lost.length} lost</span>
                  <span className="text-fg3">{open.length} open</span>
                </div>
              </Card>

              {/* Value breakdown */}
              <Card className="p-5 flex flex-col gap-3">
                <h3 className="font-semibold text-[12px] text-fg">Value Breakdown</h3>
                {[
                  { label: 'Won', value: wonValue, color: 'bg-success', total: wonValue + lostValue + openValue },
                  { label: 'Open', value: openValue, color: 'bg-accent', total: wonValue + lostValue + openValue },
                  { label: 'Lost', value: lostValue, color: 'bg-error', total: wonValue + lostValue + openValue },
                ].map(v => (
                  <div key={v.label}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-fg2">{v.label}</span>
                      <span className="font-semibold text-fg">{usd(v.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                      <div className={`h-full rounded-full ${v.color}`} style={{ width: `${v.total > 0 ? (v.value / v.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </Card>

              {/* Quick stats */}
              <Card className="p-5 flex flex-col gap-2">
                <h3 className="font-semibold text-[12px] text-fg">Averages</h3>
                <div className="flex justify-between text-[11px]">
                  <span className="text-fg3">Avg. Deal Value</span>
                  <span className="font-medium text-fg">{won.length > 0 ? usd(Math.round(wonValue / won.length)) : '—'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-fg3">Avg. Pipeline Value</span>
                  <span className="font-medium text-fg">{open.length > 0 ? usd(Math.round(openValue / open.length)) : '—'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-fg3">Total managed</span>
                  <span className="font-medium text-fg">{usd(wonValue + lostValue + openValue)}</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
