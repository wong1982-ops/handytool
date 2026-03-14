import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { GEMINI_VOICES } from '@/lib/story/voices'

const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.string().max(50).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).optional(),
  personality: z.string().max(2000).optional(),
  physicalDescription: z.string().max(2000).optional(),
  voice: z.string().max(100).nullable().optional(),
  artStyle: z.string().max(100).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Use RPC (SECURITY DEFINER) — works with dev client that has no session
  const { data, error: dbError } = await supabase.rpc('get_character_detail', {
    p_character_id: id,
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (!data) return apiError('Character not found', 'NOT_FOUND', 404)

  // Transform DB column names to camelCase
  const character = {
    id: data.id,
    name: data.name,
    age: data.age,
    role: data.role,
    personality: data.personality,
    physicalDescription: data.physical_description,
    referenceImageUrl: data.reference_image_url,
    voice: data.voice,
    artStyle: data.art_style,
    status: data.status,
    refinementCount: data.refinement_count,
    seriesIds: data.series_ids ?? [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  return apiSuccess(character)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = updateCharacterSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  // Validate voice name if provided and not null (null = clear voice)
  if (parsed.data.voice && !GEMINI_VOICES.some(v => v.name === parsed.data.voice)) {
    return apiError('Invalid voice name', 'VALIDATION_ERROR', 400)
  }

  if (Object.keys(parsed.data).length === 0) {
    return apiError('No fields to update', 'VALIDATION_ERROR', 400)
  }

  // Update via RPC (SECURITY DEFINER — bypasses RLS)
  const { data: updated, error: dbError } = await supabase.rpc('update_character', {
    p_user_id: userId,
    p_character_id: id,
    ...(parsed.data.name !== undefined && { p_name: parsed.data.name }),
    ...(parsed.data.age !== undefined && { p_age: parsed.data.age }),
    ...(parsed.data.role !== undefined && { p_role: parsed.data.role }),
    ...(parsed.data.personality !== undefined && { p_personality: parsed.data.personality }),
    ...(parsed.data.physicalDescription !== undefined && { p_physical_description: parsed.data.physicalDescription }),
    ...(parsed.data.voice !== undefined && { p_voice: parsed.data.voice }),
    ...(parsed.data.artStyle !== undefined && { p_art_style: parsed.data.artStyle }),
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (!updated) return apiError('Character not found or not owned', 'NOT_FOUND', 404)

  return apiSuccess({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Fetch character to get image URL for cleanup
  const { data: character } = await supabase.rpc('get_character_detail', {
    p_character_id: id,
    p_user_id: userId,
  })
  if (character?.reference_image_url) {
    try {
      const { deleteFromR2 } = await import('@/lib/storage/r2')
      await deleteFromR2(character.reference_image_url)
    } catch { /* best effort */ }
  }

  const { data, error: dbError } = await supabase.rpc('delete_character', {
    p_character_id: id,
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (!data) return apiError('Character not found or not owned', 'NOT_FOUND', 404)

  return apiSuccess({ success: true })
}
