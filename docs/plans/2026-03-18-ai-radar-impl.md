# AI Radar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a public AI model tracker that collects news about new AI model releases and major updates daily from RSS feeds and community sources, categorises them by model type, and presents them in a tabbed, searchable feed with drill-in detail views.

**Architecture:** Two Vercel cron jobs (RSS group + community group) collect items daily, filter for model-related content, categorise by model type, deduplicate, and store in Supabase. A public API serves paginated, filtered results. A Next.js tool page at `/tools/ai-radar` renders a tabbed feed (All + 7 categories) with search, time filtering, and detail modals.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase (Postgres), Zod, Tailwind CSS v4, Vercel Crons

**Design Document:** `docs/plans/2026-03-18-ai-radar.md`

---

## Task 1: Database Migration — `ai_news` and `ai_news_archive` Tables

**Files:**
- Create: `supabase/migrations/024_ai_news.sql`

**Step 1: Write the migration**

```sql
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
```

**Step 2: Apply the migration locally**

Run: `pnpm supabase:reset`
Expected: Migration applies successfully, tables created.

**Step 3: Commit**

```bash
git add supabase/migrations/024_ai_news.sql
git commit -m "feat(ai-radar): add ai_news and ai_news_archive tables with indexes and RLS"
```

---

## Task 2: Shared Types and Sources Config

**Files:**
- Create: `lib/ai-news/collectors/types.ts`
- Create: `lib/ai-news/sources.ts`

**Step 1: Create the RawNewsItem interface and shared types**

Create `lib/ai-news/collectors/types.ts`:

```typescript
/** Raw news item as returned by a collector, before normalisation */
export interface RawNewsItem {
  sourceId: string
  sourceUrl: string
  title: string
  summary: string
  imageUrl?: string
  postedAt?: string // ISO date string
}

export type NewsSource =
  | 'techcrunch'
  | 'theverge'
  | 'venturebeat'
  | 'arstechnica'
  | 'arxiv'
  | 'huggingface'
  | 'openai_blog'
  | 'anthropic_blog'
  | 'google_blog'
  | 'meta_blog'
  | 'hackernews'
  | 'reddit'

export type NewsCategory =
  | 'llms'
  | 'image-video'
  | 'audio-speech'
  | 'code-models'
  | 'multimodal'
  | 'embedding-search'
  | 'robotics-agents'

/** Normalised news item ready for dedup check and insertion */
export interface NormalisedNewsItem extends RawNewsItem {
  source: NewsSource
  category: NewsCategory
  titleNormalised: string
  modelName: string | null
  provider: string | null
  tags: string[]
}

/** News row as stored in Supabase */
export interface AiNewsRow {
  id: string
  source: NewsSource
  source_id: string
  source_url: string
  title: string
  title_normalised: string
  summary: string
  category: NewsCategory
  model_name: string | null
  provider: string | null
  tags: string[]
  image_url: string | null
  posted_at: string
  scraped_at: string
  is_active: boolean
  created_at: string
}
```

**Step 2: Create sources configuration**

Create `lib/ai-news/sources.ts`:

```typescript
import type { NewsSource } from './collectors/types'

export interface RssSourceConfig {
  source: NewsSource
  name: string
  feedUrl: string
}

export const RSS_SOURCES: RssSourceConfig[] = [
  {
    source: 'techcrunch',
    name: 'TechCrunch',
    feedUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
  },
  {
    source: 'theverge',
    name: 'The Verge',
    feedUrl: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  },
  {
    source: 'venturebeat',
    name: 'VentureBeat',
    feedUrl: 'https://venturebeat.com/category/ai/feed/',
  },
  {
    source: 'arstechnica',
    name: 'Ars Technica',
    feedUrl: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
  },
  {
    source: 'arxiv',
    name: 'arXiv CS.AI',
    feedUrl: 'https://rss.arxiv.org/rss/cs.AI',
  },
  {
    source: 'huggingface',
    name: 'Hugging Face',
    feedUrl: 'https://huggingface.co/blog/feed.xml',
  },
  {
    source: 'openai_blog',
    name: 'OpenAI Blog',
    feedUrl: 'https://openai.com/blog/rss.xml',
  },
  {
    source: 'anthropic_blog',
    name: 'Anthropic Blog',
    feedUrl: 'https://www.anthropic.com/research/rss.xml',
  },
  {
    source: 'google_blog',
    name: 'Google AI Blog',
    feedUrl: 'https://blog.google/technology/ai/rss/',
  },
  {
    source: 'meta_blog',
    name: 'Meta AI Blog',
    feedUrl: 'https://ai.meta.com/blog/rss/',
  },
]

export const SOURCE_LABELS: Record<NewsSource, string> = {
  techcrunch: 'TechCrunch',
  theverge: 'The Verge',
  venturebeat: 'VentureBeat',
  arstechnica: 'Ars Technica',
  arxiv: 'arXiv',
  huggingface: 'Hugging Face',
  openai_blog: 'OpenAI',
  anthropic_blog: 'Anthropic',
  google_blog: 'Google AI',
  meta_blog: 'Meta AI',
  hackernews: 'Hacker News',
  reddit: 'Reddit',
}
```

**Step 3: Commit**

```bash
git add lib/ai-news/collectors/types.ts lib/ai-news/sources.ts
git commit -m "feat(ai-radar): add shared types, RawNewsItem interface, and RSS source config"
```

---

## Task 3: Relevance Filtering and Category Keywords

**Files:**
- Create: `lib/ai-news/filter.ts`
- Create: `lib/ai-news/categorise.ts`

**Step 1: Create relevance filter**

Create `lib/ai-news/filter.ts`:

```typescript
/** Keywords that indicate a news item is about AI model releases/updates */
const RELEVANCE_KEYWORDS = [
  'model', 'release', 'launch', 'announce', 'update', 'upgrade',
  'benchmark', 'capability', 'parameter', 'weights', 'fine-tune',
  'fine-tuning', 'open source', 'open-source', 'api',
  // Model type keywords (overlap with category keywords)
  'language model', 'llm', 'gpt', 'claude', 'gemini', 'llama',
  'mistral', 'phi', 'qwen', 'diffusion', 'dall-e', 'midjourney',
  'flux', 'sora', 'whisper', 'codex', 'copilot', 'multimodal',
  'embedding', 'vector', 'agent', 'text-to-speech', 'text-to-image',
  'text-to-video', 'speech-to-text',
]

/**
 * Check if a news item is relevant (about AI model releases/updates).
 * Returns true if the title or summary contains at least one relevance keyword.
 */
export function isModelRelated(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase()
  return RELEVANCE_KEYWORDS.some((kw) => text.includes(kw))
}
```

**Step 2: Create categorisation module**

