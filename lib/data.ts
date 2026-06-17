export type BotState = 'success' | 'warning' | 'error' | 'neutral';

export type Bot = {
  slug: string;
  name: string;
  cat: string;
  desc: string;
  state: BotState;
  pill: string;
  runs: string;
  conns: string;
  version: string;
  schedule: string;
  trigger: string;
  successRate: string;
  avgDuration: string;
  lastRun: string;
  activity24h: number[];
  envVars: { key: string; value: string }[];
  recentRuns: { time: string; duration: string; state: 'success' | 'warning' | 'error'; output: string }[];
  logs: { ts: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'OUT'; msg: string }[];
};

const baseRuns = (slug: string, items: { time: string; duration: string; state: 'success' | 'warning' | 'error'; output: string }[]) => items;

export const bots: Bot[] = [
  {
    slug: 'mahnbot',
    name: 'Dunning Bot',
    cat: 'FIN',
    desc: 'Sends automatic payment reminders based on accounting status',
    state: 'success',
    pill: 'LIVE',
    runs: '247',
    conns: 'QuickBooks · Gmail',
    version: 'v2.3',
    schedule: 'Every 6 hours',
    trigger: 'Cron · 0 */6 * * *',
    successRate: '99.6%',
    avgDuration: '4.2s',
    lastRun: '18 min ago',
    activity24h: [3, 0, 0, 0, 0, 0, 12, 18, 22, 14, 16, 19, 21, 18, 24, 26, 22, 19, 12, 8, 5, 4, 3, 2],
    envVars: [
      { key: 'QUICKBOOKS_API_KEY', value: '•••••••• (vault)' },
      { key: 'LATE_FEE_1', value: '$15' },
      { key: 'LATE_FEE_2', value: '$30' },
      { key: 'EMAIL_FROM', value: 'billing@sunridge-energy.com' },
    ],
    recentRuns: baseRuns('mahnbot', [
      { time: '10:42', duration: '4.1s', state: 'success', output: '3 reminders sent · 0 errors' },
      { time: '04:42', duration: '3.8s', state: 'success', output: '7 reminders sent · 0 errors' },
      { time: '22:42', duration: '4.4s', state: 'success', output: '2 reminders sent · 0 errors' },
      { time: '16:42', duration: '12.2s', state: 'warning', output: 'QuickBooks rate limit · Retry successful' },
      { time: '10:42', duration: '4.0s', state: 'success', output: '4 reminders sent · 0 errors' },
      { time: '04:42', duration: '3.9s', state: 'success', output: '0 reminders · no open items' },
      { time: '22:42', duration: '4.1s', state: 'success', output: '5 reminders sent · 0 errors' },
      { time: '16:42', duration: '4.3s', state: 'success', output: '6 reminders sent · 0 errors' },
    ]),
    logs: [
      { ts: '10:42:18.231', level: 'INFO', msg: 'Trigger fired · run_id=mb_3kfx2a' },
      { ts: '10:42:18.241', level: 'INFO', msg: 'QuickBooks API · GET /invoices?status=open' },
      { ts: '10:42:18.892', level: 'INFO', msg: '→ 18 open invoices fetched' },
      { ts: '10:42:18.901', level: 'INFO', msg: 'Filtering by age > 7 days' },
      { ts: '10:42:18.905', level: 'WARN', msg: 'Invoice #2026-0298 has no email — skipping' },
      { ts: '10:42:18.912', level: 'INFO', msg: '→ 10 invoices eligible' },
      { ts: '10:42:18.945', level: 'INFO', msg: 'Classifying: 6×S1 · 3×S2 · 1×S3' },
      { ts: '10:42:19.012', level: 'INFO', msg: 'Rendering templates with brand=sunridge-energy' },
      { ts: '10:42:19.245', level: 'INFO', msg: 'Gmail · sending 10 emails' },
      { ts: '10:42:21.402', level: 'INFO', msg: 'QuickBooks PATCH /invoices/* (10 records)' },
      { ts: '10:42:22.451', level: 'SUCCESS', msg: 'Run complete · 10 invoices processed · 0 errors' },
    ],
  },
  {
    slug: 'lead-sync',
    name: 'Lead Sync',
    cat: 'SLS',
    desc: 'Imports leads from Aurora + enriches with phone/email',
    state: 'success',
    pill: 'LIVE',
    runs: '1,382',
    conns: 'Aurora · Gmail',
    version: 'v1.8',
    schedule: 'Every 15 minutes',
    trigger: 'Cron · */15 * * * *',
    successRate: '99.9%',
    avgDuration: '2.1s',
    lastRun: '4 min ago',
    activity24h: [42, 38, 41, 45, 52, 48, 61, 78, 92, 88, 79, 84, 91, 87, 82, 76, 72, 68, 54, 48, 44, 42, 39, 41],
    envVars: [
      { key: 'AURORA_API_KEY', value: '•••••••• (vault)' },
      { key: 'DEDUPE_BY', value: 'email,phone' },
      { key: 'NOTIFY_ON_MISSING_PHONE', value: 'true' },
    ],
    recentRuns: baseRuns('lead-sync', [
      { time: '10:38', duration: '2.0s', state: 'success', output: '12 new leads imported' },
      { time: '10:23', duration: '1.9s', state: 'success', output: '8 new leads imported' },
      { time: '10:08', duration: '2.3s', state: 'success', output: '15 new leads imported' },
      { time: '09:53', duration: '2.1s', state: 'success', output: '6 new leads imported' },
      { time: '09:38', duration: '2.0s', state: 'success', output: '11 new leads imported' },
      { time: '09:23', duration: '1.8s', state: 'success', output: '4 new leads imported' },
      { time: '09:08', duration: '2.4s', state: 'warning', output: '9 imported · 2 missing phone' },
      { time: '08:53', duration: '2.1s', state: 'success', output: '13 new leads imported' },
    ]),
    logs: [
      { ts: '10:38:02.112', level: 'INFO', msg: 'Trigger fired · run_id=ls_8c2j4f' },
      { ts: '10:38:02.118', level: 'INFO', msg: 'Aurora · GET /leads?since=2026-05-20T10:23' },
      { ts: '10:38:02.512', level: 'INFO', msg: '→ 12 new leads' },
      { ts: '10:38:02.521', level: 'INFO', msg: 'Dedupe by email,phone' },
      { ts: '10:38:02.601', level: 'INFO', msg: '→ 12 unique leads (0 duplicates)' },
      { ts: '10:38:02.712', level: 'INFO', msg: 'Enriching with Gmail history' },
      { ts: '10:38:03.245', level: 'WARN', msg: 'Lead #4192 has no phone — flagged' },
      { ts: '10:38:03.412', level: 'WARN', msg: 'Lead #4194 has no phone — flagged' },
      { ts: '10:38:04.012', level: 'SUCCESS', msg: 'Run complete · 12 leads · 2 flagged' },
    ],
  },
  {
    slug: 'termin-bot',
    name: 'Appointment Bot',
    cat: 'SLS',
    desc: 'Creates appointments on request + sends Google Meet invites',
    state: 'success',
    pill: 'LIVE',
    runs: '89',
    conns: 'Calendar · WhatsApp',
    version: 'v2.0',
    schedule: 'Webhook',
    trigger: 'Incoming request',
    successRate: '98.9%',
    avgDuration: '3.4s',
    lastRun: '1 hr ago',
    activity24h: [2, 0, 0, 0, 0, 0, 1, 3, 6, 8, 9, 12, 11, 9, 8, 7, 6, 5, 4, 2, 1, 1, 0, 1],
    envVars: [
      { key: 'CAL_OWNER', value: 'alex@sunridge-energy.com' },
      { key: 'MEETING_DURATION', value: '60' },
      { key: 'BUFFER_BEFORE', value: '15' },
    ],
    recentRuns: baseRuns('termin-bot', [
      { time: '10:31', duration: '3.2s', state: 'success', output: 'Appointment Michael K. · 05/22 2:00 PM' },
      { time: '09:47', duration: '3.5s', state: 'success', output: 'Appointment Frey family · 05/23 9:00 AM' },
      { time: '08:22', duration: '3.4s', state: 'success', output: 'Appointment Locher Construction · 05/21 10:30 AM' },
      { time: '07:58', duration: '4.2s', state: 'warning', output: 'Conflict detected · Alternative slot suggested' },
    ]),
    logs: [
      { ts: '10:31:18.231', level: 'INFO', msg: 'Webhook · WhatsApp inbound · Michael K.' },
      { ts: '10:31:18.412', level: 'INFO', msg: 'AI parsing intent · APPOINTMENT_REQUEST' },
      { ts: '10:31:18.892', level: 'INFO', msg: 'Calendar · checking availability' },
      { ts: '10:31:19.012', level: 'INFO', msg: '→ Slot 05/22 2:00 PM available' },
      { ts: '10:31:20.245', level: 'INFO', msg: 'Google Meet created · meet.google.com/abc-defg-hij' },
      { ts: '10:31:21.451', level: 'SUCCESS', msg: 'Appointment booked · Invite sent' },
    ],
  },
  {
    slug: 'call-bot',
    name: 'Call Bot',
    cat: 'SLS',
    desc: 'Analyzes 3CX calls, suggests follow-ups',
    state: 'success',
    pill: 'LIVE',
    runs: '412',
    conns: '3CX · Aurora',
    version: 'v1.4',
    schedule: 'Every 30 minutes',
    trigger: 'Cron · */30 * * * *',
    successRate: '97.2%',
    avgDuration: '8.7s',
    lastRun: '12 min ago',
    activity24h: [8, 4, 2, 1, 0, 0, 6, 14, 22, 28, 32, 31, 28, 26, 24, 22, 18, 14, 10, 8, 6, 5, 4, 3],
    envVars: [
      { key: '3CX_HOST', value: 'pbx.sunridge-energy.com' },
      { key: 'TRANSCRIPTION_LANG', value: 'en-US' },
      { key: 'AI_MODEL', value: 'claude-sonnet-4-6' },
    ],
    recentRuns: baseRuns('call-bot', [
      { time: '09:58', duration: '8.4s', state: 'success', output: '8 calls analyzed · 3 follow-ups suggested' },
      { time: '09:28', duration: '9.1s', state: 'success', output: '12 calls analyzed · 5 follow-ups suggested' },
      { time: '08:58', duration: '7.8s', state: 'success', output: '6 calls analyzed · 2 follow-ups suggested' },
    ]),
    logs: [
      { ts: '09:58:02.112', level: 'INFO', msg: 'Fetching 3CX call recordings · last 30 min' },
      { ts: '09:58:02.512', level: 'INFO', msg: '→ 8 calls' },
      { ts: '09:58:02.612', level: 'INFO', msg: 'Anonymising transcripts (PII stripped)' },
      { ts: '09:58:08.412', level: 'INFO', msg: 'Claude scoring · quality 1-10' },
      { ts: '09:58:10.012', level: 'SUCCESS', msg: 'Run complete · 3 follow-ups suggested' },
    ],
  },
  {
    slug: 'rechnungs-bot',
    name: 'Invoice Bot',
    cat: 'FIN',
    desc: "Creates QuickBooks invoice once project status is 'done'",
    state: 'success',
    pill: 'LIVE',
    runs: '63',
    conns: 'QuickBooks · Aurora',
    version: 'v3.1',
    schedule: 'Webhook',
    trigger: 'Aurora project_status=done',
    successRate: '100%',
    avgDuration: '5.8s',
    lastRun: '24 min ago',
    activity24h: [1, 0, 0, 0, 0, 0, 2, 4, 6, 5, 8, 9, 7, 6, 5, 4, 3, 3, 2, 1, 1, 1, 0, 1],
    envVars: [
      { key: 'QUICKBOOKS_API_KEY', value: '•••••••• (vault)' },
      { key: 'DEFAULT_PAYMENT_TERMS', value: '14 days' },
      { key: 'AUTO_SEND', value: 'true' },
    ],
    recentRuns: baseRuns('rechnungs-bot', [
      { time: '10:24', duration: '5.6s', state: 'success', output: 'Invoice #2026-0341 · Huber family · $24,500' },
      { time: '08:14', duration: '5.9s', state: 'success', output: 'Invoice #2026-0340 · M. Egger · $4,200' },
    ]),
    logs: [
      { ts: '10:24:02.112', level: 'INFO', msg: 'Webhook · Aurora · project_status=done' },
      { ts: '10:24:02.412', level: 'INFO', msg: 'Loading project data · ID=8472' },
      { ts: '10:24:03.012', level: 'INFO', msg: 'QuickBooks · POST /invoices' },
      { ts: '10:24:07.412', level: 'SUCCESS', msg: 'Invoice created · #2026-0341' },
    ],
  },
  {
    slug: 'whatsapp-concierge',
    name: 'WhatsApp Concierge',
    cat: 'COM',
    desc: 'Answers standard questions, escalates complex topics',
    state: 'success',
    pill: 'LIVE',
    runs: '1,847',
    conns: 'WhatsApp · Aurora',
    version: 'v1.2',
    schedule: 'Real-time',
    trigger: 'WhatsApp Webhook',
    successRate: '94.8%',
    avgDuration: '1.8s',
    lastRun: '1 min ago',
    activity24h: [12, 8, 4, 2, 1, 0, 18, 42, 78, 92, 108, 124, 132, 128, 118, 102, 88, 72, 54, 42, 32, 24, 18, 14],
    envVars: [
      { key: 'WA_BUSINESS_ID', value: '••••••••' },
      { key: 'AI_MODEL', value: 'claude-sonnet-4-6' },
      { key: 'ESCALATION_KEYWORDS', value: 'complaint,issue,...' },
    ],
    recentRuns: baseRuns('whatsapp-concierge', [
      { time: '10:12', duration: '1.6s', state: 'success', output: 'Reply to "When is next appointment?" · auto' },
      { time: '10:11', duration: '2.1s', state: 'success', output: 'Reply to "How much does a heat pump cost?" · escalated' },
      { time: '10:09', duration: '1.8s', state: 'success', output: 'Reply to "Address?" · auto' },
    ]),
    logs: [
      { ts: '10:12:02.112', level: 'INFO', msg: 'WhatsApp inbound · +1 555 ••• ••••' },
      { ts: '10:12:02.412', level: 'INFO', msg: 'Intent classification · APPOINTMENT_QUESTION' },
      { ts: '10:12:03.012', level: 'INFO', msg: 'Aurora lookup · customer found' },
      { ts: '10:12:03.812', level: 'SUCCESS', msg: 'Auto-reply sent' },
    ],
  },
  {
    slug: 'tagesreport',
    name: 'Daily Report',
    cat: 'ALL',
    desc: 'Generates the management briefing every morning at 7:00 AM',
    state: 'success',
    pill: 'LIVE',
    runs: '138',
    conns: 'Claude · Mail',
    version: 'v2.0',
    schedule: 'Daily 07:00',
    trigger: 'Cron · 0 7 * * *',
    successRate: '100%',
    avgDuration: '32.4s',
    lastRun: '3 hrs ago',
    activity24h: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    envVars: [
      { key: 'REPORT_RECIPIENTS', value: 'alex@..., max@...' },
      { key: 'AI_MODEL', value: 'claude-sonnet-4-6' },
      { key: 'INCLUDE_PDF', value: 'true' },
    ],
    recentRuns: baseRuns('tagesreport', [
      { time: '07:00', duration: '31.8s', state: 'success', output: 'Report sent · 2 recipients · PDF attached' },
    ]),
    logs: [
      { ts: '07:00:02.112', level: 'INFO', msg: 'Aggregating KPIs from kpi_snapshots' },
      { ts: '07:00:08.412', level: 'INFO', msg: 'Claude · generating narrative' },
      { ts: '07:00:28.412', level: 'INFO', msg: 'Rendering React-Email · daily-report' },
      { ts: '07:00:31.812', level: 'SUCCESS', msg: 'Sent · 2 recipients' },
    ],
  },
  {
    slug: 'datev-export',
    name: 'QuickBooks Export',
    cat: 'FIN',
    desc: 'Exports monthly transactions as QuickBooks CSV',
    state: 'neutral',
    pill: 'PAUSE',
    runs: '12',
    conns: 'QuickBooks · Drive',
    version: 'v1.0',
    schedule: 'Monthly · 1st at 08:00',
    trigger: 'Cron · 0 8 1 * *',
    successRate: '100%',
    avgDuration: '46.2s',
    lastRun: '05/01/2026',
    activity24h: Array(24).fill(0),
    envVars: [
      { key: 'QB_ACCOUNT_ID', value: '12345' },
      { key: 'QB_COMPANY_ID', value: '67890' },
      { key: 'DRIVE_FOLDER_ID', value: '1XYZ...' },
    ],
    recentRuns: baseRuns('datev-export', [
      { time: '05/01', duration: '44.2s', state: 'success', output: 'CSV with 247 transactions · uploaded to Drive' },
      { time: '04/01', duration: '48.1s', state: 'success', output: 'CSV with 218 transactions · uploaded to Drive' },
    ]),
    logs: [
      { ts: '08:00:02', level: 'INFO', msg: 'Bot paused since 05/02 · Setup pending' },
    ],
  },
  {
    slug: 'mahnstufe-3',
    name: 'Collection Stage 3',
    cat: 'FIN',
    desc: 'Collections handoff after 60 days, manual trigger',
    state: 'warning',
    pill: 'NOTICE',
    runs: '—',
    conns: 'QuickBooks · Mail',
    version: 'v0.9',
    schedule: 'Manual',
    trigger: 'Operator click',
    successRate: '—',
    avgDuration: '—',
    lastRun: 'never',
    activity24h: Array(24).fill(0),
    envVars: [
      { key: 'COLLECTIONS_PARTNER', value: 'tba' },
      { key: 'COLLECTIONS_API_KEY', value: '—' },
    ],
    recentRuns: [],
    logs: [
      { ts: '—', level: 'WARN', msg: 'Bot awaiting configuration · Collections partner still needs to be set up' },
    ],
  },
];

