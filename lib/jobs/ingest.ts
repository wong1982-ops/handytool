import { getAdminSupabase } from '@/lib/supabase/admin'
import type { RawJob, JobSource, NormalisedJob } from './scrapers/types'
import { normaliseJob } from './normalise'
import { categoriseJob } from './categorise'
import { deduplicateJobs } from './dedup'

export interface IngestResult {
  source: JobSource
  totalScraped: number
  newInserted: number
  duplicatesSkipped: number
  errors: number
}

/**
 * Full ingestion pipeline: categorise → normalise → dedup → insert.
 */
export async function ingestJobs(
  rawJobs: RawJob[],
  source: JobSource,
): Promise<IngestResult> {
  const result: IngestResult = {
    source,
    totalScraped: rawJobs.length,
    newInserted: 0,
    duplicatesSkipped: 0,
    errors: 0,
  }

  if (rawJobs.length === 0) return result

  // Filter out jobs missing required fields
  const validJobs = rawJobs.filter((job) => {
    if (!job.title?.trim() && !job.company?.trim()) {
      result.errors++
      return false
    }
    return true
  })

  // Categorise and normalise
  const normalisedJobs: NormalisedJob[] = []
  for (const raw of validJobs) {
    const categories = categoriseJob(raw.title, raw.description)
    if (categories.length === 0) {
      // Job doesn't match any category — skip
      continue
    }
    for (const category of categories) {
      normalisedJobs.push(normaliseJob(raw, source, category))
    }
  }

  // Deduplicate
  const newJobs = await deduplicateJobs(normalisedJobs)
  result.duplicatesSkipped = normalisedJobs.length - newJobs.length

  if (newJobs.length === 0) return result

  // Insert into Supabase
  const supabase = getAdminSupabase()
  const rows = newJobs.map((job) => ({
    source: job.source,
    source_id: job.sourceId,
    source_url: job.sourceUrl,
    title: job.title,
    title_normalised: job.titleNormalised,
    company: job.company,
    company_normalised: job.companyNormalised,
    location: job.location,
    location_normalised: job.locationNormalised,
    category: job.category,
    country: job.country,
    employment_type: job.employmentType ?? null,
    work_mode: job.workMode ?? null,
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    hourly_rate_min: job.hourlyRateMin ?? null,
    hourly_rate_max: job.hourlyRateMax ?? null,
    salary_currency: job.salaryCurrency ?? null,
    description: job.description,
    tags: job.tags ?? [],
    posted_at: job.postedAt ?? new Date().toISOString(),
    scraped_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('jobs')
    .upsert(rows as never[], { onConflict: 'source,source_id,category', ignoreDuplicates: true })

  if (error) {
    console.error(`[job-radar] Insert error for ${source}:`, error.message)
    result.errors += rows.length
  } else {
    result.newInserted = rows.length
  }

  return result
}
