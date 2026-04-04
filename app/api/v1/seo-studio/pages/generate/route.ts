import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateLandingPage } from '@/lib/seo-studio/gemini'
import { tools } from '@/lib/tools'

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

  let body: { toolSlug: string; keyword: string; pageType: 'use-case' | 'free-tool' }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const { toolSlug, keyword, pageType } = body
  if (!toolSlug || !keyword?.trim() || !pageType) {
    return apiError('toolSlug, keyword, and pageType are required', 'VALIDATION_ERROR', 400)
  }
  if (!['use-case', 'free-tool'].includes(pageType)) {
    return apiError('pageType must be "use-case" or "free-tool"', 'VALIDATION_ERROR', 400)
  }

  const tool = tools.find(t => t.href === `/tools/${toolSlug}`)
  if (!tool) return apiError('Unknown tool slug', 'VALIDATION_ERROR', 400)

  // Deduct 3 credits
  const authSupabase = await createClient()
  const { error: deductError } = await authSupabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 3,
    p_tool_id: 'seo-studio',
    p_description: `Landing page: "${keyword}" (${pageType})`,
  })
  if (deductError) {
    return deductError.message?.includes('insufficient_credits')
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  try {
    const content = await generateLandingPage({
      toolName: tool.name,
      toolSlug,
      keyword: keyword.trim(),
      pageType,
    })

    // Build page slug
    const pageSlug = `${pageType}/${toolSlug}-${keyword.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`

    const pageContent = {
      heroHeadline: content.heroHeadline,
      heroSubheadline: content.heroSubheadline,
      benefits: content.benefits,
      faq: content.faq,
      ctaText: content.ctaText,
      ctaHref: `/tools/${toolSlug}`,
    }

    // Persist to DB (best-effort)
    const supabase = await getSupabase()
    const { data: savedPage } = await supabase
      .from('seo_landing_pages')
      .insert({
        tool_slug: toolSlug,
        keyword: keyword.trim(),
        page_type: pageType,
        slug: pageSlug,
        title: content.title,
        meta_description: content.metaDescription,
        content: pageContent,
        structured_data: content.structuredData ?? {},
        status: 'draft',
      })
      .select()
      .single()

    return apiSuccess({
      id: savedPage?.id,
      toolSlug,
      keyword: keyword.trim(),
      pageType,
      slug: pageSlug,
      title: content.title,
      metaDescription: content.metaDescription,
      content: pageContent,
    })
  } catch (err) {
    console.error('[seo-studio/pages/generate] Generation failed:', err)
    return apiError('Landing page generation failed', 'GENERATION_FAILED', 500)
  }
}
