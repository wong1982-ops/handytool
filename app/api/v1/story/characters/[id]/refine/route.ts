import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { generateCharacterReference } from '@/lib/story/illustrate'
import { uploadToR2 } from '@/lib/storage/r2'
import { createAdminClient } from '@/lib/supabase/admin'

const refineSchema = z.object({
  physicalDescription: z.string().min(10).max(2000),
  feedback: z.string().max(1000).optional(),
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

  // Fetch character — must be owned by user (direct query, no RPC needed)
  const { data: character, error: fetchErr } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .eq('user_id', userId)
    .single()
  if (fetchErr || !character) return apiError('Character not found', 'NOT_FOUND', 404)

  const isFirstGeneration = !character.reference_image_url
  const maxRefinements = 3  // Design doc specifies max 3 refinements

  if (!isFirstGeneration && character.refinement_count >= maxRefinements) {
    return apiError('Refinement limit reached. Approve this character or create a new one.', 'REFINEMENT_LIMIT', 400)
  }

  // Credit check: first generation costs 1 credit, refinements are free
  const adminClient = createAdminClient()
  if (isFirstGeneration) {
    const { data: balance } = await adminClient.rpc('get_user_credits', { p_user_id: userId })
    if ((balance ?? 0) < 1) return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)

    // Reserve credit upfront
    await adminClient.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: 1,
      p_reason: 'character_refinement',
      p_reference_id: characterId,
    })
  }

  // Merge feedback into description if provided
  let description = parsed.data.physicalDescription
  if (parsed.data.feedback) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(`You are refining a character's physical description based on user feedback.

Current description:
${description}

User feedback:
${parsed.data.feedback}

Write an improved physical description that incorporates the feedback. Keep it under 500 words. Return ONLY the description, no preamble.`)
      const refined = result.response.text()?.trim()
      if (refined && refined.length > 10) description = refined
    } catch {
      // Use original description if merge fails
    }
  }

  // Find a style reference from user's other approved characters
  let styleRefBuffer: Buffer | undefined
  const { data: approvedChars } = await supabase
    .from('characters')
    .select('id, reference_image_url')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .not('reference_image_url', 'is', null)
    .neq('id', characterId)
    .limit(1)
  if (approvedChars?.[0]?.reference_image_url) {
    try {
      const res = await fetch(approvedChars[0].reference_image_url)
      if (res.ok) styleRefBuffer = Buffer.from(await res.arrayBuffer())
    } catch { /* best effort */ }
  }

  // Generate portrait — signature: (characters[], style, styleRefBuffer?)
  let imageBuffer: Buffer | null
  try {
    imageBuffer = await generateCharacterReference(
      [{ name: character.name, description }],
      'children\'s book illustration',  // default style
      styleRefBuffer,
    )
  } catch {
    // Refund credit if generation fails
    if (isFirstGeneration) {
      await adminClient.rpc('add_credits', {
        p_user_id: userId,
        p_amount: 1,
        p_reason: 'character_refinement_refund',
        p_reference_id: characterId,
      })
    }
    return apiError('Failed to generate portrait', 'GENERATION_ERROR', 500)
  }
  if (!imageBuffer) {
    // Refund credit if generation returns null
    if (isFirstGeneration) {
      await adminClient.rpc('add_credits', {
        p_user_id: userId,
        p_amount: 1,
        p_reason: 'character_refinement_refund',
        p_reference_id: characterId,
      })
    }
    return apiError('Failed to generate portrait', 'GENERATION_ERROR', 500)
  }

  // Upload to R2 — signature: uploadToR2(path, body, contentType)
  const key = `characters/${userId}/${characterId}.png`
  const imageUrl = await uploadToR2(key, imageBuffer, 'image/png')

  // Update character with new portrait + description + refinement count
  const newRefinementCount = isFirstGeneration ? 0 : character.refinement_count + 1
  await supabase
    .from('characters')
    .update({
      physical_description: description,
      reference_image_url: imageUrl,
      refinement_count: newRefinementCount,
    })
    .eq('id', characterId)
    .eq('user_id', userId)

  return apiSuccess({
    physicalDescription: description,
    referenceImageUrl: imageUrl,
    refinementCount: newRefinementCount,
    maxRefinements,
  })
}

export const maxDuration = 120
