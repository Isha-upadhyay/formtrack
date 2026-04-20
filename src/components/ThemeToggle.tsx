'use client'

import { useTheme } from '@/lib/theme-context'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none
        ${theme === 'dark'
          ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
          : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
        } ${className}`}
    >
      {/* Sun icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-3.5 h-3.5 transition-all duration-300 ${theme === 'light' ? 'text-amber-500 scale-110' : 'text-slate-500 scale-90'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>

      {/* Toggle pill */}
      <div className={`relative w-8 h-4 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} />
      </div>

      {/* Moon icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-3.5 h-3.5 transition-all duration-300 ${theme === 'dark' ? 'text-blue-300 scale-110' : 'text-gray-400 scale-90'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </button>
  )
}