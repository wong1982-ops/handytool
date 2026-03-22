import crypto from 'crypto'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { ART_STYLES } from '@/tools/sketch-to-art/types'

// Allow up to 120s for generating 4 images in parallel
export const maxDuration = 120

const CREDIT_COST = 1

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
  const sketchMime = mimeMatch?.[1] || 'image/png'
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

  const nanoBanana = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || '').trim() })

  try {
    const results = await Promise.allSettled(
      prompts.map(async (prompt) => {
        const response = await nanoBanana.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: sketchMime, data: sketchBase64 } },
                { text: prompt },
              ],
            },
          ],
          config: { responseModalities: ['IMAGE', 'TEXT'] },
        })

        // Extract image from response
        const parts = response.candidates?.[0]?.content?.parts
        const imagePart = parts?.find(
          (p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data,
        )
        if (!imagePart?.inlineData?.data) {
          throw new Error('No image in response')
        }

        const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
        const r2Path = `sketch-art/${crypto.randomUUID()}.png`
        const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')

        return { imageUrl, prompt }
      }),
    )

    // Log failed variations for debugging
    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length > 0) {
      console.error(`[sketch-to-art] ${failed.length}/4 variations failed:`,
        failed.map((r) => (r as PromiseRejectedResult).reason?.message || String((r as PromiseRejectedResult).reason)).join('; '))
    }

    const variations = results
      .filter(
        (r): r is PromiseFulfilledResult<{ imageUrl: string; prompt: string }> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value)

    if (variations.length === 0) {
      return apiError(
        'Failed to generate any art variations. Your credit has been deducted — please try again.',
        'GENERATION_FAILED',
        500,
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
