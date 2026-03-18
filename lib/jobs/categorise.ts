import type { JobCategory } from './scrapers/types'
import { CATEGORY_MATCH_KEYWORDS } from './keywords'

/**
 * Determine which categories a job belongs to based on title + description.
 * A job can match both categories (rare).
 */
export function categoriseJob(title: string, description: string): JobCategory[] {
  const text = `${title} ${description}`.toLowerCase()
  const categories: JobCategory[] = []

  for (const [category, keywords] of Object.entries(CATEGORY_MATCH_KEYWORDS)) {
    const matches = keywords.some((kw) => text.includes(kw))
    if (matches) {
      categories.push(category as JobCategory)
    }
  }

  return categories
}
