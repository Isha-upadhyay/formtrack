'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLAN_LIMITS } from '@/types'
import { 
  Check, 
  Zap, 
  Shield, 
  TrendingUp, 
  BarChart2, 
  Sparkles, 
  Loader2,
  Calendar,
  CreditCard,
  Crown
} from 'lucide-react'

interface OrgBilling {
  plan: string
  plan_expires_at: string | null
  leads_used_this_month: number
}

export default function BillingClient({ org }: { org: OrgBilling | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const expiresAtMs = org?.plan_expires_at ? new Date(org.plan_expires_at).getTime() : NaN
  const isPro = org?.plan === 'pro' && Number.isFinite(expiresAtMs) && expiresAtMs > Date.now()
  const leadsLimit = isPro ? Infinity : PLAN_LIMITS.free.leads
  const usagePercent = leadsLimit === Infinity ? 0 : Math.min(((org?.leads_used_this_month ?? 0) / leadsLimit) * 100, 100)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create-order', { method: 'POST' })
      const order = await res.json()
      if (order.error) { alert('Payment failed: ' + order.error); setLoading(false); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount, currency: order.currency,
          name: 'FormTrack', description: 'Pro Plan — Monthly', order_id: order.id,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              alert('🎉 Payment successful! You are now on Pro plan.')
              router.refresh()
            }
            else alert('Payment verification failed. Contact support.')
          },
          prefill: { name: '', email: '' },
          theme: { color: '#2563eb' },
        }
        // @ts-expect-error Razorpay global
        const rzp = new window.Razorpay(options)
        rzp.open(); setLoading(false)
      }
    } catch { alert('Something went wrong'); setLoading(false) }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Premium Usage Dashboard */}
      <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${isPro ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-600/10 text-blue-600'}`}>
                     {isPro ? <Crown className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <h2 className="text-xl font-bold font-syne">Subscription Status</h2>
               </div>
               
               <div className="flex items-center gap-3">
                  <span className={`text-3xl font-black tracking-tighter font-syne ${isPro ? 'text-amber-600' : 'text-foreground'}`}>
                     {isPro ? 'Pro Member' : 'Free Tier'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    isPro ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-600/10 text-blue-600'
                  }`}>
                    {isPro ? 'Lifetime Access' : 'Trial Active'}
                  </span>
               </div>
            </div>

            <div className="w-full md:w-80 space-y-4">
               <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <span>Usage this month</span>
                  <span className="text-foreground">{org?.leads_used_this_month ?? 0} / {leadsLimit === Infinity ? '∞' : leadsLimit}</span>
               </div>
               <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${isPro ? 'bg-amber-500' : 'bg-blue-600'}`}
                    style={{ width: `${usagePercent}%` }}
                  />
               </div>
               <p className="text-[10px] text-muted-foreground font-medium italic">Your cycle resets on the 1st of every month.</p>
            </div>
         </div>
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className={`glass-card p-10 rounded-[3.5rem] border-2 transition-all duration-500 ${!isPro ? 'border-blue-600 shadow-2xl shadow-blue-500/10 scale-[1.02]' : 'border-white/5 opacity-60'}`}>
          <div className="mb-8">
            <h3 className="text-lg font-black font-syne mb-2">Basic Tracker</h3>
            <p className="text-4xl font-black font-syne tracking-tighter">₹0<span className="text-base text-muted-foreground font-bold">/mo</span></p>
          </div>
          
          <ul className="space-y-4 mb-10">
            {['2 active forms', '100 leads/month', 'Basic UTM mapping', 'Global form hosting'].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <div className="w-full py-4 bg-gray-50 dark:bg-white/5 text-muted-foreground text-center text-xs font-black uppercase tracking-widest rounded-2xl">
            {!isPro ? 'Current Plan' : 'Standard Access'}
          </div>
        </div>

        {/* Pro Plan */}
        <div className={`glass-card p-10 rounded-[3.5rem] border-2 transition-all duration-500 relative overflow-hidden group ${isPro ? 'border-amber-500 shadow-2xl shadow-amber-500/10 scale-[1.02]' : 'border-white/5'}`}>
          {!isPro && (
             <div className="absolute top-8 right-8 rotate-12">
                <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/30 animate-float">
                  Popular
                </div>
             </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-lg font-black font-syne mb-2">Growth Pro</h3>
            <p className="text-4xl font-black font-syne tracking-tighter text-amber-600">₹999<span className="text-base text-muted-foreground font-bold">/mo</span></p>
          </div>
          
          <ul className="space-y-4 mb-10">
            {[
              'Unlimited active forms', 
              'Unlimited monthly leads', 
              'Advanced AI mapping', 
              'Custom SMTP auto-replies',
              'CSV/JSON raw data export',
              'Priority technical support'
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm font-bold">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="w-full py-4 bg-amber-500/10 text-amber-600 text-center text-xs font-black uppercase tracking-widest rounded-2xl border border-amber-500/20">
              Active Premium
            </div>
          ) : (
            <button 
              onClick={handleUpgrade} 
              disabled={loading}
              className="w-full py-5 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:opacity-90 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? 'Processing...' : 'Upgrade to Growth Pro'}
            </button>
          )}
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex flex-col items-center gap-4 py-10 opacity-50">
         <Shield className="w-8 h-8 text-muted-foreground" />
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Secure Payments via Razorpay</p>
      </div>
    </div>
  )
}