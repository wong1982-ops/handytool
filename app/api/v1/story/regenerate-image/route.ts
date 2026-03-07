import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { illustrateRequestSchema } from '@/lib/story/types'
import { generateIllustration } from '@/lib/story/illustrate'
import { CREDIT_COSTS } from '@/lib/story/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = illustrateRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
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
        p_user_id: user.id,
        p_amount: CREDIT_COSTS.regenerateImage,
        p_description: 'Story Studio — image regen failed (refund)',
      })
    } catch {
      // Silently ignore refund failures
    }
    return API_ERRORS.INTERNAL()
  }
}
