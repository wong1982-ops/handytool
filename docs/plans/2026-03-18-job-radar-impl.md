# Job Radar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a public job aggregator tool that collects IT/Tech and French language jobs from AU/NZ job boards daily, deduplicates them, and presents them in a tabbed, filterable gallery with drill-in detail views.

**Architecture:** Vercel cron jobs scrape 4 sources (Seek, Indeed, LinkedIn, Trade Me) on a staggered daily schedule, normalise and deduplicate jobs, then store them in Supabase. A public API serves paginated, filtered results. A Next.js tool page at `/tools/job-radar` renders a tabbed gallery (IT/Tech | French Language) with filters, search, and detail modals.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase (Postgres), Zod, Tailwind CSS v4, Vercel Crons

**Design Document:** `docs/plans/2026-03-18-job-radar.md`

---

## Task 1: Database Migration — `jobs` and `jobs_archive` Tables

**Files:**
- Create: `supabase/migrations/023_jobs.sql`

**Step 1: Write the migration**

```sql
-- Jobs table for Job Radar tool
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('seek', 'indeed', 'linkedin', 'trademe')),
  source_id text not null,
  source_url text not null,
  title text not null,
  title_normalised text not null,
  company text not null,
  company_normalised text not null,
  location text not null default '',
  location_normalised text not null default '',
  category text not null check (category in ('it', 'french')),
  country text not null check (country in ('AU', 'NZ')),
  employment_type text check (employment_type in ('full-time', 'contract', 'part-time')),
  work_mode text check (work_mode in ('remote', 'hybrid', 'onsite')),
  salary_min integer,
  salary_max integer,
  hourly_rate_min numeric,
  hourly_rate_max numeric,
  salary_currency text check (salary_currency in ('AUD', 'NZD')),
  description text not null default '',
  tags text[] not null default '{}',
  posted_at timestamptz not null default now(),
  scraped_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Dedup lookup index
create index idx_jobs_dedup on public.jobs (title_normalised, company_normalised, location_normalised, category)
  where is_active = true;

-- Gallery default sort (scoped by category + active)
create index idx_jobs_gallery on public.jobs (category, is_active, posted_at desc);

-- Filter indexes
create index idx_jobs_employment_type on public.jobs (employment_type) where is_active = true;
create index idx_jobs_work_mode on public.jobs (work_mode) where is_active = true;
create index idx_jobs_country on public.jobs (country) where is_active = true;

-- Full-text search on title and tags
create index idx_jobs_title_search on public.jobs using gin (to_tsvector('english', title));

-- Archive table (same schema)
create table if not exists public.jobs_archive (like public.jobs including all);

-- RLS: jobs are publicly readable, only service role can write
alter table public.jobs enable row level security;
alter table public.jobs_archive enable row level security;

create policy "Jobs are publicly readable"
  on public.jobs for select
  using (true);

create policy "Archived jobs are publicly readable"
  on public.jobs_archive for select
  using (true);

-- Unique constraint to prevent duplicate source_id per source+category
create unique index idx_jobs_source_unique on public.jobs (source, source_id, category);
```

**Step 2: Apply the migration locally**

Run: `pnpm supabase:reset`
Expected: Migration applies successfully, tables created.

**Step 3: Commit**

```bash
git add supabase/migrations/023_jobs.sql
git commit -m "feat(job-radar): add jobs and jobs_archive tables with indexes and RLS"
```

---

## Task 2: Shared Types and Keywords

**Files:**
- Create: `lib/jobs/scrapers/types.ts`
- Create: `lib/jobs/keywords.ts`

**Step 1: Create the RawJob interface and shared types**

Create `lib/jobs/scrapers/types.ts`:

```typescript
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
```

**Step 2: Create keyword lists**

Create `lib/jobs/keywords.ts`:

```typescript
import type { JobCategory } from './scrapers/types'

/** Search keywords used by scrapers to find jobs for each category */
export const SEARCH_KEYWORDS: Record<JobCategory, string[]> = {
  it: [
    'software engineer',
    'software developer',
    'web developer',
    'frontend developer',
    'backend developer',
    'fullstack developer',
    'full stack developer',
    'mobile developer',
    'devops engineer',
    'cloud engineer',
    'data engineer',
    'data scientist',
    'machine learning engineer',
    'QA engineer',
    'test engineer',
    'security analyst',
    'cybersecurity',
    'network engineer',
    'sysadmin',
    'system administrator',
    'IT support',
    'IT manager',
    'solutions architect',
    'technical lead',
    'scrum master',
    'product manager IT',
    'business analyst IT',
    'database administrator',
    'site reliability engineer',
    'platform engineer',
    'infrastructure engineer',
  ],
  french: [
    'french speaking',
    'french language',
    'bilingual french',
    'french english',
    'french teacher',
    'french tutor',
    'french translator',
    'french interpreter',
    'francophone',
    'parlez français',
    'fluent french',
    'native french',
  ],
}

/** Keywords used to classify a job's category from its title/description */
export const CATEGORY_MATCH_KEYWORDS: Record<JobCategory, string[]> = {
  it: [
    'software', 'developer', 'engineer', 'devops', 'frontend', 'front-end',
    'backend', 'back-end', 'fullstack', 'full-stack', 'cloud', 'data',
    'machine learning', 'ai ', 'artificial intelligence', 'cybersecurity',
    'security analyst', 'network engineer', 'sysadmin', 'it support',
    'it manager', 'scrum master', 'technical lead', 'tech lead',
    'database', 'dba', 'qa ', 'quality assurance', 'test engineer',
    'site reliability', 'sre', 'platform engineer', 'infrastructure',
    'solutions architect', 'system administrator', 'helpdesk',
    'web developer', 'mobile developer', 'ios developer', 'android developer',
    'react', 'node.js', 'python', 'java ', 'typescript', '.net', 'aws',
    'azure', 'gcp', 'kubernetes', 'docker',
  ],
  french: [
    'french', 'francophone', 'français', 'bilingual', 'translator',
    'interpreter', 'french teacher', 'french tutor',
  ],
}
```

