import type { RawJob } from './types'

/**
 * LinkedIn scraper — skipped for now.
 * LinkedIn has aggressive anti-scraping protections.
 * Jobs from LinkedIn are partially covered by Adzuna aggregator.
 * TODO: Add Scrapling StealthyFetcher support if needed.
 */
export async function scrapeLinkedin(): Promise<RawJob[]> {
  console.log('[job-radar] LinkedIn: skipped (anti-scraping protections, covered by Adzuna)')
  return []
}
