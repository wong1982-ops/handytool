import { NextRequest, NextResponse } from 'next/server'

// Veo 3.1 video generation can take up to 120s per scene
export const maxDuration = 300
import type {
  PipelineStep,
  StoryVideoJob,
  SceneStatus,
  Screenplay,
  ArtStyle,
  DurationPreset,
  VideoProviderType,
  CharacterBible,
} from '@/tools/story-video/types'
import { PIPELINE_STEPS } from '@/tools/story-video/types'
import { generateScreenplay } from '@/tools/story-video/screenplay-generator'
import { getProvider } from '@/tools/story-video/providers'
import { GeminiVideoProvider, generateCharacterPortrait, describeCharacterAppearance } from '@/tools/story-video/providers/gemini'
import {
  generateVoices,
  generateNarration,
  generateSfx,
  generateMusic,
} from '@/tools/story-video/audio-pipeline'
import { uploadToR2 } from '@/lib/storage/r2'

const CRON_SECRET = process.env.CRON_SECRET || ''

// Build admin client inline — same pattern as vblog-worker
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

// ---------- DB row type ----------

interface StoryVideoJobRow {
  id: string
  user_id: string
  book_id: string
  book_title: string
  art_style: ArtStyle
  provider: VideoProviderType
  target_duration: DurationPreset
  status: string
  current_step: PipelineStep | null
  steps: Record<PipelineStep, string>
  screenplay: Screenplay | null
  scene_status: SceneStatus[]
  artifacts: StoryVideoJob['artifacts']
  character_bible?: CharacterBible
  video_strategy?: 'full-story' | 'scene-by-scene'
  error: string | null
}

// ---------- Parallel audio steps ----------

const AUDIO_STEPS: PipelineStep[] = ['voices', 'narration', 'sfx', 'music']

