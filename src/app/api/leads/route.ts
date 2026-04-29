import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildSourceSummary } from '@/lib/source-tracking'
import { sendLeadNotification } from '@/lib/notify'
import { PLAN_LIMITS, type FormSettings } from '@/types'

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10, RATE_WINDOW_MS = 60_000

function getCorsHeaders(origin?: string | null): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

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

function sanitizeText(value?: string | null): string | null {
  if (!value) return null
  return value.replace(/<[^>]*>/g, '').trim()
}

function sanitizeLeadData(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') continue
    out[key] = sanitizeText(value) ?? ''
  }
  return out
}

// ── Typed helpers so Supabase generics don't resolve to `never` ──────────────
type DB = ReturnType<typeof createClient> extends Promise<infer C> ? C : never

async function getForm(db: Awaited<DB>, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('forms')
    .select('org_id, status, name, settings')
    .eq('id', id)
    .single() as Promise<{
      data: { org_id: string; status: string; name: string; settings: unknown } | null
      error: unknown
    }>
}

async function getOrg(db: Awaited<DB>, orgId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('orgs')
    .select('id, plan, plan_expires_at, leads_used_this_month')
    .eq('id', orgId)
    .single() as Promise<{
      data: {
        id: string
        plan: string | null
        plan_expires_at: string | null
        leads_used_this_month: number | null
      } | null
      error: unknown
    }>
}

async function incrementOrgLeadCount(db: Awaited<DB>, orgId: string, current: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)
    .from('orgs')
    .update({ leads_used_this_month: current + 1 })
    .eq('id', orgId)
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
  return NextResponse.json({}, { headers: getCorsHeaders('*') })
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'))
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

    if (!form_id || typeof form_id !== 'string' || !data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400, headers: corsHeaders })
    }

    const sanitizedData = sanitizeLeadData(data)
    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json({ error: 'Lead data must include at least one text field' }, { status: 400, headers: corsHeaders })
    }

    const supabase = await createClient()

    // ── Fetch form ──────────────────────────────────────────────────────────
    const { data: formRow, error: formErr } = await getForm(supabase, form_id)
    if (formErr || !formRow) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders })
    }
    if (formRow.status !== 'active') {
      return NextResponse.json({ error: 'Form is inactive' }, { status: 403, headers: corsHeaders })
    }

    // ── Plan gating ─────────────────────────────────────────────────────────
    const { data: org, error: orgErr } = await getOrg(supabase, formRow.org_id)
    if (orgErr || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404, headers: corsHeaders })
    }

    const proActive = org.plan === 'pro' &&
      !!org.plan_expires_at &&
      new Date(org.plan_expires_at).getTime() > Date.now()
    const plan: 'free' | 'pro' = proActive ? 'pro' : 'free'
    const limit = PLAN_LIMITS[plan].leads

    if (limit !== Infinity && (org.leads_used_this_month ?? 0) >= limit) {
      return NextResponse.json(
        { error: 'Free plan monthly lead limit reached. Upgrade to Pro.' },
        { status: 429, headers: corsHeaders }
      )
    }

    // ── Duplicate check (same form, within 60s) ─────────────────────────────
    const emailKey = Object.keys(sanitizedData).find(k => k.toLowerCase().includes('email'))
    if (emailKey && sanitizedData[emailKey]) {
      const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString()
      const { data: existing } = await getRecentDuplicate(supabase, form_id, sixtySecondsAgo)
      if (existing && existing.length > 0) {
        return NextResponse.json({ success: true }, { headers: corsHeaders })
      }
    }

    // ── Build source summary & insert ───────────────────────────────────────
    const source_summary = buildSourceSummary({
      utm_source: sanitizeText(utm_source) ?? undefined,
      utm_medium: sanitizeText(utm_medium) ?? undefined,
      utm_campaign: sanitizeText(utm_campaign) ?? undefined,
      utm_term: sanitizeText(utm_term) ?? undefined,
      utm_content: sanitizeText(utm_content) ?? undefined,
      source_url: sanitizeText(source_url) ?? sanitizeText(referrer) ?? undefined,
    })

    const { error: insertErr } = await insertLead(supabase, {
      form_id,
      org_id: formRow.org_id,
      data: sanitizedData,
      utm_source: sanitizeText(utm_source),
      utm_medium: sanitizeText(utm_medium),
      utm_campaign: sanitizeText(utm_campaign),
      utm_term: sanitizeText(utm_term),
      utm_content: sanitizeText(utm_content),
      source_url: sanitizeText(source_url) ?? sanitizeText(referrer),
      source_summary,
      ip_address: ip,
    })
    if (insertErr) {
      console.error('Lead insert failed:', insertErr)
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500, headers: corsHeaders })
    }

    const { error: incrementErr } = await incrementOrgLeadCount(
      supabase,
      formRow.org_id,
      org.leads_used_this_month ?? 0
    )
    if (incrementErr) {
      console.error('Lead counter increment failed:', incrementErr)
    }

    // ── Lead notification email ─────────────────────────────────────────────
    const settings = formRow.settings as FormSettings
    if (settings?.notificationEmail) {
      try {
        await sendLeadNotification({
          toEmail: settings.notificationEmail,
          formName: formRow.name,
          leadData: sanitizedData,
          sourceSummary: source_summary,
        })
      } catch (notifyErr) {
        console.error('Lead notification failed:', notifyErr)
      }
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Lead submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders })
  }
}