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

/**
 * Fire-and-forget trigger to the next step route.
 * Uses waitUntil-style: we don't await the response — the step route
 * will read job state from DB and proceed independently.
 */
export function triggerNextStep(
  jobId: string,
  step: PipelineStep,
  params?: Record<string, string>,
): void {
  const routeSegment = STEP_ROUTES[step]
  if (!routeSegment) {
    console.error(`[queue] Unknown step: ${step}`)
    return
  }

  const url = new URL(`/api/v1/story/jobs/${jobId}/${routeSegment}`, APP_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  console.log(`[queue] Triggering step: ${step} for job ${jobId}`)

  // Fire-and-forget — we intentionally don't await this
  fetch(url.toString(), {
    method: 'POST',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'Content-Type': 'application/json',
    },
  }).catch((err) => {
    // Log but don't throw — the cron safety net will pick it up
    console.error(`[queue] Failed to trigger ${step} for job ${jobId}:`, err)
  })
}

/**
 * Trigger multiple TTS pages in parallel (batch fire-and-forget).
 * Called after the last illustration page completes.
 */
export function triggerTtsBatch(jobId: string, totalPages: number): void {
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
  },
): { step: PipelineStep; params?: Record<string, string> } | 'tts_batch' | null {
  switch (currentStep) {
    case 'story_bible':
      return { step: 'story_draft' }

    case 'story_draft':
      return { step: 'validate' }

    case 'validate':
      return { step: 'character_ref' }

    case 'character_ref':
      return { step: 'cover' }

    case 'cover':
      // Start sequential illustration chain with page 1
      return { step: 'illustrate_page', params: { page: '1' } }

    case 'illustrate_page': {
      const nextPage = (context.currentPage ?? 0) + 1
      if (nextPage <= context.totalPages) {
        return { step: 'illustrate_page', params: { page: String(nextPage) } }
      }
      // All pages illustrated → trigger TTS batch
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
