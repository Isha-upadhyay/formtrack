'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  ChevronLeft, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  Send,
  User,
  Mail,
  MessageSquare,
  ChevronDown
} from 'lucide-react'

interface Field {
  id: string; type: string; label: string; placeholder?: string; required: boolean; options?: string[]; step?: number
}

interface FormSettings {
  submitLabel: string; successMessage: string; bgColor: string; accentColor: string
  fontFamily: string; borderRadius: string; redirectUrl?: string
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
      if (res.ok) {
        setSubmitted(true)
        const targetUrl = s.redirectUrl
        if (targetUrl) {
          setTimeout(() => {
            window.location.href = targetUrl
          }, 2000)
        }
      }
      else alert('Something went wrong. Please try again.')
    } catch {
      alert('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  const s = form.settings

  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  if (submitted) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg w-full p-12 text-center bg-white dark:bg-[#0d1117] shadow-3xl rounded-[3rem] border border-gray-100 dark:border-white/5 relative overflow-hidden"
        style={{ fontFamily: s.fontFamily }}
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/5 blur-[40px] rounded-full"
        />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/30"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-4xl font-black mb-4 tracking-tighter text-foreground dark:text-white">All Set!</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10 font-medium">{s.successMessage}</p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
             <ShieldCheck className="w-4 h-4 text-blue-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FormTrack Secured</span>
          </div>
        </div>
      </motion.div>
    )
  }

  const inputBase = "w-full bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent px-6 py-5 text-base font-bold transition-all duration-300 focus:outline-none focus:bg-white dark:focus:bg-white/[0.06] focus:border-blue-600 dark:focus:border-blue-500 shadow-sm focus:shadow-xl focus:shadow-blue-500/10 placeholder:text-gray-400 dark:placeholder:text-white/20"
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 ml-2"

  return (
    <div 
      className="max-w-lg w-full bg-white dark:bg-[#0d1117] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/5 overflow-hidden rounded-[3rem] relative"
      style={{ fontFamily: s.fontFamily }}
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <motion.div 
           animate={{ 
             y: [0, -20, 0],
             opacity: [0.3, 0.5, 0.3]
           }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute top-10 right-10 w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full"
         />
      </div>

      <div className="p-10 md:p-14 relative z-10">
        <header className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-4 tracking-tighter text-foreground dark:text-white leading-none"
          >
            {form.name}
          </motion.h1>
          {form.description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground font-medium leading-relaxed"
            >
              {form.description}
            </motion.p>
          )}
        </header>

        {/* Dynamic Progress Indicator */}
        {maxStep > 1 && (
          <div className="flex items-center gap-3 mb-12">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Step {currentStep} of {maxStep}</span>
             <div className="flex-1 flex gap-2 h-1.5">
                {steps.map(step => (
                  <div key={step} className="flex-1 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={false}
                      animate={{ width: step <= currentStep ? '100%' : '0%' }}
                      className="h-full bg-blue-600"
                      style={{ backgroundColor: step <= currentStep ? s.accentColor : undefined }}
                    />
                  </div>
                ))}
             </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: "circOut" }}
            className="space-y-8"
          >
            {currentFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className={labelClass}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1.5">*</span>}
                </label>

                <div className="relative group">
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
                    <div className="relative">
                      <select
                        value={values[field.id] || ''}
                        onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                        className={`${inputBase} cursor-pointer appearance-none pr-12`}
                        style={{ borderRadius: s.borderRadius }}>
                        <option value="">Select an option</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none transition-transform group-focus-within:rotate-180" />
                    </div>
                  ) : field.type === 'radio' || field.type === 'checkbox' ? (
                    <div className="grid grid-cols-1 gap-3">
                      {field.options?.map(opt => {
                        const isChecked = field.type === 'checkbox' 
                          ? values[field.id]?.split(',').includes(opt) 
                          : values[field.id] === opt

                        return (
                          <label key={opt} className={`
                            flex items-center gap-4 p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300
                            ${isChecked 
                              ? 'bg-blue-600/5 border-blue-600 dark:border-blue-500 dark:bg-blue-500/10' 
                              : 'bg-gray-50 dark:bg-white/5 border-transparent hover:bg-gray-100 dark:hover:bg-white/[0.08]'}
                          `}>
                            <div className={`
                              w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                              ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent'}
                            `}>
                               {isChecked && (field.type === 'checkbox' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2.5 h-2.5 bg-white rounded-full" />)}
                            </div>
                            <input 
                              type={field.type}
                              name={field.id}
                              checked={isChecked}
                              onChange={() => {
                                if (field.type === 'radio') {
                                  setValues({ ...values, [field.id]: opt })
                                } else {
                                  const current = values[field.id]?.split(',').filter(Boolean) || []
                                  const updated = isChecked ? current.filter(v => v !== opt) : [...current, opt]
                                  setValues({ ...values, [field.id]: updated.join(',') })
                                }
                              }}
                              className="hidden" 
                            />
                            <span className={`text-sm font-bold transition-colors ${isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-foreground/80'}`}>{opt}</span>
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
                </div>

                <AnimatePresence>
                  {errors[field.id] && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2"
                    >
                      {errors[field.id]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <footer className="pt-6 flex flex-col md:flex-row gap-4">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-5 bg-gray-100 dark:bg-white/5 text-muted-foreground font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10"
                  style={{ borderRadius: s.borderRadius }}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              
              <button
                onClick={currentStep < maxStep ? handleNext : handleSubmit}
                disabled={submitting}
                className="flex-[2] py-5 text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 group overflow-hidden relative"
                style={{ backgroundColor: s.accentColor, borderRadius: s.borderRadius }}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-3">
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStep < maxStep ? (
                    <>Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  ) : (
                    <>{s.submitLabel} <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </footer>
          </motion.div>
        </AnimatePresence>

        <div className="mt-16 flex flex-col items-center gap-4 border-t border-gray-100 dark:border-white/5 pt-10">
           <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Powered by FormTrack AI</p>
           </div>
           <p className="text-[10px] text-gray-300 dark:text-white/10 font-bold uppercase tracking-widest">End-to-End Encrypted & GDPR Compliant</p>
        </div>
      </div>
    </div>
  )
}