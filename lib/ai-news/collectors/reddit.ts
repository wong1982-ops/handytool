import type { RawNewsItem } from './types'
import { fetchWithRetry } from './fetch-utils'

/**
 * Collect AI model-related posts from Reddit r/MachineLearning.
 * Uses Reddit's public JSON API (no auth required for public subreddits).
 */
export async function collectFromReddit(): Promise<RawNewsItem[]> {
  const response = await fetchWithRetry(
    'https://www.reddit.com/r/MachineLearning/search.json?q=flair%3AResearch+OR+flair%3ANews&sort=new&restrict_sr=on&t=day&limit=25',
    {
      label: 'reddit',
      init: { headers: { 'User-Agent': 'Toolk1t-AI-Radar/1.0' } },
    },
  )

  if (!response) return []

  try {
    const data = await response.json()
    const posts = data?.data?.children ?? []

    return posts.map((post: any) => {
      const d = post.data
      return {
        sourceId: `reddit-${d.id}`,
        sourceUrl: d.url_overridden_by_dest || `https://reddit.com${d.permalink}`,
        title: d.title ?? '',
        summary: d.selftext ? d.selftext.slice(0, 500) : '',
        imageUrl: d.thumbnail && d.thumbnail.startsWith('http') ? d.thumbnail : undefined,
        postedAt: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : undefined,
      }
    })
  } catch (error) {
    console.error('[ai-radar] Reddit parse error:', error instanceof Error ? error.message : error)
    return []
  }
}
