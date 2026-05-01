'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, ChevronLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react'

interface Field {
  id: string; type: string; label: string; placeholder?: string; required: boolean; options?: string[]; step?: number
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

  if (submitted) {
    return (
      <div className="max-w-lg w-full p-10 text-center animate-in zoom-in-95 duration-500 bg-white shadow-2xl rounded-[3rem]"
        style={{ fontFamily: s.fontFamily }}>
        <div className="w-20 h-20 bg-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tighter" style={{ color: '#0f172a' }}>Thank you!</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">{s.successMessage}</p>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
           <Sparkles className="w-4 h-4 text-blue-500" />
           Verified by FormTrack
        </div>
      </div>
    )
  }

  const inputBase = "w-full border-2 border-gray-100 px-5 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-gray-900 bg-white placeholder-gray-400"
  const labelClass = "block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1"

  return (
    <div className="max-w-lg w-full bg-white shadow-3xl overflow-hidden animate-in fade-in duration-700 rounded-[3rem]"
      style={{ fontFamily: s.fontFamily }}>
      <div className="p-10">
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-3 tracking-tighter" style={{ color: '#0f172a' }}>{form.name}</h1>
          {form.description && (
            <p className="text-base text-muted-foreground leading-relaxed">{form.description}</p>
          )}
        </div>

        {/* Premium Progress bar */}
        {maxStep > 1 && (
          <div className="flex gap-2 mb-10">
            {steps.map(step => (
              <div key={step} className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden relative">
                <div 
                  className={`absolute inset-0 transition-all duration-700 ${step <= currentStep ? 'bg-blue-600' : 'bg-transparent'}`}
                  style={{ backgroundColor: step <= currentStep ? s.accentColor : undefined }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          {currentFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className={labelClass}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
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
                  className={`${inputBase} cursor-pointer appearance-none`}
                  style={{ borderRadius: s.borderRadius }}>
                  <option value="">Select an option</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === 'radio' ? (
                <div className="space-y-3 pt-2">
                  {field.options?.map(opt => (
                    <label key={opt} className="flex items-center gap-4 p-4 border-2 border-gray-50 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                      <input type="radio" name={field.id} value={opt}
                        checked={values[field.id] === opt}
                        onChange={() => setValues({ ...values, [field.id]: opt })}
                        className="w-5 h-5 border-2 text-blue-600" />
                      <span className="text-sm font-bold text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="space-y-3 pt-2">
                  {field.options?.map(opt => {
                    const checked = values[field.id]?.split(',').includes(opt) || false
                    return (
                      <label key={opt} className="flex items-center gap-4 p-4 border-2 border-gray-50 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                        <input type="checkbox" checked={checked}
                          onChange={() => {
                            const current = values[field.id]?.split(',').filter(Boolean) || []
                            const updated = checked ? current.filter(v => v !== opt) : [...current, opt]
                            setValues({ ...values, [field.id]: updated.join(',') })
                          }}
                          className="w-5 h-5 rounded border-2 text-blue-600" />
                        <span className="text-sm font-bold text-gray-700">{opt}</span>
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
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1.5 ml-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <div className="pt-6 flex gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-5 bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ borderRadius: s.borderRadius }}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {currentStep < maxStep ? (
              <button
                onClick={handleNext}
                className="flex-1 py-5 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                style={{ backgroundColor: s.accentColor, borderRadius: s.borderRadius }}>
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-5 text-white font-black text-xs uppercase tracking-widest disabled:opacity-60 transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                style={{ backgroundColor: s.accentColor, borderRadius: s.borderRadius }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {submitting ? 'Submitting...' : s.submitLabel}
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Powered by FormTrack</p>
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600/60" />
           </div>
        </div>
      </div>
    </div>
  )
}