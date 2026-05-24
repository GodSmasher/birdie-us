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
    name: 'Mahnbot',
    cat: 'FIN',
    desc: 'Sendet automatische Zahlungserinnerungen anhand Bexio-Status',
    state: 'success',
    pill: 'LIVE',
    runs: '247',
    conns: 'Bexio · Gmail',
    version: 'v2.3',
    schedule: 'Alle 6 Stunden',
    trigger: 'Cron · 0 */6 * * *',
    successRate: '99.6%',
    avgDuration: '4.2s',
    lastRun: 'vor 18 Min',
    activity24h: [3, 0, 0, 0, 0, 0, 12, 18, 22, 14, 16, 19, 21, 18, 24, 26, 22, 19, 12, 8, 5, 4, 3, 2],
    envVars: [
      { key: 'BEXIO_API_KEY', value: '•••••••• (vault)' },
      { key: 'MAHN_GEBUEHR_1', value: '€ 15' },
      { key: 'MAHN_GEBUEHR_2', value: '€ 30' },
      { key: 'EMAIL_FROM', value: 'rechnung@alpen-energie.ch' },
    ],
    recentRuns: baseRuns('mahnbot', [
      { time: '10:42', duration: '4.1s', state: 'success', output: '3 Erinnerungen versendet · 0 Fehler' },
      { time: '04:42', duration: '3.8s', state: 'success', output: '7 Erinnerungen versendet · 0 Fehler' },
      { time: '22:42', duration: '4.4s', state: 'success', output: '2 Erinnerungen versendet · 0 Fehler' },
      { time: '16:42', duration: '12.2s', state: 'warning', output: 'Bexio Rate-Limit · Retry erfolgreich' },
      { time: '10:42', duration: '4.0s', state: 'success', output: '4 Erinnerungen versendet · 0 Fehler' },
      { time: '04:42', duration: '3.9s', state: 'success', output: '0 Erinnerungen · keine offenen Posten' },
      { time: '22:42', duration: '4.1s', state: 'success', output: '5 Erinnerungen versendet · 0 Fehler' },
      { time: '16:42', duration: '4.3s', state: 'success', output: '6 Erinnerungen versendet · 0 Fehler' },
    ]),
    logs: [
      { ts: '10:42:18.231', level: 'INFO', msg: 'Trigger fired · run_id=mb_3kfx2a' },
      { ts: '10:42:18.241', level: 'INFO', msg: 'Bexio API · GET /invoices?status=open' },
      { ts: '10:42:18.892', level: 'INFO', msg: '→ 18 open invoices fetched' },
      { ts: '10:42:18.901', level: 'INFO', msg: 'Filtering by age > 7 days' },
      { ts: '10:42:18.905', level: 'WARN', msg: 'Invoice #2026-0298 has no email — skipping' },
      { ts: '10:42:18.912', level: 'INFO', msg: '→ 10 invoices eligible' },
      { ts: '10:42:18.945', level: 'INFO', msg: 'Classifying: 6×S1 · 3×S2 · 1×S3' },
      { ts: '10:42:19.012', level: 'INFO', msg: 'Rendering templates with brand=alpen-energie' },
      { ts: '10:42:19.245', level: 'INFO', msg: 'Gmail · sending 10 emails' },
      { ts: '10:42:21.402', level: 'INFO', msg: 'Bexio PATCH /invoices/* (10 records)' },
      { ts: '10:42:22.451', level: 'SUCCESS', msg: 'Run complete · 10 invoices processed · 0 errors' },
    ],
  },
  {
    slug: 'lead-sync',
    name: 'Lead-Sync',
    cat: 'VTR',
    desc: 'Importiert Leads aus Reonic + reichert mit Telefon/Mail an',
    state: 'success',
    pill: 'LIVE',
    runs: '1.382',
    conns: 'Reonic · Gmail',
    version: 'v1.8',
    schedule: 'Alle 15 Minuten',
    trigger: 'Cron · */15 * * * *',
    successRate: '99.9%',
    avgDuration: '2.1s',
    lastRun: 'vor 4 Min',
    activity24h: [42, 38, 41, 45, 52, 48, 61, 78, 92, 88, 79, 84, 91, 87, 82, 76, 72, 68, 54, 48, 44, 42, 39, 41],
    envVars: [
      { key: 'REONIC_API_KEY', value: '•••••••• (vault)' },
      { key: 'DEDUPE_BY', value: 'email,phone' },
      { key: 'NOTIFY_ON_MISSING_PHONE', value: 'true' },
    ],
    recentRuns: baseRuns('lead-sync', [
      { time: '10:38', duration: '2.0s', state: 'success', output: '12 neue Leads importiert' },
      { time: '10:23', duration: '1.9s', state: 'success', output: '8 neue Leads importiert' },
      { time: '10:08', duration: '2.3s', state: 'success', output: '15 neue Leads importiert' },
      { time: '09:53', duration: '2.1s', state: 'success', output: '6 neue Leads importiert' },
      { time: '09:38', duration: '2.0s', state: 'success', output: '11 neue Leads importiert' },
      { time: '09:23', duration: '1.8s', state: 'success', output: '4 neue Leads importiert' },
      { time: '09:08', duration: '2.4s', state: 'warning', output: '9 importiert · 2 ohne Telefon' },
      { time: '08:53', duration: '2.1s', state: 'success', output: '13 neue Leads importiert' },
    ]),
    logs: [
      { ts: '10:38:02.112', level: 'INFO', msg: 'Trigger fired · run_id=ls_8c2j4f' },
      { ts: '10:38:02.118', level: 'INFO', msg: 'Reonic · GET /leads?since=2026-05-20T10:23' },
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
    name: 'Termin-Bot',
    cat: 'VTR',
    desc: 'Erstellt Termine bei Anfrage + verschickt Google Meet Einladung',
    state: 'success',
    pill: 'LIVE',
    runs: '89',
    conns: 'Calendar · WhatsApp',
    version: 'v2.0',
    schedule: 'Webhook',
    trigger: 'Eingehende Anfrage',
    successRate: '98.9%',
    avgDuration: '3.4s',
    lastRun: 'vor 1 Std',
    activity24h: [2, 0, 0, 0, 0, 0, 1, 3, 6, 8, 9, 12, 11, 9, 8, 7, 6, 5, 4, 2, 1, 1, 0, 1],
    envVars: [
      { key: 'CAL_OWNER', value: 'sarah@alpen-energie.ch' },
      { key: 'MEETING_DURATION', value: '60' },
      { key: 'BUFFER_BEFORE', value: '15' },
    ],
    recentRuns: baseRuns('termin-bot', [
      { time: '10:31', duration: '3.2s', state: 'success', output: 'Termin Michael K. · 22.05. 14:00' },
      { time: '09:47', duration: '3.5s', state: 'success', output: 'Termin Familie Frey · 23.05. 09:00' },
      { time: '08:22', duration: '3.4s', state: 'success', output: 'Termin Bau Locher · 21.05. 10:30' },
      { time: '07:58', duration: '4.2s', state: 'warning', output: 'Konflikt erkannt · Alt-Slot vorgeschlagen' },
    ]),
    logs: [
      { ts: '10:31:18.231', level: 'INFO', msg: 'Webhook · WhatsApp inbound · Michael K.' },
      { ts: '10:31:18.412', level: 'INFO', msg: 'AI parsing intent · TERMIN_ANFRAGE' },
      { ts: '10:31:18.892', level: 'INFO', msg: 'Calendar · checking availability' },
      { ts: '10:31:19.012', level: 'INFO', msg: '→ Slot 22.05. 14:00 frei' },
      { ts: '10:31:20.245', level: 'INFO', msg: 'Google Meet erstellt · meet.google.com/abc-defg-hij' },
      { ts: '10:31:21.451', level: 'SUCCESS', msg: 'Termin gebucht · Einladung versendet' },
    ],
  },
  {
    slug: 'call-bot',
    name: 'Call-Bot',
    cat: 'VTR',
    desc: 'Wertet 3CX-Anrufe aus, schlägt Rückrufe vor',
    state: 'success',
    pill: 'LIVE',
    runs: '412',
    conns: '3CX · Reonic',
    version: 'v1.4',
    schedule: 'Alle 30 Minuten',
    trigger: 'Cron · */30 * * * *',
    successRate: '97.2%',
    avgDuration: '8.7s',
    lastRun: 'vor 12 Min',
    activity24h: [8, 4, 2, 1, 0, 0, 6, 14, 22, 28, 32, 31, 28, 26, 24, 22, 18, 14, 10, 8, 6, 5, 4, 3],
    envVars: [
      { key: '3CX_HOST', value: 'pbx.alpen-energie.ch' },
      { key: 'TRANSCRIPTION_LANG', value: 'de-CH' },
      { key: 'AI_MODEL', value: 'claude-sonnet-4-6' },
    ],
    recentRuns: baseRuns('call-bot', [
      { time: '09:58', duration: '8.4s', state: 'success', output: '8 Calls analysiert · 3 Rückrufe vorgeschlagen' },
      { time: '09:28', duration: '9.1s', state: 'success', output: '12 Calls analysiert · 5 Rückrufe vorgeschlagen' },
      { time: '08:58', duration: '7.8s', state: 'success', output: '6 Calls analysiert · 2 Rückrufe vorgeschlagen' },
    ]),
    logs: [
      { ts: '09:58:02.112', level: 'INFO', msg: 'Fetching 3CX call recordings · last 30 min' },
      { ts: '09:58:02.512', level: 'INFO', msg: '→ 8 calls' },
      { ts: '09:58:02.612', level: 'INFO', msg: 'Anonymising transcripts (PII stripped)' },
      { ts: '09:58:08.412', level: 'INFO', msg: 'Claude scoring · quality 1-10' },
      { ts: '09:58:10.012', level: 'SUCCESS', msg: 'Run complete · 3 followups vorgeschlagen' },
    ],
  },
  {
    slug: 'rechnungs-bot',
    name: 'Rechnungs-Bot',
    cat: 'FIN',
    desc: "Erstellt Bexio-Rechnung sobald Projekt-Status 'fertig'",
    state: 'success',
    pill: 'LIVE',
    runs: '63',
    conns: 'Bexio · Reonic',
    version: 'v3.1',
    schedule: 'Webhook',
    trigger: 'Reonic project_status=done',
    successRate: '100%',
    avgDuration: '5.8s',
    lastRun: 'vor 24 Min',
    activity24h: [1, 0, 0, 0, 0, 0, 2, 4, 6, 5, 8, 9, 7, 6, 5, 4, 3, 3, 2, 1, 1, 1, 0, 1],
    envVars: [
      { key: 'BEXIO_API_KEY', value: '•••••••• (vault)' },
      { key: 'DEFAULT_PAYMENT_TERMS', value: '14 Tage' },
      { key: 'AUTO_SEND', value: 'true' },
    ],
    recentRuns: baseRuns('rechnungs-bot', [
      { time: '10:24', duration: '5.6s', state: 'success', output: 'Rechnung #2026-0341 · Familie Huber · € 24.500' },
      { time: '08:14', duration: '5.9s', state: 'success', output: 'Rechnung #2026-0340 · M. Egger · € 4.200' },
    ]),
    logs: [
      { ts: '10:24:02.112', level: 'INFO', msg: 'Webhook · Reonic · project_status=done' },
      { ts: '10:24:02.412', level: 'INFO', msg: 'Loading project data · ID=8472' },
      { ts: '10:24:03.012', level: 'INFO', msg: 'Bexio · POST /invoices' },
      { ts: '10:24:07.412', level: 'SUCCESS', msg: 'Rechnung erstellt · #2026-0341' },
    ],
  },
  {
    slug: 'whatsapp-concierge',
    name: 'WhatsApp-Concierge',
    cat: 'KOM',
    desc: 'Antwortet auf Standardfragen, eskaliert komplexe Themen',
    state: 'success',
    pill: 'LIVE',
    runs: '1.847',
    conns: 'WhatsApp · Reonic',
    version: 'v1.2',
    schedule: 'Echtzeit',
    trigger: 'WhatsApp Webhook',
    successRate: '94.8%',
    avgDuration: '1.8s',
    lastRun: 'vor 1 Min',
    activity24h: [12, 8, 4, 2, 1, 0, 18, 42, 78, 92, 108, 124, 132, 128, 118, 102, 88, 72, 54, 42, 32, 24, 18, 14],
    envVars: [
      { key: 'WA_BUSINESS_ID', value: '••••••••' },
      { key: 'AI_MODEL', value: 'claude-sonnet-4-6' },
      { key: 'ESCALATION_KEYWORDS', value: 'reklamation,beschwerde,...' },
    ],
    recentRuns: baseRuns('whatsapp-concierge', [
      { time: '10:12', duration: '1.6s', state: 'success', output: 'Antwort an "Wann ist nächster Termin?" · auto' },
      { time: '10:11', duration: '2.1s', state: 'success', output: 'Antwort an "Wieviel kostet WP?" · escalated' },
      { time: '10:09', duration: '1.8s', state: 'success', output: 'Antwort an "Adresse?" · auto' },
    ]),
    logs: [
      { ts: '10:12:02.112', level: 'INFO', msg: 'WhatsApp inbound · +41 79 ••• ••••' },
      { ts: '10:12:02.412', level: 'INFO', msg: 'Intent classification · TERMIN_FRAGE' },
      { ts: '10:12:03.012', level: 'INFO', msg: 'Reonic lookup · customer found' },
      { ts: '10:12:03.812', level: 'SUCCESS', msg: 'Auto-Antwort versendet' },
    ],
  },
  {
    slug: 'tagesreport',
    name: 'Tagesreport',
    cat: 'ALL',
    desc: 'Generiert jeden Morgen 7:00 das Briefing für Geschäftsführung',
    state: 'success',
    pill: 'LIVE',
    runs: '138',
    conns: 'Claude · Mail',
    version: 'v2.0',
    schedule: 'Täglich 07:00',
    trigger: 'Cron · 0 7 * * *',
    successRate: '100%',
    avgDuration: '32.4s',
    lastRun: 'vor 3 Std',
    activity24h: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    envVars: [
      { key: 'REPORT_RECIPIENTS', value: 'sarah@..., max@...' },
      { key: 'AI_MODEL', value: 'claude-sonnet-4-6' },
      { key: 'INCLUDE_PDF', value: 'true' },
    ],
    recentRuns: baseRuns('tagesreport', [
      { time: '07:00', duration: '31.8s', state: 'success', output: 'Report versendet · 2 Empfänger · PDF attached' },
    ]),
    logs: [
      { ts: '07:00:02.112', level: 'INFO', msg: 'Aggregating KPIs from kpi_snapshots' },
      { ts: '07:00:08.412', level: 'INFO', msg: 'Claude · generating narrative' },
      { ts: '07:00:28.412', level: 'INFO', msg: 'Rendering React-Email · daily-report' },
      { ts: '07:00:31.812', level: 'SUCCESS', msg: 'Versendet · 2 Empfänger' },
    ],
  },
  {
    slug: 'datev-export',
    name: 'DATEV-Export',
    cat: 'FIN',
    desc: 'Exportiert monatlich Buchungen als DATEV-CSV',
    state: 'neutral',
    pill: 'PAUSE',
    runs: '12',
    conns: 'Bexio · Drive',
    version: 'v1.0',
    schedule: 'Monatlich · 1. um 08:00',
    trigger: 'Cron · 0 8 1 * *',
    successRate: '100%',
    avgDuration: '46.2s',
    lastRun: '01.05.2026',
    activity24h: Array(24).fill(0),
    envVars: [
      { key: 'DATEV_BERATER_NR', value: '12345' },
      { key: 'DATEV_MANDANT_NR', value: '67890' },
      { key: 'DRIVE_FOLDER_ID', value: '1XYZ...' },
    ],
    recentRuns: baseRuns('datev-export', [
      { time: '01.05.', duration: '44.2s', state: 'success', output: 'CSV mit 247 Buchungen · Drive hochgeladen' },
      { time: '01.04.', duration: '48.1s', state: 'success', output: 'CSV mit 218 Buchungen · Drive hochgeladen' },
    ]),
    logs: [
      { ts: '08:00:02', level: 'INFO', msg: 'Bot pausiert seit 02.05. · Setup pending' },
    ],
  },
  {
    slug: 'mahnstufe-3',
    name: 'Mahnstufe-3',
    cat: 'FIN',
    desc: 'Inkasso-Übergabe nach 60 Tagen, manueller Trigger',
    state: 'warning',
    pill: 'HINWEIS',
    runs: '—',
    conns: 'Bexio · Mail',
    version: 'v0.9',
    schedule: 'Manuell',
    trigger: 'Operator-Klick',
    successRate: '—',
    avgDuration: '—',
    lastRun: 'noch nie',
    activity24h: Array(24).fill(0),
    envVars: [
      { key: 'INKASSO_PARTNER', value: 'tba' },
      { key: 'INKASSO_API_KEY', value: '—' },
    ],
    recentRuns: [],
    logs: [
      { ts: '—', level: 'WARN', msg: 'Bot wartet auf Konfiguration · Inkasso-Partner muss noch eingerichtet werden' },
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
    group: 'Wechselrichter & Speicher',
    desc: 'Live-Daten der verbauten Anlagen · Modbus TCP & Hersteller-Cloud',
    items: [
      { name: 'Fronius', letter: 'F', protocol: 'Modbus TCP', detail: 'Symo GEN24 · 3 Anlagen', access: 'lesen · steuern', sync: 'vor 30 Sek', state: 'online' },
      { name: 'SMA', letter: 'SM', protocol: 'Modbus TCP', detail: 'Sunny Tripower · 5 Anlagen', access: 'lesen · steuern', sync: 'vor 45 Sek', state: 'online' },
      { name: 'Kostal', letter: 'K', protocol: 'Modbus TCP', detail: 'Plenticore plus · 2 Anlagen', access: 'lesen · steuern', sync: 'vor 1 Min', state: 'online' },
      { name: 'Sungrow', letter: 'SG', protocol: 'Modbus TCP', detail: 'SH10RT · 4 Anlagen', access: 'lesen · steuern', sync: 'vor 30 Sek', state: 'online' },
      { name: 'EcoFlow', letter: 'E', protocol: 'Cloud API', detail: 'PowerOcean · 6 Anlagen', access: 'lesen · steuern', sync: 'vor 1 Min', state: 'online' },
      { name: 'Anker SOLIX', letter: 'A', protocol: 'Cloud API', detail: 'X1 Hybrid · 2 Anlagen', access: 'lesen', sync: 'vor 8 Min', state: 'warn' },
      { name: 'Victron Energy', letter: 'V', protocol: 'VRM API', detail: 'MultiPlus-II · 1 Anlage', access: 'lesen · steuern', sync: 'vor 2 Min', state: 'online' },
      { name: 'Bluetti', letter: 'B', protocol: 'Cloud API', detail: 'EP900 · Setup läuft', access: '—', sync: '—', state: 'paused' },
    ],
  },
  {
    group: 'Dynamische Stromtarife',
    desc: 'Stündliche Börsenpreise für Batterie- & Lastoptimierung',
    items: [
      { name: 'Tibber', letter: 'T', protocol: 'GraphQL API', detail: 'Echtzeitpreise · 12 Haushalte', access: 'lesen', sync: 'vor 5 Min', state: 'online' },
      { name: 'aWATTar', letter: 'aW', protocol: 'REST API', detail: 'HOURLY-Tarif · 8 Haushalte', access: 'lesen', sync: 'vor 12 Min', state: 'online' },
    ],
  },
  {
    group: 'Wetter & Solarprognose',
    desc: 'Ertragsprognose und Wetterdaten pro Standort',
    items: [
      { name: 'Solcast', letter: 'Sc', protocol: 'REST API', detail: 'PV-Ertragsprognose · stündlich', access: 'lesen', sync: 'vor 14 Min', state: 'online' },
      { name: 'OpenWeatherMap', letter: 'O', protocol: 'REST API', detail: 'Wetterdaten · 15 verbaute Standorte', access: 'lesen', sync: 'vor 6 Min', state: 'online' },
    ],
  },
  {
    group: 'CRM, Buchhaltung & Kommunikation',
    desc: 'Backoffice-Tools des Installateurs',
    items: [
      { name: 'Reonic CRM', letter: 'R', protocol: 'REST API', detail: 'Leads · Offerten · Projekte', access: 'lesen · schreiben', sync: 'vor 4 Min', state: 'online' },
      { name: 'Bexio', letter: 'Bx', protocol: 'REST API', detail: 'Rechnungen · Buchhaltung', access: 'lesen · schreiben', sync: 'vor 12 Min', state: 'online' },
      { name: 'Sevdesk', letter: 'Sv', protocol: 'REST API', detail: 'Buchhaltung', access: 'lesen · schreiben', sync: 'vor 18 Min', state: 'online' },
      { name: 'Gmail (Sarah)', letter: 'G', protocol: 'OAuth', detail: 'Kommunikation', access: 'lesen · schreiben (Freigabe)', sync: 'vor 2 Min', state: 'online' },
      { name: 'Google Calendar', letter: 'C', protocol: 'OAuth', detail: 'Termine & Beratungen', access: 'lesen · schreiben', sync: 'vor 8 Min', state: 'online' },
      { name: 'WhatsApp Business', letter: 'W', protocol: 'Webhook', detail: 'Kundensupport', access: 'lesen · schreiben', sync: 'vor 1 Min', state: 'online' },
      { name: 'DATEV', letter: 'D', protocol: 'DATEV Connect', detail: 'Lohnbüro · Export', access: 'lesen · schreiben', sync: '—', state: 'paused' },
    ],
  },
];

// ============ PV INSTALLATIONS (Anlagen) ============
export type InstallState = 'online' | 'warn' | 'offline';

export type Device = { name: string; brand: string; type: string; state: 'online' | 'warn' | 'offline'; detail: string };

export type Installation = {
  slug: string;
  customer: string;
  address: string;
  type: 'Privat' | 'Gewerbe';
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
  flow: { solar: number; house: number; battery: number; grid: number }; // kW, battery + = laden, grid + = einspeisen
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
    customer: 'Solar Berg AG',
    address: 'Industriestr. 12, Chur',
    type: 'Gewerbe',
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
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '13:00–15:00', recommendation: 'Überschuss → Batterie laden, Einspeisung lohnt erst ab 16h' },
    devices: [
      { name: 'WR 1 — SMA STP CORE2', brand: 'SMA', type: 'Wechselrichter', state: 'online', detail: '21.4 kW · 712 V DC' },
      { name: 'WR 2 — SMA STP CORE2', brand: 'SMA', type: 'Wechselrichter', state: 'online', detail: '20.8 kW · 698 V DC' },
      { name: 'WR 3 — SMA STP CORE2', brand: 'SMA', type: 'Wechselrichter', state: 'online', detail: '20.2 kW · 705 V DC' },
      { name: 'Speicher — EcoFlow PowerOcean', brand: 'EcoFlow', type: 'Batterie', state: 'online', detail: '30 kWh · 78% · lädt 12 kW' },
      { name: 'Smart Meter — SMA Energy Meter', brand: 'SMA', type: 'Zähler', state: 'online', detail: 'Netzbezug 0 W' },
    ],
    events: [
      { time: '12:14', msg: 'Batterie-Ladung gestartet (Überschuss + günstiger Tarif)', kind: 'success' },
      { time: '09:02', msg: 'Tagesproduktion über Prognose (+4%)', kind: 'info' },
      { time: '07:41', msg: 'WR 2 Reconnect nach Nacht-Standby', kind: 'info' },
    ],
  },
  {
    slug: 'huber',
    customer: 'Familie Huber',
    address: 'Bergweg 4, Davos',
    type: 'Privat',
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
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '13:00–15:00', recommendation: 'Batterie fast voll — WP & Auto später laden wenn Preis < 15 ct' },
    devices: [
      { name: 'Wechselrichter — Fronius Symo GEN24', brand: 'Fronius', type: 'Wechselrichter', state: 'online', detail: '8.4 kW · 612 V DC' },
      { name: 'Speicher — BYD HVS 10.2', brand: 'BYD', type: 'Batterie', state: 'online', detail: '10.2 kWh · 62% · lädt 5.1 kW' },
      { name: 'Smart Meter — Fronius Smart Meter', brand: 'Fronius', type: 'Zähler', state: 'online', detail: 'Einspeisung 1.2 kW' },
      { name: 'Wallbox — Fronius Wattpilot', brand: 'Fronius', type: 'Wallbox', state: 'online', detail: 'bereit · PV-Überschuss-Modus' },
    ],
    events: [
      { time: '11:48', msg: 'PV-Überschuss → Wallbox in Bereitschaft', kind: 'info' },
      { time: '08:12', msg: 'Batterie-Morgenladung abgeschlossen', kind: 'success' },
    ],
  },
  {
    slug: 'schmid',
    customer: 'Schmid Energie',
    address: 'Dorfstr. 88, Thusis',
    type: 'Gewerbe',
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
    tariff: { provider: 'aWATTar', nowPrice: 16.9, trend: 'down', cheapWindow: '12:00–14:00', recommendation: 'Batterie fast voll → Einspeisung priorisieren' },
    devices: [
      { name: 'WR 1 — Sungrow SH10RT', brand: 'Sungrow', type: 'Wechselrichter', state: 'online', detail: '9.2 kW' },
      { name: 'WR 2 — Sungrow SH10RT', brand: 'Sungrow', type: 'Wechselrichter', state: 'online', detail: '8.9 kW' },
      { name: 'Speicher — Anker SOLIX X1', brand: 'Anker SOLIX', type: 'Batterie', state: 'warn', detail: '16 kWh · 91% · Firmware-Update verfügbar' },
    ],
    events: [
      { time: '10:31', msg: 'Anker SOLIX: Firmware 2.4.1 verfügbar', kind: 'warning' },
      { time: '06:58', msg: 'Anlage gestartet · Sonnenaufgang', kind: 'info' },
    ],
  },
  {
    slug: 'frey',
    customer: 'Familie Frey',
    address: 'Sonnenhalde 2, Klosters',
    type: 'Privat',
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
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'up', cheapWindow: '02:00–05:00', recommendation: 'Batterie nur 45% — heute Nacht günstig nachladen' },
    devices: [
      { name: 'Wechselrichter — Kostal Plenticore', brand: 'Kostal', type: 'Wechselrichter', state: 'online', detail: '6.2 kW' },
      { name: 'Speicher — Victron MultiPlus-II', brand: 'Victron', type: 'Batterie', state: 'online', detail: '12 kWh · 45% · lädt 2.4 kW' },
      { name: 'Cerbo GX', brand: 'Victron', type: 'Gateway', state: 'online', detail: 'VRM verbunden' },
    ],
    events: [
      { time: '09:22', msg: 'Wolkendurchzug → Produktion -40% kurzzeitig', kind: 'info' },
    ],
  },
  {
    slug: 'egger',
    customer: 'Egger Bauberatung',
    address: 'Gewerbepark 5, Landquart',
    type: 'Gewerbe',
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
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '13:00–15:00', recommendation: 'Last-Verschiebung: Klimaanlage jetzt laufen lassen' },
    devices: [
      { name: 'WR 1 — SMA Sunny Tripower', brand: 'SMA', type: 'Wechselrichter', state: 'online', detail: '11.2 kW' },
      { name: 'WR 2 — SMA Sunny Tripower', brand: 'SMA', type: 'Wechselrichter', state: 'online', detail: '10.2 kW' },
      { name: 'Speicher — EcoFlow PowerOcean', brand: 'EcoFlow', type: 'Batterie', state: 'online', detail: '20 kWh · 83%' },
    ],
    events: [{ time: '08:45', msg: 'Eigenverbrauchsquote über Ziel (79% vs 75%)', kind: 'success' }],
  },
  {
    slug: 'luethi',
    customer: 'K. Lüthi',
    address: 'Talstr. 19, Scuol',
    type: 'Privat',
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
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'up', cheapWindow: '02:00–05:00', recommendation: 'Anlage offline — Bezug aus Batterie, lädt sich nicht nach' },
    devices: [
      { name: 'Wechselrichter — Fronius Symo GEN24', brand: 'Fronius', type: 'Wechselrichter', state: 'offline', detail: 'keine Verbindung seit 11:02' },
      { name: 'Speicher — BYD HVS 7.7', brand: 'BYD', type: 'Batterie', state: 'online', detail: '7.7 kWh · 22% · entlädt' },
    ],
    events: [
      { time: '11:02', msg: 'Wechselrichter offline — Verbindung verloren', kind: 'error' },
      { time: '11:03', msg: 'Service-Ticket automatisch erstellt · #SV-2291', kind: 'warning' },
    ],
  },
  {
    slug: 'locher',
    customer: 'Bau Locher GmbH',
    address: 'Werkhof 3, Igis',
    type: 'Gewerbe',
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
    tariff: { provider: 'aWATTar', nowPrice: 16.9, trend: 'down', cheapWindow: '12:00–14:00', recommendation: 'Maschinenpark jetzt auf PV-Strom fahren' },
    devices: [
      { name: 'WR-Cluster — Sungrow SH10RT ×4', brand: 'Sungrow', type: 'Wechselrichter', state: 'online', detail: '31.2 kW gesamt' },
      { name: 'Speicher — Anker SOLIX X1 ×2', brand: 'Anker SOLIX', type: 'Batterie', state: 'online', detail: '32 kWh · 67%' },
    ],
    events: [{ time: '07:30', msg: 'Anlage gestartet · Produktion über Plan', kind: 'success' }],
  },
  {
    slug: 'meier',
    customer: 'Holzbau Meier',
    address: 'Sägereistr. 7, Maienfeld',
    type: 'Gewerbe',
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
    tariff: { provider: 'Tibber', nowPrice: 18.4, trend: 'down', cheapWindow: '13:00–15:00', recommendation: 'Absauganlage auf PV-Überschuss takten' },
    devices: [
      { name: 'Wechselrichter — Kostal Plenticore', brand: 'Kostal', type: 'Wechselrichter', state: 'online', detail: '11.8 kW' },
      { name: 'Speicher — Bluetti EP900', brand: 'Bluetti', type: 'Batterie', state: 'online', detail: '19.8 kWh · 55%' },
    ],
    events: [{ time: '08:10', msg: 'Anlage gestartet', kind: 'info' }],
  },
];

