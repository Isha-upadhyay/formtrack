'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, BarChart3, Users, PieChart, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

const LeadChart = dynamic(() => import('@/components/dashboard/LeadChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />
})

interface Lead {
  id: string
  created_at: string
  utm_source: string | null
  source_summary: string | null
  data: any
}

export default function AnalyticsClient({ form, leads }: { form: any, leads: Lead[] }) {
  const [days, setDays] = useState(7)

  // Submissions over time
  const chartData = useMemo(() => {
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    return dates.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      leads: leads.filter(l => l.created_at.startsWith(date)).length
    }))
  }, [leads, days])

  // Source breakdown
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {}
    leads.forEach(l => {
      const source = l.utm_source || l.source_summary || 'Direct / Unknown'
      counts[source] = (counts[source] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [leads])

  const totalSubmissions = leads.length
  const recentSubmissions = chartData.reduce((acc, curr) => acc + curr.leads, 0)

  return (
    <div className="p-6 md:p-8 w-full space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/forms" 
            className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-syne flex items-center gap-3 text-foreground dark:text-white">
              Form Analytics
              <span className="text-xs font-black px-2 py-0.5 bg-indigo-600/10 text-indigo-600 rounded-md uppercase tracking-widest">{form.name}</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Track performance, sources, and conversion data.</p>
          </div>
        </div>

        <select 
          className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-foreground dark:text-white outline-none cursor-pointer"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Submissions" value={totalSubmissions} icon={<Users className="w-4 h-4" />} color="blue" />
        <StatsCard label={`Submissions (Last ${days}d)`} value={recentSubmissions} icon={<TrendingUp className="w-4 h-4" />} color="green" />
        <StatsCard label="Unique Sources" value={sourceData.length} icon={<PieChart className="w-4 h-4" />} color="indigo" />
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-[#0d1117] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
              <BarChart3 className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-lg font-bold font-syne text-foreground dark:text-white">Submissions Over Time</h2>
             <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Trend Analysis</p>
           </div>
        </div>
        <div className="h-[300px] w-full">
           <LeadChart data={chartData} />
        </div>
      </div>

      {/* Source Breakdown & AI Teaser */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0d1117] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-sm">
           <h2 className="text-lg font-bold font-syne text-foreground dark:text-white mb-6">Top Traffic Sources</h2>
           <div className="space-y-4">
             {sourceData.length > 0 ? sourceData.map((src, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                 <span className="text-sm font-bold text-foreground dark:text-white truncate pr-4">{src.name}</span>
                 <span className="text-xs font-black bg-blue-600/10 text-blue-600 px-3 py-1 rounded-lg">{src.value} leads</span>
               </div>
             )) : (
               <p className="text-sm text-muted-foreground">No source data available yet.</p>
             )}
           </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2rem] shadow-lg text-white flex flex-col justify-center relative overflow-hidden group cursor-not-allowed">
           <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />
           
           <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Sparkles className="w-6 h-6 text-white" />
           </div>
           <h2 className="text-2xl font-black font-syne mb-2 relative z-10">AI Insights</h2>
           <p className="text-white/80 text-sm font-medium leading-relaxed mb-6 relative z-10">
             Unlock deep analysis of your form fields. See exactly where users drop off, average completion times, and data quality scores.
           </p>
           <button disabled className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all w-fit relative z-10">
             Coming Soon
           </button>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) {
  const colors: any = {
    blue: 'bg-blue-600/10 text-blue-600',
    indigo: 'bg-indigo-600/10 text-indigo-600',
    green: 'bg-green-600/10 text-green-600',
    amber: 'bg-amber-600/10 text-amber-600'
  }
  return (
    <div className="bg-white dark:bg-[#0d1117] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm flex items-center gap-4 hover:border-blue-500/20 transition-all">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
          <p className="text-2xl font-black tracking-tighter text-foreground dark:text-white">{value}</p>
       </div>
    </div>
  )
}
