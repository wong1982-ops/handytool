import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { data: cover } = await supabase
    .from('book_cover')
    .select('id, image_url, status, prompt, created_at')
    .eq('book_id', bookId)
    .single()

  return apiSuccess(cover ? {
    id: cover.id,
    imageUrl: cover.image_url,
    status: cover.status,
    prompt: cover.prompt,
    createdAt: cover.created_at,
  } : null)
}
