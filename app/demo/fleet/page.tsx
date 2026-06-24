'use client';

import { useState } from 'react';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill, Tag } from '@/components/ui';

interface CrewMember {
  name: string;
  role: string;
  certifications: string[];
}

interface Vehicle {
  id: string;
  type: string;
  plate: string;
  status: 'active' | 'maintenance' | 'available';
}

interface Job {
  id: string;
  customer: string;
  address: string;
  type: 'install' | 'inspection' | 'survey' | 'maintenance';
  systemKw: number;
  scheduledDate: string;
  timeSlot: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  notes: string;
}

interface Crew {
  id: string;
  name: string;
  lead: string;
  status: 'on_job' | 'available' | 'off_duty';
  members: CrewMember[];
  vehicle: Vehicle;
  currentJob: Job | null;
  todayJobs: Job[];
  completedToday: number;
  weeklyHours: number;
}

const CREWS: Crew[] = [
  {
    id: 'C-01',
    name: 'Alpha Crew',
    lead: 'Jake Morrison',
    status: 'on_job',
    members: [
      { name: 'Jake Morrison', role: 'Lead Installer', certifications: ['NABCEP PV', 'OSHA 30', 'NEC 690'] },
      { name: 'Tyler Rodriguez', role: 'Installer', certifications: ['NABCEP PV', 'OSHA 10'] },
      { name: 'Chris Davis', role: 'Electrician', certifications: ['Master Electrician TN', 'NEC 690'] },
    ],
    vehicle: { id: 'V-01', type: 'Ford F-350 + Trailer', plate: 'TN-4521-R', status: 'active' },
    currentJob: {
      id: 'J-2001', customer: 'Thompson Residence', address: '782 Oak Hill Rd, Nashville, TN 37214',
      type: 'install', systemKw: 8.4, scheduledDate: '2026-06-24', timeSlot: '7:30 AM – 4:00 PM',
      status: 'in_progress', notes: 'Day 1 of 2 — racking + panel mount. 21x REC Alpha Pure R 400W',
    },
    todayJobs: [
      { id: 'J-2001', customer: 'Thompson Residence', address: '782 Oak Hill Rd', type: 'install', systemKw: 8.4, scheduledDate: '2026-06-24', timeSlot: '7:30 AM – 4:00 PM', status: 'in_progress', notes: 'Day 1 of 2' },
    ],
    completedToday: 0,
    weeklyHours: 32,
  },
  {
    id: 'C-02',
    name: 'Bravo Crew',
    lead: 'Marcus Williams',
    status: 'on_job',
    members: [
      { name: 'Marcus Williams', role: 'Lead Installer', certifications: ['NABCEP PV', 'OSHA 30'] },
      { name: 'Aiden Park', role: 'Installer', certifications: ['NABCEP PV', 'OSHA 10'] },
      { name: 'Sam Nguyen', role: 'Apprentice', certifications: ['OSHA 10'] },
    ],
    vehicle: { id: 'V-02', type: 'Chevy Silverado 2500', plate: 'TN-7834-S', status: 'active' },
    currentJob: {
      id: 'J-2003', customer: 'Clark Residence', address: '3322 Nolensville Pike, Nashville, TN 37211',
      type: 'install', systemKw: 9.6, scheduledDate: '2026-06-24', timeSlot: '8:00 AM – 5:00 PM',
      status: 'in_progress', notes: 'Day 2 of 2 — electrical + inverter. Enphase IQ8M microinverters',
    },
    todayJobs: [
      { id: 'J-2003', customer: 'Clark Residence', address: '3322 Nolensville Pike', type: 'install', systemKw: 9.6, scheduledDate: '2026-06-24', timeSlot: '8:00 AM – 5:00 PM', status: 'in_progress', notes: 'Day 2 of 2' },
    ],
    completedToday: 0,
    weeklyHours: 36,
  },
  {
    id: 'C-03',
    name: 'Survey Team',
    lead: 'Rachel Kim',
    status: 'on_job',
    members: [
      { name: 'Rachel Kim', role: 'Survey Lead', certifications: ['NABCEP PV', 'Aurora Solar'] },
      { name: 'Luis Hernandez', role: 'Survey Tech', certifications: ['Drone FAA Part 107'] },
    ],
    vehicle: { id: 'V-03', type: 'Toyota Tacoma', plate: 'TN-2156-T', status: 'active' },
    currentJob: {
      id: 'J-2005', customer: 'Brooks Residence', address: '2341 Murfreesboro Pike, Nashville, TN 37217',
      type: 'survey', systemKw: 11.4, scheduledDate: '2026-06-24', timeSlot: '9:00 AM – 12:00 PM',
      status: 'in_progress', notes: 'Drone survey + shade analysis. Two-story, complex roof geometry',
    },
    todayJobs: [
      { id: 'J-2005', customer: 'Brooks Residence', address: '2341 Murfreesboro Pike', type: 'survey', systemKw: 11.4, scheduledDate: '2026-06-24', timeSlot: '9:00 AM – 12:00 PM', status: 'in_progress', notes: 'Drone survey' },
      { id: 'J-2006', customer: 'Foster Residence', address: '1876 Dickerson Pike', type: 'survey', systemKw: 5.6, scheduledDate: '2026-06-24', timeSlot: '1:30 PM – 3:30 PM', status: 'scheduled', notes: 'Ground mount assessment' },
    ],
    completedToday: 0,
    weeklyHours: 28,
  },
  {
    id: 'C-04',
    name: 'Inspection Crew',
    lead: 'Dave Patterson',
    status: 'available',
    members: [
      { name: 'Dave Patterson', role: 'QA Inspector', certifications: ['NABCEP PV', 'NEC 690', 'IEEE 1547'] },
    ],
    vehicle: { id: 'V-04', type: 'Honda CR-V', plate: 'TN-9012-U', status: 'available' },
    currentJob: null,
    todayJobs: [
      { id: 'J-2007', customer: 'Rivera Residence', address: '1204 Briley Pkwy', type: 'inspection', systemKw: 6.8, scheduledDate: '2026-06-24', timeSlot: '2:00 PM – 3:30 PM', status: 'scheduled', notes: 'Pre-NES inspection — verify rapid shutdown, labeling' },
    ],
    completedToday: 1,
    weeklyHours: 24,
  },
];

