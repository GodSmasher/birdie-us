import Link from 'next/link';
import { DemoSidebar } from '@/components/demo-sidebar';
import { TopBar } from '@/components/topbar';
import { Card, KpiCard, Pill, Tag } from '@/components/ui';

export const metadata = { title: 'birdie — Interconnection Demo (NES / Nashville)' };

type Stage = 'open' | 'review' | 'approved' | 'signed' | 'submitted' | 'complete';
const STAGE_LABELS: Record<Stage, string> = {
  open: 'Open', review: 'In Review', approved: 'Approved', signed: 'Signed', submitted: 'Submitted', complete: 'Complete',
};
const STAGE_TONE: Record<Stage, 'neutral' | 'warning' | 'info' | 'accent' | 'success' | 'purple'> = {
  open: 'neutral', review: 'warning', approved: 'info', signed: 'accent', submitted: 'success', complete: 'purple',
};

interface Project {
  id: string;
  customer: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  utility: string;
  systemKw: number;
  modules: string;
  inverter: string;
  stage: Stage;
  applicationId?: string;
  meterNumber?: string;
  permitNumber?: string;
  inspectionDate?: string;
  necCompliant: boolean;
  ieeeCompliant: boolean;
  iraEligible: boolean;
  value: number;
  dueDate?: string;
  notes?: string;
}

const PROJECTS: Project[] = [
  {
    id: 'P-1001', customer: 'Rivera Family', address: '782 Oak Hill Rd', city: 'Nashville', state: 'TN', zip: '37204',
    utility: 'NES', systemKw: 11.2, modules: 'REC Alpha Pure-R 400W x28', inverter: 'Enphase IQ8M-72',
    stage: 'signed', applicationId: 'NES-2026-44182', meterNumber: 'MTR-882441', permitNumber: 'MN-2026-3318',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 28500, dueDate: '2026-06-27',
    notes: 'Signed docs need upload to NES portal before Jun 27',
  },
  {
    id: 'P-1002', customer: 'Martinez Residence', address: '4521 Elm Creek Dr', city: 'Franklin', state: 'TN', zip: '37067',
    utility: 'NES', systemKw: 8.8, modules: 'Q CELLS Q.PEAK DUO ML-G11S 440W x20', inverter: 'SolarEdge SE7600H',
    stage: 'review', applicationId: 'NES-2026-44290', permitNumber: 'MN-2026-4412',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 22100,
    notes: 'Metro Nashville permit pending since Jun 18',
  },
  {
    id: 'P-1003', customer: 'Thompson Solar', address: '1190 Sunset Ridge', city: 'Brentwood', state: 'TN', zip: '37027',
    utility: 'NES', systemKw: 14.4, modules: 'Canadian Solar HiKu7 CS7L-600MS x24', inverter: 'SMA Sunny Boy 7.7',
    stage: 'approved', applicationId: 'NES-2026-43891', meterNumber: 'MTR-771092', permitNumber: 'MN-2026-2987',
    inspectionDate: '2026-06-27', necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 35200,
    notes: 'NES approved — meter swap scheduled Jun 27',
  },
  {
    id: 'P-1004', customer: 'Chen Family', address: '305 Pecan Valley Ct', city: 'Hendersonville', state: 'TN', zip: '37075',
    utility: 'NES', systemKw: 9.6, modules: 'Silfab SIL-420-BG x24', inverter: 'Enphase IQ8A-72',
    stage: 'submitted', applicationId: 'NES-2026-44501', meterNumber: 'MTR-993210', permitNumber: 'MN-2026-4718',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 24800,
  },
  {
    id: 'P-1005', customer: 'Williams Residence', address: '8812 Magnolia Ln', city: 'Nashville', state: 'TN', zip: '37211',
    utility: 'NES', systemKw: 7.2, modules: 'LONGi Hi-MO 6 555W x13', inverter: 'Enphase IQ8M-72',
    stage: 'open', necCompliant: false, ieeeCompliant: false, iraEligible: true, value: 18500,
    notes: 'Awaiting site survey completion',
  },
  {
    id: 'P-1006', customer: 'Patel Solar Project', address: '2200 Murfreesboro Pike', city: 'Nashville', state: 'TN', zip: '37217',
    utility: 'NES', systemKw: 12.0, modules: 'Trina Vertex S+ TSM-445NEG9R.28 x27', inverter: 'SolarEdge SE10000H',
    stage: 'submitted', applicationId: 'NES-2026-43650', meterNumber: 'MTR-550318',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 31000,
  },
  {
    id: 'P-1007', customer: 'Davis Home', address: '4100 Hillsboro Pike', city: 'Nashville', state: 'TN', zip: '37215',
    utility: 'NES', systemKw: 6.4, modules: 'REC Alpha Pure-R 400W x16', inverter: 'Enphase IQ8A-72',
    stage: 'review', applicationId: 'NES-2026-44622',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 16200,
  },
  {
    id: 'P-1008', customer: 'Johnson Family', address: '955 Belmont Blvd', city: 'Nashville', state: 'TN', zip: '37212',
    utility: 'NES', systemKw: 10.8, modules: 'Canadian Solar HiKu7 CS7L-600MS x18', inverter: 'SMA Sunny Boy 10.0',
    stage: 'complete', applicationId: 'NES-2026-42100', meterNumber: 'MTR-441287',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 27500,
  },
  {
    id: 'P-1009', customer: 'Garcia Residence', address: '7730 Nolensville Pike', city: 'Nashville', state: 'TN', zip: '37211',
    utility: 'NES', systemKw: 8.0, modules: 'Q CELLS Q.PEAK DUO ML-G11S 440W x18', inverter: 'Enphase IQ8M-72',
    stage: 'open', necCompliant: false, ieeeCompliant: false, iraEligible: true, value: 20100,
  },
  {
    id: 'P-1010', customer: 'Anderson Solar', address: '3320 Lebanon Pike', city: 'Mt. Juliet', state: 'TN', zip: '37122',
    utility: 'NES', systemKw: 15.6, modules: 'LONGi Hi-MO 6 555W x28', inverter: 'SolarEdge SE11400H',
    stage: 'submitted', applicationId: 'NES-2026-44100', meterNumber: 'MTR-667482',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 38900,
  },
  {
    id: 'P-1011', customer: 'Kim Residence', address: '1450 Old Hickory Blvd', city: 'Nashville', state: 'TN', zip: '37209',
    utility: 'NES', systemKw: 9.2, modules: 'Silfab SIL-420-BG x22', inverter: 'Enphase IQ8A-72',
    stage: 'approved', applicationId: 'NES-2026-44320', meterNumber: 'MTR-882190',
    necCompliant: true, ieeeCompliant: true, iraEligible: true, value: 23400,
  },
  {
    id: 'P-1012', customer: 'Nelson Home', address: '6200 Charlotte Pike', city: 'Nashville', state: 'TN', zip: '37209',
    utility: 'NES', systemKw: 5.6, modules: 'REC Alpha Pure-R 400W x14', inverter: 'Enphase IQ8M-72',
    stage: 'open', necCompliant: false, ieeeCompliant: false, iraEligible: true, value: 14200,
  },
];

