import { PLAN_LIMITS } from '@/types'

type OrgPlanState = {
  plan: string | null
  plan_expires_at?: string | null
}

function hasActivePro(org: OrgPlanState | null | undefined): boolean {
  if (!org || org.plan !== 'pro' || !org.plan_expires_at) return false
  const expiresAtMs = new Date(org.plan_expires_at).getTime()
  if (Number.isNaN(expiresAtMs)) return false
  return expiresAtMs > Date.now()
}

export function isPro(org: OrgPlanState | null | undefined): boolean {
  return hasActivePro(org)
}

export function canCreateForm(
  org: OrgPlanState | null | undefined,
  currentFormCount: number
): { allowed: boolean; reason?: string } {
  if (isPro(org)) return { allowed: true }

  const limit = PLAN_LIMITS.free.forms

  if (currentFormCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows ${limit} forms. Upgrade to Pro for unlimited.`,
    }
  }

  return { allowed: true }
}

export function canCaptureLead(
  org: OrgPlanState | null | undefined,
  monthlyLeadCount: number
): { allowed: boolean; reason?: string } {
  if (isPro(org)) return { allowed: true }

  const limit = PLAN_LIMITS.free.leads
  if (monthlyLeadCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows ${limit} leads/month. Upgrade to Pro for unlimited.`,
    }
  }

  return { allowed: true }
}