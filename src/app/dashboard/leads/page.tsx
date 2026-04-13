import { createClient } from '@/lib/supabase/server'

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: leadsRaw } = await (supabase.from('leads') as any)
    .select('*, forms(name, fields)')
    .order('created_at', { ascending: false }) as any

  const leads = (leadsRaw ?? []) as Array<{
    id: string
    data: Record<string, string>
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    source_summary?: string
    source_url?: string
    created_at: string
    forms?: { name: string; fields: Array<{ id: string; label: string }> }
  }>

  // Helper — get proper label from field id
  const getLabel = (
    fields: Array<{ id: string; label: string }> | undefined,
    key: string
  ) => {
    if (!fields) return key
    const field = fields.find(f => f.id === key)
    return field ? field.label : key
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            {leads.length} total lead{leads.length !== 1 ? 's' : ''} captured
          </p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No leads yet</h2>
          <p className="text-gray-500 text-sm">
            Share your form link or embed it on your website to start capturing leads
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {lead.forms?.name || 'Unknown Form'}
                    </span>
                    {lead.utm_source ? (
                      <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {lead.utm_source}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Direct
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    🎯 {lead.source_summary || 'Direct visit — no campaign tracking detected'}
                  </p>
                </div>
                <p className="text-xs text-gray-400 ml-4 flex-shrink-0">
                  {new Date(lead.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Lead Data — proper labels */}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(lead.data).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5">
                      {getLabel(lead.forms?.fields, key)}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {value || '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* UTM Details */}
              {(lead.utm_medium || lead.utm_campaign || lead.source_url) && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-4">
                  {lead.utm_medium && (
                    <p className="text-xs text-gray-400">
                      Medium: <span className="text-gray-600 font-medium">{lead.utm_medium}</span>
                    </p>
                  )}
                  {lead.utm_campaign && (
                    <p className="text-xs text-gray-400">
                      Campaign: <span className="text-gray-600 font-medium">{lead.utm_campaign}</span>
                    </p>
                  )}
                  {lead.source_url && (
                    <p className="text-xs text-gray-400 truncate max-w-xs">
                      Source: <span className="text-gray-600 font-medium">{lead.source_url}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}