**Step 3: Commit**

```bash
git add lib/jobs/scrapers/types.ts lib/jobs/keywords.ts
git commit -m "feat(job-radar): add shared types, RawJob interface, and keyword lists"
```

---

## Task 3: Normalisation and Categorisation Logic

**Files:**
- Create: `lib/jobs/normalise.ts`
- Create: `lib/jobs/categorise.ts`

**Step 1: Create normalisation module**

Create `lib/jobs/normalise.ts`:

```typescript
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
```

**Step 2: Create categorisation module**

Create `lib/jobs/categorise.ts`:

```typescript
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
```

**Step 3: Commit**

```bash
git add lib/jobs/normalise.ts lib/jobs/categorise.ts
git commit -m "feat(job-radar): add normalisation and categorisation logic"
```

---

## Task 4: Deduplication and Ingestion Logic

**Files:**
- Create: `lib/jobs/dedup.ts`
- Create: `lib/jobs/ingest.ts`

**Step 1: Create dedup module**

Create `lib/jobs/dedup.ts`:

```typescript
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
```

**Step 2: Create ingestion orchestrator**

Create `lib/jobs/ingest.ts`:

```typescript
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
    .upsert(rows, { onConflict: 'source,source_id,category', ignoreDuplicates: true })

  if (error) {
    console.error(`[job-radar] Insert error for ${source}:`, error.message)
    result.errors += rows.length
  } else {
    result.newInserted = rows.length
  }

  return result
}
```

**Step 3: Commit**

```bash
git add lib/jobs/dedup.ts lib/jobs/ingest.ts
git commit -m "feat(job-radar): add dedup and ingestion pipeline"
```

---

## Task 5: Archive Logic

**Files:**
- Create: `lib/jobs/archive.ts`

**Step 1: Create archive module**

Create `lib/jobs/archive.ts`:

```typescript
import { getAdminSupabase } from '@/lib/supabase/admin'

const ARCHIVE_AFTER_DAYS = 90

/**
 * Move jobs older than 90 days from `jobs` to `jobs_archive`.
 * Returns the number of archived rows.
 */
export async function archiveOldJobs(): Promise<number> {
  const supabase = getAdminSupabase()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - ARCHIVE_AFTER_DAYS)
  const cutoffIso = cutoff.toISOString()

  // Select old active jobs
  const { data: oldJobs, error: selectError } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .lt('posted_at', cutoffIso)
    .limit(500)

  if (selectError || !oldJobs || oldJobs.length === 0) {
    if (selectError) console.error('[job-radar] Archive select error:', selectError.message)
    return 0
  }

  // Insert into archive
  const { error: insertError } = await supabase
    .from('jobs_archive')
    .upsert(oldJobs, { onConflict: 'source,source_id,category', ignoreDuplicates: true })

  if (insertError) {
    console.error('[job-radar] Archive insert error:', insertError.message)
    return 0
  }

  // Mark as inactive in jobs table
  const ids = oldJobs.map((j) => j.id)
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ is_active: false })
    .in('id', ids)

  if (updateError) {
    console.error('[job-radar] Archive update error:', updateError.message)
  }

  return oldJobs.length
}
```

**Step 2: Commit**

```bash
git add lib/jobs/archive.ts
git commit -m "feat(job-radar): add 90-day archive logic"
```

---

## Task 6: Scraper Stubs (All 4 Sources)

The actual scraper implementations depend on API access / scraping libraries which will be built incrementally. For now, create stubs that return empty arrays so the full pipeline can be wired end-to-end.

**Files:**
- Create: `lib/jobs/scrapers/seek.ts`
- Create: `lib/jobs/scrapers/indeed.ts`
- Create: `lib/jobs/scrapers/linkedin.ts`
- Create: `lib/jobs/scrapers/trademe.ts`

**Step 1: Create all 4 scraper stubs**

Create `lib/jobs/scrapers/seek.ts`:

```typescript
import type { RawJob } from './types'
import { SEARCH_KEYWORDS } from '../keywords'

/**
 * Scrape IT and French language jobs from Seek (AU + NZ).
 * TODO: Implement with Seek API or conservative scraping.
 */
export async function scrapeSeek(): Promise<RawJob[]> {
  console.log('[job-radar] Seek scraper: not yet implemented. Keywords:', SEARCH_KEYWORDS.it.length + SEARCH_KEYWORDS.french.length)
  // TODO: Implement Seek scraping
  return []
}
```

Create `lib/jobs/scrapers/indeed.ts`:

```typescript
import type { RawJob } from './types'

/**
 * Scrape IT and French language jobs from Indeed (AU + NZ).
 * TODO: Implement with Indeed API or conservative scraping.
 */
export async function scrapeIndeed(): Promise<RawJob[]> {
  console.log('[job-radar] Indeed scraper: not yet implemented.')
  return []
}
```

Create `lib/jobs/scrapers/linkedin.ts`:

```typescript
import type { RawJob } from './types'

/**
 * Scrape IT and French language jobs from LinkedIn Jobs.
 * TODO: Implement with LinkedIn Jobs API.
 */
export async function scrapeLinkedin(): Promise<RawJob[]> {
  console.log('[job-radar] LinkedIn scraper: not yet implemented.')
  return []
}
```

