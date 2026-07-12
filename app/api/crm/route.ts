import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  loadDashboard,
  loadPipeline,
  loadLeads,
  loadProjects,
  loadInterconnection,
  loadSchedule,
  loadInbox,
  loadReports,
  loadSidebarCounts,
} from '@/app/demo/lib/crm-service';

function isDemo(): boolean {
  try {
    return cookies().get('birdie_demo')?.value === '1';
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!isDemo()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get('view');

  const loaders: Record<string, () => Promise<unknown>> = {
    dashboard: loadDashboard,
    pipeline: loadPipeline,
    leads: loadLeads,
    projects: loadProjects,
    interconnection: loadInterconnection,
    schedule: loadSchedule,
    inbox: loadInbox,
    reports: loadReports,
    sidebar: loadSidebarCounts,
  };

  if (!view || !loaders[view]) {
    return NextResponse.json({ error: 'Missing or invalid ?view= parameter', available: Object.keys(loaders) }, { status: 400 });
  }

  const data = await loaders[view]();
  return NextResponse.json({ source: 'demo-static', data });
}
