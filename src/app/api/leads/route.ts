import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { buildSourceSummary } from '@/lib/source-tracking'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      form_id, data,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      source_url, referrer
    } = body

    if (!form_id || !data) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders })
    }

    const supabase = await createClient()

    const { data: form } = await (supabase.from('forms') as any)
      .select('org_id')
      .eq('id', form_id)
      .single()

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders })
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

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Lead submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: corsHeaders })
  }
}