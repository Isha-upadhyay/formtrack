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
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Subscription</span>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight font-syne">Billing</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage your subscription and payment history.</p>
      </div>
      
      <div className="w-full">
        <BillingClient org={org} />
      </div>
    </div>
  )
}