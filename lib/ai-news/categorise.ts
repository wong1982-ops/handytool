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
