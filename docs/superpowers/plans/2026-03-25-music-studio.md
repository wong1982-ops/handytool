# Music Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time AI music studio with a visual launchpad interface, powered by Google Lyria RealTime, with three modes (music, jingles, SFX), recording, and credit-gated downloads.

**Architecture:** Single-page studio layout. Client connects to Lyria via `@google/genai` SDK WebSocket. Audio streamed as 16-bit PCM at 48kHz, played via Web Audio API. Recording captures PCM chunks client-side, encodes to MP3/WAV via `lamejs`. Clips uploaded to R2 on download with credit deduction. History persisted to Supabase.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `@google/genai` (Lyria RealTime), Web Audio API, `lamejs`, Cloudflare R2, Supabase, Tailwind CSS v4.

---

## File Structure

| File | Purpose |
|------|---------|
| `tools/music-studio/types.ts` | Types, mode presets, launchpad configs, constants |
| `tools/music-studio/audio-encoder.ts` | PCM → WAV/MP3 conversion utilities |
| `tools/music-studio/use-lyria.ts` | Custom hook: Lyria WebSocket, Web Audio, recording |
| `tools/music-studio/launchpad.tsx` | Genre/mood/SFX button grid + instrument row |
| `tools/music-studio/controls-panel.tsx` | BPM, brightness, density, scale, prompt sliders |
| `tools/music-studio/waveform-visualizer.tsx` | Canvas-based real-time audio visualizer |
| `tools/music-studio/transport-bar.tsx` | Play/pause/record/stop + timer display |
| `tools/music-studio/clips-panel.tsx` | Recorded clips list with preview/download |
| `tools/music-studio/my-clips.tsx` | History tab for past saved clips |
| `tools/music-studio/music-studio.tsx` | Main studio orchestrator composing all components |
| `app/tools/music-studio/page.tsx` | Page route with metadata |
| `app/api/v1/music-studio/save-clip/route.ts` | Upload clip to R2 + credit deduction |
| `app/api/v1/music-studio/history/route.ts` | Save/fetch clip history |
| `supabase/migrations/028_music_clips.sql` | DB table + RLS |

---

### Task 1: Types, Constants & Audio Encoder

**Files:**
- Create: `tools/music-studio/types.ts`
- Create: `tools/music-studio/audio-encoder.ts`

**Dependencies:** Install `lamejs` for client-side MP3 encoding:
```bash
pnpm add lamejs
pnpm add -D @types/lamejs
```

- [ ] **Step 1: Create types and constants**

