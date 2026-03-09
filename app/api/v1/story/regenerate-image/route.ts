import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'
import { regenerateImageRequestSchema } from '@/lib/story/types'
import { generateIllustration } from '@/lib/story/illustrate'
import { CREDIT_COSTS } from '@/lib/story/validation'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = regenerateImageRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COSTS.regenerateImage,
    p_description: 'Story Studio — image regeneration',
  })
  if (deductError) return API_ERRORS.FORBIDDEN()

  try {
    const imageUrl = await generateIllustration(parsed.data)
    return apiSuccess({ imageUrl })
  } catch (err) {
    console.error('story/regenerate-image: failed', err)
    try {
      await supabase.rpc('refund_credits', {
        p_user_id: userId,
        p_amount: CREDIT_COSTS.regenerateImage,
        p_description: 'Story Studio — image regen failed (refund)',
      })
    } catch {
      // Silently ignore refund failures
    }
    return API_ERRORS.INTERNAL()
  }
}
