import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormSettingsClient from './FormSettingsClient'

export default async function FormSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: form } = await (supabase.from('forms') as any)
    .select('*')
    .eq('id', id)
    .single()

  if (!form) notFound()

  return <FormSettingsClient form={form} />
}
