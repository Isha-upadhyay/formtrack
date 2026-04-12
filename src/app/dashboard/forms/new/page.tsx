'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TEMPLATES = [
  {
    id: 'contact', name: 'Contact Us', icon: '📬', description: 'General inquiries form',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
      { id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+91 9999999999', required: false },
      { id: 'message', type: 'textarea', label: 'Message', placeholder: 'How can we help?', required: true },
    ],
    settings: { submitLabel: 'Send Message', successMessage: 'Thanks! We will reach out within 24 hours.', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
  {
    id: 'lead-gen', name: 'Lead Generation', icon: '🎯', description: 'Capture business leads',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Work Email', placeholder: 'you@company.com', required: true },
      { id: 'company', type: 'text', label: 'Company Name', placeholder: 'Acme Inc.', required: true },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your phone', required: true },
      { id: 'budget', type: 'select', label: 'Budget Range', required: false, options: ['Under ₹10,000', '₹10,000–₹50,000', '₹50,000–₹2,00,000', '₹2,00,000+'] },
    ],
    settings: { submitLabel: 'Get Free Quote', successMessage: 'Our team will contact you within 2 hours!', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
  {
    id: 'demo', name: 'Demo Request', icon: '🖥️', description: 'Book a product demo',
    fields: [
      { id: 'name', type: 'text', label: 'Your Name', placeholder: 'Full name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'you@company.com', required: true },
      { id: 'company', type: 'text', label: 'Company', placeholder: 'Company name', required: true },
      { id: 'role', type: 'select', label: 'Your Role', required: false, options: ['CEO / Founder', 'Marketing Manager', 'Sales Manager', 'Developer', 'Other'] },
    ],
    settings: { submitLabel: 'Book Demo', successMessage: 'Demo booked! Calendar invite coming shortly.', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
  {
    id: 'quote', name: 'Quote Request', icon: '💰', description: 'Get service quote requests',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', required: true },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your number', required: true },
      { id: 'service', type: 'select', label: 'Service Required', required: true, options: ['Web Design', 'Mobile App', 'SEO', 'Digital Marketing', 'Other'] },
      { id: 'description', type: 'textarea', label: 'Project Description', placeholder: 'Tell us about your project', required: true },
    ],
    settings: { submitLabel: 'Request Quote', successMessage: 'Custom quote coming within 24 hours!', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
  {
    id: 'newsletter', name: 'Newsletter', icon: '📧', description: 'Grow your email list',
    fields: [
      { id: 'name', type: 'text', label: 'First Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
    ],
    settings: { submitLabel: 'Subscribe', successMessage: 'Subscribed! Check inbox for welcome email.', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
  {
    id: 'feedback', name: 'Feedback', icon: '⭐', description: 'Collect customer feedback',
    fields: [
      { id: 'name', type: 'text', label: 'Name', placeholder: 'Your name', required: false },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: false },
      { id: 'rating', type: 'radio', label: 'Rating', required: true, options: ['1 – Poor', '2 – Fair', '3 – Good', '4 – Very Good', '5 – Excellent'] },
      { id: 'feedback', type: 'textarea', label: 'Your Feedback', placeholder: 'Tell us what you think', required: true },
    ],
    settings: { submitLabel: 'Submit Feedback', successMessage: 'Thank you for your feedback!', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
  {
    id: 'event', name: 'Event Registration', icon: '🎪', description: 'Register event attendees',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
      { id: 'phone', type: 'phone', label: 'Phone', placeholder: 'Your phone', required: false },
      { id: 'attendees', type: 'number', label: 'Number of Attendees', placeholder: '1', required: true },
    ],
    settings: { submitLabel: 'Register Now', successMessage: 'Registered! Confirmation email on its way.', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
  {
    id: 'blank', name: 'Blank Form', icon: '✨', description: 'Start from scratch',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Your name', required: true },
      { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
    ],
    settings: { submitLabel: 'Submit', successMessage: 'Thank you! We will be in touch soon.', bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif', borderRadius: '8px', autoReplyEnabled: false }
  },
]

export default function NewFormPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async () => {
    if (!selected || !formName.trim()) return
    setLoading(true)

    const template = TEMPLATES.find(t => t.id === selected)!

    const { data: org } = await (supabase.from('organizations') as any).select('id').single()
    if (!org) { setLoading(false); return }

    const { data: form, error } = await (supabase.from('forms') as any).insert({
      name: formName,
      org_id: org.id,
      fields: template.fields,
      settings: template.settings,
      is_active: true,
    }).select().single()

    if (!error && form) {
      router.push(`/dashboard/forms/${form.id}/edit`)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Form</h1>
        <p className="text-gray-500 text-sm mt-1">Choose a template to get started quickly</p>
      </div>

      {/* Form Name */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Website Contact Form, Google Ads Lead Form..."
        />
      </div>

      {/* Templates */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`p-5 rounded-xl border-2 text-left transition ${
              selected === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
            }`}
          >
            <div className="text-3xl mb-3">{template.icon}</div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{template.name}</h3>
            <p className="text-xs text-gray-500">{template.description}</p>
          </button>
        ))}
      </div>

      {/* Create Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCreate}
          disabled={!selected || !formName.trim() || loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating...' : 'Create Form →'}
        </button>
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 text-sm">
          Cancel
        </button>
      </div>
    </div>
  )
}