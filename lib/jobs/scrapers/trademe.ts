import type { RawJob } from './types'
import { scrapeAdzuna } from './adzuna'

/**
 * Scrape IT and French language jobs from Trade Me Jobs (NZ).
 * Uses Adzuna API as data source (Adzuna aggregates from Trade Me and other NZ boards).
 */
export async function scrapeTrademe(): Promise<RawJob[]> {
  console.log('[job-radar] Trade Me: delegating to Adzuna NZ aggregator')
  return scrapeAdzuna('nz')
}
