export const reps = ['Sarah Vogel', 'Marcus Lee', 'Elena Ruiz', 'Tom Becker', 'Priya Nair'];
export const avPalette = [
  ['bg-info-bg', 'text-info'], ['bg-purple-bg', 'text-purple'], ['bg-success-bg', 'text-success'],
  ['bg-warning-bg', 'text-warning'], ['bg-error-bg', 'text-error'],
] as const;

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unresponsive' | 'Disqualified';
export type LeadTone = 'info' | 'warning' | 'success' | 'neutral' | 'error';

export const leadToneMap: Record<LeadStatus, LeadTone> = {
  New: 'info', Contacted: 'warning', Qualified: 'success', Unresponsive: 'neutral', Disqualified: 'error',
};

export interface Lead {
  name: string; email: string; phone: string; source: string; loc: string;
  interest: string; score: number; assigned: string; created: string; status: LeadStatus;
  init: string; avIdx: number;
}

const leadRaw: [string, string, string, string, string, string, number, number, string, LeadStatus][] = [
  ['Marcus Webb','marcus.webb@gmail.com','(615) 555-0142','Aurora Solar','Nashville, TN','Residential',88,0,'2h ago','New'],
  ['Priya Shah','p.shah@outlook.com','(512) 555-0198','Referral','Austin, TX','Residential',74,1,'5h ago','Contacted'],
  ['Trellis HOA','ops@trellishoa.org','(602) 555-0110','Website','Phoenix, AZ','Commercial',92,2,'1d ago','Qualified'],
  ['Robert Osei','rosei@icloud.com','(303) 555-0176','Aurora Solar','Denver, CO','Residential',81,0,'1d ago','Contacted'],
  ['Karen Alvarez','kalvarez@gmail.com','(469) 555-0133','Google Ads','Dallas, TX','Residential',67,3,'2d ago','New'],
  ['The Nguyens','nguyen.fam@gmail.com','(408) 555-0155','Referral','San Jose, CA','Residential',79,1,'2d ago','Qualified'],
  ['Brian Carter','bcarter@yahoo.com','(704) 555-0188','Website','Charlotte, NC','Residential',58,2,'3d ago','Unresponsive'],
  ['Diane Meyer','diane.meyer@gmail.com','(512) 555-0121','Aurora Solar','Austin, TX','Residential',85,4,'3d ago','Qualified'],
  ['Sunset Storage LLC','fac@sunsetstorage.com','(480) 555-0144','Website','Mesa, AZ','Commercial',90,2,'4d ago','Contacted'],
  ['Tyler Brooks','tbrooks@gmail.com','(615) 555-0167','Google Ads','Franklin, TN','Residential',49,0,'4d ago','Disqualified'],
  ['Amara Okafor','amara.o@gmail.com','(770) 555-0102','Referral','Atlanta, GA','Residential',82,3,'5d ago','Contacted'],
  ['Grant Mills','gmills@hey.com','(801) 555-0190','Aurora Solar','Salt Lake City, UT','Residential',71,1,'5d ago','New'],
  ['Rivera Farms','office@riverafarms.com','(559) 555-0119','Website','Fresno, CA','Commercial',86,4,'6d ago','Qualified'],
  ['Hannah Lang','hlang@gmail.com','(503) 555-0173','Google Ads','Portland, OR','Residential',63,2,'6d ago','Contacted'],
  ['Devon Pratt','dpratt@outlook.com','(210) 555-0128','Aurora Solar','San Antonio, TX','Residential',77,0,'1w ago','New'],
  ['Olivia Stone','ostone@gmail.com','(305) 555-0161','Referral','Miami, FL','Residential',69,3,'1w ago','Unresponsive'],
  ['Northgate Church','admin@northgate.org','(919) 555-0135','Website','Raleigh, NC','Commercial',88,1,'1w ago','Qualified'],
  ['Jason Fields','jfields@gmail.com','(720) 555-0147','Google Ads','Aurora, CO','Residential',55,4,'1w ago','Contacted'],
  ['Maya Cohen','maya.cohen@gmail.com','(602) 555-0182','Aurora Solar','Scottsdale, AZ','Residential',80,2,'8d ago','New'],
  ['Ellis Ward','eward@icloud.com','(615) 555-0159','Referral','Nashville, TN','Residential',73,0,'9d ago','Contacted'],
  ['Coastal Dental','front@coastaldental.com','(843) 555-0113','Website','Charleston, SC','Commercial',84,3,'9d ago','Qualified'],
  ['Nina Petrov','npetrov@gmail.com','(408) 555-0126','Google Ads','Sunnyvale, CA','Residential',61,1,'10d ago','Unresponsive'],
  ['Derek Hughes','dhughes@yahoo.com','(214) 555-0170','Aurora Solar','Plano, TX','Residential',76,4,'11d ago','New'],
  ['Wade Foster','wfoster@gmail.com','(480) 555-0104','Referral','Tempe, AZ','Residential',52,2,'12d ago','Disqualified'],
  ['Sofia Marino','smarino@gmail.com','(303) 555-0193','Website','Boulder, CO','Residential',87,0,'13d ago','Qualified'],
  ['Aiden Clarke','aclarke@outlook.com','(615) 555-0138','Google Ads','Murfreesboro, TN','Residential',66,3,'2w ago','Contacted'],
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export const leads: Lead[] = leadRaw.map((r, i) => ({
  name: r[0], email: r[1], phone: r[2], source: r[3], loc: r[4],
  interest: r[5], score: r[6], assigned: reps[r[7]], created: r[8], status: r[9],
  init: initials(r[0]), avIdx: i % 5,
}));

export const leadSources = [
  { label: 'Aurora Solar', pct: '42%', color: 'bg-accent' },
  { label: 'Website', pct: '28%', color: 'bg-info' },
  { label: 'Referral', pct: '18%', color: 'bg-purple' },
  { label: 'Google Ads', pct: '12%', color: 'bg-success' },
];

export type HeatLevel = 'hot' | 'warm' | 'cold';
export const heatColors: Record<HeatLevel, string> = { hot: 'border-success', warm: 'border-warning', cold: 'border-error' };

export const pipeStages = ['Qualified', 'Site Visit', 'Design', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
export const pipeDotColors = ['text-fg3', 'text-info', 'text-purple', 'text-accent', 'text-warning', 'text-success', 'text-error'];
export const pipeBgColors = ['bg-fg3', 'bg-info', 'bg-purple', 'bg-accent', 'bg-warning', 'bg-success', 'bg-error'];

export interface Deal {
  cust: string; init: string; value: number; kw: number; days: number;
  rep: string; heat: HeatLevel; stageIdx: number;
}

const dealRaw: [string, number, number, number, number, HeatLevel, number][] = [
  ['Marcus Webb',28500,8.2,2,0,'hot',0],['Priya Shah',22100,6.4,4,1,'warm',0],['Grant Mills',31200,9.0,3,2,'warm',0],['Maya Cohen',26800,7.6,1,3,'hot',0],['Devon Pratt',24300,7.0,5,0,'cold',0],
  ['Robert Osei',44900,10.1,3,1,'hot',1],['Amara Okafor',33400,9.4,6,2,'warm',1],['Ellis Ward',27600,7.8,4,3,'warm',1],['Derek Hughes',29900,8.6,7,4,'cold',1],
  ['Diane Meyer',41800,11.2,8,4,'hot',2],['Karen Alvarez',26300,7.8,5,0,'warm',2],['Sofia Marino',38200,10.4,3,1,'hot',2],
  ['Trellis HOA',310000,96.0,9,2,'hot',3],['The Nguyens',31200,9.0,6,3,'warm',3],['Northgate Church',72000,24.0,11,4,'cold',3],
  ['Brian Carter',47000,12.6,4,0,'warm',4],['Coastal Dental',58500,18.2,7,1,'hot',4],
  ['Hannah Lang',24800,7.2,1,2,'hot',5],['Rivera Farms',89000,28.0,2,3,'hot',5],
  ['Wade Foster',18500,5.4,3,4,'cold',6],
];

export const deals: Deal[] = dealRaw.map(r => ({
  cust: r[0], init: initials(r[0]), value: r[1], kw: r[2], days: r[3],
  rep: reps[r[4]], heat: r[5], stageIdx: r[6],
}));

export function usd(n: number) {
  return n >= 1000 ? '$' + (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K' : '$' + n;
}

export function dealsByStage() {
  const cols = pipeStages.map(name => ({ name, deals: [] as Deal[] }));
  deals.forEach(d => cols[d.stageIdx].deals.push(d));
  return cols;
}

export function stageValues() {
  const cols = dealsByStage();
  return cols.map(c => c.deals.reduce((a, d) => a + d.value, 0));
}

export const pipeSummary = [
  { k: 'WEIGHTED PIPELINE', v: '$486K' }, { k: 'OPEN DEALS', v: '17' },
  { k: 'CONVERSION', v: '31%' }, { k: 'AVG DAYS TO CLOSE', v: '42' },
];

export const forecast = [
  { m: 'Jul', v: '$68K', h: '55%' }, { m: 'Aug', v: '$94K', h: '76%' },
  { m: 'Sep', v: '$112K', h: '90%' }, { m: 'Oct', v: '$86K', h: '69%' },
  { m: 'Nov', v: '$124K', h: '100%' }, { m: 'Dec', v: '$102K', h: '82%' },
];

export const projStages = ['Permit Filed', 'Permit Approved', 'Equipment Ordered', 'Install Scheduled', 'Install Complete', 'Final Inspection', 'PTO Received'];
export const projDotColors = ['text-fg3', 'text-info', 'text-purple', 'text-warning', 'text-accent', 'text-info', 'text-success'];

export interface Project {
  cust: string; addr: string; kw: number; panels: number; inverter: string;
  crew: string; date: string; permit: string; stageIdx: number; pct: number;
}

const crews = ['Crew Alpha', 'Crew Bravo', 'Crew Delta'];
const projRaw: [string, string, number, number, string, number, string, string, number][] = [
  ['R. Osei','812 Maple Dr, Denver CO',10.1,25,'Enphase',0,'Jul 14','P-24-0912',3],
  ['Diane Meyer','44 Cedar Ln, Austin TX',11.2,28,'Enphase',1,'Jun 20','P-24-0887',6],
  ['Sofia Marino','9 Birch Ct, Boulder CO',10.4,26,'SolarEdge',2,'Jul 9','P-24-0921',4],
  ['Coastal Dental','120 Bay St, Charleston SC',18.2,44,'SolarEdge',0,'Jul 22','P-24-0934',1],
  ['The Nguyens','501 Elm Ave, San Jose CA',9.0,22,'Enphase',1,'Jul 18','P-24-0918',2],
  ['Northgate Church','77 Faith Rd, Raleigh NC',24.0,58,'SMA',2,'Aug 2','P-24-0940',0],
  ['Brian Carter','230 Oak Blvd, Charlotte NC',12.6,31,'SolarEdge',0,'Jul 11','P-24-0905',5],
  ['Amara Okafor','15 Pine St, Atlanta GA',9.4,23,'Enphase',1,'Jul 16','P-24-0927',3],
  ['Rivera Farms','RR-4, Fresno CA',28.0,68,'SMA',2,'Jul 25','P-24-0945',1],
  ['Ellis Ward','88 Willow Way, Nashville TN',7.8,19,'Enphase',0,'Jul 8','P-24-0898',6],
  ['Maya Cohen','340 Vista Dr, Scottsdale AZ',7.6,19,'SolarEdge',1,'Jul 13','P-24-0931',2],
  ['Grant Mills','12 Ridge Rd, Salt Lake City UT',9.0,22,'Enphase',2,'Jul 20','P-24-0938',3],
  ['Devon Pratt','560 Alamo St, San Antonio TX',7.0,17,'Enphase',0,'Jul 15','P-24-0909',4],
  ['Sunset Storage','900 Depot Rd, Mesa AZ',42.0,102,'SMA',1,'Aug 5','P-24-0949',0],
  ['Derek Hughes','24 Legacy Ln, Plano TX',8.6,21,'SolarEdge',2,'Jul 10','P-24-0902',5],
];

export const projects: Project[] = projRaw.map(r => ({
  cust: r[0], addr: r[1], kw: r[2], panels: r[3], inverter: r[4],
  crew: crews[r[5]], date: r[6], permit: r[7], stageIdx: r[8],
  pct: Math.round((r[8] / 6) * 100),
}));

export const projMetrics = [
  { k: 'ACTIVE PROJECTS', v: '12', c: 'text-fg' }, { k: 'AVG DAYS TO PTO', v: '34', c: 'text-fg' },
  { k: 'INSTALLS THIS MONTH', v: '6', c: 'text-fg' }, { k: 'REVENUE INSTALLED', v: '$187.4K', c: 'text-success' },
];

export type IcStatus = 'Drafted' | 'Submitted' | 'Under Review' | 'Info Requested' | 'Approved' | 'PTO';
export const icStatusTone: Record<IcStatus, string> = {
  Drafted: 'neutral', Submitted: 'info', 'Under Review': 'warning', 'Info Requested': 'error', Approved: 'purple', PTO: 'success',
};

export interface IcRow {
  cust: string; init: string; util: string; app: string; filed: string;
  status: IcStatus; days: number; docs: boolean; assigned: string;
  flag: '' | 'red' | 'yellow';
}

const icRaw: [string, string, string, string, IcStatus, number, boolean, number, '' | 'red' | 'yellow'][] = [
  ['R. Osei','Xcel','IX-24-3391','Jun 28','Info Requested',13,false,0,'red'],
  ['Diane Meyer','Oncor','IX-24-3288','May 30','PTO',0,true,1,''],
  ['Sofia Marino','Xcel','IX-24-3402','Jul 1','Under Review',10,true,2,''],
  ['Coastal Dental','Duke Energy','IX-24-3410','Jul 3','Submitted',8,false,0,'yellow'],
  ['The Nguyens','PG&E','IX-24-3377','Jun 20','Under Review',21,true,1,'yellow'],
  ['Northgate Church','Duke Energy','IX-24-3421','Jul 5','Drafted',0,false,2,''],
  ['Brian Carter','Duke Energy','IX-24-3355','Jun 15','Approved',26,true,0,''],
  ['Amara Okafor','FPL','IX-24-3399','Jun 30','Info Requested',11,false,1,'red'],
  ['Rivera Farms','PG&E','IX-24-3418','Jul 4','Submitted',7,true,2,''],
  ['Ellis Ward','Oncor','IX-24-3301','Jun 2','PTO',0,true,0,''],
  ['Maya Cohen','APS','IX-24-3407','Jul 2','Under Review',9,true,1,''],
  ['Grant Mills','Xcel','IX-24-3415','Jul 4','Submitted',7,false,2,'yellow'],
  ['Devon Pratt','Oncor','IX-24-3384','Jun 24','Under Review',17,true,0,''],
  ['Sunset Storage','APS','IX-24-3424','Jul 6','Drafted',0,false,1,''],
  ['Derek Hughes','Oncor','IX-24-3362','Jun 17','Approved',24,true,2,''],
  ['Karen Alvarez','ComEd','IX-24-3395','Jun 29','Info Requested',12,false,0,'red'],
  ['Hannah Lang','PG&E','IX-24-3412','Jul 3','Under Review',8,true,1,''],
  ['Wade Foster','APS','IX-24-3348','Jun 12','Approved',29,true,2,''],
  ['Trellis HOA','FPL','IX-24-3420','Jul 5','Submitted',6,true,0,''],
  ['Robert Osei','ComEd','IX-24-3370','Jun 19','Under Review',22,true,1,'yellow'],
];

export const icRows: IcRow[] = icRaw.map(r => ({
  cust: r[0], init: initials(r[0]), util: r[1], app: r[2], filed: r[3],
  status: r[4], days: r[5], docs: r[6], assigned: reps[r[7]], flag: r[8],
}));

export const icSummary = [
  { k: 'TOTAL APPS', v: '28', c: 'text-fg' }, { k: 'AVG APPROVAL TIME', v: '22d', c: 'text-fg' },
  { k: 'PENDING REVIEW', v: '8', c: 'text-warning' }, { k: 'ACTION REQUIRED', v: '3', c: 'text-error' },
];

export type JobKind = 'visit' | 'install' | 'inspect' | 'maint';
export const jobKindMap: Record<JobKind, { color: string; bg: string; label: string }> = {
  visit: { color: 'text-info', bg: 'bg-info-bg', label: 'Site visit' },
  install: { color: 'text-success', bg: 'bg-success-bg', label: 'Install' },
  inspect: { color: 'text-warning', bg: 'bg-warning-bg', label: 'Inspection' },
  maint: { color: 'text-fg3', bg: 'bg-surface-3', label: 'Maintenance' },
};

export interface ScheduleJob { type: JobKind; cust: string; }
export interface ScheduleRow { crew: string; cells: (ScheduleJob | null)[]; }

export const weekDays = ['Mon 7', 'Tue 8', 'Wed 9', 'Thu 10', 'Fri 11'];
export const crewRoster = [
  { name: 'Mike Torres', role: 'Lead Installer', jobs: 3, avail: true, init: 'MT' },
  { name: 'Dana Kim', role: 'Electrician', jobs: 2, avail: true, init: 'DK' },
  { name: 'Luis Romero', role: 'Lead Installer', jobs: 3, avail: false, init: 'LR' },
  { name: 'Jamal Reed', role: 'Installer', jobs: 2, avail: true, init: 'JR' },
  { name: 'Kayla Brooks', role: 'Inspector', jobs: 1, avail: true, init: 'KB' },
  { name: 'Owen Frost', role: 'Electrician', jobs: 2, avail: false, init: 'OF' },
  { name: 'Rosa Nunez', role: 'Sales Rep', jobs: 2, avail: true, init: 'RN' },
  { name: 'Nate Cole', role: 'Installer', jobs: 1, avail: true, init: 'NC' },
];

const jb = (k: JobKind, cust: string): ScheduleJob => ({ type: k, cust });
export const schedGrid: ScheduleRow[] = [
  { crew: 'M. Torres', cells: [jb('install','R. Osei'), null, jb('install','Grant Mills'), null, jb('visit','New lead')] },
  { crew: 'D. Kim', cells: [null, jb('install','Sofia Marino'), null, jb('inspect','Diane Meyer'), null] },
  { crew: 'L. Romero', cells: [jb('install','Devon Pratt'), null, null, jb('install','Maya Cohen'), jb('maint','Ellis Ward')] },
  { crew: 'J. Reed', cells: [jb('visit','Trellis HOA'), jb('visit','Coastal'), null, null, jb('install','Amara O.')] },
  { crew: 'K. Brooks', cells: [null, null, jb('inspect','Brian Carter'), null, jb('inspect','Derek H.')] },
  { crew: 'R. Nunez', cells: [jb('visit','Maya Cohen'), null, jb('visit','Nguyens'), null, null] },
];

export const schedSummary = [
  { v: '4', l: 'installs', c: 'text-success' }, { v: '2', l: 'site visits', c: 'text-info' },
  { v: '1', l: 'inspection', c: 'text-warning' }, { v: '3', l: 'crew free', c: 'text-fg2' },
];

export const unscheduledJobs = [
  { ...jb('visit', 'K. Alvarez'), note: 'Needs assignment' },
  { ...jb('install', 'Rivera Farms'), note: 'Needs assignment' },
  { ...jb('inspect', 'Wade Foster'), note: 'Needs assignment' },
  { ...jb('visit', 'Olivia Stone'), note: 'Needs assignment' },
];

export interface InboxMessage {
  sender: string; subject: string; preview: string; time: string;
  cat: string; tag: string; read: boolean; ctx: string; init: string;
}

export const inboxTabs = ['All', 'Customers', 'Utilities', 'Team', 'Automated'];
const msgTagTone: Record<string, string> = {
  'Needs Response': 'warning', 'Utility Update': 'info', 'Payment Issue': 'error', FYI: 'neutral',
};
export const getTagTone = (tag: string) => msgTagTone[tag] || 'neutral';

const catColors: Record<string, string> = {
  'Utility Response': 'text-info', 'Customer Question': 'text-accent',
  Payment: 'text-error', 'System Alert': 'text-purple', Team: 'text-success',
};
export const getCatColor = (cat: string) => catColors[cat] || 'text-fg3';

export const messages: InboxMessage[] = [
  { sender:'APS Interconnection', subject:'Approval — IX-24-3407 Maya Cohen', preview:'Your interconnection application has been approved. PTO to follow within 5 business days.', time:'8m', cat:'Utility Response', tag:'Utility Update', read:false, ctx:'IX-24-3407 · Maya Cohen', init:'AP' },
  { sender:'Diane Meyer', subject:'Question about install timeline', preview:'Hi! Just checking when the crew will arrive — we saw the inspection passed. Excited!', time:'32m', cat:'Customer Question', tag:'Needs Response', read:false, ctx:'Project · Diane Meyer', init:'DM' },
  { sender:'QuickBooks Bot', subject:'Payment overdue — INV-2291', preview:'Diane Meyer invoice #2 ($8,360) is now 9 days overdue. A reminder was auto-sent.', time:'1h', cat:'Payment', tag:'Payment Issue', read:false, ctx:'Invoice · INV-2291', init:'QB' },
  { sender:'Mike Torres', subject:'Re: Crew schedule Thu', preview:'Confirmed for the Osei install Thursday 8am. Bringing the full Alpha crew.', time:'2h', cat:'Team', tag:'FYI', read:true, ctx:'Schedule · Jul 10', init:'MT' },
  { sender:'Oncor', subject:'PTO issued — Diane Meyer', preview:'Permission to operate has been granted. System may be energized.', time:'3h', cat:'Utility Response', tag:'Utility Update', read:true, ctx:'IX-24-3288 · Diane Meyer', init:'ON' },
  { sender:'Reporting Bot', subject:'Weekly summary ready', preview:'8 deals closed, $318K won, 6 installs completed. Full report attached.', time:'5h', cat:'System Alert', tag:'FYI', read:true, ctx:'Report · Week 27', init:'RB' },
  { sender:'R. Osei', subject:'Re: Deposit received', preview:'Thanks — payment sent via ACH. Looking forward to the install!', time:'6h', cat:'Customer Question', tag:'FYI', read:true, ctx:'Deal · R. Osei', init:'RO' },
  { sender:'Duke Energy', subject:'Info requested — IX-24-3410', preview:'Additional documentation needed: updated single-line diagram.', time:'8h', cat:'Utility Response', tag:'Utility Update', read:true, ctx:'IX-24-3410 · Coastal Dental', init:'DE' },
  { sender:'Trellis HOA', subject:'Proposal follow-up', preview:'Board meets Friday to review the 96 kW proposal. Will circle back.', time:'1d', cat:'Customer Question', tag:'Needs Response', read:true, ctx:'Deal · Trellis HOA', init:'TH' },
  { sender:'Lead Enrichment Bot', subject:'12 new leads enriched', preview:'Property data + utility info added for 12 leads from Aurora import.', time:'1d', cat:'System Alert', tag:'FYI', read:true, ctx:'Leads', init:'LE' },
  { sender:'Coastal Dental', subject:'Site plan uploaded', preview:'We sent over the updated roof drawings you requested.', time:'1d', cat:'Customer Question', tag:'FYI', read:true, ctx:'Project · Coastal Dental', init:'CD' },
  { sender:'PG&E', subject:'Under review — IX-24-3377', preview:'Your application is now in technical review. Est. 21 days.', time:'2d', cat:'Utility Response', tag:'Utility Update', read:true, ctx:'IX-24-3377 · Nguyens', init:'PG' },
  { sender:'Dana Kim', subject:'Electrical rough-in done', preview:'Marino job passed rough-in. Ready for panel mount tomorrow.', time:'2d', cat:'Team', tag:'FYI', read:true, ctx:'Project · Sofia Marino', init:'DK' },
  { sender:'Dunning Bot', subject:'Reminder sent — Nguyens', preview:'Day-7 payment reminder auto-sent for INV-2284 ($9,120).', time:'2d', cat:'Payment', tag:'FYI', read:true, ctx:'Invoice · INV-2284', init:'DB' },
  { sender:'Amara Okafor', subject:'Financing question', preview:'Do you offer the 25-year loan option? Comparing quotes.', time:'3d', cat:'Customer Question', tag:'Needs Response', read:true, ctx:'Deal · Amara Okafor', init:'AO' },
];

export const repKpis = [
  { k: 'REVENUE MTD', v: '$127.3K', d: '+18%', up: true },
  { k: 'DEALS CLOSED', v: '8', d: '+2', up: true },
  { k: 'AVG DEAL SIZE', v: '$22.4K', d: '+3%', up: true },
  { k: 'LEAD-TO-CLOSE', v: '42d', d: '-3d', up: true },
];

export const revMonths = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
export const revVals = [82, 71, 96, 88, 110, 127];

export const donutLegend = [
  { l: 'Aurora Solar', v: '42%', c: 'bg-accent' }, { l: 'Website', v: '28%', c: 'bg-info' },
  { l: 'Referral', v: '18%', c: 'bg-purple' }, { l: 'Paid Ads', v: '12%', c: 'bg-success' },
];

export const icTurnData = [
  { u: 'Oncor', d: '18d', n: '7', r: '92%' }, { u: 'Duke Energy', d: '24d', n: '5', r: '80%' },
  { u: 'PG&E', d: '26d', n: '4', r: '75%' }, { u: 'APS', d: '19d', n: '4', r: '88%' },
  { u: 'Xcel', d: '22d', n: '4', r: '82%' },
];

export const bots = [
  { name: 'AI Document Filler', icon: '◇', status: 'live' as const, desc: 'Auto-fills interconnection forms from project data', last: '2m ago', rate: '98%', runs: '412' },
  { name: 'Dunning Bot', icon: '$', status: 'live' as const, desc: 'Sends payment reminders at day 7, 14, 30', last: '1h ago', rate: '100%', runs: '86' },
  { name: 'Lead Enrichment', icon: '◎', status: 'live' as const, desc: 'Pulls property + utility data for new leads', last: '18m ago', rate: '94%', runs: '247' },
  { name: 'Email Classifier', icon: '✉', status: 'live' as const, desc: 'Tags and routes incoming email', last: 'just now', rate: '96%', runs: '1,308' },
  { name: 'Appointment Scheduler', icon: '▦', status: 'live' as const, desc: 'Sends booking links after qualification', last: '3h ago', rate: '99%', runs: '142' },
  { name: 'Inspection Reminder', icon: '◔', status: 'paused' as const, desc: 'Notifies crew 48h before inspections', last: '2d ago', rate: '100%', runs: '38' },
  { name: 'Utility Tracker', icon: '⚡', status: 'live' as const, desc: 'Checks utility portals for status changes', last: '25m ago', rate: '91%', runs: '196' },
  { name: 'Reporting Bot', icon: '◈', status: 'live' as const, desc: 'Generates weekly summary for Sarah', last: '5h ago', rate: '100%', runs: '12' },
];

export const workflows = [
  { name: 'Lead onboarding', trigger: 'New Lead', nodes: ['Enrich', 'Score', 'Auto-Assign', 'Welcome Email'] },
  { name: 'Deal won → install', trigger: 'Deal Won', nodes: ['Create Project', 'File Permit', 'Order Equipment', 'Schedule Install'] },
  { name: 'Interconnection close-out', trigger: 'IC Approved', nodes: ['Notify Customer', 'Schedule Inspection', 'File PTO'] },
];

export const aiChat = [
  { role: 'ai' as const, text: 'Hi Sarah — I manage your bots and workflows. Tell me what to change and I’ll handle it. For example, adjust a schedule, pause a bot, or add a step to a workflow.' },
  { role: 'user' as const, text: 'Pause the Inspection Reminder over the holiday week.' },
  { role: 'ai' as const, text: 'Done — Inspection Reminder is paused until Jul 14. I’ll resume it automatically and notify the crew leads. Want me to send a heads-up to the team now?' },
];

export const aiSuggest = ['Pause a bot', 'Change dunning schedule', 'Add a workflow step', 'Explain the AI Filler'];

export const integrations = [
  { name: 'Aurora Solar', cat: 'CRM', abbr: 'AS', connected: true, color: '#F5A623' },
  { name: 'Google Workspace', cat: 'Communication', abbr: 'GW', connected: true, color: '#4285F4' },
  { name: 'QuickBooks', cat: 'Accounting', abbr: 'QB', connected: true, color: '#2CA01C' },
  { name: 'Twilio SMS', cat: 'Communication', abbr: 'TW', connected: true, color: '#F22F46' },
  { name: 'n8n', cat: 'Scheduling', abbr: 'N8', connected: true, color: '#EA4B71' },
  { name: 'Stripe', cat: 'Accounting', abbr: 'ST', connected: true, color: '#635BFF' },
  { name: 'Salesforce', cat: 'CRM', abbr: 'SF', connected: false, color: '#00A1E0' },
  { name: 'HubSpot', cat: 'CRM', abbr: 'HS', connected: false, color: '#FF7A59' },
  { name: 'Enphase Monitoring', cat: 'Monitoring', abbr: 'EN', connected: false, color: '#F3901D' },
  { name: 'SolarEdge', cat: 'Monitoring', abbr: 'SE', connected: false, color: '#E4181C' },
  { name: 'EcoFlow', cat: 'Monitoring', abbr: 'EF', connected: false, color: '#22B24C' },
  { name: 'Sunnova', cat: 'Accounting', abbr: 'SN', connected: false, color: '#F5B417' },
  { name: 'ServiceTitan', cat: 'Scheduling', abbr: 'ST', connected: false, color: '#4B3FCE' },
  { name: 'Calendly', cat: 'Scheduling', abbr: 'CL', connected: false, color: '#006BFF' },
];

export const integCats = ['All', 'CRM', 'Accounting', 'Monitoring', 'Communication', 'Scheduling'];

export const settingsTeam = [
  { name: 'Sarah Vogel', email: 'sarah@voltasolar.com', role: 'Admin', init: 'SV' },
  { name: 'Marcus Lee', email: 'marcus@voltasolar.com', role: 'Manager', init: 'ML' },
  { name: 'Elena Ruiz', email: 'elena@voltasolar.com', role: 'Sales', init: 'ER' },
  { name: 'Tom Becker', email: 'tom@voltasolar.com', role: 'Sales', init: 'TB' },
  { name: 'Mike Torres', email: 'mike@voltasolar.com', role: 'Installer', init: 'MT' },
  { name: 'Dana Kim', email: 'dana@voltasolar.com', role: 'Installer', init: 'DK' },
];

export const notifRows = [
  { label: 'Deal updates', cells: [true, true, false] },
  { label: 'Utility responses', cells: [true, true, true] },
  { label: 'Payments', cells: [true, false, true] },
  { label: 'Bot alerts', cells: [true, false, false] },
];

export const apiKeys = [
  { label: 'Production key', val: 'sk_live_••••••••••••4a2f' },
  { label: 'Webhook secret', val: 'whsec_••••••••••9b1c' },
];

export const dashKpis = [
  { k: 'REVENUE MTD', v: '$127.3K', d: '+18%', up: true, link: '/demo/reports' },
  { k: 'OPEN PIPELINE', v: '$486K', d: '17 deals', up: true, link: '/demo/pipeline' },
  { k: 'ACTIVE PROJECTS', v: '12', d: '6 this mo.', up: true, link: '/demo/projects' },
  { k: 'OUTSTANDING', v: '$96.4K', d: '3 overdue', up: false, link: '/demo/reports' },
];

export const dashAttention = [
  { icon: '⚡', tone: 'error' as const, text: '3 interconnection apps need info — R. Osei, Amara Okafor, K. Alvarez', meta: 'Utility · action required', link: '/demo/interconnection' },
  { icon: '$', tone: 'error' as const, text: 'Payment overdue — Diane Meyer INV-2291 ($8,360), 9 days late', meta: 'Finance · dunning sent', link: '/demo/inbox' },
  { icon: '↗', tone: 'warning' as const, text: '4 proposals over $30K have had no reply in 7+ days', meta: 'Pipeline · follow-up', link: '/demo/pipeline' },
  { icon: '◎', tone: 'warning' as const, text: '6 leads went unresponsive this week', meta: 'Leads · re-engage', link: '/demo/leads' },
];

export const dashToday = [
  { time: '08:00', kind: 'install' as JobKind, label: 'Install', cust: 'R. Osei', who: 'Crew Alpha' },
  { time: '10:30', kind: 'visit' as JobKind, label: 'Site visit', cust: 'Trellis HOA', who: 'R. Nunez' },
  { time: '13:00', kind: 'inspect' as JobKind, label: 'Inspection', cust: 'Brian Carter', who: 'K. Brooks' },
  { time: '14:00', kind: 'install' as JobKind, label: 'Install', cust: 'Devon Pratt', who: 'L. Romero' },
];

export const dashActivity = [
  { text: 'APS approved Maya Cohen’s interconnection', src: 'Utility API', color: 'text-info', time: '8m' },
  { text: 'Deal won — Hannah Lang, $24.8K', src: 'Pipeline', color: 'text-success', time: '2h' },
  { text: 'Diane Meyer install passed city inspection', src: 'Schedule', color: 'text-warning', time: '3h' },
  { text: '12 new leads enriched from Aurora import', src: 'Lead Bot', color: 'text-accent', time: '1d' },
  { text: 'PTO issued — Ellis Ward (Oncor)', src: 'Utility API', color: 'text-purple', time: '1d' },
];

export const dashIcStrip = [
  { l: 'Drafted', n: '4', c: 'text-fg3' }, { l: 'Submitted', n: '6', c: 'text-info' },
  { l: 'Review', n: '8', c: 'text-warning' }, { l: 'Approved', n: '7', c: 'text-purple' },
  { l: 'PTO', n: '3', c: 'text-success' },
];
