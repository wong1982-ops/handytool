import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { callFalAi, fetchImageAsBase64 } from '@/lib/image-editor/fal-client'

export const maxDuration = 60

interface SegmentRequest {
  image: string
  points: { x: number; y: number }[]
  width: number
  height: number
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: SegmentRequest
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!body.image || typeof body.image !== 'string') {
    return API_ERRORS.VALIDATION({ message: 'image is required (base64 data URL)' })
  }
  if (!Array.isArray(body.points) || body.points.length === 0) {
    return API_ERRORS.VALIDATION({ message: 'points array is required with at least one point' })
  }
  if (!body.width || !body.height || body.width <= 0 || body.height <= 0) {
    return API_ERRORS.VALIDATION({ message: 'width and height (positive integers) are required' })
  }

  const supabase = await createClient()

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'image-editor-segment',
    p_description: 'Image Editor — Object Segmentation',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: 1 })
    }
    console.error('[image-editor/segment] deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    // Convert fraction-based points to pixel coordinates
    const pointCoords = body.points.map((p) => [
      Math.round(p.x * body.width),
      Math.round(p.y * body.height),
    ])
    const pointLabels = body.points.map(() => 1)

    const result = await callFalAi('fal-ai/sam2/image', {
      image_url: body.image,
      point_coords: pointCoords,
      point_labels: pointLabels,
    }) as { masks: { mask_url: string }[] }

    if (!result.masks || result.masks.length === 0) {
      throw new Error('No masks returned from segmentation model')
    }

    const base64MaskUrl = await fetchImageAsBase64(result.masks[0].mask_url)
    return apiSuccess({ mask: base64MaskUrl })
  } catch (err) {
    console.error('[image-editor/segment] error:', err)
    return apiError(
      'Failed to segment object. Please try again.',
      'PROCESSING_FAILED',
      500,
    )
  }
}
