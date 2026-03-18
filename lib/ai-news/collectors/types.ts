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