Create `lib/jobs/scrapers/trademe.ts`:

```typescript
import type { RawJob } from './types'

/**
 * Scrape IT and French language jobs from Trade Me Jobs (NZ only).
 * TODO: Implement with conservative scraping (respect robots.txt).
 */
export async function scrapeTrademe(): Promise<RawJob[]> {
  console.log('[job-radar] Trade Me scraper: not yet implemented.')
  return []
}
```

**Step 2: Commit**

```bash
git add lib/jobs/scrapers/seek.ts lib/jobs/scrapers/indeed.ts lib/jobs/scrapers/linkedin.ts lib/jobs/scrapers/trademe.ts
git commit -m "feat(job-radar): add scraper stubs for Seek, Indeed, LinkedIn, Trade Me"
```

---

## Task 7: Cron Route — Scrape Jobs

**Files:**
- Create: `app/api/cron/scrape-jobs/[source]/route.ts`

**Step 1: Create the cron route**

Create `app/api/cron/scrape-jobs/[source]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { ingestJobs } from '@/lib/jobs/ingest'
import { scrapeSeek } from '@/lib/jobs/scrapers/seek'
import { scrapeIndeed } from '@/lib/jobs/scrapers/indeed'
import { scrapeLinkedin } from '@/lib/jobs/scrapers/linkedin'
import { scrapeTrademe } from '@/lib/jobs/scrapers/trademe'
import type { RawJob, JobSource } from '@/lib/jobs/scrapers/types'

const CRON_SECRET = process.env.CRON_SECRET || ''

const SCRAPERS: Record<JobSource, () => Promise<RawJob[]>> = {
  seek: scrapeSeek,
  indeed: scrapeIndeed,
  linkedin: scrapeLinkedin,
  trademe: scrapeTrademe,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string }> },
) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { source } = await params
  const scraper = SCRAPERS[source as JobSource]

  if (!scraper) {
    return NextResponse.json({ error: `Unknown source: ${source}` }, { status: 400 })
  }

  try {
    console.log(`[job-radar] Starting scrape for: ${source}`)
    const rawJobs = await scraper()
    const result = await ingestJobs(rawJobs, source as JobSource)
    console.log(`[job-radar] Scrape complete for ${source}:`, result)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error(`[job-radar] Scrape failed for ${source}:`, error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export const maxDuration = 60
```

**Step 2: Commit**

```bash
git add app/api/cron/scrape-jobs/\[source\]/route.ts
git commit -m "feat(job-radar): add cron route for per-source job scraping"
```

---

## Task 8: Cron Route — Archive Jobs

**Files:**
- Create: `app/api/cron/archive-jobs/route.ts`

**Step 1: Create the archive cron route**

Create `app/api/cron/archive-jobs/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { archiveOldJobs } from '@/lib/jobs/archive'

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const archived = await archiveOldJobs()
    console.log(`[job-radar] Archived ${archived} old jobs`)
    return NextResponse.json({ ok: true, archived })
  } catch (error) {
    console.error('[job-radar] Archive failed:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/cron/archive-jobs/route.ts
git commit -m "feat(job-radar): add cron route for archiving old jobs"
```

---

## Task 9: Update vercel.json with New Cron Schedules

**Files:**
- Modify: `vercel.json`

**Step 1: Add the 5 new cron entries**

Add to the `crons` array in `vercel.json`:

```json
{
  "path": "/api/cron/scrape-jobs/seek",
  "schedule": "0 19 * * *"
},
{
  "path": "/api/cron/scrape-jobs/indeed",
  "schedule": "15 19 * * *"
},
{
  "path": "/api/cron/scrape-jobs/linkedin",
  "schedule": "30 19 * * *"
},
{
  "path": "/api/cron/scrape-jobs/trademe",
  "schedule": "45 19 * * *"
},
{
  "path": "/api/cron/archive-jobs",
  "schedule": "0 20 * * 0"
}
```

Note: Times are UTC. 19:00 UTC = 5:00 AM AEST (UTC+10). Sunday archive at 20:00 UTC = 6:00 AM AEST.

**Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat(job-radar): add cron schedules for job scraping and archiving"
```

---

## Task 10: Gallery API — List Jobs

**Files:**
- Create: `app/api/v1/jobs/route.ts`

**Step 1: Create the jobs list API route**

Create `app/api/v1/jobs/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  category: z.enum(['it', 'french']).default('it'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['posted_at', 'salary_min', 'salary_max']).default('posted_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  employment_type: z.enum(['full-time', 'contract', 'part-time']).optional(),
  work_mode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  country: z.enum(['AU', 'NZ']).optional(),
  days: z.coerce.number().int().min(1).max(90).optional(),
  salary_min: z.coerce.number().int().min(0).optional(),
  salary_max: z.coerce.number().int().min(0).optional(),
  hourly_min: z.coerce.number().min(0).optional(),
  hourly_max: z.coerce.number().min(0).optional(),
  q: z.string().max(200).optional(),
})

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const {
    category, page, limit, sort, order,
    employment_type, work_mode, country, days,
    salary_min, salary_max, hourly_min, hourly_max, q,
  } = parsed.data

  const supabase = getAdminSupabase()
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .eq('is_active', true)

  if (employment_type) query = query.eq('employment_type', employment_type)
  if (work_mode) query = query.eq('work_mode', work_mode)
  if (country) query = query.eq('country', country)

  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('posted_at', since.toISOString())
  }

  if (salary_min) query = query.gte('salary_max', salary_min)
  if (salary_max) query = query.lte('salary_min', salary_max)
  if (hourly_min) query = query.gte('hourly_rate_max', hourly_min)
  if (hourly_max) query = query.lte('hourly_rate_min', hourly_max)

  if (q) {
    // Search title and tags
    query = query.or(`title.ilike.%${q}%,tags.cs.{${q}}`)
  }

  // Sort and paginate
  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[job-radar] API query error:', error.message)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({
    data: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}
