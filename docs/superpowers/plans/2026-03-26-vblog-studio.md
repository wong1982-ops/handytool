# VBlog Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated marketing video generator: AI script, Playwright screen recording, TTS voiceover, FFmpeg video assembly, platform variant adaptation, with dashboard UI and downloadable outputs.

**Architecture:** Two components: (1) Next.js app on Vercel — dashboard UI, DB, API routes, script generation, cron worker. (2) Local processing server (Express + Playwright + FFmpeg) that handles screen recording and video assembly. Cron worker dispatches heavy jobs to the processing server via REST. Pipeline is 6 steps, each producing R2 artifacts, retryable independently.

**Tech Stack:** Next.js 16, React 19, TypeScript, Gemini API, Playwright, FFmpeg, Express, Supabase, Cloudflare R2, Tailwind CSS v4.

---

## File Structure

| File | Purpose |
|------|---------|
| **Vercel App** | |
| `tools/vblog/types.ts` | Types, pipeline steps, job state, constants |
| `tools/vblog/vblog-dashboard.tsx` | Main dashboard with job list + new video form |
| `tools/vblog/job-progress.tsx` | Individual job progress card |
| `tools/vblog/video-preview.tsx` | Video player + download links |
| `tools/vblog/template-upload.tsx` | Upload intro/outro/bgm templates |
| `lib/vblog/script-generator.ts` | Gemini script generation |
| `lib/vblog/voice-generator.ts` | TTS voiceover (reuses Story Studio TTS) |
| `app/tools/vblog/page.tsx` | Dashboard page route |
| `app/api/v1/vblog/create/route.ts` | Create new video job |
| `app/api/v1/vblog/jobs/route.ts` | List jobs |
| `app/api/v1/vblog/jobs/[id]/route.ts` | Get single job |
| `app/api/v1/vblog/jobs/[id]/retry/route.ts` | Retry failed step |
| `app/api/v1/vblog/templates/route.ts` | Upload/list templates |
| `app/api/cron/vblog-worker/route.ts` | Pipeline worker (cron) |
| `supabase/migrations/030_vblog_jobs.sql` | DB table + RLS |
| **Processing Server** | |
| `scripts/vblog-server/index.ts` | Express server entry point |
| `scripts/vblog-server/record.ts` | Playwright screen recording handler |
| `scripts/vblog-server/assemble.ts` | FFmpeg video assembly handler |
| `scripts/vblog-server/adapt.ts` | FFmpeg platform variant handler |
| `scripts/vblog-server/package.json` | Separate package for processing server |

---

### Task 1: Types & Constants

**Files:**
- Create: `tools/vblog/types.ts`

- [ ] **Step 1: Create types and constants**

```ts
// tools/vblog/types.ts

export type PipelineStep = 'script' | 'record' | 'voice' | 'assets' | 'assembly' | 'adapt'
export type StepStatus = 'pending' | 'running' | 'done' | 'failed'
export type JobStatus = 'pending' | 'processing' | 'complete' | 'failed'
export type ScriptStyle = 'feature-walkthrough' | 'problem-solution'
export type VoiceType = 'clone' | 'ai'

export const PIPELINE_STEPS: PipelineStep[] = ['script', 'record', 'voice', 'assets', 'assembly', 'adapt']

export const STEP_LABELS: Record<PipelineStep, string> = {
  script: 'Script',
  record: 'Screen Record',
  voice: 'Voiceover',
  assets: 'Assets',
  assembly: 'Assembly',
  adapt: 'Platform Variants',
}

export interface ScriptSection {
  type: 'intro' | 'demo' | 'feature' | 'outro'
  text: string
  duration: number
  visualNote: 'talking-head' | 'screen-recording'
  actions?: string[]
}

export interface ScriptData {
  title: string
  hook: string
  sections: ScriptSection[]
  hashtags: string[]
  description: string
}

export interface JobSteps {
  script: StepStatus
  record: StepStatus
  voice: StepStatus
  assets: StepStatus
  assembly: StepStatus
  adapt: StepStatus
}

export interface JobArtifacts {
  scriptUrl?: string
  screenRecordings?: string[]
  voiceoverUrl?: string
  titleCardUrl?: string
  lowerThirdUrl?: string
  endCardUrl?: string
  masterUrl?: string
  tiktokUrl?: string
  reelsUrl?: string
  twitterUrl?: string
}

export interface VBlogJob {
  id: string
  toolSlug: string
  toolName: string
  scriptStyle: ScriptStyle
  voiceType: VoiceType
  voiceId?: string
  targetDuration: number
  status: JobStatus
  currentStep: PipelineStep | null
  steps: JobSteps
  artifacts: JobArtifacts
  scriptData: ScriptData | null
  error: string | null
  createdAt: string
  updatedAt: string
}

export const DEFAULT_STEPS: JobSteps = {
  script: 'pending',
  record: 'pending',
  voice: 'pending',
  assets: 'pending',
  assembly: 'pending',
  adapt: 'pending',
}

export const DURATION_OPTIONS = [
  { value: 60, label: '60s — Short' },
  { value: 120, label: '2 min — Standard' },
  { value: 180, label: '3 min — Detailed' },
]

export const PROCESSING_SERVER_URL = process.env.NEXT_PUBLIC_VBLOG_PROCESSOR_URL || 'http://localhost:4000'
```

