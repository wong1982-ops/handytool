import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { GEMINI_VOICES } from '@/lib/story/voices'

const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.string().max(50).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).optional(),
  personality: z.string().max(2000).optional(),
  physicalDescription: z.string().max(2000).optional(),
  voice: z.string().max(100).optional(),
  artStyle: z.string().max(100).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { data, error: dbError } = await supabase.rpc('get_user_characters', {
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  return apiSuccess(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = createCharacterSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { name, age, role, personality, physicalDescription, voice, artStyle } = parsed.data

  // Validate voice name if provided
  if (voice && !GEMINI_VOICES.some(v => v.name === voice)) {
    return apiError('Invalid voice name', 'VALIDATION_ERROR', 400)
  }

  const { data, error: dbError } = await supabase.rpc('insert_character', {
    p_user_id: userId,
    p_name: name,
    p_age: age ?? null,
    p_role: role ?? null,
    p_personality: personality ?? null,
    p_physical_description: physicalDescription ?? null,
    p_voice: voice ?? null,
    p_reference_image_url: null,
    p_art_style: artStyle ?? null,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  return apiSuccess({ id: data })
}