Create `lib/ai-news/categorise.ts`:

```typescript
import type { NewsCategory } from './collectors/types'

/** Category keywords ordered by specificity (more specific first) */
const CATEGORY_KEYWORDS: { category: NewsCategory; keywords: string[] }[] = [
  {
    category: 'code-models',
    keywords: [
      'code generation', 'codex', 'copilot', 'code model', 'coding assistant',
      'code llm', 'devin', 'cursor', 'code completion',
    ],
  },
  {
    category: 'audio-speech',
    keywords: [
      'text-to-speech', 'speech-to-text', 'tts', 'stt', 'whisper',
      'voice model', 'audio model', 'music generation', 'sound model',
    ],
  },
  {
    category: 'image-video',
    keywords: [
      'image generation', 'video generation', 'diffusion', 'stable diffusion',
      'dall-e', 'midjourney', 'flux', 'sora', 'runway', 'imagen',
      'text-to-image', 'text-to-video', 'image model', 'video model',
    ],
  },
  {
    category: 'multimodal',
    keywords: [
      'multimodal', 'vision-language', 'vlm', 'omni', 'multi-modal',
      'any-to-any', 'vision model',
    ],
  },
  {
    category: 'embedding-search',
    keywords: [
      'embedding', 'vector model', 'retrieval model', 'search model',
      'reranker', 'rag model', 'semantic search',
    ],
  },
  {
    category: 'robotics-agents',
    keywords: [
      'robot', 'robotics', 'embodied', 'manipulation', 'navigation',
      'planning agent', 'tool use', 'autonomous agent',
    ],
  },
  {
    // Default / catch-all — must be last
    category: 'llms',
    keywords: [
      'language model', 'llm', 'gpt', 'claude', 'gemini', 'llama',
      'mistral', 'phi', 'qwen', 'chat model', 'text generation',
      'reasoning model', 'transformer', 'foundation model',
    ],
  },
]

/**
 * Assign a category to a news item based on title + summary keywords.
 * Returns the first matching category (ordered by specificity).
 * Defaults to 'llms' if no match.
 */
export function categoriseNewsItem(title: string, summary: string): NewsCategory {
  const text = `${title} ${summary}`.toLowerCase()

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category
    }
  }

  return 'llms'
}
```

**Step 3: Commit**

```bash
git add lib/ai-news/filter.ts lib/ai-news/categorise.ts
git commit -m "feat(ai-radar): add relevance filtering and category assignment logic"
```

---

## Task 4: Model Name & Provider Extraction

**Files:**
- Create: `lib/ai-news/extract.ts`

**Step 1: Create extraction module**

Create `lib/ai-news/extract.ts`:

```typescript
interface ExtractedModel {
  modelName: string | null
  provider: string | null
}

const MODEL_PATTERNS: { pattern: RegExp; provider: string }[] = [
  // OpenAI
  { pattern: /\b(GPT-\d[\w.]*|GPT-\d|o\d-\w+|o[134])\b/i, provider: 'OpenAI' },
  { pattern: /\b(DALL[·-]?E\s*\d?)\b/i, provider: 'OpenAI' },
  { pattern: /\b(Codex)\b/i, provider: 'OpenAI' },
  { pattern: /\b(Sora)\b/i, provider: 'OpenAI' },
  { pattern: /\b(Whisper)\b/i, provider: 'OpenAI' },
  // Anthropic
  { pattern: /\b(Claude\s*[\d.]+[\w]*|Claude\s+\w+\s+[\d.]+)\b/i, provider: 'Anthropic' },
  // Google
  { pattern: /\b(Gemini\s*[\d.]+[\w]*|Gemini\s+\w+)\b/i, provider: 'Google' },
  { pattern: /\b(Imagen\s*\d?)\b/i, provider: 'Google' },
  { pattern: /\b(PaLM\s*\d?)\b/i, provider: 'Google' },
  // Meta
  { pattern: /\b(Llama\s*[\d.]+[\w]*|LLaMA\s*[\d.]+)\b/i, provider: 'Meta' },
  // Mistral
  { pattern: /\b(Mistral\s*[\w.-]*)\b/i, provider: 'Mistral AI' },
  { pattern: /\b(Mixtral\s*[\w.-]*)\b/i, provider: 'Mistral AI' },
  // Microsoft
  { pattern: /\b(Phi-\d[\w.]*)\b/i, provider: 'Microsoft' },
  { pattern: /\b(Copilot)\b/i, provider: 'Microsoft' },
  // Alibaba
  { pattern: /\b(Qwen\s*[\d.]*[\w]*)\b/i, provider: 'Alibaba' },
  // Stability AI
  { pattern: /\b(Stable\s+Diffusion\s*[\w.]*|SDXL|SD\s*\d)\b/i, provider: 'Stability AI' },
  // Black Forest Labs
  { pattern: /\b(Flux[\s.][\w.]+)\b/i, provider: 'Black Forest Labs' },
  // Runway
  { pattern: /\b(Runway\s+Gen-?\d)\b/i, provider: 'Runway' },
  // Hugging Face
  { pattern: /\b(StarCoder\s*\d?)\b/i, provider: 'Hugging Face' },
]

const TAG_KEYWORDS = [
  'open-source', 'open source', 'benchmark', 'reasoning', 'fine-tuning',
  'fine-tune', 'rlhf', 'rl', 'safety', 'alignment', 'context window',
  'multimodal', 'vision', 'audio', 'video', 'code', 'math',
  'instruction tuning', 'inference', 'quantization', 'distillation',
  'api', 'free', 'preview', 'beta', 'research', 'paper',
]

/**
 * Extract model name and provider from title + summary using regex patterns.
 * Best-effort — returns nulls if no known model pattern is found.
 */
export function extractModel(title: string, summary: string): ExtractedModel {
  const text = `${title} ${summary}`

  for (const { pattern, provider } of MODEL_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      return {
        modelName: match[1].trim(),
        provider,
      }
    }
  }

  return { modelName: null, provider: null }
}

/**
 * Extract relevant tags from title + summary.
 */
export function extractTags(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  return TAG_KEYWORDS.filter((kw) => text.includes(kw))
}
```

**Step 2: Commit**

```bash
git add lib/ai-news/extract.ts
git commit -m "feat(ai-radar): add model name, provider, and tag extraction logic"
```

---

## Task 5: Normalisation and Deduplication

**Files:**
- Create: `lib/ai-news/normalise.ts`
- Create: `lib/ai-news/dedup.ts`

**Step 1: Create normalisation module**

Create `lib/ai-news/normalise.ts`:

```typescript
/**
 * Normalise a news title for dedup comparison.
 * Simpler than Job Radar — just lowercase, trim, collapse whitespace.
 */
export function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '') // remove punctuation
}
```