- [ ] **Step 2: Commit**

```bash
git add tools/vblog/types.ts
git commit -m "feat(vblog): add types, pipeline steps, and constants"
```

---

### Task 2: Database Migration & CRUD APIs

**Files:**
- Create: `supabase/migrations/030_vblog_jobs.sql`
- Create: `app/api/v1/vblog/create/route.ts`
- Create: `app/api/v1/vblog/jobs/route.ts`
- Create: `app/api/v1/vblog/jobs/[id]/route.ts`
- Create: `app/api/v1/vblog/jobs/[id]/retry/route.ts`
- Create: `app/api/v1/vblog/templates/route.ts`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/030_vblog_jobs.sql
CREATE TABLE IF NOT EXISTS public.vblog_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  script_style TEXT NOT NULL,
  voice_type TEXT NOT NULL,
  voice_id TEXT,
  target_duration INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_step TEXT,
  steps JSONB NOT NULL DEFAULT '{}',
  artifacts JSONB NOT NULL DEFAULT '{}',
  script_data JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vblog_jobs_user ON public.vblog_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vblog_jobs_status ON public.vblog_jobs (status) WHERE status IN ('pending', 'processing');

ALTER TABLE public.vblog_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own vblog jobs" ON public.vblog_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vblog jobs" ON public.vblog_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vblog jobs" ON public.vblog_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.vblog_jobs TO authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

- [ ] **Step 3: Create CRUD API routes**

`create/route.ts` — POST: auth check, validate body (toolSlug, toolName, scriptStyle, voiceType, targetDuration), insert with `DEFAULT_STEPS`, return job ID.

`jobs/route.ts` — GET: auth check, fetch all user's jobs ordered by created_at DESC, limit 30.

`jobs/[id]/route.ts` — GET: auth check, fetch single job by ID + user_id match.

`jobs/[id]/retry/route.ts` — POST: auth check, body `{ step }`, reset that step to 'pending', set job status back to 'processing'.

`templates/route.ts` — POST: multipart upload (intro.mp4, outro.mp4, bgm.mp3) to R2 `vblog/templates/`. GET: list available templates.

All routes follow existing patterns: `getAuthUserId()`, `apiSuccess()`, `apiError()`, `API_ERRORS`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/030_vblog_jobs.sql app/api/v1/vblog/
git commit -m "feat(vblog): add database migration and CRUD API routes"
```

---

### Task 3: Script Generator

**Files:**
- Create: `lib/vblog/script-generator.ts`

- [ ] **Step 1: Create script generator**

Uses Gemini text model (`gemini-2.5-flash`) to generate structured video scripts.

```ts
// lib/vblog/script-generator.ts
import type { ScriptData, ScriptStyle } from '@/tools/vblog/types'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const FEATURE_WALKTHROUGH_PROMPT = `You are a video script writer for software tool demos. Write a script for a marketing video about the tool described below.

Structure:
1. Hook (2-3s): A compelling question or statement
2. Intro (5-8s): Brief personal introduction, "talking-head" visual
3. Features (3-5 demo sections, 10-20s each): Each shows a specific feature with step-by-step browser actions
4. Outro (5s): Call to action, "talking-head" visual

For each demo section, provide an "actions" array with Playwright-compatible commands:
- "goto /tools/tool-name" — navigate to URL
- "click selector" — click an element
- "type selector 'text'" — type into an input
- "wait 2000" — pause in milliseconds
- "scroll down 300" — scroll the page

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "title": "string",
  "hook": "string",
  "sections": [{ "type": "intro|demo|feature|outro", "text": "string", "duration": number, "visualNote": "talking-head|screen-recording", "actions": ["string"] }],
  "hashtags": ["string"],
  "description": "string"
}`

