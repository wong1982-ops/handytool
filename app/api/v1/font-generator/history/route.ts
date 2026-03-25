import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    stylePreset: string
    customPrompt?: string
    colors: string[]
    referenceUrl?: string
    characters: { char: string; imageUrl: string; svgUrl?: string | null }[]
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.characters?.length) {
    return apiError('characters are required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('font_generations')
    .insert({
      user_id: userId,
      style_preset: body.stylePreset || null,
      custom_prompt: body.customPrompt?.trim() || null,
      colors: body.colors || [],
      reference_url: body.referenceUrl || null,
      characters: body.characters,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[font-generator/history] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id }, 201)
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('font_generations')
    .select('id, style_preset, custom_prompt, colors, reference_url, characters, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[font-generator/history] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data || [] })
}