export function getBot(slug: string): Bot | undefined {
  return bots.find((b) => b.slug === slug);
}

export type SearchItem = {
  id: string;
  label: string;
  category: string;
  icon: string;
  href: string;
};

// ============ CONNECTORS (grouped, solar-vertical) ============
export type ConnState = 'online' | 'warn' | 'paused';

export type Connector = {
  name: string;
  letter: string;
  protocol: string;
  detail: string;
  access: string;
  sync: string;
  state: ConnState;
};

export const connectorGroups: { group: string; desc: string; items: Connector[] }[] = [
  {
    group: 'Inverters & Storage',
    desc: 'Live data from installed systems · Modbus TCP & manufacturer cloud',
    items: [
      { name: 'Fronius', letter: 'F', protocol: 'Modbus TCP', detail: 'Symo GEN24 · 3 systems', access: 'read · control', sync: '30 sec ago', state: 'online' },
      { name: 'SMA', letter: 'SM', protocol: 'Modbus TCP', detail: 'Sunny Tripower · 5 systems', access: 'read · control', sync: '45 sec ago', state: 'online' },
      { name: 'Kostal', letter: 'K', protocol: 'Modbus TCP', detail: 'Plenticore plus · 2 systems', access: 'read · control', sync: '1 min ago', state: 'online' },
      { name: 'Sungrow', letter: 'SG', protocol: 'Modbus TCP', detail: 'SH10RT · 4 systems', access: 'read · control', sync: '30 sec ago', state: 'online' },
      { name: 'EcoFlow', letter: 'E', protocol: 'Cloud API', detail: 'PowerOcean · 6 systems', access: 'read · control', sync: '1 min ago', state: 'online' },
      { name: 'Anker SOLIX', letter: 'A', protocol: 'Cloud API', detail: 'X1 Hybrid · 2 systems', access: 'read', sync: '8 min ago', state: 'warn' },
      { name: 'Victron Energy', letter: 'V', protocol: 'VRM API', detail: 'MultiPlus-II · 1 system', access: 'read · control', sync: '2 min ago', state: 'online' },
      { name: 'Bluetti', letter: 'B', protocol: 'Cloud API', detail: 'EP900 · setup in progress', access: '—', sync: '—', state: 'paused' },
    ],
  },
  {
    group: 'Dynamic Electricity Rates',
    desc: 'Hourly market prices for battery & load optimization',
    items: [
      { name: 'Tibber', letter: 'T', protocol: 'GraphQL API', detail: 'Real-time rates · 12 households', access: 'read', sync: '5 min ago', state: 'online' },
      { name: 'aWATTar', letter: 'aW', protocol: 'REST API', detail: 'HOURLY rate · 8 households', access: 'read', sync: '12 min ago', state: 'online' },
    ],
  },
  {
    group: 'Weather & Solar Forecast',
    desc: 'Yield forecast and weather data per site',
    items: [
      { name: 'Solcast', letter: 'Sc', protocol: 'REST API', detail: 'PV yield forecast · hourly', access: 'read', sync: '14 min ago', state: 'online' },
      { name: 'OpenWeatherMap', letter: 'O', protocol: 'REST API', detail: 'Weather data · 15 installed sites', access: 'read', sync: '6 min ago', state: 'online' },
    ],
  },
  {
    group: 'CRM, Accounting & Communication',
    desc: 'Installer back-office tools',
    items: [
      { name: 'Aurora Solar', letter: 'R', protocol: 'REST API', detail: 'Leads · Quotes · Projects', access: 'read · write', sync: '4 min ago', state: 'online' },
      { name: 'QuickBooks', letter: 'Bx', protocol: 'REST API', detail: 'Invoices · Accounting', access: 'read · write', sync: '12 min ago', state: 'online' },
      { name: 'FreshBooks', letter: 'Sv', protocol: 'REST API', detail: 'Accounting', access: 'read · write', sync: '18 min ago', state: 'online' },
      { name: 'Gmail (Alex)', letter: 'G', protocol: 'OAuth', detail: 'Communication', access: 'read · write (authorized)', sync: '2 min ago', state: 'online' },
      { name: 'Google Calendar', letter: 'C', protocol: 'OAuth', detail: 'Appointments & Consultations', access: 'read · write', sync: '8 min ago', state: 'online' },
      { name: 'WhatsApp Business', letter: 'W', protocol: 'Webhook', detail: 'Customer support', access: 'read · write', sync: '1 min ago', state: 'online' },
      { name: 'QuickBooks Payroll', letter: 'D', protocol: 'QB Connect', detail: 'Payroll · Export', access: 'read · write', sync: '—', state: 'paused' },
    ],
  },
];

