/**
 * Check whether the current org can create more forms/leads.
 * Call this from server components or API routes.
 */
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'

type DB = Awaited<ReturnType<typeof createClient>>

async function getSubForOrg(db: DB, orgId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('subscriptions')
    .select('plan, status')
    .eq('org_id', orgId)
    .maybeSingle() as Promise<{
      data: { plan: string; status: string } | null
    }>
}

async function getFormCount(db: DB, orgId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('forms')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId) as Promise<{ count: number | null }>
}

export async function getOrgPlan(orgId: string): Promise<'free' | 'pro'> {
  const supabase = await createClient()
  const { data: sub } = await getSubForOrg(supabase, orgId)
  return sub?.status === 'active' && sub?.plan === 'pro' ? 'pro' : 'free'
}

export async function canCreateForm(
  orgId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()
  const plan = await getOrgPlan(orgId)
  const limit = PLAN_LIMITS[plan].forms

  if (limit === Infinity) return { allowed: true }

  const { count } = await getFormCount(supabase, orgId)
  if ((count ?? 0) >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows ${limit} forms. Upgrade to Pro for unlimited.`,
    }
  }
  return { allowed: true }
}