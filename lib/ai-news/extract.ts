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
