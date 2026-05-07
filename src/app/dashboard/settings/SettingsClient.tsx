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
    <div className="flex flex-col lg:flex-row gap-8 items-start pb-20">
      {/* Settings Sub-Sidebar */}
      <aside className="w-full lg:w-64 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide sticky top-0">
        <SettingsNavLink 
          icon={<UserIcon className="w-3.5 h-3.5" />} 
          label="My Profile" 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
        />
        <SettingsNavLink 
          icon={<Building2 className="w-3.5 h-3.5" />} 
          label="Workspace" 
          active={activeTab === 'workspace'} 
          onClick={() => setActiveTab('workspace')}
        />
        <SettingsNavLink 
          icon={<Mail className="w-3.5 h-3.5" />} 
          label="Team Members" 
          active={activeTab === 'team'} 
          onClick={() => setActiveTab('team')}
        />
        <SettingsNavLink 
          icon={<Globe className="w-3.5 h-3.5" />} 
          label="Webhooks" 
          active={activeTab === 'webhooks'} 
          onClick={() => setActiveTab('webhooks')}
        />
        
        <div className="hidden lg:block pt-3 mt-3 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1 w-full space-y-6 animate-in slide-in-from-right-4 duration-500">
        
        {/* Profile Section */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="glass-card p-7 rounded-3xl space-y-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black font-syne tracking-tight text-foreground">Security</h2>
                  <p className="text-[10px] font-medium text-muted-foreground">Update your account credentials</p>
                </div>
              </div>
              
              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Email</label>
                  <input readOnly value={user?.email || ''} className="w-full bg-gray-100/50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl py-3 px-5 text-sm font-medium cursor-not-allowed opacity-60 text-foreground" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-foreground" 
                    placeholder="••••••••" 
                  />
                </div>
                {pwMsg && <div className={`p-3 rounded-xl text-[10px] font-bold border ${pwMsg.includes('successfully') ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>{pwMsg}</div>}
                <button 
                  onClick={updatePassword}
                  disabled={pwSaving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-40 flex items-center gap-2"
                >
                  {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  {pwSaving ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Section */}
        {activeTab === 'workspace' && (
          <div className="glass-card p-7 rounded-3xl space-y-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black font-syne tracking-tight text-foreground">Workspace Identity</h2>
                <p className="text-[10px] font-medium text-muted-foreground">Manage your organization details</p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Organization Name</label>
                <input 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-foreground" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unique Slug</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold text-muted-foreground/50">
                  <Globe className="w-3.5 h-3.5" />
                  <span>formtrack.com/org/</span><span className="text-foreground">{org?.slug}</span>
                </div>
              </div>
              <button 
                onClick={saveOrg}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-40 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {saved ? 'Saved' : saving ? 'Saving...' : 'Update Workspace'}
              </button>
            </div>
          </div>
        )}

        {/* Team Section */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="glass-card p-7 rounded-3xl space-y-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black font-syne tracking-tight text-foreground">Invite Team Member</h2>
                  <p className="text-[10px] font-medium text-muted-foreground">Add collaborators to your workspace</p>
                </div>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 space-y-1.5 w-full">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Member Email</label>
                    <input 
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-foreground" 
                    />
                  </div>
                  <button 
                    disabled={inviting}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-40"
                  >
                    {inviting ? 'Inviting...' : 'Send Invite'}
                  </button>
                </div>
                {inviteMsg && (
                  <div className={`p-3 rounded-xl space-y-2 ${inviteMsg.includes('success') ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                    <p className={`text-[10px] font-bold ${inviteMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{inviteMsg}</p>
                    {generatedLink && (
                      <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
                        <input readOnly value={generatedLink} className="flex-1 bg-transparent text-[10px] font-mono outline-none truncate" />
                        <button 
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(generatedLink); alert('Link copied!') }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg hover:bg-blue-700 transition-all"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="glass-card p-7 rounded-3xl space-y-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
               <h3 className="text-base font-black font-syne tracking-tight text-foreground">Active Members</h3>
               <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{user?.email}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin (You)</p>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Webhooks Section */}
        {activeTab === 'webhooks' && (
          <div className="glass-card p-7 rounded-3xl space-y-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black font-syne tracking-tight text-foreground">Webhooks & Integrations</h2>
                <p className="text-[10px] font-medium text-muted-foreground">Send lead data to Slack or Discord</p>
              </div>
            </div>
            
            <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-1.5">
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Slack & Discord Support</p>
               <p className="text-xs font-medium leading-relaxed">Get instant notifications when a new lead is captured.</p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Webhook URL</label>
                <input 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium text-foreground" 
                  placeholder="https://hooks.slack.com/services/..." 
                />
              </div>
              <button 
                onClick={saveWebhook}
                disabled={webhookSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-40 flex items-center gap-2"
              >
                {webhookSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : webhookSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {webhookSaved ? 'Saved' : webhookSaving ? 'Saving...' : 'Save Webhook'}
              </button>
            </div>
          </div>
        )}

        {/* Global Action Footer */}
        <div className="p-7 rounded-3xl bg-red-500/5 border border-red-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
           <div>
             <h4 className="text-base font-black font-syne tracking-tight text-red-600">Danger Zone</h4>
             <p className="text-[10px] font-medium text-muted-foreground">Manage critical account actions.</p>
           </div>
           <button
             onClick={handleSignOut}
             className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-red-500/20 active:scale-95"
           >
             Sign Out Everywhere
           </button>
        </div>

      </main>
    </div>
  )
}

function SettingsNavLink({ icon, label, active, onClick, danger }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-3xl text-sm font-bold transition-all group ${
        active 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
          : danger 
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
            : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <div className={`transition-transform group-hover:scale-110 ${active ? 'text-white' : danger ? 'text-red-500' : 'text-blue-600'}`}>
        {icon}
      </div>
      {label}
      {active && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
    </button>
  )
}