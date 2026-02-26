import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    console.log('[cron/aggregate-stats] Summary:', JSON.stringify(summary?.[0]))
    console.log('[cron/aggregate-stats] Top tools:', topTools?.length ?? 0)

    return NextResponse.json({
      success: true,
      summary: summary?.[0],
      tools_count: topTools?.length ?? 0,
    })
  } catch (error) {
    console.error('[cron/aggregate-stats] Error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
