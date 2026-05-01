'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Layout, 
  Globe, 
  Target, 
  ArrowRight, 
  Sparkles,
  Zap,
  ShieldCheck,
  MousePointer2
} from 'lucide-react'

const steps = [
  {
    id: 1,
    icon: <Layout className="w-5 h-5" />,
    title: 'Create your first form',
    desc: 'Pick a template and customize it for your business.',
    action: 'Create Form',
    href: '/dashboard/forms/new',
    color: 'blue'
  },
  {
    id: 2,
    icon: <Globe className="w-5 h-5" />,
    title: 'Embed it on your website',
    desc: 'Copy one line of code and paste it anywhere.',
    action: 'See Embed Guide',
    href: '/dashboard/forms',
    color: 'indigo'
  },
  {
    id: 3,
    icon: <Target className="w-5 h-5" />,
    title: 'Share with UTM links',
    desc: 'Add UTM parameters to your ad URLs for tracking.',
    action: 'Learn More',
    href: '/dashboard',
    color: 'purple'
  },
]

export default function OnboardingPage() {
  const [completed, setCompleted] = useState<number[]>([])
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function initOnboarding() {
      try {
        const res = await fetch('/api/auth/onboard', { method: 'POST' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to initialize account')
        setInitializing(false)
      } catch (err: any) {
        setError(err.message)
        setInitializing(false)
      }
    }
    initOnboarding()
  }, [])

  const toggle = (id: number) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#05070a]">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing your workspace...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gray-50 dark:bg-[#05070a]">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-grid opacity-[0.2]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3 fill-current" />
            Account Ready
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-syne mb-4">
            Welcome to <span className="text-blue-600">FormTrack</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base">
            Let's get you set up to track every lead source in plain English. Follow these quick steps.
          </p>
        </div>

        <div className="glass dark:bg-white/5 p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              {error}
            </div>
          )}

          {/* Progress Section */}
          <div className="space-y-3 mb-10">
            <div className="flex justify-between items-end">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Setup Progress</p>
              <p className="text-sm font-black text-blue-600">{Math.round((completed.length / steps.length) * 100)}% Complete</p>
            </div>
            <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                style={{ width: `${(completed.length / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map(step => {
              const isDone = completed.includes(step.id)
              return (
                <div 
                  key={step.id}
                  className={`group relative flex items-start gap-5 p-6 rounded-[2rem] border transition-all ${
                    isDone 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-white dark:bg-white/5 border-white/5 hover:border-blue-500/30'
                  }`}
                >
                  <button 
                    onClick={() => toggle(step.id)}
                    className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isDone 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-gray-100 dark:bg-white/8 text-muted-foreground group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                  </button>

                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className={`font-bold text-lg leading-none mb-2 ${isDone ? 'text-green-700 dark:text-green-400 opacity-60' : ''}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {!isDone && (
                    <Link 
                      href={step.href}
                      className="shrink-0 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:translate-x-1 transition-transform self-center"
                    >
                      {step.action} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {/* Final CTA */}
          <div className="pt-6">
            {completed.length === steps.length ? (
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-95 animate-in zoom-in-95 duration-300"
              >
                Launch Dashboard
                <Zap className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full text-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-2 uppercase tracking-[0.2em]"
              >
                Skip Setup &rarr; Go to Dashboard
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-12 text-xs font-bold text-muted-foreground opacity-50 uppercase tracking-widest">
          Secured by Supabase &middot; Powered by Next.js
        </p>
      </div>
    </div>
  )
}