```

**Step 2: Commit**

```bash
git add app/api/v1/jobs/route.ts
git commit -m "feat(job-radar): add paginated jobs list API with filters"
```

---

## Task 11: Gallery API — Job Detail

**Files:**
- Create: `app/api/v1/jobs/[id]/route.ts`

**Step 1: Create the job detail API route**

Create `app/api/v1/jobs/[id]/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return API_ERRORS.NOT_FOUND('Job')
  }

  return apiSuccess(data)
}
```

**Step 2: Commit**

```bash
git add app/api/v1/jobs/\[id\]/route.ts
git commit -m "feat(job-radar): add job detail API endpoint"
```

---

## Task 12: Frontend Types

**Files:**
- Create: `tools/job-radar/types.ts`

**Step 1: Create frontend types**

Create `tools/job-radar/types.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add tools/job-radar/types.ts
git commit -m "feat(job-radar): add frontend types and label constants"
```

---

## Task 13: Job Card Component

**Files:**
- Create: `tools/job-radar/job-card.tsx`

**Step 1: Create the job card component**

Create `tools/job-radar/job-card.tsx`:

```tsx
'use client'

import type { Job } from './types'
import { SOURCE_LABELS, EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from './types'

interface JobCardProps {
  job: Job
  onClick: (job: Job) => void
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

function formatSalary(job: Job): string {
  if (job.salary_min || job.salary_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.salary_min ? `$${(job.salary_min / 1000).toFixed(0)}k` : ''
    const max = job.salary_max ? `$${(job.salary_max / 1000).toFixed(0)}k` : ''
    if (min && max) return `${min}–${max} ${currency}`
    return `${min || max} ${currency}`
  }
  if (job.hourly_rate_min || job.hourly_rate_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.hourly_rate_min ? `$${job.hourly_rate_min}` : ''
    const max = job.hourly_rate_max ? `$${job.hourly_rate_max}` : ''
    if (min && max) return `${min}–${max}/hr ${currency}`
    return `${min || max}/hr ${currency}`
  }
  return 'Not disclosed'
}

const COUNTRY_FLAG: Record<string, string> = { AU: '🇦🇺', NZ: '🇳🇿' }

export function JobCard({ job, onClick }: JobCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(job)}
      className="w-full text-left p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[var(--tk-color-primary-500)]/50 hover:shadow-md transition-all cursor-pointer group"
      aria-label={`View details for ${job.title} at ${job.company}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[var(--tk-color-primary-500)] transition-colors line-clamp-2">
          {job.title}
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
          {formatRelativeDate(job.posted_at)}
        </span>
      </div>

      {/* Company + Location */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        {job.company} · {COUNTRY_FLAG[job.country]} {job.location}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.employment_type && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
          </span>
        )}
        {job.work_mode && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            {WORK_MODE_LABELS[job.work_mode]}
          </span>
        )}
      </div>

      {/* Salary + Source */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {formatSalary(job)}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {SOURCE_LABELS[job.source]}
        </span>
      </div>
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add tools/job-radar/job-card.tsx
git commit -m "feat(job-radar): add job card component"
```

---

## Task 14: Job Pagination Component

**Files:**
- Create: `tools/job-radar/job-pagination.tsx`

**Step 1: Create pagination component**

Create `tools/job-radar/job-pagination.tsx`:

```tsx
'use client'

import type { PaginationInfo } from './types'

interface JobPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function JobPagination({ pagination, onPageChange }: JobPaginationProps) {
  const { page, totalPages, total } = pagination

  if (totalPages <= 1) return null

  // Generate page numbers to show
  const pages: (number | 'ellipsis')[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)

    if (start > 2) pages.push('ellipsis')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push('ellipsis')
    pages.push(totalPages)
  }

  return (
    <nav aria-label="Job results pagination" className="flex flex-col items-center gap-3 mt-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {total} job{total !== 1 ? 's' : ''} found
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Previous page"
        >
          Prev
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">...</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-[40px] h-[40px] flex items-center justify-center text-sm rounded-lg border transition-colors ${
                p === page
                  ? 'bg-[var(--tk-color-primary-500)] text-white border-transparent'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  )
}
```

**Step 2: Commit**

```bash
git add tools/job-radar/job-pagination.tsx
git commit -m "feat(job-radar): add pagination component"
```

---

## Task 15: Job Filters Component

**Files:**
- Create: `tools/job-radar/job-filters.tsx`

**Step 1: Create filters component**

Create `tools/job-radar/job-filters.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { JobFilters, EmploymentType, WorkMode } from './types'
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS, DAYS_OPTIONS } from './types'

interface JobFiltersProps {
  filters: JobFilters
  onFilterChange: (updates: Partial<JobFilters>) => void
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function JobFiltersPanel({ filters, onFilterChange }: JobFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasActiveFilters =
    filters.employment_type ||
    filters.work_mode ||
    filters.country ||
    filters.days ||
    filters.salary_min ||
    filters.salary_max ||
    filters.hourly_min ||
    filters.hourly_max

  const clearAll = () =>
    onFilterChange({
      employment_type: undefined,
      work_mode: undefined,
      country: undefined,
      days: undefined,
      salary_min: undefined,
      salary_max: undefined,
      hourly_min: undefined,
      hourly_max: undefined,
    })

  const filterContent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4">
      <FilterSelect
        label="Employment"
        value={filters.employment_type ?? ''}
        options={Object.entries(EMPLOYMENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => onFilterChange({ employment_type: (v || undefined) as EmploymentType | undefined, page: 1 })}
      />
      <FilterSelect
        label="Work Mode"
        value={filters.work_mode ?? ''}
        options={Object.entries(WORK_MODE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => onFilterChange({ work_mode: (v || undefined) as WorkMode | undefined, page: 1 })}
      />
      <FilterSelect
        label="Country"
        value={filters.country ?? ''}
        options={[
          { value: 'AU', label: '🇦🇺 Australia' },
          { value: 'NZ', label: '🇳🇿 New Zealand' },
        ]}
        onChange={(v) => onFilterChange({ country: (v || undefined) as 'AU' | 'NZ' | undefined, page: 1 })}
      />
      <FilterSelect
        label="Posted Within"
        value={filters.days?.toString() ?? ''}
        options={DAYS_OPTIONS.map((o) => ({ value: o.value.toString(), label: o.label }))}
        onChange={(v) => onFilterChange({ days: v ? Number(v) : undefined, page: 1 })}
      />

      {/* Salary range */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Salary Range (Annual)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.salary_min ?? ''}
            onChange={(e) => onFilterChange({ salary_min: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.salary_max ?? ''}
            onChange={(e) => onFilterChange({ salary_max: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
        </div>
      </div>

      {/* Hourly rate range */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Hourly Rate (Contract)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.hourly_min ?? ''}
            onChange={(e) => onFilterChange({ hourly_min: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.hourly_max ?? ''}
            onChange={(e) => onFilterChange({ hourly_max: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="col-span-2 sm:col-span-3 lg:col-span-1 h-10 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile: collapsible drawer toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-expanded={isOpen}
        aria-controls="job-filters-panel"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-[var(--tk-color-primary-500)]" />
        )}
      </button>

      {/* Mobile: collapsible panel */}
      {isOpen && (
        <div id="job-filters-panel" className="lg:hidden p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {filterContent}
        </div>
      )}

      {/* Desktop: always-visible sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-fit sticky top-24">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Filters</h2>
        {filterContent}
      </aside>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add tools/job-radar/job-filters.tsx
git commit -m "feat(job-radar): add responsive filter panel with mobile drawer"
```

---

## Task 16: Job Search Bar Component

**Files:**
- Create: `tools/job-radar/job-search-bar.tsx`

**Step 1: Create search bar component**

Create `tools/job-radar/job-search-bar.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'

interface JobSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function JobSearchBar({ value, onChange }: JobSearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(newValue)
    }, 300)
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search jobs by title, skill, or keyword..."
        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50 focus:border-transparent transition-all"
        aria-label="Search jobs"
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add tools/job-radar/job-search-bar.tsx
git commit -m "feat(job-radar): add debounced search bar component"
```

---

## Task 17: Job Detail Modal Component

**Files:**
- Create: `tools/job-radar/job-detail-modal.tsx`

**Step 1: Create detail modal component**

Create `tools/job-radar/job-detail-modal.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import type { Job } from './types'
import { SOURCE_LABELS, EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from './types'

interface JobDetailModalProps {
  job: Job | null
  onClose: () => void
}

const COUNTRY_FLAG: Record<string, string> = { AU: '🇦🇺', NZ: '🇳🇿' }

function formatSalaryFull(job: Job): string {
  if (job.salary_min || job.salary_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.salary_min ? `$${job.salary_min.toLocaleString()}` : ''
    const max = job.salary_max ? `$${job.salary_max.toLocaleString()}` : ''
    if (min && max) return `${min} – ${max} ${currency} per year`
    return `${min || max} ${currency} per year`
  }
  if (job.hourly_rate_min || job.hourly_rate_max) {
    const currency = job.salary_currency ?? 'AUD'
    const min = job.hourly_rate_min ? `$${job.hourly_rate_min}` : ''
    const max = job.hourly_rate_max ? `$${job.hourly_rate_max}` : ''
    if (min && max) return `${min} – ${max} ${currency} per hour`
    return `${min || max} ${currency} per hour`
  }
  return 'Not disclosed'
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (job) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [job])

  if (!job) return null

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className="fixed inset-0 z-50 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent backdrop:bg-black/50 lg:flex lg:items-center lg:justify-center"
    >
      <div className="absolute bottom-0 left-0 right-0 lg:static lg:w-full lg:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-4 p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {job.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {job.company} · {COUNTRY_FLAG[job.country]} {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {job.employment_type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
              </span>
            )}
            {job.work_mode && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                {WORK_MODE_LABELS[job.work_mode]}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {SOURCE_LABELS[job.source]}
            </span>
          </div>

          {/* Salary */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Compensation
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatSalaryFull(job)}
            </p>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {job.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Skills & Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-500)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Posted date */}
          <p className="text-xs text-slate-400">
            Posted {new Date(job.posted_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white font-medium text-sm transition-colors"
          >
            Apply on {SOURCE_LABELS[job.source]}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(job.source_url)
            }}
            className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            aria-label="Copy job link"
          >
            Share
          </button>
        </div>
      </div>
    </dialog>
  )
}
```

**Step 2: Commit**

```bash
git add tools/job-radar/job-detail-modal.tsx
git commit -m "feat(job-radar): add job detail modal with slide-up on mobile"
```

---

## Task 18: Job Gallery Container

**Files:**
- Create: `tools/job-radar/job-gallery.tsx`

**Step 1: Create the gallery container**

Create `tools/job-radar/job-gallery.tsx`:

```tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Job, JobFilters, JobCategory, JobsResponse } from './types'
import { JobCard } from './job-card'
import { JobSearchBar } from './job-search-bar'
import { JobFiltersPanel } from './job-filters'
import { JobPagination } from './job-pagination'
import { JobDetailModal } from './job-detail-modal'

interface JobGalleryProps {
  category: JobCategory
}

type PageState = 'loading' | 'success' | 'error'

function buildFiltersFromParams(params: URLSearchParams, category: JobCategory): JobFilters {
  return {
    category,
    page: Number(params.get('page')) || 1,
    limit: Number(params.get('limit')) || 20,
    sort: (params.get('sort') as JobFilters['sort']) || 'posted_at',
    order: (params.get('order') as JobFilters['order']) || 'desc',
    employment_type: (params.get('employment_type') as JobFilters['employment_type']) || undefined,
    work_mode: (params.get('work_mode') as JobFilters['work_mode']) || undefined,
    country: (params.get('country') as JobFilters['country']) || undefined,
    days: params.get('days') ? Number(params.get('days')) : undefined,
    salary_min: params.get('salary_min') ? Number(params.get('salary_min')) : undefined,
    salary_max: params.get('salary_max') ? Number(params.get('salary_max')) : undefined,
    hourly_min: params.get('hourly_min') ? Number(params.get('hourly_min')) : undefined,
    hourly_max: params.get('hourly_max') ? Number(params.get('hourly_max')) : undefined,
    q: params.get('q') || undefined,
  }
}

function filtersToParams(filters: JobFilters): URLSearchParams {
  const p = new URLSearchParams()
  p.set('category', filters.category)
  if (filters.page > 1) p.set('page', String(filters.page))
  if (filters.q) p.set('q', filters.q)
  if (filters.employment_type) p.set('employment_type', filters.employment_type)
  if (filters.work_mode) p.set('work_mode', filters.work_mode)
  if (filters.country) p.set('country', filters.country)
  if (filters.days) p.set('days', String(filters.days))
  if (filters.salary_min) p.set('salary_min', String(filters.salary_min))
  if (filters.salary_max) p.set('salary_max', String(filters.salary_max))
  if (filters.hourly_min) p.set('hourly_min', String(filters.hourly_min))
  if (filters.hourly_max) p.set('hourly_max', String(filters.hourly_max))
  if (filters.sort !== 'posted_at') p.set('sort', filters.sort)
  if (filters.order !== 'desc') p.set('order', filters.order)
  return p
}

export function JobGallery({ category }: JobGalleryProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filters, setFilters] = useState<JobFilters>(() =>
    buildFiltersFromParams(searchParams, category),
  )
  const [state, setState] = useState<PageState>('loading')
  const [response, setResponse] = useState<JobsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Re-sync category when tab changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, category, page: 1 }))
  }, [category])

  const fetchJobs = useCallback(async (f: JobFilters) => {
    setState('loading')
    setError(null)

    const params = filtersToParams(f)

    try {
      const res = await fetch(`/api/v1/jobs?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || `Request failed (${res.status})`)
      }

      setResponse(json.data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
      setState('error')
    }
  }, [])

  // Fetch on filter change
  useEffect(() => {
    fetchJobs(filters)
    // Update URL without navigation
    const params = filtersToParams(filters)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [filters, fetchJobs, router])

  const updateFilters = (updates: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <JobSearchBar
        value={filters.q ?? ''}
        onChange={(q) => updateFilters({ q: q || undefined, page: 1 })}
      />

      {/* Mobile filter toggle + filter panel */}
      <JobFiltersPanel filters={filters} onFilterChange={updateFilters} />

      <div className="flex gap-6">
        {/* Desktop sidebar filters (rendered inside JobFiltersPanel) */}
        <div className="hidden lg:block">
          <JobFiltersPanel filters={filters} onFilterChange={updateFilters} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {state === 'error' && (
            <div className="p-6 text-center rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
              <button
                type="button"
                onClick={() => fetchJobs(filters)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {state === 'loading' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          )}

          {state === 'success' && response && (
            <>
              {response.data.length === 0 ? (
                <div className="p-10 text-center rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">No jobs found matching your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {response.data.map((job) => (
                    <JobCard key={job.id} job={job} onClick={setSelectedJob} />
                  ))}
                </div>
              )}
              <JobPagination
                pagination={response.pagination}
                onPageChange={(page) => updateFilters({ page })}
              />
            </>
          )}
        </div>
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add tools/job-radar/job-gallery.tsx
git commit -m "feat(job-radar): add gallery container with data fetching and URL state sync"
```

---

## Task 19: Job Radar Page Shell with Tabs

**Files:**
- Create: `tools/job-radar/job-radar-page.tsx`

**Step 1: Create the page shell with tabs**

Create `tools/job-radar/job-radar-page.tsx`:

```tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { JobCategory } from './types'
import { JobGallery } from './job-gallery'

const TABS: { label: string; value: JobCategory }[] = [
  { label: 'IT / Tech', value: 'it' },
  { label: 'French Language', value: 'french' },
]

function JobRadarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeCategory = (searchParams.get('category') as JobCategory) || 'it'

  const switchTab = (category: JobCategory) => {
    // Reset all filters when switching tabs
    router.replace(`?category=${category}`, { scroll: false })
  }

  return (
    <>
      {/* Tabs */}
      <div role="tablist" aria-label="Job categories" className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={activeCategory === tab.value}
            onClick={() => switchTab(tab.value)}
            className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeCategory === tab.value
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery */}
      <JobGallery category={activeCategory} />
    </>
  )
}

export function JobRadarPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-11 w-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <JobRadarContent />
    </Suspense>
  )
}
```

**Step 2: Commit**

```bash
git add tools/job-radar/job-radar-page.tsx
git commit -m "feat(job-radar): add page shell with IT/French tab switcher"
```

---

## Task 20: Tool Page Route

**Files:**
- Create: `app/tools/job-radar/page.tsx`

**Step 1: Create the page route**

Create `app/tools/job-radar/page.tsx`:

```tsx
import { JobRadarPage } from '@/tools/job-radar/job-radar-page'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'

