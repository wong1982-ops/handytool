import type { RawJob } from './types'
import { directScrapeTrademe, directScrapeSeek } from './direct-scraper'
import { scrapeAdzuna } from './adzuna'

/**
 * Scrape IT and French language jobs from Trade Me + Seek NZ.
 * Cascade: Direct scraping (Trade Me + Seek NZ) → Adzuna NZ fallback.
 */
export async function scrapeTrademe(): Promise<RawJob[]> {
  const jobs: RawJob[] = []

  // Trade Me direct
  const tmJobs = await directScrapeTrademe()
  jobs.push(...tmJobs)

  // Seek NZ direct
  const seekNzJobs = await directScrapeSeek('nz')
  jobs.push(...seekNzJobs)

  if (jobs.length > 0) {
    console.log(`[job-radar] NZ via direct: ${jobs.length} jobs (TM: ${tmJobs.length}, Seek NZ: ${seekNzJobs.length})`)
    return jobs
  }

  // Fallback
  console.log('[job-radar] NZ: direct scraping returned 0, trying Adzuna NZ')
  return scrapeAdzuna('nz')
}
