import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill, Tag } from '@/components/ui';
import { loadCatalog } from '@/app/lib/reonic-data';
import { isDemoMode } from '@/app/lib/demo-mode';
import { CatalogGuide } from '@/components/birdie-guide';

export const dynamic = 'force-dynamic';

const MAX_ROWS = 150;

const dollar = (n: number) =>
  n === 0 ? '—' : '$ ' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const typeTone: Record<string, 'success' | 'warning' | 'info' | 'accent' | 'purple' | 'neutral'> = {
  inverter: 'info',
  microinverter: 'info',
  batteryStorage: 'success',
  module: 'accent',
  wallbox: 'purple',
  heatPump: 'warning',
};

export default async function KatalogPage() {
  let { data: catalog, source } = await loadCatalog();

  if (!catalog.configured && isDemoMode()) {
    return (
      <>
        <Sidebar active="katalog" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Product Catalog" subtitle="Components · Pricing · Spec Sheets" />
          <CatalogGuide />
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar active="katalog" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Product Catalog"
          subtitle={
            catalog.configured && !catalog.error
              ? `${catalog.total.toLocaleString('en-US')} components · ${source === 'DB-Cache' ? 'from DB cache' : 'live from Aurora Solar'}`
              : 'Aurora Solar Connector · Component Master Data'
          }
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {!catalog.configured && (
            <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[640px] mx-auto mt-8">
              <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-accent text-xl">▦</div>
              <div className="flex flex-col gap-1.5">
                <h2 className="font-semibold text-lg text-fg tracking-tightest">Aurora Solar connector not connected</h2>
                <p className="text-[13px] text-fg2 leading-[20px] max-w-[460px]">
                  Once the Aurora Solar key is configured, the complete product catalog will appear here live —
                  inverters, storage, modules, wallboxes & more, automatically categorized, with retail/wholesale prices,
                  and exportable as CSV.
                </p>
              </div>
              <div className="bg-bg border border-line rounded-lg p-4 text-left w-full max-w-[460px]">
                <p className="text-[11px] font-semibold text-fg3 tracking-[0.18em] mb-2">HOW TO ACTIVATE</p>
                <code className="text-[11px] text-fg2 font-mono block leading-[18px]">
                  REONIC_API_KEY=&lt;Basic-Token&gt;<br />
                  REONIC_CLIENT_ID=&lt;Tenant-ID&gt;
                </code>
                <p className="text-[11px] text-fg3 mt-2">Set as environment variables (Vercel / local).</p>
              </div>
            </Card>
          )}

          {catalog.configured && catalog.error && (
            <Card className="p-5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-error-bg flex items-center justify-center text-error font-bold">!</div>
              <div className="flex flex-col">
                <span className="font-semibold text-[13px] text-fg">Aurora Solar unreachable</span>
                <span className="text-xs text-fg2">{catalog.error}</span>
              </div>
            </Card>
          )}

          {catalog.configured && !catalog.error && (
            <>
              {/* Type breakdown */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-sm text-fg tracking-tightest">Categories</h2>
                  <span className="text-[11px] text-fg3">automatically classified from article text</span>
                  <Pill label="LIVE" tone="success" />
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                  {catalog.byType.slice(0, 12).map((t) => (
                    <div key={t.type} className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[22px] font-semibold text-fg leading-none tracking-tightest">{t.count}</span>
                      <span className="text-[11px] text-fg2">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table */}
              <Card className="overflow-hidden">
                <div className="h-13 px-5 border-b border-line flex items-center" style={{ height: 52 }}>
                  <h3 className="font-semibold text-sm text-fg">Components</h3>
                  <span className="ml-auto text-[11px] text-fg3">
                    showing {Math.min(MAX_ROWS, catalog.total)} of {catalog.total.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_140px_160px_120px_120px] bg-surface-2 h-9 items-center px-5 text-[10px] font-semibold text-fg3 tracking-[0.18em]">
                  <span>ARTICLE</span>
                  <span>BRAND</span>
                  <span>TYPE</span>
                  <span>RETAIL NET</span>
                  <span>WHOLESALE NET</span>
                </div>
                {catalog.components.slice(0, MAX_ROWS).map((c, i) => (
                  <div
                    key={c.id}
                    className={`grid grid-cols-[1fr_140px_160px_120px_120px] min-h-[48px] items-center px-5 py-2 hover:bg-surface-2/40 transition-colors ${
                      i < Math.min(MAX_ROWS, catalog.total) - 1 ? 'border-b border-line' : ''
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="text-[13px] font-medium text-fg truncate">{c.name}</span>
                      {c.articleNr && <span className="text-[11px] text-fg3">Art. {c.articleNr}</span>}
                    </div>
                    <span className="text-xs text-fg2 truncate pr-2">{c.brand ?? '—'}</span>
                    <div>
                      <Tag label={c.typeLabel} tone={typeTone[c.type] ?? 'neutral'} />
                    </div>
                    <span className="text-[13px] font-medium text-fg">{dollar(c.price)}</span>
                    <span className="text-[13px] text-fg2">{c.purchasePrice != null ? dollar(c.purchasePrice) : '—'}</span>
                  </div>
                ))}
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
}
