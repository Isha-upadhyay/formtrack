import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '@/lib/env'

export async function POST(request: Request) {
  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  })

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const adminSupabase = createAdminClient() 
    // Admin client use karo — RLS bypass hoga, session timing issue nahi aayega
    const { data: profile } = await adminSupabase.from('profiles').select('org_id').eq('id', user.id).single() as { data: { org_id: string } | null }
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const order = await razorpay.orders.create({
      amount: 99900,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
        org_id: profile.org_id,
        plan: 'pro',
      },
    })

    console.info('Razorpay order created', {
      order_id: order.id,
      user_id: user.id,
      org_id: profile.org_id,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json(order)
  } catch (err) {
    console.error('Razorpay error:', err)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}