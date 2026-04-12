import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildSourceSummary } from '@/lib/source-tracking'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      form_id, data,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      source_url, referrer
    } = body

    if (!form_id || !data) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get org_id from form
    const { data: form } = await (supabase.from('forms') as any)
      .select('org_id')
      .eq('id', form_id)
      .single()

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const source_summary = buildSourceSummary({
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      source_url: source_url || referrer,
    })

    await (supabase.from('leads') as any).insert({
      form_id,
      org_id: form.org_id,
      data,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      source_url: source_url || referrer,
      source_summary,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Lead submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}