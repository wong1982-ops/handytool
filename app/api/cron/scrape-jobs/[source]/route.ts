import { NextRequest, NextResponse } from 'next/server'
import { ingestJobs } from '@/lib/jobs/ingest'
import { scrapeSeek } from '@/lib/jobs/scrapers/seek'
import { scrapeIndeed } from '@/lib/jobs/scrapers/indeed'
import { scrapeLinkedin } from '@/lib/jobs/scrapers/linkedin'
import { scrapeTrademe } from '@/lib/jobs/scrapers/trademe'
import { scrapeJobspy } from '@/lib/jobs/scrapers/jobspy'
import type { RawJob, JobSource } from '@/lib/jobs/scrapers/types'

const CRON_SECRET = process.env.CRON_SECRET || ''

type ScraperSource = JobSource | 'jobspy'

const SCRAPERS: Record<ScraperSource, () => Promise<RawJob[]>> = {
  seek: scrapeSeek,
  indeed: scrapeIndeed,
  linkedin: scrapeLinkedin,
  trademe: scrapeTrademe,
  jobspy: scrapeJobspy,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string }> },
) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { source } = await params
  const scraper = SCRAPERS[source as ScraperSource]

  if (!scraper) {
    return NextResponse.json({ error: `Unknown source: ${source}` }, { status: 400 })
  }

  // jobspy scrapes from Indeed + LinkedIn, store as 'indeed' source for DB compatibility
  const dbSource: JobSource = source === 'jobspy' ? 'indeed' : (source as JobSource)

  try {
    console.log(`[job-radar] Starting scrape for: ${source}`)
    const rawJobs = await scraper()
    const result = await ingestJobs(rawJobs, dbSource)
    console.log(`[job-radar] Scrape complete for ${source}:`, result)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error(`[job-radar] Scrape failed for ${source}:`, error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export const maxDuration = 60