```ts
// tools/music-studio/types.ts
export type StudioMode = 'music' | 'jingles' | 'sfx'

export interface LaunchpadButton {
  id: string
  label: string
  emoji: string
  gradient: string
}

export interface Clip {
  id: string
  name: string
  durationSeconds: number
  pcmData: Float32Array[]
  createdAt: number
}

export interface LyriaConfig {
  bpm: number
  brightness: number
  density: number
  scale: string
  generationMode: 'QUALITY' | 'DIVERSITY' | 'VOCALIZATION'
  muteBass: boolean
  muteDrums: boolean
}

export interface WeightedPrompt {
  text: string
  weight: number
}

export const DEFAULT_LYRIA_CONFIG: LyriaConfig = {
  bpm: 120,
  brightness: 0.5,
  density: 0.5,
  scale: 'C_MAJOR',
  generationMode: 'QUALITY',
  muteBass: false,
  muteDrums: false,
}

export const SCALES = [
  'C_MAJOR', 'C_MINOR', 'D_MAJOR', 'D_MINOR', 'E_MAJOR', 'E_MINOR',
  'F_MAJOR', 'F_MINOR', 'G_MAJOR', 'G_MINOR', 'A_MAJOR', 'A_MINOR',
  'B_MAJOR', 'B_MINOR',
  'C_SHARP_MAJOR', 'C_SHARP_MINOR', 'E_FLAT_MAJOR', 'E_FLAT_MINOR',
  'F_SHARP_MAJOR', 'F_SHARP_MINOR', 'A_FLAT_MAJOR', 'A_FLAT_MINOR',
  'B_FLAT_MAJOR', 'B_FLAT_MINOR',
] as const

export const SCALE_LABELS: Record<string, string> = {
  C_MAJOR: 'C Major', C_MINOR: 'C Minor', D_MAJOR: 'D Major', D_MINOR: 'D Minor',
  E_MAJOR: 'E Major', E_MINOR: 'E Minor', F_MAJOR: 'F Major', F_MINOR: 'F Minor',
  G_MAJOR: 'G Major', G_MINOR: 'G Minor', A_MAJOR: 'A Major', A_MINOR: 'A Minor',
  B_MAJOR: 'B Major', B_MINOR: 'B Minor',
  C_SHARP_MAJOR: 'C# Major', C_SHARP_MINOR: 'C# Minor',
  E_FLAT_MAJOR: 'Eb Major', E_FLAT_MINOR: 'Eb Minor',
  F_SHARP_MAJOR: 'F# Major', F_SHARP_MINOR: 'F# Minor',
  A_FLAT_MAJOR: 'Ab Major', A_FLAT_MINOR: 'Ab Minor',
  B_FLAT_MAJOR: 'Bb Major', B_FLAT_MINOR: 'Bb Minor',
}

export const MODE_PRESETS: Record<StudioMode, LaunchpadButton[]> = {
  music: [
    { id: 'lofi', label: 'Lo-fi', emoji: '🎧', gradient: 'from-purple-500 to-indigo-500' },
    { id: 'electronic', label: 'Electronic', emoji: '⚡', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'jazz', label: 'Jazz', emoji: '🎷', gradient: 'from-amber-500 to-orange-500' },
    { id: 'classical', label: 'Classical', emoji: '🎻', gradient: 'from-rose-400 to-pink-500' },
    { id: 'rock', label: 'Rock', emoji: '🎸', gradient: 'from-red-500 to-orange-600' },
    { id: 'ambient', label: 'Ambient', emoji: '🌊', gradient: 'from-teal-400 to-emerald-500' },
    { id: 'hiphop', label: 'Hip-hop', emoji: '🎤', gradient: 'from-yellow-500 to-amber-600' },
    { id: 'cinematic', label: 'Cinematic', emoji: '🎬', gradient: 'from-slate-500 to-zinc-600' },
  ],
  jingles: [
    { id: 'upbeat', label: 'Upbeat', emoji: '🎉', gradient: 'from-yellow-400 to-orange-400' },
    { id: 'inspiring', label: 'Inspiring', emoji: '✨', gradient: 'from-blue-400 to-indigo-500' },
    { id: 'playful', label: 'Playful', emoji: '🎈', gradient: 'from-pink-400 to-fuchsia-500' },
    { id: 'corporate', label: 'Corporate', emoji: '💼', gradient: 'from-slate-400 to-blue-500' },
    { id: 'epic', label: 'Epic', emoji: '🏔️', gradient: 'from-amber-600 to-red-600' },
    { id: 'chill', label: 'Chill', emoji: '🧊', gradient: 'from-sky-300 to-blue-400' },
    { id: 'retro', label: 'Retro', emoji: '📼', gradient: 'from-orange-400 to-pink-500' },
    { id: 'dramatic', label: 'Dramatic', emoji: '🎭', gradient: 'from-purple-600 to-red-500' },
  ],
  sfx: [
    { id: 'riser', label: 'Riser', emoji: '📈', gradient: 'from-green-400 to-emerald-500' },
    { id: 'drop', label: 'Drop', emoji: '💥', gradient: 'from-red-500 to-orange-500' },
    { id: 'hit', label: 'Hit', emoji: '🥁', gradient: 'from-amber-500 to-yellow-500' },
    { id: 'stinger', label: 'Stinger', emoji: '⚔️', gradient: 'from-violet-500 to-purple-600' },
    { id: 'whoosh', label: 'Whoosh', emoji: '💨', gradient: 'from-sky-400 to-cyan-500' },
    { id: 'tension', label: 'Tension', emoji: '😰', gradient: 'from-gray-500 to-slate-600' },
    { id: 'fanfare', label: 'Fanfare', emoji: '🎺', gradient: 'from-yellow-400 to-amber-500' },
    { id: 'transition', label: 'Transition', emoji: '🔄', gradient: 'from-indigo-400 to-violet-500' },
  ],
}

export const INSTRUMENTS: LaunchpadButton[] = [
  { id: 'piano', label: 'Piano', emoji: '🎹', gradient: 'from-slate-600 to-slate-400' },
  { id: 'guitar', label: 'Guitar', emoji: '🎸', gradient: 'from-amber-700 to-amber-500' },
  { id: 'synth', label: 'Synth', emoji: '🎛️', gradient: 'from-cyan-600 to-cyan-400' },
  { id: 'drums', label: 'Drums', emoji: '🥁', gradient: 'from-red-700 to-red-500' },
  { id: 'bass', label: 'Bass', emoji: '🎵', gradient: 'from-purple-700 to-purple-500' },
  { id: 'strings', label: 'Strings', emoji: '🎻', gradient: 'from-rose-600 to-rose-400' },
  { id: 'brass', label: 'Brass', emoji: '🎺', gradient: 'from-yellow-600 to-yellow-400' },
  { id: 'flute', label: 'Flute', emoji: '🪈', gradient: 'from-emerald-600 to-emerald-400' },
]

export const MAX_CLIPS = 10
export const MAX_CLIP_DURATION = 180 // 3 minutes in seconds
export const CLIP_WARNING_TIME = 150  // 2:30
```

