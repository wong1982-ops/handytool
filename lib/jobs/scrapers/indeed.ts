import type { RawJob } from './types'

/**
 * Indeed scraper — returns empty as Indeed jobs are already covered
 * by the Adzuna aggregator (Seek scraper for AU, Trade Me scraper for NZ).
 */
export async function scrapeIndeed(): Promise<RawJob[]> {
  console.log('[job-radar] Indeed: covered by Adzuna aggregator')
  return []
}
