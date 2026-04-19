'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date'

interface Field {
  id: string
  type: FieldType
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
  autoReplyEnabled: boolean
  notificationEmail?: string  // Fix #10: lead notification email
}

interface Form {
  id: string
  name: string
  description?: string   // Fix #14: include description
  fields: Field[]
  settings: FormSettings
  is_active: boolean
}

interface Form {
  id: string
  name: string
  description?: string
  fields: Field[]
  settings: FormSettings
  is_active: boolean
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

function generateId() {
  return Math.random().toString(36).slice(2, 8)
}

export default function FormBuilder({ form }: { form: Form }) {
  const [name, setName] = useState(form.name)
  const [description, setDescription] = useState(form.description || '')  // Fix #14
  const [fields, setFields] = useState<Field[]>(form.fields || [])
  const [settings, setSettings] = useState<FormSettings>(form.settings || {
    submitLabel: 'Submit',
    successMessage: 'Thank you! We will be in touch.',
    bgColor: '#ffffff',
    accentColor: '#2563eb',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px',
    autoReplyEnabled: false,
    notificationEmail: '',
  })
  const [activeTab, setActiveTab] = useState<'fields' | 'design' | 'settings' | 'embed'>('fields')
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Add field
  const addField = (type: FieldType) => {
    const newField: Field = {
      id: generateId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: '',
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    }
    setFields([...fields, newField])
    setSelectedField(newField.id)
  }

  // Update field
  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  // Delete field
  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
    setSelectedField(null)
  }

  // Move field up/down
  const moveField = (id: string, dir: 'up' | 'down') => {
    const idx = fields.findIndex(f => f.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === fields.length - 1) return
    const newFields = [...fields]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[newFields[idx], newFields[swap]] = [newFields[swap], newFields[idx]]
    setFields(newFields)
  }