const PROBLEM_SOLUTION_PROMPT = `You are a storytelling video script writer. Write a narrative-style marketing video script about the tool described below.

Structure:
1. Problem (5-8s): "Have you ever struggled with...?" — talking-head
2. Solution intro (3-5s): "Meet [Tool Name]..." — talking-head
3. Demo (3-4 sections, 10-20s each): Show the tool solving the problem step-by-step with browser actions
4. Result (5-8s): Show the impressive output — screen recording
5. CTA (3-5s): "Try it free at..." — talking-head

For each demo section, provide Playwright-compatible "actions" array (same format as above).

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "string",
  "hook": "string",
  "sections": [{ "type": "intro|demo|feature|outro", "text": "string", "duration": number, "visualNote": "talking-head|screen-recording", "actions": ["string"] }],
  "hashtags": ["string"],
  "description": "string"
}`

export async function generateScript(
  toolName: string,
  toolSlug: string,
  toolDescription: string,
  style: ScriptStyle,
  targetDuration: number,
): Promise<ScriptData> {
  const systemPrompt = style === 'feature-walkthrough' ? FEATURE_WALKTHROUGH_PROMPT : PROBLEM_SOLUTION_PROMPT

  const userPrompt = `Tool: ${toolName}
URL: https://toolk1t.com/tools/${toolSlug}
Description: ${toolDescription}
Target duration: ${targetDuration} seconds

Generate the video script now.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini script generation failed: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in script response')

  const script: ScriptData = JSON.parse(jsonMatch[0])

  // Validate required fields
  if (!script.title || !script.sections?.length) {
    throw new Error('Invalid script structure')
  }

  return script
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/vblog/script-generator.ts
git commit -m "feat(vblog): add Gemini script generator with two styles"
```

---

### Task 4: Voice Generator

**Files:**
- Create: `lib/vblog/voice-generator.ts`

- [ ] **Step 1: Create voice generator**

Wraps the existing Story Studio TTS infrastructure for vblog use. Generates a single voiceover MP3 from the full script text.

```ts
// lib/vblog/voice-generator.ts
import { uploadToR2 } from '@/lib/storage/r2'
import type { ScriptData } from '@/tools/vblog/types'

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function generateVoiceover(
  jobId: string,
  script: ScriptData,
  voiceType: 'clone' | 'ai',
  voiceId?: string,
): Promise<string> {
  // Concatenate all section texts into one script
  const fullText = script.sections.map((s) => s.text).join('\n\n')

  let audioBuffer: Buffer

  if (voiceType === 'clone' && voiceId) {
    // Use cloned voice via ElevenLabs or similar (reuse Story Studio flow)
    // For now, fall through to AI voice
    audioBuffer = await generateWithGeminiTts(fullText)
  } else {
    // AI voice via Gemini TTS or OpenAI TTS
    audioBuffer = OPENAI_API_KEY
      ? await generateWithOpenAiTts(fullText)
      : await generateWithGeminiTts(fullText)
  }

  const r2Path = `vblog/${jobId}/voiceover.mp3`
  const url = await uploadToR2(r2Path, audioBuffer, 'audio/mpeg')
  return url
}

async function generateWithGeminiTts(text: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Read this script aloud in a professional, friendly voice for a product demo video:\n\n${text}` }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    }),
  })

  if (!response.ok) throw new Error(`Gemini TTS failed: ${response.status}`)

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) throw new Error('No audio in TTS response')

  for (const part of parts) {
    const audioData = part.inlineData?.data || part.inline_data?.data
    if (audioData) return Buffer.from(audioData, 'base64')
  }

  throw new Error('No audio data in response')
}

