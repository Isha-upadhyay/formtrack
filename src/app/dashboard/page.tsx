import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: formsRaw } = await supabase.from('forms').select('*') as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leadsRaw } = await supabase.from('leads').select('*') as any

  const forms = (formsRaw ?? []) as Array<{ id: string; name: string; is_active: boolean; created_at: string }>
  const leads = (leadsRaw ?? []) as Array<{ id: string; created_at: string; utm_source?: string; source_summary?: string }>

  const totalForms = forms.length
  const activeForms = forms.filter(f => f.is_active).length
  const totalLeads = leads.length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const leadsToday = leads.filter(l => new Date(l.created_at) >= today).length

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Forms', value: totalForms, icon: '📋' },
          { label: 'Active Forms', value: activeForms, icon: '✅' },
          { label: 'Total Leads', value: totalLeads, icon: '👥' },
          { label: 'Leads Today', value: leadsToday, icon: '⚡' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <Link href="/dashboard/forms/new"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm">
            + Create New Form
          </Link>
          <Link href="/dashboard/leads"
            className="border border-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
            View All Leads
          </Link>
        </div>
      </div>

      {/* Recent Forms */}
      {forms.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Forms</h2>
            <Link href="/dashboard/forms" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {forms.slice(0, 5).map((form) => (
              <div key={form.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{form.name}</p>
                  <p className="text-xs text-gray-400">{new Date(form.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    form.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Link href={`/dashboard/forms/${form.id}/edit`}
                    className="text-xs text-blue-600 hover:underline">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}