import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export const maxDuration = 120

/**
 * Strip `data:<mime>;base64,` prefix and return { mimeType, data }.
 */
function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], data: match[2] }
  }
  return { mimeType: 'image/png', data: dataUrl }
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { image: string; mask: string; prompt: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!body.image || typeof body.image !== 'string') {
    return API_ERRORS.VALIDATION({ message: 'image is required (base64 data URL)' })
  }
  if (!body.mask || typeof body.mask !== 'string') {
    return API_ERRORS.VALIDATION({ message: 'mask is required (base64 data URL)' })
  }
  if (!body.prompt || typeof body.prompt !== 'string' || !body.prompt.trim()) {
    return API_ERRORS.VALIDATION({ message: 'prompt is required and cannot be empty' })
  }

  const supabase = await createClient()

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'image-editor-generative-fill',
    p_description: 'Image Editor — Generative Fill',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: 1 })
    }
    console.error('[image-editor/generative-fill] deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    const imageParsed = parseDataUrl(body.image)
    const maskParsed = parseDataUrl(body.mask)

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: imageParsed.mimeType, data: imageParsed.data } },
            { inlineData: { mimeType: maskParsed.mimeType, data: maskParsed.data } },
            {
              text: `Edit this image. In the white areas of the second image (mask), generate: ${body.prompt.trim()}. Match the style, lighting, and perspective of the original image. Keep everything outside the mask exactly the same. Return only the edited image.`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    })

    const candidates = response.candidates
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates in Gemini response')
    }

    const parts = candidates[0].content?.parts
    if (!parts) {
      throw new Error('No parts in Gemini response')
    }

    const imagePart = parts.find((p) => p.inlineData?.data)
    if (!imagePart?.inlineData) {
      throw new Error('No image data in Gemini response')
    }

    const resultMime = imagePart.inlineData.mimeType || 'image/png'
    const base64DataUrl = `data:${resultMime};base64,${imagePart.inlineData.data}`

    return apiSuccess({ image: base64DataUrl })
  } catch (err) {
    console.error('[image-editor/generative-fill] error:', err)
    return apiError(
      'Failed to generate fill. Please try again.',
      'PROCESSING_FAILED',
      500,
    )
  }
}