async function generateWithOpenAiTts(text: string): Promise<Buffer> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: 'onyx',
      response_format: 'mp3',
    }),
  })

  if (!response.ok) throw new Error(`OpenAI TTS failed: ${response.status}`)

  return Buffer.from(await response.arrayBuffer())
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/vblog/voice-generator.ts
git commit -m "feat(vblog): add voice generator with Gemini/OpenAI TTS"
```

---

### Task 5: Cron Pipeline Worker

**Files:**
- Create: `app/api/cron/vblog-worker/route.ts`

- [ ] **Step 1: Create the pipeline worker**

Cron-triggered route that picks up pending/processing jobs and executes the next step. For steps that need the processing server (record, assembly, adapt), it dispatches via HTTP. For steps that can run on Vercel (script, voice, assets), it runs directly.

The worker:
1. Fetches jobs with `status IN ('pending', 'processing')` using admin Supabase client
2. For each job, finds the next `pending` step
3. Marks step as `running`, executes it
4. On success: marks step `done`, updates artifacts, advances to next step or marks job `complete`
5. On failure: marks step `failed`, sets job error

Steps handled on Vercel: `script`, `voice`, `assets`
Steps dispatched to processing server: `record`, `assembly`, `adapt`

Follow the pattern from `app/api/cron/process-jobs/route.ts` — CRON_SECRET auth, admin Supabase client.

- [ ] **Step 2: Commit**

```bash
git add app/api/cron/vblog-worker/route.ts
git commit -m "feat(vblog): add cron pipeline worker"
```

---

### Task 6: Processing Server

**Files:**
- Create: `scripts/vblog-server/package.json`
- Create: `scripts/vblog-server/index.ts`
- Create: `scripts/vblog-server/record.ts`
- Create: `scripts/vblog-server/assemble.ts`
- Create: `scripts/vblog-server/adapt.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "vblog-processor",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "npx tsx watch index.ts",
    "start": "npx tsx index.ts"
  },
  "dependencies": {
    "express": "^4.21.0",
    "playwright": "^1.50.0",
    "fluent-ffmpeg": "^2.1.3"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/fluent-ffmpeg": "^2.1.27",
    "tsx": "^4.0.0"
  }
}
```

- [ ] **Step 2: Create Express server entry point**

```ts
// scripts/vblog-server/index.ts
import express from 'express'
import { handleRecord } from './record'
import { handleAssemble } from './assemble'
import { handleAdapt } from './adapt'

const app = express()
app.use(express.json({ limit: '50mb' }))

const PORT = process.env.PORT || 4000
const API_SECRET = process.env.VBLOG_API_SECRET || 'dev-secret'

// Auth middleware
app.use((req, res, next) => {
  const auth = req.headers.authorization
  if (auth !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

// Health check
app.get('/health', (_, res) => res.json({ ok: true }))

// Pipeline step endpoints
app.post('/record', handleRecord)
app.post('/assemble', handleAssemble)
app.post('/adapt', handleAdapt)

app.listen(PORT, () => {
  console.log(`[vblog-processor] Running on port ${PORT}`)
})
```

- [ ] **Step 3: Create Playwright screen recorder**

```ts
// scripts/vblog-server/record.ts
import { Request, Response } from 'express'
import { chromium } from 'playwright'

interface RecordRequest {
  jobId: string
  toolUrl: string
  sections: {
    actions: string[]
    duration: number
  }[]
  r2UploadUrl: string // callback URL to upload result
}

export async function handleRecord(req: Request, res: Response) {
  const body = req.body as RecordRequest

  try {
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: '/tmp/vblog-recordings', size: { width: 1920, height: 1080 } },
    })

    const page = await context.newPage()

    // Add custom cursor overlay
    await page.addStyleTag({
      content: `* { cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="%233D6AF2" opacity="0.7"/></svg>') 12 12, auto !important; }`,
    })

    await page.goto(body.toolUrl)
    await page.waitForLoadState('networkidle')

    // Execute actions for each section
    for (const section of body.sections) {
      for (const action of section.actions) {
        await executeAction(page, action)
      }
    }

    await page.waitForTimeout(1000) // buffer
    await context.close()
    await browser.close()

    // Get recorded video path
    const videoPath = await page.video()?.path()

    // Return path (caller handles R2 upload)
    res.json({ ok: true, videoPath })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Recording failed'
    res.status(500).json({ error: msg })
  }
}