**Step 2: Create dedup module**

Create `lib/ai-news/dedup.ts`:

```typescript
import { getAdminSupabase } from '@/lib/supabase/admin'
import type { NormalisedNewsItem } from './collectors/types'

/**
 * Filter out news items that already exist in the database.
 * Checks by normalised title.
 */
export async function deduplicateNews(
  items: NormalisedNewsItem[],
): Promise<NormalisedNewsItem[]> {
  if (items.length === 0) return []

  const supabase = getAdminSupabase()
  const newItems: NormalisedNewsItem[] = []

  for (const item of items) {
    const { data } = await supabase
      .from('ai_news')
      .select('id')
      .eq('title_normalised', item.titleNormalised)
      .eq('is_active', true)
      .limit(1)

    if (!data || data.length === 0) {
      newItems.push(item)
    }
  }

  return newItems
}
```

**Step 3: Commit**

```bash
git add lib/ai-news/normalise.ts lib/ai-news/dedup.ts
git commit -m "feat(ai-radar): add title normalisation and deduplication logic"
```

---

## Task 6: Ingestion Pipeline

**Files:**
- Create: `lib/ai-news/ingest.ts`

**Step 1: Create ingestion orchestrator**

Create `lib/ai-news/ingest.ts`:

```typescript
import { getAdminSupabase } from '@/lib/supabase/admin'
import type { RawNewsItem, NewsSource, NormalisedNewsItem } from './collectors/types'
import { isModelRelated } from './filter'
import { categoriseNewsItem } from './categorise'
import { normaliseTitle } from './normalise'
import { extractModel, extractTags } from './extract'
import { deduplicateNews } from './dedup'

export interface IngestResult {
  source: NewsSource
  totalCollected: number
  relevantFiltered: number
  newInserted: number
  duplicatesSkipped: number
  errors: number
}

/**
 * Full ingestion pipeline: filter → categorise → normalise → extract → dedup → insert.
 */
export async function ingestNewsItems(
  rawItems: RawNewsItem[],
  source: NewsSource,
): Promise<IngestResult> {
  const result: IngestResult = {
    source,
    totalCollected: rawItems.length,
    relevantFiltered: 0,
    newInserted: 0,
    duplicatesSkipped: 0,
    errors: 0,
  }

  if (rawItems.length === 0) return result

  // Filter out items missing title
  const validItems = rawItems.filter((item) => {
    if (!item.title?.trim()) {
      result.errors++
      return false
    }
    return true
  })

  // Filter for model-related content
  const relevant = validItems.filter((item) =>
    isModelRelated(item.title, item.summary),
  )
  result.relevantFiltered = validItems.length - relevant.length

  // Normalise, categorise, extract
  const normalised: NormalisedNewsItem[] = relevant.map((item) => {
    const { modelName, provider } = extractModel(item.title, item.summary)
    const tags = extractTags(item.title, item.summary)
    const category = categoriseNewsItem(item.title, item.summary)

    return {
      ...item,
      source,
      category,
      titleNormalised: normaliseTitle(item.title),
      modelName,
      provider,
      tags,
    }
  })

  // Deduplicate
  const newItems = await deduplicateNews(normalised)
  result.duplicatesSkipped = normalised.length - newItems.length

  if (newItems.length === 0) return result

  // Insert into Supabase
  const supabase = getAdminSupabase()
  const rows = newItems.map((item) => ({
    source: item.source,
    source_id: item.sourceId,
    source_url: item.sourceUrl,
    title: item.title,
    title_normalised: item.titleNormalised,
    summary: item.summary.slice(0, 500),
    category: item.category,
    model_name: item.modelName,
    provider: item.provider,
    tags: item.tags,
    image_url: item.imageUrl ?? null,
    posted_at: item.postedAt ?? new Date().toISOString(),
    scraped_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('ai_news')
    .upsert(rows, { onConflict: 'source,source_id', ignoreDuplicates: true })

  if (error) {
    console.error(`[ai-radar] Insert error for ${source}:`, error.message)
    result.errors += rows.length
  } else {
    result.newInserted = rows.length
  }

  return result
}
```

**Step 2: Commit**

```bash
git add lib/ai-news/ingest.ts
git commit -m "feat(ai-radar): add ingestion pipeline with filter, categorise, extract, dedup"
```

---

## Task 7: Archive Logic

**Files:**
- Create: `lib/ai-news/archive.ts`

**Step 1: Create archive module**

Create `lib/ai-news/archive.ts`:

```typescript
import { getAdminSupabase } from '@/lib/supabase/admin'

const ARCHIVE_AFTER_DAYS = 90

/**
 * Move AI news items older than 90 days from `ai_news` to `ai_news_archive`.
 * Returns the number of archived rows.
 */
export async function archiveOldNews(): Promise<number> {
  const supabase = getAdminSupabase()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - ARCHIVE_AFTER_DAYS)
  const cutoffIso = cutoff.toISOString()

  const { data: oldItems, error: selectError } = await supabase
    .from('ai_news')
    .select('*')
    .eq('is_active', true)
    .lt('posted_at', cutoffIso)
    .limit(500)

  if (selectError || !oldItems || oldItems.length === 0) {
    if (selectError) console.error('[ai-radar] Archive select error:', selectError.message)
    return 0
  }

  const { error: insertError } = await supabase
    .from('ai_news_archive')
    .upsert(oldItems, { onConflict: 'source,source_id', ignoreDuplicates: true })

  if (insertError) {
    console.error('[ai-radar] Archive insert error:', insertError.message)
    return 0
  }

  const ids = oldItems.map((item) => item.id)
  const { error: updateError } = await supabase
    .from('ai_news')
    .update({ is_active: false })
    .in('id', ids)

  if (updateError) {
    console.error('[ai-radar] Archive update error:', updateError.message)
  }

  return oldItems.length
}
```

**Step 2: Commit**

```bash
git add lib/ai-news/archive.ts
git commit -m "feat(ai-radar): add 90-day archive logic for AI news"
```

---

## Task 8: RSS Collector

**Files:**
- Create: `lib/ai-news/collectors/rss.ts`

**Step 1: Create RSS feed parser**

Create `lib/ai-news/collectors/rss.ts`:

