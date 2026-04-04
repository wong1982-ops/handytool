import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateBlogDraft } from '@/lib/seo-studio/gemini'

export const maxDuration = 60

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { keyword: string; topic?: string | null; toolSlug?: string | null; planId?: string | null }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const keyword = body.keyword?.trim()
  if (!keyword) return apiError('keyword is required', 'VALIDATION_ERROR', 400)

  // Deduct 2 credits
  const authSupabase = await createClient()
  const { error: deductError } = await authSupabase.rpc('deduct_credits', {
    p_user_id: userId, p_amount: 2, p_tool_id: 'seo-studio', p_description: `Content generation: "${keyword}"`,
  })
  if (deductError) {
    return deductError.message?.includes('insufficient_credits')
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  try {
    const draft = await generateBlogDraft({
      keyword,
      topic: body.topic ?? null,
      toolSlug: body.toolSlug ?? null,
      toolName: null,
    })

    // If planId provided, update the plan with draft content
    if (body.planId) {
      const supabase = await getSupabase()
      await supabase
        .from('seo_content_plans')
        .update({
          draft_content: draft,
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.planId)
        .eq('user_id', userId)
    }

    return apiSuccess({ draft })
  } catch (err) {
    console.error('[seo-studio/content/generate] Generation failed:', err)
    return apiError('Content generation failed', 'GENERATION_FAILED', 500)
  }
}
