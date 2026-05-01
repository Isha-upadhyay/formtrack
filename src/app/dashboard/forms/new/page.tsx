'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Layout, 
  Mail, 
  Target, 
  Monitor, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  Zap,
  Globe,
  Settings,
  Shield,
  Loader2,
  FileText,
  BadgeCent
} from 'lucide-react'
import Link from 'next/link'

const TEMPLATES = [
  {
    id: 'contact', name: 'Contact Us', icon: <Mail className="w-6 h-6 text-blue-500" />, description: 'General inquiries form',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true, step: 1 },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, step: 1 },
      { id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+91 9999999999', required: false, step: 1 },
      { id: 'message', type: 'textarea', label: 'Message', placeholder: 'How can we help?', required: true, step: 1 },
    ],
    settings: {
      submitLabel: 'Send Message',
      successMessage: 'Thanks! We will reach out within 24 hours.',
      notificationEmail: '',
      autoReplyEnabled: false,
      autoReplySubject: 'Thanks for contacting us!',
      autoReplyMessage: 'Hi,\n\nWe received your message and will get back to you shortly.',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '16px'
    }
  },
  {
    id: 'lead-gen', name: 'Lead Gen', icon: <Target className="w-6 h-6 text-amber-500" />, description: 'Capture leads with steps',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true, step: 1 },
      { id: 'company', type: 'text', label: 'Company Name', placeholder: 'Acme Inc.', required: true, step: 1 },
      { id: 'email', type: 'email', label: 'Work Email', placeholder: 'you@company.com', required: true, step: 2 },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your phone', required: true, step: 2 },
    ],
    settings: {
      submitLabel: 'Get Free Quote',
      successMessage: 'Our team will contact you within 2 hours!',
      notificationEmail: '',
      autoReplyEnabled: false,
      autoReplySubject: 'Your Quote Request',
      autoReplyMessage: 'Hi,\n\nThanks for requesting a quote. Our team is reviewing your details and will call you soon.',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '16px'
    }
  },
  {
    id: 'demo', name: 'Demo Request', icon: <Monitor className="w-6 h-6 text-indigo-500" />, description: 'Book a product demo',
    fields: [
      { id: 'name', type: 'text', label: 'Your Name', placeholder: 'Full name', required: true, step: 1 },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'you@company.com', required: true, step: 1 },
      { id: 'company', type: 'text', label: 'Company', placeholder: 'Company name', required: true, step: 1 },
      { id: 'role', type: 'select', label: 'Your Role', required: false, options: ['CEO / Founder', 'Marketing Manager', 'Sales Manager', 'Developer', 'Other'], step: 1 },
    ],
    settings: {
      submitLabel: 'Book Demo',
      successMessage: 'Demo booked! Calendar invite coming shortly.',
      notificationEmail: '',
      autoReplyEnabled: true,
      autoReplySubject: 'Demo Scheduled!',
      autoReplyMessage: 'Hi,\n\nThanks for your interest. We will send you a calendar invite for the demo shortly.',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '16px'
    }
  },
  {
    id: 'blank', name: 'Blank Form', icon: <Plus className="w-6 h-6 text-purple-500" />, description: 'Start from scratch',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true, step: 1 },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true, step: 1 },
    ],
    settings: {
      submitLabel: 'Submit',
      successMessage: 'Thank you! We will be in touch soon.',
      notificationEmail: '',
      autoReplyEnabled: false,
      autoReplySubject: 'Thanks for reaching out!',
      autoReplyMessage: 'Hi,\n\nWe have received your submission and will get back to you soon.',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '16px'
    }
  },
]

