import { NextRequest, NextResponse } from 'next/server'
import { triggerNextStep, triggerTtsBatch, type PipelineStep } from '@/lib/story/queue'

const CRON_SECRET = process.env.CRON_SECRET || ''

// Build admin client inline — avoid importing getAdminSupabase which fails without service role key
function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js')

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceKey || !url) {
    return null // Can't create admin client without service role key
  }

  return createClient(url, serviceKey)
}

/**
 * GET /api/cron/process-jobs — Safety net cron (runs every 1 minute).
 * Picks up stuck jobs (status=running, no update for >2 min) and re-triggers
 * their current step.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel Cron sends it as Authorization header)
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    // No service role key — skip gracefully
    console.warn('[cron] SUPABASE_SERVICE_ROLE_KEY not set — skipping job processing')
    return NextResponse.json({ ok: true, processed: 0, skipped: true, reason: 'No service role key configured' })
  }

  // Find stuck jobs: running but no update for >2 minutes
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

  const { data: stuckJobs, error } = await supabase
    .from('book_jobs')
    .select('id, current_step, total_pages, state, retry_count')
    .eq('status', 'running')
    .lt('updated_at', twoMinAgo)
    .limit(10)

  if (error) {
    console.error('[cron] Failed to query stuck jobs:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  if (!stuckJobs?.length) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  let processed = 0

  for (const job of stuckJobs) {
    const step = job.current_step as PipelineStep

    // Determine params for page-based steps
    let stepParams: Record<string, string> | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = job.state as any

    if (step === 'illustrate_page') {
      const completedPages = (state?.pages as unknown[])?.length ?? 0
      const nextPage = completedPages + 1
      if (nextPage <= job.total_pages) {
        stepParams = { page: String(nextPage) }
      } else {
        // All pages done, trigger TTS batch
        triggerTtsBatch(job.id, job.total_pages)
        processed++
        continue
      }
    } else if (step === 'tts_page') {
      const completedAudio = (state?.audio as unknown[])?.length ?? 0
      if (completedAudio >= job.total_pages) {
        // All TTS done, trigger save
        triggerNextStep(job.id, 'save')
        processed++
        continue
      }
      // Find missing TTS page and re-trigger it
      const doneSeqs = new Set((state?.audio as { seq: number }[])?.map(a => a.seq) ?? [])
      for (let p = 1; p <= job.total_pages; p++) {
        if (!doneSeqs.has(p)) {
          triggerNextStep(job.id, 'tts_page', { page: String(p) })
        }
      }
      processed++
      continue
    }

    // Touch updated_at to prevent re-triggering within 2 min
    await supabase
      .from('book_jobs')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', job.id)

    triggerNextStep(job.id, step, stepParams)
    processed++

    console.log(`[cron] Re-triggered stuck job ${job.id} at step ${step}`)
  }

  // Also find scheduled jobs that never started (safety net)
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: scheduledJobs } = await supabase
    .from('book_jobs')
    .select('id, current_step')
    .eq('status', 'scheduled')
    .lt('created_at', fiveMinAgo)
    .limit(5)

  if (scheduledJobs?.length) {
    for (const job of scheduledJobs) {
      triggerNextStep(job.id, job.current_step as PipelineStep)
      processed++
      console.log(`[cron] Kicked off scheduled job ${job.id}`)
    }
  }

  return NextResponse.json({ ok: true, processed })
}
