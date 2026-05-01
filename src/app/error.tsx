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
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Something went wrong!</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition w-full sm:w-auto"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 text-sm font-medium"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
