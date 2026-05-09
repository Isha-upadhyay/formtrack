'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [sent, setSent] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleSession = async () => {
      // 1. Check if we already have a session (Recovery mode)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsRecovery(true)
        return
      }

      // 2. Try to extract token from URL hash manually
      const hash = window.location.hash.substring(1)
      if (hash) {
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          if (!error) {
            setIsRecovery(true)
            return
          }
        }
      }

      // 3. Fallback to event listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setIsRecovery(true)
        }
      })

      return () => subscription.unsubscribe()
    }

    handleSession()
  }, [supabase])

  const handleSendReset = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!password || !confirm) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e1117] p-6">
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/8 p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">✅</div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 font-syne">Password updated!</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Your account is now secure. Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e1117] p-6">
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/8 p-10 rounded-[3rem] shadow-2xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">📧</div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 font-syne">Check your email</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">We've sent a password reset link to <span className="text-foreground font-bold">{email}</span>. Please check your inbox and spam folder.</p>
          <button onClick={() => setSent(false)} className="text-sm font-black uppercase tracking-widest text-blue-600 hover:underline">Try another email</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e1117] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-grid opacity-[0.1]" />
      </div>

      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/8 p-10 rounded-[3rem] shadow-2xl w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">F</div>
          <span className="font-syne font-black text-xl tracking-tighter">FormTrack</span>
        </div>

        <h1 className="text-3xl font-black font-syne tracking-tight mb-2 text-gray-900 dark:text-white">
          {isRecovery ? 'Set new password' : 'Forgot password?'}
        </h1>
        <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">
          {isRecovery 
            ? 'Enter a strong new password for your account below.' 
            : 'No worries! Enter your email and we\'ll send you a recovery link.'}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 p-4 rounded-2xl mb-6 text-xs font-bold animate-in shake duration-500">
             ⚠️ {error}
          </div>
        )}

        <div className="space-y-6">
          {isRecovery ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  className="w-full bg-gray-50 dark:bg-white/[0.03] border-2 border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
                  placeholder="Min. 6 characters"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                  className="w-full bg-gray-50 dark:bg-white/[0.03] border-2 border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
                  placeholder="Re-enter password"
                />
              </div>
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReset()}
                  className="w-full bg-gray-50 dark:bg-white/[0.03] border-2 border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
                  placeholder="name@company.com"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSendReset}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>
              <p className="text-center">
                <Link href="/login" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
