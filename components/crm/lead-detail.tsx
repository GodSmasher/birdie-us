'use client';

import { Lead, leadToneMap } from '@/app/demo/crm-data';
import { Pill } from '@/components/ui';

function scoreTone(score: number) {
  if (score >= 80) return 'success' as const;
  if (score >= 65) return 'warning' as const;
  if (score >= 55) return 'info' as const;
  return 'neutral' as const;
}

const scoreBarColor: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  neutral: 'bg-fg3',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] font-semibold text-fg3 uppercase tracking-[0.16em] mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-fg3">{label}</span>
      <span className="text-[12px] text-fg font-medium">{children}</span>
    </div>
  );
}

export function LeadDetail({ lead }: { lead: Lead }) {
  const tone = scoreTone(lead.score);

  return (
    <div>
      {/* Avatar + Name header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-[16px] font-bold text-fg2 shrink-0">
          {lead.init}
        </div>
        <div>
          <div className="text-[16px] font-semibold text-fg">{lead.name}</div>
          <div className="text-[12px] text-fg3">{lead.loc}</div>
        </div>
      </div>

      {/* Contact Info */}
      <Section title="Contact Info">
        <Row label="Email">{lead.email}</Row>
        <Row label="Phone">{lead.phone}</Row>
      </Section>

      {/* Lead Info */}
      <Section title="Lead Info">
        <Row label="Source">{lead.source}</Row>
        <Row label="Location">{lead.loc}</Row>
        <Row label="Interest">{lead.interest}</Row>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-fg3">Score</span>
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-2 rounded-full bg-surface-3">
              <div
                className={`h-2 rounded-full ${scoreBarColor[tone]}`}
                style={{ width: `${lead.score}%` }}
              />
            </div>
            <span className="text-[12px] font-semibold text-fg">{lead.score}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-fg3">Status</span>
          <Pill label={lead.status.toUpperCase()} tone={leadToneMap[lead.status]} dot />
        </div>
      </Section>

      {/* Assignment */}
      <Section title="Assignment">
        <Row label="Assigned Rep">{lead.assigned}</Row>
        <Row label="Created">{lead.created}</Row>
      </Section>

      {/* Actions */}
      <div className="flex gap-2 mt-8">
        <button className="flex-1 h-9 rounded-lg bg-accent text-bg text-[12px] font-semibold hover:bg-accent/90 transition-colors">
          Convert to Deal
        </button>
        <button className="flex-1 h-9 rounded-lg bg-surface-2 border border-line text-fg2 text-[12px] font-medium hover:border-line-2 transition-colors">
          Archive
        </button>
        <button className="flex-1 h-9 rounded-lg bg-surface-2 border border-line text-fg2 text-[12px] font-medium hover:border-line-2 transition-colors">
          Edit
        </button>
      </div>
    </div>
  );
}
