-- SPIELMATCH initial schema draft
-- Designed for a dedicated Supabase project. Do not apply to VAYQUO.

create extension if not exists pgcrypto;

create table if not exists markets (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique check (char_length(country_code)=2),
  name text not null,
  currency_code text,
  timezone text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  operator_name text,
  website_url text,
  logo_url text,
  status text not null default 'research' check (status in ('research','active','paused','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists provider_markets (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  legal_status text not null default 'unknown' check (legal_status in ('unknown','verified_allowed','restricted','not_allowed')),
  license_authority text,
  license_reference text,
  source_url text,
  verified_at timestamptz,
  affiliate_links_allowed boolean not null default false,
  notes text,
  unique(provider_id, market_id)
);

create table if not exists game_studios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  website_url text
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  studio_id uuid references game_studios(id) on delete set null,
  category text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_availability (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  is_available boolean not null default false,
  source_url text,
  verified_at timestamptz,
  unique(game_id, provider_id, market_id)
);

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table if not exists provider_payment_methods (
  provider_id uuid not null references providers(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  payment_method_id uuid not null references payment_methods(id) on delete cascade,
  deposits_supported boolean not null default true,
  withdrawals_supported boolean not null default false,
  min_deposit numeric(12,2),
  source_url text,
  verified_at timestamptz,
  primary key(provider_id, market_id, payment_method_id)
);

create table if not exists affiliate_programs (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  network_name text,
  signup_url text,
  contact_email text,
  status text not null default 'research' check(status in ('research','applied','approved','rejected','paused')),
  created_at timestamptz not null default now()
);

create table if not exists affiliate_offers (
  id uuid primary key default gen_random_uuid(),
  affiliate_program_id uuid not null references affiliate_programs(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  model text not null check(model in ('cpa','revshare','hybrid','flat','other')),
  cpa_amount numeric(12,2),
  revenue_share_pct numeric(6,3),
  currency_code text,
  qualification_rules text,
  cookie_days integer,
  public_source_url text,
  verified_at timestamptz,
  legal_review_status text not null default 'pending' check(legal_review_status in ('pending','approved','rejected','needs_counsel')),
  approved_at timestamptz,
  approval_evidence text,
  is_active boolean not null default false,
  check (legal_review_status <> 'approved' or (approved_at is not null and approval_evidence is not null))
);

create table if not exists traffic_rules (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  gambling_type text not null,
  rule_type text not null,
  start_local time,
  end_local time,
  rule_text text not null,
  source_url text not null,
  verified_at timestamptz not null,
  unique(market_id, gambling_type, rule_type)
);

create table if not exists match_attributes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  data_type text not null default 'boolean',
  weight_default numeric(6,3) not null default 1
);

create table if not exists provider_attribute_values (
  provider_id uuid not null references providers(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  attribute_id uuid not null references match_attributes(id) on delete cascade,
  value_json jsonb not null,
  verified_at timestamptz,
  primary key(provider_id, market_id, attribute_id)
);

-- Public UI should only read explicitly approved market/provider data through views or RPCs.
-- Affiliate amounts must never be exposed to the match-score function.
-- An offer is not eligible for monetized UI merely because is_active=true; the serving layer must additionally require legal_review_status='approved'.
