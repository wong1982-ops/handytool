import type { RawJob } from './types'
import { SEARCH_KEYWORDS } from '../keywords'

/**
 * Scrape IT and French language jobs from Seek (AU + NZ).
 * TODO: Implement with Seek API or conservative scraping.
 */
export async function scrapeSeek(): Promise<RawJob[]> {
  console.log('[job-radar] Seek scraper: not yet implemented. Keywords:', SEARCH_KEYWORDS.it.length + SEARCH_KEYWORDS.french.length)
  // TODO: Implement Seek scraping
  return []
}
