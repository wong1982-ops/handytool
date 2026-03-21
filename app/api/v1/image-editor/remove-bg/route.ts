import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { callFalAi, fetchImageAsBase64 } from '@/lib/image-editor/fal-client'

export const maxDuration = 60

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { image: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!body.image || typeof body.image !== 'string') {
    return API_ERRORS.VALIDATION({ message: 'image is required (base64 data URL)' })
  }

  const supabase = await createClient()

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'image-editor-remove-bg',
    p_description: 'Image Editor — Background Removal',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: 1 })
    }
    console.error('[image-editor/remove-bg] deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    const result = await callFalAi('fal-ai/birefnet', {
      image_url: body.image,
      model: 'General Use (Heavy)',
      operating_resolution: '1024x1024',
    }) as { image: { url: string } }

    const base64DataUrl = await fetchImageAsBase64(result.image.url)
    return apiSuccess({ image: base64DataUrl })
  } catch (err) {
    console.error('[image-editor/remove-bg] error:', err)
    return apiError(
      'Failed to remove background. Please try again.',
      'PROCESSING_FAILED',
      500,
    )
  }
}
