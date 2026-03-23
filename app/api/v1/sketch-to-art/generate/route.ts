import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { ART_STYLES } from '@/tools/sketch-to-art/types'

// Allow up to 120s for generating 4 images in parallel
export const maxDuration = 120

const CREDIT_COST = 1
const GEMINI_API_KEY = process.env.SKETCH_TO_ART_GEMINI_KEY || (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

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

  const mimeMatch = sketch.match(/^data:(image\/[^;]+);base64,/)
  const sketchMime = mimeMatch?.[1] || 'image/jpeg'
  const sketchBase64 = sketch.replace(/^data:image\/[^;]+;base64,/, '')

  const styleName =
    customStyle?.trim() ||
    ART_STYLES.find((s) => s.id === style)?.name ||
    style

  // Generate only 1 variation first to isolate issues, then do remaining 3
  const prompts = [
    `Transform this child's sketch into beautiful ${styleName} art. Maintain the original composition and subjects but elevate it with professional ${styleName} artistic quality.`,
    `Reimagine this hand-drawn sketch as a stunning ${styleName} masterpiece. Keep all the elements from the original drawing but enhance them.`,
    `Convert this sketch into ${styleName} style art. Emphasize rich colors, textures and details while preserving the charm of the original drawing.`,
    `Create a ${styleName} interpretation of this drawing with creative artistic flair. Honor the original sketch's composition and subjects.`,
  ]

  try {
    console.log('[sketch-to-art] v9, key:', GEMINI_API_KEY.substring(0, 10) + '...', 'len:', GEMINI_API_KEY.length)

    // Step 1: Test Gemini call
    let imageBuffer: Buffer
    try {
      console.log('[sketch-to-art] Step 1: Calling Gemini...')
      imageBuffer = await callGeminiImageGeneration(sketchBase64, sketchMime, prompts[0])
      console.log('[sketch-to-art] Step 1 OK: Gemini returned', imageBuffer.length, 'bytes')
    } catch (geminiErr) {
      const msg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr)
      console.error('[sketch-to-art] Step 1 FAILED (Gemini):', msg)
      return apiError(`Gemini failed: ${msg}`, 'GENERATION_FAILED', 500)
    }

    // Step 2: Test R2 upload
    let firstUrl: string
    try {
      console.log('[sketch-to-art] Step 2: Uploading to R2...')
      const r2Path = `sketch-art/${crypto.randomUUID()}.png`
      firstUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
      console.log('[sketch-to-art] Step 2 OK: R2 URL', firstUrl.substring(0, 60))
    } catch (r2Err) {
      const msg = r2Err instanceof Error ? `${r2Err.message} | stack: ${r2Err.stack?.substring(0, 200)}` : String(r2Err)
      console.error('[sketch-to-art] Step 2 FAILED (R2):', msg)
      return apiError(`R2 upload failed: ${r2Err instanceof Error ? r2Err.message : String(r2Err)}`, 'GENERATION_FAILED', 500)
    }

    // Step 3: Generate remaining 3 in parallel
    console.log('[sketch-to-art] Step 3: Generating remaining 3 variations...')
    const remaining = await Promise.allSettled(
      prompts.slice(1).map(async (prompt) => {
        const buf = await callGeminiImageGeneration(sketchBase64, sketchMime, prompt)
        const path = `sketch-art/${crypto.randomUUID()}.png`
        const url = await uploadToR2(path, buf, 'image/png')
        return { imageUrl: url, prompt }
      }),
    )

    const variations = [
      { imageUrl: firstUrl, prompt: prompts[0] },
      ...remaining
        .filter((r): r is PromiseFulfilledResult<{ imageUrl: string; prompt: string }> => r.status === 'fulfilled')
        .map((r) => r.value),
    ]

    console.log(`[sketch-to-art] Done: ${variations.length}/4 variations`)
    return apiSuccess({ variations })
  } catch (err) {
    const msg = err instanceof Error ? `${err.message} | stack: ${err.stack?.substring(0, 300)}` : String(err)
    console.error('[sketch-to-art] Unexpected error:', msg)
    return apiError(
      `Generation error: ${err instanceof Error ? err.message : String(err)}`,
      'GENERATION_FAILED',
      500,
    )
  }
}