- [ ] **Step 2: Create audio encoder utilities**

```ts
// tools/music-studio/audio-encoder.ts

/**
 * Convert interleaved 16-bit PCM Int16Array to stereo Float32Arrays.
 * Lyria outputs interleaved stereo PCM16 at 48kHz.
 */
export function pcm16ToFloat32(pcm16: Int16Array): { left: Float32Array; right: Float32Array } {
  const numSamples = pcm16.length / 2
  const left = new Float32Array(numSamples)
  const right = new Float32Array(numSamples)
  for (let i = 0; i < numSamples; i++) {
    left[i] = pcm16[i * 2] / 32768
    right[i] = pcm16[i * 2 + 1] / 32768
  }
  return { left, right }
}

/**
 * Encode Float32Array audio chunks to WAV blob.
 */
export function encodeWav(chunks: { left: Float32Array; right: Float32Array }[], sampleRate: number): Blob {
  const totalSamples = chunks.reduce((sum, c) => sum + c.left.length, 0)
  const buffer = new ArrayBuffer(44 + totalSamples * 4) // 16-bit stereo = 4 bytes per sample
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + totalSamples * 4, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 2, true) // stereo
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 4, true) // byte rate
  view.setUint16(32, 4, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, 'data')
  view.setUint32(40, totalSamples * 4, true)

  let offset = 44
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.left.length; i++) {
      const l = Math.max(-1, Math.min(1, chunk.left[i]))
      const r = Math.max(-1, Math.min(1, chunk.right[i]))
      view.setInt16(offset, l * 32767, true)
      view.setInt16(offset + 2, r * 32767, true)
      offset += 4
    }
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * Encode Float32Array audio chunks to MP3 blob using lamejs.
 */
export async function encodeMp3(chunks: { left: Float32Array; right: Float32Array }[], sampleRate: number): Promise<Blob> {
  const lamejs = await import('lamejs')
  const mp3Encoder = new lamejs.Mp3Encoder(2, sampleRate, 192) // stereo, 192kbps
  const mp3Parts: Int8Array[] = []

  for (const chunk of chunks) {
    const leftInt16 = new Int16Array(chunk.left.length)
    const rightInt16 = new Int16Array(chunk.right.length)
    for (let i = 0; i < chunk.left.length; i++) {
      leftInt16[i] = Math.max(-32768, Math.min(32767, Math.round(chunk.left[i] * 32767)))
      rightInt16[i] = Math.max(-32768, Math.min(32767, Math.round(chunk.right[i] * 32767)))
    }
    const encoded = mp3Encoder.encodeBuffer(leftInt16, rightInt16)
    if (encoded.length > 0) mp3Parts.push(new Int8Array(encoded))
  }

  const flush = mp3Encoder.flush()
  if (flush.length > 0) mp3Parts.push(new Int8Array(flush))

  return new Blob(mp3Parts, { type: 'audio/mp3' })
}
```

- [ ] **Step 3: Commit**

```bash
pnpm add lamejs && pnpm add -D @types/lamejs
git add tools/music-studio/types.ts tools/music-studio/audio-encoder.ts package.json pnpm-lock.yaml
git commit -m "feat(music-studio): add types, constants, and audio encoder utilities"
```

---

### Task 2: Database Migration & API Routes

