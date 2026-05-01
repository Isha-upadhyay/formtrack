'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TEMPLATES = [
  {
    id: 'contact', name: 'Contact Us', icon: '📬', description: 'General inquiries form',
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
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
    }
  },
  {
    id: 'lead-gen', name: 'Lead Gen (2-Step)', icon: '🎯', description: 'Capture leads with steps',
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
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
    }
  },
  {
    id: 'demo', name: 'Demo Request', icon: '🖥️', description: 'Book a product demo',
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
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
    }
  },
  {
    id: 'quote', name: 'Quote Request', icon: '💰', description: 'Get service quote requests',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true, step: 1 },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', required: true, step: 1 },
      { id: 'service', type: 'select', label: 'Service Required', required: true, options: ['Web Design', 'Mobile App', 'SEO', 'Digital Marketing', 'Other'], step: 1 },
      { id: 'desc', type: 'textarea', label: 'Project Description', placeholder: 'Tell us about your project', required: true, step: 2 },
    ],
    settings: {
      submitLabel: 'Request Quote',
      successMessage: 'Custom quote coming within 24 hours!',
      notificationEmail: '',
      autoReplyEnabled: false,
      autoReplySubject: 'Quote Request Received',
      autoReplyMessage: 'Hi,\n\nWe have received your quote request and are currently processing it.',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
    }
  },
  {
    id: 'newsletter', name: 'Newsletter', icon: '📧', description: 'Grow your email list',
    fields: [
      { id: 'name', type: 'text', label: 'First Name', placeholder: 'Your name', required: true, step: 1 },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true, step: 1 },
    ],
    settings: {
      submitLabel: 'Subscribe',
      successMessage: 'Subscribed! Check inbox for welcome email.',
      notificationEmail: '',
      autoReplyEnabled: true,
      autoReplySubject: 'Welcome to our Newsletter!',
      autoReplyMessage: 'Hi,\n\nThanks for subscribing! You will receive our weekly updates from now on.',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
    }
  },
  {
    id: 'feedback', name: 'Feedback', icon: '⭐', description: 'Collect customer feedback',
    fields: [
      { id: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: false, step: 1 },
      { id: 'rating', type: 'radio', label: 'Rating', required: true, options: ['1 – Poor', '2 – Fair', '3 – Good', '4 – Very Good', '5 – Excellent'], step: 1 },
      { id: 'feedback', type: 'textarea', label: 'Your Feedback', placeholder: 'Tell us what you think', required: true, step: 1 },
    ],
    settings: {
      submitLabel: 'Submit Feedback',
      successMessage: 'Thank you for your feedback!',
      notificationEmail: '',
      autoReplyEnabled: false,
      autoReplySubject: 'Feedback Received',
      autoReplyMessage: 'Hi,\n\nThank you for taking the time to provide your feedback. We appreciate it!',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
    }
  },
  {
    id: 'event', name: 'Event Registration', icon: '🎪', description: 'Register event attendees',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true, step: 1 },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true, step: 1 },
      { id: 'attendees', type: 'number', label: 'Number of Attendees', placeholder: '1', required: true, step: 1 },
    ],
    settings: {
      submitLabel: 'Register Now',
      successMessage: 'Registered! Confirmation email on its way.',
      notificationEmail: '',
      autoReplyEnabled: true,
      autoReplySubject: 'Event Registration Confirmed',
      autoReplyMessage: 'Hi,\n\nYou are successfully registered for the event. See you there!',
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
    }
  },
  {
    id: 'blank', name: 'Blank Form', icon: '✨', description: 'Start from scratch',
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
      bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px'
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

    // Get user first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    console.log('Current User ID:', user.id)

    // Get user's org from profiles table
    let { data: profile, error: profErr } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).maybeSingle()

    console.log('Initial Profile Query:', { profile, error: profErr })

    // FALLBACK: If profile is missing, call the onboarding API
    if (!profile) {
      console.log('Profile missing. Triggering auto-onboarding API...')
      try {
        const onboardRes = await fetch('/api/auth/onboard', { method: 'POST' })
        const onboardData = await onboardRes.json()

        if (!onboardData.success) throw new Error(onboardData.error || 'Onboarding failed')

        if (onboardData.org_id) {
          profile = { org_id: onboardData.org_id }
        } else {
          // Fallback re-fetch
          await new Promise(resolve => setTimeout(resolve, 1000))
          const { data: newProfile } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).maybeSingle()
          profile = newProfile
        }
      } catch (err) {
        console.error('Auto-onboarding failed:', err)
        setLoading(false);
        setError('Database setup incomplete. Please contact support or run SQL migrations.');
        return
      }
    }

    if (!profile) {
      // One last try with a small delay if it was just created
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: lastTry } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).maybeSingle()
      profile = lastTry

      if (!profile) {
        setLoading(false)
        setError('Could not verify organization access. Try refreshing the page.')
        return
      }
    }

    // Get org details (plan, form count)
    const { data: org, error: orgErr } = await (supabase.from('orgs') as any).select('plan, leads_used_this_month').eq('id', profile.org_id).maybeSingle()

    // Fallback if RLS blocks reading org details
    const plan = (org as any)?.plan || 'free'
    const isPro = plan === 'pro'

    if (!isPro) {
      const { count } = await (supabase.from('forms') as any).select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id)
      if ((count ?? 0) >= 2) {
        setError('Free plan allows only 2 forms. Please upgrade to Pro for unlimited forms.')
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
    } else if (insertErr) {
      console.error('Create form error:', insertErr)
      setError('Failed to create form. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Form</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Choose a template to get started quickly</p>
      </div>

      <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Form Name</label>
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition"
          placeholder="e.g. Website Contact Form, Google Ads Lead Form..."
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`p-5 rounded-xl border-2 text-left transition ${selected === template.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/15'
                : 'border-gray-100 dark:border-white/8 bg-white dark:bg-[#1c2128] hover:border-gray-200 dark:hover:border-white/15 shadow-sm'
              }`}
          >
            <div className="text-3xl mb-3">{template.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{template.name}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">{template.description}</p>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
          </div>
          <a href="/dashboard/billing" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-red-500/20 whitespace-nowrap">
            UPGRADE TO PRO
          </a>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleCreate}
          disabled={!selected || !formName.trim() || loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/25"
        >
          {loading ? 'Creating...' : 'Create Form →'}
        </button>
        <button onClick={() => router.back()} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 text-sm font-medium transition">
          Cancel
        </button>
      </div>
    </div>
  )
}