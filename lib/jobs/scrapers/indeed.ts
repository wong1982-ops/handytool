import type { RawJob } from './types'
import { directScrapeIndeed } from './direct-scraper'

/**
 * Scrape Indeed AU/NZ via direct HTTP scraping.
 * Runs on Vercel serverless — no external service needed.
 */
export async function scrapeIndeed(): Promise<RawJob[]> {
  const auJobs = await directScrapeIndeed('au')
  const nzJobs = await directScrapeIndeed('nz')
  const all = [...auJobs, ...nzJobs]

  console.log(`[job-radar] Indeed via direct: ${all.length} jobs (AU: ${auJobs.length}, NZ: ${nzJobs.length})`)
  return all
}