```typescript
import type { RawNewsItem, NewsSource } from './types'
import type { RssSourceConfig } from '../sources'
import { createHash } from 'crypto'

/**
 * Strip HTML tags from a string.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

/**
 * Generate a stable source ID from a URL.
 */
function urlToId(url: string): string {
  return createHash('md5').update(url).digest('hex').slice(0, 16)
}

/**
 * Parse an RSS/Atom feed XML string into RawNewsItem[].
 * Handles both RSS 2.0 (<item>) and Atom (<entry>) formats.
 */
function parseRssFeed(xml: string, source: NewsSource): RawNewsItem[] {
  const items: RawNewsItem[] = []

  // Extract items (RSS 2.0) or entries (Atom)
  const itemPattern = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi
  let match: RegExpExecArray | null

  while ((match = itemPattern.exec(xml)) !== null) {
    const block = match[1]

    // Extract title
    const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)
    const title = titleMatch ? stripHtml(titleMatch[1]).trim() : ''
    if (!title) continue

    // Extract link
    const linkMatch =
      block.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i) ||
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) ||
      block.match(/<guid[^>]*>(https?:\/\/[^<]*)<\/guid>/i)
    const sourceUrl = linkMatch ? linkMatch[1].trim() : ''
    if (!sourceUrl) continue

    // Extract description/summary
    const descMatch =
      block.match(/<(?:description|summary|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary|content)>/i)
    const summary = descMatch ? stripHtml(descMatch[1]).slice(0, 500).trim() : ''

    // Extract published date
    const dateMatch = block.match(/<(?:pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i)
    const postedAt = dateMatch ? new Date(dateMatch[1].trim()).toISOString() : undefined

    // Extract image (media:content or enclosure)
    const imageMatch =
      block.match(/<media:content[^>]*url="([^"]*)"[^>]*\/?>/i) ||
      block.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image[^"]*"[^>]*\/?>/i) ||
      block.match(/<media:thumbnail[^>]*url="([^"]*)"[^>]*\/?>/i)
    const imageUrl = imageMatch ? imageMatch[1] : undefined

    // Filter: only items from the last 48 hours
    if (postedAt) {
      const postedDate = new Date(postedAt)
      const cutoff = new Date()
      cutoff.setHours(cutoff.getHours() - 48)
      if (postedDate < cutoff) continue
    }

    items.push({
      sourceId: urlToId(sourceUrl),
      sourceUrl,
      title,
      summary,
      imageUrl,
      postedAt,
    })
  }

  return items
}

/**
 * Fetch and parse a single RSS feed.
 */
async function fetchFeed(config: RssSourceConfig): Promise<RawNewsItem[]> {
  try {
    const response = await fetch(config.feedUrl, {
      headers: { 'User-Agent': 'Toolk1t-AI-Radar/1.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error(`[ai-radar] RSS fetch failed for ${config.source}: ${response.status}`)
      return []
    }

    const xml = await response.text()
    return parseRssFeed(xml, config.source)
  } catch (error) {
    console.error(`[ai-radar] RSS error for ${config.source}:`, error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Collect news items from all configured RSS feeds.
 * Returns items grouped by source for separate ingestion.
 */
export async function collectFromRss(
  sources: RssSourceConfig[],
): Promise<{ source: NewsSource; items: RawNewsItem[] }[]> {
  const results: { source: NewsSource; items: RawNewsItem[] }[] = []

  // Fetch all feeds in parallel
  const promises = sources.map(async (config) => {
    const items = await fetchFeed(config)
    return { source: config.source, items }
  })

  const settled = await Promise.allSettled(promises)
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(result.value)
    }
  }

  return results
}
```

**Step 2: Commit**

```bash
git add lib/ai-news/collectors/rss.ts
git commit -m "feat(ai-radar): add RSS feed collector with XML parsing"
```

---

## Task 9: Community Collectors (HN + Reddit Stubs)

**Files:**
- Create: `lib/ai-news/collectors/hackernews.ts`
- Create: `lib/ai-news/collectors/reddit.ts`

**Step 1: Create Hacker News collector**

Create `lib/ai-news/collectors/hackernews.ts`:

```typescript
import type { RawNewsItem } from './types'

const HN_SEARCH_URL = 'https://hn.algolia.com/api/v1/search_by_date'

/**
 * Collect AI model-related posts from Hacker News via Algolia API.
 * Searches for recent stories about AI model releases.
 */
export async function collectFromHackerNews(): Promise<RawNewsItem[]> {
  const queries = ['AI model release', 'LLM launch', 'new AI model']
  const items: RawNewsItem[] = []
  const seenIds = new Set<string>()

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        query,
        tags: 'story',
        numericFilters: `created_at_i>${Math.floor(Date.now() / 1000) - 48 * 3600}`,
        hitsPerPage: '20',
      })

      const response = await fetch(`${HN_SEARCH_URL}?${params}`, {
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) continue

      const data = await response.json()

      for (const hit of data.hits ?? []) {
        const id = String(hit.objectID)
        if (seenIds.has(id)) continue
        seenIds.add(id)

        const sourceUrl = hit.url || `https://news.ycombinator.com/item?id=${id}`

        items.push({
          sourceId: `hn-${id}`,
          sourceUrl,
          title: hit.title ?? '',
          summary: hit.story_text ? hit.story_text.slice(0, 500) : '',
          postedAt: hit.created_at,
        })
      }
    } catch (error) {
      console.error('[ai-radar] HN search error:', error instanceof Error ? error.message : error)
    }
  }

  return items
}
```

**Step 2: Create Reddit collector (stub)**

Create `lib/ai-news/collectors/reddit.ts`:

```typescript
import type { RawNewsItem } from './types'

/**
 * Collect AI model-related posts from Reddit r/MachineLearning.
 * Uses Reddit's public JSON API (no auth required for public subreddits).
 */
