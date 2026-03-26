import type { RawJob } from './types'
import { directScrapeSeek } from './direct-scraper'
import { scrapeAdzuna } from './adzuna'

/**
 * Scrape IT and French language jobs from Seek (AU).
 * Cascade: Direct HTTP scraping → Adzuna API fallback.
 * Runs entirely on Vercel serverless — no external service needed.
 */
export async function scrapeSeek(): Promise<RawJob[]> {
  // Try direct scraping first (free, no API key)
  const directJobs = await directScrapeSeek('au')
  if (directJobs.length > 0) {
    console.log(`[job-radar] Seek AU via direct scraping: ${directJobs.length} jobs`)
    return directJobs
  }

  // Fallback to Adzuna API (needs ADZUNA_APP_ID + ADZUNA_APP_KEY)
  console.log('[job-radar] Seek AU: direct scraping returned 0, trying Adzuna')
  return scrapeAdzuna('au')
}
