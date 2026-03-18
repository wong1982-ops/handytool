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
