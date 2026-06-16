-- Netz-Emails: IMAP-synced emails relevant to Netzanmeldung.
-- Matched to registrations via customer name / Netzbetreiber.

create table if not exists netz_emails (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references tenants(id),
  mailbox                  text not null,       -- na@ | netzanmeldung@ | info@
  message_id               text not null,       -- IMAP Message-ID (dedup)
  from_email               text not null,
  from_name                text,
  to_email                 text,
  subject                  text,
  body_plain               text,
  received_at              timestamptz not null default now(),
  is_read                  boolean not null default false,
  -- Haiku classification
  category                 text not null default 'general',
  summary                  text,
  intent                   text,
  -- Matching
  matched_registration_id  text,                -- offerId of the matched registration
  matched_customer         text,                -- customer name from matching
  -- Auto-reply
  auto_replied             boolean not null default false,
  -- Metadata
  created_at               timestamptz not null default now(),
  unique(tenant_id, mailbox, message_id)
);

create index if not exists idx_netz_emails_tenant_received on netz_emails(tenant_id, received_at desc);
create index if not exists idx_netz_emails_registration on netz_emails(matched_registration_id) where matched_registration_id is not null;
create index if not exists idx_netz_emails_category on netz_emails(tenant_id, category);
create index if not exists idx_netz_emails_mailbox on netz_emails(tenant_id, mailbox);

-- RLS
alter table netz_emails enable row level security;
create policy "service_role_all" on netz_emails for all using (true) with check (true);
