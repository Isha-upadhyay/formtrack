'use client'

import { useState } from 'react'

interface Subscription {
  plan: string
  status: string
}

export default function BillingClient({ subscription }: { subscription: Subscription | null }) {
  const [loading, setLoading] = useState(false)
  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      // Create order
      const res = await fetch('/api/payment/create-order', { method: 'POST' })
      const order = await res.json()

      if (order.error) {
        alert('Payment failed: ' + order.error)
        setLoading(false)
        return
      }

      // Load Razorpay
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'FormTrack',
          description: 'Pro Plan — Monthly',
          order_id: order.id,
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            })
            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              alert('🎉 Payment successful! You are now on Pro plan.')
              window.location.reload()
            } else {
              alert('Payment verification failed. Contact support.')
            }
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#2563eb',
          },
        }

        // @ts-expect-error Razorpay global
        const rzp = new window.Razorpay(options)
        rzp.open()
        setLoading(false)
      }
    } catch {
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isPro
              ? 'bg-blue-50 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isPro ? '⚡ Pro' : '🆓 Free'}
          </span>
          <span className="text-gray-500 text-sm">
            {isPro ? 'All features unlocked' : 'Limited to 2 forms, 100 leads/month'}
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-2 gap-4">
        {/* Free Plan */}
        <div className={`bg-white rounded-xl border-2 p-6 ${!isPro ? 'border-blue-500' : 'border-gray-100'} shadow-sm`}>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Free</h3>
          <p className="text-3xl font-extrabold text-gray-900 mb-4">₹0<span className="text-base font-normal text-gray-400">/mo</span></p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {['2 forms', '100 leads/month', 'Basic source tracking', 'Embed on website'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="w-full text-center py-2 rounded-lg border border-gray-200 text-gray-500 text-sm font-medium">
            {!isPro ? 'Current Plan' : 'Downgrade'}
          </div>
        </div>

        {/* Pro Plan */}
        <div className={`bg-white rounded-xl border-2 p-6 ${isPro ? 'border-blue-500' : 'border-gray-100'} shadow-sm relative`}>
          {!isPro && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
          )}
          <h3 className="font-bold text-gray-900 text-lg mb-1">Pro</h3>
          <p className="text-3xl font-extrabold text-gray-900 mb-4">₹999<span className="text-base font-normal text-gray-400">/mo</span></p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {[
              'Unlimited forms',
              'Unlimited leads',
              'Advanced UTM tracking',
              'Gmail/Outlook auto-reply',
              'CSV export',
              'Priority support',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="w-full text-center py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
              ✅ Active
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? 'Loading...' : 'Upgrade to Pro — ₹999/mo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}