export const metadata = {
  title: 'Job Radar — AU & NZ Tech & French Jobs | Toolk1t',
  description: 'Browse IT, software engineering, and French language jobs across Australia and New Zealand. Aggregated daily from Seek, Indeed, LinkedIn, and Trade Me.',
}

export default function Page() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="Job Radar" toolSlug="job-radar" />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Job Radar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            IT & French language jobs across Australia and New Zealand — updated daily
          </p>
        </div>

        <JobRadarPage />
      </div>
    </main>
  )
}
```

**Step 2: Verify the page loads**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/job-radar`
Expected: Page loads with tabs, search bar, filter toggle, and empty state ("No jobs found matching your filters.")

**Step 3: Commit**

```bash
git add app/tools/job-radar/page.tsx
git commit -m "feat(job-radar): add tool page route with metadata"
```

---

## Task 21: Fix Gallery Layout — Deduplicate Desktop Filters

The current `job-gallery.tsx` renders `<JobFiltersPanel>` twice (once for mobile toggle, once inside a `hidden lg:block` wrapper). This should be a single render with the component handling its own responsive behaviour internally.

**Files:**
- Modify: `tools/job-radar/job-gallery.tsx`

**Step 1: Remove the duplicate desktop filter wrapper**

In `job-gallery.tsx`, remove the `<div className="hidden lg:block">` wrapper and the second `<JobFiltersPanel>` inside the `flex gap-6` container. The `<JobFiltersPanel>` already renders both mobile toggle and desktop sidebar internally. Restructure the layout so the filter panel and card grid are siblings inside a flex row:

