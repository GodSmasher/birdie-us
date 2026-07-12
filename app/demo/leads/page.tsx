'use client';

import { useState } from 'react';
import { CrmSidebar } from '@/components/crm-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { SlideDrawer } from '@/components/slide-drawer';
import { LeadDetail } from '@/components/crm/lead-detail';
import { leads, leadSources, leadToneMap, avPalette, Lead } from '../crm-data';

function scoreTone(score: number) {
  if (score >= 80) return 'success' as const;
  if (score >= 65) return 'warning' as const;
  if (score >= 55) return 'info' as const;
  return 'neutral' as const;
}

const filters = ['Source', 'Status', 'Assigned to', 'Date range', 'Location'];
const bulkActions = ['Assign', 'Tag', 'Export', 'Archive'];

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  return (
    <>
      <CrmSidebar active="leads" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Leads" subtitle="New prospects · before they become deals" />
        <div className="flex-1 px-8 py-6 overflow-y-auto">

          {/* Lead count */}
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-[14px] font-semibold text-fg">247 leads</h2>
          </div>

          {/* Source breakdown bar */}
          <Card className="p-5 mb-5">
            <div className="flex h-3 rounded-full overflow-hidden">
              {leadSources.map((s) => (
                <div key={s.label} className={`${s.color}`} style={{ width: s.pct }} />
              ))}
            </div>
            <div className="flex gap-5 mt-3">
              {leadSources.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-[10px] text-fg3 font-medium">{s.label}</span>
                  <span className="text-[10px] text-fg4">{s.pct}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Filter row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                className="h-7 px-2.5 text-[11px] font-medium text-fg2 bg-surface border border-line rounded-lg hover:border-line-2 transition-colors"
              >
                {f}
              </button>
            ))}
            <div className="w-px h-5 bg-line mx-1" />
            {bulkActions.map((a) => (
              <button
                key={a}
                className="h-7 px-2.5 text-[11px] font-medium text-fg3 hover:text-fg2 transition-colors"
              >
                {a}
              </button>
            ))}
            <button className="ml-auto h-7 px-3 text-[11px] font-semibold text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors">
              Add lead
            </button>
          </div>

          {/* Table */}
          <Card className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-surface">
                  {['NAME', 'CONTACT', 'SOURCE', 'LOCATION', 'INTEREST', 'SCORE', 'ASSIGNED', 'CREATED', 'STATUS'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedLead(lead)}
                    className="border-b border-line hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    {/* Name + avatar */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${avPalette[lead.avIdx][0]} ${avPalette[lead.avIdx][1]} text-[10px] font-bold flex items-center justify-center shrink-0`}
                        >
                          {lead.init}
                        </div>
                        <span className="text-[12px] font-medium text-fg whitespace-nowrap">
                          {lead.name}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-2.5">
                      <div className="text-[11px] text-fg2">{lead.email}</div>
                      <div className="text-[10px] text-fg4">{lead.phone}</div>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-2.5 text-[11px] text-fg2 whitespace-nowrap">
                      {lead.source}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-2.5 text-[11px] text-fg3 whitespace-nowrap">
                      {lead.loc}
                    </td>

                    {/* Interest */}
                    <td className="px-4 py-2.5 text-[11px] text-fg2">
                      {lead.interest}
                    </td>

                    {/* Score */}
                    <td className="px-4 py-2.5">
                      <Pill label={String(lead.score)} tone={scoreTone(lead.score)} dot={false} />
                    </td>

                    {/* Assigned */}
                    <td className="px-4 py-2.5 text-[11px] text-fg3 whitespace-nowrap">
                      {lead.assigned}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-2.5 text-[11px] text-fg4 whitespace-nowrap">
                      {lead.created}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2.5">
                      <Pill label={lead.status.toUpperCase()} tone={leadToneMap[lead.status]} dot />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </main>

      <SlideDrawer
        open={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        title="Lead Details"
      >
        {selectedLead && <LeadDetail lead={selectedLead} />}
      </SlideDrawer>
    </>
  );
}
