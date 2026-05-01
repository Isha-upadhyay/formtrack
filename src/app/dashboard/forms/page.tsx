import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import FormActions from './FormActions'
import { Plus, Layout, Calendar, MousePointer2, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react'

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return <div>Unauthorized</div>

  // Fetch profile and org info
  const { data: profile } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).single()
  
  if (!profile?.org_id) {
    const { redirect } = await import('next/navigation')
    redirect('/onboarding')
  }

  const { data: org } = await (supabase.from('orgs') as any).select('plan, leads_used_this_month').eq('id', profile.org_id).single()
  const { data: formsRaw } = await (supabase.from('forms') as any).select('*').eq('org_id', profile.org_id).order('created_at', { ascending: false })
  
  const forms = (formsRaw ?? []) as Array<{
    id: string; name: string; description: string; status: string; created_at: string; fields: any[]
  }>
  
  const isPro = org?.plan === 'pro'
  const formLimit = 2
  const usagePercent = Math.min((forms.length / formLimit) * 100, 100)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-syne">My Forms</h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-lg">
            Create high-converting lead capture forms and track their sources in real-time.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          {!isPro && (
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <span>Free Plan Usage</span>
                <span className="text-foreground">{forms.length} / {formLimit}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${usagePercent >= 100 ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          )}
          <Link 
            href="/dashboard/forms/new"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </Link>
        </div>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 glass-card dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/10 text-center animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8">
            <Layout className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black mb-3 font-syne">Ready to grow?</h2>
          <p className="text-muted-foreground max-w-sm mb-10 text-base font-medium">
            Deploy your first form and start decoding your lead sources with precision English insights.
          </p>
          <Link 
            href="/dashboard/forms/new"
            className="px-10 py-4 bg-foreground text-background font-black rounded-2xl hover:opacity-90 transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            Start Capturing Leads <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {forms.map((form) => (
            <div 
              key={form.id}
              className="group glass-card dark:bg-white/5 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                   <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm">
                      <Layout className="w-6 h-6 text-blue-600" />
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-2xl font-black tracking-tight truncate group-hover:text-blue-600 transition-colors font-syne">
                        {form.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          form.status === 'active'
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                          {form.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                          ID: {form.id.slice(0, 8)}
                        </span>
                      </div>
                   </div>
                </div>
                
                {form.description && (
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2 max-w-2xl font-medium leading-relaxed">
                    {form.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/5 rounded-xl">
                        <Plus className="w-4 h-4 text-blue-600" />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest">{form.fields?.length ?? 0} Fields</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-500/5 rounded-xl">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest">Added {new Date(form.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <Link href={`/f/${form.id}`} target="_blank" className="flex items-center gap-3 group/link">
                     <div className="p-2 bg-purple-500/5 rounded-xl group-hover/link:bg-purple-500/10 transition-colors">
                        <MousePointer2 className="w-4 h-4 text-purple-500" />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest group-hover/link:text-purple-600 transition-colors">Live Page</p>
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <FormActions formId={form.id} status={form.status} />
              </div>
            </div>
          ))}

          {!isPro && forms.length >= formLimit && (
            <div className="mt-12 p-8 glass-card border-amber-500/20 bg-amber-500/5 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-amber-500/5 rotate-12 transition-transform group-hover:scale-125" />
              <div className="flex items-center gap-6 text-center md:text-left relative z-10">
                <div className="w-16 h-16 bg-amber-500/20 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xl font-black font-syne text-amber-900 dark:text-amber-400">Limit Reached</h4>
                  <p className="text-sm font-bold text-amber-800/60 dark:text-amber-500/60 max-w-md mt-1">Upgrade to Pro to create unlimited forms and track every single lead source with precision.</p>
                </div>
              </div>
              <button className="relative z-10 px-10 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 whitespace-nowrap uppercase tracking-widest text-xs">
                Unlock Unlimited Forms
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}