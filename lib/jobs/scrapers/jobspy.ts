import { scrapeJobs } from 'ts-jobspy'
import type { RawJob } from './types'

/**
 * Search configurations for each category.
 * Each config defines what to search for on which platforms.
 */
const SEARCH_CONFIGS = {
  it: [
    { searchTerm: 'software engineer', location: 'Australia' },
    { searchTerm: 'frontend developer', location: 'Australia' },
    { searchTerm: 'backend developer', location: 'Australia' },
    { searchTerm: 'full stack developer', location: 'Australia' },
    { searchTerm: 'devops engineer', location: 'Australia' },
    { searchTerm: 'data engineer', location: 'Australia' },
    { searchTerm: 'software developer', location: 'New Zealand' },
    { searchTerm: 'IT engineer', location: 'New Zealand' },
  ],
  french: [
    { searchTerm: 'french speaking', location: 'Australia' },
    { searchTerm: 'french teacher', location: 'Australia' },
    { searchTerm: 'bilingual french', location: 'Australia' },
    { searchTerm: 'french speaker', location: 'New Zealand' },
  ],
} as const

/**
 * Map ts-jobspy job to our RawJob format.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJobPost(job: any, country: 'AU' | 'NZ'): RawJob | null {
  if (!job.title || !job.company) return null

  // Map job type
  let employmentType: RawJob['employmentType']
  if (job.jobType === 'fulltime') employmentType = 'full-time'
  else if (job.jobType === 'contract') employmentType = 'contract'
  else if (job.jobType === 'parttime') employmentType = 'part-time'

  // Map work mode
  let workMode: RawJob['workMode']
  if (job.isRemote) workMode = 'remote'

  // Map compensation
  let salaryMin: number | undefined
  let salaryMax: number | undefined
  let hourlyRateMin: number | undefined
  let hourlyRateMax: number | undefined
  const salaryCurrency = country === 'AU' ? 'AUD' : 'NZD'

  if (job.compensation) {
    const comp = job.compensation
    if (comp.interval === 'yearly' || comp.interval === 'monthly') {
      const multiplier = comp.interval === 'monthly' ? 12 : 1
      salaryMin = comp.minAmount ? Math.round(comp.minAmount * multiplier) : undefined
      salaryMax = comp.maxAmount ? Math.round(comp.maxAmount * multiplier) : undefined
    } else if (comp.interval === 'hourly') {
      hourlyRateMin = comp.minAmount
      hourlyRateMax = comp.maxAmount
    } else if (comp.interval === 'daily') {
      // Convert daily to annual (approx 260 working days)
      salaryMin = comp.minAmount ? Math.round(comp.minAmount * 260) : undefined
      salaryMax = comp.maxAmount ? Math.round(comp.maxAmount * 260) : undefined
    }
  }

  // Generate a stable source ID from the job URL
  const sourceId = job.jobUrl
    ? Buffer.from(job.jobUrl).toString('base64url').slice(0, 64)
    : `${job.title}-${job.company}-${Date.now()}`.replace(/[^a-zA-Z0-9]/g, '-')

  return {
    sourceId,
    sourceUrl: job.jobUrlDirect || job.jobUrl || '',
    title: job.title,
    company: job.company,
    location: job.location || country,
    country,
    employmentType,
    workMode,
    salaryMin,
    salaryMax,
    hourlyRateMin,
    hourlyRateMax,
    salaryCurrency,
    description: job.description || `${job.title} at ${job.company}`,
    tags: [],
    postedAt: job.datePosted || new Date().toISOString(),
  }
}

/**
 * Detect country from location string.
 */
function detectCountry(location: string): 'AU' | 'NZ' {
  const lower = location.toLowerCase()
  if (lower.includes('new zealand') || lower.includes('nz') || lower.includes('auckland') || lower.includes('wellington') || lower.includes('christchurch')) {
    return 'NZ'
  }
  return 'AU'
}

/**
 * Scrape jobs from Indeed + LinkedIn using ts-jobspy.
 * Runs all search configs concurrently and deduplicates by URL.
 */
export async function scrapeJobspy(): Promise<RawJob[]> {
  const allJobs: RawJob[] = []
  const seenUrls = new Set<string>()

  // Run all search configs
  for (const config of [...SEARCH_CONFIGS.it, ...SEARCH_CONFIGS.french]) {
    try {
      console.log(`[job-radar/jobspy] Scraping: "${config.searchTerm}" in ${config.location}`)

      const results = await scrapeJobs({
        siteName: ['indeed', 'linkedin'],
        searchTerm: config.searchTerm,
        location: config.location,
        resultsWanted: 15,
        hoursOld: 72, // last 3 days
        countryIndeed: config.location.includes('New Zealand') ? 'New Zealand' : 'Australia',
        descriptionFormat: 'markdown',
      })

      for (const job of results) {
        const url = job.jobUrlDirect || job.jobUrl || ''
        if (seenUrls.has(url)) continue
        seenUrls.add(url)

        const country = detectCountry(config.location)
        const mapped = mapJobPost(job, country)
        if (mapped) allJobs.push(mapped)
      }

      console.log(`[job-radar/jobspy] "${config.searchTerm}": ${results.length} results`)
    } catch (err) {
      console.warn(`[job-radar/jobspy] Failed for "${config.searchTerm}":`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`[job-radar/jobspy] Total: ${allJobs.length} unique jobs`)
  return allJobs
}