async function executeAction(page: any, action: string) {
  const parts = action.split(' ')
  const cmd = parts[0]

  switch (cmd) {
    case 'goto':
      await page.goto(parts.slice(1).join(' '))
      break
    case 'click':
      await page.click(parts.slice(1).join(' '))
      break
    case 'type': {
      const selector = parts[1]
      const text = action.match(/'([^']+)'/)?.[1] || ''
      for (const char of text) {
        await page.type(selector, char)
        await page.waitForTimeout(80 + Math.random() * 40)
      }
      break
    }
    case 'wait':
      await page.waitForTimeout(parseInt(parts[1]) || 1000)
      break
    case 'scroll':
      await page.evaluate((px: number) => window.scrollBy({ top: px, behavior: 'smooth' }), parseInt(parts[2]) || 300)
      await page.waitForTimeout(500)
      break
    default:
      console.warn(`[vblog] Unknown action: ${cmd}`)
  }

  // Natural pause between actions
  await page.waitForTimeout(300 + Math.random() * 200)
}
```

- [ ] **Step 4: Create FFmpeg assembler**

```ts
// scripts/vblog-server/assemble.ts
import { Request, Response } from 'express'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

interface AssembleRequest {
  jobId: string
  introUrl?: string
  outroUrl?: string
  bgmUrl?: string
  screenRecordingUrl: string
  voiceoverUrl: string
  titleCardUrl: string
  endCardUrl: string
}

export async function handleAssemble(req: Request, res: Response) {
  const body = req.body as AssembleRequest
  const workDir = `/tmp/vblog-assembly/${body.jobId}`

  try {
    mkdirSync(workDir, { recursive: true })

    // Download all assets
    const downloads: Record<string, string> = {}
    const assets: [string, string | undefined][] = [
      ['screen.webm', body.screenRecordingUrl],
      ['voice.mp3', body.voiceoverUrl],
      ['title.png', body.titleCardUrl],
      ['end.png', body.endCardUrl],
      ['intro.mp4', body.introUrl],
      ['outro.mp4', body.outroUrl],
      ['bgm.mp3', body.bgmUrl],
    ]

    for (const [name, url] of assets) {
      if (!url) continue
      const filePath = path.join(workDir, name)
      const response = await fetch(url)
      const buffer = Buffer.from(await response.arrayBuffer())
      require('fs').writeFileSync(filePath, buffer)
      downloads[name] = filePath
    }

    // Build FFmpeg filter complex
    const outputPath = path.join(workDir, 'master.mp4')
    const inputs: string[] = []
    const filters: string[] = []

    // Simple approach: overlay voice on screen recording, add intro/outro if available
    let cmd = 'ffmpeg -y'

    if (downloads['intro.mp4']) {
      cmd += ` -i "${downloads['intro.mp4']}"`
    }
    cmd += ` -loop 1 -t 3 -i "${downloads['title.png']}"`
    cmd += ` -i "${downloads['screen.webm']}"`
    if (downloads['end.png']) {
      cmd += ` -loop 1 -t 5 -i "${downloads['end.png']}"`
    }
    if (downloads['outro.mp4']) {
      cmd += ` -i "${downloads['outro.mp4']}"`
    }
    cmd += ` -i "${downloads['voice.mp3']}"`

    if (downloads['bgm.mp3']) {
      cmd += ` -i "${downloads['bgm.mp3']}"`
    }

    // For v1: simple concat + audio mix
    cmd += ` -filter_complex "concat=n=3:v=1:a=0[v];[v]scale=1920:1080[vout]"`
    cmd += ` -map "[vout]" -map 4:a`  // voice as primary audio
    cmd += ` -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k`
    cmd += ` -movflags +faststart "${outputPath}"`

    execSync(cmd, { cwd: workDir, timeout: 120000 })

    res.json({ ok: true, outputPath })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Assembly failed'
    res.status(500).json({ error: msg })
  }
}
```

- [ ] **Step 5: Create platform adapter**

```ts
// scripts/vblog-server/adapt.ts
import { Request, Response } from 'express'
import { execSync } from 'child_process'
import path from 'path'

interface AdaptRequest {
  jobId: string
  masterUrl: string
  targetDuration: number
}

