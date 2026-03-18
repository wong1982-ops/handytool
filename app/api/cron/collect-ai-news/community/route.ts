import { NextRequest, NextResponse } from 'next/server'
import { collectFromHackerNews } from '@/lib/ai-news/collectors/hackernews'
import { collectFromReddit } from '@/lib/ai-news/collectors/reddit'
import { ingestNewsItems } from '@/lib/ai-news/ingest'

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[ai-radar] Starting community collection...')

    // Collect from both sources in parallel
    const [hnItems, redditItems] = await Promise.all([
      collectFromHackerNews(),
      collectFromReddit(),
    ])

    const hnResult = await ingestNewsItems(hnItems, 'hackernews')
    const redditResult = await ingestNewsItems(redditItems, 'reddit')

    console.log(`[ai-radar] HN: ${hnResult.totalCollected} collected, ${hnResult.newInserted} new`)
    console.log(`[ai-radar] Reddit: ${redditResult.totalCollected} collected, ${redditResult.newInserted} new`)

    return NextResponse.json({
      ok: true,
      sources: [hnResult, redditResult],
    })
  } catch (error) {
    console.error('[ai-radar] Community collection failed:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export const maxDuration = 60
