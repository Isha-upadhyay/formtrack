-- 004_billing.sql
-- Billing columns and index for org-level plan expiry/payment state.

alter table public.orgs
  add column if not exists plan_expires_at timestamptz,
  add column if not exists razorpay_payment_id text;

create index if not exists idx_orgs_plan_expires_at on public.orgs (plan_expires_at);
