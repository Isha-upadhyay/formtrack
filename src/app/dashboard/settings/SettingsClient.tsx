'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User as UserIcon, 
  Building2, 
  Lock, 
  LogOut, 
  Save, 
  Check, 
  Loader2, 
  Globe,
  Mail,
  ShieldAlert,
  ChevronRight
} from 'lucide-react'

interface User { id: string; email?: string }
interface Org { id: string; name: string; slug: string }

export default function SettingsClient({ user, org }: { user: User | null, org: Org | null }) {
  const [orgName, setOrgName] = useState(org?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const saveOrg = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/org/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, orgId: org?.id })
      })
      const data = await res.json()
      setSaving(false)
      
      if (data.error) {
        alert('Failed to save changes: ' + data.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    } catch (err) {
      setSaving(false)
      alert('Something went wrong. Please try again.')
    }
  }

  const updatePassword = async () => {
    if (newPassword.length < 6) { setPwMsg('Min 6 characters'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false)
    if (error) setPwMsg(error.message)
    else { setPwMsg('Password updated successfully!'); setNewPassword('') }
    setTimeout(() => setPwMsg(''), 3000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Sidebar Navigation (Visual Only for now) */}
      <div className="hidden md:block space-y-2">
         <nav className="sticky top-24 space-y-1">
            <SettingsNavLink icon={<UserIcon className="w-4 h-4" />} label="Account Info" active />
            <SettingsNavLink icon={<Building2 className="w-4 h-4" />} label="Workspace" />
            <SettingsNavLink icon={<Lock className="w-4 h-4" />} label="Security" />
            <SettingsNavLink icon={<LogOut className="w-4 h-4" />} label="Sign Out" danger />
         </nav>
      </div>

      <div className="md:col-span-2 space-y-12">
        {/* Account Info */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
               <UserIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-syne">Account Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium">
                 <Mail className="w-4 h-4 text-muted-foreground" />
                 <span>{user?.email}</span>
                 <span className="ml-auto px-2 py-0.5 bg-green-500/10 text-green-600 text-[10px] font-black rounded-md">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600">
               <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-syne">Workspace Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace Name</label>
              <input 
                value={orgName} 
                onChange={(e) => setOrgName(e.target.value)} 
                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium"
                placeholder="e.g. My Awesome Team"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unique Slug</label>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold text-muted-foreground/50">
                 <Globe className="w-4 h-4" />
                 <span>formtrack.com/org/</span>
                 <span className="text-foreground">{org?.slug}</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic ml-1">Workspace slugs cannot be changed yet.</p>
            </div>

            <button 
              onClick={saveOrg} 
              disabled={saving}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-40 flex items-center gap-3"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Settings Saved' : saving ? 'Saving Changes...' : 'Update Workspace'}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-amber-600/10 rounded-2xl flex items-center justify-center text-amber-600">
               <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-syne">Security & Password</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Secret Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••" 
                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium"
              />
            </div>

            {pwMsg && (
              <div className={`p-4 rounded-2xl text-xs font-bold border ${
                pwMsg.includes('successfully') 
                  ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
              }`}>
                {pwMsg}
              </div>
            )}

            <button 
              onClick={updatePassword} 
              disabled={pwSaving}
              className="px-8 py-4 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-2xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center gap-3"
            >
              {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {pwSaving ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                <ShieldAlert className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold font-syne text-red-600">Danger Zone</h2>
                <p className="text-xs text-red-600/60 font-medium">Be careful with these actions.</p>
             </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white dark:bg-white/5 rounded-3xl border border-red-500/10">
             <div>
                <p className="text-sm font-bold">Sign out from all devices</p>
                <p className="text-xs text-muted-foreground font-medium">This will end your current session immediately.</p>
             </div>
             <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
                className="px-6 py-3 border border-red-500/20 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsNavLink({ icon, label, active, danger }: { icon: any, label: string, active?: boolean, danger?: boolean }) {
  return (
    <button className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : danger
          ? 'text-red-600 hover:bg-red-500/10'
          : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 hover:text-foreground'
    }`}>
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {!active && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  )
}