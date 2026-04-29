import 'server-only'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var: ${name}`)
  }
  return value
}

// Validated at module load (startup/import time for server code).
export const NEXT_PUBLIC_SUPABASE_URL = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
export const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
export const RAZORPAY_KEY_ID = getRequiredEnv('RAZORPAY_KEY_ID')
export const RAZORPAY_KEY_SECRET = getRequiredEnv('RAZORPAY_KEY_SECRET')
export const RESEND_API_KEY = getRequiredEnv('RESEND_API_KEY')
export const NEXT_PUBLIC_APP_URL = getRequiredEnv('NEXT_PUBLIC_APP_URL')
