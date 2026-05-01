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
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Preferences</span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-syne">Settings</h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-lg font-medium">Manage your personal profile and workspace configuration.</p>
      </div>
      
      <SettingsClient user={user} org={orgRaw} />
    </div>
  )
}