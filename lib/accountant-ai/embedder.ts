/**
 * Embedding wrapper for Gemini text-embedding-004.
 * Batches requests in groups of 50 to stay within API limits.
 */

const GEMINI_EMBED_MODEL = 'text-embedding-004'
const BATCH_SIZE = 50

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('Missing GEMINI_API_KEY environment variable')
  }
  return key
}

interface EmbedRequest {
  model: string
  content: { parts: Array<{ text: string }> }
}

interface BatchEmbedResponse {
  embeddings: Array<{ values: number[] }>
}

async function batchEmbed(texts: string[]): Promise<number[][]> {
  const apiKey = getApiKey()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:batchEmbedContents?key=${apiKey}`

  const requests: EmbedRequest[] = texts.map((text) => ({
    model: `models/${GEMINI_EMBED_MODEL}`,
    content: { parts: [{ text }] },
  }))

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
    signal: AbortSignal.timeout(60_000),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini embed API error ${response.status}: ${body}`)
  }

  const data: BatchEmbedResponse = await response.json()
  return data.embeddings.map((e) => e.values)
}

/**
 * Embeds an array of texts using Gemini text-embedding-004.
 * Processes in batches of 50 to respect API limits.
 * Returns a parallel array of embedding vectors.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const embeddings = await batchEmbed(batch)
    results.push(...embeddings)
  }

  return results
}

/**
 * Embeds a single query string.
 * Returns a single embedding vector.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text])
  return embedding
}
