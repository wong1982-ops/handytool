/**
 * Embedding wrapper for Gemini gemini-embedding-001.
 * Uses embedContent API (single text per call), batched sequentially.
 */

const GEMINI_EMBED_MODEL = 'gemini-embedding-001'
const BATCH_SIZE = 20 // sequential calls, keep reasonable

function getApiKey(): string {
  const key = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
  if (!key) throw new Error('Missing GEMINI_API_KEY environment variable')
  return key
}

async function embedSingle(text: string, apiKey: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:embedContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini embed API error ${response.status}: ${body.slice(0, 200)}`)
  }

  const data = await response.json()
  return data.embedding?.values || []
}

/**
 * Embeds an array of texts using Gemini embedding model.
 * Processes sequentially in batches.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const apiKey = getApiKey()
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(
      batch.map(text => embedSingle(text, apiKey))
    )
    results.push(...batchResults)
    console.log(`[embedder] Embedded ${results.length}/${texts.length}`)
  }

  return results
}

/**
 * Embeds a single query string.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const apiKey = getApiKey()
  return embedSingle(text, apiKey)
}