**Files:**
- Create: `supabase/migrations/028_music_clips.sql`
- Create: `app/api/v1/music-studio/save-clip/route.ts`
- Create: `app/api/v1/music-studio/history/route.ts`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/028_music_clips.sql
CREATE TABLE IF NOT EXISTS public.music_clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled',
  duration_seconds INT NOT NULL,
  format TEXT NOT NULL,
  clip_url TEXT NOT NULL,
  mode TEXT,
  prompt_summary TEXT,
  bpm INT,
  scale TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_clips_user ON public.music_clips (user_id, created_at DESC);

ALTER TABLE public.music_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own clips" ON public.music_clips FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own clips" ON public.music_clips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.music_clips TO authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run: `mcp__supabase__apply_migration` with project_id `wgrcfnumbozvtmhcavnm`, name `music_clips`, and the SQL above.

- [ ] **Step 3: Create save-clip API route**

```ts
// app/api/v1/music-studio/save-clip/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const formData = await request.formData()
  const audioFile = formData.get('audio') as File | null
  const name = (formData.get('name') as string) || 'Untitled'
  const durationSeconds = parseInt(formData.get('durationSeconds') as string, 10) || 0
  const format = (formData.get('format') as string) || 'mp3'
  const mode = formData.get('mode') as string | null
  const promptSummary = formData.get('promptSummary') as string | null
  const bpm = parseInt(formData.get('bpm') as string, 10) || null
  const scale = formData.get('scale') as string | null

  if (!audioFile || durationSeconds <= 0) {
    return apiError('Audio file and duration are required', 'VALIDATION_ERROR', 400)
  }

  // Credit cost: 1 for MP3, 2 for WAV
  const creditCost = format === 'wav' ? 2 : 1

  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: creditCost,
    p_tool_id: 'music-studio',
    p_description: `Music clip download (${format.toUpperCase()})`,
  })

  if (creditError) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  // Upload to R2
  const sessionId = crypto.randomUUID()
  const ext = format === 'wav' ? 'wav' : 'mp3'
  const contentType = format === 'wav' ? 'audio/wav' : 'audio/mpeg'
  const r2Path = `music-studio/${sessionId}/${name.replace(/[^a-zA-Z0-9-_]/g, '_')}.${ext}`

  const buffer = Buffer.from(await audioFile.arrayBuffer())
  const clipUrl = await uploadToR2(r2Path, buffer, contentType)

  // Save to DB
  const { data, error } = await supabase
    .from('music_clips')
    .insert({
      user_id: userId,
      name,
      duration_seconds: durationSeconds,
      format,
      clip_url: clipUrl,
      mode,
      prompt_summary: promptSummary,
      bpm,
      scale,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[music-studio/save-clip] DB error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id, clipUrl }, 201)
}
```

- [ ] **Step 4: Create history API route**

```ts
// app/api/v1/music-studio/history/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('music_clips')
    .select('id, name, duration_seconds, format, clip_url, mode, prompt_summary, bpm, scale, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[music-studio/history] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data || [] })
}
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/028_music_clips.sql app/api/v1/music-studio/save-clip/route.ts app/api/v1/music-studio/history/route.ts
git commit -m "feat(music-studio): add database migration and API routes"
```

---

### Task 3: Lyria WebSocket Hook

**Files:**
- Create: `tools/music-studio/use-lyria.ts`

This is the core of the tool — a custom React hook that manages the Lyria WebSocket connection, Web Audio API playback, and recording.

- [ ] **Step 1: Create the use-lyria hook**

