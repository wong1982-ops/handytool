import { getAdminSupabase } from '@/lib/supabase/admin'
import type { NormalisedJob } from './scrapers/types'

/** Max titles per IN-query chunk to stay within Supabase/PostgREST limits */
const CHUNK_SIZE = 100

/**
 * Filter out jobs that already exist in the database.
 * Checks by normalised title + company + location + category.
 *
 * Uses a batch query (title IN ...) then filters in-memory by the
 * remaining fields, avoiding the N+1 query anti-pattern.
 */
export async function deduplicateJobs(
  jobs: NormalisedJob[],
): Promise<NormalisedJob[]> {
  if (jobs.length === 0) return []

  const supabase = getAdminSupabase()

  // Build composite keys for all incoming jobs
  type CompositeKey = string
  const makeKey = (
    title: string,
    company: string,
    location: string,
    category: string,
  ): CompositeKey => `${title}||${company}||${location}||${category}`

  // Collect unique normalised titles for the IN query
  const allTitles = [...new Set(jobs.map((j) => j.titleNormalised))]

  // Fetch existing jobs in chunks by titleNormalised
  const existingKeys = new Set<CompositeKey>()

  for (let i = 0; i < allTitles.length; i += CHUNK_SIZE) {
    const titleChunk = allTitles.slice(i, i + CHUNK_SIZE)

    const { data, error } = await supabase
      .from('jobs')
      .select('title_normalised, company_normalised, location_normalised, category')
      .in('title_normalised', titleChunk)
      .eq('is_active', true)

    if (error) {
      console.error('[job-radar] Dedup query error:', error.message)
      // On error, skip dedup for this chunk (allow potential duplicates rather than losing jobs)
      continue
    }

    if (data) {
      for (const row of data as {
        title_normalised: string
        company_normalised: string
        location_normalised: string
        category: string
      }[]) {
        existingKeys.add(
          makeKey(
            row.title_normalised,
            row.company_normalised,
            row.location_normalised,
            row.category,
          ),
        )
      }
    }
  }

  // Filter out jobs whose composite key already exists
  const newJobs = jobs.filter(
    (job) =>
      !existingKeys.has(
        makeKey(
          job.titleNormalised,
          job.companyNormalised,
          job.locationNormalised,
          job.category,
        ),
      ),
  )

  return newJobs
}
