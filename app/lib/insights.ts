// Intelligenz-Feed: data-driven insights (no AI calls).
// Analyses registrations, pipeline, and mailbox to surface actionable items.

import { getRegistrations, type Registration } from './netzanmeldung';
import { loadDashboard, type DashboardData } from './reonic-data';
import { getMailbox } from './google-server';

export type InsightSeverity = 'error' | 'warning' | 'success' | 'info';

export interface Insight {
  id: string;
  icon: string;
  severity: InsightSeverity;
  message: string;
  link: string;
}

const DAY_MS = 86_400_000;

function daysSince(iso: string): number {
  return (Date.now() - Date.parse(iso)) / DAY_MS;
}

// ── Individual checks ──────────────────────────────────────────────────

function staleRegistrations(regs: Registration[]): Insight[] {
  const stale = regs.filter(
    (r) => r.docStatus === 'pruefen' && r.startedAt && daysSince(r.startedAt) > 7,
  );
  if (stale.length === 0) return [];
  const names = stale.slice(0, 3).map((r) => r.customer).join(', ');
  return [
    {
      id: 'stale_registration',
      icon: '⏱',
      severity: 'error',
      message:
        stale.length === 1
          ? `${names}: Netzanmeldung seit >7 Tagen auf "Bitte pruefen" ohne Fortschritt`
          : `${stale.length} Netzanmeldungen seit >7 Tagen auf "Bitte pruefen" (${names})`,
      link: '/netzanmeldung',
    },
  ];
}

function missingNetzbetreiber(regs: Registration[]): Insight[] {
  const missing = regs.filter((r) => !r.netzbetreiber || r.netzbetreiber === '—');
  if (missing.length === 0) return [];
  return [
    {
      id: 'missing_nb',
      icon: '⚡',
      severity: 'warning',
      message: `${missing.length} Projekt${missing.length > 1 ? 'e' : ''} ohne zugewiesenen Netzbetreiber`,
      link: '/netzanmeldung',
    },
  ];
}

function overdueSignings(regs: Registration[]): Insight[] {
  const overdue = regs.filter((r) => {
    if (r.docStatus !== 'freigegeben' && r.docStatus !== 'hochgeladen') return false;
    // Use the latest document date or pCloud upload date as "freigegeben since"
    const latestDoc = r.documents?.at(-1)?.at;
    const latestUpload = r.pcloudUploads?.at(-1)?.uploadedAt;
    const since = latestUpload || latestDoc;
    return since && daysSince(since) > 3;
  });
  if (overdue.length === 0) return [];
  const names = overdue.slice(0, 3).map((r) => r.customer).join(', ');
  return [
    {
      id: 'overdue_signing',
      icon: '✍',
      severity: 'warning',
      message:
        overdue.length === 1
          ? `${names}: Freigegeben seit >3 Tagen, Elektriker hat noch nicht unterschrieben`
          : `${overdue.length} Projekte warten seit >3 Tagen auf Elektriker-Unterschrift (${names})`,
      link: '/netzanmeldung',
    },
  ];
}

function noFiles(regs: Registration[]): Insight[] {
  const affected = regs.filter(
    (r) =>
      r.docStatus &&
      r.docStatus !== 'offen' &&
      (!r.documents || r.documents.length === 0),
  );
  if (affected.length === 0) return [];
  return [
    {
      id: 'no_files',
      icon: '📄',
      severity: 'warning',
      message: `${affected.length} Projekt${affected.length > 1 ? 'e' : ''} ohne erzeugte Dokumente trotz aktivem Status`,
      link: '/netzanmeldung',
    },
  ];
}

function unreadEmails(unread: number): Insight[] {
  if (unread <= 5) return [];
  return [
    {
      id: 'unread_emails',
      icon: '📬',
      severity: unread > 20 ? 'error' : 'warning',
      message: `${unread} ungelesene E-Mails im Postfach`,
      link: '/email',
    },
  ];
}

function stalePipeline(data: DashboardData): Insight[] {
  // We check recent offers that are still open — if the pipeline has many open
  // offers but no recent wins, that's a warning signal. We use open count + value
  // as a proxy since individual offer dates aren't on the OfferRow type.
  const { pipeline: p } = data;
  if (!p.configured || p.open === 0) return [];
  // Heuristic: if there are open offers but zero wins, and open count is high
  if (p.open > 5 && p.won === 0) {
    return [
      {
        id: 'stale_pipeline',
        icon: '📊',
        severity: 'warning',
        message: `${p.open} offene Angebote in der Pipeline ohne bisherige Abschluesse`,
        link: '/pipeline',
      },
    ];
  }
  return [];
}

function botErrors(regs: Registration[]): Insight[] {
  const withErrors = regs.filter(
    (r) => r.botErrors && r.botErrors.length > 0 && r.botRetries && r.botRetries >= 3,
  );
  if (withErrors.length === 0) return [];
  return [
    {
      id: 'bot_errors',
      icon: '🤖',
      severity: 'error',
      message: `${withErrors.length} Netzanmeldung${withErrors.length > 1 ? 'en' : ''} mit wiederholt fehlgeschlagenem Bot`,
      link: '/netzanmeldung',
    },
  ];
}

function successInsight(): Insight {
  return {
    id: 'success',
    icon: '✅',
    severity: 'success',
    message: 'Alle Netzanmeldungen auf dem neuesten Stand — keine offenen Punkte',
    link: '/dashboard',
  };
}

// ── Public API ──────────────────────────────────────────────────────────

export async function generateInsights(): Promise<Insight[]> {
  const [regs, dashData, mailbox] = await Promise.all([
    getRegistrations(),
    loadDashboard(),
    getMailbox().catch(() => ({ configured: false, unread: 0, messagesTotal: 0, recent: [] })),
  ]);

  const insights: Insight[] = [
    ...staleRegistrations(regs),
    ...botErrors(regs),
    ...overdueSignings(regs),
    ...missingNetzbetreiber(regs),
    ...noFiles(regs),
    ...unreadEmails(mailbox.unread),
    ...stalePipeline(dashData),
  ];

  // Sort: errors first, then warnings, then info
  const order: Record<InsightSeverity, number> = { error: 0, warning: 1, info: 2, success: 3 };
  insights.sort((a, b) => order[a.severity] - order[b.severity]);

  // If nothing actionable, return a single success insight
  if (insights.length === 0) {
    return [successInsight()];
  }

  return insights.slice(0, 5);
}
