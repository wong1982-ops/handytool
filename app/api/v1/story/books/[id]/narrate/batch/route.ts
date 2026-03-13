import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const batchNarrateSchema = z.object({
  pageIds: z.array(z.string().uuid()).min(1).max(20),
  narratorVoice: z.string().min(1),
  voiceMap: z.record(z.string()).optional(),
})

const CREDIT_COST = 3

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = batchNarrateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { pageIds, narratorVoice, voiceMap } = parsed.data

  // Verify ownership
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Check credits
  const totalCost = pageIds.length * CREDIT_COST
  const adminClient = getAdminSupabase() as any
  const { data: creditRow } = await adminClient
    .from('user_credits')
    .select('subscription_balance, purchased_balance')
    .eq('user_id', userId)
    .single()
  const balance = (creditRow?.subscription_balance ?? 0) + (creditRow?.purchased_balance ?? 0)
  if (balance < totalCost) {
    return apiError(
      `Insufficient credits. Need ${totalCost}, have ${balance}`,
      'INSUFFICIENT_CREDITS',
      402,
    )
  }

  // Mark pages as generating
  for (const pageId of pageIds) {
    const { data: existing } = await supabase
      .from('page_audio')
      .select('id')
      .eq('book_page_id', pageId)
      .single()

    if (existing) {
      await supabase.from('page_audio').update({ status: 'generating', voice_map: {} }).eq('id', existing.id)
    } else {
      await supabase.from('page_audio').insert({ book_page_id: pageId, status: 'generating', voice_map: {} })
    }
  }

  // Fire individual narration requests
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const forwardHeaders: Record<string, string> = {}
  const cookie = request.headers.get('cookie')
  if (cookie) forwardHeaders['cookie'] = cookie

  for (const pageId of pageIds) {
    fetch(`${baseUrl}/api/v1/story/books/${bookId}/narrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...forwardHeaders },
      body: JSON.stringify({ pageId, narratorVoice, voiceMap }),
    }).catch(() => {})
  }

  return apiSuccess({
    queued: pageIds.length,
    totalCost,
  })
}
