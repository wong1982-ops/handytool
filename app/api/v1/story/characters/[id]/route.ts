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
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Direct query instead of RPC — get character with series links
  const { data, error: dbError } = await supabase
    .from('characters')
    .select('*, character_series(series_id)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (!data) return apiError('Character not found', 'NOT_FOUND', 404)

  // Transform to camelCase with seriesIds array
  const character = {
    id: data.id,
    name: data.name,
    age: data.age,
    role: data.role,
    personality: data.personality,
    physicalDescription: data.physical_description,
    referenceImageUrl: data.reference_image_url,
    voice: data.voice,
    status: data.status,
    refinementCount: data.refinement_count,
    seriesIds: (data.character_series ?? []).map((cs: { series_id: string }) => cs.series_id),
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

  // Build update object — only include fields that were explicitly provided
  // This avoids COALESCE issues where undefined fields would clear existing values
  const updates: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) updates.name = parsed.data.name
  if (parsed.data.age !== undefined) updates.age = parsed.data.age
  if (parsed.data.role !== undefined) updates.role = parsed.data.role
  if (parsed.data.personality !== undefined) updates.personality = parsed.data.personality
  if (parsed.data.physicalDescription !== undefined) updates.physical_description = parsed.data.physicalDescription
  if (parsed.data.voice !== undefined) updates.voice = parsed.data.voice

  if (Object.keys(updates).length === 0) {
    return apiError('No fields to update', 'VALIDATION_ERROR', 400)
  }

  const { error: dbError, count } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (count === 0) return apiError('Character not found or not owned', 'NOT_FOUND', 404)

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

  // Delete character image from R2 if exists
  const { data: char } = await supabase
    .from('characters')
    .select('reference_image_url')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (char?.reference_image_url) {
    try {
      const { deleteFromR2 } = await import('@/lib/storage/r2')
      await deleteFromR2(char.reference_image_url)
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
