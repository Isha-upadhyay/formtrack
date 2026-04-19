'use client'

import { useState, useMemo } from 'react'

interface LeadRow {
  id: string
  data: Record<string, string>
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  source_summary?: string
  source_url?: string
  created_at: string
  forms?: { name: string; fields?: Array<{ id: string; label: string }> }
}

interface FormOption { id: string; name: string }

const PAGE_SIZE = 20

export default function LeadsClient({ leads, forms }: { leads: LeadRow[]; forms: FormOption[] }) {
  const [search, setSearch] = useState('')
  const [formFilter, setFormFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null)

  const getLabel = (fields: Array<{ id: string; label: string }> | undefined, key: string) =>
    fields?.find(f => f.id === key)?.label ?? key

  const uniqueSources = useMemo(() => {
    const s = new Set<string>()
    leads.forEach(l => { if (l.utm_source) s.add(l.utm_source) })
    return Array.from(s)
  }, [leads])

  const filtered = useMemo(() => {
    setPage(1)
    return leads.filter(lead => {
      if (formFilter !== 'all' && lead.forms?.name !== formFilter) return false
      if (sourceFilter !== 'all') {
        if (sourceFilter === 'direct' && lead.utm_source) return false
        if (sourceFilter !== 'direct' && lead.utm_source !== sourceFilter) return false
      }
      if (dateFrom && new Date(lead.created_at) < new Date(dateFrom)) return false
      if (dateTo) { const to = new Date(dateTo); to.setHours(23, 59, 59); if (new Date(lead.created_at) > to) return false }
      if (search.trim()) {
        const q = search.toLowerCase()
        const inData = Object.values(lead.data).some(v => v?.toLowerCase().includes(q))
        const inSummary = lead.source_summary?.toLowerCase().includes(q)
        const inForm = lead.forms?.name?.toLowerCase().includes(q)
        if (!inData && !inSummary && !inForm) return false
      }
      return true
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, search, formFilter, sourceFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const exportCSV = () => {
    if (filtered.length === 0) return
    const allKeys = new Set<string>()
    filtered.forEach(l => Object.keys(l.data).forEach(k => allKeys.add(k)))
    const firstLead = filtered[0]
    const fieldHeaders = Array.from(allKeys).map(k => getLabel(firstLead.forms?.fields, k))
    const headers = [...fieldHeaders, 'Source Summary', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Source URL', 'Form', 'Submitted At']
    const rows = filtered.map(lead => [
      ...Array.from(allKeys).map(k => lead.data[k] ?? ''),
      lead.source_summary ?? '', lead.utm_source ?? '', lead.utm_medium ?? '',
      lead.utm_campaign ?? '', lead.source_url ?? '', lead.forms?.name ?? '',
      new Date(lead.created_at).toLocaleString('en-IN'),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const clearFilters = () => { setSearch(''); setFormFilter('all'); setSourceFilter('all'); setDateFrom(''); setDateTo('') }
  const hasFilters = search || formFilter !== 'all' || sourceFilter !== 'all' || dateFrom || dateTo

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
            {filtered.length !== leads.length ? ' (filtered)' : ' total'}
          </p>
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition shadow-sm">
          ⬇️ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="🔍 Search name, email, source..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={formFilter} onChange={e => setFormFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Forms</option>
            {forms.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Sources</option>
            <option value="direct">Direct</option>
            {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-gray-600 px-2">✕ Clear</button>
          )}
        </div>
      </div>

      {/* Leads list */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {leads.length === 0 ? 'No leads yet' : 'No leads match filters'}
          </h2>
          <p className="text-gray-500 text-sm">
            {leads.length === 0 ? 'Share your form link or embed it to start capturing leads' : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map(lead => (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {lead.forms?.name || 'Unknown Form'}
                      </span>
                      {lead.utm_source ? (
                        <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{lead.utm_source}</span>
                      ) : (
                        <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Direct</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 font-medium truncate">
                      🎯 {lead.source_summary || 'Direct visit — no campaign tracking detected'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(lead.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="text-xs text-blue-500 font-medium">View →</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(lead.data).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0.5">{getLabel(lead.forms?.fields, key)}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{value || '—'}</p>
                    </div>
                  ))}
                  {Object.keys(lead.data).length > 3 && (
                    <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-center">
                      <span className="text-xs text-gray-400">+{Object.keys(lead.data).length - 3} more fields</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 text-sm rounded-lg transition ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Lead Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selectedLead.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Source */}
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Source</p>
                <p className="text-sm font-medium text-blue-900">
                  🎯 {selectedLead.source_summary || 'Direct visit — no campaign tracking detected'}
                </p>
              </div>

              {/* Form fields */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Form Data</p>
                <div className="space-y-3">
                  {Object.entries(selectedLead.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start gap-4">
                      <span className="text-sm text-gray-500 shrink-0">
                        {getLabel(selectedLead.forms?.fields, key)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 text-right">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* UTM details */}
              {(selectedLead.utm_source || selectedLead.utm_medium || selectedLead.utm_campaign || selectedLead.utm_term || selectedLead.utm_content) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">UTM Parameters</p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {[
                      ['Source', selectedLead.utm_source],
                      ['Medium', selectedLead.utm_medium],
                      ['Campaign', selectedLead.utm_campaign],
                      ['Term', selectedLead.utm_term],
                      ['Content', selectedLead.utm_content],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source URL */}
              {selectedLead.source_url && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Source Page</p>
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 break-all">{selectedLead.source_url}</p>
                </div>
              )}

              {/* Form info */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Form: {selectedLead.forms?.name || 'Unknown'}</span>
                <span>ID: {selectedLead.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}