import { NextRequest, NextResponse } from 'next/server'
import { scrapeFlightDeals } from '@/lib/flights/deal-scraper'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes — scraping 15 routes takes time

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for API key before starting
  if (!process.env.SERPAPI_KEY) {
    return NextResponse.json(
      { error: 'SERPAPI_KEY not configured. Get a free key at https://serpapi.com' },
      { status: 503 },
    )
  }

  console.log('[cron/scrape-flights] Starting flight deals scrape...')
  const start = Date.now()

  try {
    const result = await scrapeFlightDeals()
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    console.log(
      `[cron/scrape-flights] Done in ${elapsed}s — ` +
      `${result.routesScraped} routes, ${result.pricesRecorded} prices, ${result.dealsComputed} deals` +
      (result.errors.length > 0 ? `, ${result.errors.length} errors` : ''),
    )

    return NextResponse.json({
      ok: true,
      elapsed: `${elapsed}s`,
      ...result,
    })
  } catch (err) {
    console.error('[cron/scrape-flights] Fatal error:', err)
    return NextResponse.json(
      { error: 'Scrape failed', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
