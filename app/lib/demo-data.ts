// Realistic US solar demo data for all pages.
// Used when DEFAULT_TENANT_SLUG=demo so prospects see a fully populated platform.

export const DEMO_PIPELINE = {
  configured: true,
  error: undefined as string | undefined,
  total: 184,
  open: 47,
  won: 89,
  lost: 31,
  pipelineValueOpen: 1_845_000,
  wonValue: 3_412_500,
  byStatus: [
    { status: 'New Lead', count: 18 },
    { status: 'Site Survey', count: 12 },
    { status: 'Proposal Sent', count: 9 },
    { status: 'Contract Signed', count: 8 },
    { status: 'Permit & AHJ', count: 14 },
    { status: 'Installation', count: 6 },
  ],
  bySeller: [
    { id: 's1', name: 'Jake Morrison', wonCount: 28, wonValue: 1_085_000, openValue: 342_000 },
    { id: 's2', name: 'Maria Santos', wonCount: 24, wonValue: 945_000, openValue: 287_000 },
    { id: 's3', name: 'Tyler Brooks', wonCount: 21, wonValue: 812_500, openValue: 198_000 },
    { id: 's4', name: 'Priya Nair', wonCount: 16, wonValue: 570_000, openValue: 418_000 },
  ],
  recent: [
    { id: 'o1', customer: 'Rodriguez Family', status: 'Contract Signed', value: 42500, state: 'Won' as const, date: '2026-06-14', seller: 'Jake Morrison' },
    { id: 'o2', customer: 'Henderson Residence', status: 'Proposal Sent', value: 38200, state: 'Open' as const, date: '2026-06-13', seller: 'Maria Santos' },
    { id: 'o3', customer: 'Williams Ranch', status: 'Site Survey', value: 67800, state: 'Open' as const, date: '2026-06-12', seller: 'Tyler Brooks' },
    { id: 'o4', customer: 'Chen Family', status: 'Installation', value: 31400, state: 'Won' as const, date: '2026-06-11', seller: 'Priya Nair' },
    { id: 'o5', customer: 'Thompson Estate', status: 'Permit & AHJ', value: 54200, state: 'Open' as const, date: '2026-06-10', seller: 'Jake Morrison' },
    { id: 'o6', customer: 'Davis Home', status: 'New Lead', value: 28900, state: 'Open' as const, date: '2026-06-09', seller: 'Maria Santos' },
    { id: 'o7', customer: 'Park Residence', status: 'Contract Signed', value: 45600, state: 'Won' as const, date: '2026-06-08', seller: 'Tyler Brooks' },
    { id: 'o8', customer: 'Mitchell Property', status: 'New Lead', value: 33100, state: 'Open' as const, date: '2026-06-07', seller: 'Priya Nair' },
    { id: 'o9', customer: 'Garcia Duplex', status: 'Proposal Sent', value: 52800, state: 'Open' as const, date: '2026-06-06', seller: 'Jake Morrison' },
    { id: 'o10', customer: 'Nguyen Home', status: 'Installation', value: 29700, state: 'Won' as const, date: '2026-06-05', seller: 'Maria Santos' },
  ],
};

export const DEMO_LEADS = {
  configured: true,
  total: 1247,
  capped: true,
  bySource: [
    { source: 'Website', count: 412 },
    { source: 'Google Ads', count: 298 },
    { source: 'Referral', count: 187 },
    { source: 'Door-to-Door', count: 164 },
    { source: 'Home Shows', count: 98 },
    { source: 'Nextdoor', count: 88 },
  ],
};

