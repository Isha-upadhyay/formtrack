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
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const clearFilters = () => { setSearch(''); setFormFilter('all'); setSourceFilter('all'); setDateFrom(''); setDateTo('') }
  const hasFilters = search || formFilter !== 'all' || sourceFilter !== 'all' || dateFrom || dateTo

  const filterInputClass = "border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition"

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {filtered.length} of {leads.length} lead{leads.length !== 1 ? 's' : ''}
            {filtered.length !== leads.length ? ' (filtered)' : ' total'}
          </p>
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-white dark:bg-[#1c2128] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="🔍 Search name, email, source..." value={search}
            onChange={e => setSearch(e.target.value)}
            className={`flex-1 min-w-0 ${filterInputClass}`} />
          <select value={formFilter} onChange={e => setFormFilter(e.target.value)} className={filterInputClass}>
            <option value="all">All Forms</option>
            {forms.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className={filterInputClass}>
            <option value="all">All Sources</option>
            <option value="direct">Direct</option>
            {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={filterInputClass} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={filterInputClass} />
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 px-2 transition">✕ Clear</button>
          )}
        </div>
      </div>

      {/* Leads list */}
      {paginated.length === 0 ? (
        <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {leads.length === 0 ? 'No leads yet' : 'No leads match filters'}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
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
                className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-5 cursor-pointer hover:border-blue-200 dark:hover:border-blue-500/40 hover:shadow-md dark:hover:shadow-black/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        {lead.forms?.name || 'Unknown Form'}
                      </span>
                      {lead.utm_source ? (
                        <span className="text-xs font-semibold bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full capitalize">{lead.utm_source}</span>
                      ) : (
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full">Direct</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 font-medium truncate">
                      🎯 {lead.source_summary || 'Direct visit — no campaign tracking detected'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(lead.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="text-xs text-blue-500 dark:text-blue-400 font-medium group-hover:underline">View →</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(lead.data).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{getLabel(lead.forms?.fields, key)}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value || '—'}</p>
                    </div>
                  ))}
                  {Object.keys(lead.data).length > 3 && (
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2 flex items-center justify-center">
                      <span className="text-xs text-gray-400 dark:text-slate-500">+{Object.keys(lead.data).length - 3} more fields</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-white/8">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 text-sm rounded-xl transition ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                      {p}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition">
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
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-[#1c2128] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/8">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">Lead Details</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {new Date(selectedLead.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedLead(null)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 transition text-xl leading-none">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Source */}
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Source</p>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  🎯 {selectedLead.source_summary || 'Direct visit — no campaign tracking detected'}
                </p>
              </div>

              {/* Form fields */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-3">Form Data</p>
                <div className="space-y-3">
                  {Object.entries(selectedLead.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 dark:border-white/5 last:border-0">
                      <span className="text-sm text-gray-500 dark:text-slate-400 shrink-0">{getLabel(selectedLead.forms?.fields, key)}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* UTM details */}
              {(selectedLead.utm_source || selectedLead.utm_medium || selectedLead.utm_campaign || selectedLead.utm_term || selectedLead.utm_content) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-3">UTM Parameters</p>
                  <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 rounded-xl p-4 space-y-2">
                    {[
                      ['Source', selectedLead.utm_source],
                      ['Medium', selectedLead.utm_medium],
                      ['Campaign', selectedLead.utm_campaign],
                      ['Term', selectedLead.utm_term],
                      ['Content', selectedLead.utm_content],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-slate-400">{label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source URL */}
              {selectedLead.source_url && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">Source Page</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 rounded-xl px-3 py-2 break-all">{selectedLead.source_url}</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 border-t border-gray-100 dark:border-white/8 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
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