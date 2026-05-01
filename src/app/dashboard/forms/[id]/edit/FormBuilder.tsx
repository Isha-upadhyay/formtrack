'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Type, 
  Mail, 
  Phone, 
  AlignLeft, 
  ChevronDown, 
  CircleDot, 
  CheckSquare, 
  Hash, 
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  GripVertical,
  ArrowLeft,
  Settings as SettingsIcon,
  Palette,
  Code2,
  Layers,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Check,
  X
} from 'lucide-react'

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

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'textarea', label: 'Message', icon: AlignLeft },
  { type: 'select', label: 'Dropdown', icon: ChevronDown },
  { type: 'radio', label: 'Single Choice', icon: CircleDot },
  { type: 'checkbox', label: 'Multi Choice', icon: CheckSquare },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: CalendarIcon },
]

function generateId() { return Math.random().toString(36).slice(2, 8) }

export default function FormBuilder({ form }: { form: Form }) {
  const [name, setName] = useState(form.name)
  const [description, setDescription] = useState(form.description || '')
  const [fields, setFields] = useState<Field[]>(form.fields || [])
  const [settings, setSettings] = useState<FormSettings>(form.settings || {
    submitLabel: 'Submit', successMessage: 'Thank you! We will be in touch.',
    notificationEmail: '', autoReplyEnabled: false,
    autoReplySubject: 'Thanks for reaching out!',
    autoReplyMessage: 'Hi there,\n\nThanks for your message! We have received your inquiry and will get back to you shortly.',
    bgColor: '#ffffff', accentColor: '#2563eb', fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
  })

  useEffect(() => {
    setName(form.name); setDescription(form.description || ''); setFields(form.fields || [])
    if (form.settings) setSettings(form.settings)
  }, [form])

  const [activeTab, setActiveTab] = useState<'fields' | 'design' | 'settings' | 'embed'>('fields')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const addField = (type: FieldType) => {
    const maxStep = fields.length > 0 ? Math.max(...fields.map(f => f.step)) : 1
    const newField: Field = {
      id: generateId(), type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      placeholder: '', required: false, step: maxStep,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    }
    setFields([...fields, newField]); setSelectedField(newField.id)
  }

  const addStep = () => {
    const maxStep = fields.length > 0 ? Math.max(...fields.map(f => f.step)) : 1
    const newField: Field = { id: generateId(), type: 'text', label: 'New Step Field', required: false, step: maxStep + 1 }
    setFields([...fields, newField]); setSelectedField(newField.id)
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const deleteField = (id: string) => { setFields(fields.filter(f => f.id !== id)); setSelectedField(null) }

  const handleSave = async () => {
    setSaving(true)
    await (supabase.from('forms') as any)
      .update({ name, description, fields, settings, updated_at: new Date().toISOString() })
      .eq('id', form.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000); router.refresh()
  }

  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const embedCode = `<script src="${origin}/embed.js" data-form-id="${form.id}"></script>`

  const selectedFieldData = fields.find(f => f.id === selectedField)
  const panelInputClass = "w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1"

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-[#05070a]">
      {/* Premium Top Bar */}
      <header className="h-16 bg-white dark:bg-[#0d1117] border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/dashboard/forms')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex flex-col">
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="font-black tracking-tight text-lg bg-transparent border-none outline-none font-syne dark:text-white" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1">Editor &bull; {form.status}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
             <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-muted-foreground'}`}>
               <Monitor className="w-4 h-4" />
             </button>
             <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-muted-foreground'}`}>
               <Smartphone className="w-4 h-4" />
             </button>
          </div>
          <Link href={`/f/${form.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </Link>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
             {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Advanced Side Panel */}
        <aside className="w-80 bg-white dark:bg-[#0d1117] border-r border-gray-100 dark:border-white/5 flex flex-col z-20">
          <div className="flex p-2 gap-1 bg-gray-50 dark:bg-white/3">
             <TabBtn active={activeTab === 'fields'} onClick={() => setActiveTab('fields')} icon={<Layers className="w-4 h-4" />} label="Fields" />
             <TabBtn active={activeTab === 'design'} onClick={() => setActiveTab('design')} icon={<Palette className="w-4 h-4" />} label="Design" />
             <TabBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon className="w-4 h-4" />} label="Settings" />
             <TabBtn active={activeTab === 'embed'} onClick={() => setActiveTab('embed')} icon={<Code2 className="w-4 h-4" />} label="Embed" />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'fields' && (
              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Add Elements</h4>
                    <button onClick={addStep} className="text-[10px] font-bold text-blue-600 hover:underline">+ NEW STEP</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {FIELD_TYPES.map((ft) => (
                      <button key={ft.type} onClick={() => addField(ft.type)}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
                        <ft.icon className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{ft.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Form Structure</h4>
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div key={field.id} onClick={() => setSelectedField(field.id)}
                        className={`group p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          selectedField === field.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 dark:bg-white/3 border-white/5 hover:border-blue-500/30'
                        }`}>
                        <GripVertical className={`w-4 h-4 ${selectedField === field.id ? 'text-white/50' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{field.label}</p>
                          <p className={`text-[10px] font-medium uppercase tracking-widest ${selectedField === field.id ? 'text-white/60' : 'text-muted-foreground opacity-60'}`}>{field.type}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteField(field.id) }} className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg ${selectedField === field.id ? 'text-white' : 'text-red-500'}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedFieldData && (
                   <div className="p-5 bg-blue-600/5 rounded-[2rem] border border-blue-500/10 space-y-4 animate-in slide-in-from-bottom duration-300">
                     <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Edit {selectedFieldData.type}</h4>
                       <button onClick={() => setSelectedField(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
                     </div>
                     <div className="space-y-3">
                        <div>
                          <label className={labelClass}>Field Label</label>
                          <input value={selectedFieldData.label} onChange={e => updateField(selectedFieldData.id, { label: e.target.value })} className={panelInputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Placeholder</label>
                          <input value={selectedFieldData.placeholder || ''} onChange={e => updateField(selectedFieldData.id, { placeholder: e.target.value })} className={panelInputClass} />
                        </div>
                        {selectedFieldData.options && (
                          <div>
                            <label className={labelClass}>Options (one per line)</label>
                            <textarea value={selectedFieldData.options.join('\n')} onChange={e => updateField(selectedFieldData.id, { options: e.target.value.split('\n') })} className={panelInputClass} rows={3} />
                          </div>
                        )}
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-blue-600/5 rounded-xl transition-colors">
                           <input type="checkbox" checked={selectedFieldData.required} onChange={e => updateField(selectedFieldData.id, { required: e.target.checked })} className="w-4 h-4 rounded-md" />
                           <span className="text-xs font-bold text-muted-foreground">Required Field</span>
                        </label>
                     </div>
                   </div>
                )}
              </div>
            )}

            {activeTab === 'design' && (
              <div className="p-5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visual Style</h4>
                <div className="space-y-4">
                  <ColorPicker label="Background" value={settings.bgColor} onChange={v => setSettings({...settings, bgColor: v})} />
                  <ColorPicker label="Accent Color" value={settings.accentColor} onChange={v => setSettings({...settings, accentColor: v})} />
                  <div>
                    <label className={labelClass}>Corner Radius</label>
                    <select value={settings.borderRadius} onChange={e => setSettings({...settings, borderRadius: e.target.value})} className={panelInputClass}>
                       <option value="0px">Sharp</option>
                       <option value="8px">Soft</option>
                       <option value="16px">Rounded</option>
                       <option value="32px">Full Pill</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
               <div className="p-5 space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Automation</h4>
                 <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Admin Email</label>
                      <input type="email" value={settings.notificationEmail} onChange={e => setSettings({...settings, notificationEmail: e.target.value})} className={panelInputClass} placeholder="you@example.com" />
                    </div>
                    <div className="p-4 bg-white dark:bg-white/3 rounded-2xl border border-white/5">
                       <label className="flex items-center gap-3 cursor-pointer mb-4">
                          <input type="checkbox" checked={settings.autoReplyEnabled} onChange={e => setSettings({...settings, autoReplyEnabled: e.target.checked})} />
                          <span className="text-xs font-bold uppercase tracking-widest">Enable Auto-Reply</span>
                       </label>
                       {settings.autoReplyEnabled && (
                         <div className="space-y-3">
                           <input placeholder="Subject" value={settings.autoReplySubject} onChange={e => setSettings({...settings, autoReplySubject: e.target.value})} className={panelInputClass} />
                           <textarea placeholder="Message" value={settings.autoReplyMessage} onChange={e => setSettings({...settings, autoReplyMessage: e.target.value})} className={panelInputClass} rows={3} />
                         </div>
                       )}
                    </div>
                 </div>
               </div>
            )}

            {activeTab === 'embed' && (
              <div className="p-5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integration</h4>
                <div className="p-5 bg-gray-900 rounded-3xl border border-white/10">
                   <code className="text-[10px] text-green-400 break-all leading-relaxed font-mono">{embedCode}</code>
                </div>
                <button onClick={() => navigator.clipboard.writeText(embedCode)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Copy Embed Script
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Live Preview Central Canvas */}
        <main className="flex-1 bg-gray-50 dark:bg-[#05070a] flex flex-col items-center justify-center p-8 overflow-auto relative">
           {/* Canvas Decoration */}
           <div className="absolute inset-0 bg-grid opacity-[0.2]" />
           
           <div className={`transition-all duration-500 bg-white shadow-2xl overflow-hidden relative ${
             previewMode === 'mobile' ? 'w-[360px] h-[640px] rounded-[3rem] border-[8px] border-gray-900' : 'w-full max-w-2xl h-fit min-h-[400px] rounded-[2rem]'
           }`} style={{ fontFamily: settings.fontFamily, backgroundColor: settings.bgColor }}>
              
              {/* Fake Browser/Mobile Bar */}
              <div className={`flex items-center px-6 py-4 border-b border-gray-100 ${previewMode === 'mobile' ? 'justify-center' : 'justify-start'}`}>
                {previewMode === 'desktop' && <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>}
                {previewMode === 'mobile' && <div className="w-16 h-4 bg-gray-100 rounded-full" />}
              </div>

              <div className="p-10">
                <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ color: '#0f172a' }}>{name}</h2>
                <p className="text-sm text-muted-foreground mb-10 leading-relaxed">{description || 'Start building your form to see it live here.'}</p>
                
                {fields.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] text-muted-foreground italic text-sm">
                    Drag fields from the sidebar
                  </div>
                ) : (
                  <div className="space-y-8">
                     {/* Preview grouped by steps */}
                     {Array.from(new Set(fields.map(f => f.step))).sort((a,b)=>a-b).map(stepNum => (
                       <div key={stepNum} className="space-y-6 relative pt-6 border-t border-dashed border-gray-200 first:border-0 first:pt-0">
                         {fields.filter(f => f.step === stepNum).map(field => (
                            <div key={field.id} className="space-y-2">
                               <label className="text-sm font-bold block" style={{ color: '#334155' }}>
                                 {field.label} {field.required && <span className="text-red-500">*</span>}
                               </label>
                               {field.type === 'textarea' ? (
                                 <div className="w-full h-24 bg-gray-50 border border-gray-200 p-3" style={{ borderRadius: settings.borderRadius }} />
                               ) : field.type === 'select' ? (
                                 <div className="w-full h-12 bg-gray-50 border border-gray-200 flex items-center justify-between px-4" style={{ borderRadius: settings.borderRadius }}>
                                   <span className="text-sm text-gray-400">Select an option</span>
                                   <ChevronDown className="w-4 h-4 text-gray-400" />
                                 </div>
                               ) : (
                                 <div className="w-full h-12 bg-gray-50 border border-gray-200 px-4" style={{ borderRadius: settings.borderRadius }} />
                               )}
                            </div>
                         ))}
                       </div>
                     ))}
                     
                     <button className="w-full py-4 text-white font-black text-sm transition-all hover:opacity-90 shadow-lg" 
                       style={{ backgroundColor: settings.accentColor, borderRadius: settings.borderRadius }}>
                       {settings.submitLabel}
                     </button>
                  </div>
                )}
              </div>
           </div>
        </main>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all ${
      active ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600' : 'text-muted-foreground hover:text-foreground'
    }`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  )
}

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden shadow-sm" />
        <input value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm font-mono" />
      </div>
    </div>
  )
}
