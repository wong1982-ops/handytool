import type { RawJob } from './types'
import { scrapeViaScrapling } from './scrapling'

/**
 * Scrape Indeed AU/NZ via Scrapling microservice.
 * Indeed provides additional coverage beyond Seek/Trade Me.
 */
export async function scrapeIndeed(): Promise<RawJob[]> {
  const auJobs = await scrapeViaScrapling('indeed', 'au')
  const nzJobs = await scrapeViaScrapling('indeed', 'nz')
  const all = [...auJobs, ...nzJobs]
  if (all.length > 0) {
    console.log(`[job-radar] Indeed via Scrapling: ${all.length} jobs (AU: ${auJobs.length}, NZ: ${nzJobs.length})`)
  } else {
    console.log('[job-radar] Indeed: Scrapling unavailable or no results')
  }
  return all
}
