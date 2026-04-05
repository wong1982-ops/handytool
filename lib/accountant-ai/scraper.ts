/**
 * Web scraper for NZ government sites (IRD, Companies Office, MBIE).
 * BFS crawl up to 3 levels deep, rate-limited to 1 req/sec, max 200 pages per domain.
 */

const RATE_LIMIT_MS = 1000
const MAX_PAGES_PER_DOMAIN = 200
const MAX_DEPTH = 3

export interface ScrapedPage {
  url: string
  title: string
  source: string
  content: string
}

interface SeedSource {
  name: string
  domain: string
  seeds: string[]
}

const SOURCES: SeedSource[] = [
  {
    name: 'IRD',
    domain: 'ird.govt.nz',
    seeds: [
      'https://www.ird.govt.nz/gst',
      'https://www.ird.govt.nz/income-tax',
      'https://www.ird.govt.nz/employing-staff',
      'https://www.ird.govt.nz/running-a-business',
      'https://www.ird.govt.nz/tax-codes',
    ],
  },
  {
    name: 'Companies Office',
    domain: 'companiesoffice.govt.nz',
    seeds: [
      'https://www.companiesoffice.govt.nz/companies-register',
      'https://www.companiesoffice.govt.nz/starting-a-company',
    ],
  },
  {
    name: 'MBIE',
    domain: 'employment.govt.nz',
    seeds: [
      'https://www.employment.govt.nz/hours-and-wages',
      'https://www.employment.govt.nz/leave-and-holidays',
      'https://www.employment.govt.nz/starting-employment',
    ],
  },
]

/**
 * Extracts title and plain-text content from raw HTML.
 * Strips nav/footer/header/script/style tags first, then all remaining HTML.
 */
export function extractTextFromHtml(html: string): { title: string; content: string } {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  // Remove script and style blocks entirely (including their content)
  let cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')

  // Remove structural/navigation elements
  cleaned = cleaned
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')

  // Strip all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ')

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Collapse whitespace
  const content = cleaned.replace(/\s+/g, ' ').trim()

  return { title, content }
}

/**
 * Finds all internal links within the same domain from the given HTML.
 */
export function extractLinks(html: string, baseUrl: string, domain: string): string[] {
  const base = new URL(baseUrl)
  const hrefs: string[] = []

  const linkRegex = /href=["']([^"']+)["']/gi
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim()

    try {
      const resolved = new URL(href, base.origin)

      // Only follow links within the same domain
      if (!resolved.hostname.includes(domain)) continue

      // Skip non-HTTP(S) schemes, anchors, and common non-content paths
      if (!['http:', 'https:'].includes(resolved.protocol)) continue
      if (resolved.hash && !resolved.pathname) continue

      // Remove hash and trailing slash for deduplication
      resolved.hash = ''
      const normalised = resolved.toString().replace(/\/$/, '')

      hrefs.push(normalised)
    } catch {
      // Ignore malformed URLs
    }
  }

  // Deduplicate
  return [...new Set(hrefs)]
}

/** Sleep helper for rate limiting */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * BFS crawl for a single source. Starts from seed URLs and follows internal
 * links up to MAX_DEPTH levels deep, respecting the rate limit.
 */
export async function scrapeSource(source: SeedSource): Promise<ScrapedPage[]> {
  const visited = new Set<string>()
  const results: ScrapedPage[] = []

  // Queue entries: [url, depth]
  const queue: Array<[string, number]> = source.seeds.map((url) => [url, 0])

  while (queue.length > 0 && visited.size < MAX_PAGES_PER_DOMAIN) {
    const [url, depth] = queue.shift()!

    const normalised = url.replace(/\/$/, '')
    if (visited.has(normalised)) continue
    visited.add(normalised)

    let html: string
    try {
      await sleep(RATE_LIMIT_MS)
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Toolk1tBot/1.0; +https://toolk1t.com/bot)',
        },
        signal: AbortSignal.timeout(15_000),
      })

      if (!response.ok) continue
      html = await response.text()
    } catch {
      continue
    }

    const { title, content } = extractTextFromHtml(html)

    if (content.length > 50) {
      results.push({ url, title, source: source.name, content })
    }

    // Enqueue child links if we haven't reached max depth
    if (depth < MAX_DEPTH) {
      const links = extractLinks(html, url, source.domain)
      for (const link of links) {
        const normLink = link.replace(/\/$/, '')
        if (!visited.has(normLink)) {
          queue.push([link, depth + 1])
        }
      }
    }
  }

  return results
}

/**
 * Crawls all 3 NZ government sources sequentially.
 * Returns a flat array of scraped pages.
 */
export async function scrapeAll(): Promise<ScrapedPage[]> {
  const allPages: ScrapedPage[] = []

  for (const source of SOURCES) {
    console.log(`[scraper] Starting crawl: ${source.name} (${source.domain})`)
    const pages = await scrapeSource(source)
    console.log(`[scraper] Done: ${source.name} — ${pages.length} pages`)
    allPages.push(...pages)
  }

  console.log(`[scraper] Total pages scraped: ${allPages.length}`)
  return allPages
}
