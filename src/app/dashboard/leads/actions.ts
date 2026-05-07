'use server'

import { createClient } from '@/lib/supabase/server'

export async function fetchMoreLeads(page: number, limit: number = 10, formId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('leads')
    .select(`
      *,
      forms (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (formId) {
    query = query.eq('form_id', formId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching more leads:', error)
    return []
  }

  return data || []
}
