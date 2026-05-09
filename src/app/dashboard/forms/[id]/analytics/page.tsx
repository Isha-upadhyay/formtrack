import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsClient from './AnalyticsClient'

export default async function FormAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>User not found. Please log in.</div>

  const { data: formData } = await (supabase.from('forms') as any)
    .select('*')
    .eq('id', id)
    .limit(1)

  const form = formData?.[0]

  if (!form) return <div>Form not found or access denied.</div>

  const { data: leads } = await (supabase.from('leads') as any)
    .select('*')
    .eq('form_id', id)
    .order('created_at', { ascending: false })

  return <AnalyticsClient form={form} leads={leads || []} />
}