// ============ PV INSTALLATIONS (Systems) ============
export type InstallState = 'online' | 'warn' | 'offline';

export type Device = { name: string; brand: string; type: string; state: 'online' | 'warn' | 'offline'; detail: string };

export type Installation = {
  slug: string;
  customer: string;
  address: string;
  type: 'Residential' | 'Commercial';
  kwp: number;
  inverterBrand: string;
  inverter: string;
  batteryBrand: string;
  battery: string;
  batteryKwh: number;
  nowProduction: number; // kW
  batterySoc: number; // %
  selfConsumption: number; // %
  state: InstallState;
  flow: { solar: number; house: number; battery: number; grid: number }; // kW, battery + = charging, grid + = exporting
  productionToday: number[]; // 24 hourly kW
  yieldTodayKwh: number;
  forecastTodayKwh: number;
  forecastTomorrowKwh: number;
  forecastConfidence: number; // %
  tariff: { provider: string; nowPrice: number; trend: 'up' | 'down'; cheapWindow: string; recommendation: string };
  devices: Device[];
  events: { time: string; msg: string; kind: 'success' | 'info' | 'warning' | 'error' }[];
};

const curve = (peak: number): number[] => {
  const shape = [0, 0, 0, 0, 0, 0.02, 0.08, 0.22, 0.42, 0.63, 0.81, 0.93, 1.0, 0.96, 0.87, 0.71, 0.52, 0.33, 0.16, 0.04, 0, 0, 0, 0];
  return shape.map((s) => Math.round(s * peak * 10) / 10);
};