export async function collectFromReddit(): Promise<RawNewsItem[]> {
  try {
    const response = await fetch(
      'https://www.reddit.com/r/MachineLearning/search.json?q=flair%3AResearch+OR+flair%3ANews&sort=new&restrict_sr=on&t=day&limit=25',
      {
        headers: { 'User-Agent': 'Toolk1t-AI-Radar/1.0' },
        signal: AbortSignal.timeout(10000),
      },
    )

    if (!response.ok) {
      console.error(`[ai-radar] Reddit fetch failed: ${response.status}`)
      return []
    }

    const data = await response.json()
    const posts = data?.data?.children ?? []

    return posts.map((post: any) => {
      const d = post.data
      return {
        sourceId: `reddit-${d.id}`,
        sourceUrl: d.url_overridden_by_dest || `https://reddit.com${d.permalink}`,
        title: d.title ?? '',
        summary: d.selftext ? d.selftext.slice(0, 500) : '',
        imageUrl: d.thumbnail && d.thumbnail.startsWith('http') ? d.thumbnail : undefined,
        postedAt: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : undefined,
      }
    })
  } catch (error) {
    console.error('[ai-radar] Reddit error:', error instanceof Error ? error.message : error)
    return []
  }
}
```

**Step 3: Commit**

```bash
git add lib/ai-news/collectors/hackernews.ts lib/ai-news/collectors/reddit.ts
git commit -m "feat(ai-radar): add Hacker News and Reddit collectors"
```

---

## Task 10: Cron Route — Collect AI News (RSS)

**Files:**
- Create: `app/api/cron/collect-ai-news/rss/route.ts`

**Step 1: Create the RSS cron route**

Create `app/api/cron/collect-ai-news/rss/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { collectFromRss } from '@/lib/ai-news/collectors/rss'
import { ingestNewsItems } from '@/lib/ai-news/ingest'
import { RSS_SOURCES } from '@/lib/ai-news/sources'

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[ai-radar] Starting RSS collection...')
    const feedResults = await collectFromRss(RSS_SOURCES)

    const ingestResults = []
    for (const { source, items } of feedResults) {
      const result = await ingestNewsItems(items, source)
      ingestResults.push(result)
      console.log(`[ai-radar] ${source}: ${result.totalCollected} collected, ${result.newInserted} new, ${result.duplicatesSkipped} dupes, ${result.relevantFiltered} irrelevant`)
    }

    const totals = {
      totalCollected: ingestResults.reduce((s, r) => s + r.totalCollected, 0),
      newInserted: ingestResults.reduce((s, r) => s + r.newInserted, 0),
      duplicatesSkipped: ingestResults.reduce((s, r) => s + r.duplicatesSkipped, 0),
      relevantFiltered: ingestResults.reduce((s, r) => s + r.relevantFiltered, 0),
    }

    console.log('[ai-radar] RSS collection complete:', totals)
    return NextResponse.json({ ok: true, ...totals, sources: ingestResults })
  } catch (error) {
    console.error('[ai-radar] RSS collection failed:', error)
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
git add app/api/cron/collect-ai-news/rss/route.ts
git commit -m "feat(ai-radar): add RSS collection cron route"
```

---

## Task 11: Cron Route — Collect AI News (Community)

**Files:**
- Create: `app/api/cron/collect-ai-news/community/route.ts`

**Step 1: Create the community cron route**

Create `app/api/cron/collect-ai-news/community/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { collectFromHackerNews } from '@/lib/ai-news/collectors/hackernews'
import { collectFromReddit } from '@/lib/ai-news/collectors/reddit'
import { ingestNewsItems } from '@/lib/ai-news/ingest'

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[ai-radar] Starting community collection...')

    // Collect from both sources in parallel
    const [hnItems, redditItems] = await Promise.all([
      collectFromHackerNews(),
      collectFromReddit(),
    ])

    const hnResult = await ingestNewsItems(hnItems, 'hackernews')
    const redditResult = await ingestNewsItems(redditItems, 'reddit')

    console.log(`[ai-radar] HN: ${hnResult.totalCollected} collected, ${hnResult.newInserted} new`)
    console.log(`[ai-radar] Reddit: ${redditResult.totalCollected} collected, ${redditResult.newInserted} new`)

    return NextResponse.json({
      ok: true,
      sources: [hnResult, redditResult],
    })
  } catch (error) {
    console.error('[ai-radar] Community collection failed:', error)
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
git add app/api/cron/collect-ai-news/community/route.ts
git commit -m "feat(ai-radar): add community collection cron route (HN + Reddit)"
```

---

## Task 12: Cron Route — Archive AI News

**Files:**
- Create: `app/api/cron/archive-ai-news/route.ts`

**Step 1: Create the archive cron route**

Create `app/api/cron/archive-ai-news/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { archiveOldNews } from '@/lib/ai-news/archive'

const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const archived = await archiveOldNews()
    console.log(`[ai-radar] Archived ${archived} old news items`)
    return NextResponse.json({ ok: true, archived })
  } catch (error) {
    console.error('[ai-radar] Archive failed:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/cron/archive-ai-news/route.ts
git commit -m "feat(ai-radar): add archive cron route for old AI news"
```

---

## Task 13: Update vercel.json with New Cron Schedules

**Files:**
- Modify: `vercel.json`

**Step 1: Add the 3 new cron entries**

Add to the `crons` array in `vercel.json`:

```json
{
  "path": "/api/cron/collect-ai-news/rss",
  "schedule": "0 18 * * *"
},
{
  "path": "/api/cron/collect-ai-news/community",
  "schedule": "15 18 * * *"
},
{
  "path": "/api/cron/archive-ai-news",
  "schedule": "0 20 * * 0"
}
```

Note: 18:00 UTC = 4:00 AM AEST. Sunday archive at 20:00 UTC = 6:00 AM AEST.

**Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat(ai-radar): add cron schedules for AI news collection and archiving"
```

---

## Task 14: Gallery API — List AI News

**Files:**
- Create: `app/api/v1/ai-news/route.ts`

**Step 1: Create the news list API route**

Create `app/api/v1/ai-news/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  category: z.enum(['llms', 'image-video', 'audio-speech', 'code-models', 'multimodal', 'embedding-search', 'robotics-agents']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  days: z.coerce.number().int().min(1).max(90).optional(),
  q: z.string().max(200).optional(),
})

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { category, page, limit, days, q } = parsed.data
  const supabase = getAdminSupabase()
  const offset = (page - 1) * limit

  let query = supabase
    .from('ai_news')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (category) query = query.eq('category', category)

  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('posted_at', since.toISOString())
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,tags.cs.{${q}}`)
  }

  query = query
    .order('posted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[ai-radar] API query error:', error.message)
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
git add app/api/v1/ai-news/route.ts
git commit -m "feat(ai-radar): add paginated AI news list API"
```

---

## Task 15: Gallery API — News Detail

**Files:**
- Create: `app/api/v1/ai-news/[id]/route.ts`

**Step 1: Create the news detail API route**

Create `app/api/v1/ai-news/[id]/route.ts`:

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
    .from('ai_news')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return API_ERRORS.NOT_FOUND('News item')
  }

  return apiSuccess(data)
}
```

**Step 2: Commit**

```bash
git add app/api/v1/ai-news/\[id\]/route.ts
git commit -m "feat(ai-radar): add news detail API endpoint"
```

---

## Task 16: Frontend Types

**Files:**
- Create: `tools/ai-radar/types.ts`

**Step 1: Create frontend types**

Create `tools/ai-radar/types.ts`:

