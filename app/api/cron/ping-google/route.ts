import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { pingSitemap, submitUrl } from '@/lib/seo/google-indexing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.app'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const results: { action: string; success: boolean }[] = []

  const sitemapOk = await pingSitemap()
  results.push({ action: 'ping-sitemap', success: sitemapOk })

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('slug')
      .not('published_at', 'is', null)
      .gte('published_at', oneDayAgo)

    for (const post of recentPosts ?? []) {
      const url = `${SITE_URL}/blog/${post.slug}`
      const ok = await submitUrl(url)
      results.push({ action: `submit-${post.slug}`, success: ok })
    }
  } catch (error) {
    console.error('[cron/ping-google] Error fetching posts:', error)
    results.push({ action: 'fetch-posts', success: false })
  }

  console.log('[cron/ping-google] Results:', JSON.stringify(results))
  return NextResponse.json({ success: true, results })
}
