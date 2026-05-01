import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import FormActions from './FormActions'

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return <div>Unauthorized</div>

  // Get org and forms
  let { data: profile } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).maybeSingle()
  
  // FALLBACK: Auto-create org if missing using ADMIN client (bypasses RLS)
  if (!profile) {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = createAdminClient()
    const { data: newOrg } = await (admin.from('orgs') as any).insert({ name: user.email?.split('@')[0] + "'s Org" }).select().single()
    if (newOrg) {
      await (admin.from('profiles') as any).insert({ id: user.id, org_id: (newOrg as any).id, email: user.email || '' })
      profile = { org_id: (newOrg as any).id }
    }
  }

  if (!profile) return <div>Account setup incomplete. Please refresh.</div>

  const { data: org } = await (supabase.from('orgs') as any).select('plan').eq('id', profile.org_id).single()
  const { data: formsRaw } = await (supabase.from('forms') as any).select('*').eq('org_id', profile.org_id)
  
  const forms = (formsRaw ?? []) as Array<{
    id: string; name: string; description: string; status: string; created_at: string; fields: any[]
  }>
  
  const isPro = org?.plan === 'pro'
  const formLimit = isPro ? Infinity : 2
  const usagePercent = isPro ? 0 : (forms.length / formLimit) * 100

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forms</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Create and manage your lead capture forms</p>
        </div>
        <div className="flex items-center gap-4">
          {!isPro && (
            <div className="hidden sm:block text-right mr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Free Plan Usage</span>
                <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400">{forms.length} / {formLimit}</span>
              </div>
              <div className="w-32 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${forms.length >= formLimit ? 'bg-amber-500' : 'bg-blue-600'}`} 
                  style={{ width: `${Math.min(usagePercent, 100)}%` }} 
                />
              </div>
            </div>
          )}
          <Link href="/dashboard/forms/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-blue-500/20 whitespace-nowrap">
            + Create New
          </Link>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white dark:bg-[#1c2128] rounded-3xl border border-gray-100 dark:border-white/8 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📋</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No forms yet</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 max-w-sm mx-auto">
            Create your first form and start capturing leads with independent source tracking.
          </p>
          <Link href="/dashboard/forms/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20">
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <div key={form.id}
              className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-5 flex items-center justify-between hover:shadow-md dark:hover:shadow-black/20 hover:border-gray-200 dark:hover:border-white/12 transition-all group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{form.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight ${
                    form.status === 'active'
                      ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-500'
                  }`}>
                    {form.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
                {form.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2 truncate pr-4">{form.description}</p>
                )}
                <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-slate-500">
                   <span className="flex items-center gap-1">📊 {form.fields?.length ?? 0} fields</span>
                   <span className="flex items-center gap-1">📅 {new Date(form.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <FormActions formId={form.id} status={form.status} />
            </div>
          ))}
          
          {!isPro && forms.length >= formLimit && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">⭐</span>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">You&apos;ve reached the free form limit.</p>
              </div>
              <Link href="/dashboard/billing" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Upgrade to Pro →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}