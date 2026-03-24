import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

type DownloadFormat = 'png-2048' | 'svg' | 'bundle'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { imageUrl: string; format: DownloadFormat }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const { imageUrl, format } = body

  if (!imageUrl?.trim()) {
    return apiError('imageUrl is required', 'VALIDATION_ERROR', 400)
  }
  if (!format || !['png-2048', 'svg', 'bundle'].includes(format)) {
    return apiError(
      'format must be one of: png-2048, svg, bundle',
      'VALIDATION_ERROR',
      400,
    )
  }

  // All formats cost 1 credit
  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'logo-generator',
    p_description: `Logo download (${format})`,
  })
  if (creditError) {
    return apiError(
      creditError.message || 'Insufficient credits',
      'INSUFFICIENT_CREDITS',
      402,
    )
  }

  if (format === 'png-2048') {
    // V1: pass-through — actual resize is a future enhancement
    return apiSuccess({ downloadUrl: imageUrl })
  }

  if (format === 'svg') {
    return apiError(
      'Use the SVG download button which calls convert-svg directly',
      'USE_CONVERT_SVG',
      400,
    )
  }

  // format === 'bundle'
  return apiError('Brand Kit bundles coming soon', 'COMING_SOON', 501)
}
