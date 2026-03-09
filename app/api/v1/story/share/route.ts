import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'
import { shareBookRequestSchema } from '@/lib/story/types'

export async function POST(request: Request) {
  const effectiveUserId = await getAuthUserId()
  if (!effectiveUserId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  const body = await request.json()
  const parsed = shareBookRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { bookId, isPublic } = parsed.data

  // Use RPC to bypass RLS (needed in dev when no auth session)
  const { data: slug, error: updateError } = await supabase.rpc('share_book', {
    p_user_id: effectiveUserId,
    p_book_id: bookId,
    p_is_public: isPublic,
  })

  if (updateError) {
    console.error('story/share: update failed', updateError)
    return API_ERRORS.INTERNAL()
  }

  if (!slug) return API_ERRORS.NOT_FOUND('Book')

  const shareUrl = isPublic ? `/tools/story-studio/book/${slug}` : null

  return apiSuccess({ isPublic, shareUrl })
}
