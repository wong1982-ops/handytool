import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Verify ownership
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Fetch pages with audio
  const { data: pages, error: pagesErr } = await supabase
    .from('book_pages')
    .select(`
      id, sequence, narrative_text, dialogue,
      page_audio (id, audio_url, status, voice_map, duration_seconds, created_at, updated_at)
    `)
    .eq('book_id', bookId)
    .order('sequence', { ascending: true })

  if (pagesErr) return apiError(pagesErr.message, 'DB_ERROR', 500)

  return apiSuccess({
    pages: (pages ?? []).map(p => ({
      id: p.id,
      sequence: p.sequence,
      narrativeText: p.narrative_text,
      dialogue: p.dialogue,
      audio: p.page_audio?.[0] ? {
        id: p.page_audio[0].id,
        audioUrl: p.page_audio[0].audio_url,
        status: p.page_audio[0].status,
        voiceMap: p.page_audio[0].voice_map,
        durationSeconds: p.page_audio[0].duration_seconds,
        createdAt: p.page_audio[0].created_at,
        updatedAt: p.page_audio[0].updated_at,
      } : null,
    })),
  })
}
