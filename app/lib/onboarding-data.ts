import type { Feature, OnboardingStep } from '@/components/onboarding';

interface PageOnboarding {
  headline: string;
  subtitle: string;
  features: Feature[];
  steps?: OnboardingStep[];
  integrations?: string[];
}

export const ONBOARDING_DASHBOARD: PageOnboarding = {
  headline: 'Welcome to .birdie',
  subtitle: 'The transparency layer for your solar business. Connect your tools and see everything in one place.',
  features: [
    { icon: '📊', title: 'Sales Pipeline', desc: 'Live deal tracking, win rates, and revenue forecasts from your CRM.', tags: ['Aurora Solar', 'Salesforce'] },
    { icon: '⚡', title: 'Interconnection', desc: 'Track every project from utility application through PTO — no spreadsheets.', tags: ['AHJ', 'Utility Portals'] },
    { icon: '☀️', title: 'Fleet Monitoring', desc: 'Real-time production data from every system you installed.', tags: ['SolarEdge', 'Enphase', 'Tesla'] },
    { icon: '🤖', title: 'Automation Bots', desc: 'Dunning, lead sync, document filing — running in the background 24/7.' },
    { icon: '📬', title: 'Smart Inbox', desc: 'Utility emails auto-matched to projects. Customer replies routed to the right rep.' },
    { icon: '📄', title: 'Document AI', desc: 'Auto-fill interconnection forms, extract data from proposals, archive permits.' },
  ],
  steps: [
    { step: 1, title: 'Connect your CRM (Aurora Solar, Salesforce, or HubSpot)' },
    { step: 2, title: 'Link your email (Google Workspace or Outlook)' },
    { step: 3, title: 'Invite your team and assign roles' },
  ],
  integrations: ['Aurora Solar', 'SolarEdge', 'Enphase', 'Google Workspace', 'QuickBooks'],
};

export const ONBOARDING_SALES: PageOnboarding = {
  headline: 'Your Sales Pipeline',
  subtitle: 'See every deal, every rep, every lead source — live from your CRM. No manual entry.',
  features: [
    { icon: '🎯', title: 'Live Pipeline', desc: 'Every deal synced in real-time. Open, won, lost — with dollar values and close dates.' },
    { icon: '👥', title: 'Team Leaderboard', desc: 'Who is closing deals? Compare reps by revenue, close rate, and pipeline value.' },
    { icon: '📈', title: 'Lead Analytics', desc: 'Which channels bring the best leads? Website, Google Ads, referrals, door-to-door — all tracked.' },
    { icon: '📋', title: 'Proposal Tracking', desc: 'See which proposals were sent, opened, and signed. Follow up at the right time.' },
    { icon: '📊', title: 'Revenue Forecast', desc: 'Monthly and quarterly forecasts based on your pipeline — updated live.' },
    { icon: '🔄', title: 'Two-Way Sync', desc: 'Changes in .birdie reflect in your CRM and vice versa. No double entry.' },
  ],
  steps: [
    { step: 1, title: 'Connect Aurora Solar or your CRM' },
    { step: 2, title: 'Map your pipeline stages' },
    { step: 3, title: 'Invite your sales team' },
  ],
  integrations: ['Aurora Solar', 'Salesforce', 'HubSpot', 'EnergySage'],
};

