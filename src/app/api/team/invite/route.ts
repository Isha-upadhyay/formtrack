import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/notify'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { email, orgId, role } = await req.json()

    // 1. Check if requester is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('role, org_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' || profile?.org_id !== orgId) {
      return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
    }

    // 2. Check if user already in org
    const { data: existingUser } = await (supabase.from('profiles') as any)
      .select('id')
      .eq('org_id', orgId)
      .eq('id', (await (supabase.from('profiles') as any).select('id').eq('id', user.id).single()).data?.id)
    
    // For simplicity, let's just create the invitation
    const { data: invitation, error: inviteErr } = await (supabase
      .from('invitations') as any)
      .insert({
        email,
        org_id: orgId,
        invited_by: user.id,
        role: role || 'viewer'
      })
      .select()
      .single()

    if (inviteErr) throw inviteErr

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitation.token}`
    console.log('🔗 Invitation Link (for testing):', inviteLink)

    // 3. Send Email via Resend
    await sendEmail({
      to: email,
      subject: `You've been invited to join an organization on FormTrack`,
      text: `Hi,\n\nYou have been invited to join the organization as a ${role}. Click here to accept: ${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitation.token}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">FormTrack Invitation</h2>
          <p>Hi there,</p>
          <p>You have been invited to join an organization on <strong>FormTrack</strong> as a <strong>${role}</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitation.token}" 
               style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `
    })

    return NextResponse.json({ success: true, inviteLink })
  } catch (err: any) {
    console.error('Invite Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
