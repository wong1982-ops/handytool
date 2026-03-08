import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { shareBookRequestSchema } from '@/lib/story/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = shareBookRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { bookId, isPublic } = parsed.data

  // Verify ownership
  const { data: book, error: fetchError } = await supabase
    .from('books')
    .select('id, slug')
    .eq('id', bookId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !book) return API_ERRORS.NOT_FOUND('Book')

  const { error: updateError } = await supabase
    .from('books')
    .update({ is_public: isPublic })
    .eq('id', bookId)

  if (updateError) {
    console.error('story/share: update failed', updateError)
    return API_ERRORS.INTERNAL()
  }

  const shareUrl = isPublic ? `/tools/story-studio/book/${book.slug}` : null

  return apiSuccess({ isPublic, shareUrl })
}