const STAGES_ORDER: Stage[] = ['open', 'review', 'approved', 'signed', 'submitted', 'complete'];

const usd = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export default function InterconnectionDemo() {
  const byStage = STAGES_ORDER.map(s => ({
    stage: s,
    label: STAGE_LABELS[s],
    projects: PROJECTS.filter(p => p.stage === s),
  }));
  const totalValue = PROJECTS.reduce((a, p) => a + p.value, 0);
  const submitted = PROJECTS.filter(p => p.stage === 'submitted' || p.stage === 'complete').length;

  return (
    <>
      <DemoSidebar active="interconnection" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar
          title="Interconnection"
          subtitle="Nashville Electric Service · Nashville Metro · NEC 690 / IEEE 1547 / IRA §48"
        />
        <div className="flex-1 px-6 py-5 flex flex-col gap-4 overflow-auto">
          {/* KPIs */}
          <div className="grid grid-cols-5 gap-3 shrink-0">
            <KpiCard label="TOTAL PROJECTS" value={String(PROJECTS.length)} sub="active" />
            <KpiCard label="PIPELINE VALUE" value={usd(totalValue)} sub="across all stages" />
            <KpiCard label="SUBMITTED" value={String(submitted)} sub="to NES" valueColor="text-success" />
            <KpiCard label="AVG SYSTEM" value={`${(PROJECTS.reduce((a, p) => a + p.systemKw, 0) / PROJECTS.length).toFixed(1)} kW`} sub="per project" />
            <KpiCard label="IRA ELIGIBLE" value={`${PROJECTS.filter(p => p.iraEligible).length}/${PROJECTS.length}`} sub="§48 tax credit" valueColor="text-success" />
          </div>

          {/* Kanban Board */}
          <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto pb-2">
            {byStage.filter(s => s.projects.length > 0).map(col => (
              <div key={col.stage} className="flex flex-col w-[280px] shrink-0">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Pill label={col.label.toUpperCase()} tone={STAGE_TONE[col.stage]} dot={false} />
                  <span className="text-[11px] text-fg3 font-medium">{col.projects.length}</span>
                </div>
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {col.projects.map(p => (
                    <Card key={p.id} className="p-3.5 flex flex-col gap-2 hover:border-line-2 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-fg">{p.customer}</span>
                        <span className="text-[10px] text-fg3">{p.id}</span>
                      </div>
                      <div className="text-[11px] text-fg2">{p.address}, {p.city}, {p.state} {p.zip}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag label={`${p.systemKw} kW`} tone="accent" />
                        <Tag label={p.utility} tone="info" />
                        {p.necCompliant && <Tag label="NEC 690" tone="success" />}
                        {p.ieeeCompliant && <Tag label="IEEE 1547" tone="success" />}
                        {p.iraEligible && <Tag label="IRA §48" tone="purple" />}
                      </div>
                      {p.applicationId && (
                        <div className="text-[10px] text-fg3">App: {p.applicationId}</div>
                      )}
                      {p.meterNumber && (
                        <div className="text-[10px] text-fg3">Meter: {p.meterNumber}</div>
                      )}
                      {p.permitNumber && (
                        <div className="text-[10px] text-fg3">Permit: {p.permitNumber}</div>
                      )}
                      {p.inspectionDate && (
                        <div className="text-[10px] text-accent">Inspection: {new Date(p.inspectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      )}
                      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-line">
                        <span className="text-[11px] font-medium text-fg">{usd(p.value)}</span>
                        {p.notes && <span className="text-[9px] text-fg3 truncate max-w-[140px]" title={p.notes}>{p.notes}</span>}
                      </div>
                      {p.inverter && (
                        <div className="text-[10px] text-fg3 truncate" title={`${p.modules} · ${p.inverter}`}>
                          {p.inverter}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Compliance footer */}
          <div className="shrink-0 rounded-xl bg-surface border border-line p-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[11px] text-fg2">NEC 690 — rapid shutdown, conductor sizing, overcurrent protection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[11px] text-fg2">IEEE 1547-2018 — voltage/frequency ride-through, anti-islanding</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[11px] text-fg2">IRA §48 — 30% investment tax credit eligibility tracked</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