export default function NewFormPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async () => {
    if (!selected || !formName.trim()) return
    setLoading(true)
    setError('')

    const template = TEMPLATES.find(t => t.id === selected)!
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    let { data: profile } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).maybeSingle()

    if (!profile) {
      try {
        const onboardRes = await fetch('/api/auth/onboard', { method: 'POST' })
        const onboardData = await onboardRes.json()
        if (!onboardData.success) throw new Error(onboardData.error || 'Onboarding failed')
        profile = { org_id: onboardData.org_id }
      } catch (err) {
        setLoading(false);
        setError('Database setup incomplete. Please try refreshing.');
        return
      }
    }

    if (!profile) {
      setLoading(false)
      setError('Could not verify organization access. Try refreshing the page.')
      return
    }

    const { data: org } = await (supabase.from('orgs') as any).select('plan').eq('id', profile.org_id).maybeSingle()
    const plan = (org as any)?.plan || 'free'

    if (plan !== 'pro') {
      const { count } = await (supabase.from('forms') as any).select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id)
      if ((count ?? 0) >= 2) {
        setError('Free plan allows only 2 forms. Please upgrade to Pro.')
        setLoading(false)
        return
      }
    }

    const { data: form, error: insertErr } = await (supabase.from('forms') as any).insert({
      name: formName,
      org_id: profile.org_id,
      fields: template.fields,
      settings: template.settings,
      status: 'active',
    }).select().maybeSingle()

    if (!insertErr && form) {
      router.push(`/dashboard/forms/${form.id}/edit`)
    } else {
      setError('Failed to create form. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">New Asset</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-syne">Create Form</h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-lg font-medium">Select a high-conversion template to launch in seconds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           {/* Step 1: Name */}
           <div className="glass-card p-8 rounded-[3rem] space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xs">01</div>
                 <h2 className="text-xl font-bold font-syne">Form Identity</h2>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Friendly Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium"
                  placeholder="e.g. Q2 Marketing Lead Capture"
                />
              </div>
           </div>

           {/* Step 2: Template */}
           <div className="glass-card p-8 rounded-[3rem] space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xs">02</div>
                 <h2 className="text-xl font-bold font-syne">Select Structure</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelected(template.id)}
                    className={`group p-6 rounded-[2rem] border-2 text-left transition-all duration-300 relative overflow-hidden ${
                      selected === template.id
                        ? 'border-blue-600 bg-blue-600/5 shadow-xl shadow-blue-500/10'
                        : 'border-gray-50 dark:border-white/5 hover:border-blue-500/30'
                    }`}
                  >
                    {selected === template.id && <Sparkles className="absolute -top-2 -right-2 w-12 h-12 text-blue-600/10" />}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                       selected === template.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 dark:bg-white/5'
                    }`}>
                      {template.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{template.description}</p>
                    {selected === template.id && (
                       <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                         Selected <ChevronRight className="w-3 h-3" />
                       </div>
                    )}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
           <div className="glass-card p-8 rounded-[3rem] sticky top-24 space-y-6 border-blue-500/20 shadow-2xl shadow-blue-500/5">
              <h3 className="text-lg font-bold font-syne">Creation Summary</h3>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Form Name</span>
                    <span className="font-bold truncate max-w-[120px]">{formName || 'Untitled'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Template</span>
                    <span className="font-bold capitalize">{selected || 'None'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Status</span>
                    <span className="flex items-center gap-1.5 font-bold text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active</span>
                 </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl space-y-3">
                   <p className="text-xs font-bold text-red-600 flex items-center gap-2">
                     <Shield className="w-4 h-4" /> Limit Reached
                   </p>
                   <p className="text-[10px] text-red-600/70 leading-relaxed font-medium">{error}</p>
                   <Link href="/dashboard/billing" className="block w-full py-2 bg-red-600 text-white text-center text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors">
                      Upgrade to Pro
                   </Link>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={!selected || !formName.trim() || loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Processing...' : 'Create Asset Now'}
              </button>

              <p className="text-center text-[10px] text-muted-foreground font-medium">
                 Launch and get your embed code instantly.
              </p>
           </div>

           <div className="glass-card p-8 rounded-[3rem] space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pro Tip</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium italic">
                "Use a descriptive name like 'FB Ads - Q2' to easily track ROI in your dashboard insights."
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}