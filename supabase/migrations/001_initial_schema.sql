-- 001_initial_schema.sql
-- Base schema for orgs, profiles, forms, and leads.

create extension if not exists pgcrypto;

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free',
  leads_used_this_month integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  name text not null,
  fields jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  design jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms (id) on delete cascade,
  org_id uuid not null references public.orgs (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  source_url text,
  source_summary text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_form_id on public.leads (form_id);
create index if not exists idx_leads_org_id on public.leads (org_id);
create index if not exists idx_leads_created_at on public.leads (created_at);
create index if not exists idx_forms_org_id on public.forms (org_id);
