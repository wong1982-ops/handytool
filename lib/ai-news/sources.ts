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
