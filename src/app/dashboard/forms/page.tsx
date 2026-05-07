import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Layout, Users, Calendar, ArrowUpRight, BarChart3, Settings2 } from 'lucide-react'

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: formsData } = await supabase
    .from('forms')
    .select(`
      *,
      leads(count)
    `)
    .order('created_at', { ascending: false })

  const forms = formsData || []
  const formLimit = 5
  const usagePercent = Math.min((forms.length / formLimit) * 100, 100)

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Assets</span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-syne text-foreground dark:text-white">My Forms</h1>
          <p className="text-muted-foreground text-sm font-medium">Create and manage your lead capture forms.</p>
        </div>
        
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
           <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl w-full md:w-auto shadow-sm">
              <div className="flex-1 md:w-32">
                 <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Usage</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-blue-600">{forms.length}/{formLimit}</p>
                 </div>
                 <div className="h-1 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${usagePercent}%` }} />
                 </div>
              </div>
              <Link 
                href="/dashboard/forms/new" 
                className="shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </Link>
           </div>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#0d1117] rounded-3xl border-dashed border-2 border-gray-200 dark:border-white/5">
          <div className="w-16 h-16 bg-blue-600/5 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Layout className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">No forms found</h3>
          <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">Start capturing leads by creating your first tracking form in seconds.</p>
          <Link 
            href="/dashboard/forms/new" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Create First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {forms.map((form: any) => (
            <div key={form.id} className="bg-white dark:bg-[#0d1117] p-5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-500/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground dark:text-white group-hover:text-blue-600 transition-colors truncate font-syne">{form.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md">
                       <Users className="w-3 h-3 text-muted-foreground" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 dark:text-white/70">{form.leads[0]?.count || 0} Leads</span>
                     </div>
                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md">
                       <Calendar className="w-3 h-3 text-muted-foreground" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 dark:text-white/70">{new Date(form.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <Link 
                  href={`/dashboard/forms/${form.id}/settings`}
                  className="p-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-muted-foreground hover:text-foreground transition-all border border-gray-100 dark:border-white/5"
                >
                  <Settings2 className="w-4 h-4" />
                </Link>
                <Link 
                  href={`/dashboard/leads?formId=${form.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/20 transition-all shadow-sm"
                >
                  View Leads <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}