import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { analyzePhoto, calculateAdjustments, calculateCropTransform } from '@/lib/id-photo/ai-enhance'

export const maxDuration = 30

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { image: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const { image } = body
  if (!image?.startsWith('data:image/')) {
    return apiError('Image data URL is required', 'VALIDATION_ERROR', 400)
  }

  try {
    const mimeMatch = image.match(/^data:(image\/[^;]+);base64,/)
    const imageMime = mimeMatch?.[1] || 'image/jpeg'
    const imageBase64 = image.replace(/^data:image\/[^;]+;base64,/, '')

    // Step 1: Analyze with Gemini (face detection, quality, landmarks)
    console.log('[id-photo/enhance] Analyzing photo...')
    const analysis = await analyzePhoto(imageBase64, imageMime)
    console.log('[id-photo/enhance] Quality:', analysis.overall_quality,
      'Face:', analysis.face_detected,
      'Eye:', analysis.eye_line_y, 'Chin:', analysis.chin_y)

    if (analysis.overall_quality === 'reject' || !analysis.face_detected) {
      return apiError(
        analysis.reject_reason || 'Could not detect a suitable face in this photo.',
        'PHOTO_REJECTED',
        400,
        { analysis },
      )
    }

    // Step 2: Calculate adjustments (brightness, contrast, sharpness)
    const adjustments = calculateAdjustments(analysis)

    // Step 3: Calculate ID-compliant crop transform (ICAO 9303)
    const cropTransform = calculateCropTransform(analysis)

    // Note: Background removal runs client-side via @imgly/background-removal
    // No server-side processing needed for BG removal

    return apiSuccess({
      analysis,
      enhancedImageUrl: null, // BG removal handled client-side
      adjustments,
      cropTransform,
      faceRotationAvailable: analysis.face_rotation_needed,
    })
  } catch (err) {
    console.error('[id-photo/enhance] Error:', err)
    return apiError(
      err instanceof Error ? err.message : 'Enhancement failed',
      'ENHANCE_FAILED',
      500,
    )
  }
}
