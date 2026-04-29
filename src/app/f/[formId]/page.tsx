import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicForm from './PublicForm'

export default async function PublicFormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params
  const supabase = await createClient()

  const { data: form } = await (supabase.from('forms') as any)
    .select('*')
    .eq('id', formId)
    .eq('is_active', true)
    .single()

  if (!form) notFound()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117] flex items-center justify-center p-4">
      <PublicForm form={form} />
    </div>
  )
}