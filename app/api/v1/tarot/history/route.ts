import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const cardSchema = z.object({
  cardId: z.number().int().min(0).max(77),
  positionIndex: z.number().int().min(0),
  reversed: z.boolean(),
  customArtUrl: z.string().optional(),
})

const interpretationCardSchema = z.object({
  cardId: z.number().int().min(0).max(77),
  positionLabel: z.object({
    en: z.string(),
    zh: z.string(),
  }),
  text: z.string(),
})

const saveSchema = z.object({
  spreadId: z.string().min(1),
  question: z.string().max(500).default(''),
  language: z.enum(['en', 'zh']).default('en'),
  category: z.string().optional(),
  cards: z.array(cardSchema).min(1).max(15),
  interpretation: z.object({
    cards: z.array(interpretationCardSchema),
    narrative: z.string(),
  }),
})

// POST — save a reading
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { spreadId, question, language, category, cards, interpretation } = parsed.data

  const supabase = await createClient()
  const { data, error } = await (supabase.from as any)('tarot_readings')
    .insert({
      user_id: userId,
      spread_id: spreadId,
      question,
      language,
      category: category ?? null,
      cards,
      interpretation,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[tarot/history] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id }, 201)
}

// GET — list user's readings
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limitParam = parseInt(searchParams.get('limit') ?? '20', 10)
  const limit = isNaN(limitParam) ? 20 : Math.min(Math.max(1, limitParam), 50)

  const supabase = await createClient()
  let query = (supabase.from as any)('tarot_readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('[tarot/history] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ readings: data || [] })
}

// DELETE — remove a reading
export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id?.trim()) {
    return apiError('id is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { error } = await (supabase.from as any)('tarot_readings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('[tarot/history] DELETE error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
