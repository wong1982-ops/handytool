import { apiSuccess, apiError } from '@/lib/api/response'
import { analyzePhoto, calculateAdjustments, calculateCropTransform } from '@/lib/id-photo/ai-enhance'
import { removeBackground } from '@/lib/id-photo/background-removal'
import { uploadToR2 } from '@/lib/storage/r2'

export const maxDuration = 60 // increased for background removal

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

    // Step 1: Analyze with Gemini (face detection, quality, landmarks)
    console.log('[id-photo/enhance] Step 1: Analyzing photo...')
    const analysis = await analyzePhoto(imageBase64, imageMime)
    console.log('[id-photo/enhance] Quality:', analysis.overall_quality, 'Face:', analysis.face_detected,
      'Eye:', analysis.eye_line_y, 'Chin:', analysis.chin_y, 'HeadTop:', analysis.head_top_y)

    if (analysis.overall_quality === 'reject' || !analysis.face_detected) {
      return apiError(
        analysis.reject_reason || 'Could not detect a suitable face in this photo.',
        'PHOTO_REJECTED',
        400,
        { analysis },
      )
    }

    // Step 2: Background removal (always, for ID photos)
    let enhancedImageUrl: string | null = null
    console.log('[id-photo/enhance] Step 2: Removing background...')
    try {
      // Upload original to R2 first (Replicate needs a public URL)
      const originalPath = `id-photo/originals/${crypto.randomUUID()}.png`
      const imageBuffer = Buffer.from(imageBase64, 'base64')
      const originalUrl = await uploadToR2(originalPath, imageBuffer, imageMime)

      // Remove background via Replicate
      const bgRemovedUrl = await removeBackground(originalUrl)

      if (bgRemovedUrl) {
        // Download the bg-removed image and re-upload to our R2
        const bgResponse = await fetch(bgRemovedUrl)
        const bgBuffer = Buffer.from(await bgResponse.arrayBuffer())
        const enhancedPath = `id-photo/enhanced/${crypto.randomUUID()}.png`
        enhancedImageUrl = await uploadToR2(enhancedPath, bgBuffer, 'image/png')
        console.log('[id-photo/enhance] Background removed:', enhancedImageUrl.substring(0, 60))
      } else {
        // Replicate not configured — use original
        enhancedImageUrl = originalUrl
        console.log('[id-photo/enhance] Background removal skipped (no API token)')
      }
    } catch (bgErr) {
      console.error('[id-photo/enhance] Background removal failed:', bgErr)
      // Fall back to original without bg removal
      const fallbackPath = `id-photo/enhanced/${crypto.randomUUID()}.png`
      const imageBuffer = Buffer.from(imageBase64, 'base64')
      enhancedImageUrl = await uploadToR2(fallbackPath, imageBuffer, imageMime)
    }

    // Step 3: Calculate adjustments (brightness, contrast, sharpness)
    const adjustments = calculateAdjustments(analysis)
    console.log('[id-photo/enhance] Step 3: Adjustments:', adjustments)

    // Step 4: Calculate ID-compliant crop transform
    // Uses ICAO 9303 positioning: face 70-80% height, eyes at ~40% from top
    const cropTransform = calculateCropTransform(analysis)
    console.log('[id-photo/enhance] Step 4: Crop transform:', cropTransform)

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
