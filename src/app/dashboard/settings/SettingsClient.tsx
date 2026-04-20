'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    await (supabase.from('organizations') as any).update({ name: orgName }).eq('id', org?.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const updatePassword = async () => {
    if (newPassword.length < 6) { setPwMsg('Min 6 characters'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false)
    if (error) setPwMsg(error.message)
    else { setPwMsg('Password updated!'); setNewPassword('') }
    setTimeout(() => setPwMsg(''), 3000)
  }

  const cardClass = "bg-white dark:bg-[#1c2128] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-6"
  const inputClass = "w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition"
  const labelClass = "text-xs font-medium text-gray-500 dark:text-slate-400 block mb-1.5"

  return (
    <div className="space-y-6">

      {/* Account Info */}
      <div className={cardClass}>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
        <div>
          <label className={labelClass}>Email</label>
          <p className="text-sm text-gray-900 dark:text-slate-300 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 px-4 py-2.5 rounded-xl">{user?.email}</p>
        </div>
      </div>

      {/* Organization */}
      <div className={cardClass}>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Organization</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Organization Name</label>
            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <p className="text-sm text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 px-4 py-2.5 rounded-xl">{org?.slug}</p>
          </div>
          <button onClick={saveOrg} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-sm shadow-blue-500/20">
            {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className={cardClass}>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters" className={inputClass} />
          </div>
          {pwMsg && (
            <p className={`text-sm font-medium ${pwMsg.includes('updated') ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {pwMsg}
            </p>
          )}
          <button onClick={updatePassword} disabled={pwSaving}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition">
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-[#1c2128] rounded-2xl border border-red-100 dark:border-red-500/20 shadow-sm p-6">
        <h2 className="font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Sign out from all devices and end your session.</p>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          className="border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition">
          Sign Out
        </button>
      </div>

    </div>
  )
}