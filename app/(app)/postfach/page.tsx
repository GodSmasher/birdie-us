import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, CardHeader, KpiCard, Pill } from '@/components/ui';
import { getMailbox } from '@/app/lib/google-server';
import { isDemoMode } from '@/app/lib/demo-mode';
import { OnboardingView } from '@/components/onboarding';
import { ONBOARDING_INBOX } from '@/app/lib/onboarding-data';

export const dynamic = 'force-dynamic';

function fmtDate(raw?: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MailRow({
  mail,
  isLast,
}: {
  mail: { id: string; from: string; subject: string; snippet: string; date?: string };
  isLast: boolean;
}) {
  return (
    <div
      className={`flex gap-4 px-5 py-3.5 hover:bg-surface-2/40 transition-colors ${
        !isLast ? 'border-b border-line' : ''
      }`}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-accent-bg text-accent">
        ✉
      </div>
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-fg truncate">
            {mail.from || '(unknown)'}
          </span>
          <span className="ml-auto text-[11px] text-fg3 shrink-0">
            {fmtDate(mail.date)}
          </span>
        </div>
        <span className="text-[13px] text-fg font-medium truncate">
          {mail.subject}
        </span>
        {mail.snippet && (
          <span className="text-[11px] text-fg3 truncate">{mail.snippet}</span>
        )}
      </div>
    </div>
  );
}

export default async function PostfachPage() {
  let mailbox = await getMailbox();

  if (!mailbox.configured) {
    if (isDemoMode()) {
      return (
        <>
          <Sidebar active="postfach" />
          <main className="flex-1 min-w-0 flex flex-col bg-bg">
            <TopBar title="Inbox" subtitle="Email · Auto-Categorization · Project Matching" />
            <div className="flex-1 px-8 py-7">
              <OnboardingView {...ONBOARDING_INBOX} />
            </div>
          </main>
        </>
      );
    }
    return (
      <>
        <Sidebar active="postfach" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Inbox" subtitle="Google Workspace · Gmail" />
          <div className="flex-1 px-8 py-7 flex flex-col gap-6">
            <ConnectHint />
          </div>
        </main>
      </>
    );
  }

  if (mailbox.error) {
    return (
      <>
        <Sidebar active="postfach" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar
            title="Inbox"
            subtitle={mailbox.account ?? 'Gmail'}
          />
          <div className="flex-1 px-8 py-7 flex flex-col gap-6">
            <Card className="p-6 flex flex-col items-center text-center gap-3 max-w-[640px] mx-auto mt-8">
              <div className="w-10 h-10 rounded-xl bg-error-bg flex items-center justify-center text-error text-lg">!</div>
              <h2 className="font-semibold text-fg">Gmail Error</h2>
              <p className="text-[13px] text-fg2">{mailbox.error}</p>
            </Card>
          </div>
        </main>
      </>
    );
  }

  const syncTime = new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <>
      <Sidebar active="postfach" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Inbox"
          subtitle={`${mailbox.account ?? 'Gmail'} · ${mailbox.unread} unread`}
        />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6">
          <div className="flex gap-4">
            <KpiCard
              label="UNREAD"
              value={mailbox.unread.toLocaleString('en-US')}
              sub="new messages"
              valueColor={mailbox.unread > 0 ? 'text-warning' : 'text-fg'}
            />
            <KpiCard
              label="TOTAL"
              value={mailbox.messagesTotal.toLocaleString('en-US')}
              sub="all messages"
            />
            <KpiCard
              label="LAST SYNC"
              value={syncTime}
              sub="server time"
            />
          </div>

          <Card className="overflow-hidden">
            <CardHeader
              title="Recent Messages"
              right={
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-fg3">
                    {mailbox.recent.length} loaded
                  </span>
                  <Pill label="LIVE" tone="success" />
                </div>
              }
            />
            {mailbox.recent.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-fg3">
                No messages in inbox
              </div>
            ) : (
              mailbox.recent.map((mail, i) => (
                <MailRow
                  key={mail.id}
                  mail={mail}
                  isLast={i === mailbox.recent.length - 1}
                />
              ))
            )}
          </Card>
        </div>
      </main>
    </>
  );
}

function ConnectHint() {
  return (
    <Card className="p-8 flex flex-col items-center text-center gap-4 max-w-[640px] mx-auto mt-8">
      <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-accent text-xl">
        ✉
      </div>
      <h2 className="font-semibold text-lg text-fg tracking-tightest">
        Google Workspace not connected
      </h2>
      <p className="text-[13px] text-fg2 leading-[20px] max-w-[460px]">
        Once connected, your email inbox will appear here live.
        Connection via OAuth (Client ID/Secret + Refresh Token) — set as
        environment variables.
      </p>
      <div className="bg-bg border border-line rounded-lg p-4 text-left w-full max-w-[460px]">
        <code className="text-[11px] text-fg2 font-mono block leading-[18px]">
          GOOGLE_CLIENT_ID=…
          <br />
          GOOGLE_CLIENT_SECRET=…
          <br />
          GOOGLE_REFRESH_TOKEN=…
        </code>
      </div>
    </Card>
  );
}
