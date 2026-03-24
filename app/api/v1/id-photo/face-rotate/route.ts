import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateFrontView } from '@/lib/id-photo/face-rotation'

export const maxDuration = 60

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { imageUrl: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { imageUrl } = body

  if (!imageUrl?.trim()) {
    return apiError('imageUrl is required', 'VALIDATION_ERROR', 400)
  }

  // Deduct 1 credit before processing
  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'id-photo',
    p_description: 'ID Photo — Face rotation correction',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, {
        required: 1,
      })
    }
    console.error('[id-photo/face-rotate] deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  // Fetch the image and convert to base64
  let imageBase64: string
  let imageMime: string
  try {
    const imgResponse = await fetch(imageUrl)
    if (!imgResponse.ok) {
      throw new Error(`Failed to fetch image: ${imgResponse.status}`)
    }
    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'
    imageMime = contentType.split(';')[0].trim()
    const arrayBuffer = await imgResponse.arrayBuffer()
    imageBase64 = Buffer.from(arrayBuffer).toString('base64')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[id-photo/face-rotate] fetch image error:', msg)
    return apiError(`Failed to fetch image: ${msg}`, 'FETCH_ERROR', 400)
  }

  // Generate front-facing view via Gemini
  try {
    const rotatedImageUrl = await generateFrontView(imageBase64, imageMime)
    return apiSuccess({ rotatedImageUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[id-photo/face-rotate] generation error:', msg)
    return apiError(`Face rotation failed: ${msg}`, 'GENERATION_FAILED', 500)
  }
}
