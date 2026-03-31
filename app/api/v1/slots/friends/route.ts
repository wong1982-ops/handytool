import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Get friends where I'm user_id or friend_id
  const { data: sent } = await supabase.from('casino_friends')
    .select('id, friend_id, status, created_at').eq('user_id', userId)
  const { data: received } = await supabase.from('casino_friends')
    .select('id, user_id, status, created_at').eq('friend_id', userId)

  return apiSuccess({ sent: sent || [], received: received || [] })
}

const addSchema = z.object({ friendId: z.string().uuid() })

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  if (parsed.data.friendId === userId) return apiError('Cannot add yourself', 'INVALID', 400)

  const supabase = await createClient()
  const { error } = await supabase.from('casino_friends').insert({
    user_id: userId, friend_id: parsed.data.friendId, status: 'pending'
  })

  if (error) {
    if (error.code === '23505') return apiError('Already friends', 'DUPLICATE', 409)
    return apiError('Failed to add friend', 'ERROR', 500)
  }

  return apiSuccess({ sent: true })
}

const patchSchema = z.object({ friendshipId: z.string().uuid(), action: z.enum(['accept', 'decline']) })

export async function PATCH(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const supabase = await createClient()

  if (parsed.data.action === 'accept') {
    await supabase.from('casino_friends').update({ status: 'accepted' })
      .eq('id', parsed.data.friendshipId).eq('friend_id', userId)
  } else {
    await supabase.from('casino_friends').delete()
      .eq('id', parsed.data.friendshipId).eq('friend_id', userId)
  }

  return apiSuccess({ done: true })
}
