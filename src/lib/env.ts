import 'server-only'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function getOptionalEnv(name: string): string | undefined {
  return process.env[name] || undefined
}

// Required — server will not start without these
export const NEXT_PUBLIC_SUPABASE_URL = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
export const RAZORPAY_KEY_ID = getRequiredEnv('RAZORPAY_KEY_ID')
export const RAZORPAY_KEY_SECRET = getRequiredEnv('RAZORPAY_KEY_SECRET')

// Optional — features gracefully degrade if not set
export const RESEND_API_KEY = getOptionalEnv('RESEND_API_KEY')