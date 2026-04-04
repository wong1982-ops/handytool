import { NextRequest, NextResponse } from 'next/server'
import { scrapePromotions } from '@/lib/flights/promotion-scraper'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron/scrape-promotions] Starting promotion scrape...')
  const start = Date.now()

  try {
    const result = await scrapePromotions()
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    console.log(
      `[cron/scrape-promotions] Done in ${elapsed}s — ` +
      `${result.sourcesScraped} sources, ${result.promotionsFound} found, ${result.promotionsStored} stored` +
      (result.errors.length > 0 ? `, ${result.errors.length} errors` : ''),
    )

    return NextResponse.json({ ok: true, elapsed: `${elapsed}s`, ...result })
  } catch (err) {
    console.error('[cron/scrape-promotions] Fatal error:', err)
    return NextResponse.json(
      { error: 'Scrape failed', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
