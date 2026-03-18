import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  category: z.enum(['llms', 'image-video', 'audio-speech', 'code-models', 'multimodal', 'embedding-search', 'robotics-agents']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  days: z.coerce.number().int().min(1).max(90).optional(),
  q: z.string().max(200).optional(),
})

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { category, page, limit, days, q } = parsed.data
  const supabase = await createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from('ai_news')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (category) query = query.eq('category', category)

  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('posted_at', since.toISOString())
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,tags.cs.{${q}}`)
  }

  query = query
    .order('posted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[ai-radar] API query error:', error.message)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({
    data: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}