const UPCOMING_JOBS: Job[] = [
  { id: 'J-3001', customer: 'Thompson Residence', address: '782 Oak Hill Rd', type: 'install', systemKw: 8.4, scheduledDate: '2026-06-25', timeSlot: '7:30 AM – 2:00 PM', status: 'scheduled', notes: 'Day 2 — electrical + commissioning' },
  { id: 'J-3002', customer: 'Martinez Residence', address: '4521 Elm Creek Dr', type: 'survey', systemKw: 10.2, scheduledDate: '2026-06-25', timeSlot: '9:00 AM – 12:00 PM', status: 'scheduled', notes: 'Site survey + Aurora design' },
  { id: 'J-3003', customer: 'Rivera Residence', address: '1204 Briley Pkwy', type: 'inspection', systemKw: 6.8, scheduledDate: '2026-06-27', timeSlot: '10:00 AM – 11:30 AM', status: 'scheduled', notes: 'NES final inspection' },
  { id: 'J-3004', customer: 'Washington Residence', address: '567 Lebanon Pike', type: 'survey', systemKw: 9.0, scheduledDate: '2026-06-27', timeSlot: '1:00 PM – 3:00 PM', status: 'scheduled', notes: 'Initial site survey' },
];

const JOB_TYPE_TONE: Record<string, 'accent' | 'info' | 'warning' | 'success'> = { install: 'accent', survey: 'info', inspection: 'warning', maintenance: 'success' };
const STATUS_TONE: Record<string, 'success' | 'warning' | 'neutral' | 'accent'> = { on_job: 'accent', available: 'success', off_duty: 'neutral' };
const VEHICLE_TONE: Record<string, 'success' | 'warning' | 'neutral'> = { active: 'success', maintenance: 'warning', available: 'neutral' };

