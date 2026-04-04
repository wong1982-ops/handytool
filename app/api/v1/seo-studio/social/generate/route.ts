import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateSocialPosts, type SocialContentType } from '@/lib/seo-studio/gemini'
import { tools } from '@/lib/tools'

export const maxDuration = 30

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { toolSlug: string; contentType: SocialContentType; customAngle?: string }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  if (!body.toolSlug || !body.contentType) {
    return apiError('toolSlug and contentType are required', 'VALIDATION_ERROR', 400)
  }

  const validTypes: SocialContentType[] = ['announcement', 'tips', 'engagement']
  if (!validTypes.includes(body.contentType)) {
    return apiError('contentType must be announcement, tips, or engagement', 'VALIDATION_ERROR', 400)
  }

  const tool = tools.find(t => t.href === `/tools/${body.toolSlug}`)
  if (!tool) return apiError('Tool not found', 'NOT_FOUND', 404)

  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'seo-studio',
    p_description: `Social posts: ${tool.name} (${body.contentType})`,
  })

  if (deductError) {
    return deductError.message?.includes('insufficient_credits')
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  try {
    const posts = await generateSocialPosts({
      toolName: tool.name,
      toolSlug: body.toolSlug,
      toolDescription: tool.description,
      contentType: body.contentType,
      customAngle: body.customAngle,
    })
    return apiSuccess({ posts })
  } catch (err) {
    console.error('[seo-studio/social/generate] Failed:', err)
    return apiError('Social post generation failed', 'GENERATION_FAILED', 500)
  }
}
