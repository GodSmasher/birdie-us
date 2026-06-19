-- User profiles: links Supabase auth users to tenants.
-- Run after 0001_init.sql (needs tenants table).

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  email      text not null,
  name       text,
  role       text not null default 'member',
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_email_idx on profiles(email);
create index if not exists profiles_tenant_idx on profiles(tenant_id);

alter table profiles enable row level security;

-- Users can read their own profile
create policy "Users read own profile"
  on profiles for select
  using (auth.uid() = id);

-- RLS on core tables: authenticated users only see their tenant's data
create policy "Tenant isolation on entities"
  on entities for select
  using (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "Tenant isolation on connectors"
  on connectors for select
  using (tenant_id in (select tenant_id from profiles where id = auth.uid()));

create policy "Tenant isolation on readings"
  on readings for select
  using (tenant_id in (select tenant_id from profiles where id = auth.uid()));
