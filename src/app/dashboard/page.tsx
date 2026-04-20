import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: formsRaw } = await supabase.from('forms').select('id, name, is_active, created_at') as any
  const { data: leadsRaw } = await supabase.from('leads').select('id, created_at, utm_source, source_summary') as any

  const forms = (formsRaw ?? []) as Array<{ id: string; name: string; is_active: boolean; created_at: string }>
  const leads = (leadsRaw ?? []) as Array<{ id: string; created_at: string; utm_source?: string; source_summary?: string }>

  const totalForms = forms.length
  const activeForms = forms.filter(f => f.is_active).length
  const totalLeads = leads.length
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const leadsToday = leads.filter(l => new Date(l.created_at) >= today).length

  const sourceMap: Record<string, number> = {}
  leads.forEach(l => {
    const src = l.utm_source || 'Direct'
    sourceMap[src] = (sourceMap[src] || 0) + 1
  })
  const sourceBreakdown = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const last7: { label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const count = leads.filter(l => { const t = new Date(l.created_at); return t >= d && t < next }).length
    last7.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }), count })
  }
  const maxCount = Math.max(...last7.map(d => d.count), 1)

  const isNewUser = totalForms === 0 && totalLeads === 0

  return (
    <div className="p-6 md:p-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Welcome back, {user?.email?.split('@')[0]}</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition hidden sm:flex items-center gap-2 shadow-sm shadow-blue-500/20"
        >
          <span className="text-base leading-none">+</span> New Form
        </Link>
      </div>

      {/* New user onboarding banner */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 rounded-2xl p-6 mb-8 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-xl mb-1">👋 Let&apos;s get you set up!</h2>
              <p className="text-blue-100 text-sm mb-4 max-w-md">
                Create your first form, embed it on your website, and start tracking where every lead comes from.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/dashboard/forms/new"
                  className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
                >
                  Create First Form →
                </Link>
                <Link
                  href="/onboarding"
                  className="border border-blue-400/60 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500/40 transition"
                >
                  View Setup Guide
                </Link>
              </div>
            </div>
            <div className="text-5xl hidden md:block">🚀</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Forms', value: totalForms, icon: '📋', href: '/dashboard/forms', color: 'blue' },
          { label: 'Active Forms', value: activeForms, icon: '✅', href: '/dashboard/forms', color: 'green' },
          { label: 'Total Leads', value: totalLeads, icon: '👥', href: '/dashboard/leads', color: 'purple' },
          { label: 'Leads Today', value: leadsToday, icon: '⚡', href: '/dashboard/leads', color: 'amber' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white dark:bg-[#1c2128] rounded-2xl p-5 border border-gray-100 dark:border-white/8 shadow-sm hover:shadow-md dark:hover:shadow-black/20 hover:border-blue-100 dark:hover:border-blue-500/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      {totalLeads > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar chart */}
          <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Leads — Last 7 Days</h2>
            <div className="flex items-end gap-2 h-36">
              {last7.map((day) => (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{day.count > 0 ? day.count : ''}</span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${(day.count / maxCount) * 100}%`,
                      minHeight: day.count > 0 ? '4px' : '2px',
                      backgroundColor: day.count > 0 ? '#3b82f6' : '#e5e7eb'
                    }}
                  />
                  <span className="text-xs text-gray-400 dark:text-slate-600 text-center leading-tight">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source breakdown */}
          <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Leads by Source</h2>
            <div className="space-y-3">
              {sourceBreakdown.map(([src, count]) => (
                <div key={src}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-slate-300 font-medium capitalize">{src}</span>
                    <span className="text-sm text-gray-500 dark:text-slate-500">{count} ({Math.round(count / totalLeads * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/8 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(count / totalLeads) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !isNewUser && (
        <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-10 text-center mb-6">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-semibold text-gray-700 dark:text-slate-300 mb-1">No leads yet</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">Share your form link or embed it to start getting leads</p>
          <Link href="/dashboard/forms" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View your forms →</Link>
        </div>
      )}

      {/* Recent Forms */}
      {forms.length > 0 && (
        <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/8 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Your Forms</h2>
            <Link href="/dashboard/forms" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {forms.slice(0, 5).map((form) => (
              <div key={form.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/4 transition">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{form.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Created {new Date(form.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${form.is_active
                    ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-slate-400'}`}>
                    {form.is_active ? '● Active' : '○ Inactive'}
                  </span>
                  <Link href={`/dashboard/forms/${form.id}/edit`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}