export default function FleetPage() {
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);

  const activeCrews = CREWS.filter(c => c.status === 'on_job').length;
  const totalMembers = CREWS.reduce((a, c) => a + c.members.length, 0);
  const todayJobs = CREWS.reduce((a, c) => a + c.todayJobs.length, 0);
  const completedToday = CREWS.reduce((a, c) => a + c.completedToday, 0);

  return (
    <>
      <DemoSidebar active="fleet" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg h-screen overflow-hidden">
        <TopBar title="Fleet & Crews" subtitle="ReNew Solar Solutions · Nashville, TN · Field Operations" />

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* KPIs */}
          <div className="px-6 pt-5 pb-3 shrink-0">
            <div className="grid grid-cols-5 gap-3">
              <KpiCard label="CREWS ACTIVE" value={`${activeCrews}/${CREWS.length}`} sub="on job today" valueColor="text-success" />
              <KpiCard label="FIELD STAFF" value={String(totalMembers)} sub={`${CREWS.length} crews`} />
              <KpiCard label="TODAY'S JOBS" value={String(todayJobs)} sub={`${completedToday} completed`} />
              <KpiCard label="VEHICLES" value={`${CREWS.filter(c => c.vehicle.status === 'active').length}/${CREWS.length}`} sub="deployed" valueColor="text-accent" />
              <KpiCard label="AVG WEEKLY HRS" value={`${Math.round(CREWS.reduce((a, c) => a + c.weeklyHours, 0) / CREWS.length)}`} sub="per crew" />
            </div>
          </div>

          {/* Crew Cards */}
          <div className="px-6 pb-3 shrink-0">
            <p className="text-[9px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-2">CREWS</p>
            <div className="grid grid-cols-2 gap-3">
              {CREWS.map(crew => (
                <Card
                  key={crew.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedCrew?.id === crew.id ? 'border-accent bg-accent/5' : 'hover:border-line-2'
                  }`}
                  onClick={() => setSelectedCrew(selectedCrew?.id === crew.id ? null : crew)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-fg">{crew.name}</h3>
                      <Pill label={crew.status.replace('_', ' ').toUpperCase()} tone={STATUS_TONE[crew.status]} dot={false} />
                    </div>
                    <span className="text-[10px] text-fg3">{crew.id}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-fg3">Lead:</span>
                      <span className="text-[11px] font-medium text-fg">{crew.lead}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-fg3">Team:</span>
                      <span className="text-[11px] text-fg">{crew.members.length} members</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Tag label={crew.vehicle.type} tone="neutral" />
                    <Pill label={crew.vehicle.status.toUpperCase()} tone={VEHICLE_TONE[crew.vehicle.status]} dot={false} />
                    <span className="text-[9px] text-fg4 ml-auto">{crew.vehicle.plate}</span>
                  </div>

                  {crew.currentJob ? (
                    <div className="bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag label={crew.currentJob.type.toUpperCase()} tone={JOB_TYPE_TONE[crew.currentJob.type]} />
                        <span className="text-[11px] font-medium text-fg">{crew.currentJob.customer}</span>
                      </div>
                      <p className="text-[10px] text-fg3">{crew.currentJob.address} · {crew.currentJob.timeSlot}</p>
                      <p className="text-[9px] text-fg3 mt-1">{crew.currentJob.notes}</p>
                    </div>
                  ) : (
                    <div className="bg-success/5 border border-success/20 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-success font-medium">Available</p>
                      <p className="text-[10px] text-fg3">
                        {crew.todayJobs.length > 0
                          ? `Next: ${crew.todayJobs[0].customer} at ${crew.todayJobs[0].timeSlot}`
                          : 'No more jobs scheduled today'}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Jobs */}
          <div className="px-6 pb-6 shrink-0">
            <p className="text-[9px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-2">UPCOMING JOBS</p>
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-surface">
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Job</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Type</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Date</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Time</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">System</th>
                    <th className="px-4 py-2.5 text-[10px] text-fg4 uppercase tracking-wider font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {UPCOMING_JOBS.map(j => (
                    <tr key={j.id} className="border-b border-line hover:bg-surface transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="text-[11px] font-medium text-fg">{j.customer}</div>
                        <div className="text-[10px] text-fg3">{j.address}</div>
                      </td>
                      <td className="px-4 py-2.5"><Tag label={j.type.toUpperCase()} tone={JOB_TYPE_TONE[j.type]} /></td>
                      <td className="px-4 py-2.5 text-[11px] text-fg">{new Date(j.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 py-2.5 text-[11px] text-fg2">{j.timeSlot}</td>
                      <td className="px-4 py-2.5 text-[11px] text-fg">{j.systemKw} kW</td>
                      <td className="px-4 py-2.5 text-[10px] text-fg3 max-w-[200px] truncate">{j.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>

        {/* Crew detail overlay */}
        {selectedCrew && (
          <>
            <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setSelectedCrew(null)} />
            <div className="fixed top-0 right-0 h-full w-[480px] bg-bg border-l border-line shadow-2xl z-40 flex flex-col overflow-y-auto">
              <div className="px-5 py-4 border-b border-line flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-fg">{selectedCrew.name}</h2>
                    <Pill label={selectedCrew.status.replace('_', ' ').toUpperCase()} tone={STATUS_TONE[selectedCrew.status]} dot={false} />
                  </div>
                  <p className="text-[11px] text-fg3 mt-0.5">Lead: {selectedCrew.lead} · {selectedCrew.id}</p>
                </div>
                <button onClick={() => setSelectedCrew(null)} className="text-fg3 hover:text-fg text-[18px] w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface">×</button>
              </div>

              {/* Team Members */}
              <div className="px-5 py-4 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-2">Team Members</p>
                <div className="flex flex-col gap-2">
                  {selectedCrew.members.map(m => (
                    <div key={m.name} className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-fg">{m.name}</span>
                        <span className="text-[10px] text-fg3 ml-2">{m.role}</span>
                      </div>
                      <div className="flex gap-1">
                        {m.certifications.map(c => (
                          <Tag key={c} label={c} tone="success" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle */}
              <div className="px-5 py-3 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-1">Vehicle</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-fg">{selectedCrew.vehicle.type}</span>
                  <span className="text-[10px] text-fg3">{selectedCrew.vehicle.plate}</span>
                  <Pill label={selectedCrew.vehicle.status.toUpperCase()} tone={VEHICLE_TONE[selectedCrew.vehicle.status]} dot={false} />
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="px-5 py-4 border-b border-line shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-2">Today&apos;s Schedule</p>
                {selectedCrew.todayJobs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedCrew.todayJobs.map(j => (
                      <div key={j.id} className={`rounded-lg px-3 py-2 border ${j.status === 'in_progress' ? 'bg-accent/5 border-accent/20' : 'bg-surface border-line'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Tag label={j.type.toUpperCase()} tone={JOB_TYPE_TONE[j.type]} />
                          <span className="text-[11px] font-medium text-fg">{j.customer}</span>
                          {j.status === 'in_progress' && <Pill label="IN PROGRESS" tone="accent" dot={false} />}
                        </div>
                        <p className="text-[10px] text-fg3">{j.address} · {j.timeSlot}</p>
                        <p className="text-[9px] text-fg3 mt-1">{j.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-fg3">No jobs scheduled</p>
                )}
              </div>

              {/* Stats */}
              <div className="px-5 py-4 shrink-0">
                <p className="text-[9px] text-fg4 uppercase tracking-wider mb-2">This Week</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface rounded-lg px-3 py-2">
                    <p className="text-[18px] font-bold text-fg">{selectedCrew.weeklyHours}h</p>
                    <p className="text-[10px] text-fg3">Hours logged</p>
                  </div>
                  <div className="bg-surface rounded-lg px-3 py-2">
                    <p className="text-[18px] font-bold text-fg">{selectedCrew.completedToday + selectedCrew.todayJobs.filter(j => j.status === 'in_progress').length}</p>
                    <p className="text-[10px] text-fg3">Jobs today</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
