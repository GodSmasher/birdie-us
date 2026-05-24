// Unified data layer: read from the DB cache when synced, fall back to live Reonic.
// Pages call these instead of the live fetchers directly.

import { getEntities } from './db';
import {
  buildPipeline,
  buildLeads,
  buildCatalog,
  getReonicPipeline,
  getReonicLeads,
  getReonicCatalog,
  getUpcomingEvents,
  type Pipeline,
  type Leads,
  type Catalog,
  type RawOffer,
  type RawContact,
  type CatalogComponent,
  type UpcomingEvent,
} from './reonic-server';

export type Source = 'DB-Cache' | 'live';

export async function loadPipeline(): Promise<{ data: Pipeline; source: Source }> {
  const offers = await getEntities<RawOffer>('offer');
  if (!offers.length) return { data: await getReonicPipeline(), source: 'live' };
  const [users, teams] = await Promise.all([
    getEntities<{ id: string; name: string }>('user'),
    getEntities<{ id: string; name: string }>('team'),
  ]);
  const userNames = new Map(users.map((u) => [u.id, u.name]));
  const teamNames = new Map(teams.map((t) => [t.id, t.name]));
  return { data: buildPipeline(offers, userNames, teamNames), source: 'DB-Cache' };
}

export async function loadLeads(): Promise<{ data: Leads; source: Source }> {
  const contacts = await getEntities<RawContact>('contact');
  if (!contacts.length) return { data: await getReonicLeads(), source: 'live' };
  return { data: buildLeads(contacts), source: 'DB-Cache' };
}

export async function loadCatalog(): Promise<{ data: Catalog; source: Source }> {
  const components = await getEntities<CatalogComponent>('component');
  if (!components.length) return { data: await getReonicCatalog(), source: 'live' };
  return { data: buildCatalog(components), source: 'DB-Cache' };
}

export interface DashboardData {
  configured: boolean;
  source: Source;
  pipeline: Pipeline;
  leads: Leads;
  events: UpcomingEvent[];
}

export async function loadDashboard(): Promise<DashboardData> {
  const [pipe, leads, events] = await Promise.all([loadPipeline(), loadLeads(), getUpcomingEvents(8)]);
  return { configured: pipe.data.configured, source: pipe.source, pipeline: pipe.data, leads: leads.data, events };
}