/**
 * GET /api/cron/story-video-worker
 *
 * Pipeline worker triggered by Vercel Cron (every minute).
 * Picks up pending/processing story video jobs, executes the next pending step(s).
 *
 * Steps voices/narration/sfx/music can run in parallel.
 * Assembly requires all previous steps to be complete.
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
    console.warn('[story-video-worker] SUPABASE_SERVICE_ROLE_KEY not set — skipping')
    return NextResponse.json({
      ok: true,
      processed: 0,
      skipped: true,
      reason: 'No service role key configured',
    })
  }

  // Fetch pending/processing jobs
  const { data: jobs, error } = await supabase
    .from('story_video_jobs')
    .select(
      'id, user_id, book_id, book_title, art_style, provider, target_duration, status, current_step, steps, screenplay, scene_status, artifacts, character_bible, video_strategy, error',
    )
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: true })
    .limit(3)

  if (error) {
    console.error('[story-video-worker] Failed to query jobs:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  if (!jobs?.length) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  let processed = 0

  for (const job of jobs as StoryVideoJobRow[]) {
    try {
      await processJob(supabase, job)
      processed++
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[story-video-worker] Job ${job.id} failed:`, message)
    }
  }

  return NextResponse.json({ ok: true, processed })
}

// ---------- Job processing ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processJob(supabase: any, job: StoryVideoJobRow) {
  const steps = { ...job.steps }

  // 0. Character Lock step must complete first
  if (steps.characterLock === 'pending') {
    await executeCharacterLock(supabase, job)
    return
  }

  if (steps.characterLock !== 'done') return // characterLock still running or failed

  // 1. Script step must complete first
  if (steps.script === 'pending') {
    await executeScript(supabase, job)
    return
  }

  if (steps.script !== 'done') return // script still running or failed

  // 2. Scenes step — process one scene per invocation
  if (steps.scenes === 'pending' || steps.scenes === 'processing') {
    await executeScenes(supabase, job)
    // Don't return — also check audio steps in parallel
  }

  // 3. Audio steps (voices, narration, sfx, music) — run in parallel
  const audioPromises: Promise<void>[] = []

  for (const step of AUDIO_STEPS) {
    if (steps[step] === 'pending') {
      audioPromises.push(executeAudioStep(supabase, job, step))
    }
  }

  if (audioPromises.length > 0) {
    await Promise.allSettled(audioPromises)
  }

  // 4. Assembly — only when all previous steps are complete
  // Re-fetch job to get latest step statuses
  const { data: freshJob } = await supabase
    .from('story_video_jobs')
    .select('steps, scene_status, artifacts, screenplay')
    .eq('id', job.id)
    .single()

  if (!freshJob) return

  const freshSteps = freshJob.steps as Record<PipelineStep, string>
  const preAssemblySteps: PipelineStep[] = ['characterLock', 'script', 'scenes', 'voices', 'narration', 'sfx', 'music']
  const allPreAssemblyDone = preAssemblySteps.every((s) => freshSteps[s] === 'done')

  if (allPreAssemblyDone && freshSteps.assembly === 'pending') {
    await executeAssembly(supabase, job.id, freshJob.scene_status, freshJob.artifacts)
  }

  // Safety: if all steps are done but status is still processing, mark complete
  const allStepsDone = PIPELINE_STEPS.every((s) => freshSteps[s] === 'done')
  if (allStepsDone) {
    const { data: currentJob } = await supabase
      .from('story_video_jobs')
      .select('status')
      .eq('id', job.id)
      .single()
    if (currentJob && currentJob.status !== 'complete') {
      await updateJob(supabase, job.id, { status: 'complete', current_step: null })
      console.log(`[story-video-worker] Job ${job.id} — all steps done, marked complete`)
    }
  }
}

// ---------- Step: Character Lock ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeCharacterLock(supabase: any, job: StoryVideoJobRow) {
  await updateJob(supabase, job.id, {
    status: 'processing',
    current_step: 'characterLock',
    steps: { ...job.steps, characterLock: 'processing' },
  })

  try {
    // Fetch book data for character info
    const { data: bookRow, error: bookError } = await supabase
      .from('books')
      .select('data')
      .eq('id', job.book_id)
      .single()

    if (bookError || !bookRow?.data) {
      throw new Error(`Failed to fetch book data: ${bookError?.message || 'No data found'}`)
    }

    const book = bookRow.data as any
    const characterBible: CharacterBible = { characters: [] }

    for (const char of (book.characters || [])) {
      let portraitUrl = char.portraitUrl || ''

      // Generate portrait if missing
      if (!portraitUrl) {
        try {
          const portraitBuffer = await generateCharacterPortrait(
            char.name,
            char.description || char.role || 'character',
            job.art_style
          )
          // Upload to R2 storage
          portraitUrl = await uploadToR2(
            `story-video/${job.id}/characters/${char.name.replace(/\s+/g, '-')}.png`,
            portraitBuffer,
            'image/png'
          )
        } catch (e: any) {
          console.warn(`[story-video] Failed to generate portrait for ${char.name}: ${e.message}`)
        }
      }

      // Generate detailed appearance description
      const appearancePrompt = await describeCharacterAppearance(
        char.description || '',
        char.name,
        char.role || 'character',
        job.art_style
      )

      characterBible.characters.push({
        name: char.name,
        portraitUrl,
        appearancePrompt,
        role: char.role || 'character',
      })
    }

    // Store character bible in job and advance to script step
    await updateJob(supabase, job.id, {
      character_bible: characterBible,
      current_step: 'script',
      steps: { ...job.steps, characterLock: 'done' },
    })

    console.log(`[story-video-worker] Job ${job.id} characterLock done — ${characterBible.characters.length} characters`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await updateJob(supabase, job.id, {
      status: 'failed',
      steps: { ...job.steps, characterLock: 'failed' },
      error: message,
    })
    console.error(`[story-video-worker] Job ${job.id} characterLock failed:`, message)
  }
}

// ---------- Step: Script ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeScript(supabase: any, job: StoryVideoJobRow) {
  // Mark step as running
  await updateJob(supabase, job.id, {
    status: 'processing',
    current_step: 'script',
    steps: { ...job.steps, script: 'processing' },
  })

  try {
    // Fetch book data from books table
    const { data: bookRow, error: bookError } = await supabase
      .from('books')
      .select('data, title, page_count')
      .eq('id', job.book_id)
      .single()

    if (bookError || !bookRow?.data) {
      throw new Error(`Failed to fetch book data: ${bookError?.message || 'No data found'}`)
    }

    const book = bookRow.data as any

    // Generate screenplay
    const screenplay = await generateScreenplay(book, job.art_style, job.target_duration)

    // Initialize scene_status from screenplay scenes
    const sceneStatus: SceneStatus[] = screenplay.scenes.map((scene) => ({
      index: scene.sceneIndex,
      status: 'pending' as const,
    }))

    // Upload screenplay JSON to R2
    const screenplayJson = Buffer.from(JSON.stringify(screenplay, null, 2))
    await uploadToR2(`story-video/${job.id}/screenplay.json`, screenplayJson, 'application/json')

    await updateJob(supabase, job.id, {
      status: 'processing',
      current_step: 'scenes',
      steps: { ...job.steps, script: 'done' },
      screenplay,
      scene_status: sceneStatus,
    })

    console.log(`[story-video-worker] Job ${job.id} script done — ${screenplay.scenes.length} scenes`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await updateJob(supabase, job.id, {
      status: 'failed',
      steps: { ...job.steps, script: 'failed' },
      error: message,
    })
    console.error(`[story-video-worker] Job ${job.id} script failed:`, message)
  }
}

// ---------- Step: Scenes (one scene per invocation) ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeScenes(supabase: any, job: StoryVideoJobRow) {
  if (!job.screenplay) return

  // Try full-story generation first (only on first invocation, before any scenes are processed)
  if (job.video_strategy !== 'scene-by-scene') {
    const allPending = job.scene_status.every((s) => s.status === 'pending')
    if (allPending) {
      const geminiProvider = new GeminiVideoProvider()
      const fullVideo = await geminiProvider.generateFullStoryVideo({
        screenplay: job.screenplay,
        characterBible: job.character_bible || { characters: [] },
        artStyle: job.art_style,
      })

      if (fullVideo) {
        // Upload and use as the single video
        const videoUrl = await uploadToR2(
          `story-video/${job.id}/full-story.mp4`,
          fullVideo,
          'video/mp4'
        )
        // Mark all scenes as done with the full video URL
        const fullSceneStatus: SceneStatus[] = job.screenplay.scenes.map((_, i) => ({
          index: i,
          status: 'done' as const,
          clipUrl: videoUrl,
        }))

        // Re-read latest steps
        const { data: latestJob } = await supabase
          .from('story_video_jobs')
          .select('steps')
          .eq('id', job.id)
          .single()
        const latestSteps = latestJob?.steps || job.steps

        await updateJob(supabase, job.id, {
          scene_status: fullSceneStatus,
          video_strategy: 'full-story',
          current_step: 'voices',
          steps: { ...latestSteps, scenes: 'done' },
        })
        console.log(`[story-video-worker] Job ${job.id} full-story video generated successfully`)
        return
      } else {
        // Mark as scene-by-scene and continue with existing logic
        await updateJob(supabase, job.id, { video_strategy: 'scene-by-scene' })
      }
    }
  }

  const sceneStatus = [...job.scene_status]
  const pendingScene = sceneStatus.find((s) => s.status === 'pending')
  const failedScene = sceneStatus.find((s) => s.status === 'failed')

  if (!pendingScene && !failedScene) {
    // ALL scenes truly done — mark step complete
    await updateJob(supabase, job.id, {
      steps: { ...job.steps, scenes: 'done' },
    })
    return
  }

  if (!pendingScene && failedScene) {
    // No pending but some failed — retry failed scenes automatically
    const retryScene = sceneStatus.find((s) => s.status === 'failed')!
    retryScene.status = 'pending'
    retryScene.error = undefined
    await updateJob(supabase, job.id, { scene_status: sceneStatus })
    return
  }

  // Mark scenes step as processing
  if (job.steps.scenes === 'pending') {
    await updateJob(supabase, job.id, {
      status: 'processing',
      current_step: 'scenes',
      steps: { ...job.steps, scenes: 'processing' },
    })
  }

  if (!pendingScene) return // safety — should not reach here
  const sceneData = job.screenplay.scenes[pendingScene.index]
  if (!sceneData) return

  // Mark this scene as generating
  sceneStatus[pendingScene.index] = { ...pendingScene, status: 'generating' }
  await updateJob(supabase, job.id, { scene_status: sceneStatus })

  try {
    const provider = getProvider(job.provider)

    // Fetch character portraits from book data
    let characterPortraits: { name: string; imageUrl: string }[] = []
    const { data: bookDataRow } = await supabase
      .from('books')
      .select('data')
      .eq('id', job.book_id)
      .single()

    const bookData = bookDataRow?.data as Record<string, unknown> | null
    if (bookData?.characters) {
      characterPortraits = (bookData.characters as any[])
        .filter((c: { name: string; portraitUrl?: string }) => c.portraitUrl)
        .map((c: { name: string; portraitUrl: string }) => ({
          name: c.name,
          imageUrl: c.portraitUrl,
        }))
    }

    // Find previous scene URL for style consistency
    const prevScene = pendingScene.index > 0 ? sceneStatus[pendingScene.index - 1] : null
    const previousSceneUrl = prevScene?.clipUrl || undefined

    const buffer = await provider.generateScene({
      scene: sceneData,
      artStyle: job.art_style,
      characterBible: job.character_bible,
      characterPortraits,
      previousSceneUrl,
    })

    // Upload video clip to R2
    const r2Path = `story-video/${job.id}/scene-${pendingScene.index}.mp4`
    const contentType = 'video/mp4'
    const clipUrl = await uploadToR2(r2Path, buffer, contentType, { upsert: true })

    // Update scene status
    sceneStatus[pendingScene.index] = {
      index: pendingScene.index,
      status: 'done',
      clipUrl,
    }

    // Check if all scenes are now done
    const allScenesDone = sceneStatus.every((s) => s.status === 'done')

    // Re-read latest steps in case audio steps have progressed
    const { data: latestJob } = await supabase
      .from('story_video_jobs')
      .select('steps')
      .eq('id', job.id)
      .single()

    const latestSteps = latestJob?.steps || job.steps

    await updateJob(supabase, job.id, {
      scene_status: sceneStatus,
      steps: { ...latestSteps, scenes: allScenesDone ? 'done' : 'processing' },
    })

    console.log(
      `[story-video-worker] Job ${job.id} scene ${pendingScene.index} done (${allScenesDone ? 'all scenes complete' : 'more pending'})`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    sceneStatus[pendingScene.index] = {
      index: pendingScene.index,
      status: 'failed',
      error: message,
    }

    await updateJob(supabase, job.id, { scene_status: sceneStatus })
    console.error(
      `[story-video-worker] Job ${job.id} scene ${pendingScene.index} failed:`,
      message,
    )
  }
}

// ---------- Audio steps (parallel) ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeAudioStep(supabase: any, job: StoryVideoJobRow, step: PipelineStep) {
  if (!job.screenplay) return

  // Mark step as processing
  const { data: currentJob } = await supabase
    .from('story_video_jobs')
    .select('steps, artifacts')
    .eq('id', job.id)
    .single()

  if (!currentJob) return

  const currentSteps = currentJob.steps as Record<PipelineStep, string>
  await updateJob(supabase, job.id, {
    steps: { ...currentSteps, [step]: 'processing' },
  })

  try {
    let updatedArtifacts = { ...currentJob.artifacts }

    switch (step) {
      case 'voices': {
        // Get voice map from book data
        const { data: voiceBookRow } = await supabase
          .from('books')
          .select('data')
          .eq('id', job.book_id)
          .single()

        const voiceBookData = voiceBookRow?.data as Record<string, unknown> | null
        const voiceMap: Record<string, string> = (voiceBookData?.voiceMap as Record<string, string>) || {}
        const voices = await generateVoices(job.id, job.screenplay.scenes, voiceMap)
        updatedArtifacts = { ...updatedArtifacts, voices }
        break
      }
      case 'narration': {
        const narration = await generateNarration(job.id, job.screenplay.scenes)
        updatedArtifacts = { ...updatedArtifacts, narration }
        break
      }
      case 'sfx': {
        const sfx = await generateSfx(job.id, job.screenplay.scenes)
        updatedArtifacts = { ...updatedArtifacts, sfx }
        break
      }
      case 'music': {
        const musicUrl = await generateMusic(
          job.id,
          job.screenplay.musicMood,
          job.screenplay.totalDuration,
        )
        updatedArtifacts = { ...updatedArtifacts, music: musicUrl }
        break
      }
    }

    // Re-read latest steps before updating
    const { data: latestJob } = await supabase
      .from('story_video_jobs')
      .select('steps')
      .eq('id', job.id)
      .single()

    const latestSteps = latestJob?.steps || currentSteps
    await updateJob(supabase, job.id, {
      steps: { ...latestSteps, [step]: 'done' },
      artifacts: updatedArtifacts,
    })

    console.log(`[story-video-worker] Job ${job.id} ${step} done`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    const { data: latestJob } = await supabase
      .from('story_video_jobs')
      .select('steps')
      .eq('id', job.id)
      .single()

    const latestSteps = latestJob?.steps || currentSteps
    await updateJob(supabase, job.id, {
      steps: { ...latestSteps, [step]: 'failed' },
      error: message,
    })

    console.error(`[story-video-worker] Job ${job.id} ${step} failed:`, message)
  }
}

// ---------- Step: Assembly ----------

async function executeAssembly(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  jobId: string,
  sceneStatus: SceneStatus[],
  artifacts: StoryVideoJob['artifacts'],
) {
  await updateJob(supabase, jobId, {
    current_step: 'assembly',
    steps: {
      characterLock: 'done',
      script: 'done',
      scenes: 'done',
      voices: 'done',
      narration: 'done',
      sfx: 'done',
      music: 'done',
      assembly: 'processing',
    },
  })

  try {
    // V1: Use the first scene clip as the "final" video placeholder
    // Actual FFmpeg assembly requires a processing server (future task)
    const firstSceneClip = sceneStatus.find((s) => s.status === 'done' && s.clipUrl)

    const finalVideo = firstSceneClip?.clipUrl || ''
    const thumbnail = firstSceneClip?.clipUrl || '' // same as video for v1

    await updateJob(supabase, jobId, {
      status: 'complete',
      current_step: null,
      steps: {
        characterLock: 'done',
        script: 'done',
        scenes: 'done',
        voices: 'done',
        narration: 'done',
        sfx: 'done',
        music: 'done',
        assembly: 'done',
      },
      artifacts: {
        ...artifacts,
        finalVideo,
        thumbnail,
      },
    })

    console.log(`[story-video-worker] Job ${jobId} assembly done (v1 placeholder) — complete!`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await updateJob(supabase, jobId, {
      status: 'failed',
      steps: {
        characterLock: 'done',
        script: 'done',
        scenes: 'done',
        voices: 'done',
        narration: 'done',
        sfx: 'done',
        music: 'done',
        assembly: 'failed',
      },
      error: message,
    })
    console.error(`[story-video-worker] Job ${jobId} assembly failed:`, message)
  }
}

// ---------- Helper ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateJob(supabase: any, jobId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('story_video_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId)

  if (error) {
    console.error(`[story-video-worker] Failed to update job ${jobId}:`, error)
  }
}
