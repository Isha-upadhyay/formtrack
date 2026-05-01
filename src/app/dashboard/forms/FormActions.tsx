'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Play, 
  Pause, 
  Pencil, 
  Trash2, 
  Share2, 
  Check, 
  ExternalLink 
} from 'lucide-react'

export default function FormActions({ formId, status }: { formId: string; status: string }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleActive = async () => {
    setLoading(true)
    const newStatus = status === 'active' ? 'paused' : 'active'
    await (supabase.from('forms') as any).update({ status: newStatus }).eq('id', formId)
    router.refresh(); setLoading(false)
  }

  const deleteForm = async () => {
    if (!confirm('Delete this form? All leads will also be deleted.')) return
    setLoading(true)
    await (supabase.from('forms') as any).delete().eq('id', formId)
    router.refresh(); setLoading(false)
  }

  const copyEmbed = () => {
    const code = `<script src="${window.location.origin}/embed.js" data-form-id="${formId}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const isActive = status === 'active'

  const btnBase = "h-10 px-3 flex items-center justify-center rounded-xl border transition-all active:scale-95"
  const btnDefault = `${btnBase} border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white`
  const btnDanger = `${btnBase} border-red-100 dark:border-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500`

  return (
    <div className="flex items-center gap-2">
      {/* Public Preview Link */}
      <a 
        href={`/f/${formId}`} 
        target="_blank" 
        className={btnDefault}
        title="View Public Form"
      >
        <ExternalLink className="w-4 h-4" />
      </a>

      {/* Embed Button */}
      <button 
        onClick={copyEmbed} 
        className={`${btnDefault} min-w-[90px]`}
        title="Copy Embed Code"
      >
        {copied ? (
          <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-[11px] font-bold">COPIED</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Embed</span>
          </span>
        )}
      </button>

      {/* Edit Link */}
      <Link href={`/dashboard/forms/${formId}/edit`} className={btnDefault} title="Edit Form">
        <Pencil className="w-4 h-4" />
      </Link>

      {/* Pause/Activate Toggle */}
      <button 
        onClick={toggleActive} 
        disabled={loading} 
        className={`${btnDefault} disabled:opacity-50`}
        title={isActive ? 'Pause Form' : 'Activate Form'}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        ) : isActive ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 fill-current" />
        )}
      </button>

      {/* Delete Button */}
      <button 
        onClick={deleteForm} 
        disabled={loading} 
        className={`${btnDanger} disabled:opacity-50`}
        title="Delete Form"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}