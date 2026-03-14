import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { generateCharacterReference, editPortrait } from '@/lib/story/illustrate'
import { uploadToR2 } from '@/lib/storage/r2'

const refineSchema = z.object({
  physicalDescription: z.string().min(10).max(2000),
  feedback: z.string().max(1000).optional(),
  artStyle: z.string().max(100),
  portraitId: z.string().uuid().optional(), // if refining an existing portrait
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = refineSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  // Fetch character via RPC (SECURITY DEFINER — bypasses RLS)
  const { data: character, error: fetchErr } = await supabase.rpc('get_character_detail', {
    p_character_id: characterId,
    p_user_id: userId,
  })
  if (fetchErr || !character) return apiError('Character not found', 'NOT_FOUND', 404)

  const { artStyle, portraitId, feedback } = parsed.data

  // Fetch existing portraits to check for style duplicates and get reference
  const { data: portraits } = await supabase.rpc('get_character_portraits', {
    p_character_id: characterId,
    p_user_id: userId,
  })
  const existingForStyle = (portraits ?? []).find((p: any) => p.art_style === artStyle)
  const primaryPortrait = (portraits ?? []).find((p: any) => p.is_primary)
  const isRefine = !!portraitId && !!existingForStyle
  const isNewStyle = !existingForStyle

  // Refinement: check limit
  if (isRefine) {
    const portrait = (portraits ?? []).find((p: any) => p.id === portraitId)
    if (!portrait) return apiError('Portrait not found', 'NOT_FOUND', 404)
    if (portrait.refinement_count >= 3) {
      return apiError('Refinement limit reached for this portrait (3/3)', 'REFINEMENT_LIMIT', 400)
    }
  }

  // New style generation always costs 1 credit
  let transactionId: string | null = null
  if (isNewStyle) {
    const creditDesc = `Portrait (${artStyle}) — ${character.name}`
    const { data: deductData, error: deductErr } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: 1,
      p_tool_id: 'story-studio',
      p_description: creditDesc,
    })
    if (deductErr) {
      if (deductErr.message?.includes('insufficient_credits')) {
        return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      }
      return apiError('Failed to deduct credits', 'CREDIT_ERROR', 500)
    }
    const deductRow = Array.isArray(deductData) ? deductData[0] : deductData
    transactionId = deductRow?.transaction_id ?? null
  }

  const description = parsed.data.physicalDescription
  let imageBuffer: Buffer | null = null

  if (isRefine && feedback && portraitId) {
    // --- Refinement: edit the existing portrait in place ---
    const portrait = (portraits ?? []).find((p: any) => p.id === portraitId)
    if (portrait?.image_url) {
      try {
        const currentRes = await fetch(portrait.image_url)
        if (currentRes.ok) {
          const currentImage = Buffer.from(await currentRes.arrayBuffer())
          imageBuffer = await editPortrait(currentImage, feedback, character.name, artStyle)
        }
      } catch { /* fall through to regeneration */ }
    }

    // If edit failed, fall back to regeneration with merged description
    if (!imageBuffer) {
      let mergedDescription = description
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        const result = await model.generateContent(`You are refining a character's physical description based on user feedback.

Current description:
${description}

User feedback:
${feedback}

Write an improved physical description that incorporates the feedback. Keep it under 500 words. Return ONLY the description, no preamble.`)
        const refined = result.response.text()?.trim()
        if (refined && refined.length > 10) mergedDescription = refined
      } catch { /* use original */ }

      try {
        imageBuffer = await generateCharacterReference(
          [{ name: character.name, description: mergedDescription }],
          artStyle,
        )
      } catch {
        return apiError('Failed to generate portrait', 'GENERATION_ERROR', 500)
      }
    }
  } else {
    // --- New style: generate fresh, using primary portrait for face/body consistency ---
    let identityRefBuffer: Buffer | undefined
    if (primaryPortrait?.image_url) {
      try {
        const res = await fetch(primaryPortrait.image_url)
        if (res.ok) identityRefBuffer = Buffer.from(await res.arrayBuffer())
      } catch { /* best effort */ }
    }

    try {
      imageBuffer = await generateCharacterReference(
        [{ name: character.name, description }],
        artStyle,
        identityRefBuffer,
      )
    } catch {
      if (isNewStyle && transactionId) {
        await supabase.rpc('refund_credits', {
          p_user_id: userId, p_amount: 1,
          p_original_transaction_id: transactionId,
          p_description: 'Portrait generation failed — credits refunded',
        })
      }
      return apiError('Failed to generate portrait', 'GENERATION_ERROR', 500)
    }
  }

  if (!imageBuffer) {
    if (isNewStyle && transactionId) {
      await supabase.rpc('refund_credits', {
        p_user_id: userId, p_amount: 1,
        p_original_transaction_id: transactionId,
        p_description: 'Portrait generation failed — credits refunded',
      })
    }
    return apiError('Failed to generate portrait', 'GENERATION_ERROR', 500)
  }

  // Upload to R2
  const portraitFileId = portraitId || crypto.randomUUID()
  const key = `characters/${userId}/${characterId}/${portraitFileId}.png`
  const imageUrl = await uploadToR2(key, imageBuffer, 'image/png')

  let resultPortraitId: string

  if (isRefine && portraitId) {
    // Update existing portrait
    const portrait = (portraits ?? []).find((p: any) => p.id === portraitId)
    const newCount = (portrait?.refinement_count ?? 0) + 1
    await supabase.rpc('update_character_portrait', {
      p_portrait_id: portraitId,
      p_user_id: userId,
      p_image_url: imageUrl,
      p_refinement_count: newCount,
    })
    resultPortraitId = portraitId
  } else {
    // Insert new portrait — first portrait auto-becomes primary
    const isFirst = !portraits || portraits.length === 0
    const { data: newId, error: insertErr } = await supabase.rpc('insert_character_portrait', {
      p_character_id: characterId,
      p_user_id: userId,
      p_image_url: imageUrl,
      p_art_style: artStyle,
      p_is_primary: isFirst,
    })
    if (insertErr) return apiError(insertErr.message, 'DB_ERROR', 500)
    resultPortraitId = newId

    // Also update physical description on the character
    await supabase.rpc('update_character', {
      p_user_id: userId,
      p_character_id: characterId,
      p_physical_description: description,
    })
  }

  // Fetch updated portraits
  const { data: updatedPortraits } = await supabase.rpc('get_character_portraits', {
    p_character_id: characterId,
    p_user_id: userId,
  })

  return apiSuccess({
    portraitId: resultPortraitId,
    imageUrl,
    artStyle,
    portraits: (updatedPortraits ?? []).map((p: any) => ({
      id: p.id,
      imageUrl: p.image_url,
      artStyle: p.art_style,
      isPrimary: p.is_primary,
      refinementCount: p.refinement_count,
      createdAt: p.created_at,
    })),
  })
}

export const maxDuration = 120
