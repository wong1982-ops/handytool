import { getAdminSupabase } from '@/lib/supabase/admin'
import type { NormalisedNewsItem } from './collectors/types'

const BATCH_SIZE = 100

/**
 * Filter out news items that already exist in the database.
 * Uses a single batch query (or chunked queries for large sets) instead of N+1.
 */
export async function deduplicateNews(
  items: NormalisedNewsItem[],
): Promise<NormalisedNewsItem[]> {
  if (items.length === 0) return []

  const supabase = getAdminSupabase()

  // Collect all normalised titles
  const allTitles = items.map((item) => item.titleNormalised)

  // Query in batches of BATCH_SIZE to avoid overly large IN clauses
  const existingTitles = new Set<string>()

  for (let i = 0; i < allTitles.length; i += BATCH_SIZE) {
    const chunk = allTitles.slice(i, i + BATCH_SIZE)

    const { data } = await supabase
      .from('ai_news')
      .select('title_normalised')
      .in('title_normalised', chunk)
      .eq('is_active', true)

    if (data) {
      for (const row of data as { title_normalised: string }[]) {
        existingTitles.add(row.title_normalised)
      }
    }
  }

  return items.filter((item) => !existingTitles.has(item.titleNormalised))
}