Replace the layout section (from `{/* Mobile filter toggle */}` to the end of the main content div) with:

```tsx
      <div className="flex gap-6">
        {/* Filter panel — handles mobile drawer + desktop sidebar */}
        <JobFiltersPanel filters={filters} onFilterChange={updateFilters} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* ... loading/error/success states remain the same ... */}
        </div>
      </div>
```

**Step 2: Verify layout**

Run: `pnpm dev`
Expected: On mobile, filter toggle button shows above cards. On desktop, sidebar appears on the left.

**Step 3: Commit**

```bash
git add tools/job-radar/job-gallery.tsx
git commit -m "fix(job-radar): deduplicate filter panel rendering in gallery layout"
```

---

## Task 22: Seed Data for Local Testing

**Files:**
- Create: `supabase/seed/jobs-seed.sql`

**Step 1: Create seed data**

Create `supabase/seed/jobs-seed.sql` with ~10 sample jobs for local testing:

```sql
-- Seed data for Job Radar local testing
INSERT INTO public.jobs (source, source_id, source_url, title, title_normalised, company, company_normalised, location, location_normalised, category, country, employment_type, work_mode, salary_min, salary_max, hourly_rate_min, hourly_rate_max, salary_currency, description, tags, posted_at, scraped_at)
VALUES
  ('seek', 'seek-001', 'https://seek.com.au/job/001', 'Senior Software Engineer', 'software engineer', 'Atlassian', 'atlassian', 'Sydney, NSW', 'sydney', 'it', 'AU', 'full-time', 'hybrid', 180000, 220000, NULL, NULL, 'AUD', 'Join our team to build next-generation developer tools. Experience with React, TypeScript, and distributed systems required.', ARRAY['React', 'TypeScript', 'Distributed Systems'], now() - interval '1 day', now()),

  ('indeed', 'indeed-001', 'https://indeed.com.au/job/001', 'DevOps Engineer', 'devops engineer', 'Canva Pty Ltd', 'canva', 'Sydney CBD', 'sydney', 'it', 'AU', 'full-time', 'remote', 160000, 200000, NULL, NULL, 'AUD', 'Build and maintain CI/CD pipelines and cloud infrastructure on AWS.', ARRAY['AWS', 'Kubernetes', 'Terraform', 'CI/CD'], now() - interval '2 days', now()),

  ('linkedin', 'linkedin-001', 'https://linkedin.com/jobs/001', 'Frontend Developer', 'frontend developer', 'The Iconic', 'iconic', 'Melbourne, VIC', 'melbourne', 'it', 'AU', 'contract', 'onsite', NULL, NULL, 95, 120, 'AUD', 'Build responsive e-commerce experiences with React and Next.js.', ARRAY['React', 'Next.js', 'CSS', 'E-commerce'], now() - interval '3 days', now()),

  ('trademe', 'trademe-001', 'https://trademe.co.nz/jobs/001', 'Full Stack Developer', 'fullstack developer', 'Xero Limited', 'xero', 'Wellington', 'wellington', 'it', 'NZ', 'full-time', 'hybrid', 120000, 160000, NULL, NULL, 'NZD', 'Work on our cloud accounting platform. TypeScript, Node.js, and PostgreSQL experience preferred.', ARRAY['TypeScript', 'Node.js', 'PostgreSQL'], now() - interval '1 day', now()),

  ('seek', 'seek-002', 'https://seek.com.au/job/002', 'Data Engineer', 'data engineer', 'Commonwealth Bank', 'commonwealth bank', 'Sydney, NSW', 'sydney', 'it', 'AU', 'full-time', 'hybrid', 150000, 190000, NULL, NULL, 'AUD', 'Design and build data pipelines for real-time analytics. Python, Spark, and Airflow experience required.', ARRAY['Python', 'Spark', 'Airflow', 'SQL'], now() - interval '5 days', now()),

  ('indeed', 'indeed-002', 'https://indeed.com.au/job/002', 'QA Test Engineer', 'qa test engineer', 'REA Group', 'rea group', 'Melbourne, VIC', 'melbourne', 'it', 'AU', 'contract', 'remote', NULL, NULL, 80, 100, 'AUD', 'Automated testing for real estate platform. Playwright and Jest experience needed.', ARRAY['Playwright', 'Jest', 'TypeScript', 'QA'], now() - interval '7 days', now()),

  ('seek', 'seek-003', 'https://seek.com.au/job/003', 'Cloud Security Analyst', 'cloud security analyst', 'NAB', 'nab', 'Melbourne CBD', 'melbourne', 'it', 'AU', 'full-time', 'onsite', 140000, 170000, NULL, NULL, 'AUD', 'Monitor and respond to security threats across cloud infrastructure.', ARRAY['AWS', 'Azure', 'SIEM', 'Security'], now() - interval '10 days', now()),

  ('seek', 'seek-f01', 'https://seek.com.au/job/f01', 'French Speaking Customer Support', 'french speaking customer support', 'Airbus Pacific', 'airbus pacific', 'Sydney, NSW', 'sydney', 'french', 'AU', 'full-time', 'hybrid', 70000, 85000, NULL, NULL, 'AUD', 'Provide customer support in French and English for our Asia-Pacific customers.', ARRAY['French', 'Customer Support', 'Bilingual'], now() - interval '2 days', now()),

  ('trademe', 'trademe-f01', 'https://trademe.co.nz/jobs/f01', 'French Language Teacher', 'french language teacher', 'Alliance Française', 'alliance francaise', 'Auckland', 'auckland', 'french', 'NZ', 'part-time', 'onsite', 55000, 70000, NULL, NULL, 'NZD', 'Teach French language courses to adult learners. Native French speaker required.', ARRAY['French', 'Teaching', 'Education'], now() - interval '4 days', now()),

  ('indeed', 'indeed-f01', 'https://indeed.com.au/job/f01', 'French-English Translator', 'french english translator', 'SBS Australia', 'sbs australia', 'Melbourne, VIC', 'melbourne', 'french', 'AU', 'contract', 'remote', NULL, NULL, 55, 75, 'AUD', 'Translate media content from French to English. Experience in journalism preferred.', ARRAY['French', 'Translation', 'Media', 'Journalism'], now() - interval '6 days', now());
```