  // Fix #9: Native HTML5 drag-and-drop reorder
  const dragFieldId = useRef<string | null>(null)
  const onDragStart = (id: string) => { dragFieldId.current = id }
  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault()
    if (!dragFieldId.current || dragFieldId.current === overId) return
    const from = fields.findIndex(f => f.id === dragFieldId.current)
    const to = fields.findIndex(f => f.id === overId)
    if (from === -1 || to === -1) return
    const reordered = [...fields]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setFields(reordered)
    dragFieldId.current = overId
  }
  const onDragEnd = () => { dragFieldId.current = null }

  // Save
  const handleSave = async () => {
    setSaving(true)
    await (supabase.from('forms') as any)
      .update({ name, description, fields, settings, updated_at: new Date().toISOString() })
      .eq('id', form.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const selectedFieldData = fields.find(f => f.id === selectedField)
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])

  const embedCode = `<script src="${origin}/embed.js" data-form-id="${form.id}"></script>`

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/forms')}
            className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="font-semibold text-gray-900 bg-transparent border-none outline-none text-lg" />
        </div>
        <div className="flex items-center gap-3">
          <a href={`/f/${form.id}`} target="_blank"
            className="text-sm text-blue-600 hover:underline">Preview ↗</a>
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Panel — Tabs */}
        <div className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col flex-shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['fields', 'design', 'settings', 'embed'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Add Field</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {FIELD_TYPES.map((ft) => (
                  <button key={ft.type} onClick={() => addField(ft.type)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition text-center">
                    <span className="text-lg">{ft.icon}</span>
                    <span className="text-xs text-gray-600">{ft.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Form Fields</p>
              {fields.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No fields yet. Add one above!</p>
              ) : (
                <div className="space-y-2">
                  {fields.map((field, idx) => (
                    <div key={field.id}
                      draggable
                      onDragStart={() => onDragStart(field.id)}
                      onDragOver={(e) => onDragOver(e, field.id)}
                      onDragEnd={onDragEnd}
                      onClick={() => setSelectedField(field.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedField === field.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Fix #9: Drag handle */}
                          <span className="text-gray-300 cursor-grab active:cursor-grabbing select-none text-xs">⠿⠿</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{field.label}</p>
                            <p className="text-xs text-gray-400">{field.type}{field.required ? ' · required' : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up') }}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20">↑</button>
                          <button onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down') }}
                            disabled={idx === fields.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20">↓</button>
                          <button onClick={(e) => { e.stopPropagation(); deleteField(field.id) }}
                            className="p-1 text-red-400 hover:text-red-600">×</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Field Editor */}
              {selectedFieldData && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Edit Field</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Label</label>
                      <input value={selectedFieldData.label}
                        onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Placeholder</label>
                      <input value={selectedFieldData.placeholder || ''}
                        onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {selectedFieldData.options && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Options (one per line)</label>
                        <textarea
                          value={selectedFieldData.options.join('\n')}
                          onChange={(e) => updateField(selectedFieldData.id, { options: e.target.value.split('\n') })}
                          rows={4}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedFieldData.required}
                        onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                        className="rounded" />
                      <span className="text-sm text-gray-700">Required field</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Design Tab */}
          {activeTab === 'design' && (
            <div className="p-4 space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Appearance</p>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.bgColor}
                    onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <input value={settings.bgColor}
                    onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <input value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Border Radius</label>
                <select value={settings.borderRadius}
                  onChange={(e) => setSettings({ ...settings, borderRadius: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="0px">Sharp (0px)</option>
                  <option value="4px">Small (4px)</option>
                  <option value="8px">Medium (8px)</option>
                  <option value="12px">Large (12px)</option>
                  <option value="999px">Pill</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Font Family</label>
                <select value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
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
            <div className="p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Form Settings</p>
              {/* Fix #14: Description field */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Form Description</label>
                <textarea value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Short description shown on the form"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Submit Button Label</label>
                <input value={settings.submitLabel}
                  onChange={(e) => setSettings({ ...settings, submitLabel: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Success Message</label>
                <textarea value={settings.successMessage}
                  onChange={(e) => setSettings({ ...settings, successMessage: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {/* Fix #10: Notification email */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  📧 Lead Notification Email
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail || ''}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">Get an email every time a new lead submits this form</p>
              </div>
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === 'embed' && (
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Embed This Form</p>
              <p className="text-xs text-gray-500 mb-4">
                Copy this code and paste it anywhere on your website — leads will be tracked automatically.
              </p>
              <div className="bg-gray-900 rounded-xl p-4 mb-3">
                <code className="text-xs text-green-400 break-all">{embedCode}</code>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(embedCode) }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                Copy Embed Code
              </button>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1">Direct Link</p>
                <a href={`/f/${form.id}`} target="_blank"
                  className="text-xs text-blue-600 hover:underline break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/f/{form.id}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Live Preview */}
        <div className="flex-1 bg-gray-100 overflow-auto p-8">
          <p className="text-xs font-semibold text-gray-400 uppercase text-center mb-6">Live Preview</p>
          <div className="max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden"
            style={{ backgroundColor: settings.bgColor, fontFamily: settings.fontFamily }}>
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{name}</h2>
              {fields.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Add fields from the left panel</p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea placeholder={field.placeholder} rows={3}
                          className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-400"
                          style={{ borderRadius: settings.borderRadius }}
                          readOnly />
                      ) : field.type === 'select' ? (
                        <select className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-400"
                          style={{ borderRadius: settings.borderRadius }}>
                          <option>Select an option</option>
                          {field.options?.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'radio' ? (
                        <div className="space-y-2">
                          {field.options?.map(opt => (
                            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                              <input type="radio" readOnly /> {opt}
                            </label>
                          ))}
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <div className="space-y-2">
                          {field.options?.map(opt => (
                            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                              <input type="checkbox" readOnly /> {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input type={field.type} placeholder={field.placeholder}
                          className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-400"
                          style={{ borderRadius: settings.borderRadius }}
                          readOnly />
                      )}
                    </div>
                  ))}
                  <button className="w-full py-2.5 text-white font-semibold text-sm mt-2"
                    style={{ backgroundColor: settings.accentColor, borderRadius: settings.borderRadius }}>
                    {settings.submitLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}