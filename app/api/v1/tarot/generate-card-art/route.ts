import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { z } from 'zod'

export const maxDuration = 30

const GEMINI_API_KEY = process.env.SKETCH_TO_ART_GEMINI_KEY || (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

const schema = z.object({
  cardId: z.number().int().min(0).max(77),
  cardName: z.string().min(1),
  question: z.string().max(500).default(''),
  spreadContext: z.string().max(200).default(''),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION({ message: parsed.error.errors[0]?.message ?? 'Validation failed' })
  }

  const { cardId, cardName, question, spreadContext } = parsed.data

  const contextParts: string[] = []
  if (question) contextParts.push(`Question: ${question}`)
  if (spreadContext) contextParts.push(`Spread context: ${spreadContext}`)
  const contextText = contextParts.length > 0 ? ` ${contextParts.join('. ')}.` : ''

  const prompt =
    `Create a tarot card illustration for "${cardName}".${contextText} ` +
    `Style: Art nouveau with rich jewel tones, gold leaf accents, mystical atmosphere. ` +
    `Vertical portrait orientation (2:3 aspect ratio). No text or borders.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  let geminiResponse: Response
  try {
    geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[tarot/generate-card-art] Gemini fetch error:', msg)
    return apiError('Failed to reach image generation service', 'GENERATION_FAILED', 500)
  }

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text()
    console.error(`[tarot/generate-card-art] Gemini API ${geminiResponse.status}:`, errText.substring(0, 300))
    return apiError(`Image generation failed (${geminiResponse.status})`, 'GENERATION_FAILED', 500)
  }

  const data = await geminiResponse.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) {
    console.error('[tarot/generate-card-art] No parts in Gemini response:', JSON.stringify(data).substring(0, 300))
    return apiError('No image returned from generation service', 'GENERATION_FAILED', 500)
  }

  let imageBase64: string | undefined
  for (const part of parts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) {
      imageBase64 = imageData
      break
    }
  }

  if (!imageBase64) {
    console.error('[tarot/generate-card-art] No image data in parts')
    return apiError('No image data in generation response', 'GENERATION_FAILED', 500)
  }

  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const r2Key = `tarot-custom/${userId}/${Date.now()}-card${cardId}.webp`

  let imageUrl: string
  try {
    imageUrl = await uploadToR2(r2Key, imageBuffer, 'image/webp')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[tarot/generate-card-art] R2 upload error:', msg)
    return apiError('Failed to store generated image', 'GENERATION_FAILED', 500)
  }

  return apiSuccess({ imageUrl })
}
