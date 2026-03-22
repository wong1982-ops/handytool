import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { verifyCronSecret } from '@/lib/story/queue'
import { createClient } from '@/lib/supabase/server'
import { generateBlogPost } from '@/lib/blog/generate-post'
import type { GenerateInput } from '@/lib/blog/generate-post'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth: verify CRON_SECRET
    if (!verifyCronSecret(request)) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // 2. Parse and validate body
    const body = await request.json()
    const { type, toolSlug, toolName, toolDescription, toolHref, customTopic, publish } = body as {
      type?: GenerateInput['type']
      toolSlug?: string
      toolName?: string
      toolDescription?: string
      toolHref?: string
      customTopic?: string
      publish?: boolean
    }

    if (!type || !['tool-announcement', 'how-to-guide'].includes(type)) {
      return API_ERRORS.VALIDATION({ message: 'type is required and must be "tool-announcement" or "how-to-guide"' })
    }

    if (type === 'tool-announcement' && (!toolSlug || !toolName)) {
      return API_ERRORS.VALIDATION({ message: 'toolSlug and toolName are required for tool-announcement posts' })
    }

    // 3. Check if post with this tool_slug already exists
    const supabase = await createClient()

    if (toolSlug) {
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id, slug')
        .eq('tool_slug', toolSlug)
        .maybeSingle()

      if (existing) {
        return apiSuccess({ post: existing, skipped: true })
      }
    }

    // 4. Generate the blog post
    const input: GenerateInput = {
      type,
      toolName,
      toolSlug,
      toolDescription,
      toolHref,
      customTopic,
    }

    const post = await generateBlogPost(input)

    // 5. Insert into blog_posts
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
      published_at: publish !== false ? new Date().toISOString() : null,
    })

    if (error) {
      console.error('[blog/generate] Insert error:', error)
      return apiError('Failed to save blog post', 'DB_ERROR', 500, { message: error.message })
    }

    return apiSuccess({ post })
  } catch (err) {
    console.error('[blog/generate] Error:', err)
    return API_ERRORS.INTERNAL()
  }
}
