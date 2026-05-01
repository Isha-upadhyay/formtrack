import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, orgId } = await req.json()

    if (!name || !orgId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Verify user belongs to this org
    const { data: profile } = await (adminSupabase.from('profiles') as any)
      .select('org_id')
      .eq('id', user.id)
      .eq('org_id', orgId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update Org using admin client to bypass RLS
    const { error: updateError } = await (adminSupabase.from('orgs') as any)
      .update({ name })
      .eq('id', orgId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
