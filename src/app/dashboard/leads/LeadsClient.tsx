'use client'

import { useState, useMemo } from 'react'

interface LeadRow {
  id: string
  data: Record<string, string>
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  source_summary?: string
  source_url?: string
  created_at: string
  forms?: { name: string; fields?: Array<{ id: string; label: string }> }
}

interface FormOption { id: string; name: string }

export default function LeadsClient({
  leads, forms
}: {
  leads: LeadRow[]
  forms: FormOption[]
}) {
  const [search, setSearch] = useState('')
  const [formFilter, setFormFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const getLabel = (fields: Array<{ id: string; label: string }> | undefined, key: string) => {
    if (!fields) return key
    return fields.find(f => f.id === key)?.label ?? key
  }

  // Collect unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const s = new Set<string>()
    leads.forEach(l => { if (l.utm_source) s.add(l.utm_source) })
    return Array.from(s)
  }, [leads])

  // Filter leads
  const filtered = useMemo(() => {
    return leads.filter(lead => {
      // Form filter
      if (formFilter !== 'all' && lead.forms?.name !== formFilter) return false
      // Source filter
      if (sourceFilter !== 'all') {
        if (sourceFilter === 'direct' && lead.utm_source) return false
        if (sourceFilter !== 'direct' && lead.utm_source !== sourceFilter) return false
      }
      // Date range
      if (dateFrom && new Date(lead.created_at) < new Date(dateFrom)) return false
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59)
        if (new Date(lead.created_at) > to) return false
      }
      // Text search across all data fields + source summary
      if (search.trim()) {
        const q = search.toLowerCase()
        const inData = Object.values(lead.data).some(v => v?.toLowerCase().includes(q))
        const inSummary = lead.source_summary?.toLowerCase().includes(q)
        const inForm = lead.forms?.name?.toLowerCase().includes(q)
        if (!inData && !inSummary && !inForm) return false
      }
      return true
    })
  }, [leads, search, formFilter, sourceFilter, dateFrom, dateTo])

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (filtered.length === 0) return

    // Build all unique field labels across all leads
    const allFieldKeys = new Set<string>()
    filtered.forEach(l => Object.keys(l.data).forEach(k => allFieldKeys.add(k)))

    const getFieldLabel = (lead: LeadRow, key: string) =>
      getLabel(lead.forms?.fields, key)

    // Use first lead's labels as column headers (best effort)
    const firstLead = filtered[0]
    const fieldHeaders = Array.from(allFieldKeys).map(k => getFieldLabel(firstLead, k))

    const headers = [
      ...fieldHeaders,
      'Source Summary', 'UTM Source', 'UTM Medium', 'UTM Campaign',
      'Source URL', 'Form', 'Submitted At'
    ]

    const rows = filtered.map(lead => {
      const dataVals = Array.from(allFieldKeys).map(k => lead.data[k] ?? '')
      return [
        ...dataVals,
        lead.source_summary ?? '',
        lead.utm_source ?? '',
        lead.utm_medium ?? '',
        lead.utm_campaign ?? '',
        lead.source_url ?? '',
        lead.forms?.name ?? '',
        new Date(lead.created_at).toLocaleString('en-IN'),
      ]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
            {filtered.length !== leads.length ? ' (filtered)' : ' total'}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search name, email, source..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-0 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Form filter */}
        <select
          value={formFilter}
          onChange={e => setFormFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Forms</option>
          {forms.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
        </select>
        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Sources</option>
          <option value="direct">Direct</option>
          {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* Date range */}
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(search || formFilter !== 'all' || sourceFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(''); setFormFilter('all'); setSourceFilter('all'); setDateFrom(''); setDateTo('') }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Leads list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {leads.length === 0 ? 'No leads yet' : 'No leads match filters'}
          </h2>
          <p className="text-gray-500 text-sm">
            {leads.length === 0
              ? 'Share your form link or embed it to start capturing leads'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
                <p className="text-xs text-gray-400 ml-4 shrink-0">
                  {new Date(lead.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(lead.data).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5">
                      {getLabel(lead.forms?.fields, key)}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">{value || '—'}</p>
                  </div>
                ))}
              </div>

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