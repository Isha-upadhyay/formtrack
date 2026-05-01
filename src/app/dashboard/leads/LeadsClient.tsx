'use client'

import { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  Calendar, 
  ExternalLink, 
  Target, 
  MousePointer2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Inbox,
  Sparkles
} from 'lucide-react'

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
const PAGE_SIZE = 12

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

  const filterInputClass = "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight font-syne">Leads</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Track and manage {leads.length} leads across your {forms.length} forms.
          </p>
        </div>
        
        <button 
          onClick={exportCSV} 
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/8 text-sm font-bold rounded-2xl transition-all shadow-sm disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Modern Filter Bar */}
      <div className="glass dark:bg-white/5 p-4 rounded-[2rem] border border-white/5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name, email, or source..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${filterInputClass} w-full pl-11`} 
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={formFilter} onChange={e => setFormFilter(e.target.value)} className={filterInputClass}>
              <option value="all">All Forms</option>
              {forms.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className={filterInputClass}>
              <option value="all">All Sources</option>
              <option value="direct">Direct Traffic</option>
              {uniqueSources.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <div className="flex items-center gap-2">
               <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={filterInputClass} />
               <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">to</span>
               <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={filterInputClass} />
            </div>
            {hasFilters && (
              <button 
                onClick={clearFilters} 
                className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 glass dark:bg-white/5 rounded-[3rem] border border-dashed border-gray-300 dark:border-white/10 text-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-6">
            <Inbox className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No leads found</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            {leads.length === 0 
              ? "Share your forms to start collecting lead data." 
              : "Try adjusting your filters to find what you're looking for."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map(lead => {
            const firstEmail = Object.entries(lead.data).find(([k]) => k.toLowerCase().includes('email'))?.[1]
            const firstName = Object.entries(lead.data).find(([k]) => k.toLowerCase().includes('name'))?.[1]
            
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="group relative glass dark:bg-white/5 p-6 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer hover:shadow-xl hover:shadow-blue-500/5 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                        {(firstName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                         <h3 className="font-bold text-lg truncate pr-2">{firstName || 'Unknown Lead'}</h3>
                         <p className="text-xs text-muted-foreground truncate">{firstEmail || lead.id.slice(0, 8)}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {lead.forms?.name}
                      </span>
                      {lead.utm_source ? (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full capitalize">
                          {lead.utm_source}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-400/10 px-2 py-0.5 rounded-full">
                          Direct
                        </span>
                      )}
                   </div>
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl p-4 mb-6 relative overflow-hidden group-hover:bg-blue-500/5 transition-colors">
                   <Target className="absolute -right-4 -bottom-4 w-16 h-16 text-blue-500/5" />
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                     <Sparkles className="w-3 h-3" />
                     Smart Summary
                   </p>
                   <p className="text-sm font-medium leading-relaxed">
                     {lead.source_summary || "Direct visit — independently verified lead."}
                   </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                   <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </div>
                   <button className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                     View Details <ChevronRight className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-10">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-30 transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Premium Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedLead(null)} />
          <div className="relative glass dark:bg-[#0d1117] border border-white/10 rounded-[3rem] shadow-3xl w-full max-w-2xl max-h-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
                  {(Object.entries(selectedLead.data).find(([k]) => k.toLowerCase().includes('name'))?.[1] || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black font-syne tracking-tight pr-8">Lead Insight</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Captured on {new Date(selectedLead.created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all group">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {/* Source Highlight */}
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                 <Sparkles className="absolute top-[-10px] right-[-10px] w-32 h-32 text-white/10 rotate-12" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Verified Source Summary</p>
                 <p className="text-lg font-bold leading-relaxed">
                   {selectedLead.source_summary || "Direct visit — This lead arrived without any external campaign tracking."}
                 </p>
              </div>

              {/* Form Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(selectedLead.data).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gray-50 dark:bg-white/5 border border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{getLabel(selectedLead.forms?.fields, key)}</p>
                    <p className="font-bold text-foreground break-all">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* UTM Details Section */}
              {(selectedLead.utm_source || selectedLead.utm_medium) && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Campaign Parameters</p>
                   <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Source', value: selectedLead.utm_source },
                        { label: 'Medium', value: selectedLead.utm_medium },
                        { label: 'Campaign', value: selectedLead.utm_campaign },
                        { label: 'Content', value: selectedLead.utm_content },
                      ].filter(i => i.value).map(item => (
                        <div key={item.label} className="flex justify-between items-center px-4 py-3 bg-white dark:bg-white/3 border border-white/5 rounded-xl">
                          <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                          <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">{item.value}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Source Page */}
              {selectedLead.source_url && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Conversion Page</p>
                   <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center gap-3 overflow-hidden">
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-[11px] font-medium text-muted-foreground truncate italic">{selectedLead.source_url}</p>
                   </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-white/5 flex items-center justify-between bg-gray-50 dark:bg-white/3">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Independently Verified by FormTrack</span>
               </div>
               <button 
                onClick={() => setSelectedLead(null)}
                className="px-6 py-3 bg-foreground text-background font-black text-xs rounded-xl hover:opacity-90 transition-opacity"
               >
                Close Insights
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}