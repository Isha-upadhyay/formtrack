'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 transition-all duration-500 overflow-hidden shadow-inner group active:scale-90 ${className}`}
      aria-label="Toggle theme"
    >
      <div 
        className={`absolute top-1 left-1 w-5 h-5 rounded-full shadow-lg transform transition-all duration-500 flex items-center justify-center ${
          isDark 
            ? 'translate-x-7 bg-blue-600 text-white' 
            : 'translate-x-0 bg-white text-blue-600'
        }`}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </div>
      
      {/* Subtle Background Glow */}
      <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${isDark ? 'bg-blue-600/40' : 'bg-amber-400/20'}`} />
    </button>
  )
}