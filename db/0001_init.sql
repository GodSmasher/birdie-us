-- .birdie — initial schema (Postgres / Supabase)
-- Multi-tenant: every row carries tenant_id, isolated via Row-Level Security.
-- The platform connects as service_role (RLS-bypass); RLS protects any future
-- client-/anon-level access.

create extension if not exists "pgcrypto";

-- ---------------- Tenants ----------------
create table if not exists tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  industry    text,                       -- 'solar', 'handwerk', ...
  created_at  timestamptz not null default now()
);

-- ---------------- Connectors (per tenant) ----------------
create table if not exists connectors (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  type         text not null,             -- 'reonic','gmail','google-calendar','sevdesk','ecoflow',...
  status       text not null default 'active',
  last_sync_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (tenant_id, type)
);

-- ---------------- Synced entities (generic cache) ----------------
-- Snapshot of CRM/accounting/comms objects so pages read from DB, not live APIs,
-- and so bots can diff "what changed since last sync".
create table if not exists entities (
  tenant_id   uuid not null references tenants(id) on delete cascade,
  connector   text not null,              -- source connector type
  kind        text not null,              -- 'offer','contact','component','invoice','event','message'
  external_id text not null,              -- id in the source system
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (tenant_id, connector, kind, external_id)
);
create index if not exists entities_tenant_kind_idx on entities (tenant_id, kind);
create index if not exists entities_updated_idx on entities (tenant_id, updated_at desc);

-- ---------------- Time-series readings ----------------
-- Matches the @birdie/connectors Reading shape (tariffs, PV power, battery SoC...).
create table if not exists readings (
  id              bigint generated always as identity primary key,
  tenant_id       uuid not null references tenants(id) on delete cascade,
  connector       text not null,
  installation_id text,
  metric          text not null,          -- 'tariff.price','battery.soc','pv.power',...
  value           double precision not null,
  unit            text,
  ts              timestamptz not null
);
create index if not exists readings_lookup_idx on readings (tenant_id, metric, ts desc);
create index if not exists readings_install_idx on readings (tenant_id, installation_id, ts desc);

-- ---------------- Sync runs (observability) ----------------
create table if not exists sync_runs (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  connector   text not null,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  ok          boolean,
  item_count  int not null default 0,
  error       text
);
create index if not exists sync_runs_recent_idx on sync_runs (tenant_id, started_at desc);

-- ---------------- RLS ----------------
alter table tenants    enable row level security;
alter table connectors enable row level security;
alter table entities   enable row level security;
alter table readings   enable row level security;
alter table sync_runs  enable row level security;
-- No public policies: only service_role (server) may read/write for now.
-- Per-tenant client policies get added when end-user auth is introduced.

-- ---------------- Seed: Volta as first tenant ----------------
insert into tenants (slug, name, industry)
values ('volta', 'Volta Solaranlagen', 'solar')
on conflict (slug) do nothing;
