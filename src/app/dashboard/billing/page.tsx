import { createClient } from '@/lib/supabase/server'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  let org: {
    plan: string
    plan_expires_at: string | null
    leads_used_this_month: number
  } | null = null

  if (user) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profile?.org_id) {
      const { data: orgRow } = await (supabase.from('orgs') as any)
        .select('plan, plan_expires_at, leads_used_this_month')
        .eq('id', profile.org_id)
        .single()
      org = orgRow ?? null
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage your subscription</p>
      </div>
      <BillingClient org={org} />
    </div>
  )
}