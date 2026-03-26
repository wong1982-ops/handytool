import type { RawJob } from './types'
import { SEARCH_KEYWORDS } from '../keywords'
import { fetchWithRetry } from './fetch-utils'

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs'
const RESULTS_PER_PAGE = 10
const MAX_DAYS_OLD = 3

interface AdzunaResult {
  id: string
  redirect_url: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  description: string
  salary_min?: number
  salary_max?: number
  created: string
}

interface AdzunaResponse {
  results: AdzunaResult[]
}

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Scrape jobs from Adzuna API for a given country (AU or NZ).
 * Searches across all keyword categories (IT + French).
 *
 * Requires env vars: ADZUNA_APP_ID, ADZUNA_APP_KEY
 */
export async function scrapeAdzuna(country: 'au' | 'nz'): Promise<RawJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    console.warn('[job-radar] Adzuna: ADZUNA_APP_ID or ADZUNA_APP_KEY not set — skipping')
    return []
  }

  const countryCode = country.toUpperCase() as 'AU' | 'NZ'
  const currency = country === 'au' ? 'AUD' : 'NZD'
  const allKeywords = [...SEARCH_KEYWORDS.it, ...SEARCH_KEYWORDS.french]

  const seenIds = new Set<string>()
  const jobs: RawJob[] = []

  for (const keyword of allKeywords) {
    try {
      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: String(RESULTS_PER_PAGE),
        what: keyword,
        max_days_old: String(MAX_DAYS_OLD),
      })

      const url = `${ADZUNA_BASE}/${country}/search/1?${params.toString()}`
      const response = await fetchWithRetry(url)

      if (!response.ok) {
        console.warn(
          `[job-radar] Adzuna ${countryCode} "${keyword}": HTTP ${response.status} — skipping`,
        )
        continue
      }

      const data: AdzunaResponse = await response.json()

      if (!data.results || !Array.isArray(data.results)) {
        continue
      }

      for (const result of data.results) {
        const sourceId = `adzuna-${result.id}`

        // Deduplicate within batch (same job may match multiple keywords)
        if (seenIds.has(sourceId)) continue
        seenIds.add(sourceId)

        jobs.push({
          sourceId,
          sourceUrl: result.redirect_url,
          title: stripHtml(result.title),
          company: result.company?.display_name ?? 'Unknown',
          location: result.location?.display_name ?? countryCode,
          country: countryCode,
          description: stripHtml(result.description),
          salaryMin: result.salary_min ?? undefined,
          salaryMax: result.salary_max ?? undefined,
          salaryCurrency: currency,
          postedAt: result.created,
        })
      }
    } catch (err) {
      console.error(
        `[job-radar] Adzuna ${countryCode} "${keyword}": ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  console.log(`[job-radar] Adzuna ${countryCode}: fetched ${jobs.length} jobs`)
  return jobs
}