```ts
// tools/music-studio/use-lyria.ts
'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { GoogleGenAI } from '@google/genai'
import { pcm16ToFloat32 } from './audio-encoder'
import type { LyriaConfig, WeightedPrompt, Clip, DEFAULT_LYRIA_CONFIG } from './types'
import { MAX_CLIPS, MAX_CLIP_DURATION } from './types'

type LyriaStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'error'

interface UseLyriaReturn {
  status: LyriaStatus
  error: string | null
  isRecording: boolean
  recordingDuration: number
  clips: Clip[]
  connect: () => Promise<void>
  disconnect: () => void
  play: () => void
  pause: () => void
  startRecording: () => void
  stopRecording: () => void
  removeClip: (id: string) => void
  updateConfig: (config: Partial<LyriaConfig>) => void
  updatePrompts: (prompts: WeightedPrompt[]) => void
  analyserNode: AnalyserNode | null
}

export function useLyria(apiKey: string): UseLyriaReturn {
  const [status, setStatus] = useState<LyriaStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [clips, setClips] = useState<Clip[]>([])
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)

  const sessionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const nextPlayTimeRef = useRef(0)
  const recordingChunksRef = useRef<{ left: Float32Array; right: Float32Array }[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const clipCounterRef = useRef(0)
  const configRef = useRef<LyriaConfig>({
    bpm: 120, brightness: 0.5, density: 0.5, scale: 'C_MAJOR',
    generationMode: 'QUALITY', muteBass: false, muteDrums: false,
  })

  // Initialize AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 48000 })
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyser.connect(audioContextRef.current.destination)
      analyserRef.current = analyser
      setAnalyserNode(analyser)

      const gain = audioContextRef.current.createGain()
      gain.connect(analyser)
      gainNodeRef.current = gain
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  // Handle incoming audio chunks
  const handleAudioChunk = useCallback((base64Data: string) => {
    const ctx = getAudioContext()
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
    const pcm16 = new Int16Array(bytes.buffer)
    const { left, right } = pcm16ToFloat32(pcm16)

    // Schedule playback
    const audioBuffer = ctx.createBuffer(2, left.length, 48000)
    audioBuffer.copyToChannel(left, 0)
    audioBuffer.copyToChannel(right, 1)

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(gainNodeRef.current || ctx.destination)

    const now = ctx.currentTime
    const startTime = Math.max(now, nextPlayTimeRef.current)
    source.start(startTime)
    nextPlayTimeRef.current = startTime + audioBuffer.duration

    // Capture for recording
    if (isRecording) {
      recordingChunksRef.current.push({ left: new Float32Array(left), right: new Float32Array(right) })
    }
  }, [getAudioContext, isRecording])

  // Connect to Lyria
  const connect = useCallback(async () => {
    if (sessionRef.current) return
    setStatus('connecting')
    setError(null)

    try {
      getAudioContext() // ensure AudioContext exists (user gesture)

      const client = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' })
      const session = await client.live.music.connect({
        model: 'models/lyria-realtime-exp',
        callbacks: {
          onmessage: (message: any) => {
            if (message.serverContent?.audioChunks) {
              for (const chunk of message.serverContent.audioChunks) {
                if (chunk.data) handleAudioChunk(chunk.data)
              }
            }
          },
          onerror: (err: any) => {
            console.error('[music-studio] Lyria error:', err)
            setError('Connection error. Try reconnecting.')
            setStatus('error')
          },
          onclose: () => {
            console.log('[music-studio] Lyria connection closed')
            if (status !== 'idle') setStatus('idle')
            sessionRef.current = null
          },
        },
      })

      sessionRef.current = session
      setStatus('playing')

      // Apply initial config
      await session.setMusicGenerationConfig({
        musicGenerationConfig: {
          bpm: configRef.current.bpm,
          density: configRef.current.density,
          brightness: configRef.current.brightness,
          audioFormat: 'pcm16',
          sampleRateHz: 48000,
        },
      })

      await session.play()
    } catch (err) {
      console.error('[music-studio] Connect failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setStatus('error')
    }
  }, [apiKey, getAudioContext, handleAudioChunk, status])

  // Disconnect
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.stop?.()
      sessionRef.current = null
    }
    setStatus('idle')
    setIsRecording(false)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
  }, [])

  // Play / Pause
  const play = useCallback(async () => {
    if (!sessionRef.current) return
    await sessionRef.current.play()
    setStatus('playing')
  }, [])

  const pause = useCallback(async () => {
    if (!sessionRef.current) return
    await sessionRef.current.pause()
    setStatus('paused')
  }, [])

  // Recording
  const startRecording = useCallback(() => {
    if (clips.length >= MAX_CLIPS) return
    recordingChunksRef.current = []
    setRecordingDuration(0)
    setIsRecording(true)

    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration((d) => {
        if (d >= MAX_CLIP_DURATION) {
          // Auto-stop at max duration
          return d
        }
        return d + 1
      })
    }, 1000)
  }, [clips.length])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    const chunks = recordingChunksRef.current
    if (chunks.length === 0) return // nothing recorded

    // Calculate duration from actual audio data
    const totalSamples = chunks.reduce((sum, c) => sum + c.left.length, 0)
    const durationSeconds = Math.round(totalSamples / 48000)
    if (durationSeconds < 1) return // too short

    clipCounterRef.current++
    const clip: Clip = {
      id: `clip-${Date.now()}`,
      name: `Clip ${clipCounterRef.current}`,
      durationSeconds,
      pcmData: chunks.map(c => {
        // Interleave for storage
        const interleaved = new Float32Array(c.left.length * 2)
        for (let i = 0; i < c.left.length; i++) {
          interleaved[i * 2] = c.left[i]
          interleaved[i * 2 + 1] = c.right[i]
        }
        return interleaved
      }),
      createdAt: Date.now(),
    }

    setClips((prev) => [...prev, clip])
    recordingChunksRef.current = []
    setRecordingDuration(0)
  }, [])

  // Auto-stop recording at max duration
  useEffect(() => {
    if (isRecording && recordingDuration >= MAX_CLIP_DURATION) {
      stopRecording()
    }
  }, [isRecording, recordingDuration, stopRecording])

  // Remove clip
  const removeClip = useCallback((id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Update config
  const updateConfig = useCallback(async (partial: Partial<LyriaConfig>) => {
    configRef.current = { ...configRef.current, ...partial }
    if (!sessionRef.current) return

    try {
      await sessionRef.current.setMusicGenerationConfig({
        musicGenerationConfig: {
          bpm: configRef.current.bpm,
          density: configRef.current.density,
          brightness: configRef.current.brightness,
          audioFormat: 'pcm16',
          sampleRateHz: 48000,
        },
      })
    } catch (err) {
      console.error('[music-studio] Config update failed:', err)
    }
  }, [])

  // Update prompts
  const updatePrompts = useCallback(async (prompts: WeightedPrompt[]) => {
    if (!sessionRef.current || prompts.length === 0) return

    try {
      await sessionRef.current.setWeightedPrompts({
        weightedPrompts: prompts,
      })
    } catch (err) {
      console.error('[music-studio] Prompt update failed:', err)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
      audioContextRef.current?.close()
    }
  }, [disconnect])

  return {
    status,
    error,
    isRecording,
    recordingDuration,
    clips,
    connect,
    disconnect,
    play,
    pause,
    startRecording,
    stopRecording,
    removeClip,
    updateConfig,
    updatePrompts,
    analyserNode,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/music-studio/use-lyria.ts
git commit -m "feat(music-studio): add Lyria WebSocket hook with audio pipeline and recording"
```

