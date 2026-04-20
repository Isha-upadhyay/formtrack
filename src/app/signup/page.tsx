'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const router = useRouter()

  const inputClass = "w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition"
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"

  const handleSignup = async () => {
    if (!email || !password || !orgName) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { org_name: orgName },
      }
    })
    if (error) {
      setError(error.message.includes('already registered')
        ? 'This email is already registered. Please sign in instead.'
        : error.message)
      setLoading(false); return
    }
    if (data.user) {
      const slug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        + '-' + data.user.id.slice(0, 6)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('organizations') as any).insert({ name: orgName, slug, owner_id: data.user.id })
      if (data.session) { router.push('/dashboard'); router.refresh() }
      else setVerificationSent(true)
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSignup() }

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e1117] px-4">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/8 p-8 rounded-2xl shadow-xl dark:shadow-black/40 w-full max-w-md text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-2">We sent a confirmation link to</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400 mb-6">{email}</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Click the link to activate your account. Check spam folder if not visible.</p>
          <div className="space-y-3">
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.resend({ type: 'signup', email })
                alert('Verification email resent!')
              }}
              className="w-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              Resend email
            </button>
            <Link href="/login" className="block w-full text-center text-blue-600 dark:text-blue-400 text-sm hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e1117] py-8 px-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/8 p-8 rounded-2xl shadow-xl dark:shadow-black/40 w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">F</div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">FormTrack</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Start tracking leads in minutes. Free forever.</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 p-3 rounded-xl mb-4 text-sm flex gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Company / Organization Name</label>
            <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} placeholder="e.g. Sharma Digital Marketing" autoFocus />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} placeholder="Min. 6 characters" autoComplete="new-password" />
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={handleKeyDown}
              className={inputClass} placeholder="Re-enter password" autoComplete="new-password" />
          </div>

          <button onClick={handleSignup} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 transition shadow-sm shadow-blue-500/20 mt-2">
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>

          <p className="text-xs text-gray-400 dark:text-slate-600 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}