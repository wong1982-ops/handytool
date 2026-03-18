import { getAdminSupabase } from '@/lib/supabase/admin'
import type { RawNewsItem, NewsSource, NormalisedNewsItem } from './collectors/types'
import { isModelRelated } from './filter'
import { categoriseNewsItem } from './categorise'
import { normaliseTitle } from './normalise'
import { extractModel, extractTags } from './extract'
import { deduplicateNews } from './dedup'

export interface IngestResult {
  source: NewsSource
  totalCollected: number
  relevantFiltered: number
  newInserted: number
  duplicatesSkipped: number
  errors: number
}

/**
 * Full ingestion pipeline: filter → categorise → normalise → extract → dedup → insert.
 */
export async function ingestNewsItems(
  rawItems: RawNewsItem[],
  source: NewsSource,
): Promise<IngestResult> {
  const result: IngestResult = {
    source,
    totalCollected: rawItems.length,
    relevantFiltered: 0,
    newInserted: 0,
    duplicatesSkipped: 0,
    errors: 0,
  }

  if (rawItems.length === 0) return result

  // Filter out items missing title
  const validItems = rawItems.filter((item) => {
    if (!item.title?.trim()) {
      result.errors++
      return false
    }
    return true
  })

  // Filter for model-related content
  const relevant = validItems.filter((item) =>
    isModelRelated(item.title, item.summary),
  )
  result.relevantFiltered = validItems.length - relevant.length

  // Normalise, categorise, extract
  const normalised: NormalisedNewsItem[] = relevant.map((item) => {
    const { modelName, provider } = extractModel(item.title, item.summary)
    const tags = extractTags(item.title, item.summary)
    const category = categoriseNewsItem(item.title, item.summary)

    return {
      ...item,
      source,
      category,
      titleNormalised: normaliseTitle(item.title),
      modelName,
      provider,
      tags,
    }
  })

  // Deduplicate
  const newItems = await deduplicateNews(normalised)
  result.duplicatesSkipped = normalised.length - newItems.length

  if (newItems.length === 0) return result

  // Insert into Supabase
  const supabase = getAdminSupabase()
  const rows = newItems.map((item) => ({
    source: item.source,
    source_id: item.sourceId,
    source_url: item.sourceUrl,
    title: item.title,
    title_normalised: item.titleNormalised,
    summary: item.summary.slice(0, 500),
    category: item.category,
    model_name: item.modelName,
    provider: item.provider,
    tags: item.tags,
    image_url: item.imageUrl ?? null,
    posted_at: item.postedAt ?? new Date().toISOString(),
    scraped_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('ai_news')
    .upsert(rows, { onConflict: 'source,source_id', ignoreDuplicates: true })

  if (error) {
    console.error(`[ai-radar] Insert error for ${source}:`, error.message)
    result.errors += rows.length
  } else {
    result.newInserted = rows.length
  }

  return result
}
