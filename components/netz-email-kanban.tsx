'use client';

import { useState } from 'react';
import { Pill } from './ui';
import { EmailDetailPanel } from './email-detail-panel';

interface NetzEmailCard {
  id?: string;
  message_id: string;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  body_plain: string;
  summary: string;
  category: string;
  received_at: string;
  is_read: boolean;
  matched_registration_id: string | null;
  matched_customer: string | null;
  auto_replied: boolean;
  mailbox: string;
}

const COLUMNS = [
  { id: 'neu', label: 'Inbox', icon: '📥', tone: 'warning' as const },
  { id: 'bearbeitung', label: 'In Progress', icon: '🔄', tone: 'info' as const },
  { id: 'erledigt', label: 'Done', icon: '✅', tone: 'success' as const },
];

const catLabel: Record<string, string> = {
  netz_status: 'Utility Status',
  netz_document: 'Utility Document',
  customer_update: 'Customer',
  customer_doc: 'Document',
  customer_correction: 'Clarification',
  bounce: 'Bounce',
  general: 'General',
};

const catTone: Record<string, string> = {
  netz_status: 'success',
  customer_update: 'accent',
  customer_doc: 'purple',
  customer_correction: 'warning',
  netz_document: 'info',
};

function EmailCard({ email, onMove, onOpen }: { email: NetzEmailCard & { _col: string }; onMove: (id: string, to: string) => void; onOpen: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const nextCol = email._col === 'neu' ? 'bearbeitung' : email._col === 'bearbeitung' ? 'erledigt' : null;
  const prevCol = email._col === 'erledigt' ? 'bearbeitung' : email._col === 'bearbeitung' ? 'neu' : null;

  return (
    <div className="bg-bg border border-line rounded-xl p-3 flex flex-col gap-2 hover:border-accent/40 transition-colors cursor-pointer" onClick={onOpen}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <Pill label={catLabel[email.category] ?? email.category} tone={(catTone[email.category] ?? 'neutral') as 'success' | 'info' | 'warning' | 'accent' | 'neutral'} dot={false} />
          {email.auto_replied && <Pill label="Auto-Reply" tone="success" dot={false} />}
          {email.matched_customer && <Pill label={email.matched_customer} tone="info" dot={false} />}
        </div>
        <span className="text-[10px] text-fg4 shrink-0 whitespace-nowrap">
          {new Date(email.received_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] text-fg3">{email.from_name || email.from_email}</span>
        <p className="text-[12px] font-medium text-fg leading-tight">{email.subject}</p>
      </div>

      {email.summary && (
        <p className={`text-[11px] text-fg3 leading-[15px] ${expanded ? '' : 'line-clamp-2'}`}>{email.summary}</p>
      )}

      {!email.matched_registration_id && email.category !== 'general' && (
        <span className="text-[10px] text-warning font-medium">⚠ Unmatched</span>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-line mt-1" onClick={(e) => e.stopPropagation()}>
        {email.summary && (
          <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-fg3 hover:text-fg2">
            {expanded ? 'Less' : 'Details'}
          </button>
        )}
        <div className="flex-1" />
        {prevCol && (
          <button onClick={() => onMove((email.id || email.message_id), prevCol)} className="text-[10px] text-fg3 hover:text-fg2">
            ← Back
          </button>
        )}
        {nextCol && (
          <button onClick={() => onMove((email.id || email.message_id), nextCol)} className="text-[10px] font-medium text-accent hover:text-accent/80">
            {nextCol === 'bearbeitung' ? 'Process →' : 'Done ✓'}
          </button>
        )}
      </div>
    </div>
  );
}

export function NetzEmailKanban({ emails }: { emails: NetzEmailCard[] }) {
  const [selectedEmail, setSelectedEmail] = useState<NetzEmailCard | null>(null);

  // Local state for column assignment (persisted via API on move)
  const [colMap, setColMap] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const e of emails) {
      const key = e.id || e.message_id;
      m[key] = e.is_read ? 'bearbeitung' : 'neu';
    }
    return m;
  });

  const handleMove = async (id: string, to: string) => {
    setColMap((prev) => ({ ...prev, [id]: to }));
    // Mark as read when moving out of "neu"
    if (to !== 'neu') {
      try {
        await fetch('/api/netzanmeldung/emails', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, is_read: true }),
        });
      } catch { /* best effort */ }
    }
  };

  const emailsWithCol = emails
    .filter((e) => e.category !== 'general')
    .map((e) => ({ ...e, _col: colMap[e.id || e.message_id] ?? 'neu' }));

  if (emailsWithCol.length === 0) {
    return <p className="text-[11px] text-fg4">No interconnection-related emails.</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const cards = emailsWithCol.filter((e) => e._col === col.id);
        return (
          <div key={col.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span>{col.icon}</span>
              <h3 className="font-semibold text-[13px] text-fg">{col.label}</h3>
              <Pill label={`${cards.length}`} tone={col.tone} dot={false} />
            </div>
            <div className="flex flex-col gap-2 min-h-[100px] bg-surface rounded-xl p-2 border border-line">
              {cards.length === 0 ? (
                <p className="text-[10px] text-fg4 text-center py-4">Empty</p>
              ) : (
                cards.map((e) => <EmailCard key={e.id || e.message_id} email={e} onMove={handleMove} onOpen={() => setSelectedEmail(e)} />)
              )}
            </div>
          </div>
        );
      })}

      {selectedEmail && (
        <EmailDetailPanel
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onSent={() => {
            handleMove(selectedEmail.id || selectedEmail.message_id, 'erledigt');
            setSelectedEmail(null);
          }}
        />
      )}
    </div>
  );
}
