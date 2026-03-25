import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

/** POST — save a logo generation */
export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    businessName: string
    tagline?: string
    industry?: string
    style: string
    colors: string[]
    customPrompt?: string
    concepts: { imageUrl: string; variation: string }[]
    selectedIndex?: number | null
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.businessName?.trim() || !body.concepts?.length) {
    return apiError('businessName and concepts are required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('logo_generations')
    .insert({
      user_id: userId,
      business_name: body.businessName.trim(),
      tagline: body.tagline?.trim() || null,
      industry: body.industry?.trim() || null,
      style: body.style || 'modern',
      colors: body.colors || [],
      custom_prompt: body.customPrompt?.trim() || null,
      concepts: body.concepts,
      selected_index: body.selectedIndex ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[logo-generator/history] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id }, 201)
}

/** GET — fetch user's logo history */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('logo_generations')
    .select('id, business_name, tagline, industry, style, colors, custom_prompt, concepts, selected_index, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[logo-generator/history] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data || [] })
}
