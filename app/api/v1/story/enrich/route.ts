import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { enrichRequestSchema } from '@/lib/story/types'
import { enrichStory } from '@/lib/story/enrich'
import { CREDIT_COSTS } from '@/lib/story/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return API_ERRORS.UNAUTHORIZED()
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = enrichRequestSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  // Deduct credits
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.enrich,
    p_description: 'Story Studio — story enrichment',
  })

  if (deductError) {
    return API_ERRORS.FORBIDDEN()
  }

  try {
    const enrichedStory = await enrichStory(parsed.data)
    return apiSuccess(enrichedStory)
  } catch (err) {
    console.error('story/enrich: AI call failed', err)

    // Refund credits on failure
    try {
      await supabase.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: CREDIT_COSTS.enrich,
        p_description: 'Story Studio — enrichment failed (refund)',
      })
    } catch {
      // Silently ignore refund failures
    }

    return API_ERRORS.INTERNAL()
  }
}