export const DEMO_REGISTRATIONS = [
  { offerId: 'r1', customer: 'Rodriguez Family', address: '4521 Oak Lane, Austin TX 78745', kwp: 12.4, value: 42500, status: 'zusage' as const, docStatus: 'unterschrieben' as const, dueDate: undefined, utility: 'Oncor', ahjCode: 'AHJ-TX-4521' },
  { offerId: 'r2', customer: 'Henderson Residence', address: '882 Maple Dr, Denver CO 80220', kwp: 9.6, value: 38200, status: 'anfrage' as const, docStatus: 'pruefen' as const, dueDate: '2026-06-20', utility: 'Xcel Energy', ahjCode: 'AHJ-CO-882' },
  { offerId: 'r3', customer: 'Williams Ranch', address: '1200 Country Rd, Scottsdale AZ 85251', kwp: 18.8, value: 67800, status: 'inbetriebnahme' as const, docStatus: 'hochgeladen' as const, dueDate: undefined, utility: 'APS', ahjCode: 'AHJ-AZ-1200' },
  { offerId: 'r4', customer: 'Chen Family', address: '556 Palm Ave, San Jose CA 95112', kwp: 8.2, value: 31400, status: 'zusage' as const, docStatus: 'offen' as const, dueDate: '2026-06-18', utility: 'PG&E', ahjCode: 'AHJ-CA-556' },
  { offerId: 'r5', customer: 'Thompson Estate', address: '3100 Lakeview Blvd, Orlando FL 32801', kwp: 15.6, value: 54200, status: 'mastr' as const, docStatus: 'unterschrieben' as const, dueDate: '2026-06-25', utility: 'Duke Energy', ahjCode: 'AHJ-FL-3100' },
  { offerId: 'r6', customer: 'Davis Home', address: '741 Birch St, Portland OR 97205', kwp: 7.8, value: 28900, status: 'anfrage' as const, docStatus: 'offen' as const, dueDate: undefined, utility: 'PGE Oregon', ahjCode: 'AHJ-OR-741' },
  { offerId: 'r7', customer: 'Park Residence', address: '2200 Pine Rd, Charlotte NC 28202', kwp: 11.2, value: 45600, status: 'abschluss' as const, docStatus: 'unterschrieben' as const, dueDate: undefined, utility: 'Duke Energy', ahjCode: 'AHJ-NC-2200' },
  { offerId: 'r8', customer: 'Mitchell Property', address: '450 Cedar Ave, Houston TX 77002', kwp: 9.4, value: 33100, status: 'zusage' as const, docStatus: 'pruefen' as const, dueDate: '2026-06-22', utility: 'CenterPoint', ahjCode: 'AHJ-TX-450' },
  { offerId: 'r9', customer: 'Garcia Duplex', address: '1800 Sunset Blvd, Phoenix AZ 85004', kwp: 14.6, value: 52800, status: 'inbetriebnahme' as const, docStatus: 'hochgeladen' as const, dueDate: undefined, utility: 'SRP', ahjCode: 'AHJ-AZ-1800' },
  { offerId: 'r10', customer: 'Nguyen Home', address: '320 Elm St, Sacramento CA 95814', kwp: 8.0, value: 29700, status: 'abschluss' as const, docStatus: 'unterschrieben' as const, dueDate: undefined, utility: 'SMUD', ahjCode: 'AHJ-CA-320' },
];

export const DEMO_ANLAGEN = [
  { id: 'a1', slug: 'a1', customer: 'Rodriguez Family', address: '4521 Oak Lane, Austin TX 78745', kwp: 12.4, inverter: 'SolarEdge SE11400H', batteryKwh: 13.5, battery: 'Tesla Powerwall 2' },
  { id: 'a2', slug: 'a2', customer: 'Chen Family', address: '556 Palm Ave, San Jose CA 95112', kwp: 8.2, inverter: 'Enphase IQ8+', batteryKwh: 10.0, battery: 'Enphase IQ Battery 10' },
  { id: 'a3', slug: 'a3', customer: 'Park Residence', address: '2200 Pine Rd, Charlotte NC 28202', kwp: 11.2, inverter: 'SolarEdge SE10000H', batteryKwh: null, battery: '—' },
  { id: 'a4', slug: 'a4', customer: 'Nguyen Home', address: '320 Elm St, Sacramento CA 95814', kwp: 8.0, inverter: 'Enphase IQ8M', batteryKwh: 5.0, battery: 'Enphase IQ Battery 5P' },
  { id: 'a5', slug: 'a5', customer: 'Williams Ranch', address: '1200 Country Rd, Scottsdale AZ 85251', kwp: 18.8, inverter: 'SolarEdge SE16000H', batteryKwh: 27.0, battery: 'Tesla Powerwall 2 (x2)' },
  { id: 'a6', slug: 'a6', customer: 'Thompson Estate', address: '3100 Lakeview Blvd, Orlando FL 32801', kwp: 15.6, inverter: 'SMA Sunny Boy 15.0', batteryKwh: 10.0, battery: 'LG RESU 10H' },
  { id: 'a7', slug: 'a7', customer: 'Garcia Duplex', address: '1800 Sunset Blvd, Phoenix AZ 85004', kwp: 14.6, inverter: 'SolarEdge SE14400H', batteryKwh: 13.5, battery: 'Tesla Powerwall 2' },
];

