'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email?: string
}

interface Org {
  id: string
  name: string
  slug: string
}

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
    await (supabase.from('organizations') as any)
      .update({ name: orgName })
      .eq('id', org?.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const updatePassword = async () => {
    if (newPassword.length < 6) { setPwMsg('Min 6 characters'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwSaving(false)
    if (error) { setPwMsg(error.message) }
    else { setPwMsg('Password updated!'); setNewPassword('') }
    setTimeout(() => setPwMsg(''), 3000)
  }

  return (
    <div className="space-y-6">

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2.5 rounded-lg">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Organization</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Organization Name</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Slug</label>
            <p className="text-sm text-gray-400 bg-gray-50 px-3 py-2.5 rounded-lg">{org?.slug}</p>
          </div>
          <button onClick={saveOrg} disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
            {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes('updated') ? 'text-green-600' : 'text-red-500'}`}>
              {pwMsg}
            </p>
          )}
          <button onClick={updatePassword} disabled={pwSaving}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition">
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sign out from all devices and end your session.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          className="border border-red-200 text-red-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
          Sign Out
        </button>
      </div>

    </div>
  )
}