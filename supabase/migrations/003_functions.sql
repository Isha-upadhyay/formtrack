-- 003_functions.sql
-- Auto-provision org + profile on new auth.users signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  insert into public.orgs (name)
  values (coalesce(new.email, 'New Organization'))
  returning id into new_org_id;

  insert into public.profiles (id, org_id, email)
  values (new.id, new_org_id, coalesce(new.email, ''));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