export const DEMO_MAILBOX = {
  configured: true,
  error: undefined as string | undefined,
  account: 'team@sunpeaksolar.com',
  unread: 7,
  messagesTotal: 2847,
  recent: [
    { id: 'm1', from: 'permits@oncor.com', subject: 'Interconnection Approval — Rodriguez (4521 Oak Lane)', snippet: 'Your application has been approved. Please proceed with installation scheduling...', date: '2026-06-16T09:42:00Z' },
    { id: 'm2', from: 'Sarah Rodriguez', subject: 'Re: Installation Date Confirmation', snippet: 'Thursday works perfectly for us. Will someone need roof access from the back?', date: '2026-06-16T08:15:00Z' },
    { id: 'm3', from: 'noreply@aurora-solar.com', subject: 'Design Complete — Henderson Project', snippet: 'Your solar design for 882 Maple Dr has been completed. 24 panels, estimated 14,200 kWh/yr...', date: '2026-06-15T16:30:00Z' },
    { id: 'm4', from: 'inspections@denver.gov', subject: 'Inspection Scheduled — Permit #2026-0882', snippet: 'Electrical inspection confirmed for June 19th, 2026 between 9:00 AM and 12:00 PM...', date: '2026-06-15T14:22:00Z' },
    { id: 'm5', from: 'Jake Morrison', subject: 'New lead from Zillow campaign', snippet: 'Got a hot lead in Scottsdale — 4,200 sqft home, south-facing roof, no shade. Already pre-qualified...', date: '2026-06-15T11:08:00Z' },
    { id: 'm6', from: 'accounting@teslaenergy.com', subject: 'Invoice #TE-2026-4821 — Powerwall Order', snippet: '2x Tesla Powerwall 2 units shipped. Expected delivery: June 18. Tracking: 1Z999AA10...', date: '2026-06-14T15:45:00Z' },
    { id: 'm7', from: 'Maria Santos', subject: 'Re: Q2 Pipeline Review', snippet: 'Updated the forecast — we are tracking 12% ahead of target. Can we discuss the Austin expansion...', date: '2026-06-14T10:30:00Z' },
    { id: 'm8', from: 'support@enphase.com', subject: 'RMA Approved — IQ8+ Microinverter', snippet: 'Replacement unit shipping today via FedEx 2-Day. Please return defective unit within 30 days...', date: '2026-06-13T13:12:00Z' },
  ],
};

export const DEMO_USERS = [
  { id: 'u1', name: 'Sarah Vogel', email: 'sarah@sunpeaksolar.com', role: 'owner' },
  { id: 'u2', name: 'Jake Morrison', email: 'jake@sunpeaksolar.com', role: 'admin' },
  { id: 'u3', name: 'Maria Santos', email: 'maria@sunpeaksolar.com', role: 'member' },
  { id: 'u4', name: 'Tyler Brooks', email: 'tyler@sunpeaksolar.com', role: 'member' },
  { id: 'u5', name: 'Priya Nair', email: 'priya@sunpeaksolar.com', role: 'member' },
  { id: 'u6', name: 'David Kim', email: 'david@sunpeaksolar.com', role: 'member' },
];

export const DEMO_TEAMS = [
  { id: 't1', name: 'Sales — West' },
  { id: 't2', name: 'Sales — South' },
  { id: 't3', name: 'Installation Crew' },
  { id: 't4', name: 'Back Office' },
];

