import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getEmails, getEmailStats, syncEmails, type StoredEmail } from '@/app/lib/email-server';
import { googleConfigured } from '@/app/lib/google-server';

export const dynamic = 'force-dynamic';

function fmt(date?: string): string {
  if (!date) return '';
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const CATEGORY_LABELS: Record<string, { label: string; tone: 'warning' | 'success' | 'error' | 'info' | 'neutral' }> = {
  dunning_reply: { label: 'MAHNUNG', tone: 'warning' },
  payment_info: { label: 'ZAHLUNG', tone: 'success' },
  bounce: { label: 'BOUNCE', tone: 'error' },
  general: { label: 'ALLGEMEIN', tone: 'neutral' },
};

function CategoryFilter({ active }: { active?: string }) {
  const cats = [
    { key: '', label: 'Alle' },
    { key: 'dunning_reply', label: 'Mahnungen' },
    { key: 'payment_info', label: 'Zahlungen' },
    { key: 'bounce', label: 'Bounces' },
    { key: 'general', label: 'Allgemein' },
  ];
  return (
    <div className="flex gap-1.5">
      {cats.map((c) => (
        <a
          key={c.key}
          href={c.key ? `/postfach?category=${c.key}` : '/postfach'}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
            (active || '') === c.key
              ? 'bg-accent text-bg'
              : 'bg-surface-2 text-fg2 hover:bg-surface-3'
          }`}
        >
          {c.label}
        </a>
      ))}
    </div>
  );
}

function EmailRow({ email, isLast }: { email: StoredEmail; isLast: boolean }) {
  const cat = CATEGORY_LABELS[email.category] || CATEGORY_LABELS.general;
  return (
    <div className={`flex gap-4 px-5 py-3.5 hover:bg-surface-2/40 transition-colors ${!isLast ? 'border-b border-line' : ''}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        !email.is_read ? 'bg-accent-bg text-accent' : 'bg-surface-3 text-fg2'
      }`}>
        ✉
      </div>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className={`text-[13px] truncate ${!email.is_read ? 'font-semibold text-fg' : 'font-medium text-fg'}`}>
            {email.from_name || email.from_email}
          </span>
          <Pill label={cat.label} tone={cat.tone} />
          {email.matched_invoice && (
            <span className="text-[10px] font-mono text-accent bg-accent-bg px-1.5 py-0.5 rounded">
              {email.matched_invoice}
            </span>
          )}
          <span className="ml-auto text-[11px] text-fg3 shrink-0">{fmt(email.received_at)}</span>
        </div>
        <span className={`text-[13px] truncate ${!email.is_read ? 'text-fg font-medium' : 'text-fg'}`}>
          {email.subject}
        </span>
        {email.summary ? (
          <span className="text-[11px] text-fg2 truncate">{email.summary}</span>
        ) : (
          <span className="text-[11px] text-fg3 truncate">{email.snippet}</span>
        )}
        {email.intent && (
          <span className="text-[10px] text-info bg-info-bg px-1.5 py-0.5 rounded w-fit">{email.intent}</span>
        )}
      </div>
    </div>
  );
}

export default async function PostfachPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const configured = googleConfigured();

  if (!configured) {
    return (
      <>
        <Sidebar active="postfach" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Postfach" subtitle="Google Workspace · Gmail" />
          <div className="flex-1 px-8 py-7 flex flex-col gap-6">
            <ConnectGoogle />
          </div>
        </main>
      </>
    );
  }

  // Auto-sync on page load (lightweight — skips already-stored emails)
  await syncEmails(30).catch(() => {});

  const category = searchParams.category;
  const [emails, stats] = await Promise.all([
    getEmails({ category, limit: 50 }),
    getEmailStats(),
  ]);

  return (
    <>
      <Sidebar active="postfach" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Postfach"
          subtitle={`admin@volta-solaranlagen.de · ${stats.unread} ungelesen`}
        />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="flex gap-4">
            <KpiCard
              label="UNGELESEN"
              value={stats.unread.toLocaleString('de-DE')}
              sub="neue Nachrichten"
              valueColor={stats.unread > 0 ? 'text-warning' : 'text-fg'}
            />
            <KpiCard
              label="MAHN-ANTWORTEN"
              value={stats.dunningReplies.toLocaleString('de-DE')}
              sub="Kundenreaktionen"
              valueColor={stats.dunningReplies > 0 ? 'text-warning' : 'text-fg'}
            />
            <KpiCard
              label="ZAHLUNGSINFOS"
              value={stats.paymentInfos.toLocaleString('de-DE')}
              sub="Zahlungsbestätigungen"
              valueColor={stats.paymentInfos > 0 ? 'text-success' : 'text-fg'}
            />
            <KpiCard
              label="GESAMT"
              value={stats.total.toLocaleString('de-DE')}
              sub="alle Emails"
            />
          </div>

          <Card className="overflow-hidden">
            <CardHeader
              title="Posteingang"
              right={
                <div className="flex items-center gap-3">
                  <CategoryFilter active={category} />
                  <Pill label="SYNCED" tone="success" />
                </div>
              }
            />
            {emails.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-fg3">
                {category ? 'Keine Emails in dieser Kategorie' : 'Keine Emails — Sync läuft automatisch'}
              </div>
            ) : (
              emails.map((email, i) => (
                <EmailRow key={email.id} email={email} isLast={i === emails.length - 1} />
              ))
            )}
          </Card>
        </div>
      </main>
    </>
  );
}

function ConnectGoogle() {
  return (
    <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[640px] mx-auto mt-8">
      <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-accent text-xl">✉</div>
      <h2 className="font-semibold text-lg text-fg tracking-tightest">Google Workspace nicht verbunden</h2>
      <p className="text-[13px] text-fg2 leading-[20px] max-w-[460px]">
        Mit verbundenem Workspace erscheint hier das Email-Postfach live. Verbindung über OAuth
        (Client-ID/Secret + Refresh-Token) — wird als Environment-Variable hinterlegt.
      </p>
      <div className="bg-bg border border-line rounded-lg p-4 text-left w-full max-w-[460px]">
        <code className="text-[11px] text-fg2 font-mono block leading-[18px]">
          GOOGLE_CLIENT_ID=…<br />GOOGLE_CLIENT_SECRET=…<br />GOOGLE_REFRESH_TOKEN=…
        </code>
      </div>
    </Card>
  );
}
