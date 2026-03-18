import { NextRequest, NextResponse } from 'next/server'
import { collectFromRss } from '@/lib/ai-news/collectors/rss'
import { ingestNewsItems } from '@/lib/ai-news/ingest'
import { RSS_SOURCES } from '@/lib/ai-news/sources'

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[ai-radar] Starting RSS collection...')
    const feedResults = await collectFromRss(RSS_SOURCES)

    const ingestResults = []
    for (const { source, items } of feedResults) {
      const result = await ingestNewsItems(items, source)
      ingestResults.push(result)
      console.log(`[ai-radar] ${source}: ${result.totalCollected} collected, ${result.newInserted} new, ${result.duplicatesSkipped} dupes, ${result.relevantFiltered} irrelevant`)
    }

    const totals = {
      totalCollected: ingestResults.reduce((s, r) => s + r.totalCollected, 0),
      newInserted: ingestResults.reduce((s, r) => s + r.newInserted, 0),
      duplicatesSkipped: ingestResults.reduce((s, r) => s + r.duplicatesSkipped, 0),
      relevantFiltered: ingestResults.reduce((s, r) => s + r.relevantFiltered, 0),
    }

    console.log('[ai-radar] RSS collection complete:', totals)
    return NextResponse.json({ ok: true, ...totals, sources: ingestResults })
  } catch (error) {
    console.error('[ai-radar] RSS collection failed:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export const maxDuration = 60