```typescript
export type NewsCategory = 'llms' | 'image-video' | 'audio-speech' | 'code-models' | 'multimodal' | 'embedding-search' | 'robotics-agents'
export type NewsSource = 'techcrunch' | 'theverge' | 'venturebeat' | 'arstechnica' | 'arxiv' | 'huggingface' | 'openai_blog' | 'anthropic_blog' | 'google_blog' | 'meta_blog' | 'hackernews' | 'reddit'

export interface NewsItem {
  id: string
  source: NewsSource
  source_url: string
  title: string
  summary: string
  category: NewsCategory
  model_name: string | null
  provider: string | null
  tags: string[]
  image_url: string | null
  posted_at: string
}

export interface NewsFilters {
  category?: NewsCategory
  page: number
  limit: number
  days?: number
  q?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface NewsResponse {
  data: NewsItem[]
  pagination: PaginationInfo
}

export const SOURCE_LABELS: Record<NewsSource, string> = {
  techcrunch: 'TechCrunch',
  theverge: 'The Verge',
  venturebeat: 'VentureBeat',
  arstechnica: 'Ars Technica',
  arxiv: 'arXiv',
  huggingface: 'Hugging Face',
  openai_blog: 'OpenAI',
  anthropic_blog: 'Anthropic',
  google_blog: 'Google AI',
  meta_blog: 'Meta AI',
  hackernews: 'Hacker News',
  reddit: 'Reddit',
}

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  llms: 'LLMs',
  'image-video': 'Image / Video',
  'audio-speech': 'Audio / Speech',
  'code-models': 'Code Models',
  multimodal: 'Multimodal',
  'embedding-search': 'Embedding / Search',
  'robotics-agents': 'Robotics / Agents',
}

export const CATEGORY_TABS: { label: string; value: NewsCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'LLMs', value: 'llms' },
  { label: 'Image / Video', value: 'image-video' },
  { label: 'Audio / Speech', value: 'audio-speech' },
  { label: 'Code Models', value: 'code-models' },
  { label: 'Multimodal', value: 'multimodal' },
  { label: 'Embedding / Search', value: 'embedding-search' },
  { label: 'Robotics / Agents', value: 'robotics-agents' },
]

export const DAYS_OPTIONS = [
  { label: 'Today', value: 1 },
  { label: 'Last 3 days', value: 3 },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
]
```

**Step 2: Commit**

```bash
git add tools/ai-radar/types.ts
git commit -m "feat(ai-radar): add frontend types and label constants"
```

---

## Task 17: News Card Component

**Files:**
- Create: `tools/ai-radar/news-card.tsx`

**Step 1: Create the news card component**

Create `tools/ai-radar/news-card.tsx`:

```tsx
'use client'

import type { NewsItem } from './types'
import { SOURCE_LABELS } from './types'

interface NewsCardProps {
  item: NewsItem
  onClick: (item: NewsItem) => void
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

export function NewsCard({ item, onClick }: NewsCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="w-full text-left p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[var(--tk-color-primary-500)]/50 hover:shadow-md transition-all cursor-pointer group flex gap-4"
      aria-label={`View details: ${item.title}`}
    >
      {/* Thumbnail */}
      {item.image_url && (
        <div className="hidden sm:block w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <img
            src={item.image_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[var(--tk-color-primary-500)] transition-colors line-clamp-2 mb-1">
          {item.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
          {item.summary}
        </p>

        {/* Footer: model badge + source + date */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.model_name && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-500)]">
              {item.model_name}
            </span>
          )}
          {item.provider && !item.model_name && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              {item.provider}
            </span>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {SOURCE_LABELS[item.source]} · {formatRelativeDate(item.posted_at)}
          </span>
        </div>
      </div>
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add tools/ai-radar/news-card.tsx
git commit -m "feat(ai-radar): add news card component with thumbnail and model badge"
```

---

## Task 18: News Pagination Component

**Files:**
- Create: `tools/ai-radar/news-pagination.tsx`

**Step 1: Create pagination component**

Create `tools/ai-radar/news-pagination.tsx`:

```tsx
'use client'

import type { PaginationInfo } from './types'

interface NewsPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function NewsPagination({ pagination, onPageChange }: NewsPaginationProps) {
  const { page, totalPages, total } = pagination

  if (totalPages <= 1) return null

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
    <nav aria-label="News pagination" className="flex flex-col items-center gap-3 mt-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {total} article{total !== 1 ? 's' : ''} found
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
git add tools/ai-radar/news-pagination.tsx
git commit -m "feat(ai-radar): add news pagination component"
```

---

## Task 19: News Search Bar Component

**Files:**
- Create: `tools/ai-radar/news-search-bar.tsx`

**Step 1: Create search bar component**

Create `tools/ai-radar/news-search-bar.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'

interface NewsSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function NewsSearchBar({ value, onChange }: NewsSearchBarProps) {
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
        placeholder="Search by model name, topic, or keyword..."
        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50 focus:border-transparent transition-all"
        aria-label="Search AI news"
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add tools/ai-radar/news-search-bar.tsx
git commit -m "feat(ai-radar): add debounced search bar component"
```

---

## Task 20: News Detail Modal

**Files:**
- Create: `tools/ai-radar/news-detail-modal.tsx`

**Step 1: Create detail modal component**

Create `tools/ai-radar/news-detail-modal.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import type { NewsItem } from './types'
import { SOURCE_LABELS, CATEGORY_LABELS } from './types'

interface NewsDetailModalProps {
  item: NewsItem | null
  onClose: () => void
}

export function NewsDetailModal({ item, onClose }: NewsDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (item) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [item])

  if (!item) return null

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
              {item.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {SOURCE_LABELS[item.source]} · {new Date(item.posted_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
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
          {/* Thumbnail */}
          {item.image_url && (
            <div className="w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={item.image_url}
                alt=""
                className="w-full h-auto max-h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {item.model_name && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-500)]">
                {item.model_name}
              </span>
            )}
            {item.provider && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                {item.provider}
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Summary</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {item.summary}
            </p>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Topics</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] text-white font-medium text-sm transition-colors"
          >
            Read original on {SOURCE_LABELS[item.source]}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(item.source_url)
            }}
            className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            aria-label="Copy article link"
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
git add tools/ai-radar/news-detail-modal.tsx
git commit -m "feat(ai-radar): add news detail modal with slide-up on mobile"
```

---

## Task 21: News Feed Container

**Files:**
- Create: `tools/ai-radar/news-feed.tsx`

**Step 1: Create the feed container**

Create `tools/ai-radar/news-feed.tsx`:

```tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { NewsItem, NewsFilters, NewsCategory, NewsResponse } from './types'
import { DAYS_OPTIONS } from './types'
import { NewsCard } from './news-card'
import { NewsSearchBar } from './news-search-bar'
import { NewsPagination } from './news-pagination'
import { NewsDetailModal } from './news-detail-modal'

interface NewsFeedProps {
  category: NewsCategory | 'all'
}

type PageState = 'loading' | 'success' | 'error'

function buildFiltersFromParams(params: URLSearchParams, category: NewsCategory | 'all'): NewsFilters {
  return {
    category: category === 'all' ? undefined : category,
    page: Number(params.get('page')) || 1,
    limit: 20,
    days: params.get('days') ? Number(params.get('days')) : undefined,
    q: params.get('q') || undefined,
  }
}

function filtersToParams(filters: NewsFilters, category: NewsCategory | 'all'): URLSearchParams {
  const p = new URLSearchParams()
  p.set('category', category)
  if (filters.page > 1) p.set('page', String(filters.page))
  if (filters.q) p.set('q', filters.q)
  if (filters.days) p.set('days', String(filters.days))
  return p
}

function filtersToApiParams(filters: NewsFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.category) p.set('category', filters.category)
  p.set('page', String(filters.page))
  p.set('limit', String(filters.limit))
  if (filters.days) p.set('days', String(filters.days))
  if (filters.q) p.set('q', filters.q)
  return p
}

export function NewsFeed({ category }: NewsFeedProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filters, setFilters] = useState<NewsFilters>(() =>
    buildFiltersFromParams(searchParams, category),
  )
  const [state, setState] = useState<PageState>('loading')
  const [response, setResponse] = useState<NewsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null)

  // Re-sync category when tab changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: category === 'all' ? undefined : category,
      page: 1,
    }))
  }, [category])

  const fetchNews = useCallback(async (f: NewsFilters) => {
    setState('loading')
    setError(null)

    const params = filtersToApiParams(f)

    try {
      const res = await fetch(`/api/v1/ai-news?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || `Request failed (${res.status})`)
      }

      setResponse(json.data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
      setState('error')
    }
  }, [])

  // Fetch on filter change
  useEffect(() => {
    fetchNews(filters)
    const params = filtersToParams(filters, category)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [filters, fetchNews, router, category])

  const updateFilters = (updates: Partial<NewsFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + days filter row */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <NewsSearchBar
            value={filters.q ?? ''}
            onChange={(q) => updateFilters({ q: q || undefined, page: 1 })}
          />
        </div>
        <select
          value={filters.days?.toString() ?? ''}
          onChange={(e) => updateFilters({ days: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          className="h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50 shrink-0"
          aria-label="Filter by time range"
        >
          <option value="">All time</option>
          {DAYS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {state === 'error' && (
        <div className="p-6 text-center rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            type="button"
            onClick={() => fetchNews(filters)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {state === 'success' && response && (
        <>
          {response.data.length === 0 ? (
            <div className="p-10 text-center rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">No AI news found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {response.data.map((item) => (
                <NewsCard key={item.id} item={item} onClick={setSelectedItem} />
              ))}
            </div>
          )}
          <NewsPagination
            pagination={response.pagination}
            onPageChange={(page) => updateFilters({ page })}
          />
        </>
      )}

      <NewsDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add tools/ai-radar/news-feed.tsx
git commit -m "feat(ai-radar): add news feed container with data fetching and URL state sync"
```

---

## Task 22: AI Radar Page Shell with Tabs

**Files:**
- Create: `tools/ai-radar/ai-radar-page.tsx`

**Step 1: Create the page shell with scrollable tabs**

Create `tools/ai-radar/ai-radar-page.tsx`:

```tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { NewsCategory } from './types'
import { CATEGORY_TABS } from './types'
import { NewsFeed } from './news-feed'

function AiRadarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeCategory = (searchParams.get('category') as NewsCategory | 'all') || 'all'

  const switchTab = (value: NewsCategory | 'all') => {
    router.replace(`?category=${value}`, { scroll: false })
  }

  return (
    <>
      {/* Scrollable tabs */}
      <div className="overflow-x-auto -mx-4 px-4 pb-1">
        <div role="tablist" aria-label="AI news categories" className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              type="button"
              aria-selected={activeCategory === tab.value}
              onClick={() => switchTab(tab.value)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === tab.value
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <NewsFeed category={activeCategory} />
    </>
  )
}

export function AiRadarPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-11 w-full max-w-lg rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <AiRadarContent />
    </Suspense>
  )
}
```

**Step 2: Commit**

```bash
git add tools/ai-radar/ai-radar-page.tsx
git commit -m "feat(ai-radar): add page shell with scrollable category tabs"
```

---

## Task 23: Tool Page Route

**Files:**
- Create: `app/tools/ai-radar/page.tsx`

**Step 1: Create the page route**

Create `app/tools/ai-radar/page.tsx`:

```tsx
import { AiRadarPage } from '@/tools/ai-radar/ai-radar-page'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'

export const metadata = {
  title: 'AI Radar — Latest AI Model Releases & Updates | Toolk1t',
  description: 'Track new AI model releases, major updates, and capabilities. Coverage of LLMs, image/video generation, audio, code models, and more — updated daily.',
}

export default function Page() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        <ToolBreadcrumb toolName="AI Radar" toolSlug="ai-radar" />

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            AI Radar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New AI model releases and major updates — updated daily
          </p>
        </div>

        <AiRadarPage />
      </div>
    </main>
  )
}
```

**Step 2: Verify the page loads**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/ai-radar`
Expected: Page loads with tabs, search bar, days dropdown, and empty state ("No AI news found matching your search.")

**Step 3: Commit**

```bash
git add app/tools/ai-radar/page.tsx
git commit -m "feat(ai-radar): add tool page route with metadata"
```

---

## Task 24: Seed Data for Local Testing

**Files:**
- Create: `supabase/seed/ai-news-seed.sql`

**Step 1: Create seed data**

Create `supabase/seed/ai-news-seed.sql`:

```sql
-- Seed data for AI Radar local testing
INSERT INTO public.ai_news (source, source_id, source_url, title, title_normalised, summary, category, model_name, provider, tags, image_url, posted_at, scraped_at)
VALUES
  ('openai_blog', 'oai-001', 'https://openai.com/blog/gpt-5', 'Introducing GPT-5: A New Frontier in Reasoning', 'introducing gpt5 a new frontier in reasoning', 'OpenAI has released GPT-5, its most capable language model yet. The model demonstrates significant improvements in multi-step reasoning, code generation, and mathematical problem solving.', 'llms', 'GPT-5', 'OpenAI', ARRAY['reasoning', 'benchmark', 'api'], 'https://openai.com/content/images/gpt5.jpg', now() - interval '1 day', now()),

  ('anthropic_blog', 'ant-001', 'https://anthropic.com/research/claude-4', 'Claude 4: Extended Thinking and Tool Use', 'claude 4 extended thinking and tool use', 'Anthropic announces Claude 4 with breakthrough extended thinking capabilities. The model can now reason through complex problems step-by-step and use tools more effectively than any previous version.', 'llms', 'Claude 4', 'Anthropic', ARRAY['reasoning', 'safety', 'api'], NULL, now() - interval '2 days', now()),

  ('techcrunch', 'tc-001', 'https://techcrunch.com/2026/03/15/stable-diffusion-4', 'Stable Diffusion 4 Brings Photorealistic Quality to Open Source', 'stable diffusion 4 brings photorealistic quality to open source', 'Stability AI releases Stable Diffusion 4 with unprecedented photorealistic image quality. The open-source model rivals commercial offerings like DALL-E and Midjourney.', 'image-video', 'Stable Diffusion 4', 'Stability AI', ARRAY['open-source', 'benchmark'], 'https://techcrunch.com/images/sd4.jpg', now() - interval '3 days', now()),

  ('google_blog', 'goo-001', 'https://blog.google/technology/ai/gemini-3', 'Gemini 3: Native Multimodal Understanding', 'gemini 3 native multimodal understanding', 'Google DeepMind unveils Gemini 3 with native multimodal understanding across text, images, video, and audio. The model processes all modalities in a unified architecture.', 'multimodal', 'Gemini 3', 'Google', ARRAY['multimodal', 'vision', 'audio', 'benchmark'], NULL, now() - interval '1 day', now()),

  ('huggingface', 'hf-001', 'https://huggingface.co/blog/starcoder-3', 'StarCoder 3: The Best Open-Source Code Model', 'starcoder 3 the best open source code model', 'Hugging Face and ServiceNow release StarCoder 3, trained on 1T tokens of code. It outperforms GPT-4 on HumanEval and supports 80+ programming languages.', 'code-models', 'StarCoder 3', 'Hugging Face', ARRAY['open-source', 'code', 'benchmark'], NULL, now() - interval '4 days', now()),

  ('meta_blog', 'meta-001', 'https://ai.meta.com/blog/llama-4', 'Llama 4: Open Foundation Model with 400B Parameters', 'llama 4 open foundation model with 400b parameters', 'Meta releases Llama 4, its largest open-source language model with 400B parameters. Available for research and commercial use under a permissive license.', 'llms', 'Llama 4', 'Meta', ARRAY['open-source', 'research', 'fine-tuning'], NULL, now() - interval '5 days', now()),

  ('theverge', 'tv-001', 'https://theverge.com/2026/3/14/openai-whisper-v4', 'OpenAI Whisper v4 Achieves Near-Human Transcription Accuracy', 'openai whisper v4 achieves nearhuman transcription accuracy', 'The latest Whisper model from OpenAI matches human transcription accuracy across 57 languages. It also adds real-time streaming support and speaker diarization.', 'audio-speech', 'Whisper v4', 'OpenAI', ARRAY['audio', 'open-source', 'api'], NULL, now() - interval '6 days', now()),

  ('arxiv', 'arxiv-001', 'https://arxiv.org/abs/2026.12345', 'BERT-XL: Universal Text Embeddings at Scale', 'bertxl universal text embeddings at scale', 'Researchers introduce BERT-XL, a new embedding model that achieves state-of-the-art performance on MTEB benchmarks. The model supports 8192 token context and produces 1024-dimensional embeddings.', 'embedding-search', 'BERT-XL', NULL, ARRAY['embedding', 'research', 'benchmark'], NULL, now() - interval '7 days', now()),

  ('hackernews', 'hn-001', 'https://news.ycombinator.com/item?id=99999', 'Boston Dynamics Unveils AI-Powered Autonomous Robot With GPT Integration', 'boston dynamics unveils aipowered autonomous robot with gpt integration', 'Boston Dynamics demonstrates a new autonomous robot powered by GPT-5 for natural language task planning. The robot can understand verbal instructions and plan complex manipulation sequences.', 'robotics-agents', NULL, NULL, ARRAY['robot', 'autonomous', 'reasoning'], NULL, now() - interval '2 days', now()),

  ('reddit', 'reddit-001', 'https://reddit.com/r/MachineLearning/comments/abc123', 'Sora 2.0: 4K Video Generation With Consistent Characters', 'sora 20 4k video generation with consistent characters', 'OpenAI releases Sora 2.0 with support for 4K resolution video generation up to 2 minutes. The model maintains character consistency across scenes and supports text-guided editing.', 'image-video', 'Sora 2.0', 'OpenAI', ARRAY['video', 'api', 'benchmark'], NULL, now() - interval '3 days', now());
```

**Step 2: Apply seed data**

Run: `pnpm supabase:reset`
Or: `psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed/ai-news-seed.sql`

**Step 3: Verify the gallery shows data**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/ai-radar`
Expected: "All" tab shows 10 items. Each category tab shows its relevant items. Search, pagination, and detail modal all work.

**Step 4: Commit**

```bash
git add supabase/seed/ai-news-seed.sql
git commit -m "feat(ai-radar): add seed data for local testing"
```

---

## Summary of All Tasks

| # | Task | Key Files |
|---|---|---|
| 1 | DB migration | `supabase/migrations/024_ai_news.sql` |
| 2 | Shared types + sources config | `lib/ai-news/collectors/types.ts`, `lib/ai-news/sources.ts` |
| 3 | Relevance filter + categorise | `lib/ai-news/filter.ts`, `lib/ai-news/categorise.ts` |
| 4 | Model name + provider extraction | `lib/ai-news/extract.ts` |
| 5 | Normalise + dedup | `lib/ai-news/normalise.ts`, `lib/ai-news/dedup.ts` |
| 6 | Ingestion pipeline | `lib/ai-news/ingest.ts` |
| 7 | Archive logic | `lib/ai-news/archive.ts` |
| 8 | RSS collector | `lib/ai-news/collectors/rss.ts` |
| 9 | Community collectors (HN + Reddit) | `lib/ai-news/collectors/hackernews.ts`, `lib/ai-news/collectors/reddit.ts` |
| 10 | Cron: collect RSS | `app/api/cron/collect-ai-news/rss/route.ts` |
| 11 | Cron: collect community | `app/api/cron/collect-ai-news/community/route.ts` |
| 12 | Cron: archive | `app/api/cron/archive-ai-news/route.ts` |
| 13 | Vercel cron config | `vercel.json` |
| 14 | API: list AI news | `app/api/v1/ai-news/route.ts` |
| 15 | API: news detail | `app/api/v1/ai-news/[id]/route.ts` |
| 16 | Frontend types | `tools/ai-radar/types.ts` |
| 17 | News card | `tools/ai-radar/news-card.tsx` |
| 18 | Pagination | `tools/ai-radar/news-pagination.tsx` |
| 19 | Search bar | `tools/ai-radar/news-search-bar.tsx` |
| 20 | Detail modal | `tools/ai-radar/news-detail-modal.tsx` |
| 21 | Feed container | `tools/ai-radar/news-feed.tsx` |
| 22 | Page shell + tabs | `tools/ai-radar/ai-radar-page.tsx` |
| 23 | Tool page route | `app/tools/ai-radar/page.tsx` |
| 24 | Seed data | `supabase/seed/ai-news-seed.sql` |
