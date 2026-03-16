/**
 * In-house job queue orchestration for Story Studio background generation.
 *
 * Each step route completes work → writes state to `book_jobs` via RPC →
 * fires a fetch() to the next step route (fire-and-forget).
 *
 * Vercel Cron `/api/cron/process-jobs` runs every 1 min as safety net
 * to pick up stuck jobs.
 */

const CRON_SECRET = process.env.CRON_SECRET || ''
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

/** All steps in the generation pipeline, in order. */
export const PIPELINE_STEPS = [
  'story_bible',
  'story_draft',
  'validate',
  'character_ref',
  'cover',
  'illustrate_page', // repeated per page (page=1..N)
  'tts_page',        // repeated per page (page=1..N), runs in parallel
  'save',
] as const

export type PipelineStep = (typeof PIPELINE_STEPS)[number]

/** Map step name → API route path segment */
const STEP_ROUTES: Record<string, string> = {
  story_bible: 'story-bible',
  story_draft: 'story-draft',
  validate: 'validate',
  character_ref: 'character-ref',
  cover: 'cover',
  illustrate_page: 'illustrate-page',
  tts_page: 'tts-page',
  save: 'save',
}

export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Build the URL for a step route.
 */
function buildStepUrl(
  jobId: string,
  step: PipelineStep,
  params?: Record<string, string>,
): string | null {
  const routeSegment = STEP_ROUTES[step]
  if (!routeSegment) {
    console.error(`[queue] Unknown step: ${step}`)
    return null
  }

  const url = new URL(`/api/v1/story/jobs/${jobId}/${routeSegment}`, APP_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }
  return url.toString()
}

/**
 * Fetch a step route.
 * Returns a promise that resolves when the step HTTP call completes.
 */
function fetchStep(
  url: string,
  jobId: string,
  step: PipelineStep,
): Promise<void> {
  // Illustration and TTS steps can take several minutes — extend the timeout
  // to avoid undici HeadersTimeoutError killing the chain.
  const timeoutMs = step === 'illustrate_page' || step === 'tts_page' || step === 'character_ref' || step === 'cover'
    ? 5 * 60_000  // 5 minutes for image/audio generation
    : 2 * 60_000  // 2 minutes for text steps

  return fetch(url, {
    method: 'POST',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(timeoutMs),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[queue] Step ${step} for job ${jobId} returned ${res.status}`)
      }
    })
    .catch((err) => {
      console.error(`[queue] Failed to trigger ${step} for job ${jobId}:`, err)
    })
}

/**
 * Trigger the next step route.
 *
 * - Production: fire-and-forget (non-blocking).
 * - Development: returns a Promise so the caller (withJobStep) can await it,
 *   serializing requests to avoid Turbopack concurrent compilation crashes.
 */
export function triggerNextStep(
  jobId: string,
  step: PipelineStep,
  params?: Record<string, string>,
): Promise<void> | void {
  const url = buildStepUrl(jobId, step, params)
  if (!url) return

  console.log(`[queue] Triggering step: ${step} for job ${jobId}`)

  if (IS_DEV) {
    // Dev: return the promise so withJobStep can await it
    return fetchStep(url, jobId, step)
  }

  // Production: fire-and-forget
  fetchStep(url, jobId, step)
}

/**
 * Trigger TTS pages.
 *
 * - Production: all pages fired in parallel (batch fire-and-forget).
 * - Development: triggers page 1 only — each tts-page step chains to the next.
 *   Returns a Promise so withJobStep can await it.
 */
export function triggerTtsBatch(
  jobId: string,
  totalPages: number,
): Promise<void> | void {
  if (IS_DEV) {
    // Sequential: trigger page 1 only — each tts-page step will trigger the next
    return triggerNextStep(jobId, 'tts_page', { page: '1' })
  }

  // Production: parallel fire-and-forget
  for (let page = 1; page <= totalPages; page++) {
    triggerNextStep(jobId, 'tts_page', { page: String(page) })
  }
}

/**
 * Verify that an incoming request has the correct CRON_SECRET header.
 * Used by all step routes to authenticate internal requests.
 */
export function verifyCronSecret(request: Request): boolean {
  const secret = request.headers.get('x-cron-secret')
  if (!CRON_SECRET) {
    // In development without CRON_SECRET set, allow all requests
    console.warn('[queue] CRON_SECRET not set — allowing request in dev mode')
    return true
  }
  return secret === CRON_SECRET
}

/**
 * Determine the next step in the pipeline after a given step completes.
 *
 * For illustrate_page: if more pages remain, return illustrate_page with next page number.
 *   When all pages are done, trigger TTS batch (returns null — caller handles batch).
 * For tts_page: if all TTS pages are done, return 'save'. Otherwise null (more TTS pending).
 */
export function getNextStep(
  currentStep: PipelineStep,
  context: {
    totalPages: number
    currentPage?: number         // for illustrate_page / tts_page
    completedTtsCount?: number   // for tts_page: how many TTS are done (including this one)
    skipIllustration?: boolean   // skip illustrate_page steps (keep character_ref + cover)
    skipAudio?: boolean          // skip tts_page steps
    mode?: 'speed' | 'professional'  // speed mode skips validate, character_ref, illustration, TTS
  },
): { step: PipelineStep; params?: Record<string, string> } | 'tts_batch' | null {
  switch (currentStep) {
    case 'story_bible':
      return { step: 'story_draft' }

    case 'story_draft':
      if (context.mode === 'speed') return { step: 'cover' }
      return { step: 'validate' }

    case 'validate':
      if (context.skipIllustration) {
        // Skip all image generation — go straight to TTS or save
        return context.skipAudio ? { step: 'save' } : 'tts_batch'
      }
      return { step: 'character_ref' }

    case 'character_ref':
      return { step: 'cover' }

    case 'cover':
      if (context.mode === 'speed') return { step: 'save' }
      // Start sequential illustration chain with page 1
      return { step: 'illustrate_page', params: { page: '1' } }

    case 'illustrate_page': {
      const nextPage = (context.currentPage ?? 0) + 1
      if (nextPage <= context.totalPages) {
        return { step: 'illustrate_page', params: { page: String(nextPage) } }
      }
      // All pages illustrated → trigger TTS batch (or skip to save)
      if (context.skipAudio) return { step: 'save' }
      return 'tts_batch'
    }

    case 'tts_page': {
      const done = context.completedTtsCount ?? 0
      if (done >= context.totalPages) {
        return { step: 'save' }
      }
      // More TTS pages pending — don't trigger anything (they're already running)
      return null
    }

    case 'save':
      return null // Pipeline complete

    default:
      return null
  }
}

/** Human-readable label for a step (used in progress UI). */
export function getStepLabel(step: string, currentPage?: number, totalPages?: number): string {
  switch (step) {
    case 'story_bible': return 'Building story foundation...'
    case 'story_draft': return 'Writing your story...'
    case 'validate': return 'Reviewing for consistency...'
    case 'character_ref': return 'Creating character reference...'
    case 'cover': return 'Illustrating cover...'
    case 'illustrate_page':
      return currentPage && totalPages
        ? `Illustrating page ${currentPage} of ${totalPages}...`
        : 'Illustrating pages...'
    case 'tts_page':
      return currentPage && totalPages
        ? `Recording narration ${currentPage} of ${totalPages}...`
        : 'Recording narration...'
    case 'save': return 'Saving your book...'
    case 'done': return 'Complete!'
    default: return 'Processing...'
  }
}
