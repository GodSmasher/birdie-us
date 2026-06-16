-- Dunning (Mahnwesen) templates — editable in birdie, consumed by n8n workflows.
-- Each row is one dunning stage (Erinnerung → Mahnung → Inkasso).

create table if not exists dunning_templates (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references tenants(id) on delete cascade,
  stufe         smallint not null,            -- 0..5
  name          text not null,                -- display name
  betreff       text not null default '',     -- email subject (with {{placeholders}})
  text_html     text not null default '',     -- email body HTML
  text_plain    text not null default '',     -- plaintext fallback
  frist_tage    smallint not null default 0,  -- days after due date when this fires
  gebuehr       numeric(8,2) not null default 0, -- dunning fee in EUR
  aktiv         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- One template per stage per tenant
create unique index if not exists dunning_templates_tenant_stufe
  on dunning_templates(tenant_id, stufe);

-- Trigger to auto-update updated_at
create or replace function update_dunning_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_dunning_updated on dunning_templates;
create trigger trg_dunning_updated
  before update on dunning_templates
  for each row execute function update_dunning_updated_at();
