import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { verifyCronSecret } from '@/lib/story/queue'
import { createClient } from '@/lib/supabase/server'
import { generateCoverImage } from '@/lib/blog/generate-post'

const MAX_PER_RUN = 5

/**
 * POST /api/v1/blog/backfill-covers
 * Generate cover images for existing blog posts that don't have one.
 * Secured with CRON_SECRET. Processes up to 5 posts per call.
 */
export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const supabase = await createClient()

    // Find posts without cover images
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, tool_slug')
      .is('cover_image_url', null)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(MAX_PER_RUN)

    if (fetchError) {
      console.error('[blog/backfill-covers] Fetch error:', fetchError)
      return apiError('Failed to fetch posts', 'DB_ERROR', 500)
    }

    if (!posts || posts.length === 0) {
      return apiSuccess({ updated: [], remaining: 0, message: 'All posts already have cover images' })
    }

    const updated: string[] = []

    for (const post of posts) {
      try {
        const coverUrl = await generateCoverImage(post.title, post.tool_slug || undefined)

        if (coverUrl) {
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ cover_image_url: coverUrl })
            .eq('id', post.id)

          if (updateError) {
            console.error(`[blog/backfill-covers] Update error for ${post.id}:`, updateError)
            continue
          }

          updated.push(post.tool_slug || post.title)
          console.log(`[blog/backfill-covers] Generated cover for: ${post.title}`)
        }
      } catch (err) {
        console.error(`[blog/backfill-covers] Error for ${post.title}:`, err)
      }
    }

    // Count remaining posts without covers
    const { count } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .is('cover_image_url', null)
      .not('published_at', 'is', null)

    return apiSuccess({ updated, remaining: (count ?? 0) - updated.length })
  } catch (err) {
    console.error('[blog/backfill-covers] Error:', err)
    return apiError('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
