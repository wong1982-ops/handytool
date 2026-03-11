import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/v1/notifications/prefs — Get user notification preferences
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await (supabase as any)
    .from('user_notification_prefs')
    .select('push_on_book_complete, email_on_book_complete')
    .eq('user_id', user.id)
    .single()

  // Defaults if no row exists
  return NextResponse.json({
    prefs: {
      push_on_book_complete: data?.push_on_book_complete ?? true,
      email_on_book_complete: data?.email_on_book_complete ?? true,
    },
  })
}

/**
 * PATCH /api/v1/notifications/prefs — Update notification preferences
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { push_on_book_complete, email_on_book_complete } = body

  const { error } = await (supabase as any).rpc('upsert_notification_prefs', {
    p_user_id: user.id,
    p_push_on_book_complete: push_on_book_complete ?? null,
    p_email_on_book_complete: email_on_book_complete ?? null,
  })

  if (error) {
    console.error('[prefs] Failed to update prefs:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
