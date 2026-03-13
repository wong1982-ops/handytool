import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const batchSchema = z.object({
  pages: z.array(z.object({
    pageId: z.string().uuid(),
    imagePrompt: z.string().min(1).max(5000),
    characterIds: z.array(z.string().uuid()).optional(),
  })).min(1).max(20),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
  includeCover: z.boolean().default(false),
  coverPrompt: z.string().max(5000).optional(),
})

const CREDIT_COST = { fast: 3, quality: 5 } as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = batchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { pages, qualityMode, includeCover, coverPrompt } = parsed.data

  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  const pageCost = pages.length * CREDIT_COST[qualityMode]
  const coverCost = includeCover ? 5 : 0
  const totalCost = pageCost + coverCost

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

  for (const page of pages) {
    const { data: existing } = await supabase
      .from('page_illustrations')
      .select('id')
      .eq('book_page_id', page.pageId)
      .single()

    if (existing) {
      await supabase.from('page_illustrations').update({ status: 'generating', quality_mode: qualityMode }).eq('id', existing.id)
    } else {
      await supabase.from('page_illustrations').insert({ book_page_id: page.pageId, status: 'generating', quality_mode: qualityMode })
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000')

  const forwardHeaders: Record<string, string> = {}
  const cookie = request.headers.get('cookie')
  if (cookie) forwardHeaders['cookie'] = cookie

  for (const page of pages) {
    fetch(`${baseUrl}/api/v1/story/books/${bookId}/illustrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...forwardHeaders },
      body: JSON.stringify({
        pageId: page.pageId,
        imagePrompt: page.imagePrompt,
        qualityMode,
        characterIds: page.characterIds,
      }),
    }).catch(() => {})
  }

  if (includeCover && coverPrompt) {
    fetch(`${baseUrl}/api/v1/story/books/${bookId}/illustrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...forwardHeaders },
      body: JSON.stringify({
        imagePrompt: coverPrompt,
        qualityMode: 'quality',
      }),
    }).catch(() => {})
  }

  return apiSuccess({
    queued: pages.length + (includeCover ? 1 : 0),
    totalCost,
    qualityMode,
  })
}
