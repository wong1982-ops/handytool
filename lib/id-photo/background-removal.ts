/**
 * Background removal using Replicate API (lucataco/remove-bg model).
 * Adapted from media-agent project's proven implementation.
 */

const REMOVE_BG_MODEL_VERSION = '95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseOutput(output: unknown): string {
  if (typeof output === 'string') return output
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0]
  if (output && typeof output === 'object' && 'output' in output) {
    return String((output as { output: unknown }).output)
  }
  throw new Error('Unexpected Replicate output format')
}

/**
 * Remove background from an image using Replicate API.
 * Returns the URL of the background-removed image.
 *
 * @param imageUrl - Public URL or base64 data URL of the image
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    console.warn('[id-photo] REPLICATE_API_TOKEN not set — skipping background removal')
    return ''
  }

  const MAX_RETRIES = 2
  const BASE_DELAY_MS = 1000
  const MAX_DELAY_MS = 12000

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'wait', // Synchronous mode — blocks until result ready
        },
        body: JSON.stringify({
          version: REMOVE_BG_MODEL_VERSION,
          input: { image: imageUrl },
        }),
        signal: AbortSignal.timeout(120_000), // 2-minute timeout
      })

      // Retry on rate limit or temporary server errors
      if (res.status === 429 || res.status === 503) {
        if (attempt === MAX_RETRIES) throw new Error(`Replicate API error: ${res.status}`)
        const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS)
        await sleep(delay)
        continue
      }

      if (!res.ok) {
        throw new Error(`Replicate API error: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      if (data.status === 'failed' || data.status === 'canceled') {
        throw new Error(`Prediction ${data.status}: ${data.error ?? 'Unknown error'}`)
      }

      const resultUrl = parseOutput(data.output)
      if (!resultUrl.startsWith('http')) {
        throw new Error(`Invalid URL from Replicate: ${resultUrl.slice(0, 100)}`)
      }
      return resultUrl
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const isNetworkError =
        lastError.name === 'AbortError' ||
        lastError.name === 'TypeError' ||
        lastError.message.includes('ECONNRESET')
      if (!isNetworkError || attempt === MAX_RETRIES) throw lastError
      await sleep(Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS))
    }
  }

  throw lastError ?? new Error('Failed to remove background')
}
