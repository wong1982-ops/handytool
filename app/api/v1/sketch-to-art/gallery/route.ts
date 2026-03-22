import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { title: string; originalSketchUrl: string; resultImageUrl: string; style: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { title, originalSketchUrl, resultImageUrl, style } = body

  if (!title?.trim()) {
    return apiError('Title is required', 'VALIDATION_ERROR', 400)
  }
  if (!originalSketchUrl?.trim()) {
    return apiError('Original sketch URL is required', 'VALIDATION_ERROR', 400)
  }
  if (!resultImageUrl?.trim()) {
    return apiError('Result image URL is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sketch_gallery')
    .insert({
      user_id: userId,
      title: title.trim(),
      original_sketch_url: originalSketchUrl.trim(),
      result_image_url: resultImageUrl.trim(),
      style: style?.trim() || 'unknown',
      is_public: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('sketch-to-art/gallery POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id }, 201)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sketch_gallery')
    .select('id, title, original_sketch_url, result_image_url, style, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + 29)

  if (error) {
    console.error('sketch-to-art/gallery GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data || [] })
}
