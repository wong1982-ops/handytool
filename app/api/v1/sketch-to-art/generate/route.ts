import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { ART_STYLES } from '@/tools/sketch-to-art/types'

// Allow up to 120s for generating 4 images in parallel
export const maxDuration = 120

const CREDIT_COST = 1
// Use dedicated key for sketch-to-art (separate from main GEMINI_API_KEY to avoid Vercel env var issues)
const GEMINI_API_KEY = process.env.SKETCH_TO_ART_GEMINI_KEY || (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

/**
 * Call Gemini API directly via REST fetch.
 * Bypasses @google/genai SDK which sets Authorization header
 * (broken on Vercel due to invisible chars in env var).
 * Uses API key as query parameter instead.
 */
async function callGeminiImageGeneration(
  sketchBase64: string,
  sketchMime: string,
  prompt: string,
): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: sketchMime, data: sketchBase64 } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`)
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) throw new Error('No parts in Gemini response')

  for (const part of parts) {
    // REST API response uses camelCase (inlineData) not snake_case (inline_data)
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) {
      return Buffer.from(imageData, 'base64')
    }
  }

  throw new Error('No image in Gemini response')
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { sketch: string; style: string; customStyle?: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { sketch, style, customStyle } = body

  if (!sketch?.trim()) {
    return apiError('Sketch image is required', 'VALIDATION_ERROR', 400)
  }
  if (!style?.trim() && !customStyle?.trim()) {
    return apiError('Art style is required', 'VALIDATION_ERROR', 400)
  }

  // Deduct credit
  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_tool_id: 'sketch-to-art',
    p_description: 'Sketch to Art — 4 variations',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, {
        required: CREDIT_COST,
      })
    }
    console.error('sketch-to-art/generate deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  // Extract mime type and raw base64 from data URL
  const mimeMatch = sketch.match(/^data:(image\/[^;]+);base64,/)
  const sketchMime = mimeMatch?.[1] || 'image/jpeg'
  const sketchBase64 = sketch.replace(/^data:image\/[^;]+;base64,/, '')

  // Resolve style name
  const styleName =
    customStyle?.trim() ||
    ART_STYLES.find((s) => s.id === style)?.name ||
    style

  // Build 4 prompt variations
  const prompts = [
    `Transform this child's sketch into beautiful ${styleName} art. Maintain the original composition and subjects but elevate it with professional ${styleName} artistic quality.`,
    `Reimagine this hand-drawn sketch as a stunning ${styleName} masterpiece. Keep all the elements from the original drawing but enhance them.`,
    `Convert this sketch into ${styleName} style art. Emphasize rich colors, textures and details while preserving the charm of the original drawing.`,
    `Create a ${styleName} interpretation of this drawing with creative artistic flair. Honor the original sketch's composition and subjects.`,
  ]

  try {
    // v7: REST API with key as query param — NO Authorization header at all
    console.log('[sketch-to-art] v8 REST, model:', GEMINI_MODEL, 'key:', GEMINI_API_KEY.substring(0, 10) + '...', 'len:', GEMINI_API_KEY.length, 'sketch bytes:', sketchBase64.length)
    const results = await Promise.allSettled(
      prompts.map(async (prompt, idx) => {
        console.log(`[sketch-to-art] V${idx + 1} calling Gemini...`)
        const imageBuffer = await callGeminiImageGeneration(sketchBase64, sketchMime, prompt)
        console.log(`[sketch-to-art] V${idx + 1} Gemini OK, ${imageBuffer.length} bytes. Uploading to R2...`)
        const r2Path = `sketch-art/${crypto.randomUUID()}.png`
        const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
        console.log(`[sketch-to-art] V${idx + 1} R2 OK: ${imageUrl.substring(0, 60)}`)
        return { imageUrl, prompt }
      }),
    )

    // Log results
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const err = (r as PromiseRejectedResult).reason
        console.error(`[sketch-to-art] Variation ${i + 1} FAILED:`, err?.message || String(err))
      } else {
        console.log(`[sketch-to-art] Variation ${i + 1} OK`)
      }
    })

    const variations = results
      .filter(
        (r): r is PromiseFulfilledResult<{ imageUrl: string; prompt: string }> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value)

    if (variations.length === 0) {
      // Collect error details for debugging
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => r.reason?.message || String(r.reason))
      const firstError = errors[0] || 'Unknown error'
      console.error('[sketch-to-art] All variations failed. Errors:', errors)
      return apiError(
        `Generation failed: ${firstError}`,
        'GENERATION_FAILED',
        500,
        { errors },
      )
    }

    return apiSuccess({ variations })
  } catch (err) {
    console.error('sketch-to-art/generate error:', err)
    return apiError(
      'Failed to generate art. Your credit has been deducted — please try again.',
      'GENERATION_FAILED',
      500,
    )
  }
}
