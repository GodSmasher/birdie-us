import { isDemoMode } from '@/app/lib/demo-mode';
import * as crm from '../crm-data';

export type CrmDataSource = 'demo-static' | 'supabase';

interface CrmDashboard {
  kpis: typeof crm.dashKpis;
  attention: typeof crm.dashAttention;
  today: typeof crm.dashToday;
  activity: typeof crm.dashActivity;
  icStrip: typeof crm.dashIcStrip;
}

interface CrmPipeline {
  deals: crm.Deal[];
  summary: typeof crm.pipeSummary;
  forecast: typeof crm.forecast;
  stages: string[];
}

interface CrmLeads {
  leads: crm.Lead[];
  sources: typeof crm.leadSources;
  total: number;
}

interface CrmProjects {
  projects: crm.Project[];
  metrics: typeof crm.projMetrics;
  stages: string[];
}

interface CrmInterconnection {
  rows: crm.IcRow[];
  summary: typeof crm.icSummary;
}

interface CrmSchedule {
  grid: crm.ScheduleRow[];
  roster: typeof crm.crewRoster;
  summary: typeof crm.schedSummary;
  unscheduled: typeof crm.unscheduledJobs;
}

interface CrmInbox {
  messages: crm.InboxMessage[];
  tabs: string[];
}

interface CrmReports {
  kpis: typeof crm.repKpis;
  revMonths: string[];
  revVals: number[];
  donut: typeof crm.donutLegend;
  icTurn: typeof crm.icTurnData;
}

interface CrmAutomations {
  bots: typeof crm.bots;
  workflows: typeof crm.workflows;
  chat: typeof crm.aiChat;
  suggestions: typeof crm.aiSuggest;
}

interface CrmIntegrations {
  integrations: typeof crm.integrations;
  categories: typeof crm.integCats;
}

interface CrmSettings {
  team: typeof crm.settingsTeam;
  notifications: typeof crm.notifRows;
  apiKeys: typeof crm.apiKeys;
}

export function getDataSource(): CrmDataSource {
  return isDemoMode() ? 'demo-static' : 'demo-static';
}

export async function loadDashboard(): Promise<CrmDashboard> {
  return {
    kpis: crm.dashKpis,
    attention: crm.dashAttention,
    today: crm.dashToday,
    activity: crm.dashActivity,
    icStrip: crm.dashIcStrip,
  };
}

export async function loadPipeline(): Promise<CrmPipeline> {
  return {
    deals: crm.deals,
    summary: crm.pipeSummary,
    forecast: crm.forecast,
    stages: crm.pipeStages,
  };
}

export async function loadLeads(): Promise<CrmLeads> {
  return {
    leads: crm.leads,
    sources: crm.leadSources,
    total: 247,
  };
}

export async function loadProjects(): Promise<CrmProjects> {
  return {
    projects: crm.projects,
    metrics: crm.projMetrics,
    stages: crm.projStages,
  };
}

export async function loadInterconnection(): Promise<CrmInterconnection> {
  return {
    rows: crm.icRows,
    summary: crm.icSummary,
  };
}

export async function loadSchedule(): Promise<CrmSchedule> {
  return {
    grid: crm.schedGrid,
    roster: crm.crewRoster,
    summary: crm.schedSummary,
    unscheduled: crm.unscheduledJobs,
  };
}

export async function loadInbox(): Promise<CrmInbox> {
  return {
    messages: crm.messages,
    tabs: crm.inboxTabs,
  };
}

export async function loadReports(): Promise<CrmReports> {
  return {
    kpis: crm.repKpis,
    revMonths: crm.revMonths,
    revVals: crm.revVals,
    donut: crm.donutLegend,
    icTurn: crm.icTurnData,
  };
}

export async function loadAutomations(): Promise<CrmAutomations> {
  return {
    bots: crm.bots,
    workflows: crm.workflows,
    chat: crm.aiChat,
    suggestions: crm.aiSuggest,
  };
}

export async function loadIntegrations(): Promise<CrmIntegrations> {
  return {
    integrations: crm.integrations,
    categories: crm.integCats,
  };
}

export async function loadSettings(): Promise<CrmSettings> {
  return {
    team: crm.settingsTeam,
    notifications: crm.notifRows,
    apiKeys: crm.apiKeys,
  };
}

export async function loadSidebarCounts(): Promise<Record<string, number>> {
  return {
    leads: 247,
    pipeline: crm.deals.filter(d => d.stageIdx < 5).length,
    projects: 12,
    interconnection: crm.icRows.filter(r => r.flag === 'red').length,
    inbox: crm.messages.filter(m => !m.read).length,
  };
}
