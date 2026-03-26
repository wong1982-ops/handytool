import type { RawJob } from './types'
import { scrapeAdzuna } from './adzuna'

/**
 * Scrape IT and French language jobs from Seek (AU).
 * Uses Adzuna API as data source (Adzuna aggregates from Seek and other AU boards).
 */
export async function scrapeSeek(): Promise<RawJob[]> {
  console.log('[job-radar] Seek: delegating to Adzuna AU aggregator')
  return scrapeAdzuna('au')
}
