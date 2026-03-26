import type { RawNewsItem } from './types'
import { fetchWithRetry } from './fetch-utils'

const HN_SEARCH_URL = 'https://hn.algolia.com/api/v1/search_by_date'

/**
 * Collect AI model-related posts from Hacker News via Algolia API.
 * Searches for recent stories about AI model releases.
 */
export async function collectFromHackerNews(): Promise<RawNewsItem[]> {
  const queries = ['AI model release', 'LLM launch', 'new AI model']
  const items: RawNewsItem[] = []
  const seenIds = new Set<string>()

  for (const query of queries) {
    const params = new URLSearchParams({
      query,
      tags: 'story',
      numericFilters: `created_at_i>${Math.floor(Date.now() / 1000) - 48 * 3600}`,
      hitsPerPage: '20',
    })

    const response = await fetchWithRetry(`${HN_SEARCH_URL}?${params}`, {
      label: `hackernews (${query})`,
    })

    if (!response) continue

    try {
      const data = await response.json()

      for (const hit of data.hits ?? []) {
        const id = String(hit.objectID)
        if (seenIds.has(id)) continue
        seenIds.add(id)

        const sourceUrl = hit.url || `https://news.ycombinator.com/item?id=${id}`

        items.push({
          sourceId: `hn-${id}`,
          sourceUrl,
          title: hit.title ?? '',
          summary: hit.story_text ? hit.story_text.slice(0, 500) : '',
          postedAt: hit.created_at,
        })
      }
    } catch (error) {
      console.error('[ai-radar] HN parse error:', error instanceof Error ? error.message : error)
    }
  }

  return items
}