---

### Task 4: Launchpad & Controls Panel

**Files:**
- Create: `tools/music-studio/launchpad.tsx`
- Create: `tools/music-studio/controls-panel.tsx`

- [ ] **Step 1: Create launchpad component**

The launchpad renders the 2x4 mode-specific button grid + instrument row. Each button is a toggle. Active buttons get a blue glow ring. Multiple can be active simultaneously.

Props:
```ts
interface LaunchpadProps {
  mode: StudioMode
  activeButtons: Set<string>
  activeInstruments: Set<string>
  onToggleButton: (id: string) => void
  onToggleInstrument: (id: string) => void
  onModeChange: (mode: StudioMode) => void
}
```

- Mode toggle at top: 3 pill buttons (Music / Jingles / SFX)
- Grid: `grid grid-cols-2 sm:grid-cols-4 gap-2.5` of `MODE_PRESETS[mode]` buttons
- Each button: gradient background, emoji, label, click toggles, active state `shadow-[0_0_0_3px_#3D6AF2,0_0_15px_rgba(61,106,242,0.4)]`
- Instrument row below: `flex flex-wrap gap-2` of `INSTRUMENTS` as smaller pill buttons
- Follow dark theme: `bg-[#131a23]` card background, `#70767f` muted text

- [ ] **Step 2: Create controls panel component**

Sidebar (desktop) / collapsible drawer (mobile) with Lyria parameter controls.

Props:
```ts
interface ControlsPanelProps {
  config: LyriaConfig
  customPrompt: string
  onConfigChange: (partial: Partial<LyriaConfig>) => void
  onPromptChange: (prompt: string) => void
}
```

