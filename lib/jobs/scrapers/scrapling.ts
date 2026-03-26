import type { RawJob } from './types'
import { SEARCH_KEYWORDS } from '../keywords'
import { fetchWithRetry } from './fetch-utils'

const SCRAPER_URL = process.env.JOB_SCRAPER_URL || 'http://localhost:4001'
const SCRAPER_SECRET = process.env.JOB_SCRAPER_SECRET || 'dev-secret'

/**
 * Scrape jobs via the Scrapling Python microservice.
 * Falls back gracefully if the service is unreachable.
 */
export async function scrapeViaScrapling(
  source: 'seek' | 'indeed' | 'trademe',
  country: 'au' | 'nz',
): Promise<RawJob[]> {
  const allKeywords = [...SEARCH_KEYWORDS.it, ...SEARCH_KEYWORDS.french]

  try {
    const response = await fetchWithRetry(`${SCRAPER_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SCRAPER_SECRET}`,
      },
      body: JSON.stringify({ source, keywords: allKeywords, country }),
    }, 2) // 2 retries (scraping can be slow)

    if (!response.ok) {
      const errText = await response.text()
      console.error(`[job-radar] Scrapling ${source} (${country}) failed: ${response.status} — ${errText.slice(0, 200)}`)
      return []
    }

    const data = await response.json()
    const jobs: RawJob[] = (data.jobs || []).map((job: any) => ({
      sourceId: job.sourceId || '',
      sourceUrl: job.sourceUrl || '',
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      country: (job.country || country.toUpperCase()) as 'AU' | 'NZ',
      description: job.description || '',
      postedAt: job.postedAt || new Date().toISOString(),
    }))

    // Filter out jobs missing essential fields
    const valid = jobs.filter((j) => j.title && j.sourceUrl)
    console.log(`[job-radar] Scrapling ${source} (${country}): ${valid.length} valid jobs`)
    return valid
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
      console.warn(`[job-radar] Scrapling service not running at ${SCRAPER_URL}. Start it with: cd scripts/job-scraper && pip install -r requirements.txt && python app.py`)
    } else {
      console.error(`[job-radar] Scrapling ${source} (${country}) error:`, msg)
    }
    return []
  }
}

/**
 * Scrape all sources for a country via the microservice /scrape/all endpoint.
 */
export async function scrapeAllViaScrapling(country: 'au' | 'nz'): Promise<RawJob[]> {
  try {
    const response = await fetchWithRetry(`${SCRAPER_URL}/scrape/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SCRAPER_SECRET}`,
      },
      body: JSON.stringify({
        keywords: SEARCH_KEYWORDS,
        country,
      }),
    }, 2)

    if (!response.ok) {
      console.error(`[job-radar] Scrapling all (${country}) failed: ${response.status}`)
      return []
    }

    const data = await response.json()
    const jobs: RawJob[] = (data.jobs || []).map((job: any) => ({
      sourceId: job.sourceId || '',
      sourceUrl: job.sourceUrl || '',
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      country: (job.country || country.toUpperCase()) as 'AU' | 'NZ',
      description: job.description || '',
      postedAt: job.postedAt || new Date().toISOString(),
    }))

    const valid = jobs.filter((j) => j.title && j.sourceUrl)
    console.log(`[job-radar] Scrapling all (${country}): ${valid.length} valid jobs (counts: ${JSON.stringify(data.counts)})`)
    return valid
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
      console.warn(`[job-radar] Scrapling service not running. Falling back to Adzuna.`)
    } else {
      console.error(`[job-radar] Scrapling all (${country}) error:`, msg)
    }
    return []
  }
}
