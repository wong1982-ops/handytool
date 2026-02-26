import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateWeeklyPost } from '@/lib/blog/generator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  try {
    const { data: summary } = await supabase.rpc('dashboard_summary')
    const { data: topTools } = await supabase.rpc('tool_popularity', { time_range_days: 7 })

    const s = summary?.[0] || { total_views_7d: 0, unique_visitors_7d: 0 }

    const { data: prevTools } = await supabase.rpc('tool_popularity', { time_range_days: 14 })
    const prevTotal = (prevTools ?? []).reduce((sum: number, t: { page_views: number }) => sum + t.page_views, 0) - (s.total_views_7d || 0)

    const post = generateWeeklyPost({
      total_views: s.total_views_7d || 0,
      unique_visitors: s.unique_visitors_7d || 0,
      top_tools: topTools ?? [],
      prev_week_views: Math.max(0, prevTotal),
    })

    const { error } = await supabase
      .from('blog_posts')
      .upsert(post, { onConflict: 'slug' })

    if (error) throw error

    console.log(`[cron/generate-blog] Created post: ${post.slug}`)
    return NextResponse.json({ success: true, slug: post.slug })
  } catch (error) {
    console.error('[cron/generate-blog] Error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
