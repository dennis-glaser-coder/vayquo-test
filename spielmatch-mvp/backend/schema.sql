-- SPIELMATCH backend schema (prepared for a dedicated Supabase project)
-- Public read, internal/service writes. Never expose service_role in the client.

create table if not exists public.spielmatch_providers (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  domain text not null unique,
  operator_name text not null,
  direct_url text not null,
  ggl_status text not null default 'verified' check (ggl_status in ('verified','pending','inactive')),
  ggl_verified_as_of date,
  min_deposit_eur numeric(8,2),
  catalog_label text,
  catalog_verified boolean not null default false,
  affiliate_status text not null default 'unverified' check (affiliate_status in ('unverified','approved','inactive')),
  affiliate_url text,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.spielmatch_payment_methods (
  id text primary key,
  label text not null
);

create table if not exists public.spielmatch_provider_payments (
  provider_id bigint not null references public.spielmatch_providers(id) on delete cascade,
  payment_id text not null references public.spielmatch_payment_methods(id) on delete restrict,
  verified_at date not null,
  source_url text not null,
  primary key (provider_id,payment_id)
);

create table if not exists public.spielmatch_games (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  studio text,
  is_active boolean not null default true
);

-- Availability is market + product specific. Never infer DE availability from another market
-- or a different gambling vertical. Evidence must stay attached to the exact mapping.
create table if not exists public.spielmatch_provider_games (
  provider_id bigint not null references public.spielmatch_providers(id) on delete cascade,
  game_id bigint not null references public.spielmatch_games(id) on delete cascade,
  market_code text not null check (market_code ~ '^[A-Z]{2}$'),
  product_type text not null check (product_type in ('virtual_slots')),
  availability_status text not null default 'pending' check (availability_status in ('verified','pending','unavailable')),
  evidence_type text not null check (evidence_type in ('operator_game_page','operator_catalog_page','regulator_source')),
  verified_at date,
  source_url text not null check (source_url ~ '^https://'),
  updated_at timestamptz not null default now(),
  primary key (provider_id,game_id,market_code,product_type),
  constraint verified_provider_game_requires_date
    check (availability_status <> 'verified' or verified_at is not null),
  constraint verified_provider_game_requires_strong_evidence
    check (availability_status <> 'verified' or evidence_type in ('operator_game_page','regulator_source'))
);

create index if not exists spielmatch_provider_games_market_product_idx
  on public.spielmatch_provider_games (market_code, product_type, availability_status);

alter table public.spielmatch_providers enable row level security;
alter table public.spielmatch_payment_methods enable row level security;
alter table public.spielmatch_provider_payments enable row level security;
alter table public.spielmatch_games enable row level security;
alter table public.spielmatch_provider_games enable row level security;

drop policy if exists "public read active providers" on public.spielmatch_providers;
create policy "public read active providers" on public.spielmatch_providers
for select to anon, authenticated using (is_active = true and ggl_status = 'verified');

drop policy if exists "public read payments" on public.spielmatch_payment_methods;
create policy "public read payments" on public.spielmatch_payment_methods
for select to anon, authenticated using (true);

drop policy if exists "public read provider payments" on public.spielmatch_provider_payments;
create policy "public read provider payments" on public.spielmatch_provider_payments
for select to anon, authenticated using (true);

drop policy if exists "public read active games" on public.spielmatch_games;
create policy "public read active games" on public.spielmatch_games
for select to anon, authenticated using (is_active = true);

drop policy if exists "public read verified provider games" on public.spielmatch_provider_games;
create policy "public read verified provider games" on public.spielmatch_provider_games
for select to anon, authenticated using (
  market_code = 'DE'
  and product_type = 'virtual_slots'
  and availability_status = 'verified'
  and evidence_type in ('operator_game_page','regulator_source')
  and verified_at is not null
  and exists (
    select 1
    from public.spielmatch_providers p
    where p.id = provider_id
      and p.is_active = true
      and p.ggl_status = 'verified'
  )
);

grant select on public.spielmatch_providers to anon, authenticated;
grant select on public.spielmatch_payment_methods to anon, authenticated;
grant select on public.spielmatch_provider_payments to anon, authenticated;
grant select on public.spielmatch_games to anon, authenticated;
grant select on public.spielmatch_provider_games to anon, authenticated;
