import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Get user's org from profiles
  const { data: profile } = await (supabase.from('profiles') as any).select('org_id').eq('id', user.id).single()
  
  if (!profile?.org_id) redirect('/onboarding')

  // Get org details from 'orgs' table (not 'organizations')
  const { data: orgRaw } = await (supabase.from('orgs') as any).select('*').eq('id', profile.org_id).single()

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Preferences</span>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight font-syne">Settings</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage your profile and workspace.</p>
      </div>
      
      <SettingsClient user={user} org={orgRaw} />
    </div>
  )
}