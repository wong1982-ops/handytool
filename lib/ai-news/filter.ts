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
