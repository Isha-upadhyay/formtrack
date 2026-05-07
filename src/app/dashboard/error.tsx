'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-8 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-red-500/10 text-red-600 rounded-[2rem] flex items-center justify-center border border-red-500/20 shadow-xl shadow-red-500/5">
        <AlertCircle className="w-12 h-12" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-black font-syne tracking-tighter">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md mx-auto font-medium">
          We encountered an unexpected error while loading your dashboard. Don't worry, your data is safe.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
        
        <Link
          href="/"
          className="flex items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-white/5 text-foreground text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-transparent"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {error.digest && (
        <p className="text-[10px] font-mono text-muted-foreground opacity-50 uppercase tracking-widest">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
