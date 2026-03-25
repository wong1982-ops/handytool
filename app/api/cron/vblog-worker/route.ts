import { NextRequest, NextResponse } from 'next/server'
import { PIPELINE_STEPS, PROCESSING_SERVER_URL } from '@/tools/vblog/types'
import type { PipelineStep, JobSteps, JobArtifacts, ScriptData } from '@/tools/vblog/types'
import { generateScript } from '@/lib/vblog/script-generator'
import { generateVoiceover } from '@/lib/vblog/voice-generator'
import { uploadToR2 } from '@/lib/storage/r2'
import { tools } from '@/lib/tools'

const CRON_SECRET = process.env.CRON_SECRET || ''

// Build admin client inline — same pattern as process-jobs
function getSupabaseAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js')

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceKey || !url) {
    return null
  }

  return createClient(url, serviceKey)
}

interface VBlogJobRow {
  id: string
  tool_slug: string
  tool_name: string
  script_style: string
  voice_type: 'clone' | 'ai'
  voice_id: string | null
  target_duration: number
  status: string
  current_step: string | null
  steps: JobSteps
  artifacts: JobArtifacts
  script_data: ScriptData | null
  error: string | null
}

/**
 * GET /api/cron/vblog-worker — Pipeline worker triggered by Vercel Cron.
 * Picks up pending/processing vblog jobs, executes the next pending step.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && cronSecret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  if (!supabase) {
    console.warn('[vblog-worker] SUPABASE_SERVICE_ROLE_KEY not set — skipping')
    return NextResponse.json({ ok: true, processed: 0, skipped: true, reason: 'No service role key configured' })
  }

  // Fetch pending/processing jobs
  const { data: jobs, error } = await supabase
    .from('vblog_jobs')
    .select('id, tool_slug, tool_name, script_style, voice_type, voice_id, target_duration, status, current_step, steps, artifacts, script_data, error')
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: true })
    .limit(5)

  if (error) {
    console.error('[vblog-worker] Failed to query jobs:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  if (!jobs?.length) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  let processed = 0

  for (const job of jobs as VBlogJobRow[]) {
    // Find the next pending step
    const nextStep = PIPELINE_STEPS.find((step) => job.steps[step] === 'pending')

    if (!nextStep) {
      // All steps done — mark complete
      await supabase
        .from('vblog_jobs')
        .update({ status: 'complete', updated_at: new Date().toISOString() })
        .eq('id', job.id)
      processed++
      continue
    }

    // Mark step as running and job as processing
    const updatedSteps = { ...job.steps, [nextStep]: 'running' }
    await supabase
      .from('vblog_jobs')
      .update({
        status: 'processing',
        current_step: nextStep,
        steps: updatedSteps,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    try {
      const result = await executeStep(nextStep, job)

      // Mark step as done and update artifacts
      const doneSteps = { ...updatedSteps, [nextStep]: 'done' }
      const mergedArtifacts = { ...job.artifacts, ...result.artifacts }

      // Check if all steps are now done
      const allDone = PIPELINE_STEPS.every((s) => (s === nextStep ? true : doneSteps[s] === 'done'))

      await supabase
        .from('vblog_jobs')
        .update({
          status: allDone ? 'complete' : 'processing',
          current_step: allDone ? null : nextStep,
          steps: doneSteps,
          artifacts: mergedArtifacts,
          ...(result.scriptData ? { script_data: result.scriptData } : {}),
          error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      console.log(`[vblog-worker] Job ${job.id} step ${nextStep} done`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      const failedSteps = { ...updatedSteps, [nextStep]: 'failed' }

      await supabase
        .from('vblog_jobs')
        .update({
          status: 'failed',
          steps: failedSteps,
          error: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      console.error(`[vblog-worker] Job ${job.id} step ${nextStep} failed:`, message)
    }

    processed++
  }

  return NextResponse.json({ ok: true, processed })
}

// ---------- Step execution ----------

interface StepResult {
  artifacts: Partial<JobArtifacts>
  scriptData?: ScriptData
}

async function executeStep(step: PipelineStep, job: VBlogJobRow): Promise<StepResult> {
  switch (step) {
    case 'script':
      return executeScript(job)
    case 'voice':
      return executeVoice(job)
    case 'assets':
      return executeAssets(job)
    case 'record':
      return dispatchToServer('/record', {
        jobId: job.id,
        toolUrl: `https://toolk1t.com/tools/${job.tool_slug}`,
        sections: job.script_data?.sections?.filter((s) => s.visualNote === 'screen-recording') ?? [],
      })
    case 'assembly':
      return dispatchToServer('/assemble', {
        jobId: job.id,
        screenRecordingUrl: job.artifacts.screenRecordings?.[0],
        voiceoverUrl: job.artifacts.voiceoverUrl,
        titleCardUrl: job.artifacts.titleCardUrl,
        endCardUrl: job.artifacts.endCardUrl,
      })
    case 'adapt':
      return dispatchToServer('/adapt', {
        jobId: job.id,
        masterUrl: job.artifacts.masterUrl,
        targetDuration: job.target_duration,
      })
    default:
      throw new Error(`Unknown step: ${step}`)
  }
}

// ---------- Vercel-side steps ----------

async function executeScript(job: VBlogJobRow): Promise<StepResult> {
  // Get tool description from tools list
  const tool = tools.find((t) => t.href === '/tools/' + job.tool_slug)
  const toolDescription = tool?.description || `${job.tool_name} tool`

  const scriptData = await generateScript(
    job.tool_name,
    job.tool_slug,
    toolDescription,
    job.script_style as 'feature-walkthrough' | 'problem-solution',
    job.target_duration,
  )

  // Upload script JSON to R2
  const scriptJson = Buffer.from(JSON.stringify(scriptData, null, 2))
  const scriptUrl = await uploadToR2(`vblog/${job.id}/script.json`, scriptJson, 'application/json')

  return {
    artifacts: { scriptUrl },
    scriptData,
  }
}

async function executeVoice(job: VBlogJobRow): Promise<StepResult> {
  if (!job.script_data) {
    throw new Error('Cannot generate voiceover: script_data is missing. Run the script step first.')
  }

  const voiceoverUrl = await generateVoiceover(
    job.id,
    job.script_data,
    job.voice_type,
    job.voice_id ?? undefined,
  )

  return { artifacts: { voiceoverUrl } }
}

async function executeAssets(job: VBlogJobRow): Promise<StepResult> {
  // V1: Generate placeholder asset paths in R2
  // These will be simple colored rectangles with text
  const titleCardUrl = await generatePlaceholderAsset(
    job.id,
    'title-card',
    job.script_data?.title || job.tool_name,
  )
  const lowerThirdUrl = await generatePlaceholderAsset(
    job.id,
    'lower-third',
    job.tool_name,
  )
  const endCardUrl = await generatePlaceholderAsset(
    job.id,
    'end-card',
    'Try it free at toolk1t.com',
  )

  return {
    artifacts: { titleCardUrl, lowerThirdUrl, endCardUrl },
  }
}

async function generatePlaceholderAsset(
  jobId: string,
  name: string,
  text: string,
): Promise<string> {
  // V1: Create a minimal SVG as a placeholder image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="#090f16"/>
  <text x="960" y="540" font-family="system-ui, sans-serif" font-size="64" fill="#3D6AF2" text-anchor="middle" dominant-baseline="middle">${escapeXml(text)}</text>
</svg>`

  const buffer = Buffer.from(svg)
  const url = await uploadToR2(`vblog/${jobId}/${name}.svg`, buffer, 'image/svg+xml')
  return url
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ---------- Processing server dispatch ----------

async function dispatchToServer(
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
): Promise<StepResult> {
  const serverUrl = PROCESSING_SERVER_URL
  const apiSecret = process.env.VBLOG_API_SECRET || 'dev-secret'

  let response: Response
  try {
    response = await fetch(`${serverUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiSecret}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(300_000), // 5 min timeout
    })
  } catch (err) {
    if (err instanceof TypeError || (err instanceof DOMException && err.name === 'AbortError')) {
      throw new Error(
        `Processing server not reachable at ${serverUrl}. Start it with: cd scripts/vblog-server && pnpm dev`,
      )
    }
    throw err
  }

  if (!response.ok) {
    const body = await response.text().catch(() => 'no body')
    throw new Error(`Processing server ${endpoint} failed (${response.status}): ${body}`)
  }

  const data = await response.json()

  // Map server response to artifacts based on endpoint
  switch (endpoint) {
    case '/record': {
      // Server returns videoPath; in production it uploads to R2 and returns URL
      const recordings = data.videoPath ? [data.videoPath] : []
      return { artifacts: { screenRecordings: recordings } }
    }
    case '/assemble': {
      return { artifacts: { masterUrl: data.outputPath || data.masterUrl } }
    }
    case '/adapt': {
      const variants = data.variants || {}
      return {
        artifacts: {
          tiktokUrl: variants.tiktok,
          reelsUrl: variants.reels,
          twitterUrl: variants.twitter,
        },
      }
    }
    default:
      return { artifacts: {} }
  }
}
