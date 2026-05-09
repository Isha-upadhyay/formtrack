'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowRight,
  Target,
  Zap,
  Shield,
  BarChart3,
  MousePointer2,
  Globe,
  ChevronRight,
  Plus,
  Mail,
  Smartphone,
  Star,
  CheckCircle2
} from 'lucide-react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const url = window.location.href
    const hash = window.location.hash
    const search = window.location.search
    
    console.log('LANDING_DEBUG: URL:', url)
    console.log('LANDING_DEBUG: Hash:', hash)
    console.log('LANDING_DEBUG: Search:', search)

    // Direct check for recovery tokens (Implicit Flow) or codes (PKCE Flow)
    if (hash.includes('access_token') || search.includes('code=')) {
      console.log('LANDING_DEBUG: Auth detected! Redirecting to /reset-password...')
      window.location.assign('/reset-password' + hash + search)
      return
    }

    // Handle Supabase password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('LANDING_DEBUG: Auth Event:', event)
      if (event === 'PASSWORD_RECOVERY') {
        window.location.assign('/reset-password' + window.location.hash)
      }
    })

    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('formtrack-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('formtrack-theme', 'light')
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-blue-500/30">
      {/* Background Grids & Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.2] dark:opacity-[0.1]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full dark:bg-blue-600/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full dark:bg-indigo-600/5" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'py-4 glass-card mx-4 md:mx-auto md:max-w-5xl mt-4 rounded-3xl' : 'py-8 px-8'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">F</div>
            <span className="font-syne font-black text-xl tracking-tighter">FormTrack</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link href="/login" className="hidden sm:block text-sm font-bold hover:text-blue-600 transition-colors">Login</Link>
            <Link href="/signup" className="px-6 py-2.5 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-black rounded-xl text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-black/5 dark:shadow-white/5">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-600/20 text-[10px] font-black uppercase tracking-widest text-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            AI-Powered Lead Analytics
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1] font-syne text-gradient animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Know every source.<br />In plain <span className="text-blue-600">English</span>.
          </h1>

          <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            FormTrack translates complex UTM data into clear insights. See exactly which ad, tweet, or email brought you that customer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-400">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 glass-card font-black rounded-xl text-sm transition-all hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 shadow-sm">
              Watch Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 animate-in fade-in delay-700">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-8">Trusted by scaling teams</p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
              <span className="text-2xl font-black font-syne">VERCEL</span>
              <span className="text-2xl font-black font-syne">LINEAR</span>
              <span className="text-2xl font-black font-syne">STRIPE</span>
              <span className="text-2xl font-black font-syne">RAYCAST</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight font-syne">Built for modern growth teams.</h2>
              <p className="text-lg text-muted-foreground max-w-xl">Everything you need to track, manage, and convert leads without touching a single line of database code.</p>
            </div>
            <Link href="/signup" className="text-blue-600 font-bold flex items-center gap-2 group">
              Explore all features <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="w-6 h-6 text-blue-600" />}
              title="UTM Translation"
              desc="We turn 'utm_source=fb_ads' into 'Facebook Ad: Q1 Spring Campaign'. Clear English for your whole team."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Instant Alerts"
              desc="Get real-time Slack or Email notifications as soon as a lead drops. Never miss a high-intent buyer again."
            />
            <FeatureCard
              icon={<Plus className="w-6 h-6 text-indigo-600" />}
              title="Form Builder"
              desc="Create high-converting forms in minutes with our drag-and-drop editor. No developer required."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
              title="Conversion Insights"
              desc="See which pages and sources have the highest ROI. Optimize your spend with confidence."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-green-600" />}
              title="Global Hosting"
              desc="Ultra-fast form delivery via our global CDN. Zero latency means more leads for your business."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-red-500" />}
              title="Data Security"
              desc="Enterprise-grade encryption and GDPR compliance. Your lead data is safe, private, and yours."
            />
          </div>
        </div>
      </section>

      {/* Interactive CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto glass-card p-12 md:p-20 rounded-3xl text-center relative overflow-hidden group shadow-2xl dark:shadow-none border border-gray-100 dark:border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />

          <h2 className="text-3xl md:text-5xl font-black tracking-tight font-syne mb-6 text-foreground">Ready to track<br />like a pro?</h2>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mb-10">
            Join over 2,000+ teams using FormTrack to decode their marketing spend and scale their revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-xl text-base hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
              Start Free Trial
            </Link>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">F</div>
              <span className="font-syne font-black text-lg tracking-tighter">FormTrack</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">Precision lead tracking for modern growth teams. Decode your marketing spend.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-bold">
              <li><Link href="#features" className="hover:text-blue-600">Features</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link href="#" className="hover:text-blue-600">API Docs</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-bold">
              <li><Link href="#" className="hover:text-blue-600">About</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Privacy</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">© 2026 FormTrack Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <Mail className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all duration-500 group shadow-sm hover:shadow-md">
      <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold font-syne mb-3 group-hover:text-blue-600 transition-colors text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{desc}</p>
    </div>
  )
}