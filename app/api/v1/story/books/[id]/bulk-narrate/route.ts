import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const bodySchema = z.object({
  narratorVoice: z.string().optional(),
  voiceMap: z.record(z.string()).optional(),
}).optional()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id: bookId } = await params
  const supabase = await createClient()

  // Parse optional body (voice selection)
  let narratorVoice: string | undefined
  let voiceMap: Record<string, string> | undefined
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (parsed.success && parsed.data) {
      narratorVoice = parsed.data.narratorVoice
      voiceMap = parsed.data.voiceMap
    }
  } catch {
    // Empty body is fine — use defaults
  }

  // Load the book — use direct query (owner access)
  const { data: book, error } = await supabase
    .from('books')
    .select('id, user_id, data, page_count')
    .eq('id', bookId)
    .single()

  if (error || !book) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  if (book.user_id !== userId) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  const pageCount = book.page_count ?? 0

  // TODO: Reserve credits (pageCount * CREDIT_COSTS.narratePage)
  // TODO: Queue narration jobs for each page with voice selection
  // For now, return a placeholder success
  return apiSuccess({
    message: `Queued ${pageCount} pages for narration`,
    pageCount,
    narratorVoice: narratorVoice || 'default',
  })
}
