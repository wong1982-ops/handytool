-- AI News table for AI Radar tool
create table if not exists public.ai_news (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  source_url text not null,
  title text not null,
  title_normalised text not null,
  summary text not null default '',
  category text not null check (category in ('llms', 'image-video', 'audio-speech', 'code-models', 'multimodal', 'embedding-search', 'robotics-agents')),
  model_name text,
  provider text,
  tags text[] not null default '{}',
  image_url text,
  posted_at timestamptz not null default now(),
  scraped_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Dedup lookup index
create index idx_ai_news_dedup on public.ai_news (title_normalised)
  where is_active = true;

-- Gallery sort per category tab
create index idx_ai_news_category on public.ai_news (category, is_active, posted_at desc);

-- "All" feed sort
create index idx_ai_news_all on public.ai_news (is_active, posted_at desc);

-- Full-text search on title
create index idx_ai_news_title_search on public.ai_news using gin (to_tsvector('english', title));

-- Unique constraint to prevent duplicate source_id per source
create unique index idx_ai_news_source_unique on public.ai_news (source, source_id);

-- Archive table (same schema)
create table if not exists public.ai_news_archive (like public.ai_news including all);

-- RLS: publicly readable, only service role can write
alter table public.ai_news enable row level security;
alter table public.ai_news_archive enable row level security;

create policy "AI news is publicly readable"
  on public.ai_news for select
  using (true);

create policy "Archived AI news is publicly readable"
  on public.ai_news_archive for select
  using (true);
