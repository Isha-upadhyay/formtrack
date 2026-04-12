import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormBuilder from './FormBuilder'

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: form } = await (supabase.from('forms') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (!form) notFound()

  return <FormBuilder form={form} />
}