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

  const { data: book, error: bookErr } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (bookErr || !book) return apiError('Book not found', 'NOT_FOUND', 404)

  const { data: pages, error: pagesErr } = await supabase
    .from('book_pages')
    .select(`
      id, sequence, scene_description, narrative_text, image_prompt, dialogue, mood,
      page_illustrations (id, image_url, status, quality_mode, generation_config, created_at, updated_at)
    `)
    .eq('book_id', bookId)
    .order('sequence', { ascending: true })

  if (pagesErr) return apiError(pagesErr.message, 'DB_ERROR', 500)

  const { data: cover } = await supabase
    .from('book_cover')
    .select('id, image_url, status, prompt, created_at')
    .eq('book_id', bookId)
    .single()

  return apiSuccess({
    pages: (pages ?? []).map(p => ({
      id: p.id,
      sequence: p.sequence,
      sceneDescription: p.scene_description,
      narrativeText: p.narrative_text,
      imagePrompt: p.image_prompt,
      dialogue: p.dialogue,
      mood: p.mood,
      illustration: p.page_illustrations?.[0] ? {
        id: p.page_illustrations[0].id,
        imageUrl: p.page_illustrations[0].image_url,
        status: p.page_illustrations[0].status,
        qualityMode: p.page_illustrations[0].quality_mode,
        generationConfig: p.page_illustrations[0].generation_config,
        createdAt: p.page_illustrations[0].created_at,
        updatedAt: p.page_illustrations[0].updated_at,
      } : null,
    })),
    cover: cover ? {
      id: cover.id,
      imageUrl: cover.image_url,
      status: cover.status,
      prompt: cover.prompt,
      createdAt: cover.created_at,
    } : null,
  })
}
