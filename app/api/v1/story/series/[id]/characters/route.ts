import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { getUserEntitlements } from '@/lib/entitlements'
import { z } from 'zod'
import { GEMINI_VOICE_NAMES } from '@/lib/story/tts'

interface RouteParams { params: Promise<{ id: string }> }

const addCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).default(''),
  voice: z.enum(GEMINI_VOICE_NAMES as unknown as [string, ...string[]]).nullable().optional(),
})

// POST — add a character to a series (limited by entitlements)
export async function POST(request: Request, { params }: RouteParams) {
  const { id: seriesId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Check character limit from entitlements
  const { tier, limits } = await getUserEntitlements(userId)
  const supabase = await createClient()

  const { count } = await supabase
    .from('series_characters')
    .select('id', { count: 'exact', head: true })
    .eq('series_id', seriesId)

  if ((count ?? 0) >= limits.max_characters) {
    return apiError(
      tier === 'free'
        ? `Free users can create up to ${limits.max_characters} characters per series. Upgrade to Premium for more.`
        : `You've reached your character limit (${limits.max_characters}).`,
      'CHARACTER_LIMIT_REACHED',
      403,
      { limit: limits.max_characters, current: count ?? 0, tier },
    )
  }

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  const parsed = addCharacterSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { data, error } = await supabase.rpc('add_series_character', {
    p_series_id: seriesId,
    p_name: parsed.data.name,
    p_description: parsed.data.description,
    p_voice: parsed.data.voice ?? null,
  })

  if (error) {
    if (error.message?.includes('max_characters_reached')) {
      return apiError(`Maximum ${limits.max_characters} characters per series`, 'MAX_CHARACTERS', 400)
    }
    if (error.message?.includes('series_not_found')) {
      return API_ERRORS.NOT_FOUND('Series')
    }
    console.error('add character error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data }, 201)
}
