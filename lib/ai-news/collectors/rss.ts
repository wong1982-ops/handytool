import { XMLParser } from 'fast-xml-parser'
import type { RawNewsItem, NewsSource } from './types'
import type { RssSourceConfig } from '../sources'
import { createHash } from 'crypto'
import { fetchWithRetry } from './fetch-utils'

/**
 * Strip HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

/**
 * Generate a stable source ID from a URL.
 */
function urlToId(url: string): string {
  return createHash('md5').update(url).digest('hex').slice(0, 16)
}

/** Ensure a value is always an array */
function toArray<T>(val: T | T[] | undefined | null): T[] {
  if (val == null) return []
  return Array.isArray(val) ? val : [val]
}

/**
 * Parse an RSS/Atom feed XML string into RawNewsItem[].
 * Handles both RSS 2.0 (<item>) and Atom (<entry>) formats.
 */
function parseRssFeed(xml: string, source: NewsSource): RawNewsItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  const parsed = parser.parse(xml)
  const items: RawNewsItem[] = []
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - 48)

  // Determine if RSS 2.0 or Atom
  const isAtom = !!parsed.feed
  const rawItems = isAtom
    ? toArray(parsed.feed?.entry)
    : toArray(parsed.rss?.channel?.item)

  for (const entry of rawItems) {
    // --- Title ---
    const rawTitle = typeof entry.title === 'object' ? entry.title['#text'] : entry.title
    const title = rawTitle ? stripHtml(String(rawTitle)).trim() : ''
    if (!title) continue

    // --- Link / sourceUrl ---
    let sourceUrl = ''
    if (isAtom) {
      // Atom: <link href="..."/> or array of links
      const links = toArray(entry.link)
      const altLink = links.find(
        (l: any) => l['@_rel'] === 'alternate' || !l['@_rel'],
      )
      sourceUrl = altLink?.['@_href'] ?? links[0]?.['@_href'] ?? ''
    } else {
      // RSS 2.0: <link>...</link> or <guid>
      sourceUrl =
        (typeof entry.link === 'string' ? entry.link : entry.link?.['#text']) ||
        (typeof entry.guid === 'string' ? entry.guid : entry.guid?.['#text']) ||
        ''
    }
    sourceUrl = sourceUrl.trim()
    if (!sourceUrl) continue

    // --- Summary / description ---
    const rawDesc =
      entry.description ?? entry.summary ?? entry.content ?? entry['content:encoded'] ?? ''
    const descText = typeof rawDesc === 'object' ? rawDesc['#text'] ?? '' : String(rawDesc)
    const summary = stripHtml(descText).slice(0, 500).trim()

    // --- Date ---
    const rawDate =
      entry.pubDate ?? entry.published ?? entry.updated ?? entry['dc:date'] ?? undefined
    const postedAt = rawDate ? new Date(String(rawDate)).toISOString() : undefined

    // Filter: only items from the last 48 hours
    if (postedAt) {
      const postedDate = new Date(postedAt)
      if (postedDate < cutoff) continue
    }

    // --- Image ---
    let imageUrl: string | undefined
    const mediaContent = entry['media:content']
    const enclosure = entry.enclosure
    const mediaThumbnail = entry['media:thumbnail']

    if (mediaContent?.['@_url']) {
      imageUrl = mediaContent['@_url']
    } else if (enclosure?.['@_url'] && enclosure['@_type']?.startsWith('image')) {
      imageUrl = enclosure['@_url']
    } else if (mediaThumbnail?.['@_url']) {
      imageUrl = mediaThumbnail['@_url']
    }

    items.push({
      sourceId: urlToId(sourceUrl),
      sourceUrl,
      title,
      summary,
      imageUrl,
      postedAt,
    })
  }

  return items
}

/**
 * Fetch and parse a single RSS feed with retry.
 */
async function fetchFeed(config: RssSourceConfig): Promise<RawNewsItem[]> {
  const response = await fetchWithRetry(config.feedUrl, {
    label: config.source,
    init: { headers: { 'User-Agent': 'Toolk1t-AI-Radar/1.0' } },
  })

  if (!response) return []

  try {
    const xml = await response.text()
    return parseRssFeed(xml, config.source)
  } catch (error) {
    console.error(
      `[ai-radar] RSS parse error for ${config.source}:`,
      error instanceof Error ? error.message : error,
    )
    return []
  }
}

/**
 * Collect news items from all configured RSS feeds.
 * Returns items grouped by source for separate ingestion.
 */
export async function collectFromRss(
  sources: RssSourceConfig[],
): Promise<{ source: NewsSource; items: RawNewsItem[] }[]> {
  const results: { source: NewsSource; items: RawNewsItem[] }[] = []

  // Fetch all feeds in parallel
  const promises = sources.map(async (config) => {
    const items = await fetchFeed(config)
    return { source: config.source, items }
  })

  const settled = await Promise.allSettled(promises)
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(result.value)
    }
  }

  return results
}
