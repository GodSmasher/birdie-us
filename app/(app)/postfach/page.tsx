import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getMailbox } from '@/app/lib/google-server';

export const dynamic = 'force-dynamic';

function fmt(date?: string): string {
  if (!date) return '';
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default async function PostfachPage() {
  const mb = await getMailbox();
  return (
    <>
      <Sidebar active="postfach" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Postfach" subtitle={mb.configured && !mb.error ? `${mb.account} · ${mb.unread} ungelesen` : 'Google Workspace · Gmail'} />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          {!mb.configured && <ConnectGoogle what="Gmail" />}
          {mb.configured && mb.error && <ErrorCard msg={mb.error} />}
          {mb.configured && !mb.error && (
            <>
              <div className="flex gap-4">
                <KpiCard label="UNGELESEN" value={mb.unread.toLocaleString('de-DE')} sub="im Posteingang" valueColor={mb.unread > 0 ? 'text-warning' : 'text-fg'} />
                <KpiCard label="POSTFACH GESAMT" value={mb.messagesTotal.toLocaleString('de-DE')} sub="alle Nachrichten" />
                <KpiCard label="KONTO" value={mb.account?.split('@')[0] ?? '—'} sub={mb.account ?? ''} />
                <KpiCard label="QUELLE" value="Gmail" sub="Google Workspace · live" />
              </div>

              <Card className="overflow-hidden">
                <CardHeader title="Posteingang" right={<Pill label="LIVE" tone="success" />} />
                {mb.recent.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-fg3">Keine Nachrichten</div>
                ) : (
                  mb.recent.map((m, i) => (
                    <div key={m.id} className={`flex gap-4 px-5 py-3.5 hover:bg-surface-2/40 transition-colors ${i < mb.recent.length - 1 ? 'border-b border-line' : ''}`}>
                      <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-fg2 shrink-0">✉</div>
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-fg truncate">{m.from}</span>
                          <span className="ml-auto text-[11px] text-fg3 shrink-0">{fmt(m.date)}</span>
                        </div>
                        <span className="text-[13px] text-fg truncate">{m.subject}</span>
                        <span className="text-[11px] text-fg3 truncate">{m.snippet}</span>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function ConnectGoogle({ what }: { what: string }) {
  return (
    <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[640px] mx-auto mt-8">
      <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-accent text-xl">✉</div>
      <h2 className="font-semibold text-lg text-fg tracking-tightest">Google Workspace nicht verbunden</h2>
      <p className="text-[13px] text-fg2 leading-[20px] max-w-[460px]">
        Mit verbundenem Workspace erscheint hier {what} live. Verbindung über OAuth (Client-ID/Secret + Refresh-Token)
        — wird als Environment-Variable hinterlegt.
      </p>
      <div className="bg-bg border border-line rounded-lg p-4 text-left w-full max-w-[460px]">
        <code className="text-[11px] text-fg2 font-mono block leading-[18px]">
          GOOGLE_CLIENT_ID=…<br />GOOGLE_CLIENT_SECRET=…<br />GOOGLE_REFRESH_TOKEN=…
        </code>
      </div>
    </Card>
  );
}

function ErrorCard({ msg }: { msg: string }) {
  return (
    <Card className="p-5 flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-error-bg flex items-center justify-center text-error font-bold">!</div>
      <div className="flex flex-col"><span className="font-semibold text-[13px] text-fg">Google nicht erreichbar</span><span className="text-xs text-fg2">{msg}</span></div>
    </Card>
  );
}
