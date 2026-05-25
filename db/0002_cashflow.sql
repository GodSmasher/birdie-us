-- .birdie — Cashflow / Liquiditätsplanung
-- Projekte mit Teilzahlungsplan (Einnahmen) und Einkaufsplan (Ausgaben).
-- Verknüpft Reonic-Aufträge mit sevDesk-Rechnungen für Soll/Ist-Abgleich.

-- ---------------- Projekte (Aufträge mit Finanzplanung) ----------------
create table if not exists cashflow_projects (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  reonic_offer_id text,
  customer_name   text not null,
  title           text,
  order_value     numeric not null,
  order_date      date,
  installation_date date,
  completion_date date,
  status          text not null default 'active'
                  check (status in ('active','completed','cancelled')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists cfp_tenant_idx on cashflow_projects (tenant_id, status);
create unique index if not exists cfp_reonic_idx on cashflow_projects (tenant_id, reonic_offer_id)
  where reonic_offer_id is not null;

-- ---------------- Cashflow-Einträge (Ein- und Ausgänge) ----------------
create table if not exists cashflow_entries (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  project_id      uuid not null references cashflow_projects(id) on delete cascade,
  direction       text not null check (direction in ('in','out')),
  category        text not null,
  description     text,
  planned_amount  numeric not null,
  actual_amount   numeric,
  planned_date    date not null,
  actual_date     date,
  sevdesk_invoice_id text,
  supplier        text,
  status          text not null default 'planned'
                  check (status in ('planned','invoiced','paid','overdue','cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists cfe_project_idx on cashflow_entries (project_id, planned_date);
create index if not exists cfe_tenant_date_idx on cashflow_entries (tenant_id, planned_date);

-- RLS
alter table cashflow_projects enable row level security;
alter table cashflow_entries  enable row level security;

-- Kommentar: Kategorien für direction='in':
--   anzahlung, abschlag, schlussrechnung, sonstiges_in
-- Kategorien für direction='out':
--   material, subunternehmer, sonstiges_out