export async function handleAdapt(req: Request, res: Response) {
  const body = req.body as AdaptRequest
  const workDir = `/tmp/vblog-adapt/${body.jobId}`

  try {
    require('fs').mkdirSync(workDir, { recursive: true })

    // Download master
    const masterPath = path.join(workDir, 'master.mp4')
    const response = await fetch(body.masterUrl)
    require('fs').writeFileSync(masterPath, Buffer.from(await response.arrayBuffer()))

    const variants: Record<string, string> = {}

    // TikTok: 9:16, max 60s
    const tiktokPath = path.join(workDir, 'tiktok.mp4')
    execSync(
      `ffmpeg -y -i "${masterPath}" -t 60 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset fast -crf 23 -c:a aac "${tiktokPath}"`,
      { timeout: 60000 },
    )
    variants.tiktok = tiktokPath

    // Reels: 9:16, max 90s
    const reelsPath = path.join(workDir, 'reels.mp4')
    execSync(
      `ffmpeg -y -i "${masterPath}" -t 90 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:v libx264 -preset fast -crf 23 -c:a aac "${reelsPath}"`,
      { timeout: 60000 },
    )
    variants.reels = reelsPath

    // Twitter: 1:1, max 140s
    const twitterPath = path.join(workDir, 'twitter.mp4')
    execSync(
      `ffmpeg -y -i "${masterPath}" -t 140 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=1080:1080" -c:v libx264 -preset fast -crf 23 -c:a aac "${twitterPath}"`,
      { timeout: 60000 },
    )
    variants.twitter = twitterPath

    res.json({ ok: true, variants })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Adaptation failed'
    res.status(500).json({ error: msg })
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add scripts/vblog-server/
git commit -m "feat(vblog): add local processing server (Playwright + FFmpeg)"
```

---

### Task 7: Dashboard UI

**Files:**
- Create: `tools/vblog/vblog-dashboard.tsx`
- Create: `tools/vblog/job-progress.tsx`
- Create: `tools/vblog/video-preview.tsx`
- Create: `tools/vblog/template-upload.tsx`
- Create: `app/tools/vblog/page.tsx`

- [ ] **Step 1: Create dashboard component**

Main 'use client' component with:
- Tab toggle: "Videos" / "Templates"
- "New Video" form: tool dropdown (from `lib/tools.tsx`), script style radio, voice radio, duration select, Generate button
- Job list: cards showing each job's progress
- Auto-refresh every 5 seconds (poll `/api/v1/vblog/jobs`)
- Dark theme per design system (`bg-[#090f16]`, `bg-[#131a23]` cards)

- [ ] **Step 2: Create job progress card**

Shows pipeline step status with:
- Tool name + timestamp
- Progress bar (steps completed / total)
- Step icons: ✅ done, ⏳ running (animated), ❌ failed, ⚪ pending
- Error message if failed + Retry button
- When complete: Preview + Download buttons

- [ ] **Step 3: Create video preview component**

Modal/inline player showing:
- `<video>` element with master.mp4
- Download buttons for each variant (master, tiktok, reels, twitter)
- "Download All" button (fetches all and bundles as ZIP via JSZip)
- Script text display (copyable for social media descriptions)
- Hashtags (copyable)

- [ ] **Step 4: Create template upload component**

Simple upload form for intro.mp4, outro.mp4, bgm.mp3:
- File picker per template type
- Upload to `/api/v1/vblog/templates`
- Show current template status (uploaded / not uploaded)

- [ ] **Step 5: Create page route**

```tsx
// app/tools/vblog/page.tsx
import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import VBlogDashboard from '@/tools/vblog/vblog-dashboard'

export const metadata: Metadata = {
  title: 'VBlog Studio — AI Video Generator | Toolk1t',
  description: 'Generate marketing demo videos for your tools automatically.',
}

export default function VBlogPage() {
  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4 bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}>
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="VBlog Studio" toolSlug="vblog" />
        </div>
        <VBlogDashboard />
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add tools/vblog/ app/tools/vblog/page.tsx
git commit -m "feat(vblog): add dashboard UI with job progress and video preview"
```

---

### Task 8: Tool Registration & Vercel Cron

**Files:**
- Modify: `lib/tools.tsx` — add VBlog Studio
- Modify: `components/home/bento-showcase.tsx` — add VBlog card
- Create/modify: `vercel.json` — add cron schedule for vblog-worker

- [ ] **Step 1: Add to tools list**

```ts
{
  name: 'VBlog Studio',
  href: '/tools/vblog',
  description: 'Generate AI marketing videos for your tools',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  color: 'from-red-500 to-pink-500',
}
```

- [ ] **Step 2: Add bento card**

- [ ] **Step 3: Add cron schedule**

Check/create `vercel.json` with cron for vblog-worker:
```json
{
  "crons": [
    { "path": "/api/cron/vblog-worker", "schedule": "* * * * *" }
  ]
}
```

Note: Merge with existing crons if `vercel.json` already has entries.

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx vercel.json
git commit -m "feat(vblog): register tool and add cron schedule"
```
