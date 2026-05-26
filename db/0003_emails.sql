-- Emails table: persists ingested emails from Gmail for the Postfach view.
-- Matched to invoices/projects via extracted Rechnungsnummer.

create table if not exists emails (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id),
  gmail_id      text not null,
  thread_id     text,
  from_email    text not null,
  from_name     text,
  to_email      text,
  subject       text,
  snippet       text,
  body_plain    text,
  received_at   timestamptz not null default now(),
  is_read       boolean not null default false,
  -- Auto-matching
  matched_invoice text,          -- extracted Rechnungsnummer (e.g. "RE-2026-0042")
  matched_project_id uuid references cashflow_projects(id),
  category      text not null default 'general',  -- dunning_reply, payment_info, general, bounce
  -- Metadata
  labels        text[] default '{}',
  created_at    timestamptz not null default now(),
  unique(tenant_id, gmail_id)
);

-- Index for fast lookups
create index if not exists idx_emails_tenant_received on emails(tenant_id, received_at desc);
create index if not exists idx_emails_matched_invoice on emails(matched_invoice) where matched_invoice is not null;
create index if not exists idx_emails_category on emails(tenant_id, category);

-- RLS
alter table emails enable row level security;
create policy "service_role_all" on emails for all using (true) with check (true);
