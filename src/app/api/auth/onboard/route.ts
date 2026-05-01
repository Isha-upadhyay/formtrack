import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Check if profile already exists - return the org_id if it does!
    const { data: existingProfile } = await (adminSupabase.from('profiles') as any)
      .select('org_id')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile exists', 
        org_id: existingProfile.org_id 
      })
    }

    // Create Org
    const { data: org, error: orgError } = await (adminSupabase.from('orgs') as any)
      .insert({
        name: user.email?.split('@')[0] + "'s Organization"
      })
      .select()
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
    }

    // Create Profile
    const { error: profError } = await (adminSupabase.from('profiles') as any)
      .insert({
        id: user.id,
        org_id: org.id,
        email: user.email || ''
      })

    if (profError) {
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, org_id: org.id })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
