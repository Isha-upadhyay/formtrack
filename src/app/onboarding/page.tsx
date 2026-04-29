'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const steps = [
  {
    id: 1,
    icon: '📋',
    title: 'Create your first form',
    desc: 'Pick a template and customize it for your business.',
    action: 'Create Form',
    href: '/dashboard/forms/new',
  },
  {
    id: 2,
    icon: '🌐',
    title: 'Embed it on your website',
    desc: 'Copy one line of code and paste it anywhere.',
    action: 'See Embed Guide',
    href: '/dashboard/forms',
  },
  {
    id: 3,
    icon: '🎯',
    title: 'Share with UTM links',
    desc: 'Add UTM parameters to your ad URLs so every lead is tracked.',
    action: 'Learn More',
    href: '/dashboard',
  },
]

export default function OnboardingPage() {
  const [completed, setCompleted] = useState<number[]>([])
  const router = useRouter()

  const toggle = (id: number) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e1117] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-100 dark:border-white/8 w-full max-w-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-sm shadow-blue-500/30 flex items-center justify-center text-white font-bold">F</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome to FormTrack! 🎉</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Let's get you set up in 5 minutes</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 mb-8">
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-2">
            <span>{completed.length} of {steps.length} done</span>
            <span>{Math.round((completed.length / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/8 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
              style={{ width: `${(completed.length / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map(step => {
            const done = completed.includes(step.id)
            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                  done ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10' : 'border-gray-100 dark:border-white/8 hover:border-blue-200 dark:hover:border-blue-500/40'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggle(step.id)}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    done
                      ? 'bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600 text-white'
                      : 'border-gray-300 dark:border-white/20 hover:border-blue-400'
                  }`}
                >
                  {done && <span className="text-xs font-bold">✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{step.icon}</span>
                    <p className={`font-semibold text-sm ${done ? 'text-green-700 dark:text-green-400 line-through opacity-60' : 'text-gray-900 dark:text-white'}`}>
                      {step.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{step.desc}</p>
                </div>

                {!done && (
                  <Link
                    href={step.href}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/25 transition whitespace-nowrap flex-shrink-0"
                  >
                    {step.action} →
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        {completed.length === steps.length ? (
          <div className="text-center">
            <div className="text-4xl mb-3">🎊</div>
            <p className="font-bold text-gray-900 dark:text-white mb-4">You're all set!</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard →
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full text-center text-gray-400 dark:text-slate-500 text-sm hover:text-gray-600 dark:hover:text-slate-300 transition"
          >
            Skip for now → Go to dashboard
          </button>
        )}
      </div>
    </div>
  )
}