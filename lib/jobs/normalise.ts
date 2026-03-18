import type { RawJob, NormalisedJob, JobSource, JobCategory } from './scrapers/types'

const TITLE_PREFIXES = /^(senior|junior|lead|principal|staff|chief|head of|associate|graduate|intern)\s+/i
const TITLE_SYNONYMS: [RegExp, string][] = [
  [/\bfront[\s-]?end\b/gi, 'frontend'],
  [/\bback[\s-]?end\b/gi, 'backend'],
  [/\bfull[\s-]?stack\b/gi, 'fullstack'],
  [/\bsoftware developer\b/gi, 'software engineer'],
  [/\bweb developer\b/gi, 'web engineer'],
  [/\bdev\s?ops\b/gi, 'devops'],
]

const COMPANY_SUFFIXES = /\s*(pty\.?\s*ltd\.?|ltd\.?|inc\.?|limited|incorporated|corp\.?|corporation|group|holdings)\s*$/i
const COMPANY_PREFIX = /^the\s+/i

const LOCATION_MAP: Record<string, string> = {
  'sydney cbd': 'sydney',
  'north sydney': 'sydney',
  'parramatta': 'sydney',
  'melbourne cbd': 'melbourne',
  'south melbourne': 'melbourne',
  'brisbane cbd': 'brisbane',
  'perth cbd': 'perth',
  'adelaide cbd': 'adelaide',
  'canberra': 'canberra',
  'hobart': 'hobart',
  'darwin': 'darwin',
  'gold coast': 'gold coast',
  'auckland cbd': 'auckland',
  'auckland central': 'auckland',
  'wellington cbd': 'wellington',
  'wellington central': 'wellington',
  'christchurch central': 'christchurch',
}

const POSTCODE_PATTERN = /\b\d{4}\b/g

export function normaliseTitle(title: string): string {
  let n = title.toLowerCase().trim()
  n = n.replace(TITLE_PREFIXES, '')
  for (const [pattern, replacement] of TITLE_SYNONYMS) {
    n = n.replace(pattern, replacement)
  }
  return n.replace(/\s+/g, ' ').trim()
}

export function normaliseCompany(company: string): string {
  let n = company.toLowerCase().trim()
  n = n.replace(COMPANY_PREFIX, '')
  n = n.replace(COMPANY_SUFFIXES, '')
  return n.replace(/\s+/g, ' ').trim()
}

export function normaliseLocation(location: string): string {
  let n = location.toLowerCase().trim()
  n = n.replace(POSTCODE_PATTERN, '').trim()

  // Check against location map
  for (const [variant, standard] of Object.entries(LOCATION_MAP)) {
    if (n.includes(variant)) {
      return standard
    }
  }

  // Return first part (city name) if comma-separated
  const parts = n.split(',')
  return parts[0].replace(/\s+/g, ' ').trim()
}

export function normaliseJob(
  raw: RawJob,
  source: JobSource,
  category: JobCategory,
): NormalisedJob {
  return {
    ...raw,
    source,
    category,
    titleNormalised: normaliseTitle(raw.title),
    companyNormalised: normaliseCompany(raw.company),
    locationNormalised: normaliseLocation(raw.location),
  }
}
