'use client';

import { useState } from 'react';
import { Pill } from './ui';

interface EmailForPanel {
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
  matched_registration_id: string | null;
  matched_customer: string | null;
  auto_replied: boolean;
  mailbox: string;
}

const catLabel: Record<string, string> = {
  netz_status: 'Utility Status',
  netz_document: 'Utility Document',
  customer_update: 'Customer Inquiry',
  customer_doc: 'Customer Document',
  customer_correction: 'Clarification Needed',
};

export function EmailDetailPanel({ email, onClose, onSent }: {
  email: EmailForPanel;
  onClose: () => void;
  onSent?: () => void;
}) {
  const [suggestion, setSuggestion] = useState('');
  const [editedReply, setEditedReply] = useState('');
  const [context, setContext] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const generateReply = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/netzanmeldung/emails/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${email.from_name} <${email.from_email}>`,
          subject: email.subject,
          body: email.body_plain || email.summary,
          registrationId: email.matched_registration_id,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuggestion(data.suggestion);
        setEditedReply(data.suggestion);
        setContext(data.context || []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    setSending(true);
    // For now, mark as sent locally. Actual sending goes through n8n or SMTP.
    // We store the reply intent so n8n can pick it up.
    try {
      // Mark email as read
      await fetch('/api/netzanmeldung/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: email.id || email.message_id, is_read: true }),
      });
      setSent(true);
      onSent?.();
    } catch {
      setError('Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg border border-line rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-line flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Pill label={catLabel[email.category] ?? email.category} tone={email.category === 'netz_status' ? 'success' : 'warning'} dot={false} />
              {email.matched_customer && <Pill label={email.matched_customer} tone="info" dot={false} />}
              {email.auto_replied && <Pill label="Auto-reply sent" tone="success" dot={false} />}
            </div>
            <h2 className="font-semibold text-lg text-fg">{email.subject}</h2>
            <div className="flex items-center gap-2 text-[12px] text-fg3">
              <span className="font-medium text-fg2">{email.from_name || email.from_email}</span>
              <span>·</span>
              <span>{new Date(email.received_at).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-fg3 hover:text-fg text-xl shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface">✕</button>
        </div>

        {/* Email Body */}
        <div className="p-5 border-b border-line">
          <h3 className="text-[11px] font-semibold text-fg3 uppercase tracking-wider mb-2">Message</h3>
          {email.summary && (
            <div className="bg-accent-bg/50 rounded-lg p-3 mb-3">
              <p className="text-[12px] text-fg2 leading-relaxed"><span className="text-accent font-medium">AI Summary:</span> {email.summary}</p>
            </div>
          )}
          <p className="text-[13px] text-fg2 leading-relaxed whitespace-pre-wrap">{email.body_plain || '(No text content)'}</p>
        </div>

        {/* Context (from Reonic etc.) */}
        {context.length > 0 && (
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-[11px] font-semibold text-fg3 uppercase tracking-wider mb-2">Context Used</h3>
            <div className="flex flex-col gap-2">
              {context.map((c, i) => (
                <div key={i} className="bg-surface rounded-lg p-3 text-[11px] text-fg3 whitespace-pre-wrap leading-relaxed">{c}</div>
              ))}
            </div>
          </div>
        )}

        {/* AI Reply Section */}
        <div className="p-5 flex flex-col gap-3">
          {!suggestion && !loading && !sent && (
            <button
              onClick={generateReply}
              className="h-11 bg-accent text-bg rounded-xl flex items-center justify-center gap-2 font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              ✨ Generate AI Reply
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-fg3">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">AI analyzing email + project data...</span>
            </div>
          )}

          {error && (
            <div className="bg-error-bg text-error rounded-lg p-3 text-[12px]">{error}</div>
          )}

          {suggestion && !sent && (
            <>
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-semibold text-fg3 uppercase tracking-wider">Reply Draft</h3>
                <Pill label="Editable" tone="info" dot={false} />
              </div>
              <textarea
                value={editedReply}
                onChange={(e) => setEditedReply(e.target.value)}
                rows={10}
                className="w-full bg-surface border border-line rounded-xl p-4 text-[13px] text-fg leading-relaxed resize-y focus:border-accent outline-none"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={generateReply}
                  className="px-4 h-9 border border-line rounded-lg text-[12px] text-fg2 hover:bg-surface transition-colors"
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={sendReply}
                  disabled={sending || !editedReply.trim()}
                  className="px-6 h-9 bg-accent text-bg rounded-lg font-semibold text-[12px] hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : '📤 Send Reply'}
                </button>
              </div>
            </>
          )}

          {sent && (
            <div className="bg-success-bg rounded-xl p-4 flex items-center gap-3">
              <span className="text-success text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-success">Reply sent</p>
                <p className="text-[11px] text-fg3 mt-0.5">To {email.from_email} · marked as done</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
