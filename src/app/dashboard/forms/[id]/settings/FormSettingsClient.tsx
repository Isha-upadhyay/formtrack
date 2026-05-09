'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveFormSettings } from './actions'
import { 
  Settings2, 
  Palette, 
  Zap, 
  Save, 
  ChevronLeft, 
  Check, 
  Loader2, 
  Globe, 
  MessageSquare,
  Type,
  Layout,
  MousePointer2
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function FormSettingsClient({ form }: { form: any }) {
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'advanced'>('general')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: form.name,
    description: form.description || '',
    settings: {
      submitLabel: 'Submit',
      successMessage: 'Thank you for your submission!',
      accentColor: '#2563eb',
      fontFamily: 'sans-serif',
      borderRadius: '1rem',
      redirectUrl: '',
      webhookUrl: '',
      ...form.settings // Spread existing settings to avoid data loss
    }
  })

  const handleSave = async () => {
    setLoading(true)
    const result = await saveFormSettings(form.id, formData.name, formData.settings as any)

    if (result.error) {
      console.error('SAVE_ERROR:', result.error)
      alert('Error saving settings: ' + result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    }
    setLoading(false)
  }

  const inputBase = "w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all outline-none"
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block ml-1"

  return (
    <div className="p-6 md:p-8 w-full animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/forms" 
            className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-syne flex items-center gap-3">
              Form Settings
              <span className="text-xs font-black px-2 py-0.5 bg-blue-600/10 text-blue-600 rounded-md uppercase tracking-widest">{form.name}</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Configure form behavior, design, and conversion settings.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Changes Saved' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'general', label: 'General', icon: <Settings2 className="w-4 h-4" /> },
            { id: 'design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
            { id: 'advanced', label: 'Advanced', icon: <Zap className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                  : 'text-muted-foreground hover:bg-white dark:hover:bg-white/5 hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-white dark:bg-[#0d1117] rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 md:p-12 shadow-sm">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className={labelClass}>Form Name</label>
                      <input 
                        className={inputBase}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Contact Form"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className={labelClass}>Submit Button Label</label>
                      <input 
                        className={inputBase}
                        value={formData.settings.submitLabel}
                        onChange={e => setFormData({ ...formData, settings: { ...formData.settings, submitLabel: e.target.value } })}
                        placeholder="e.g. Get Started"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className={labelClass}>Form Description</label>
                   <textarea 
                     className={`${inputBase} min-h-[100px]`}
                     value={formData.description}
                     onChange={e => setFormData({ ...formData, description: e.target.value })}
                     placeholder="A brief explanation of what the user is signing up for..."
                   />
                </div>

                <div className="space-y-2">
                   <label className={labelClass}>Success Message</label>
                   <textarea 
                     className={`${inputBase} min-h-[100px]`}
                     value={formData.settings.successMessage}
                     onChange={e => setFormData({ ...formData, settings: { ...formData.settings, successMessage: e.target.value } })}
                     placeholder="Message to show after successful submission..."
                   />
                </div>
              </motion.div>
            )}

            {activeTab === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <label className={labelClass}>Accent Color</label>
                         <div className="flex items-center gap-4">
                            <input 
                              type="color"
                              className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                              value={formData.settings.accentColor}
                              onChange={e => setFormData({ ...formData, settings: { ...formData.settings, accentColor: e.target.value } })}
                            />
                            <input 
                              className={inputBase}
                              value={formData.settings.accentColor}
                              onChange={e => setFormData({ ...formData, settings: { ...formData.settings, accentColor: e.target.value } })}
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className={labelClass}>Font Family</label>
                         <select 
                           className={inputBase}
                           value={formData.settings.fontFamily}
                           onChange={e => setFormData({ ...formData, settings: { ...formData.settings, fontFamily: e.target.value } })}
                         >
                            <option value="sans-serif">System Sans-Serif</option>
                            <option value="font-syne">Modern Display (Syne)</option>
                            <option value="serif">Classic Serif</option>
                            <option value="monospace">Technical Monospace</option>
                         </select>
                      </div>

                      <div className="space-y-3">
                         <label className={labelClass}>Border Radius</label>
                         <div className="flex items-center gap-4">
                            <input 
                              type="range"
                              min="0"
                              max="3"
                              step="0.5"
                              className="flex-1 accent-blue-600"
                              value={formData.settings.borderRadius.replace('rem', '')}
                              onChange={e => setFormData({ ...formData, settings: { ...formData.settings, borderRadius: `${e.target.value}rem` } })}
                            />
                            <span className="text-xs font-black w-12 text-center bg-gray-50 dark:bg-white/5 py-2 rounded-lg">{formData.settings.borderRadius}</span>
                         </div>
                      </div>
                   </div>

                   {/* Preview Mockup */}
                   <div className="bg-gray-50 dark:bg-black/20 rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 flex items-center justify-center">
                      <div className="w-full bg-white dark:bg-[#0d1117] p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10 space-y-4" style={{ borderRadius: formData.settings.borderRadius }}>
                         <div className="w-2/3 h-3 bg-gray-100 dark:bg-white/10 rounded-full" />
                         <div className="w-full h-10 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5" />
                         <button 
                           className="w-full py-3 text-white text-[10px] font-black uppercase tracking-widest"
                           style={{ backgroundColor: formData.settings.accentColor, borderRadius: formData.settings.borderRadius }}
                         >
                           {formData.settings.submitLabel}
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="p-8 bg-blue-600/5 border border-blue-600/10 rounded-3xl space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                         <Globe className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-black tracking-tight">Post-Submission Redirect</p>
                         <p className="text-xs text-muted-foreground font-medium">Send users to a specific URL after they submit the form.</p>
                      </div>
                   </div>
                   <input 
                     className={inputBase}
                     value={formData.settings.redirectUrl}
                     onChange={e => setFormData({ ...formData, settings: { ...formData.settings, redirectUrl: e.target.value } })}
                     placeholder="https://yourwebsite.com/thank-you"
                   />
                </div>

                <div className="p-8 bg-indigo-600/5 border border-indigo-600/10 rounded-3xl space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                         <Zap className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-black tracking-tight">Notification Webhook (Slack/Discord)</p>
                         <p className="text-xs text-muted-foreground font-medium">Get instant notifications specifically for this form.</p>
                      </div>
                   </div>
                   <input 
                     className={inputBase}
                     value={(formData.settings as any).webhookUrl || ''}
                     onChange={e => setFormData({ ...formData, settings: { ...formData.settings, webhookUrl: e.target.value } as any })}
                     placeholder="https://hooks.slack.com/services/..."
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3 mb-2">
                         <MessageSquare className="w-4 h-4 text-purple-600" />
                         <p className="text-xs font-black uppercase tracking-widest">Slack Integration</p>
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground">Automatically push leads to Slack. (Pro Feature)</p>
                   </div>
                   <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3 mb-2">
                         <MousePointer2 className="w-4 h-4 text-indigo-600" />
                         <p className="text-xs font-black uppercase tracking-widest">Tracking Pixel</p>
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground">Add FB/Google tracking pixels. (Pro Feature)</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
