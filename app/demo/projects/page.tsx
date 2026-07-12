'use client';

import { useState } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card } from '@/components/ui';
import { SlideDrawer } from '@/components/slide-drawer';
import { ProjectDetail } from '@/components/crm/project-detail';
import { projects, projStages, projDotColors, projMetrics, Project } from '../crm-data';

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const byStage = projStages.map((name, i) => ({
    name,
    dot: projDotColors[i],
    items: projects.filter(p => p.stageIdx === i),
  }));

  return (
    <>
      <CrmSidebar active="projects" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar title="Projects" subtitle="12 active installs · lead to PTO" />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Metric cards */}
          <div className="px-6 pt-5 pb-4 shrink-0">
            <div className="grid grid-cols-4 gap-3">
              {projMetrics.map(m => (
                <Card key={m.k} className="p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-medium text-fg2 tracking-[0.16em]">{m.k}</span>
                  <span className={`text-[28px] font-semibold leading-none tracking-tightest ${m.c}`}>{m.v}</span>
                </Card>
              ))}
            </div>
          </div>

          {/* Kanban board */}
          <div className="flex-1 flex gap-3 overflow-x-auto px-6 pb-4 min-h-0">
            {byStage.map(col => (
              <div key={col.name} className="flex flex-col min-w-[200px] bg-surface rounded-xl p-2 shrink-0">
                {/* Column header */}
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot.replace('text-', 'bg-')}`} />
                  <span className="text-[11px] font-semibold text-fg truncate">{col.name}</span>
                  <span className="text-[10px] text-fg3 font-medium">{col.items.length}</span>
                </div>

                {/* Project cards */}
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {col.items.map(p => {
                    const barColor =
                      p.stageIdx >= 6 ? 'bg-success' :
                      p.stageIdx >= 4 ? 'bg-accent' :
                      'bg-info';

                    return (
                      <div
                        key={p.permit}
                        onClick={() => setSelectedProject(p)}
                        className="bg-surface-2 border border-line rounded-lg p-3 flex flex-col gap-1.5 cursor-pointer hover:border-line-2 transition-colors"
                      >
                        <span className="text-[12px] font-semibold text-fg">{p.cust}</span>
                        <span className="text-[10px] text-fg3 truncate">{p.addr}</span>
                        <span className="text-[10px] text-fg2">
                          {p.kw} kW · {p.panels} panels · {p.inverter}
                        </span>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-fg2">{p.crew}</span>
                          <span className="text-fg3">{p.date}</span>
                        </div>
                        <span className="text-[9px] text-fg4">{p.permit}</span>

                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full bg-surface-3 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${barColor}`}
                            style={{ width: `${p.pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SlideDrawer
        open={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        title="Project Details"
      >
        {selectedProject && <ProjectDetail project={selectedProject} />}
      </SlideDrawer>
    </>
  );
}
