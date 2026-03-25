import { apiSuccess, apiError } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { buildPrompts } from '@/lib/logo-generator/prompts'
import type { LogoStyle } from '@/tools/logo-generator/types'

// Allow up to 30s for generating 12 images in parallel
export const maxDuration = 30

const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

async function callGeminiTextToImage(prompt: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
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
  let body: {
    businessName: string
    tagline?: string
    industry: string
    style: string
    colors: string[]
    customPrompt?: string
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const { businessName, tagline, industry, style, colors, customPrompt } = body

  if (!businessName?.trim()) {
    return apiError('businessName is required', 'VALIDATION_ERROR', 400)
  }
  if (!style?.trim()) {
    return apiError('style is required', 'VALIDATION_ERROR', 400)
  }

  const prompts = buildPrompts(
    businessName.trim(),
    tagline?.trim() ?? '',
    industry?.trim() ?? '',
    style as LogoStyle,
    colors ?? [],
    customPrompt?.trim(),
  )

  const projectUuid = crypto.randomUUID()

  console.log('[logo-generator] Generating 12 concepts...')

  const results = await Promise.allSettled(
    prompts.map(async (prompt, index) => {
      const imageBuffer = await callGeminiTextToImage(prompt)
      const r2Path = `logo-generator/${projectUuid}/${index}.png`
      const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
      return { imageUrl, variation: `variation-${index}` }
    }),
  )

  const concepts = results
    .filter(
      (r): r is PromiseFulfilledResult<{ imageUrl: string; variation: string }> =>
        r.status === 'fulfilled',
    )
    .map((r) => r.value)

  console.log(`[logo-generator] ${concepts.length}/12 succeeded`)

  if (concepts.length === 0) {
    const firstError = results.find((r) => r.status === 'rejected') as
      | PromiseRejectedResult
      | undefined
    const msg =
      firstError?.reason instanceof Error
        ? firstError.reason.message
        : String(firstError?.reason ?? 'All generations failed')
    return apiError(`Logo generation failed: ${msg}`, 'GENERATION_FAILED', 500)
  }

  return apiSuccess({ concepts })
}
