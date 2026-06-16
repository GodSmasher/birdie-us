import { type GeneratedDoc, type PCloudUpload, type BotError, type PortalUpdate } from '@/app/lib/netzanmeldung';
import type { NetzEmail } from '@/app/lib/netz-email';

interface TimelineEvent {
  at: string;
  icon: string;
  label: string;
  detail?: string;
  tone: 'info' | 'success' | 'warning' | 'error' | 'neutral';
}

function buildTimeline({
  startedAt,
  documents,
  pcloudUploads,
  botErrors,
  emails,
  portalUpdates,
}: {
  startedAt?: string;
  documents?: GeneratedDoc[];
  pcloudUploads?: PCloudUpload[];
  botErrors?: BotError[];
  emails?: NetzEmail[];
  portalUpdates?: PortalUpdate[];
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (startedAt) {
    events.push({ at: startedAt, icon: '＋', label: 'Registration created', tone: 'neutral' });
  }

  for (const d of documents ?? []) {
    events.push({
      at: d.at,
      icon: '📄',
      label: `${d.form.toUpperCase()} draft generated`,
      detail: d.source === 'bot' ? 'by bot' : undefined,
      tone: 'info',
    });
  }

  for (const u of pcloudUploads ?? []) {
    events.push({
      at: u.uploadedAt,
      icon: '☁',
      label: `${u.filename} uploaded`,
      detail: 'to pCloud',
      tone: 'info',
    });
    if (u.signedAt) {
      events.push({
        at: u.signedAt,
        icon: '✓',
        label: `${u.filename} signed`,
        tone: 'success',
      });
    }
  }

  for (const e of botErrors ?? []) {
    events.push({
      at: e.at,
      icon: '✗',
      label: `Bot error: ${e.step}`,
      detail: e.error,
      tone: 'error',
    });
  }

  // Portal updates from bot
  for (const u of portalUpdates ?? []) {
    const icon = u.type === 'status' ? '🌐' : u.type === 'document' ? '📋' : u.type === 'error' ? '⚠' : '💬';
    const tone = u.type === 'error' ? 'error' as const : u.type === 'status' ? 'success' as const : 'info' as const;
    events.push({
      at: u.at,
      icon,
      label: `Portal: ${u.content.slice(0, 80)}${u.content.length > 80 ? '…' : ''}`,
      detail: u.source,
      tone,
    });
  }

  // Emails
  for (const e of emails ?? []) {
    const catLabel = e.category === 'netz_status' ? 'Utility Status'
      : e.category === 'customer_update' ? 'Customer Inquiry'
      : e.category === 'customer_doc' ? 'Document'
      : e.category === 'customer_correction' ? 'Clarification Needed'
      : e.category === 'netz_document' ? 'Utility Document'
      : 'Email';
    const tone = e.category === 'netz_status' ? 'success' as const
      : e.category.startsWith('customer') ? 'info' as const
      : 'neutral' as const;
    events.push({
      at: e.received_at,
      icon: '📧',
      label: `${catLabel}: ${e.subject}`,
      detail: [
        e.from_name || e.from_email,
        e.summary,
        e.auto_replied ? '→ Auto-reply sent' : undefined,
      ].filter(Boolean).join(' · '),
      tone,
    });
  }

  events.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return events;
}

const toneColors: Record<TimelineEvent['tone'], string> = {
  info: 'text-accent border-accent/30',
  success: 'text-success border-success/30',
  warning: 'text-warning border-warning/30',
  error: 'text-error border-error/30',
  neutral: 'text-fg3 border-line',
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export function Timeline({
  startedAt,
  documents,
  pcloudUploads,
  botErrors,
  emails,
  portalUpdates,
}: {
  startedAt?: string;
  documents?: GeneratedDoc[];
  pcloudUploads?: PCloudUpload[];
  botErrors?: BotError[];
  emails?: NetzEmail[];
  portalUpdates?: PortalUpdate[];
}) {
  const events = buildTimeline({ startedAt, documents, pcloudUploads, botErrors, emails, portalUpdates });

  if (events.length === 0) {
    return <p className="text-[11px] text-fg4">No events yet.</p>;
  }

  return (
    <div className="flex flex-col gap-0">
      {events.map((ev, i) => (
        <div key={`${ev.at}-${i}`} className="flex gap-3 items-start">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${toneColors[ev.tone]}`}>
              {ev.icon}
            </div>
            {i < events.length - 1 && <div className="w-px h-full min-h-[24px] bg-line" />}
          </div>
          <div className="flex flex-col gap-0.5 pb-4 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-fg">{ev.label}</span>
            </div>
            {ev.detail && <span className="text-[11px] text-fg3 leading-tight">{ev.detail}</span>}
            <span className="text-[10px] text-fg4">{fmt(ev.at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
