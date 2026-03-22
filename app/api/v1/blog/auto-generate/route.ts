import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { verifyCronSecret } from '@/lib/story/queue'
import { createClient } from '@/lib/supabase/server'
import { generateBlogPost } from '@/lib/blog/generate-post'
import { TOOL_ENTRIES } from '@/lib/blog/tool-slugs'

const MAX_PER_RUN = 5

export async function POST(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET
    if (!verifyCronSecret(request)) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // 2. Get existing tool_slugs from blog_posts
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('tool_slug')
      .not('tool_slug', 'is', null)

    const existingSlugs = new Set((existing ?? []).map((row: { tool_slug: string }) => row.tool_slug))

    // 3. Find missing tools
    const missingTools = TOOL_ENTRIES.filter((t) => !existingSlugs.has(t.slug))

    if (missingTools.length === 0) {
      return apiSuccess({ generated: [], remaining: 0, message: 'All tools already have blog posts' })
    }

    // 4. Generate up to MAX_PER_RUN posts
    const toGenerate = missingTools.slice(0, MAX_PER_RUN)
    const generated: string[] = []

    for (const tool of toGenerate) {
      try {
        const post = await generateBlogPost({
          type: 'tool-announcement',
          toolName: tool.name,
          toolSlug: tool.slug,
          toolDescription: tool.description,
          toolHref: tool.href,
        })

        const { error } = await supabase.from('blog_posts').insert({
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          post_type: post.post_type,
          category: post.category,
          tags: post.tags,
          keywords: post.keywords,
          reading_time_min: post.reading_time_min,
          tool_slug: post.tool_slug,
          author: post.author,
          cover_image_url: post.cover_image_url,
          published_at: new Date().toISOString(),
        })

        if (error) {
          console.error(`[blog/auto-generate] Insert error for ${tool.slug}:`, error)
          continue
        }

        generated.push(tool.slug)
        console.log(`[blog/auto-generate] Generated post for: ${tool.name}`)
      } catch (err) {
        console.error(`[blog/auto-generate] Generation error for ${tool.slug}:`, err)
        // Continue with next tool
      }
    }

    const remaining = missingTools.length - generated.length

    return apiSuccess({ generated, remaining })
  } catch (err) {
    console.error('[blog/auto-generate] Error:', err)
    return API_ERRORS.INTERNAL()
  }
}