Controls:
- **BPM**: range input 60-200, value display, `bg-[#131a23]` slider track
- **Brightness**: range 0-100 (mapped to 0-1)
- **Density**: range 0-100 (mapped to 0-1)
- **Scale**: select dropdown from `SCALES` with `SCALE_LABELS` display
- **Generation mode**: 3 radio buttons (Quality/Diversity/Vocalization)
- **Mute toggles**: Bass and Drums toggle buttons
- **Prompt**: textarea "Describe your sound..." max 300 chars

All styled with dark theme, `min-h-[44px]` touch targets, `accent-[#3D6AF2]` for sliders.

- [ ] **Step 3: Commit**

```bash
git add tools/music-studio/launchpad.tsx tools/music-studio/controls-panel.tsx
git commit -m "feat(music-studio): add launchpad grid and controls panel"
```

---

### Task 5: Waveform Visualizer & Transport Bar

**Files:**
- Create: `tools/music-studio/waveform-visualizer.tsx`
- Create: `tools/music-studio/transport-bar.tsx`

- [ ] **Step 1: Create waveform visualizer**

Canvas-based real-time audio visualizer that reads from the `AnalyserNode`.

Props:
```ts
interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null
  isPlaying: boolean
}
```

- Uses `requestAnimationFrame` loop to draw waveform bars
- Canvas height ~80px, full width
- Bar style: vertical bars with gradient from `#3D6AF2` to `#7C3AED`
- When not playing: flat line with subtle pulse animation
- Rounded corners on the container: `rounded-xl bg-[#0d1117]`
- Cleanup `cancelAnimationFrame` on unmount

- [ ] **Step 2: Create transport bar**

Playback controls + recording + timer.

Props:
```ts
interface TransportBarProps {
  status: 'idle' | 'connecting' | 'playing' | 'paused' | 'error'
  isRecording: boolean
  recordingDuration: number
  clipCount: number
  maxClips: number
  onConnect: () => void
  onPlay: () => void
  onPause: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  onDisconnect: () => void
}
```

Layout:
- Center: transport buttons — Play/Pause (toggle), Record (red circle, pulses when active), Stop
- Left: connection status indicator (green dot = connected, yellow = connecting, red = error)
- Right: recording timer `MM:SS` (red when recording), clip count badge `N/10`
- When `status === 'idle'`: show "Start Session" button instead of transport
- When `status === 'connecting'`: show spinner
- Buttons: `min-h-[44px]`, icon-based with tooltips
- Record button: `bg-red-500` when active with `animate-pulse` ring

- [ ] **Step 3: Commit**

```bash
git add tools/music-studio/waveform-visualizer.tsx tools/music-studio/transport-bar.tsx
git commit -m "feat(music-studio): add waveform visualizer and transport bar"
```

---

### Task 6: Clips Panel & My Clips History

**Files:**
- Create: `tools/music-studio/clips-panel.tsx`
- Create: `tools/music-studio/my-clips.tsx`

- [ ] **Step 1: Create clips panel**

Shows recorded clips with preview playback and download options.

Props:
```ts
interface ClipsPanelProps {
  clips: Clip[]
  onRemove: (id: string) => void
}
```