**Step 2: Apply seed data**

Run: `pnpm supabase:reset`
Expected: Tables created and seed data inserted.

Alternatively, run the seed directly:
Run: `psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed/jobs-seed.sql`

**Step 3: Verify the gallery shows data**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/job-radar`
Expected: IT/Tech tab shows 7 job cards. French Language tab shows 3 job cards. Filters, pagination, and detail modal all work.

**Step 4: Commit**

```bash
git add supabase/seed/jobs-seed.sql
git commit -m "feat(job-radar): add seed data for local testing"
```

---

## Summary of All Tasks

| # | Task | Key Files |
|---|---|---|
| 1 | DB migration | `supabase/migrations/023_jobs.sql` |
| 2 | Shared types + keywords | `lib/jobs/scrapers/types.ts`, `lib/jobs/keywords.ts` |
| 3 | Normalise + categorise | `lib/jobs/normalise.ts`, `lib/jobs/categorise.ts` |
| 4 | Dedup + ingest pipeline | `lib/jobs/dedup.ts`, `lib/jobs/ingest.ts` |
| 5 | Archive logic | `lib/jobs/archive.ts` |
| 6 | Scraper stubs (4 sources) | `lib/jobs/scrapers/{seek,indeed,linkedin,trademe}.ts` |
| 7 | Cron: scrape jobs | `app/api/cron/scrape-jobs/[source]/route.ts` |
| 8 | Cron: archive jobs | `app/api/cron/archive-jobs/route.ts` |
| 9 | Vercel cron config | `vercel.json` |
| 10 | API: list jobs | `app/api/v1/jobs/route.ts` |
| 11 | API: job detail | `app/api/v1/jobs/[id]/route.ts` |
| 12 | Frontend types | `tools/job-radar/types.ts` |
| 13 | Job card | `tools/job-radar/job-card.tsx` |
| 14 | Pagination | `tools/job-radar/job-pagination.tsx` |
| 15 | Filters | `tools/job-radar/job-filters.tsx` |
| 16 | Search bar | `tools/job-radar/job-search-bar.tsx` |
| 17 | Detail modal | `tools/job-radar/job-detail-modal.tsx` |
| 18 | Gallery container | `tools/job-radar/job-gallery.tsx` |
| 19 | Page shell + tabs | `tools/job-radar/job-radar-page.tsx` |
| 20 | Tool page route | `app/tools/job-radar/page.tsx` |
| 21 | Fix filter layout | `tools/job-radar/job-gallery.tsx` |
| 22 | Seed data | `supabase/seed/jobs-seed.sql` |
