/**
 * Direct HTTP job scraper for Vercel serverless.
 * No Python, no external service, no API keys.
 * Uses node-html-parser for lightweight HTML parsing.
 * Falls back gracefully on any failure.
 */

import { parse as parseHtml } from 'node-html-parser'
import { createHash } from 'crypto'
import type { RawJob } from './types'
import { fetchWithRetry } from './fetch-utils'
import { SEARCH_KEYWORDS } from '../keywords'

function urlToId(url: string): string {
  return createHash('md5').update(url).digest('hex').slice(0, 16)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

// ── Seek AU/NZ ──────────────────────────────────────────

async function scrapeSeekDirect(country: 'au' | 'nz', maxKeywords = 8): Promise<RawJob[]> {
  const domain = country === 'au' ? 'www.seek.com.au' : 'www.seek.co.nz'
  const allKeywords = [...SEARCH_KEYWORDS.it.slice(0, maxKeywords)]
  const jobs: RawJob[] = []
  const seenIds = new Set<string>()

  for (const keyword of allKeywords) {
    try {
      const searchUrl = `https://${domain}/${keyword.replace(/\s+/g, '-')}-jobs`
      const response = await fetchWithRetry(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-AU,en;q=0.9',
        },
        signal: AbortSignal.timeout(15000),
      }, 2)

      if (!response.ok) {
        console.log(`[direct-scraper] Seek ${country} "${keyword}": ${response.status}`)
        continue
      }

      const html = await response.text()
      const root = parseHtml(html)

      // Seek uses JSON-LD for job postings (most reliable)
      const jsonLdScripts = root.querySelectorAll('script[type="application/ld+json"]')
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent)
          const items = data['@graph'] || (Array.isArray(data) ? data : [data])

          for (const item of items) {
            if (item['@type'] !== 'JobPosting') continue

            const sourceUrl = item.url || searchUrl
            const sourceId = `seek-${urlToId(sourceUrl)}`
            if (seenIds.has(sourceId)) continue
            seenIds.add(sourceId)

            jobs.push({
              sourceId,
              sourceUrl,
              title: stripHtml(item.title || ''),
              company: stripHtml(item.hiringOrganization?.name || ''),
              location: stripHtml(item.jobLocation?.address?.addressLocality || item.jobLocation?.name || ''),
              country: country.toUpperCase() as 'AU' | 'NZ',
              description: stripHtml(item.description || '').slice(0, 2000),
              employmentType: mapEmploymentType(item.employmentType),
              postedAt: item.datePosted || new Date().toISOString(),
            })
          }
        } catch {
          // not valid JSON-LD, skip
        }
      }

      // Fallback: parse HTML cards if no JSON-LD
      if (jobs.length === 0) {
        const cards = root.querySelectorAll('article[data-testid]')
        for (const card of cards) {
          const titleEl = card.querySelector('a[data-automation="jobTitle"], h3 a')
          const companyEl = card.querySelector('a[data-automation="jobCompany"]')
          const locationEl = card.querySelector('a[data-automation="jobLocation"]')

          if (!titleEl) continue

          const title = stripHtml(titleEl.textContent)
          const href = titleEl.getAttribute('href') || ''
          const fullUrl = href.startsWith('http') ? href : `https://${domain}${href}`
          const sourceId = `seek-${urlToId(fullUrl)}`

          if (seenIds.has(sourceId)) continue
          seenIds.add(sourceId)

          jobs.push({
            sourceId,
            sourceUrl: fullUrl,
            title,
            company: companyEl ? stripHtml(companyEl.textContent) : '',
            location: locationEl ? stripHtml(locationEl.textContent) : '',
            country: country.toUpperCase() as 'AU' | 'NZ',
            description: '',
            postedAt: new Date().toISOString(),
          })
        }
      }

      // Rate limit: 1 second between keywords
      await new Promise((r) => setTimeout(r, 1000))
    } catch (err) {
      console.error(`[direct-scraper] Seek ${country} "${keyword}" error:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`[direct-scraper] Seek ${country}: ${jobs.length} jobs from ${allKeywords.length} keywords`)
  return jobs
}

// ── Indeed AU/NZ ──────────────────────────────────────────

async function scrapeIndeedDirect(country: 'au' | 'nz', maxKeywords = 6): Promise<RawJob[]> {
  const domain = country === 'au' ? 'au.indeed.com' : 'nz.indeed.com'
  const allKeywords = SEARCH_KEYWORDS.it.slice(0, maxKeywords)
  const jobs: RawJob[] = []
  const seenIds = new Set<string>()

  for (const keyword of allKeywords) {
    try {
      const searchUrl = `https://${domain}/jobs?q=${encodeURIComponent(keyword)}&fromage=3`
      const response = await fetchWithRetry(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-AU,en;q=0.9',
        },
        signal: AbortSignal.timeout(15000),
      }, 2)

      if (!response.ok) {
        console.log(`[direct-scraper] Indeed ${country} "${keyword}": ${response.status}`)
        continue
      }

      const html = await response.text()
      const root = parseHtml(html)

      // Indeed also uses JSON-LD
      const jsonLdScripts = root.querySelectorAll('script[type="application/ld+json"]')
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent)
          const items = data['@graph'] || (Array.isArray(data) ? data : [data])

          for (const item of items) {
            if (item['@type'] !== 'JobPosting') continue

            const sourceUrl = item.url || searchUrl
            const sourceId = `indeed-${urlToId(sourceUrl)}`
            if (seenIds.has(sourceId)) continue
            seenIds.add(sourceId)

            jobs.push({
              sourceId,
              sourceUrl,
              title: stripHtml(item.title || ''),
              company: stripHtml(item.hiringOrganization?.name || ''),
              location: stripHtml(item.jobLocation?.address?.addressLocality || ''),
              country: country.toUpperCase() as 'AU' | 'NZ',
              description: stripHtml(item.description || '').slice(0, 2000),
              employmentType: mapEmploymentType(item.employmentType),
              postedAt: item.datePosted || new Date().toISOString(),
            })
          }
        } catch {
          // skip
        }
      }

      await new Promise((r) => setTimeout(r, 1500)) // Indeed needs more delay
    } catch (err) {
      console.error(`[direct-scraper] Indeed ${country} "${keyword}" error:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`[direct-scraper] Indeed ${country}: ${jobs.length} jobs from ${allKeywords.length} keywords`)
  return jobs
}

// ── Trade Me (NZ) ──────────────────────────────────────────

async function scrapeTradeMeDirect(maxKeywords = 6): Promise<RawJob[]> {
  const allKeywords = SEARCH_KEYWORDS.it.slice(0, maxKeywords)
  const jobs: RawJob[] = []
  const seenIds = new Set<string>()

  for (const keyword of allKeywords) {
    try {
      const searchUrl = `https://www.trademe.co.nz/a/jobs/search?search_string=${encodeURIComponent(keyword)}`
      const response = await fetchWithRetry(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(15000),
      }, 2)

      if (!response.ok) {
        console.log(`[direct-scraper] Trade Me "${keyword}": ${response.status}`)
        continue
      }

      const html = await response.text()
      const root = parseHtml(html)

      // Trade Me uses JSON-LD as well
      const jsonLdScripts = root.querySelectorAll('script[type="application/ld+json"]')
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent)
          const items = data['@graph'] || (Array.isArray(data) ? data : [data])

          for (const item of items) {
            if (item['@type'] !== 'JobPosting') continue

            const sourceUrl = item.url || searchUrl
            const sourceId = `trademe-${urlToId(sourceUrl)}`
            if (seenIds.has(sourceId)) continue
            seenIds.add(sourceId)

            jobs.push({
              sourceId,
              sourceUrl,
              title: stripHtml(item.title || ''),
              company: stripHtml(item.hiringOrganization?.name || ''),
              location: stripHtml(item.jobLocation?.address?.addressLocality || ''),
              country: 'NZ',
              description: stripHtml(item.description || '').slice(0, 2000),
              postedAt: item.datePosted || new Date().toISOString(),
            })
          }
        } catch {
          // skip
        }
      }

      await new Promise((r) => setTimeout(r, 1000))
    } catch (err) {
      console.error(`[direct-scraper] Trade Me "${keyword}" error:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`[direct-scraper] Trade Me: ${jobs.length} jobs from ${allKeywords.length} keywords`)
  return jobs
}

// ── Helpers ──────────────────────────────────────────

function mapEmploymentType(type: string | string[] | undefined): 'full-time' | 'contract' | 'part-time' | undefined {
  const t = (Array.isArray(type) ? type[0] : type || '').toLowerCase()
  if (t.includes('full')) return 'full-time'
  if (t.includes('contract') || t.includes('temporary')) return 'contract'
  if (t.includes('part')) return 'part-time'
  return undefined
}

// ── Exports ──────────────────────────────────────────

export async function directScrapeSeek(country: 'au' | 'nz'): Promise<RawJob[]> {
  return scrapeSeekDirect(country)
}

export async function directScrapeIndeed(country: 'au' | 'nz'): Promise<RawJob[]> {
  return scrapeIndeedDirect(country)
}

export async function directScrapeTrademe(): Promise<RawJob[]> {
  return scrapeTradeMeDirect()
}
