-- 002_rls_policies.sql
-- Row-level security policies for orgs, profiles, forms, and leads.

alter table public.orgs enable row level security;
alter table public.profiles enable row level security;
alter table public.forms enable row level security;
alter table public.leads enable row level security;

-- ORGS: user can read/update only their own org via profile.org_id
drop policy if exists "orgs_select_own_org" on public.orgs;
create policy "orgs_select_own_org"
  on public.orgs
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.org_id = orgs.id
    )
  );

drop policy if exists "orgs_update_own_org" on public.orgs;
create policy "orgs_update_own_org"
  on public.orgs
  for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.org_id = orgs.id
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.org_id = orgs.id
    )
  );

-- PROFILES: user can read/update only their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- FORMS: user can CRUD only forms in their org
drop policy if exists "forms_select_by_org" on public.forms;
create policy "forms_select_by_org"
  on public.forms
  for select
  using (
    org_id = (
      select p.org_id
      from public.profiles p
      where p.id = auth.uid()
    )
  );

drop policy if exists "forms_insert_by_org" on public.forms;
create policy "forms_insert_by_org"
  on public.forms
  for insert
  with check (
    org_id = (
      select p.org_id
      from public.profiles p
      where p.id = auth.uid()
    )
  );

drop policy if exists "forms_update_by_org" on public.forms;
create policy "forms_update_by_org"
  on public.forms
  for update
  using (
    org_id = (
      select p.org_id
      from public.profiles p
      where p.id = auth.uid()
    )
  )
  with check (
    org_id = (
      select p.org_id
      from public.profiles p
      where p.id = auth.uid()
    )
  );

drop policy if exists "forms_delete_by_org" on public.forms;
create policy "forms_delete_by_org"
  on public.forms
  for delete
  using (
    org_id = (
      select p.org_id
      from public.profiles p
      where p.id = auth.uid()
    )
  );

-- LEADS: user can read only leads in their org
drop policy if exists "leads_select_by_org" on public.leads;
create policy "leads_select_by_org"
  on public.leads
  for select
  using (
    org_id = (
      select p.org_id
      from public.profiles p
      where p.id = auth.uid()
    )
  );

-- LEADS INSERT: allow public/anon inserts for unauthenticated form submissions
drop policy if exists "leads_insert_anon" on public.leads;
create policy "leads_insert_anon"
  on public.leads
  for insert
  to anon
  with check (true);