export const DEMO_CATALOG = {
  configured: true,
  error: undefined as string | undefined,
  total: 86,
  byType: [
    { type: 'module', label: 'Modules', count: 24 },
    { type: 'inverter', label: 'Inverters', count: 18 },
    { type: 'batteryStorage', label: 'Battery Storage', count: 12 },
    { type: 'wallbox', label: 'EV Chargers', count: 9 },
    { type: 'heatPump', label: 'Heat Pumps', count: 8 },
    { type: 'microinverter', label: 'Microinverters', count: 15 },
  ],
  components: [
    { id: 'c1', name: 'REC Alpha Pure-R 430W', articleNr: 'REC-430-APR', brand: 'REC', type: 'module', typeLabel: 'Module', price: 285, purchasePrice: 198 },
    { id: 'c2', name: 'Q CELLS Q.PEAK DUO BLK ML-G11S+ 400W', articleNr: 'QC-400-G11S', brand: 'Q CELLS', type: 'module', typeLabel: 'Module', price: 245, purchasePrice: 172 },
    { id: 'c3', name: 'Canadian Solar HiKu7 CS7L-590MS', articleNr: 'CS-590-HK7', brand: 'Canadian Solar', type: 'module', typeLabel: 'Module', price: 312, purchasePrice: 224 },
    { id: 'c4', name: 'SolarEdge SE11400H-US SetApp', articleNr: 'SE-11400H', brand: 'SolarEdge', type: 'inverter', typeLabel: 'Inverter', price: 2850, purchasePrice: 1980 },
    { id: 'c5', name: 'Enphase IQ8+ Microinverter', articleNr: 'IQ8PLUS-72', brand: 'Enphase', type: 'microinverter', typeLabel: 'Microinverter', price: 215, purchasePrice: 156 },
    { id: 'c6', name: 'Tesla Powerwall 2 (13.5 kWh)', articleNr: 'PW2-AC', brand: 'Tesla', type: 'batteryStorage', typeLabel: 'Battery Storage', price: 11500, purchasePrice: 8200 },
    { id: 'c7', name: 'Enphase IQ Battery 10T', articleNr: 'B10T-1P', brand: 'Enphase', type: 'batteryStorage', typeLabel: 'Battery Storage', price: 8900, purchasePrice: 6400 },
    { id: 'c8', name: 'SMA Sunny Boy 7.7-US', articleNr: 'SB77-US-41', brand: 'SMA', type: 'inverter', typeLabel: 'Inverter', price: 2100, purchasePrice: 1540 },
    { id: 'c9', name: 'LG RESU 16H Prime', articleNr: 'RESU16H-P', brand: 'LG Energy', type: 'batteryStorage', typeLabel: 'Battery Storage', price: 9800, purchasePrice: 7100 },
    { id: 'c10', name: 'SolarEdge P505 Power Optimizer', articleNr: 'P505-5NC4ARS', brand: 'SolarEdge', type: 'inverter', typeLabel: 'Optimizer', price: 82, purchasePrice: 58 },
    { id: 'c11', name: 'Tesla Wall Connector Gen 3', articleNr: 'TWC-G3', brand: 'Tesla', type: 'wallbox', typeLabel: 'EV Charger', price: 475, purchasePrice: 340 },
    { id: 'c12', name: 'ChargePoint Home Flex', articleNr: 'CPH50-L23', brand: 'ChargePoint', type: 'wallbox', typeLabel: 'EV Charger', price: 699, purchasePrice: 520 },
    { id: 'c13', name: 'Jinko Tiger Neo 440W', articleNr: 'JKM440N', brand: 'Jinko Solar', type: 'module', typeLabel: 'Module', price: 262, purchasePrice: 184 },
    { id: 'c14', name: 'Enphase IQ8M Microinverter', articleNr: 'IQ8M-72', brand: 'Enphase', type: 'microinverter', typeLabel: 'Microinverter', price: 198, purchasePrice: 142 },
    { id: 'c15', name: 'Franklin WH 13.6 kWh', articleNr: 'FHP-13', brand: 'Franklin', type: 'batteryStorage', typeLabel: 'Battery Storage', price: 10200, purchasePrice: 7400 },
  ],
};

