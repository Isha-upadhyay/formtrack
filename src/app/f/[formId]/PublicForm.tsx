'use client'

import { useState, useEffect } from 'react'

interface Field {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormSettings {
  submitLabel: string
  successMessage: string
  bgColor: string
  accentColor: string
  fontFamily: string
  borderRadius: string
}

interface Form {
  id: string
  name: string
  description?: string
  fields: Field[]
  settings: FormSettings
}

export default function PublicForm({ form }: { form: Form }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sourceParams, setSourceParams] = useState<Record<string, string>>({})

  // Capture UTM params from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    const captured: Record<string, string> = {}
    utmKeys.forEach(key => {
      const val = params.get(key)
      if (val) captured[key] = val
    })
    captured.source_url = window.location.href
    captured.referrer = document.referrer
    setSourceParams(captured)
  }, [])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    form.fields.forEach(field => {
      if (field.required && !values[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`
      }
      if (field.type === 'email' && values[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(values[field.id])) {
          newErrors[field.id] = 'Please enter a valid email'
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: form.id,
          data: values,
          ...sourceParams,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Network error. Please try again.')
    }

    setSubmitting(false)
  }

  const s = form.settings

  if (submitted) {
    return (
      <div className="max-w-md w-full rounded-2xl shadow-lg p-10 text-center"
        style={{ backgroundColor: s.bgColor, fontFamily: s.fontFamily }}>
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-600">{s.successMessage}</p>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full rounded-2xl shadow-lg overflow-hidden"
      style={{ backgroundColor: s.bgColor, fontFamily: s.fontFamily }}>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h1>
        {form.description && (
          <p className="text-gray-500 text-sm mb-6">{form.description}</p>
        )}

        <div className="space-y-4 mt-6">
          {form.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  style={{
                    borderRadius: s.borderRadius,
                    // @ts-expect-error css var
                    '--tw-ring-color': s.accentColor
                  }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-white"
                  style={{ borderRadius: s.borderRadius }}>
                  <option value="">Select an option</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'radio' ? (
                <div className="space-y-2">
                  {field.options?.map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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
                      <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={checked}
                          onChange={() => {
                            const current = values[field.id]?.split(',').filter(Boolean) || []
                            const updated = checked
                              ? current.filter(v => v !== opt)
                              : [...current, opt]
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
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition"
                  style={{ borderRadius: s.borderRadius }}
                />
              )}

              {errors[field.id] && (
                <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 text-white font-semibold text-sm disabled:opacity-60 transition mt-2"
            style={{
              backgroundColor: s.accentColor,
              borderRadius: s.borderRadius,
            }}>
            {submitting ? 'Submitting...' : s.submitLabel}
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">Powered by FormTrack</p>
      </div>
    </div>
  )
}