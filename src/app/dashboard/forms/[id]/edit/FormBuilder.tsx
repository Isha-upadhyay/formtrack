'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date'

interface Field {
  id: string; type: FieldType; label: string; placeholder?: string; required: boolean; options?: string[]; step: number
}

interface FormSettings {
  submitLabel: string; successMessage: string; notificationEmail: string;
  autoReplyEnabled: boolean; autoReplySubject: string; autoReplyMessage: string;
  bgColor: string; accentColor: string; fontFamily: string; borderRadius: string;
}

interface Form {
  id: string; name: string; description?: string; fields: Field[]; settings: FormSettings; status: string
}

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: '𝐓' },
  { type: 'email', label: 'Email', icon: '✉' },
  { type: 'phone', label: 'Phone', icon: '📞' },
  { type: 'textarea', label: 'Textarea', icon: '≡' },
  { type: 'select', label: 'Dropdown', icon: '▾' },
  { type: 'radio', label: 'Radio', icon: '◉' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑' },
  { type: 'number', label: 'Number', icon: '#' },
  { type: 'date', label: 'Date', icon: '📅' },
]

function generateId() { return Math.random().toString(36).slice(2, 8) }

export default function FormBuilder({ form }: { form: Form }) {
  console.log('FormBuilder received form:', form)

  const [name, setName] = useState(form.name)
  const [description, setDescription] = useState(form.description || '')
  const [fields, setFields] = useState<Field[]>(form.fields || [])
  const [settings, setSettings] = useState<FormSettings>(form.settings || {
    submitLabel: 'Submit', successMessage: 'Thank you! We will be in touch.',
    notificationEmail: '', autoReplyEnabled: false,
    autoReplySubject: 'Thanks for reaching out!',
    autoReplyMessage: 'Hi there,\n\nThanks for your message! We have received your inquiry and will get back to you shortly.',
    bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif',
    borderRadius: '8px',
  })

  // Sync state if prop changes (e.g. on navigation)
  useEffect(() => {
    setName(form.name)
    setDescription(form.description || '')
    setFields(form.fields || [])
    if (form.settings) setSettings(form.settings)
  }, [form])
  const [activeTab, setActiveTab] = useState<'fields' | 'design' | 'settings' | 'embed'>('fields')
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const addField = (type: FieldType) => {
    const maxStep = fields.length > 0 ? Math.max(...fields.map(f => f.step)) : 1
    const newField: Field = {
      id: generateId(), type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: '', required: false, step: maxStep,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    }
    setFields([...fields, newField]); setSelectedField(newField.id)
  }

  const addStep = () => {
    const maxStep = fields.length > 0 ? Math.max(...fields.map(f => f.step)) : 1
    const newField: Field = {
      id: generateId(), type: 'text', label: 'New Step Field', required: false, step: maxStep + 1
    }
    setFields([...fields, newField]); setSelectedField(newField.id)
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const deleteField = (id: string) => { setFields(fields.filter(f => f.id !== id)); setSelectedField(null) }

  const moveField = (id: string, dir: 'up' | 'down') => {
    const idx = fields.findIndex(f => f.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === fields.length - 1) return
    const newFields = [...fields]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[newFields[idx], newFields[swap]] = [newFields[swap], newFields[idx]]
    setFields(newFields)
  }

  const dragFieldId = useRef<string | null>(null)
  const onDragStart = (id: string) => { dragFieldId.current = id }
  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault()
    if (!dragFieldId.current || dragFieldId.current === overId) return
    const from = fields.findIndex(f => f.id === dragFieldId.current)
    const to = fields.findIndex(f => f.id === overId)
    if (from === -1 || to === -1) return
    const reordered = [...fields]; const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved); setFields(reordered); dragFieldId.current = overId
  }
  const onDragEnd = () => { dragFieldId.current = null }

  const handleSave = async () => {
    setSaving(true)
    await (supabase.from('forms') as any)
      .update({ name, description, fields, settings, updated_at: new Date().toISOString() })
      .eq('id', form.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000); router.refresh()
  }

  const selectedFieldData = fields.find(f => f.id === selectedField)
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const embedCode = `<script src="${origin}/embed.js" data-form-id="${form.id}"></script>`

  const panelInputClass = "w-full border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition"
  const labelClass = "text-xs font-medium text-gray-600 dark:text-slate-400 block mb-1"

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-[#0e1117]">
      {/* Top bar */}
      <div className="bg-white dark:bg-[#161b22] border-b border-gray-100 dark:border-white/8 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/forms')}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-sm transition">
            ← Back
          </button>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none text-lg" />
        </div>
        <div className="flex items-center gap-3">
          <a href={`/f/${form.id}`} target="_blank"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Preview ↗</a>
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-sm shadow-blue-500/20">
            {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-full lg:w-72 bg-white dark:bg-[#161b22] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/8 flex flex-col flex-shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-white/8">
            {(['fields', 'design', 'settings', 'embed'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">Add Field</p>
                <button onClick={addStep} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">+ ADD STEP</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {FIELD_TYPES.map((ft) => (
                  <button key={ft.type} onClick={() => addField(ft.type)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-100 dark:border-white/8 hover:border-blue-200 dark:hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition text-center">
                    <span className="text-lg">{ft.icon}</span>
                    <span className="text-xs text-gray-600 dark:text-slate-400">{ft.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase mb-3">Form Fields</p>
              {fields.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-600 text-center py-6">No fields yet. Add one above!</p>
              ) : (
                <div className="space-y-2">
                  {fields.map((field, idx) => (
                    <div key={field.id}
                      draggable
                      onDragStart={() => onDragStart(field.id)}
                      onDragOver={(e) => onDragOver(e, field.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => setSelectedField(field.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        selectedField === field.id
                          ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/15'
                          : 'border-gray-100 dark:border-white/8 hover:border-gray-200 dark:hover:border-white/15'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-gray-300 dark:text-slate-600 cursor-grab select-none text-xs">⠿⠿</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{field.label}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{field.type}{field.required ? ' · required' : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up') }}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 disabled:opacity-20">↑</button>
                          <button onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down') }}
                            disabled={idx === fields.length - 1}
                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 disabled:opacity-20">↓</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteField(field.id) }}
                            className="p-1 text-red-400 dark:text-red-500 hover:text-red-600">×</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFieldData && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-white/4 rounded-xl border border-gray-100 dark:border-white/8">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-3">Edit Field</p>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Label</label>
                      <input value={selectedFieldData.label}
                        onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                        className={panelInputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Placeholder</label>
                      <input value={selectedFieldData.placeholder || ''}
                        onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                        className={panelInputClass} />
                    </div>
                    {selectedFieldData.options && (
                      <div>
                        <label className={labelClass}>Options (one per line)</label>
                        <textarea
                          value={selectedFieldData.options.join('\n')}
                          onChange={(e) => updateField(selectedFieldData.id, { options: e.target.value.split('\n') })}
                          rows={4} className={panelInputClass} />
                      </div>
                    )}
                    <div>
                      <label className={labelClass}>Step / Page Number</label>
                      <input type="number" min={1} value={selectedFieldData.step}
                        onChange={(e) => updateField(selectedFieldData.id, { step: parseInt(e.target.value) || 1 })}
                        className={panelInputClass} />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedFieldData.required}
                        onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                        className="rounded" />
                      <span className="text-sm text-gray-700 dark:text-slate-300">Required field</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Design Tab */}
          {activeTab === 'design' && (
            <div className="p-4 space-y-5">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase mb-3">Appearance</p>
              <div>
                <label className={labelClass}>Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.bgColor}
                    onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer" />
                  <input value={settings.bgColor}
                    onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                    className={panelInputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer" />
                  <input value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className={panelInputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Border Radius</label>
                <select value={settings.borderRadius}
                  onChange={(e) => setSettings({ ...settings, borderRadius: e.target.value })}
                  className={panelInputClass}>
                  <option value="0px">Sharp (0px)</option>
                  <option value="4px">Small (4px)</option>
                  <option value="8px">Medium (8px)</option>
                  <option value="12px">Large (12px)</option>
                  <option value="999px">Pill</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Font Family</label>
                <select value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className={panelInputClass}>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="Arial, sans-serif">Arial</option>
                </select>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-4 space-y-6">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase mb-3">General Settings</p>
              <div>
                <label className={labelClass}>Form Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={2} placeholder="Short description shown on the form" className={panelInputClass} />
              </div>
              <div>
                <label className={labelClass}>Submit Button Label</label>
                <input value={settings.submitLabel}
                  onChange={(e) => setSettings({ ...settings, submitLabel: e.target.value })}
                  className={panelInputClass} />
              </div>
              <div>
                <label className={labelClass}>Success Message</label>
                <textarea value={settings.successMessage}
                  onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })}
                  rows={3} className={panelInputClass} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-white/8">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase mb-4">Emails & Automation</p>
                
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>📧 Admin Notification Email</label>
                    <input type="email" value={settings.notificationEmail || ''}
                      onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                      placeholder="you@example.com" className={panelInputClass} />
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Where to send new lead alerts</p>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={settings.autoReplyEnabled}
                        onChange={(e) => setSettings({ ...settings, autoReplyEnabled: e.target.checked })}
                        className="rounded" />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Enable Lead Auto-reply</span>
                    </label>

                    {settings.autoReplyEnabled && (
                      <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                        <div>
                          <label className={labelClass}>Auto-reply Subject</label>
                          <input type="text" value={settings.autoReplySubject}
                            onChange={(e) => setSettings({ ...settings, autoReplySubject: e.target.value })}
                            className={panelInputClass} placeholder="e.g. Thanks for reaching out!" />
                        </div>
                        <div>
                          <label className={labelClass}>Auto-reply Message</label>
                          <textarea value={settings.autoReplyMessage}
                            onChange={(e) => setSettings({ ...settings, autoReplyMessage: e.target.value })}
                            className={panelInputClass} rows={4} placeholder="Write your thank you message..." />
                          <p className="text-[10px] text-gray-400 mt-1 italic">Sent automatically to the lead's email.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === 'embed' && (
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase mb-3">Embed This Form</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                Copy this code and paste it anywhere on your website — leads will be tracked automatically.
              </p>
              <div className="bg-gray-900 dark:bg-black/50 border border-white/10 rounded-xl p-4 mb-3">
                <code className="text-xs text-green-400 break-all">{embedCode}</code>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(embedCode) }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm shadow-blue-500/20">
                Copy Embed Code
              </button>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Direct Link</p>
                <a href={`/f/${form.id}`} target="_blank"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/f/{form.id}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Live Preview */}
        <div className="flex-1 bg-gray-100 dark:bg-[#0e1117] overflow-auto p-8">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-600 uppercase text-center mb-6">Live Preview</p>
          <div className="max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden"
            style={{ backgroundColor: settings.bgColor, fontFamily: settings.fontFamily }}>
            <div className="p-8">
              <h2 className="text-xl font-bold mb-6" style={{color: '#111827'}}>{name}</h2>
              {fields.length === 0 ? (
                <p className="text-sm text-center py-8" style={{color: '#9ca3af'}}>Add fields from the left panel</p>
              ) : (
                <div className="space-y-6">
                  {/* Group fields by step for preview */}
                  {Array.from(new Set(fields.map(f => f.step))).sort((a, b) => a - b).map(stepNum => (
                    <div key={stepNum} className="space-y-4 relative pt-4 border-t border-dashed border-gray-200">
                      <span className="absolute -top-3 left-0 bg-white px-2 text-[10px] font-bold text-gray-400">PAGE {stepNum}</span>
                      {fields.filter(f => f.step === stepNum).map((field) => (
                        <div key={field.id}>
                      <label className="block text-sm font-medium mb-1" style={{color: '#374151'}}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea placeholder={field.placeholder} rows={3}
                          className="w-full border px-3 py-2 text-sm"
                          style={{ borderRadius: settings.borderRadius, borderColor: '#e5e7eb', color: '#9ca3af', backgroundColor: 'rgba(255,255,255,0.8)' }} readOnly />
                      ) : field.type === 'select' ? (
                        <select className="w-full border px-3 py-2 text-sm"
                          style={{ borderRadius: settings.borderRadius, borderColor: '#e5e7eb', color: '#6b7280', backgroundColor: 'rgba(255,255,255,0.8)' }}>
                          <option>Select an option</option>
                          {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'radio' ? (
                        <div className="space-y-2">
                          {field.options?.map(opt => (
                            <label key={opt} className="flex items-center gap-2 text-sm" style={{color: '#4b5563'}}>
                              <input type="radio" readOnly /> {opt}
                            </label>
                          ))}
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <div className="space-y-2">
                          {field.options?.map(opt => (
                            <label key={opt} className="flex items-center gap-2 text-sm" style={{color: '#4b5563'}}>
                              <input type="checkbox" readOnly /> {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input type={field.type} placeholder={field.placeholder}
                          className="w-full border px-3 py-2 text-sm"
                          style={{ borderRadius: settings.borderRadius, borderColor: '#e5e7eb', color: '#9ca3af', backgroundColor: 'rgba(255,255,255,0.8)' }} readOnly />
                      )}
                    </div>
                  ))}
                    </div>
                  ))}
                  <div className="pt-2 flex gap-2">
                    {/* Placeholder buttons for preview */}
                    {fields.length > 0 && Math.max(...fields.map(f => f.step)) > 1 && (
                      <button className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-semibold text-sm" style={{ borderRadius: settings.borderRadius }}>Back</button>
                    )}
                    <button className="flex-1 py-2.5 text-white font-semibold text-sm"
                      style={{ backgroundColor: settings.accentColor, borderRadius: settings.borderRadius }}>
                      {settings.submitLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}