import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token
  if (!token) redirect('/')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login but keep the token
    redirect(`/login?returnTo=/accept-invite?token=${token}`)
  }

  // 1. Find invitation
  const { data: invitation, error: inviteErr } = await (supabase
    .from('invitations') as any)
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (inviteErr || !invitation) {
    return <ErrorState message="This invitation is invalid or has already been used." />
  }

  // Check expiration
  if (new Date(invitation.expires_at) < new Date()) {
    return <ErrorState message="This invitation has expired. Please ask for a new one." />
  }

  // 2. Update user profile
  const { error: updateErr } = await (supabase
    .from('profiles') as any)
    .update({
      org_id: invitation.org_id,
      role: invitation.role
    })
    .eq('id', user.id)

  if (updateErr) {
    return <ErrorState message="Failed to join the organization. Please try again." />
  }

  // 3. Mark invitation as accepted
  await (supabase
    .from('invitations') as any)
    .update({ status: 'accepted' })
    .eq('id', invitation.id)

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-10 rounded-[3rem] text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black font-syne tracking-tight">Welcome to the Team!</h1>
        <p className="text-muted-foreground text-sm font-medium">
          You have successfully joined the organization. You now have <strong>{invitation.role}</strong> access.
        </p>
        <Link 
          href="/dashboard"
          className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-10 rounded-[3rem] text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black font-syne tracking-tight">Invitation Error</h1>
        <p className="text-muted-foreground text-sm font-medium">{message}</p>
        <Link 
          href="/"
          className="block w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-white/10"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
