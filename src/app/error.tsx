'use client'

import { useEffect } from 'react'

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="glass-card max-w-lg w-full p-10 rounded-[3rem] text-center relative z-10 border-red-500/10 shadow-2xl shadow-red-500/5">
        <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
          <span className="text-4xl">⚠️</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black font-syne tracking-tight mb-4">
          Oops! System Error
        </h1>
        <p className="text-muted-foreground text-sm font-medium mb-10 leading-relaxed">
          We encountered an unexpected anomaly. Don't worry, our engineers have been notified and your data is safe.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-foreground text-background hover:opacity-90 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="w-full sm:w-auto bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  )
}