export const installations: Installation[] = [
  {
    slug: 'solar-berg',
    customer: 'Solar Ridge Corp',
    address: '1200 Industrial Pkwy, Denver',
    type: 'Commercial',
    kwp: 99.6,
    inverterBrand: 'SMA',
    inverter: 'Sunny Tripower CORE2 ×3',
    batteryBrand: 'EcoFlow',
    battery: 'PowerOcean',
    batteryKwh: 30,
    nowProduction: 62.4,
    batterySoc: 78,
    selfConsumption: 84,
    state: 'online',
    flow: { solar: 62.4, house: 41.2, battery: 12.0, grid: 9.2 },
    productionToday: curve(72),
    yieldTodayKwh: 412,
    forecastTodayKwh: 498,
    forecastTomorrowKwh: 521,
    forecastConfidence: 92,
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '1:00 PM–3:00 PM', recommendation: 'Surplus → charge battery, exporting worthwhile after 4 PM' },
    devices: [
      { name: 'INV 1 — SMA STP CORE2', brand: 'SMA', type: 'Inverter', state: 'online', detail: '21.4 kW · 712 V DC' },
      { name: 'INV 2 — SMA STP CORE2', brand: 'SMA', type: 'Inverter', state: 'online', detail: '20.8 kW · 698 V DC' },
      { name: 'INV 3 — SMA STP CORE2', brand: 'SMA', type: 'Inverter', state: 'online', detail: '20.2 kW · 705 V DC' },
      { name: 'Storage — EcoFlow PowerOcean', brand: 'EcoFlow', type: 'Battery', state: 'online', detail: '30 kWh · 78% · charging 12 kW' },
      { name: 'Smart Meter — SMA Energy Meter', brand: 'SMA', type: 'Meter', state: 'online', detail: 'Grid draw 0 W' },
    ],
    events: [
      { time: '12:14', msg: 'Battery charging started (surplus + low rate)', kind: 'success' },
      { time: '09:02', msg: 'Daily production above forecast (+4%)', kind: 'info' },
      { time: '07:41', msg: 'INV 2 reconnect after overnight standby', kind: 'info' },
    ],
  },
  {
    slug: 'huber',
    customer: 'The Huber Family',
    address: '44 Mountain View Dr, Boulder',
    type: 'Residential',
    kwp: 12.4,
    inverterBrand: 'Fronius',
    inverter: 'Symo GEN24 10.0 Plus',
    batteryBrand: 'BYD',
    battery: 'HVS 10.2',
    batteryKwh: 10.2,
    nowProduction: 8.4,
    batterySoc: 62,
    selfConsumption: 71,
    state: 'online',
    flow: { solar: 8.4, house: 2.1, battery: 5.1, grid: 1.2 },
    productionToday: curve(9.8),
    yieldTodayKwh: 41,
    forecastTodayKwh: 54,
    forecastTomorrowKwh: 58,
    forecastConfidence: 89,
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '1:00 PM–3:00 PM', recommendation: 'Battery almost full — charge heat pump & EV later when price < 15 ct' },
    devices: [
      { name: 'Inverter — Fronius Symo GEN24', brand: 'Fronius', type: 'Inverter', state: 'online', detail: '8.4 kW · 612 V DC' },
      { name: 'Storage — BYD HVS 10.2', brand: 'BYD', type: 'Battery', state: 'online', detail: '10.2 kWh · 62% · charging 5.1 kW' },
      { name: 'Smart Meter — Fronius Smart Meter', brand: 'Fronius', type: 'Meter', state: 'online', detail: 'Exporting 1.2 kW' },
      { name: 'Wallbox — Fronius Wattpilot', brand: 'Fronius', type: 'Wallbox', state: 'online', detail: 'ready · PV surplus mode' },
    ],
    events: [
      { time: '11:48', msg: 'PV surplus → Wallbox on standby', kind: 'info' },
      { time: '08:12', msg: 'Battery morning charge completed', kind: 'success' },
    ],
  },
  {
    slug: 'schmid',
    customer: 'Schmid Energy',
    address: '88 Main St, Fort Collins',
    type: 'Commercial',
    kwp: 24.8,
    inverterBrand: 'Sungrow',
    inverter: 'SH10RT ×2',
    batteryBrand: 'Anker SOLIX',
    battery: 'X1 Hybrid',
    batteryKwh: 16,
    nowProduction: 18.1,
    batterySoc: 91,
    selfConsumption: 88,
    state: 'online',
    flow: { solar: 18.1, house: 6.4, battery: 3.2, grid: 8.5 },
    productionToday: curve(20),
    yieldTodayKwh: 118,
    forecastTodayKwh: 142,
    forecastTomorrowKwh: 138,
    forecastConfidence: 90,
    tariff: { provider: 'aWATTar', nowPrice: 16.9, trend: 'down', cheapWindow: '12:00 PM–2:00 PM', recommendation: 'Battery almost full → prioritize grid export' },
    devices: [
      { name: 'INV 1 — Sungrow SH10RT', brand: 'Sungrow', type: 'Inverter', state: 'online', detail: '9.2 kW' },
      { name: 'INV 2 — Sungrow SH10RT', brand: 'Sungrow', type: 'Inverter', state: 'online', detail: '8.9 kW' },
      { name: 'Storage — Anker SOLIX X1', brand: 'Anker SOLIX', type: 'Battery', state: 'warn', detail: '16 kWh · 91% · Firmware update available' },
    ],
    events: [
      { time: '10:31', msg: 'Anker SOLIX: Firmware 2.4.1 available', kind: 'warning' },
      { time: '06:58', msg: 'System started · Sunrise', kind: 'info' },
    ],
  },
  {
    slug: 'frey',
    customer: 'The Frey Family',
    address: '2 Sunny Hill Rd, Aspen',
    type: 'Residential',
    kwp: 9.8,
    inverterBrand: 'Kostal',
    inverter: 'Plenticore plus 10',
    batteryBrand: 'Victron',
    battery: 'MultiPlus-II',
    batteryKwh: 12,
    nowProduction: 6.2,
    batterySoc: 45,
    selfConsumption: 64,
    state: 'online',
    flow: { solar: 6.2, house: 3.8, battery: 2.4, grid: 0 },
    productionToday: curve(8),
    yieldTodayKwh: 28,
    forecastTodayKwh: 39,
    forecastTomorrowKwh: 44,
    forecastConfidence: 81,
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'up', cheapWindow: '2:00 AM–5:00 AM', recommendation: 'Battery only 45% — charge overnight at low rate' },
    devices: [
      { name: 'Inverter — Kostal Plenticore', brand: 'Kostal', type: 'Inverter', state: 'online', detail: '6.2 kW' },
      { name: 'Storage — Victron MultiPlus-II', brand: 'Victron', type: 'Battery', state: 'online', detail: '12 kWh · 45% · charging 2.4 kW' },
      { name: 'Cerbo GX', brand: 'Victron', type: 'Gateway', state: 'online', detail: 'VRM connected' },
    ],
    events: [
      { time: '09:22', msg: 'Cloud cover → Production -40% temporarily', kind: 'info' },
    ],
  },
  {
    slug: 'egger',
    customer: 'Egger Consulting',
    address: '5 Commerce Park, Lakewood',
    type: 'Commercial',
    kwp: 32,
    inverterBrand: 'SMA',
    inverter: 'Sunny Tripower ×2',
    batteryBrand: 'EcoFlow',
    battery: 'PowerOcean',
    batteryKwh: 20,
    nowProduction: 21.4,
    batterySoc: 83,
    selfConsumption: 79,
    state: 'online',
    flow: { solar: 21.4, house: 12.1, battery: 4.3, grid: 5.0 },
    productionToday: curve(24),
    yieldTodayKwh: 142,
    forecastTodayKwh: 168,
    forecastTomorrowKwh: 172,
    forecastConfidence: 91,
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '1:00 PM–3:00 PM', recommendation: 'Load shifting: run HVAC now' },
    devices: [
      { name: 'INV 1 — SMA Sunny Tripower', brand: 'SMA', type: 'Inverter', state: 'online', detail: '11.2 kW' },
      { name: 'INV 2 — SMA Sunny Tripower', brand: 'SMA', type: 'Inverter', state: 'online', detail: '10.2 kW' },
      { name: 'Storage — EcoFlow PowerOcean', brand: 'EcoFlow', type: 'Battery', state: 'online', detail: '20 kWh · 83%' },
    ],
    events: [{ time: '08:45', msg: 'Self-consumption rate above target (79% vs 75%)', kind: 'success' }],
  },
  {
    slug: 'luethi',
    customer: 'K. Luthi',
    address: '19 Valley Rd, Vail',
    type: 'Residential',
    kwp: 8.2,
    inverterBrand: 'Fronius',
    inverter: 'Symo GEN24 8.0',
    batteryBrand: 'BYD',
    battery: 'HVS 7.7',
    batteryKwh: 7.7,
    nowProduction: 0,
    batterySoc: 22,
    selfConsumption: 0,
    state: 'warn',
    flow: { solar: 0, house: 1.8, battery: -1.8, grid: 0 },
    productionToday: curve(0),
    yieldTodayKwh: 0,
    forecastTodayKwh: 34,
    forecastTomorrowKwh: 41,
    forecastConfidence: 76,
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'up', cheapWindow: '2:00 AM–5:00 AM', recommendation: 'System offline — drawing from battery, not recharging' },
    devices: [
      { name: 'Inverter — Fronius Symo GEN24', brand: 'Fronius', type: 'Inverter', state: 'offline', detail: 'no connection since 11:02' },
      { name: 'Storage — BYD HVS 7.7', brand: 'BYD', type: 'Battery', state: 'online', detail: '7.7 kWh · 22% · discharging' },
    ],
    events: [
      { time: '11:02', msg: 'Inverter offline — connection lost', kind: 'error' },
      { time: '11:03', msg: 'Service ticket auto-created · #SV-2291', kind: 'warning' },
    ],
  },
  {
    slug: 'locher',
    customer: 'Locher Construction LLC',
    address: '3 Depot Way, Golden',
    type: 'Commercial',
    kwp: 48,
    inverterBrand: 'Sungrow',
    inverter: 'SH10RT ×4',
    batteryBrand: 'Anker SOLIX',
    battery: 'X1 Hybrid ×2',
    batteryKwh: 32,
    nowProduction: 31.2,
    batterySoc: 67,
    selfConsumption: 81,
    state: 'online',
    flow: { solar: 31.2, house: 18.4, battery: 8.8, grid: 4.0 },
    productionToday: curve(36),
    yieldTodayKwh: 198,
    forecastTodayKwh: 242,
    forecastTomorrowKwh: 238,
    forecastConfidence: 90,
    tariff: { provider: 'aWATTar', nowPrice: 16.9, trend: 'down', cheapWindow: '12:00 PM–2:00 PM', recommendation: 'Run equipment on solar power now' },
    devices: [
      { name: 'INV cluster — Sungrow SH10RT ×4', brand: 'Sungrow', type: 'Inverter', state: 'online', detail: '31.2 kW total' },
      { name: 'Storage — Anker SOLIX X1 ×2', brand: 'Anker SOLIX', type: 'Battery', state: 'online', detail: '32 kWh · 67%' },
    ],
    events: [{ time: '07:30', msg: 'System started · Production above plan', kind: 'success' }],
  },
  {
    slug: 'meier',
    customer: 'Meier Woodworks',
    address: '7 Mill Rd, Littleton',
    type: 'Commercial',
    kwp: 15.6,
    inverterBrand: 'Kostal',
    inverter: 'Plenticore plus 15',
    batteryBrand: 'Bluetti',
    battery: 'EP900',
    batteryKwh: 19.8,
    nowProduction: 11.8,
    batterySoc: 55,
    selfConsumption: 73,
    state: 'online',
    flow: { solar: 11.8, house: 7.2, battery: 3.1, grid: 1.5 },
    productionToday: curve(13),
    yieldTodayKwh: 72,
    forecastTodayKwh: 88,
    forecastTomorrowKwh: 84,
    forecastConfidence: 87,
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '1:00 PM–3:00 PM', recommendation: 'Schedule dust collector to run on PV surplus' },
    devices: [
      { name: 'Inverter — Kostal Plenticore', brand: 'Kostal', type: 'Inverter', state: 'online', detail: '11.8 kW' },
      { name: 'Storage — Bluetti EP900', brand: 'Bluetti', type: 'Battery', state: 'online', detail: '19.8 kWh · 55%' },
    ],
    events: [{ time: '08:10', msg: 'System started', kind: 'info' }],
  },
];

