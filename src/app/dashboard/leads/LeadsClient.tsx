'use client'

import { useState, useMemo } from 'react'
import { Loader2, Download, Search, Filter, Mail, ArrowUpRight, ChevronRight, TrendingUp, Users, Layout, BarChart3, Sparkles, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchMoreLeads } from './actions'

const LeadChart = dynamic(() => import('@/components/dashboard/LeadChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />
})

interface Lead {
  id: string
  created_at: string
  data: any
  form_id: string
  forms: {
    name: string
  }
}

export default function LeadsClient({ leads: initialLeads, forms }: { leads: Lead[], forms: any[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialLeads.length >= 10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const nextLeads = await fetchMoreLeads(page, 10)
    if (nextLeads.length < 10) {
      setHasMore(false)
    }
    setLeads([...leads, ...nextLeads as any])
    setPage(page + 1)
    setLoadingMore(false)
  }

  const filteredLeads = useMemo(() => {
    return (leads || []).filter(lead => {
      const leadDataStr = JSON.stringify(lead.data || {}).toLowerCase()
      const matchesSearch = leadDataStr.includes(searchQuery.toLowerCase()) || 
                           (lead.forms?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const source = (lead.data?.utm_source || lead.data?.source || 'direct').toLowerCase()
      const matchesSource = filterSource === 'all' || source === filterSource.toLowerCase()
      
      return matchesSearch && matchesSource
    })
  }, [leads, searchQuery, filterSource])

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      leads: (leads || []).filter(l => l.created_at?.startsWith(date)).length
    }))
  }, [leads])

  const exportToCSV = () => {
    const headers = ['Date', 'Form', 'Source', 'Data']
    const rows = filteredLeads.map(l => [
      new Date(l.created_at).toLocaleDateString(),
      l.forms?.name || 'Unknown',
      l.data?.utm_source || l.data?.source || 'direct',
      JSON.stringify(l.data || {}).replace(/"/g, '""')
    ])
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export.csv`
    a.click()
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Analytics</span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-syne text-foreground dark:text-white">Captured Leads</h1>
          <p className="text-muted-foreground text-sm font-medium">View and export your customer acquisition data.</p>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LeadStatsCard label="Total Leads" value={leads?.length || 0} icon={<Users className="w-4 h-4" />} color="blue" />
        <LeadStatsCard label="Forms Active" value={forms?.length || 0} icon={<Layout className="w-4 h-4" />} color="indigo" />
        <LeadStatsCard label="Trend" value="+12%" icon={<TrendingUp className="w-4 h-4" />} color="green" />
        <LeadStatsCard label="AI Ready" value="Active" icon={<Sparkles className="w-4 h-4" />} color="amber" />
      </div>

      <div className="bg-white dark:bg-[#0d1117] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
              <BarChart3 className="w-5 h-5" />
           </div>
           <h2 className="text-lg font-bold font-syne text-foreground dark:text-white">Acquisition Trend</h2>
        </div>
        <div className="h-[300px] w-full">
           <LeadChart data={chartData} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#0d1117] p-4 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search leads..." 
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl pl-11 pr-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="direct">Direct</option>
            <option value="google">Google</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white dark:bg-[#0d1117] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-blue-500/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                   {new Date(lead.created_at).toLocaleDateString()}
                 </span>
              </div>
              <p className="text-sm font-bold truncate mb-4 group-hover:text-blue-600 transition-colors">
                {(lead.data || {}).email || (lead.data || {}).name || 'Anonymous Lead'}
              </p>
              <button 
                onClick={() => setSelectedLead(lead)}
                className="w-full py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all border border-gray-200 dark:border-transparent flex items-center justify-center gap-2"
              >
                View Details <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Load More Leads
            </button>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-[#0d1117] w-full max-w-lg rounded-[2.5rem] p-10 border border-gray-200 dark:border-white/10 shadow-2xl relative">
              <button onClick={() => setSelectedLead(null)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                <ChevronRight className="w-6 h-6 rotate-90" />
              </button>
              <h2 className="text-2xl font-bold mb-8 font-syne text-foreground dark:text-white">Lead Intelligence</h2>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                 {Object.entries(selectedLead.data || {}).map(([key, val]: [string, any]) => (
                   <div key={key} className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{key}</p>
                      <p className="text-sm font-bold break-all">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function LeadStatsCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) {
  const colors: any = {
    blue: 'bg-blue-600/10 text-blue-600',
    indigo: 'bg-indigo-600/10 text-indigo-600',
    green: 'bg-green-600/10 text-green-600',
    amber: 'bg-amber-600/10 text-amber-600'
  }
  return (
    <div className="bg-white dark:bg-[#0d1117] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm flex items-center gap-4">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
          <p className="text-xl font-black tracking-tighter">{value}</p>
       </div>
    </div>
  )
}