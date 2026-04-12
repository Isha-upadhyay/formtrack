'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function FormActions({ formId, isActive }: { formId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleActive = async () => {
    setLoading(true)
    await (supabase.from('forms') as any).update({ is_active: !isActive }).eq('id', formId)
    router.refresh()
    setLoading(false)
  }

  const deleteForm = async () => {
    if (!confirm('Delete this form? All leads will also be deleted.')) return
    setLoading(true)
    await supabase.from('forms' as any).delete().eq('id', formId)
    router.refresh()
    setLoading(false)
  }

  const copyEmbed = () => {
    const code = `<script src="${window.location.origin}/embed.js" data-form-id="${formId}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 ml-4">
      <button onClick={copyEmbed}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium">
        {copied ? '✅ Copied!' : '📋 Embed'}
      </button>
      <Link href={`/dashboard/forms/${formId}/edit`}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium">
        ✏️ Edit
      </Link>
      <button onClick={toggleActive} disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium disabled:opacity-50">
        {isActive ? '⏸ Pause' : '▶ Activate'}
      </button>
      <button onClick={deleteForm} disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition font-medium disabled:opacity-50">
        🗑 Delete
      </button>
    </div>
  )
}