export function getInstallation(slug: string): Installation | undefined {
  return installations.find((i) => i.slug === slug);
}

export const searchIndex: SearchItem[] = [
  { id: 'p-dash', label: 'Dashboard', category: 'Page', icon: '◇', href: '/dashboard' },
  { id: 'p-bots', label: 'Bots', category: 'Page', icon: '◈', href: '/bots' },
  { id: 'p-conn', label: 'Connectors', category: 'Page', icon: '⌘', href: '/connectors' },
  { id: 'p-fin', label: 'Finance', category: 'Page', icon: '$', href: '/finance' },
  ...bots.map((b) => ({ id: 'b-' + b.slug, label: b.name, category: 'Bot · ' + b.cat, icon: '◈', href: '/bots/' + b.slug })),
  ...installations.map((i) => ({ id: 'a-' + i.slug, label: i.customer + ' · ' + i.kwp + ' kWp', category: 'System · ' + i.inverterBrand, icon: '☀', href: '/anlagen/' + i.slug })),
  { id: 'k-huber', label: 'The Huber Family', category: 'Customer', icon: '◉', href: '/finance' },
  { id: 'k-schmid', label: 'Schmid Energy', category: 'Customer', icon: '◉', href: '/finance' },
  { id: 'k-locher', label: 'Locher Construction LLC', category: 'Customer', icon: '◉', href: '/finance' },
  { id: 'k-frey', label: 'The Frey Family', category: 'Customer', icon: '◉', href: '/finance' },
  { id: 'k-berg', label: 'Solar Ridge Corp', category: 'Customer', icon: '◉', href: '/finance' },
  { id: 'r-0341', label: 'Invoice #2026-0341 · $24,500', category: 'Invoice', icon: '$', href: '/finance' },
  { id: 'r-0298', label: 'Invoice #2026-0298 · Reminder 2', category: 'Invoice', icon: '$', href: '/finance' },
  { id: 'r-0287', label: 'Invoice #2026-0287 · Reminder 1', category: 'Invoice', icon: '$', href: '/finance' },
  { id: 'a-mahn', label: 'Start dunning run now', category: 'Action', icon: '⚡', href: '/finance' },
  { id: 'a-pause', label: 'Pause all bots', category: 'Action', icon: '⏸', href: '/bots' },
  { id: 'a-datev', label: 'Request May QuickBooks export', category: 'Action', icon: '⚡', href: '/finance' },
];
