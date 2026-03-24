import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { uploadToR2 } from '@/lib/storage/r2'

export const maxDuration = 60

const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-2.5-flash'

const SVG_PROMPT =
  'Convert this logo image to clean, minimal SVG code. Output ONLY valid SVG markup starting with <svg and ending with </svg>. No explanation, no markdown code blocks.'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { imageUrl: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const { imageUrl } = body
  if (!imageUrl?.trim()) {
    return apiError('imageUrl is required', 'VALIDATION_ERROR', 400)
  }

  // Fetch image and convert to base64
  let imageBase64: string
  let imageMimeType: string
  try {
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) {
      return apiError('Failed to fetch image', 'FETCH_ERROR', 400)
    }
    const contentType = imageRes.headers.get('content-type') || 'image/png'
    imageMimeType = contentType.split(';')[0].trim()
    const arrayBuffer = await imageRes.arrayBuffer()
    imageBase64 = Buffer.from(arrayBuffer).toString('base64')
  } catch {
    return apiError('Failed to fetch image', 'FETCH_ERROR', 400)
  }

  // Deduct 1 credit
  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'logo-generator',
    p_description: 'Logo SVG conversion',
  })
  if (creditError) {
    return apiError(
      creditError.message || 'Insufficient credits',
      'INSUFFICIENT_CREDITS',
      402,
    )
  }

  // Call Gemini with image + prompt
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  let svgCode: string
  try {
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: imageMimeType,
                  data: imageBase64,
                },
              },
              { text: SVG_PROMPT },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'text/plain',
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini API ${geminiRes.status}: ${errText.substring(0, 300)}`)
    }

    const geminiData = await geminiRes.json()
    const rawText: string =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    svgCode = rawText.trim()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return apiError(`Gemini request failed: ${msg}`, 'GENERATION_FAILED', 500)
  }

  // Validate SVG output
  if (!svgCode.startsWith('<svg') || !svgCode.endsWith('</svg>')) {
    return apiError(
      'SVG conversion failed — the logo may be too complex for vector conversion',
      'INVALID_SVG',
      422,
    )
  }

  // Upload SVG to R2
  const uuid = crypto.randomUUID()
  const r2Path = `logo-generator/svg/${uuid}.svg`
  const svgBuffer = Buffer.from(svgCode, 'utf-8')
  const svgUrl = await uploadToR2(r2Path, svgBuffer, 'image/svg+xml')

  return apiSuccess({ svgUrl, svgCode })
}
