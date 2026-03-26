import type { RawJob } from './types'
import { scrapeViaScrapling } from './scrapling'
import { scrapeAdzuna } from './adzuna'

/**
 * Scrape IT and French language jobs from Trade Me (NZ).
 * Primary: Scrapling microservice (direct scraping).
 * Fallback: Adzuna API NZ (aggregator).
 */
export async function scrapeTrademe(): Promise<RawJob[]> {
  // Try Scrapling first (direct Trade Me scraping)
  const scraplingJobs = await scrapeViaScrapling('trademe', 'nz')
  if (scraplingJobs.length > 0) {
    console.log(`[job-radar] Trade Me via Scrapling: ${scraplingJobs.length} jobs`)
    return scraplingJobs
  }

  // Fallback to Adzuna NZ
  console.log('[job-radar] Trade Me: Scrapling unavailable, falling back to Adzuna NZ')
  return scrapeAdzuna('nz')
}
