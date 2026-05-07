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
interface Org { id: string; name: string; slug: string; webhook_url?: string }

export default function SettingsClient({ user, org }: { user: User | null, org: Org | null }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'team' | 'webhooks'>('profile')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [orgName, setOrgName] = useState(org?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [webhookUrl, setWebhookUrl] = useState(org?.webhook_url || '')
  const [webhookSaving, setWebhookSaving] = useState(false)
  const [webhookSaved, setWebhookSaved] = useState(false)
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
      if (data.error) alert('Failed: ' + data.error)
      else { setSaved(true); setTimeout(() => setSaved(false), 2000); router.refresh() }
    } catch (err) { setSaving(false); alert('Error saving changes') }
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

  const saveWebhook = async () => {
    setWebhookSaving(true)
    try {
      const res = await fetch('/api/org/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, orgId: org?.id })
      })
      const data = await res.json()
      setWebhookSaving(false)
      if (data.error) alert('Failed: ' + data.error)
      else { setWebhookSaved(true); setTimeout(() => setWebhookSaved(false), 2000); router.refresh() }
    } catch (err) { setWebhookSaving(false); alert('Error saving webhook') }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    setInviting(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, orgId: org?.id, role: 'viewer' })
      })
      const data = await res.json()
      if (data.error) setInviteMsg(data.error)
      else {
        setInviteMsg('Invitation sent successfully!')
        setGeneratedLink(data.inviteLink)
        setInviteEmail('')
      }
    } catch (err) {
      setInviteMsg('Failed to send invitation')
    }
    setInviting(false)
    setTimeout(() => setInviteMsg(''), 3000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Sidebar Navigation */}
      <div className="hidden md:block space-y-2">
         <nav className="sticky top-24 space-y-1">
            <SettingsNavLink 
              icon={<UserIcon className="w-4 h-4" />} 
              label="Profile" 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            />
            <SettingsNavLink 
              icon={<Building2 className="w-4 h-4" />} 
              label="Workspace" 
              active={activeTab === 'workspace'} 
              onClick={() => setActiveTab('workspace')}
            />
            <SettingsNavLink 
              icon={<UserIcon className="w-4 h-4" />} 
              label="Team" 
              active={activeTab === 'team'} 
              onClick={() => setActiveTab('team')}
            />
            <SettingsNavLink 
              icon={<Globe className="w-4 h-4" />} 
              label="Webhooks" 
              active={activeTab === 'webhooks'} 
              onClick={() => setActiveTab('webhooks')}
            />
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
              <SettingsNavLink 
                icon={<LogOut className="w-4 h-4" />} 
                label="Sign Out" 
                danger 
                onClick={handleSignOut}
              />
            </div>
         </nav>
      </div>

      <div className="md:col-span-2 space-y-12">
        {activeTab === 'profile' && (
          <>
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
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••••••" className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" />
                </div>
                {pwMsg && <div className={`p-4 rounded-2xl text-xs font-bold border ${pwMsg.includes('successfully') ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>{pwMsg}</div>}
                <button onClick={updatePassword} disabled={pwSaving} className="px-8 py-4 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-2xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center gap-3">
                  {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {pwSaving ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'workspace' && (
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
                <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" placeholder="e.g. My Awesome Team" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unique Slug</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold text-muted-foreground/50">
                  <Globe className="w-4 h-4" />
                  <span>formtrack.com/org/</span><span className="text-foreground">{org?.slug}</span>
                </div>
              </div>
              <button onClick={saveOrg} disabled={saving} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-40 flex items-center gap-3">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Settings Saved' : saving ? 'Saving Changes...' : 'Update Workspace'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold font-syne">Invite Team Member</h2>
              </div>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Member Email</label>
                  <div className="flex gap-2">
                    <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="flex-1 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" placeholder="colleague@company.com" required />
                    <button type="submit" disabled={inviting} className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-40">
                      {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                    </button>
                  </div>
                </div>
                {inviteMsg && (
                  <div className={`p-4 rounded-2xl space-y-3 ${inviteMsg.includes('success') ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <p className={`text-xs font-bold ${inviteMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{inviteMsg}</p>
                    {generatedLink && (
                      <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
                        <input readOnly value={generatedLink} className="flex-1 bg-transparent text-[10px] font-mono outline-none truncate" />
                        <button 
                          onClick={() => { navigator.clipboard.writeText(generatedLink); alert('Link copied!') }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition-all"
                        >
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-lg font-bold font-syne">Active Members</h3>
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                <div className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center font-bold">{user?.email?.[0].toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-bold">{user?.email}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Admin (You)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-600">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold font-syne">Webhooks & Integrations</h2>
            </div>
            
            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-2">
               <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Slack & Discord Support</p>
               <p className="text-sm font-medium">Get instant notifications when a new lead is captured. Just paste your webhook URL below.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Webhook URL</label>
                <input 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium" 
                  placeholder="https://hooks.slack.com/services/..." 
                />
              </div>
              <button 
                onClick={saveWebhook}
                disabled={webhookSaving}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-40 flex items-center gap-3"
              >
                {webhookSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : webhookSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {webhookSaved ? 'Webhook Saved' : webhookSaving ? 'Saving...' : 'Save Webhook'}
              </button>
            </div>
          </div>
        )}

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

function SettingsNavLink({ icon, label, active, danger, onClick }: { icon: any, label: string, active?: boolean, danger?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
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