import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { extractStoryFromImages } from '@/lib/story/scan'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_SCAN_IMAGES = 10
const SCAN_CREDIT_COST = 1

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Parse form data
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('multipart/form-data')) {
    return apiError('Content-Type must be multipart/form-data', 'VALIDATION_ERROR', 400)
  }

  const formData = await request.formData()
  const entries = formData.getAll('images')
  const files = entries.filter((e): e is File => e instanceof File)

  if (files.length === 0) {
    return apiError('No images provided', 'VALIDATION_ERROR', 400)
  }

  if (files.length > MAX_SCAN_IMAGES) {
    return apiError(
      `Too many images. Maximum is ${MAX_SCAN_IMAGES}.`,
      'IMAGE_LIMIT_EXCEEDED',
      400,
      { limit: MAX_SCAN_IMAGES, uploaded: files.length },
    )
  }

  // Deduct credits
  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: SCAN_CREDIT_COST,
    p_tool_id: 'story-scan',
    p_description: `Story Studio — Scan ${files.length} page${files.length !== 1 ? 's' : ''}`,
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: SCAN_CREDIT_COST })
    }
    console.error('story/scan deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  // Validate each file
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return apiError(
        `Unsupported file type: ${file.type}. Accepted: jpg, png, heic, webp`,
        'VALIDATION_ERROR',
        400,
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `File "${file.name}" exceeds the 10MB size limit`,
        'VALIDATION_ERROR',
        400,
      )
    }
  }

  // Convert files to buffers
  const imageBuffers = await Promise.all(
    files.map(async (file) => ({
      data: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
    })),
  )

  // Extract story via Gemini
  try {
    const plotSummary = await extractStoryFromImages(imageBuffers)
    return apiSuccess({ plotSummary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed'
    if (message === 'EXTRACTION_FAILED') {
      return apiError(
        "We couldn't extract readable text from these images. Try clearer photos.",
        'EXTRACTION_FAILED',
        422,
      )
    }
    console.error('[story/scan] Gemini extraction error:', err)
    return API_ERRORS.INTERNAL()
  }
}
