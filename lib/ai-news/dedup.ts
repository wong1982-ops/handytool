import { getAdminSupabase } from '@/lib/supabase/admin'
import type { NormalisedNewsItem } from './collectors/types'

/**
 * Filter out news items that already exist in the database.
 * Checks by normalised title.
 */
export async function deduplicateNews(
  items: NormalisedNewsItem[],
): Promise<NormalisedNewsItem[]> {
  if (items.length === 0) return []

  const supabase = getAdminSupabase()
  const newItems: NormalisedNewsItem[] = []

  for (const item of items) {
    const { data } = await supabase
      .from('ai_news')
      .select('id')
      .eq('title_normalised', item.titleNormalised)
      .eq('is_active', true)
      .limit(1)

    if (!data || data.length === 0) {
      newItems.push(item)
    }
  }

  return newItems
}
