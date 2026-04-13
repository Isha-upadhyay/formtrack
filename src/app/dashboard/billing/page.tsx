import { createClient } from '@/lib/supabase/server'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: subRaw } = await (supabase.from('subscriptions') as any)
    .select('*')
    .single()

  const subscription = subRaw as {
    plan: string
    status: string
  } | null

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription</p>
      </div>
      <BillingClient subscription={subscription} />
    </div>
  )
}