import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
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

    const { data: org } = await (supabase.from('organizations') as any)
      .select('id')
      .single()

    if (org) {
      // Upsert subscription
      await (supabase.from('subscriptions') as any)
        .upsert({
          org_id: org.id,
          plan: 'pro',
          status: 'active',
          razorpay_payment_id,
          razorpay_order_id,
        })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}