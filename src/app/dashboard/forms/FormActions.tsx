'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

  const btnBase = "text-xs px-3 py-1.5 rounded-lg border transition font-medium"
  const btnDefault = `${btnBase} border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5`
  const btnDanger = `${btnBase} border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`

  const isActive = status === 'active'

  return (
    <div className="flex items-center gap-2 ml-4">
      <button onClick={copyEmbed} className={btnDefault}>
        {copied ? '✅ Copied!' : '📋 Embed'}
      </button>
      <Link href={`/dashboard/forms/${formId}/edit`} className={btnDefault}>
        ✏️ Edit
      </Link>
      <button onClick={toggleActive} disabled={loading} className={`${btnDefault} disabled:opacity-50`}>
        {isActive ? '⏸ Pause' : '▶ Activate'}
      </button>
      <button onClick={deleteForm} disabled={loading} className={`${btnDanger} disabled:opacity-50`}>
        🗑 Delete
      </button>
    </div>
  )
}