// Calendar: next 5 days of events
function futureDate(daysAhead: number, hour: number, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const DEMO_CALENDAR = {
  configured: true,
  error: undefined as string | undefined,
  calendarCount: 3,
  events: [
    { id: 'e1', title: 'Site Survey — Henderson (882 Maple Dr)', start: futureDate(0, 10, 0), end: futureDate(0, 11, 30), allDay: false, location: '882 Maple Dr, Denver CO', attendees: 2, owner: 'jake@sunpeaksolar.com' },
    { id: 'e2', title: 'Weekly Pipeline Review', start: futureDate(0, 14, 0), end: futureDate(0, 14, 45), allDay: false, location: 'Zoom', attendees: 5, owner: 'sarah@sunpeaksolar.com' },
    { id: 'e3', title: 'Utility Call — Oncor Permits Dept', start: futureDate(1, 9, 0), end: futureDate(1, 9, 30), allDay: false, location: undefined, attendees: 1, owner: 'priya@sunpeaksolar.com' },
    { id: 'e4', title: 'Installation — Rodriguez Family', start: futureDate(1, 8, 0), end: futureDate(1, 16, 0), allDay: false, location: '4521 Oak Lane, Austin TX', attendees: 3, owner: 'tyler@sunpeaksolar.com' },
    { id: 'e5', title: 'AHJ Inspection — Park Residence', start: futureDate(2, 10, 0), end: futureDate(2, 12, 0), allDay: false, location: '2200 Pine Rd, Charlotte NC', attendees: 2, owner: 'jake@sunpeaksolar.com' },
    { id: 'e6', title: 'Customer Consultation — Mitchell', start: futureDate(2, 15, 0), end: futureDate(2, 16, 0), allDay: false, location: 'Google Meet', attendees: 2, owner: 'maria@sunpeaksolar.com' },
    { id: 'e7', title: 'SolarEdge Training Webinar', start: futureDate(3, 11, 0), end: futureDate(3, 12, 30), allDay: false, location: 'Zoom', attendees: 4, owner: 'sarah@sunpeaksolar.com' },
    { id: 'e8', title: 'Q2 Sales Close Deadline', start: futureDate(4, 0, 0), end: undefined, allDay: true, location: undefined, attendees: 0, owner: undefined },
  ],
};

export const DEMO_DRIVE = {
  configured: true,
  error: undefined as string | undefined,
  scopeMissing: false,
  folders: [
    { id: 'f1', name: 'Proposals & Contracts' },
    { id: 'f2', name: 'Permit Documents' },
    { id: 'f3', name: 'Installation Photos' },
    { id: 'f4', name: 'Product Datasheets' },
    { id: 'f5', name: 'Training Materials' },
    { id: 'f6', name: 'Finance & Invoices' },
  ],
  files: [
    { id: 'd1', name: 'Rodriguez_Proposal_v2.pdf', type: 'PDF', modified: '2026-06-14T10:30:00Z', link: '#' },
    { id: 'd2', name: 'Henderson_SitePhotos.zip', type: 'Archive', modified: '2026-06-13T16:20:00Z', link: '#' },
    { id: 'd3', name: 'NEC_690_Compliance_Checklist.xlsx', type: 'Spreadsheet', modified: '2026-06-12T09:15:00Z', link: '#' },
    { id: 'd4', name: 'SolarEdge_SE11400H_Datasheet.pdf', type: 'PDF', modified: '2026-06-10T14:45:00Z', link: '#' },
    { id: 'd5', name: 'Q2_Revenue_Forecast.xlsx', type: 'Spreadsheet', modified: '2026-06-09T11:30:00Z', link: '#' },
    { id: 'd6', name: 'Tesla_Powerwall_Install_Guide.pdf', type: 'PDF', modified: '2026-06-08T08:00:00Z', link: '#' },
    { id: 'd7', name: 'Team_Onboarding_Deck.pptx', type: 'Presentation', modified: '2026-06-05T13:20:00Z', link: '#' },
  ],
};

export const DEMO_NETZ_EMAIL_STATS = { total: 46, new_count: 8, matched: 12 };
