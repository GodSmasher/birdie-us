'use client';

import { Project, projStages, projDotColors } from '@/app/demo/crm-data';

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

export function ProjectDetail({ project }: { project: Project }) {
  const barColor =
    project.stageIdx >= 6 ? 'bg-success' :
    project.stageIdx >= 4 ? 'bg-accent' :
    'bg-info';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-[18px] font-semibold text-fg">{project.cust}</div>
        <div className="text-[12px] text-fg3 mt-1">{project.addr}</div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-fg2 font-medium">Completion</span>
          <span className="text-[14px] font-bold text-fg">{project.pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-surface-3">
          <div
            className={`h-3 rounded-full ${barColor} transition-all`}
            style={{ width: `${project.pct}%` }}
          />
        </div>
      </div>

      {/* System */}
      <Section title="System">
        <Row label="Size">{project.kw} kW</Row>
        <Row label="Panels">{project.panels}</Row>
        <Row label="Inverter">{project.inverter}</Row>
      </Section>

      {/* Logistics */}
      <Section title="Logistics">
        <Row label="Crew">{project.crew}</Row>
        <Row label="Install Date">{project.date}</Row>
        <Row label="Permit #">{project.permit}</Row>
      </Section>

      {/* Stage Indicator */}
      <Section title="Project Stage">
        <div className="flex flex-col gap-2">
          {projStages.map((stage, i) => {
            const dotBg = projDotColors[i].replace('text-', 'bg-');
            const isActive = i === project.stageIdx;
            const isPast = i < project.stageIdx;
            return (
              <div key={stage} className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    isActive || isPast ? dotBg : 'bg-surface-3'
                  } ${isActive ? 'ring-2 ring-offset-1 ring-offset-surface' : ''}`}
                  style={isActive ? { boxShadow: `0 0 0 2px var(--surface), 0 0 0 4px currentColor` } : undefined}
                />
                <span
                  className={`text-[11px] ${
                    isActive ? 'text-fg font-semibold' : isPast ? 'text-fg2' : 'text-fg4'
                  }`}
                >
                  {stage}
                </span>
                {isActive && (
                  <span className="ml-auto text-[9px] font-semibold text-accent uppercase tracking-wider">Current</span>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-2 mt-8">
        <button className="flex-1 h-9 rounded-lg bg-accent text-bg text-[12px] font-semibold hover:bg-accent/90 transition-colors">
          Update Status
        </button>
        <button className="flex-1 h-9 rounded-lg bg-surface-2 border border-line text-fg2 text-[12px] font-medium hover:border-line-2 transition-colors">
          View Documents
        </button>
        <button className="flex-1 h-9 rounded-lg bg-surface-2 border border-line text-fg2 text-[12px] font-medium hover:border-line-2 transition-colors">
          Contact Customer
        </button>
      </div>
    </div>
  );
}
