-- BioLab 3D: access keys (Postgres / Supabase). Planned store for multi-instance deployments.
-- Only the HMAC of each key is stored. Enable RLS and expose NO policies to anon/authenticated:
-- the table is read only by the server with the service role.

create table if not exists access_keys (
  id           text primary key,
  hash         char(64) not null unique,
  hint         text not null,
  tier         text not null check (tier in ('basico', 'completo')),
  label        text not null default '',
  created_at   timestamptz not null default now(),
  revoked_at   timestamptz,
  expires_at   timestamptz,
  max_devices  integer check (max_devices is null or max_devices > 0) default 3,
  order_ref    text unique
);

create table if not exists access_key_devices (
  key_id       text not null references access_keys(id) on delete cascade,
  device_hash  char(64) not null,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  primary key (key_id, device_hash)
);

create table if not exists access_failures (
  client_id    text not null,
  at           timestamptz not null default now()
);
create index if not exists access_failures_client_at on access_failures (client_id, at);

alter table access_keys enable row level security;
alter table access_key_devices enable row level security;
alter table access_failures enable row level security;
