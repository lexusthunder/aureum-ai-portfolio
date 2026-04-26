-- ============================================================
-- AUREUM CRM — Supabase Schema
-- Run this in the Supabase SQL Editor after creating project
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase Auth users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique not null,
  full_name   text not null default '',
  company     text,
  role        text not null default 'agent' check (role in ('agent','manager','admin')),
  language    text not null default 'en' check (language in ('en','ro','ar','es','zh')),
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists public.leads (
  id                    bigserial primary key,
  first_name            text not null,
  last_name             text not null,
  email                 text,
  phone                 text,
  company               text,
  source                text default 'website' check (source in ('website','referral','social','portal','cold','other')),
  status                text not null default 'new' check (status in ('new','contacted','qualified','proposal','negotiation','won','lost')),
  priority              text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  nationality           text,
  language              text default 'en',
  ai_score              numeric(5,2) default 0,
  ai_score_reasons      jsonb default '[]',
  budget_min            numeric(15,2),
  budget_max            numeric(15,2),
  preferred_locations   jsonb default '[]',
  property_types        jsonb default '[]',
  bedrooms_min          int,
  notes                 text,
  tags                  jsonb default '[]',
  last_contacted        timestamptz,
  next_follow_up        timestamptz,
  response_time_seconds int,
  owner_id              uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- PROPERTIES
-- ============================================================
create table if not exists public.properties (
  id               bigserial primary key,
  title            text not null,
  description      text,
  property_type    text not null default 'apartment' check (property_type in ('apartment','house','villa','penthouse','commercial','land')),
  status           text not null default 'available' check (status in ('available','under_offer','sold','off_market')),
  address          text,
  city             text,
  county           text,
  country          text default 'Ireland',
  eircode          text,
  latitude         numeric(10,7),
  longitude        numeric(10,7),
  price            numeric(15,2) not null default 0,
  bedrooms         int,
  bathrooms        int,
  area_sqm         numeric(10,2),
  ber_rating       text,
  amenities        jsonb default '[]',
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  listing_url      text,
  source           text default 'manual' check (source in ('daft','myhome','manual','api')),
  images           jsonb default '[]',
  virtual_tour_url text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- DEALS
-- ============================================================
create table if not exists public.deals (
  id                 bigserial primary key,
  title              text not null,
  stage              text not null default 'discovery' check (stage in ('discovery','viewing','offer','negotiation','legal','closed_won','closed_lost')),
  value              numeric(15,2) not null default 0,
  commission_rate    numeric(5,2) default 1.5,
  lead_id            bigint references public.leads(id) on delete set null,
  property_id        bigint references public.properties(id) on delete set null,
  owner_id           uuid references public.profiles(id) on delete set null,
  expected_close_date timestamptz,
  actual_close_date  timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table if not exists public.activities (
  id            bigserial primary key,
  activity_type text not null default 'note' check (activity_type in ('call','email','viewing','meeting','note','task')),
  description   text,
  completed     boolean not null default false,
  scheduled_at  timestamptz,
  lead_id       bigint references public.leads(id) on delete cascade,
  deal_id       bigint references public.deals(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- PROPERTY STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_leads_updated_at    before update on public.leads      for each row execute function public.set_updated_at();
create trigger set_properties_updated_at before update on public.properties for each row execute function public.set_updated_at();
create trigger set_deals_updated_at    before update on public.deals      for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles   enable row level security;
alter table public.leads       enable row level security;
alter table public.properties  enable row level security;
alter table public.deals       enable row level security;
alter table public.activities  enable row level security;

-- Profiles: fiecare user vede/editează profilul său
create policy "Profiles are viewable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- Leads: toți agenții autentificați pot lucra cu leads
create policy "Authenticated users can view leads"   on public.leads for select to authenticated using (true);
create policy "Authenticated users can create leads" on public.leads for insert to authenticated with check (true);
create policy "Authenticated users can update leads" on public.leads for update to authenticated using (true);
create policy "Authenticated users can delete leads" on public.leads for delete to authenticated using (true);

-- Properties
create policy "Authenticated users can view properties"   on public.properties for select to authenticated using (true);
create policy "Authenticated users can create properties" on public.properties for insert to authenticated with check (true);
create policy "Authenticated users can update properties" on public.properties for update to authenticated using (true);
create policy "Authenticated users can delete properties" on public.properties for delete to authenticated using (true);

-- Deals
create policy "Authenticated users can view deals"   on public.deals for select to authenticated using (true);
create policy "Authenticated users can create deals" on public.deals for insert to authenticated with check (true);
create policy "Authenticated users can update deals" on public.deals for update to authenticated using (true);
create policy "Authenticated users can delete deals" on public.deals for delete to authenticated using (true);

-- Activities
create policy "Authenticated users can view activities"   on public.activities for select to authenticated using (true);
create policy "Authenticated users can create activities" on public.activities for insert to authenticated with check (true);
create policy "Authenticated users can update activities" on public.activities for update to authenticated using (true);
create policy "Authenticated users can delete activities" on public.activities for delete to authenticated using (true);

-- Storage: poze proprietăți
create policy "Property images are public" on storage.objects for select using (bucket_id = 'property-images');
create policy "Authenticated users can upload property images" on storage.objects for insert to authenticated with check (bucket_id = 'property-images');
create policy "Authenticated users can delete own property images" on storage.objects for delete to authenticated using (bucket_id = 'property-images');

-- ============================================================
-- INDEXES pentru performanță
-- ============================================================
create index if not exists idx_leads_status   on public.leads(status);
create index if not exists idx_leads_owner    on public.leads(owner_id);
create index if not exists idx_leads_created  on public.leads(created_at desc);
create index if not exists idx_deals_stage    on public.deals(stage);
create index if not exists idx_deals_owner    on public.deals(owner_id);
create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_activities_lead on public.activities(lead_id);
