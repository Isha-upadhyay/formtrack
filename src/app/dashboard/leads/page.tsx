import { createClient } from '@/lib/supabase/server'
import LeadsClient from './LeadsClient'

export default async function LeadsPage() {
  const supabase = await createClient()

  const { data: leadsRaw } = await supabase
    .from('leads')
    .select('*, forms(name, fields)')
    .order('created_at', { ascending: false })

  const { data: formsRaw } = await supabase
    .from('forms')
    .select('id, name')
    .order('name')

  return (
    <LeadsClient
      leads={(leadsRaw ?? []) as any}
      forms={(formsRaw ?? []) as any}
    />
  )
}