Each clip card:
- Name + duration badge
- Play/pause button (plays clip audio using AudioContext from clip's pcmData)
- Download button → opens popover: MP3 (1 credit) / WAV (2 credits)
- Remove (X) button
- Download flow:
  1. Encode clip pcmData to MP3 or WAV using `encodeMp3`/`encodeWav` from `audio-encoder.ts`
  2. Upload via `FormData` POST to `/api/v1/music-studio/save-clip`
  3. On success, trigger browser download from returned `clipUrl`
  4. Show spinner during upload, error on failure

Layout: horizontal scrollable strip, or vertical list on mobile.

- [ ] **Step 2: Create my-clips history component**

Same pattern as `tools/font-generator/my-fonts.tsx`:
- Fetches from `/api/v1/music-studio/history`
- Loading / error / empty states
- Each entry: audio icon, name, duration, mode badge, date
- Click to play audio directly from `clip_url`
- Download button to re-download

Props:
```ts
interface MyClipsProps {
  visible: boolean
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/music-studio/clips-panel.tsx tools/music-studio/my-clips.tsx
git commit -m "feat(music-studio): add clips panel and My Clips history"
```

---

### Task 7: Main Studio Orchestrator

**Files:**
- Create: `tools/music-studio/music-studio.tsx`

- [ ] **Step 1: Create main studio component**

This is the main `'use client'` component that composes all sub-components and manages state flow.

Key state:
- `mode: StudioMode` — current launchpad mode
- `activeButtons: Set<string>` — active genre/mood buttons
- `activeInstruments: Set<string>` — active instrument toggles
- `config: LyriaConfig` — sidebar controls state
- `customPrompt: string` — text prompt field
- `showControls: boolean` — mobile drawer toggle
- `showClipsHistory: boolean` — toggle between session clips and saved history
- `useLyria()` hook — all connection/audio/recording state

Prompt assembly:
- When `activeButtons` or `activeInstruments` or `customPrompt` changes:
- Build `WeightedPrompt[]` from active buttons (each gets weight 1.0) + instruments (each gets weight 0.5) + custom prompt (weight 1.0 if non-empty)
- Call `updatePrompts()` debounced 500ms
- Handle mute: if 'drums' instrument toggled off → `updateConfig({ muteDrums: true })`, same for 'bass'

Layout (follow the spec layout diagram):
```
Desktop: grid grid-cols-12
- Left col-span-8: launchpad + waveform + transport
- Right col-span-4: controls sidebar

Mobile: flex flex-col
- Launchpad (full width)
- Waveform + transport (full width, sticky bottom)
- Controls drawer (slide from right, gear icon toggle)
- Clips panel (slide-up sheet)
```

Tab toggle at top: "Studio" / "My Clips" (same pattern as Create/My Fonts in font-generator)

- [ ] **Step 2: Commit**

```bash
git add tools/music-studio/music-studio.tsx
git commit -m "feat(music-studio): add main studio orchestrator"
```

---

### Task 8: Page Route & Tool Registration

**Files:**
- Create: `app/tools/music-studio/page.tsx`
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`

- [ ] **Step 1: Create page route**

```tsx
// app/tools/music-studio/page.tsx
import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import MusicStudio from '@/tools/music-studio/music-studio'

export const metadata: Metadata = {
  title: 'Music Studio — AI Music Generator | Toolk1t',
  description:
    'Create music, jingles, and sound effects with AI in real-time. Visual launchpad, live controls, record and download your creations.',
}

export default function MusicStudioPage() {
  return (
    <main
      className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="px-4 py-4">
        <ToolBreadcrumb toolName="Music Studio" toolSlug="music-studio" />
      </div>
      <div className="flex-1">
        <MusicStudio />
      </div>
    </main>
  )
}
```

Note: This page uses a different layout than the wizard tools — no `max-w-4xl` centering, the studio fills the full width.

- [ ] **Step 2: Add to tools list**

Add to the `tools` array in `lib/tools.tsx`:
```ts
{
  name: 'Music Studio',
  href: '/tools/music-studio',
  description: 'Create music, jingles and sound effects with AI',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  ),
  color: 'from-purple-500 to-pink-500',
}
```

- [ ] **Step 3: Add to bento showcase**

Add to `bentoItems` in `components/home/bento-showcase.tsx`:
```tsx
{
  name: 'Music Studio',
  description: 'Create AI music in real-time',
  href: '/tools/music-studio',
  gridClass: '',
  glowClass: 'from-purple-500/10',
  preview: (
    <div className="w-full h-full flex items-center justify-center gap-2">
      {['🎧', '🎹', '🎸'].map((emoji, i) => (
        <div key={i} className="w-8 h-8 rounded-lg border border-purple-500/30 bg-purple-500/5 flex items-center justify-center text-sm">
          {emoji}
        </div>
      ))}
      <div className="flex flex-col gap-1 ml-1">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40 w-10" />
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 w-6" />
      </div>
    </div>
  ),
}
```

- [ ] **Step 4: Add to FULL_SCREEN_PATHS in mobile shell**

Music Studio needs full-screen mode (no mobile shell header/bottom nav). Add `/tools/music-studio` to `FULL_SCREEN_PATHS` in `components/mobile/mobile-shell.tsx`.

- [ ] **Step 5: Verify build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add app/tools/music-studio/page.tsx lib/tools.tsx components/home/bento-showcase.tsx components/mobile/mobile-shell.tsx
git commit -m "feat(music-studio): add page route and register tool"
```
