import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await razorpay.orders.create({
      amount: 99900, // ₹999 in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan: 'pro',
      },
    })

    return NextResponse.json(order)
  } catch (err) {
    console.error('Razorpay error:', err)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}