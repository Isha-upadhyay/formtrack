import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildSourceSummary } from '@/lib/source-tracking'
import { sendLeadNotification } from '@/lib/notify'
import { PLAN_LIMITS, type FormSettings } from '@/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10, RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

// ── Typed helpers so Supabase generics don't resolve to `never` ──────────────
type DB = ReturnType<typeof createClient> extends Promise<infer C> ? C : never

async function getForm(db: Awaited<DB>, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('forms')
    .select('org_id, is_active, name, settings')
    .eq('id', id)
    .single() as Promise<{
      data: { org_id: string; is_active: boolean; name: string; settings: unknown } | null
      error: unknown
    }>
}

async function getSub(db: Awaited<DB>, orgId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('subscriptions')
    .select('plan, status')
    .eq('org_id', orgId)
    .maybeSingle() as Promise<{
      data: { plan: string; status: string } | null
    }>
}

async function getLeadCount(db: Awaited<DB>, orgId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId) as Promise<{ count: number | null }>
}

async function getRecentDuplicate(db: Awaited<DB>, formId: string, since: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('leads')
    .select('id')
    .eq('form_id', formId)
    .gte('created_at', since)
    .limit(1) as Promise<{ data: { id: string }[] | null }>
}

async function insertLead(db: Awaited<DB>, payload: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).from('leads').insert(payload)
}
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait.' },
        { status: 429, headers: corsHeaders }
      )
    }

    const body = await req.json()
    const {
      form_id, data,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      source_url, referrer,
    } = body as {
      form_id?: string
      data?: Record<string, string>
      utm_source?: string; utm_medium?: string; utm_campaign?: string
      utm_term?: string; utm_content?: string
      source_url?: string; referrer?: string
    }

    if (!form_id || !data) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders })
    }

    const supabase = await createClient()

    // ── Fetch form ──────────────────────────────────────────────────────────
    const { data: formRow, error: formErr } = await getForm(supabase, form_id)
    if (formErr || !formRow) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders })
    }
    if (!formRow.is_active) {
      return NextResponse.json({ error: 'Form is inactive' }, { status: 403, headers: corsHeaders })
    }

    // ── Plan gating ─────────────────────────────────────────────────────────
    const { data: sub } = await getSub(supabase, formRow.org_id)
    const plan: 'free' | 'pro' =
      sub?.status === 'active' && sub?.plan === 'pro' ? 'pro' : 'free'
    const limit = PLAN_LIMITS[plan].leads

    if (limit !== Infinity) {
      const { count } = await getLeadCount(supabase, formRow.org_id)
      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: 'Lead limit reached. Upgrade to Pro.' },
          { status: 403, headers: corsHeaders }
        )
      }
    }

    // ── Duplicate check (same form, within 60s) ─────────────────────────────
    const emailKey = Object.keys(data).find(k => k.toLowerCase().includes('email'))
    if (emailKey && data[emailKey]) {
      const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString()
      const { data: existing } = await getRecentDuplicate(supabase, form_id, sixtySecondsAgo)
      if (existing && existing.length > 0) {
        return NextResponse.json({ success: true }, { headers: corsHeaders })
      }
    }

    // ── Build source summary & insert ───────────────────────────────────────
    const source_summary = buildSourceSummary({
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      source_url: source_url ?? referrer,
    })

    await insertLead(supabase, {
      form_id,
      org_id: formRow.org_id,
      data,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
      utm_term: utm_term ?? null,
      utm_content: utm_content ?? null,
      source_url: source_url ?? referrer ?? null,
      source_summary,
    })

    // ── Lead notification email ─────────────────────────────────────────────
    const settings = formRow.settings as FormSettings
    if (settings?.notificationEmail) {
      await sendLeadNotification({
        toEmail: settings.notificationEmail,
        formName: formRow.name,
        leadData: data,
        sourceSummary: source_summary,
      })
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Lead submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders })
  }
}