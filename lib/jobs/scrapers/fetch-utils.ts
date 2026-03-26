/**
 * Shared fetch utility with retry and exponential backoff for job scrapers.
 */

interface FetchWithRetryOptions extends RequestInit {
  /** Timeout per request in ms (default: 10000) */
  timeoutMs?: number
}

/**
 * Fetch with retry on transient errors.
 * - Retries on timeout, network error, 5xx
 * - Does NOT retry on 4xx (client errors)
 * - Exponential backoff: 1s, 2s, 4s
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
  maxRetries = 3,
): Promise<Response> {
  const { timeoutMs = 10_000, ...fetchOptions } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      // Don't retry on 4xx client errors
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      // Retry on 5xx server errors
      if (response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
          console.warn(
            `[fetch-retry] ${response.status} for ${url}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
          )
          await sleep(delay)
          continue
        }
        return response
      }

      return response
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      // Retry on network/timeout errors
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        console.warn(
          `[fetch-retry] ${lastError.message} for ${url}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
        )
        await sleep(delay)
        continue
      }
    }
  }

  throw lastError ?? new Error(`fetchWithRetry failed after ${maxRetries} attempts`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
