import type { RawNewsItem } from './types'

/**
 * Collect AI model-related posts from Reddit r/MachineLearning.
 * Uses Reddit's public JSON API (no auth required for public subreddits).
 */
export async function collectFromReddit(): Promise<RawNewsItem[]> {
  try {
    const response = await fetch(
      'https://www.reddit.com/r/MachineLearning/search.json?q=flair%3AResearch+OR+flair%3ANews&sort=new&restrict_sr=on&t=day&limit=25',
      {
        headers: { 'User-Agent': 'Toolk1t-AI-Radar/1.0' },
        signal: AbortSignal.timeout(10000),
      },
    )

    if (!response.ok) {
      console.error(`[ai-radar] Reddit fetch failed: ${response.status}`)
      return []
    }

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
    console.error('[ai-radar] Reddit error:', error instanceof Error ? error.message : error)
    return []
  }
}
