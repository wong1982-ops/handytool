import type { RawJob } from './types'
import { scrapeViaScrapling } from './scrapling'
import { scrapeAdzuna } from './adzuna'

/**
 * Scrape IT and French language jobs from Seek (AU).
 * Primary: Scrapling microservice (direct scraping).
 * Fallback: Adzuna API (aggregator).
 */
export async function scrapeSeek(): Promise<RawJob[]> {
  // Try Scrapling first (direct Seek scraping)
  const scraplingJobs = await scrapeViaScrapling('seek', 'au')
  if (scraplingJobs.length > 0) {
    console.log(`[job-radar] Seek AU via Scrapling: ${scraplingJobs.length} jobs`)
    return scraplingJobs
  }

  // Fallback to Adzuna API
  console.log('[job-radar] Seek AU: Scrapling unavailable, falling back to Adzuna')
  return scrapeAdzuna('au')
}
