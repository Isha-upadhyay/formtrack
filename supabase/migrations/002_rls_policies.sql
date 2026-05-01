-- 002_rls_policies.sql
-- Row-level security policies for orgs, profiles, forms, and leads.

ALTER TABLE public.orgs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads   ENABLE ROW LEVEL SECURITY;

-- ── ORGS ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orgs_select_own_org" ON public.orgs;
CREATE POLICY "orgs_select_own_org"
  ON public.orgs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.org_id = orgs.id
    )
  );

DROP POLICY IF EXISTS "orgs_update_own_org" ON public.orgs;
CREATE POLICY "orgs_update_own_org"
  ON public.orgs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.org_id = orgs.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.org_id = orgs.id
    )
  );

-- ── PROFILES ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── FORMS ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "forms_select_by_org" ON public.forms;
CREATE POLICY "forms_select_by_org"
  ON public.forms FOR SELECT
  USING (
    org_id = (
      SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

-- CRITICAL FIX: anon users must be able to read active forms
-- so embed.js and /f/[formId] pages work without auth
DROP POLICY IF EXISTS "forms_select_public_active" ON public.forms;
CREATE POLICY "forms_select_public_active"
  ON public.forms FOR SELECT
  TO anon
  USING (status = 'active');

DROP POLICY IF EXISTS "forms_insert_by_org" ON public.forms;
CREATE POLICY "forms_insert_by_org"
  ON public.forms FOR INSERT
  WITH CHECK (
    org_id = (
      SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "forms_update_by_org" ON public.forms;
CREATE POLICY "forms_update_by_org"
  ON public.forms FOR UPDATE
  USING (
    org_id = (
      SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  )
  WITH CHECK (
    org_id = (
      SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "forms_delete_by_org" ON public.forms;
CREATE POLICY "forms_delete_by_org"
  ON public.forms FOR DELETE
  USING (
    org_id = (
      SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

-- ── LEADS ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "leads_select_by_org" ON public.leads;
CREATE POLICY "leads_select_by_org"
  ON public.leads FOR SELECT
  USING (
    org_id = (
      SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

-- CRITICAL FIX: anon insert only allowed when the form is active.
-- This prevents spamming inactive/non-existent forms.
DROP POLICY IF EXISTS "leads_insert_anon" ON public.leads;
CREATE POLICY "leads_insert_anon"
  ON public.leads FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = leads.form_id AND f.status = 'active'
    )
  );

-- Authenticated users cannot delete leads (audit trail)
-- No DELETE policy = implicit deny