export const ONBOARDING_INTERCONNECTION: PageOnboarding = {
  headline: 'Interconnection Tracking',
  subtitle: 'Every project from utility application through Permission to Operate — tracked, automated, transparent.',
  features: [
    { icon: '📋', title: 'Application to PTO', desc: 'Track each project through: Application → Utility Review → Approved → Inspection → PTO.' },
    { icon: '🏛️', title: 'AHJ & Utility Database', desc: '500+ utilities and AHJ jurisdictions. Auto-detect by ZIP code, pre-fill applications.' },
    { icon: '🤖', title: 'Portal Automation', desc: 'Bot submits applications to utility portals (Oncor, PG&E, Duke, Xcel) automatically.' },
    { icon: '📄', title: 'Document Generation', desc: 'Auto-fill interconnection forms from project data. NEC 690, single-line diagrams, site plans.' },
    { icon: '📧', title: 'Email Monitoring', desc: 'Utility emails auto-matched to projects. Approval notices, inspection dates — no manual checking.' },
    { icon: '📊', title: 'Status Dashboard', desc: 'See all projects in a Kanban board. Filter by utility, status, installer, or timeline.' },
  ],
  steps: [
    { step: 1, title: 'Won projects import automatically from your CRM' },
    { step: 2, title: 'Submit utility applications (manual or bot)' },
    { step: 3, title: 'Track through approval, inspection, and PTO' },
  ],
  integrations: ['Oncor', 'PG&E', 'Duke Energy', 'Xcel Energy', 'APS', 'SRP'],
};

export const ONBOARDING_FLEET: PageOnboarding = {
  headline: 'Fleet Monitoring',
  subtitle: 'Every system you installed — live production data, alerts, and customer insights in one dashboard.',
  features: [
    { icon: '☀️', title: 'Live Production', desc: 'Real-time kW output, daily kWh, and lifetime production for every system.' },
    { icon: '📉', title: 'Performance Alerts', desc: 'Get notified when a system underperforms. Compare actual vs. expected yield.' },
    { icon: '🔋', title: 'Battery Management', desc: 'State of charge, charge/discharge cycles, grid export — all in one view.' },
    { icon: '🛡️', title: 'Warranty Tracking', desc: 'Track warranty status for panels, inverters, and batteries. Get alerts before expiry.' },
    { icon: '👤', title: 'Customer Portal', desc: 'Give homeowners a branded view of their system performance.', soon: true },
    { icon: '📊', title: 'Fleet Analytics', desc: 'Total installed capacity, average uptime, production trends across your fleet.' },
  ],
  steps: [
    { step: 1, title: 'Connect your inverter monitoring (SolarEdge, Enphase, SMA)' },
    { step: 2, title: 'Systems auto-import and map to customers' },
    { step: 3, title: 'Set up performance alerts and thresholds' },
  ],
  integrations: ['SolarEdge', 'Enphase', 'Tesla', 'SMA', 'Generac'],
};

export const ONBOARDING_INBOX: PageOnboarding = {
  headline: 'Smart Inbox',
  subtitle: 'All your project emails in one place. Utility notices, customer replies, vendor updates — organized automatically.',
  features: [
    { icon: '🏷️', title: 'Auto-Categorization', desc: 'Emails tagged as utility, customer, vendor, or internal. No manual sorting.' },
    { icon: '🔗', title: 'Project Matching', desc: 'Utility emails auto-matched to the right project by address, permit number, or customer name.' },
    { icon: '💬', title: 'Customer Replies', desc: 'See customer responses in context. Reply from .birdie or your regular email.' },
    { icon: '🔔', title: 'Smart Notifications', desc: 'Get notified for utility approvals, inspection schedules, and deadline reminders.' },
    { icon: '📎', title: 'Attachment Archive', desc: 'Permits, approvals, and invoices auto-filed to the right project folder.' },
    { icon: '👁️', title: 'Team Visibility', desc: 'Everyone sees project-relevant emails. No more "did you see that email from the utility?"' },
  ],
  steps: [
    { step: 1, title: 'Connect Google Workspace or Microsoft 365' },
    { step: 2, title: 'Select which mailboxes to sync' },
    { step: 3, title: 'Emails auto-categorize and match to projects' },
  ],
  integrations: ['Gmail', 'Google Workspace', 'Outlook', 'Microsoft 365'],
};

