import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const getSchema = z.object({
  providerId: z.string().uuid(),
})

const postSchema = z.object({
  providerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).optional(),
})

const patchSchema = z.object({
  reviewId: z.string().uuid(),
  isFlagged: z.literal(true),
  flagReason: z.string().min(1).max(500),
})

/** GET ?providerId=xxx — list reviews for a provider */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parsed = getSchema.safeParse({ providerId: searchParams.get('providerId') })
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { providerId } = parsed.data

  try {
    const supabase = await createClient()
    const { data: reviews, error } = await supabase
      .from('community_reviews')
      .select('id, provider_id, user_id, rating, text, is_flagged, created_at')
      .eq('provider_id', providerId)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Reviews fetch error:', error)
      return API_ERRORS.INTERNAL()
    }

    const mapped = (reviews || []).map((r: any) => ({
      id: r.id,
      providerId: r.provider_id,
      userId: r.user_id,
      rating: r.rating,
      text: r.text,
      isFlagged: r.is_flagged,
      createdAt: r.created_at,
    }))

    return apiSuccess({ reviews: mapped })
  } catch (e) {
    console.error('Reviews error:', e)
    return API_ERRORS.INTERNAL()
  }
}

/** POST { providerId, rating, text } — create review (auth required) */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { providerId, rating, text } = parsed.data

  try {
    const supabase = await createClient()

    // Verify provider exists
    const { data: provider } = await supabase
      .from('community_providers')
      .select('id')
      .eq('id', providerId)
      .single()

    if (!provider) return API_ERRORS.NOT_FOUND('Provider')

    // Upsert review (one per user per provider)
    const { data: review, error } = await supabase
      .from('community_reviews')
      .upsert(
        {
          provider_id: providerId,
          user_id: userId,
          rating,
          text: text || null,
          is_flagged: false,
          flag_reason: null,
        },
        { onConflict: 'provider_id,user_id' },
      )
      .select()
      .single()

    if (error) {
      console.error('Review create error:', error)
      return API_ERRORS.INTERNAL()
    }

    return apiSuccess({
      review: {
        id: review.id,
        providerId: review.provider_id,
        userId: review.user_id,
        rating: review.rating,
        text: review.text,
        createdAt: review.created_at,
      },
    }, 201)
  } catch (e) {
    console.error('Review create error:', e)
    return API_ERRORS.INTERNAL()
  }
}

/** PATCH { reviewId, isFlagged: true, flagReason } — flag a review */
export async function PATCH(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { reviewId, flagReason } = parsed.data

  try {
    const supabase = await createClient()

    const { data: review, error } = await supabase
      .from('community_reviews')
      .update({ is_flagged: true, flag_reason: flagReason })
      .eq('id', reviewId)
      .select('id')
      .single()

    if (error || !review) return API_ERRORS.NOT_FOUND('Review')

    return apiSuccess({ flagged: true, reviewId: review.id })
  } catch (e) {
    console.error('Review flag error:', e)
    return API_ERRORS.INTERNAL()
  }
}