export function getInstallation(slug: string): Installation | undefined {
  return installations.find((i) => i.slug === slug);
}

export const searchIndex: SearchItem[] = [
  { id: 'p-dash', label: 'Dashboard', category: 'Seite', icon: '◇', href: '/dashboard' },
  { id: 'p-bots', label: 'Bots', category: 'Seite', icon: '◈', href: '/bots' },
  { id: 'p-conn', label: 'Connectoren', category: 'Seite', icon: '⌘', href: '/connectors' },
  { id: 'p-fin', label: 'Finanzen', category: 'Seite', icon: '₣', href: '/finance' },
  ...bots.map((b) => ({ id: 'b-' + b.slug, label: b.name, category: 'Bot · ' + b.cat, icon: '◈', href: '/bots/' + b.slug })),
  ...installations.map((i) => ({ id: 'a-' + i.slug, label: i.customer + ' · ' + i.kwp + ' kWp', category: 'Anlage · ' + i.inverterBrand, icon: '☀', href: '/anlagen/' + i.slug })),
  { id: 'k-huber', label: 'Familie Huber', category: 'Kunde', icon: '◉', href: '/finance' },
  { id: 'k-schmid', label: 'Schmid AG', category: 'Kunde', icon: '◉', href: '/finance' },
  { id: 'k-locher', label: 'Bau Locher GmbH', category: 'Kunde', icon: '◉', href: '/finance' },
  { id: 'k-frey', label: 'Familie Frey', category: 'Kunde', icon: '◉', href: '/finance' },
  { id: 'k-berg', label: 'Solar Berg AG', category: 'Kunde', icon: '◉', href: '/finance' },
  { id: 'r-0341', label: 'Rechnung #2026-0341 · € 24.500', category: 'Rechnung', icon: '₣', href: '/finance' },
  { id: 'r-0298', label: 'Rechnung #2026-0298 · Mahnung 2', category: 'Rechnung', icon: '₣', href: '/finance' },
  { id: 'r-0287', label: 'Rechnung #2026-0287 · Mahnung 1', category: 'Rechnung', icon: '₣', href: '/finance' },
  { id: 'a-mahn', label: 'Mahnlauf jetzt starten', category: 'Aktion', icon: '⚡', href: '/finance' },
  { id: 'a-pause', label: 'Alle Bots pausieren', category: 'Aktion', icon: '⏸', href: '/bots' },
  { id: 'a-datev', label: 'DATEV-Export Mai anfordern', category: 'Aktion', icon: '⚡', href: '/finance' },
];