export const ONBOARDING_TEAM: PageOnboarding = {
  headline: 'Team Management',
  subtitle: 'Invite your team, assign roles, and see who is working on what.',
  features: [
    { icon: '👤', title: 'User Management', desc: 'Invite team members by email. Set roles: Owner, Admin, or Member.' },
    { icon: '👥', title: 'Team Groups', desc: 'Organize into teams — Sales West, Installation Crew, Back Office. Assign projects by team.' },
    { icon: '🔒', title: 'Access Control', desc: 'Control who sees what. Sales sees pipeline, installers see fleet, admins see everything.' },
    { icon: '📊', title: 'Activity Overview', desc: 'See who logged in, which projects they touched, and recent actions.' },
  ],
  steps: [
    { step: 1, title: 'Invite your first team member' },
    { step: 2, title: 'Assign roles and permissions' },
    { step: 3, title: 'Create teams and assign members' },
  ],
};

export const ONBOARDING_CATALOG: PageOnboarding = {
  headline: 'Product Catalog',
  subtitle: 'Your modules, inverters, batteries, and accessories — with pricing, specs, and availability.',
  features: [
    { icon: '📦', title: 'Component Database', desc: 'Modules, inverters, batteries, EV chargers, optimizers — all in one searchable catalog.' },
    { icon: '💲', title: 'Pricing Tiers', desc: 'Set retail and wholesale prices. Calculate margins per component or per project.' },
    { icon: '📋', title: 'Spec Sheets', desc: 'Attach datasheets and certifications. Always have the right specs at hand.' },
    { icon: '🔄', title: 'Distributor Sync', desc: 'Sync pricing and availability from your distributor.', soon: true },
  ],
  steps: [
    { step: 1, title: 'Import your product catalog (CSV or manual)' },
    { step: 2, title: 'Set retail and wholesale pricing' },
    { step: 3, title: 'Attach datasheets and specs' },
  ],
  integrations: ['BayWa r.e.', 'CED Greentech', 'Soligent', 'CSV Import'],
};

export const ONBOARDING_CALENDAR: PageOnboarding = {
  headline: 'Calendar',
  subtitle: 'Site surveys, installations, inspections — synced from your Google Calendar or Outlook.',
  features: [
    { icon: '📅', title: 'Calendar Sync', desc: 'Two-way sync with Google Calendar or Outlook. Events appear automatically.' },
    { icon: '🏠', title: 'Site Surveys', desc: 'See upcoming site visits with customer details, address, and project context.' },
    { icon: '🔧', title: 'Installation Planning', desc: 'Schedule installations and track crew assignments and equipment needs.' },
    { icon: '✅', title: 'Inspection Reminders', desc: 'Never miss an AHJ or utility inspection. Get reminders with permit details.' },
  ],
  steps: [
    { step: 1, title: 'Connect Google Calendar or Outlook' },
    { step: 2, title: 'Events sync automatically' },
    { step: 3, title: 'Set up reminders for inspections and deadlines' },
  ],
  integrations: ['Google Calendar', 'Outlook', 'Calendly'],
};

export const ONBOARDING_FILES: PageOnboarding = {
  headline: 'Files & Documents',
  subtitle: 'Proposals, permits, datasheets — organized by project, accessible to your whole team.',
  features: [
    { icon: '📁', title: 'Project Folders', desc: 'Each project gets a folder. Proposals, contracts, permits, photos — all in one place.' },
    { icon: '📄', title: 'Template Library', desc: 'Store your proposal templates, contract templates, and standard forms.' },
    { icon: '🔍', title: 'Search & Filter', desc: 'Find any document by name, project, type, or date. Full-text search across all files.' },
    { icon: '☁️', title: 'Cloud Sync', desc: 'Connects to Google Drive — files stay in your drive, organized view in .birdie.' },
  ],
  steps: [
    { step: 1, title: 'Connect Google Drive or Dropbox' },
    { step: 2, title: 'Map your folder structure' },
    { step: 3, title: 'Upload your templates' },
  ],
  integrations: ['Google Drive', 'Dropbox', 'OneDrive'],
};
