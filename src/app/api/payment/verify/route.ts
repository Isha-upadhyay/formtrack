import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { RAZORPAY_KEY_SECRET } from '@/lib/env'

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 })
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Update subscription in Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await (supabase.from('profiles') as any)
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.org_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const admin = createAdminClient()

    const planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const { error: updateError } = await (admin.from('orgs') as any)
      .update({
        plan: 'pro',
        plan_expires_at: planExpiresAt,
        razorpay_payment_id,
      })
      .eq('id', profile.org_id)

    if (updateError) {
      console.error('Failed to update org billing:', updateError)
      return NextResponse.json({ error: 'Failed to activate plan' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}