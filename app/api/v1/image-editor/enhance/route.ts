import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { callFalAi, fetchImageAsBase64 } from '@/lib/image-editor/fal-client'

export const maxDuration = 120

const VALID_MODES = ['upscale', 'denoise', 'restore-faces'] as const
type EnhanceMode = (typeof VALID_MODES)[number]

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { image: string; mode: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!body.image || typeof body.image !== 'string') {
    return API_ERRORS.VALIDATION({ message: 'image is required (base64 data URL)' })
  }
  if (!VALID_MODES.includes(body.mode as EnhanceMode)) {
    return API_ERRORS.VALIDATION({
      message: `mode must be one of: ${VALID_MODES.join(', ')}`,
    })
  }

  const mode = body.mode as EnhanceMode
  const supabase = await createClient()

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'image-editor-enhance',
    p_description: `Image Editor — Enhance (${mode})`,
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: 1 })
    }
    console.error('[image-editor/enhance] deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    let result: { image: { url: string } }

    if (mode === 'restore-faces') {
      result = await callFalAi('fal-ai/gfpgan', {
        image_url: body.image,
      }) as { image: { url: string } }
    } else {
      // upscale and denoise both use Real-ESRGAN
      result = await callFalAi('fal-ai/real-esrgan', {
        image_url: body.image,
        scale: 2,
      }) as { image: { url: string } }
    }

    const base64DataUrl = await fetchImageAsBase64(result.image.url)
    return apiSuccess({ image: base64DataUrl })
  } catch (err) {
    console.error('[image-editor/enhance] error:', err)
    return apiError(
      'Failed to enhance image. Please try again.',
      'PROCESSING_FAILED',
      500,
    )
  }
}
