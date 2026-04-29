import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isPublicRead = req.nextUrl.searchParams.get('public') === '1'

  if (isPublicRead || !user) {
    const { data: publicForm } = await (supabase.from('forms') as any)
      .select('id, name, fields, settings')
      .eq('id', formId)
      .eq('status', 'active')
      .single()

    if (!publicForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders })
    }
    return NextResponse.json(publicForm, { headers: corsHeaders })
  }

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  const { data: form } = await (supabase.from('forms') as any)
    .select('id, org_id, name, fields, settings')
    .eq('id', formId)
    .eq('org_id', profile.org_id)
    .single()

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders })
  }

  return NextResponse.json(form, { headers: corsHeaders })
}