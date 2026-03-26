/**
 * Shared fetch utility with retry and exponential backoff.
 */

interface FetchWithRetryOptions {
  /** Label for log messages */
  label: string
  /** Request init options */
  init?: RequestInit
  /** Max retries (default: 3) */
  maxRetries?: number
  /** Base delay in ms (default: 1000) */
  baseDelay?: number
  /** Timeout in ms (default: 10000) */
  timeout?: number
}

/**
 * Fetch with retry and exponential backoff.
 * Retries on network errors, timeouts, and 5xx status codes.
 * Does NOT retry on 4xx client errors.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions,
): Promise<Response | null> {
  const { label, init, maxRetries = 3, baseDelay = 1000, timeout = 10000 } = options

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeout),
      })

      // Don't retry on 4xx client errors
      if (response.status >= 400 && response.status < 500) {
        console.error(`[ai-radar] ${label}: client error ${response.status}, not retrying`)
        return null
      }

      // Retry on 5xx server errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.warn(`[ai-radar] Retrying ${label} (attempt ${attempt}/${maxRetries})...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error(`[ai-radar] ${label} failed after ${maxRetries} attempts: ${msg}`)
        return null
      }
    }
  }

  return null
}
