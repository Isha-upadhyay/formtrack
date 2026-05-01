import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  Layout, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight,
  MousePointer2,
  Mail,
  Zap,
  Target
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Profile check & safety
  const { data: profile } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/onboarding')

  // Fetch data limited to org
  const { data: formsRaw } = await (supabase.from('forms') as any).select('id, name, status, created_at').eq('org_id', profile.org_id)
  const { data: leadsRaw } = await (supabase.from('leads') as any).select('id, created_at, utm_source, source_summary, data, forms(name)').eq('org_id', profile.org_id)

  const forms = (formsRaw ?? []) as Array<{ id: string; name: string; status: string; created_at: string }>
  const leads = (leadsRaw ?? []) as Array<{ id: string; created_at: string; utm_source?: string; source_summary?: string; data: any; forms: { name: string } }>

  const totalForms = forms.length
  const activeForms = forms.filter(f => f.status === 'active').length
  const totalLeads = leads.length
  
  // Stats calculations
  const now = new Date()
  const todayStart = new Date(now.setHours(0, 0, 0, 0))
  const leadsToday = leads.filter(l => new Date(l.created_at) >= todayStart).length

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  
  const leadsThisWeek = leads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length
  const leadsLastWeek = leads.filter(l => {
    const d = new Date(l.created_at)
    return d >= fourteenDaysAgo && d < sevenDaysAgo
  }).length
  
  const leadTrend = leadsLastWeek === 0 ? 100 : Math.round(((leadsThisWeek - leadsLastWeek) / leadsLastWeek) * 100)

  // Top performing forms
  const formLeadsMap: Record<string, number> = {}
  leads.forEach(l => { if (l.forms?.name) formLeadsMap[l.forms.name] = (formLeadsMap[l.forms.name] || 0) + 1 })
  const topForms = Object.entries(formLeadsMap).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Source breakdown
  const sourceMap: Record<string, number> = {}
  leads.forEach(l => {
    const src = l.utm_source || 'Direct'
    sourceMap[src] = (sourceMap[src] || 0) + 1
  })
  const sourceBreakdown = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-syne">Overview</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back, <span className="text-foreground font-bold">{user.email?.split('@')[0]}</span>. Here&apos;s your growth summary.
          </p>
        </div>
        
        <Link 
          href="/dashboard/forms/new" 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create New Form
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          label="Leads this week"
          value={leadsThisWeek}
          trend={leadTrend}
          subValue={`vs ${leadsLastWeek} last week`}
          color="blue"
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          label="Total Leads"
          value={totalLeads}
          subValue={`${leadsToday} arrived today`}
          color="indigo"
        />
        <StatCard 
          icon={<Layout className="w-6 h-6 text-purple-600" />}
          label="Active Forms"
          value={activeForms}
          subValue={`out of ${totalForms} total`}
          color="purple"
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Breakdown */}
        <div className="glass dark:bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-2 mb-8">
             <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
             </div>
             <h2 className="text-xl font-bold font-syne">Lead Sources</h2>
          </div>
          
          {totalLeads > 0 ? (
            <div className="space-y-6">
              {sourceBreakdown.map(([src, count]) => (
                <div key={src} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold capitalize">{src} Traffic</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{count} Leads</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(count / totalLeads) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No lead data captured yet." />
          )}
        </div>

        {/* Top Forms */}
        <div className="glass dark:bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center gap-2 mb-8">
             <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
             </div>
             <h2 className="text-xl font-bold font-syne">Top Performing Forms</h2>
          </div>
          
          {topForms.length > 0 ? (
            <div className="space-y-4">
              {topForms.map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-xs font-black shadow-sm">
                      {i + 1}
                    </div>
                    <span className="font-bold group-hover:text-blue-600 transition-colors">{name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{count}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leads</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Launch forms to see top performance." />
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass dark:bg-white/5 p-8 rounded-[3rem] border border-white/5">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                 <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold font-syne">Recent Activity</h2>
           </div>
           <Link href="/dashboard/leads" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 group">
             View All Leads <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
           </Link>
        </div>

        {leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 p-5 bg-white dark:bg-white/5 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                   <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-bold truncate">
                        {lead.data.email || lead.data.name || 'Anonymous Lead'}
                      </p>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                   </div>
                   <p className="text-xs text-muted-foreground truncate mt-1">
                     via <span className="text-foreground font-bold">{lead.forms.name}</span> · {lead.source_summary}
                   </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center glass-light dark:bg-white/3 rounded-[2.5rem]">
             <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No recent activity detected.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend, subValue, color }: { 
  icon: React.ReactNode, label: string, value: number, trend?: number, subValue: string, color: 'blue' | 'indigo' | 'purple' 
}) {
    const colors = {
      blue: 'bg-blue-600/5',
      indigo: 'bg-indigo-600/5',
      purple: 'bg-purple-600/5'
    }
    
    return (
      <div className="glass dark:bg-white/5 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 ${colors[color]} blur-[60px] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm">
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
              trend >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
            }`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
        <p className="text-4xl font-black tracking-tighter mb-4">{value}</p>
        <p className="text-xs font-bold text-muted-foreground opacity-60 italic">{subValue}</p>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center text-center">
       <MousePointer2 className="w-8 h-8 text-muted-foreground/30 mb-4 animate-bounce" />
       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{message}</p>
    </div>
  )
}