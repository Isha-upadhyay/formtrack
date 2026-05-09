'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveFormSettings(formId: string, name: string, settings: Record<string, unknown>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) return { error: 'Profile not found' }

  const { error } = await (supabase.from('forms') as any)
    .update({ name, settings })
    .eq('id', formId)
    .eq('org_id', profile.org_id)

  if (error) {
    console.error('SETTINGS_SAVE_ERROR:', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/forms/${formId}/settings`)
  return { success: true }
}
