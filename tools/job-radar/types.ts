export type JobCategory = 'it' | 'french'
export type EmploymentType = 'full-time' | 'contract' | 'part-time'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'
export type JobSource = 'seek' | 'indeed' | 'linkedin' | 'trademe'

export interface Job {
  id: string
  source: JobSource
  source_url: string
  title: string
  company: string
  location: string
  category: JobCategory
  country: 'AU' | 'NZ'
  employment_type: EmploymentType | null
  work_mode: WorkMode | null
  salary_min: number | null
  salary_max: number | null
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  salary_currency: 'AUD' | 'NZD' | null
  description: string
  tags: string[]
  posted_at: string
}

export interface JobFilters {
  category: JobCategory
  employment_type?: EmploymentType
  work_mode?: WorkMode
  country?: 'AU' | 'NZ'
  days?: number
  salary_min?: number
  salary_max?: number
  hourly_min?: number
  hourly_max?: number
  q?: string
  page: number
  limit: number
  sort: 'posted_at' | 'salary_min' | 'salary_max'
  order: 'asc' | 'desc'
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface JobsResponse {
  data: Job[]
  pagination: PaginationInfo
}

export const SOURCE_LABELS: Record<JobSource, string> = {
  seek: 'Seek',
  indeed: 'Indeed',
  linkedin: 'LinkedIn',
  trademe: 'Trade Me',
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'full-time': 'Full-time',
  'contract': 'Contract',
  'part-time': 'Part-time',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
}

export const DAYS_OPTIONS = [
  { label: 'Last 24h', value: 1 },
  { label: 'Last 3 days', value: 3 },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
]
