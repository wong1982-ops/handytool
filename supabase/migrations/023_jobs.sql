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
