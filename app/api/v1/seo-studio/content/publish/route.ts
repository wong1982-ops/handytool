import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function estimateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { planId: string }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  if (!body.planId) return apiError('planId is required', 'VALIDATION_ERROR', 400)

  const supabase = await getSupabase()

  // Fetch the plan
  const { data: plan, error: planError } = await supabase
    .from('seo_content_plans')
    .select('*')
    .eq('id', body.planId)
    .eq('user_id', userId)
    .single()

  if (planError || !plan) return API_ERRORS.NOT_FOUND('Plan')

  const draftContent = plan.draft_content as {
    title?: string
    metaDescription?: string
    body?: string
    suggestedLinks?: { label: string; href: string }[]
  } | null

  if (!draftContent?.body) return apiError('Plan has no draft content to publish', 'VALIDATION_ERROR', 400)

  const title = draftContent.title || plan.keyword
  const slug = createSlug(title)
  const readingTimeMin = estimateReadingTime(draftContent.body)

  // Insert into blog_posts
  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .insert({
      slug,
      title,
      description: draftContent.metaDescription || '',
      content: draftContent.body,
      category: 'seo',
      status: 'draft',
      reading_time_min: readingTimeMin,
    })
    .select('id, slug')
    .single()

  if (postError) {
    console.error('[seo-studio/content/publish] Insert blog_post failed:', postError)
    return apiError('Failed to publish post', 'PUBLISH_FAILED', 500)
  }

  // Update plan status to published
  await supabase
    .from('seo_content_plans')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', body.planId)
    .eq('user_id', userId)

  return apiSuccess({ postId: post.id, slug: post.slug })
}
