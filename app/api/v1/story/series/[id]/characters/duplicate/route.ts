import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

interface RouteParams { params: Promise<{ id: string }> }

const duplicateSchema = z.object({
  sourceSeriesId: z.string().uuid(),
  sourceCharacterId: z.string().uuid(),
})

// POST — duplicate a character from another series into this one
export async function POST(request: Request, { params }: RouteParams) {
  const { id: targetSeriesId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  const parsed = duplicateSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { sourceSeriesId, sourceCharacterId } = parsed.data

  const supabase = await createClient()

  // Load source character (verify ownership via series)
  const { data: sourceData } = await supabase.rpc('get_series_with_characters', {
    p_series_id: sourceSeriesId,
    p_user_id: userId,
  })
  const sourceSeries = Array.isArray(sourceData) ? sourceData?.[0] : sourceData
  if (!sourceSeries) return API_ERRORS.NOT_FOUND('Source series')

  const chars = (sourceSeries.characters as { id: string; name: string; description: string; referenceImageUrl: string | null; voice: string | null; status: string }[]) || []
  const sourceChar = chars.find(c => c.id === sourceCharacterId)
  if (!sourceChar) return API_ERRORS.NOT_FOUND('Source character')

  // Add character to target series via RPC (enforces max 4)
  const { data: newCharId, error: addError } = await supabase.rpc('add_series_character', {
    p_series_id: targetSeriesId,
    p_name: sourceChar.name,
    p_description: sourceChar.description,
    p_voice: sourceChar.voice ?? null,
  })

  if (addError) {
    if (addError.message?.includes('max_characters_reached')) {
      return apiError('Maximum 4 characters per series', 'MAX_CHARACTERS', 400)
    }
    if (addError.message?.includes('series_not_found')) {
      return API_ERRORS.NOT_FOUND('Target series')
    }
    console.error('duplicate character error:', addError)
    return API_ERRORS.INTERNAL()
  }

  // Copy the portrait image if it exists
  if (sourceChar.referenceImageUrl) {
    try {
      // Download source image
      const imgRes = await fetch(sourceChar.referenceImageUrl)
      if (imgRes.ok) {
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
        const storagePath = `series/${targetSeriesId}/characters/${newCharId}.png`

        // Upload to target location
        await supabase.storage
          .from('story-assets')
          .upload(storagePath, imgBuffer, {
            contentType: 'image/png',
            upsert: true,
          })

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('story-assets')
          .getPublicUrl(storagePath)

        // Update the character's reference image URL and status
        await supabase.rpc('update_series_character', {
          p_user_id: userId,
          p_series_id: targetSeriesId,
          p_character_id: newCharId,
          p_reference_image_url: `${urlData.publicUrl}?t=${Date.now()}`,
          p_status: sourceChar.status === 'approved' ? 'approved' : 'draft',
        })
      }
    } catch (err) {
      console.error('Failed to copy character portrait:', err)
      // Character was still added, just without the portrait
    }
  }

  return apiSuccess({ id: newCharId }, 201)
}
