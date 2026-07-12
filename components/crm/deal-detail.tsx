'use client';

import { Deal, pipeStages, pipeBgColors, usd } from '@/app/demo/crm-data';

const heatConfig = {
  hot: { color: 'bg-success', label: 'Hot', text: 'text-success' },
  warm: { color: 'bg-warning', label: 'Warm', text: 'text-warning' },
  cold: { color: 'bg-error', label: 'Cold', text: 'text-error' },
} as const;

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

export function DealDetail({ deal }: { deal: Deal }) {
  const heat = heatConfig[deal.heat];

  return (
    <div>
      {/* Avatar + Name header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-[16px] font-bold text-fg2 shrink-0">
          {deal.init}
        </div>
        <div>
          <div className="text-[16px] font-semibold text-fg">{deal.cust}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${heat.color}`} />
            <span className={`text-[11px] font-medium ${heat.text}`}>{heat.label}</span>
          </div>
        </div>
      </div>

      {/* Large value */}
      <div className="text-[32px] font-bold text-fg tracking-tight mb-6">
        ${deal.value.toLocaleString()}
      </div>

      {/* Deal Info */}
      <Section title="Deal Info">
        <Row label="Customer">{deal.cust}</Row>
        <Row label="Deal Value">{usd(deal.value)}</Row>
        <Row label="System Size">{deal.kw} kW</Row>
        <Row label="Days in Stage">{deal.days}d</Row>
        <Row label="Sales Rep">{deal.rep}</Row>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-fg3">Heat Level</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${heat.color}`} />
            <span className={`text-[12px] font-medium ${heat.text}`}>{heat.label}</span>
          </div>
        </div>
      </Section>

      {/* Stage Progress */}
      <Section title="Pipeline Stage">
        <div className="flex items-center gap-1.5">
          {pipeStages.slice(0, -1).map((stage, i) => (
            <div key={stage} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-2 rounded-full ${
                  i <= deal.stageIdx ? pipeBgColors[i] : 'bg-surface-3'
                }`}
              />
              <span
                className={`text-[8px] text-center leading-tight ${
                  i === deal.stageIdx ? 'text-fg font-semibold' : 'text-fg4'
                }`}
              >
                {stage}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-2 mt-8">
        <button className="flex-1 h-9 rounded-lg bg-accent text-bg text-[12px] font-semibold hover:bg-accent/90 transition-colors">
          Move to Next Stage
        </button>
        <button className="flex-1 h-9 rounded-lg bg-surface-2 border border-line text-fg2 text-[12px] font-medium hover:border-line-2 transition-colors">
          Add Note
        </button>
        <button className="flex-1 h-9 rounded-lg bg-surface-2 border border-line text-fg2 text-[12px] font-medium hover:border-line-2 transition-colors">
          Schedule Follow-up
        </button>
      </div>
    </div>
  );
}
