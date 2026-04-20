'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Invalid login')) setError('Incorrect email or password. Please try again.')
      else if (error.message.includes('Email not confirmed')) setError('Please verify your email first. Check your inbox.')
      else setError(error.message)
      setLoading(false); return
    }
    router.push('/dashboard'); router.refresh()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleLogin() }

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setError('Please enter your email'); return }
    setForgotLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setForgotLoading(false)
    if (error) setError(error.message)
    else setForgotSent(true)
  }

  const inputClass = "w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition"

  if (showForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e1117] px-4">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/8 p-8 rounded-2xl shadow-xl dark:shadow-black/40 w-full max-w-md">
          {forgotSent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                We sent a password reset link to <strong className="dark:text-slate-300">{forgotEmail}</strong>
              </p>
              <button
                onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Enter your email and we&apos;ll send you a reset link.</p>
              {error && <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 p-3 rounded-xl mb-4 text-sm">{error}</div>}
              <div className="space-y-4">
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                  className={inputClass} placeholder="you@example.com" autoFocus />
                <button onClick={handleForgotPassword} disabled={forgotLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 transition shadow-sm shadow-blue-500/20">
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button onClick={() => { setShowForgot(false); setError('') }}
                  className="w-full text-center text-gray-500 dark:text-slate-400 text-sm hover:text-gray-700 dark:hover:text-slate-300">
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e1117] px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/8 p-8 rounded-2xl shadow-xl dark:shadow-black/40 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">F</div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">FormTrack</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown} className={inputClass} placeholder="you@example.com"
              autoComplete="email" autoFocus />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
              <button onClick={() => { setShowForgot(true); setError(''); setForgotEmail(email) }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </button>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} className={inputClass} placeholder="••••••••"
              autoComplete="current-password" />
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 transition shadow-sm shadow-blue-500/20 mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}