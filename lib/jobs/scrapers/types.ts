/** Raw job as returned by a source scraper, before normalisation */
export interface RawJob {
  sourceId: string
  sourceUrl: string
  title: string
  company: string
  location: string
  country: 'AU' | 'NZ'
  employmentType?: 'full-time' | 'contract' | 'part-time'
  workMode?: 'remote' | 'hybrid' | 'onsite'
  salaryMin?: number
  salaryMax?: number
  hourlyRateMin?: number
  hourlyRateMax?: number
  salaryCurrency?: 'AUD' | 'NZD'
  description: string
  tags?: string[]
  postedAt?: string // ISO date string
}

export type JobSource = 'seek' | 'indeed' | 'linkedin' | 'trademe'
export type JobCategory = 'it' | 'french'

/** Normalised job ready for dedup check and insertion */
export interface NormalisedJob extends RawJob {
  source: JobSource
  category: JobCategory
  titleNormalised: string
  companyNormalised: string
  locationNormalised: string
}

/** Job row as stored in Supabase */
export interface JobRow {
  id: string
  source: JobSource
  source_id: string
  source_url: string
  title: string
  title_normalised: string
  company: string
  company_normalised: string
  location: string
  location_normalised: string
  category: JobCategory
  country: 'AU' | 'NZ'
  employment_type: 'full-time' | 'contract' | 'part-time' | null
  work_mode: 'remote' | 'hybrid' | 'onsite' | null
  salary_min: number | null
  salary_max: number | null
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  salary_currency: 'AUD' | 'NZD' | null
  description: string
  tags: string[]
  posted_at: string
  scraped_at: string
  is_active: boolean
  created_at: string
}
