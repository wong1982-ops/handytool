import { getAdminSupabase } from '@/lib/supabase/admin'
import type { NormalisedJob } from './scrapers/types'

/**
 * Filter out jobs that already exist in the database.
 * Checks by normalised title + company + location + category.
 */
export async function deduplicateJobs(
  jobs: NormalisedJob[],
): Promise<NormalisedJob[]> {
  if (jobs.length === 0) return []

  const supabase = getAdminSupabase()
  const newJobs: NormalisedJob[] = []

  // Check in batches to avoid oversized queries
  for (const job of jobs) {
    const { data } = await supabase
      .from('jobs')
      .select('id')
      .eq('title_normalised', job.titleNormalised)
      .eq('company_normalised', job.companyNormalised)
      .eq('location_normalised', job.locationNormalised)
      .eq('category', job.category)
      .eq('is_active', true)
      .limit(1)

    if (!data || data.length === 0) {
      newJobs.push(job)
    }
  }

  return newJobs
}
