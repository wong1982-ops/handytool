import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { generateCharacterReference } from '@/lib/story/illustrate'

const REFINEMENT_COST = 10
const MAX_FREE_REFINEMENTS = 5

const refineSchema = z.object({
  seriesId: z.string().uuid(),
  characterId: z.string().uuid(),
  description: z.string().min(10).max(2000),
  feedback: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  const parsed = refineSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { seriesId, characterId, description, feedback } = parsed.data
  const supabase = await createClient()

  // Load series + characters via RPC (bypasses RLS)
  const { data: seriesData } = await supabase.rpc('get_series_with_characters', {
    p_series_id: seriesId,
    p_user_id: userId,
  })

  const series = Array.isArray(seriesData) ? seriesData?.[0] : seriesData
  if (!series || series.user_id !== userId) return API_ERRORS.NOT_FOUND('Series')

  const chars = (series.characters as { id: string; name: string; description: string; refinement_count: number; status: string; reference_image_url: string | null }[]) || []
  const char = chars.find(c => c.id === characterId)
  if (!char) return API_ERRORS.NOT_FOUND('Character')

  // Check refinement limit
  const isFirstGeneration = !char.reference_image_url && char.refinement_count === 0
  const isRefinement = !isFirstGeneration

  if (isRefinement && char.refinement_count >= MAX_FREE_REFINEMENTS) {
    return apiError(
      `Maximum ${MAX_FREE_REFINEMENTS} refinements reached. Approve the character or start over (costs ${REFINEMENT_COST} credits).`,
      'REFINEMENT_LIMIT',
      400,
      { refinementCount: char.refinement_count, max: MAX_FREE_REFINEMENTS },
    )
  }

  // Charge credits on first generation only
  let reservationId: string | undefined
  if (isFirstGeneration && process.env.NODE_ENV !== 'development') {
    const { data: reserveData, error: reserveError } = await supabase.rpc('reserve_credits', {
      p_user_id: userId,
      p_amount: REFINEMENT_COST,
      p_description: `Series character portrait — ${char.name}`,
    })

    if (reserveError) {
      const isInsufficient = reserveError.message?.includes('insufficient_credits')
      return isInsufficient
        ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, {
            required: REFINEMENT_COST,
            message: `You need ${REFINEMENT_COST} credits to generate a character portrait.`,
          })
        : API_ERRORS.INTERNAL()
    }

    const row = Array.isArray(reserveData) ? reserveData[0] : reserveData
    reservationId = row?.reservation_id
  }

  try {
    // Merge feedback into description if provided
    let finalDescription = description
    if (feedback) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const mergeResult = await model.generateContent(
        `You are a character description editor. Take the existing character description and incorporate the user's feedback to create an updated description. Keep the same level of detail and specificity. Only output the updated description, nothing else.

Existing description:
${description}

User feedback:
${feedback}`,
      )
      finalDescription = mergeResult.response.text()?.trim() || description
    }

    // Find the first character's approved portrait as style reference
    // so all portraits in the series share the same artistic style
    let styleReferenceBuffer: Buffer | undefined
    const firstCharWithPortrait = chars.find(c => c.id !== characterId && c.reference_image_url)
      || chars.find(c => c.reference_image_url)
    if (firstCharWithPortrait?.reference_image_url) {
      try {
        const refRes = await fetch(firstCharWithPortrait.reference_image_url)
        if (refRes.ok) {
          styleReferenceBuffer = Buffer.from(await refRes.arrayBuffer())
          console.log(`[refine] Using ${firstCharWithPortrait.name}'s portrait as style reference`)
        }
      } catch { /* proceed without style ref */ }
    }

    // Generate character portrait
    const characters = [{ name: char.name, description: finalDescription }]
    const referenceBuffer = await generateCharacterReference(characters, series.art_style, styleReferenceBuffer)

    if (!referenceBuffer) {
      throw new Error('Failed to generate character portrait')
    }

    // Upload to Supabase Storage
    const storagePath = `series/${seriesId}/characters/${characterId}.png`
    const { error: uploadError } = await supabase.storage
      .from('story-assets')
      .upload(storagePath, new Uint8Array(referenceBuffer), {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error('Portrait upload error:', uploadError)
      throw new Error('Failed to upload portrait')
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('story-assets')
      .getPublicUrl(storagePath)

    // Append cache-busting timestamp so browser doesn't serve stale cached portrait
    const referenceImageUrl = `${urlData.publicUrl}?t=${Date.now()}`

    // Update character via RPC (bypasses RLS)
    const newRefinementCount = (char.refinement_count || 0) + 1
    const { error: updateError } = await supabase.rpc('update_series_character', {
      p_user_id: userId,
      p_series_id: seriesId,
      p_character_id: characterId,
      p_description: finalDescription,
      p_reference_image_url: referenceImageUrl,
      p_refinement_count: newRefinementCount,
    })
    if (updateError) {
      console.error('Character update RPC failed:', updateError)
    }

    // Confirm credit reservation on first generation
    if (reservationId) {
      await supabase.rpc('confirm_reserved_credits', {
        p_reservation_id: reservationId,
        p_description: `Series character portrait — ${char.name}`,
      })
    }

    return apiSuccess({
      description: finalDescription,
      referenceImageUrl,
      refinementCount: newRefinementCount,
      maxRefinements: MAX_FREE_REFINEMENTS,
    })
  } catch (err) {
    console.error('Character refinement failed:', err)

    // Release reserved credits on failure
    if (reservationId) {
      try {
        await supabase.rpc('release_reserved_credits', {
          p_reservation_id: reservationId,
          p_reason: 'Character portrait generation failed',
        })
      } catch { /* ignore */ }
    }

    return apiError(
      err instanceof Error ? err.message : 'Portrait generation failed',
      'GENERATION_FAILED',
      500,
    )
  }
}
