import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: formsRaw } = await supabase.from('forms').select('id, name, status, created_at') as any
  const { data: leadsRaw } = await supabase.from('leads').select('id, created_at, utm_source, source_summary, data, forms(name)') as any

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

  const cardClass = "bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-6"

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Hello, {user?.email?.split('@')[0]}! Here&apos;s how your forms are performing.</p>
        </div>
        <Link href="/dashboard/forms/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm shadow-blue-500/20">
          <span>+</span> Create Form
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">📊</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${leadTrend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {leadTrend >= 0 ? '↑' : '↓'} {Math.abs(leadTrend)}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">Leads this week</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{leadsThisWeek}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">vs {leadsLastWeek} last week</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">👥</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalLeads}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{leadsToday} arrived today</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">📋</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">Active Forms</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeForms}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">out of {totalForms} total</p>
        </div>
      </div>

      {/* Charts & Top Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Breakdown Chart */}
        <div className={cardClass}>
          <h2 className="font-bold text-gray-900 dark:text-white mb-6">Lead Sources</h2>
          {totalLeads > 0 ? (
            <div className="space-y-5">
              {sourceBreakdown.map(([src, count]) => (
                <div key={src}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-gray-700 dark:text-slate-300 font-medium capitalize">{src}</span>
                    <span className="text-sm text-gray-500">{count} leads</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / totalLeads) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 text-sm">No data available yet</p>
            </div>
          )}
        </div>

        {/* Top Performing Forms */}
        <div className={cardClass}>
          <h2 className="font-bold text-gray-900 dark:text-white mb-6">Top Performing Forms</h2>
          {topForms.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {topForms.map(([name, count], i) => (
                <div key={name} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{count} leads</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 text-sm">Create forms to see analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads Feed */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link href="/dashboard/leads" className="text-blue-600 text-sm font-semibold hover:underline">View all</Link>
        </div>
        {leads.length > 0 ? (
          <div className="space-y-4">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/4 transition group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <span className="text-lg">📧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {lead.data.email || lead.data.name || 'New Lead'}
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                    {lead.forms.name} · {lead.source_summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm">No recent activity detected.</p>
          </div>
        )}
      </div>
    </div>
  )
}