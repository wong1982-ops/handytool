import type { RawJob } from './types'

/**
 * LinkedIn scraper — returns empty as LinkedIn jobs are already covered
 * by the Adzuna aggregator (Seek scraper for AU, Trade Me scraper for NZ).
 */
export async function scrapeLinkedin(): Promise<RawJob[]> {
  console.log('[job-radar] LinkedIn: covered by Adzuna aggregator')
  return []
}
