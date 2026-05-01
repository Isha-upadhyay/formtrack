'use client'

import { useState, useEffect } from 'react'

interface Field {
  id: string; type: string; label: string; placeholder?: string; required: boolean; options?: string[]
}

interface FormSettings {
  submitLabel: string; successMessage: string; bgColor: string; accentColor: string
  fontFamily: string; borderRadius: string
}

interface Form {
  id: string; name: string; description?: string; fields: Field[]; settings: FormSettings
}

export default function PublicForm({ form }: { form: Form }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sourceParams, setSourceParams] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
      return match ? decodeURIComponent(match[1]) : null
    }
    const setCookie = (name: string, value: string) => {
      const d = new Date(); d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000)
      document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/'
    }

    const captured: Record<string, string> = {}
    utmKeys.forEach(key => {
      const fromUrl = params.get(key)
      if (fromUrl) { setCookie('ft_' + key, fromUrl); captured[key] = fromUrl }
      else { const fromCookie = getCookie('ft_' + key); if (fromCookie) captured[key] = fromCookie }
    })
    captured.source_url = window.location.href
    captured.referrer = document.referrer
    setSourceParams(captured)
  }, [])
  const steps = Array.from(new Set(form.fields.map(f => f.step || 1))).sort((a, b) => a - b)
  const maxStep = steps[steps.length - 1] || 1
  const currentFields = form.fields.filter(f => (f.step || 1) === currentStep)

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    currentFields.forEach(field => {
      if (field.required && !values[field.id]?.trim()) newErrors[field.id] = `${field.label} is required`
      if (field.type === 'email' && values[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.id])) newErrors[field.id] = 'Please enter a valid email'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => { if (validateStep()) setCurrentStep(prev => prev + 1) }
  const handleBack = () => setCurrentStep(prev => prev - 1)

  const handleSubmit = async () => {
    if (!validateStep()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: form.id, data: values, ...sourceParams }),
      })
      if (res.ok) setSubmitted(true)
      else alert('Something went wrong. Please try again.')
    } catch {
      alert('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  const s = form.settings

  // Shared input style
  const inputBase = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition text-gray-800 bg-white/80 placeholder-gray-400"

  if (submitted) {
    return (
      <div className="max-w-md w-full rounded-2xl shadow-lg p-10 text-center"
        style={{ backgroundColor: s.bgColor, fontFamily: s.fontFamily }}>
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }}>Thank you!</h2>
        <p style={{ color: '#4b5563' }}>{s.successMessage}</p>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full rounded-2xl shadow-lg overflow-hidden"
      style={{ backgroundColor: s.bgColor, fontFamily: s.fontFamily }}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>{form.name}</h1>
        {form.description && (
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{form.description}</p>
        )}

        {/* Progress bar */}
        {maxStep > 1 && (
          <div className="flex gap-1 mb-6">
            {steps.map(step => (
              <div key={step} className={`h-1 flex-1 rounded-full ${step <= currentStep ? 'bg-blue-600' : 'bg-gray-200 opacity-30'}`}
                style={{ backgroundColor: step <= currentStep ? s.accentColor : undefined }} />
            ))}
          </div>
        )}

        <div className="space-y-4 mt-6 min-h-[120px]">
          {currentFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                {field.label}
                {field.required && <span style={{ color: '#ef4444' }} className="ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                  rows={4}
                  className={inputBase}
                  style={{ borderRadius: s.borderRadius }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                  className={`${inputBase} cursor-pointer`}
                  style={{ borderRadius: s.borderRadius }}>
                  <option value="">Select an option</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'radio' ? (
                <div className="space-y-2">
                  {field.options?.map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
                      <input type="radio" name={field.id} value={opt}
                        checked={values[field.id] === opt}
                        onChange={() => setValues({ ...values, [field.id]: opt })} />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="space-y-2">
                  {field.options?.map(opt => {
                    const checked = values[field.id]?.split(',').includes(opt) || false
                    return (
                      <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
                        <input type="checkbox" checked={checked}
                          onChange={() => {
                            const current = values[field.id]?.split(',').filter(Boolean) || []
                            const updated = checked ? current.filter(v => v !== opt) : [...current, opt]
                            setValues({ ...values, [field.id]: updated.join(',') })
                          }} />
                        {opt}
                      </label>
                    )
                  })}
                </div>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                  className={inputBase}
                  style={{ borderRadius: s.borderRadius }}
                />
              )}

              {errors[field.id] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <div className="pt-2 flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold text-sm transition"
                style={{ borderRadius: s.borderRadius }}>
                Back
              </button>
            )}
            {currentStep < maxStep ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 text-white font-semibold text-sm transition"
                style={{ backgroundColor: s.accentColor, borderRadius: s.borderRadius }}>
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 text-white font-semibold text-sm disabled:opacity-60 transition"
                style={{ backgroundColor: s.accentColor, borderRadius: s.borderRadius }}>
                {submitting ? 'Submitting...' : s.submitLabel}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#d1d5db' }}>Powered by FormTrack</p>
      </div>
    </div>
  )
}