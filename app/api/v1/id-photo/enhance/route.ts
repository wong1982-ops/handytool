import { apiSuccess, apiError } from '@/lib/api/response'
import { analyzePhoto, calculateAdjustments, calculateCropTransform } from '@/lib/id-photo/ai-enhance'
import { uploadToR2 } from '@/lib/storage/r2'

export const maxDuration = 30

export async function POST(request: Request) {
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

    // Step 1: Analyze with Gemini
    console.log('[id-photo/enhance] Analyzing photo...')
    const analysis = await analyzePhoto(imageBase64, imageMime)
    console.log('[id-photo/enhance] Quality:', analysis.overall_quality, 'Face:', analysis.face_detected)

    if (analysis.overall_quality === 'reject' || !analysis.face_detected) {
      return apiError(
        analysis.reject_reason || 'Could not detect a suitable face in this photo.',
        'PHOTO_REJECTED',
        400,
        { analysis },
      )
    }

    // Step 2: Upload to R2 (background removal is future enhancement)
    let enhancedImageUrl: string | null = null
    if (analysis.background_complexity !== 'clean') {
      console.log('[id-photo/enhance] Background:', analysis.background_complexity)
      const r2Path = `id-photo/enhanced/${crypto.randomUUID()}.png`
      const imageBuffer = Buffer.from(imageBase64, 'base64')
      enhancedImageUrl = await uploadToR2(r2Path, imageBuffer, imageMime)
    }

    // Step 3: Calculate adjustments
    const adjustments = calculateAdjustments(analysis)

    // Step 4: Calculate crop transform
    const cropTransform = calculateCropTransform(analysis)

    return apiSuccess({
      analysis,
      enhancedImageUrl,
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
