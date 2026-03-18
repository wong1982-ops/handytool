import type { RawNewsItem, NewsSource } from './types'
import type { RssSourceConfig } from '../sources'
import { createHash } from 'crypto'

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

/**
 * Parse an RSS/Atom feed XML string into RawNewsItem[].
 * Handles both RSS 2.0 (<item>) and Atom (<entry>) formats.
 */
function parseRssFeed(xml: string, source: NewsSource): RawNewsItem[] {
  const items: RawNewsItem[] = []

  // Extract items (RSS 2.0) or entries (Atom)
  const itemPattern = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi
  let match: RegExpExecArray | null

  while ((match = itemPattern.exec(xml)) !== null) {
    const block = match[1]

    // Extract title
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)
    const title = titleMatch ? stripHtml(titleMatch[1]).trim() : ''
    if (!title) continue

    // Extract link
    const linkMatch =
      block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i) ||
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) ||
      block.match(/<guid[^>]*>(https?:\/\/[^<]*)<\/guid>/i)
    const sourceUrl = linkMatch ? linkMatch[1].trim() : ''
    if (!sourceUrl) continue

    // Extract description/summary
    const descMatch =
      block.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/i)
    const summary = descMatch ? stripHtml(descMatch[1]).slice(0, 500).trim() : ''

    // Extract published date
    const dateMatch = block.match(/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i)
    const postedAt = dateMatch ? new Date(dateMatch[1].trim()).toISOString() : undefined

    // Extract image (media:content or enclosure)
    const imageMatch =
      block.match(/<media:content[^>]*url="([^"]*)"[^>]*\/?>/i) ||
      block.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image[^"]*"[^>]*\/?>/i) ||
      block.match(/<media:thumbnail[^>]*url="([^"]*)"[^>]*\/?>/i)
    const imageUrl = imageMatch ? imageMatch[1] : undefined

    // Filter: only items from the last 48 hours
    if (postedAt) {
      const postedDate = new Date(postedAt)
      const cutoff = new Date()
      cutoff.setHours(cutoff.getHours() - 48)
      if (postedDate < cutoff) continue
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
 * Fetch and parse a single RSS feed.
 */
async function fetchFeed(config: RssSourceConfig): Promise<RawNewsItem[]> {
  try {
    const response = await fetch(config.feedUrl, {
      headers: { 'User-Agent': 'Toolk1t-AI-Radar/1.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error(`[ai-radar] RSS fetch failed for ${config.source}: ${response.status}`)
      return []
    }

    const xml = await response.text()
    return parseRssFeed(xml, config.source)
  } catch (error) {
    console.error(`[ai-radar] RSS error for ${config.source}:`, error instanceof Error ? error.message : error)
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
