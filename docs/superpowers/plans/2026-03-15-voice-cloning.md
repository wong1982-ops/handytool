# Voice Cloning Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow parents to record a child's voice (~30s), clone it via AI providers, and use the cloned voice for character dialogue and narration in Story Studio.

**Architecture:** New `character_voices` table tracks recording + provider state. A `voice-clone.ts` service handles multi-provider cloning (ElevenLabs → Fish Audio → Cartesia). Recording UI is embedded in the character detail page using the browser MediaRecorder API. The TTS pipeline is extended to route custom-voice segments through the cloning provider instead of Gemini.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (SECURITY DEFINER RPCs), Cloudflare R2, ElevenLabs API, Fish Audio API, Cartesia API, MediaRecorder API, Zod validation.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/018_voice_cloning.sql` | Create | Table + RPC functions for character_voices |
| `lib/story/voice-clone.ts` | Create | Multi-provider voice cloning service (clone + synthesize) |
| `tools/story-studio/characters/voice-recorder.tsx` | Create | Recording UI component (MediaRecorder, playback, save) |
| `tools/story-studio/characters/character-detail.tsx` | Modify | Add voice recorder section below voice picker |
| `app/api/v1/story/characters/[id]/voice/route.ts` | Create | POST (upload), GET (status), DELETE (remove) voice endpoints |
| `lib/story/tts.ts` | Modify | Add custom voice routing in multi-voice pipeline |
| `app/api/v1/story/books/[id]/narrate/route.ts` | Modify | Look up character_voices, pass custom voice info to TTS |

---

## Chunk 1: Database Migration

### Task 1: Create `character_voices` table and RPCs

**Files:**
- Create: `supabase/migrations/018_voice_cloning.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- 018_voice_cloning.sql
-- Voice cloning: recording storage + provider state per character

CREATE TABLE IF NOT EXISTS character_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  provider TEXT,  -- 'elevenlabs' | 'fish_audio' | 'cartesia'
  provider_voice_id TEXT,
  status TEXT NOT NULL DEFAULT 'recorded',  -- 'recorded' | 'cloning' | 'ready' | 'error'
  error_message TEXT,  -- stores failure details when status = 'error'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One custom voice per character
CREATE UNIQUE INDEX IF NOT EXISTS idx_character_voices_character
  ON character_voices(character_id);

-- Lookup by user
CREATE INDEX IF NOT EXISTS idx_character_voices_user
  ON character_voices(user_id);

-- Enable RLS (all access via SECURITY DEFINER RPCs)
ALTER TABLE character_voices ENABLE ROW LEVEL SECURITY;

-- RPC: Upsert a character voice recording
CREATE OR REPLACE FUNCTION upsert_character_voice(
  p_user_id UUID,
  p_character_id UUID,
  p_recording_url TEXT
)
RETURNS TABLE(id UUID, status TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  -- Verify character ownership
  SELECT user_id INTO v_owner FROM characters WHERE id = p_character_id;
  IF v_owner IS NULL OR v_owner != p_user_id THEN
    RAISE EXCEPTION 'Character not found or not owned by user';
  END IF;

  RETURN QUERY
  INSERT INTO character_voices (character_id, user_id, recording_url, status)
  VALUES (p_character_id, p_user_id, p_recording_url, 'recorded')
  ON CONFLICT (character_id)
  DO UPDATE SET
    recording_url = EXCLUDED.recording_url,
    provider = NULL,
    provider_voice_id = NULL,
    status = 'recorded',
    created_at = now()
  RETURNING character_voices.id, character_voices.status;
END;
$$;

-- RPC: Get character voice status
CREATE OR REPLACE FUNCTION get_character_voice(
  p_user_id UUID,
  p_character_id UUID
)
RETURNS TABLE(
  id UUID,
  recording_url TEXT,
  provider TEXT,
  provider_voice_id TEXT,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cv.id, cv.recording_url, cv.provider, cv.provider_voice_id,
         cv.status, cv.error_message, cv.created_at
  FROM character_voices cv
  JOIN characters c ON c.id = cv.character_id
  WHERE cv.character_id = p_character_id
    AND c.user_id = p_user_id;
END;
$$;

-- RPC: Update voice clone provider status
CREATE OR REPLACE FUNCTION update_character_voice_provider(
  p_user_id UUID,
  p_character_id UUID,
  p_provider TEXT,
  p_provider_voice_id TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE character_voices cv
  SET provider = p_provider,
      provider_voice_id = p_provider_voice_id,
      status = p_status,
      error_message = p_error_message
  FROM characters c
  WHERE cv.character_id = p_character_id
    AND c.id = cv.character_id
    AND c.user_id = p_user_id;
END;
$$;

-- RPC: Delete character voice (returns recording_url for R2 cleanup)
CREATE OR REPLACE FUNCTION delete_character_voice(
  p_user_id UUID,
  p_character_id UUID
)
RETURNS TABLE(recording_url TEXT, provider TEXT, provider_voice_id TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  DELETE FROM character_voices cv
  USING characters c
  WHERE cv.character_id = p_character_id
    AND c.id = cv.character_id
    AND c.user_id = p_user_id
  RETURNING cv.recording_url, cv.provider, cv.provider_voice_id;
END;
$$;

-- RPC: Batch get character voices for narration (by character IDs)
CREATE OR REPLACE FUNCTION get_character_voices_by_ids(
  p_user_id UUID,
  p_character_ids UUID[]
)
RETURNS TABLE(
  character_id UUID,
  provider TEXT,
  provider_voice_id TEXT,
  recording_url TEXT,
  status TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cv.character_id, cv.provider, cv.provider_voice_id,
         cv.recording_url, cv.status
  FROM character_voices cv
  JOIN characters c ON c.id = cv.character_id
  WHERE cv.character_id = ANY(p_character_ids)
    AND c.user_id = p_user_id;
END;
$$;
```

- [ ] **Step 2: Apply the migration**

Run: `pnpm supabase migration up` or via Supabase MCP `apply_migration`
Expected: Tables and RPCs created successfully

- [ ] **Step 3: Verify with a quick SQL test**

Run via Supabase MCP `execute_sql`:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'character_voices' ORDER BY ordinal_position;
```
Expected: 9 columns (id, character_id, user_id, recording_url, provider, provider_voice_id, status, error_message, created_at)

**Also verify `get_characters_by_names` RPC returns `id` column:**
```sql
SELECT p.proname, pg_get_functionresult(p.oid) AS return_type
FROM pg_proc p WHERE p.proname = 'get_characters_by_names';
```
If `id` is not in the return type, add a migration step to `CREATE OR REPLACE` the RPC to include `id` in the `RETURNS TABLE(...)` definition.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/018_voice_cloning.sql
git commit -m "feat(voice-cloning): add character_voices table and RPCs"
```

---

## Chunk 2: Voice Clone Service

### Task 2: Create voice cloning service with provider cascade

**Files:**
- Create: `lib/story/voice-clone.ts`

- [ ] **Step 1: Create the service file with types and ElevenLabs provider**

```typescript
// lib/story/voice-clone.ts
//
// Multi-provider voice cloning service.
// Cascade: ElevenLabs → Fish Audio → Cartesia

export type VoiceCloneProvider = 'elevenlabs' | 'fish_audio' | 'cartesia'

export interface CloneVoiceInput {
  audioBuffer: Buffer
  characterName: string
}

export interface CloneVoiceResult {
  provider: VoiceCloneProvider
  providerVoiceId: string
}

// ---------------------------------------------------------------------------
// ElevenLabs
// ---------------------------------------------------------------------------

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

async function cloneWithElevenLabs(input: CloneVoiceInput): Promise<CloneVoiceResult> {
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured')

  const form = new FormData()
  form.append('name', `story-studio-${input.characterName}`)
  form.append('files', new Blob([input.audioBuffer], { type: 'audio/wav' }), 'recording.wav')
  form.append('description', `Cloned voice for character: ${input.characterName}`)

  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    body: form,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`ElevenLabs clone failed: ${res.status} ${errText}`)
  }

  const data = await res.json()
  return { provider: 'elevenlabs', providerVoiceId: data.voice_id }
}

async function synthesizeWithElevenLabs(text: string, voiceId: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured')

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`ElevenLabs TTS failed: ${res.status} ${errText}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

async function deleteElevenLabsVoice(voiceId: string): Promise<void> {
  if (!ELEVENLABS_API_KEY) return
  await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
    method: 'DELETE',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
  }).catch(() => {})  // Best effort
}

// ---------------------------------------------------------------------------
// Fish Audio
// ---------------------------------------------------------------------------

const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY

async function cloneWithFishAudio(input: CloneVoiceInput): Promise<CloneVoiceResult> {
  if (!FISH_AUDIO_API_KEY) throw new Error('FISH_AUDIO_API_KEY not configured')

  const form = new FormData()
  form.append('name', `story-studio-${input.characterName}`)
  form.append('audio', new Blob([input.audioBuffer], { type: 'audio/wav' }), 'recording.wav')

  const res = await fetch('https://api.fish.audio/v1/voices', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${FISH_AUDIO_API_KEY}` },
    body: form,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Fish Audio clone failed: ${res.status} ${errText}`)
  }

  const data = await res.json()
  return { provider: 'fish_audio', providerVoiceId: data.id }
}

async function synthesizeWithFishAudio(text: string, voiceId: string): Promise<Buffer> {
  if (!FISH_AUDIO_API_KEY) throw new Error('FISH_AUDIO_API_KEY not configured')

  const res = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voice_id: voiceId }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Fish Audio TTS failed: ${res.status} ${errText}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

// ---------------------------------------------------------------------------
// Cartesia
// ---------------------------------------------------------------------------

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY

async function cloneWithCartesia(input: CloneVoiceInput): Promise<CloneVoiceResult> {
  if (!CARTESIA_API_KEY) throw new Error('CARTESIA_API_KEY not configured')

  const res = await fetch('https://api.cartesia.ai/voices/clone/clip', {
    method: 'POST',
    headers: {
      'X-API-Key': CARTESIA_API_KEY,
      'Cartesia-Version': '2024-06-10',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clip: Buffer.from(input.audioBuffer).toString('base64'),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Cartesia clone failed: ${res.status} ${errText}`)
  }

  const data = await res.json()
  // Cartesia returns an embedding, create a voice with it
  const voiceRes = await fetch('https://api.cartesia.ai/voices', {
    method: 'POST',
    headers: {
      'X-API-Key': CARTESIA_API_KEY,
      'Cartesia-Version': '2024-06-10',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `story-studio-${input.characterName}`,
      description: `Cloned voice for character: ${input.characterName}`,
      embedding: data.embedding,
      language: 'en',
    }),
  })

  if (!voiceRes.ok) {
    const errText = await voiceRes.text()
    throw new Error(`Cartesia voice creation failed: ${voiceRes.status} ${errText}`)
  }

  const voiceData = await voiceRes.json()
  return { provider: 'cartesia', providerVoiceId: voiceData.id }
}

async function synthesizeWithCartesia(text: string, voiceId: string): Promise<Buffer> {
  if (!CARTESIA_API_KEY) throw new Error('CARTESIA_API_KEY not configured')

  const res = await fetch('https://api.cartesia.ai/tts/bytes', {
    method: 'POST',
    headers: {
      'X-API-Key': CARTESIA_API_KEY,
      'Cartesia-Version': '2024-06-10',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: 'sonic-english',
      transcript: text,
      voice: { mode: 'id', id: voiceId },
      output_format: { container: 'wav', sample_rate: 24000, encoding: 'pcm_s16le' },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Cartesia TTS failed: ${res.status} ${errText}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

// ---------------------------------------------------------------------------
// Provider cascade
// ---------------------------------------------------------------------------

type CloneFn = (input: CloneVoiceInput) => Promise<CloneVoiceResult>
type SynthFn = (text: string, voiceId: string) => Promise<Buffer>

const CLONE_CASCADE: { provider: VoiceCloneProvider; clone: CloneFn }[] = [
  { provider: 'elevenlabs', clone: cloneWithElevenLabs },
  { provider: 'fish_audio', clone: cloneWithFishAudio },
  { provider: 'cartesia', clone: cloneWithCartesia },
]

const SYNTH_MAP: Record<VoiceCloneProvider, SynthFn> = {
  elevenlabs: synthesizeWithElevenLabs,
  fish_audio: synthesizeWithFishAudio,
  cartesia: synthesizeWithCartesia,
}

/**
 * Clone a voice using the provider cascade.
 * Tries ElevenLabs → Fish Audio → Cartesia, returns on first success.
 */
export async function cloneVoice(input: CloneVoiceInput): Promise<CloneVoiceResult> {
  const errors: string[] = []

  for (const { provider, clone } of CLONE_CASCADE) {
    try {
      return await clone(input)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`Voice clone failed with ${provider}: ${msg}`)
      errors.push(`${provider}: ${msg}`)
    }
  }

  throw new Error(`All voice cloning providers failed:\n${errors.join('\n')}`)
}

/**
 * Synthesize speech using a cloned voice.
 * Calls the provider that originally cloned the voice.
 */
export async function synthesizeWithClonedVoice(
  text: string,
  provider: VoiceCloneProvider,
  providerVoiceId: string,
): Promise<Buffer> {
  const synthFn = SYNTH_MAP[provider]
  if (!synthFn) throw new Error(`Unknown voice clone provider: ${provider}`)
  return synthFn(text, providerVoiceId)
}

/**
 * Delete a cloned voice from the provider (best-effort cleanup).
 */
export async function deleteClonedVoice(
  provider: VoiceCloneProvider,
  providerVoiceId: string,
): Promise<void> {
  if (provider === 'elevenlabs') {
    await deleteElevenLabsVoice(providerVoiceId)
  }
  // Fish Audio and Cartesia: deletion is optional / API-dependent
  // Add cleanup calls here when APIs support it
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit --pretty 2>&1 | grep voice-clone || echo "No errors"`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add lib/story/voice-clone.ts
git commit -m "feat(voice-cloning): add multi-provider voice clone service"
```

---

## Chunk 3: Voice API Routes

### Task 3: Create the voice API endpoints

**Files:**
- Create: `app/api/v1/story/characters/[id]/voice/route.ts`

- [ ] **Step 1: Create the voice route with POST, GET, DELETE**

```typescript
// app/api/v1/story/characters/[id]/voice/route.ts

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { uploadToR2, deleteFromR2 } from '@/lib/storage/r2'
import { deleteClonedVoice, type VoiceCloneProvider } from '@/lib/story/voice-clone'

// ---------------------------------------------------------------------------
// GET — get custom voice status for a character
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_character_voice', {
    p_user_id: userId,
    p_character_id: characterId,
  })

  if (error) return apiError(error.message, 'DATABASE_ERROR', 500)

  const voice = (data || [])[0] || null
  return apiSuccess(voice ? {
    id: voice.id,
    recordingUrl: voice.recording_url,
    provider: voice.provider,
    status: voice.status,
    errorMessage: voice.error_message,
    createdAt: voice.created_at,
  } : null)
}

// ---------------------------------------------------------------------------
// POST — upload voice recording (WAV), create character_voices row
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const formData = await request.formData()
  const file = formData.get('audio') as File | null
  if (!file) return apiError('No audio file provided', 'VALIDATION_ERROR', 400)

  // Validate file type and size
  if (!file.type.startsWith('audio/')) {
    return apiError('File must be an audio file', 'VALIDATION_ERROR', 400)
  }
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  if (file.size > MAX_SIZE) {
    return apiError('File too large (max 10MB)', 'VALIDATION_ERROR', 400)
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upload to R2 with actual content type
  const contentType = file.type || 'audio/webm'
  const ext = contentType.includes('webm') ? 'webm' : 'wav'
  const r2Path = `voice-recordings/${userId}/${characterId}/recording.${ext}`
  const recordingUrl = await uploadToR2(r2Path, buffer, contentType, { upsert: true })

  // Upsert character_voices row
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('upsert_character_voice', {
    p_user_id: userId,
    p_character_id: characterId,
    p_recording_url: recordingUrl,
  })

  if (error) {
    return apiError(error.message, 'DATABASE_ERROR', 500)
  }

  const row = (data || [])[0]
  return apiSuccess({
    id: row?.id,
    recordingUrl,
    status: row?.status || 'recorded',
  }, 201)
}

// ---------------------------------------------------------------------------
// DELETE — remove voice recording, clean up provider clone, delete row
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('delete_character_voice', {
    p_user_id: userId,
    p_character_id: characterId,
  })

  if (error) return apiError(error.message, 'DATABASE_ERROR', 500)

  const deleted = (data || [])[0]
  if (!deleted) return apiSuccess(null) // Nothing to delete

  // Best-effort cleanup: R2 recording — derive path from stored URL
  if (deleted.recording_url) {
    // Extract R2 key from the full URL (everything after the public domain)
    const url = new URL(deleted.recording_url)
    const r2Path = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
    await deleteFromR2(r2Path).catch(() => {})
  }

  // Best-effort cleanup: provider clone
  if (deleted.provider && deleted.provider_voice_id) {
    await deleteClonedVoice(
      deleted.provider as VoiceCloneProvider,
      deleted.provider_voice_id,
    ).catch(() => {})
  }

  return apiSuccess({ deleted: true })
}
```

- [ ] **Step 2: Verify route compiles**

Run: `pnpm tsc --noEmit --pretty 2>&1 | grep "voice/route" || echo "No errors"`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/story/characters/\[id\]/voice/route.ts
git commit -m "feat(voice-cloning): add POST/GET/DELETE voice API routes"
```

---

## Chunk 4: Recording UI Component

### Task 4: Create the voice recorder component

**Files:**
- Create: `tools/story-studio/characters/voice-recorder.tsx`

- [ ] **Step 1: Create the recording UI component**

```tsx
// tools/story-studio/characters/voice-recorder.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceRecorderProps {
  characterId: string
  characterName: string
}

interface VoiceState {
  id: string
  recordingUrl: string
  provider: string | null
  status: 'recorded' | 'cloning' | 'ready' | 'error'
  errorMessage: string | null
  createdAt: string
}

const RECORDING_SCRIPT =
  'Once upon a time, in a land far away, a brave adventurer set out on a magical journey through enchanted forests and sparkling rivers, meeting wonderful friends along the way.'

type RecorderPhase = 'idle' | 'recording' | 'preview'

export function VoiceRecorder({ characterId, characterName }: VoiceRecorderProps) {
  const [voice, setVoice] = useState<VoiceState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [phase, setPhase] = useState<RecorderPhase>('idle')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch existing voice on mount
  useEffect(() => {
    fetch(`/api/v1/story/characters/${characterId}/voice`)
      .then(res => res.json())
      .then(json => { if (json.data) setVoice(json.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [characterId])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Use audio/webm for recording, will be sent as-is to API
      // The API stores it as the original format; voice providers accept both WebM and WAV
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setRecordedBlob(blob)
        setPhase('preview')
      }

      // Auto-stop at 60 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, 60_000)

      mediaRecorderRef.current = recorder
      recorder.start()
      setPhase('recording')
      setElapsed(0)

      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } catch {
      setError('Could not access microphone. Please allow microphone access.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const playPreview = useCallback(() => {
    if (!recordedBlob) return
    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
    }
    const url = URL.createObjectURL(recordedBlob)
    const audio = new Audio(url)
    audioRef.current = audio
    audio.play()
  }, [recordedBlob])

  const saveRecording = useCallback(async () => {
    if (!recordedBlob) return
    setSaving(true)
    setError(null)
    try {
      const form = new FormData()
      const ext = recordedBlob.type.includes('webm') ? 'webm' : 'wav'
      form.append('audio', recordedBlob, `recording.${ext}`)

      const res = await fetch(`/api/v1/story/characters/${characterId}/voice`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to save recording')
      }

      const json = await res.json()
      setVoice(json.data)
      setPhase('idle')
      setRecordedBlob(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [recordedBlob, characterId])

  const deleteVoice = useCallback(async () => {
    setDeleting(true)
    setError(null)
    try {
      await fetch(`/api/v1/story/characters/${characterId}/voice`, { method: 'DELETE' })
      setVoice(null)
    } catch {
      setError('Failed to delete voice')
    } finally {
      setDeleting(false)
    }
  }, [characterId])

  const reRecord = useCallback(() => {
    setPhase('idle')
    setRecordedBlob(null)
    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
      audioRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse h-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
    )
  }

  // Voice exists — show status
  if (voice && phase === 'idle') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            voice.status === 'ready'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : voice.status === 'error'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
          }`}>
            {voice.status === 'ready' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {voice.status === 'ready' ? 'Custom voice active' :
             voice.status === 'cloning' ? 'Cloning in progress...' :
             voice.status === 'error' ? 'Cloning failed' :
             'Recording saved'}
          </span>
        </div>

        {/* Playback */}
        {voice.recordingUrl && (
          <audio controls src={voice.recordingUrl} className="w-full h-10" />
        )}

        <div className="flex gap-2">
          <button
            onClick={async () => {
              // Clean up old recording from R2 and provider before re-recording
              await fetch(`/api/v1/story/characters/${characterId}/voice`, { method: 'DELETE' }).catch(() => {})
              setVoice(null)
              startRecording()
            }}
            className="px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Re-record
          </button>
          <button
            onClick={deleteVoice}
            disabled={deleting}
            className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer
              disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {deleting ? 'Deleting...' : 'Delete Voice'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Idle state — show script + start button */}
      {phase === 'idle' && (
        <>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Read this aloud (~30 seconds):
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              &ldquo;{RECORDING_SCRIPT}&rdquo;
            </p>
          </div>
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
              bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            Start Recording
          </button>
        </>
      )}

      {/* Recording state — show timer + stop */}
      {phase === 'recording' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className={`text-sm font-mono ${
              elapsed >= 30
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
              {elapsed >= 30 && elapsed < 60 && ' — good length!'}
              {elapsed >= 55 && ' — auto-stop at 1:00'}
            </span>
          </div>
          <button
            onClick={stopRecording}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800
              rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Stop
          </button>
        </div>
      )}

      {/* Preview state — playback + re-record + save */}
      {phase === 'preview' && (
        <div className="space-y-3">
          <button
            onClick={playPreview}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play Preview
          </button>
          <div className="flex gap-2">
            <button
              onClick={reRecord}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400
                hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Re-record
            </button>
            <button
              onClick={saveRecording}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600
                hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer
                disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              {saving ? 'Saving...' : 'Save Recording'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit --pretty 2>&1 | grep voice-recorder || echo "No errors"`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/characters/voice-recorder.tsx
git commit -m "feat(voice-cloning): add voice recorder UI component"
```

---

### Task 5: Integrate voice recorder into character detail page

**Files:**
- Modify: `tools/story-studio/characters/character-detail.tsx`

- [ ] **Step 1: Add import for VoiceRecorder**

At the top of `character-detail.tsx`, add:
```typescript
import { VoiceRecorder } from '@/tools/story-studio/characters/voice-recorder'
```

- [ ] **Step 2: Add voice recorder section after the voice field display**

Find the voice field block (around line 415-420):
```tsx
{character.voice && (
  <div>
    <span className="text-xs font-medium text-slate-400 uppercase">Voice</span>
    <p className="text-sm text-slate-700 dark:text-slate-300">{character.voice}</p>
  </div>
)}
```

Replace with:
```tsx
{character.voice && (
  <div>
    <span className="text-xs font-medium text-slate-400 uppercase">Voice</span>
    <p className="text-sm text-slate-700 dark:text-slate-300">{character.voice}</p>
  </div>
)}

{/* Custom Voice Recording */}
<div className="pt-3 border-t border-slate-200 dark:border-slate-800">
  <h3 className="text-xs font-medium text-slate-400 uppercase mb-2">Custom Voice</h3>
  <VoiceRecorder characterId={character.id} characterName={character.name} />
  {character.voice && (
    <p className="text-[11px] text-slate-400 mt-2 italic">
      Custom voice will be used instead of the preset. Remove custom voice to use a preset.
    </p>
  )}
</div>
```

- [ ] **Step 3: Verify it renders in the browser**

Run a webapp-testing Playwright script to navigate to a character detail page and screenshot:
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto('http://localhost:3000/tools/story-studio/characters', timeout=30000)
    page.wait_for_load_state('networkidle')
    # Click first character
    page.locator('[class*="cursor-pointer"]').first.click()
    page.wait_for_timeout(2000)
    page.screenshot(path='/tmp/ss_voice_recorder.png', full_page=True)
    browser.close()
```

- [ ] **Step 4: Commit**

```bash
git add tools/story-studio/characters/character-detail.tsx
git commit -m "feat(voice-cloning): integrate voice recorder into character detail"
```

---

## Chunk 5: TTS Pipeline Integration

### Task 6: Extend TTS pipeline to support custom voices

**Files:**
- Modify: `lib/story/tts.ts`
- Modify: `app/api/v1/story/books/[id]/narrate/route.ts`

- [ ] **Step 1: Add custom voice info to AudioSegment type in `tts.ts`**

In `lib/story/tts.ts`, update the `AudioSegment` interface (line ~24-28):

```typescript
export interface AudioSegment {
  speaker: string    // "narrator" | character name
  text: string
  voiceName: string  // resolved Gemini voice name
  /** If set, use cloned voice instead of Gemini preset */
  customVoice?: {
    provider: string
    providerVoiceId: string
  }
}
```

- [ ] **Step 2: Update `generateMultiVoicePageAudio` to route custom voice segments**

In `lib/story/tts.ts`, add import at top:
```typescript
import { synthesizeWithClonedVoice, type VoiceCloneProvider } from '@/lib/story/voice-clone'
```

Then update the segment generation loop in `generateMultiVoicePageAudio` (around line 394-415):

```typescript
  for (const segment of segments) {
    try {
      let buf: Buffer

      if (segment.customVoice) {
        // Custom cloned voice — use voice clone provider
        buf = await synthesizeWithClonedVoice(
          segment.text,
          segment.customVoice.provider as VoiceCloneProvider,
          segment.customVoice.providerVoiceId,
        )
      } else {
        // Preset voice — use Gemini
        buf = await retry(
          () => generateWithGemini(segment.text, segment.voiceName),
          3,
        )
      }

      wavBuffers.push(buf)
    } catch (err) {
      // If any segment fails, fall back to single-voice OpenAI for entire page
      console.warn(
        `TTS failed for segment "${segment.speaker}" on page ${pageNumber}, falling back to OpenAI single-voice:`,
        err,
      )
      const fullText = segments.map(s => s.text).join('. ')
      return generatePageAudio({
        text: fullText,
        bookId,
        pageNumber,
        forceProvider: 'openai',
      })
    }
  }
```

- [ ] **Step 3: Update narrate route to look up custom voices**

In `app/api/v1/story/books/[id]/narrate/route.ts`, add import:
```typescript
import { cloneVoice } from '@/lib/story/voice-clone'
```

After building `finalVoiceMap` (around line 87), add custom voice lookup:

```typescript
    // Look up custom cloned voices for dialogue speakers
    const customVoiceMap: Record<string, { provider: string; providerVoiceId: string }> = {}

    if (dialogueSpeakers.length > 0) {
      // Get character IDs for speakers that have custom voices
      const { data: charRows } = await supabase.rpc('get_characters_by_names', {
        p_user_id: userId,
        p_names: dialogueSpeakers,
      })

      const charIds = (charRows ?? [])
        .filter((c: { id: string }) => c.id)
        .map((c: { id: string }) => c.id)

      if (charIds.length > 0) {
        const { data: voiceRows } = await supabase.rpc('get_character_voices_by_ids', {
          p_user_id: userId,
          p_character_ids: charIds,
        })

        for (const v of voiceRows ?? []) {
          if (v.status === 'ready' && v.provider && v.provider_voice_id) {
            // Find the character name for this character_id
            const char = (charRows ?? []).find((c: { id: string }) => c.id === v.character_id)
            if (char?.name) {
              customVoiceMap[char.name] = {
                provider: v.provider,
                providerVoiceId: v.provider_voice_id,
              }
            }
          } else if (v.status === 'recorded' && v.recording_url) {
            // Lazy clone: trigger cloning now
            try {
              const audioRes = await fetch(v.recording_url)
              const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
              const char = (charRows ?? []).find((c: { id: string }) => c.id === v.character_id)
              const result = await cloneVoice({
                audioBuffer,
                characterName: char?.name || 'character',
              })

              // Update DB with cloned voice info
              await supabase.rpc('update_character_voice_provider', {
                p_user_id: userId,
                p_character_id: v.character_id,
                p_provider: result.provider,
                p_provider_voice_id: result.providerVoiceId,
                p_status: 'ready',
              })

              if (char?.name) {
                customVoiceMap[char.name] = {
                  provider: result.provider,
                  providerVoiceId: result.providerVoiceId,
                }
              }
            } catch (cloneErr) {
              const errMsg = cloneErr instanceof Error ? cloneErr.message : String(cloneErr)
              console.warn(`Lazy voice clone failed for character ${v.character_id}:`, cloneErr)
              // Update status to error with message for debugging
              await supabase.rpc('update_character_voice_provider', {
                p_user_id: userId,
                p_character_id: v.character_id,
                p_provider: null,
                p_provider_voice_id: null,
                p_status: 'error',
                p_error_message: errMsg.slice(0, 500),
              })
              // Fall through to use preset voice
            }
          }
        }
      }
    }
```

Then update the `segmentPageAudio` call to pass custom voices. After the existing `segments` are built (line ~89-93), add:

```typescript
    // Narrator custom voice resolution:
    // If narratorVoice looks like a UUID (character ID), resolve it to a custom voice
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (UUID_RE.test(narratorVoice)) {
      // narratorVoice is a character ID — look up custom voice for narrator
      const { data: narratorVoiceRows } = await supabase.rpc('get_character_voices_by_ids', {
        p_user_id: userId,
        p_character_ids: [narratorVoice],
      })
      const nv = (narratorVoiceRows ?? [])[0]
      if (nv?.status === 'ready' && nv.provider && nv.provider_voice_id) {
        customVoiceMap['narrator'] = {
          provider: nv.provider,
          providerVoiceId: nv.provider_voice_id,
        }
      } else if (nv?.status === 'recorded' && nv.recording_url) {
        // Lazy clone for narrator (same pattern as dialogue speakers)
        try {
          const audioRes = await fetch(nv.recording_url)
          const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
          const result = await cloneVoice({ audioBuffer, characterName: 'narrator' })
          await supabase.rpc('update_character_voice_provider', {
            p_user_id: userId,
            p_character_id: narratorVoice,
            p_provider: result.provider,
            p_provider_voice_id: result.providerVoiceId,
            p_status: 'ready',
          })
          customVoiceMap['narrator'] = {
            provider: result.provider,
            providerVoiceId: result.providerVoiceId,
          }
        } catch (cloneErr) {
          const errMsg = cloneErr instanceof Error ? cloneErr.message : String(cloneErr)
          console.warn(`Lazy voice clone failed for narrator character ${narratorVoice}:`, cloneErr)
          await supabase.rpc('update_character_voice_provider', {
            p_user_id: userId,
            p_character_id: narratorVoice,
            p_provider: null,
            p_provider_voice_id: null,
            p_status: 'error',
            p_error_message: errMsg.slice(0, 500),
          })
        }
      }
    }

    // Annotate segments with custom voice info
    for (const seg of segments) {
      if (customVoiceMap[seg.speaker]) {
        seg.customVoice = customVoiceMap[seg.speaker]
      }
    }
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit --pretty 2>&1 | head -20`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add lib/story/tts.ts app/api/v1/story/books/\[id\]/narrate/route.ts
git commit -m "feat(voice-cloning): integrate custom voices into TTS pipeline"
```

---

## Chunk 6: Environment Variables & Documentation

### Task 7: Add environment variable placeholders

**Files:**
- Modify: `.env.example` (or document in CLAUDE.md)

- [ ] **Step 1: Add voice cloning env vars**

Add to `.env.example` (or `.env.local` for development):
```bash
# Voice Cloning Providers
ELEVENLABS_API_KEY=           # Primary voice cloning provider
FISH_AUDIO_API_KEY=           # Fallback voice cloning provider
CARTESIA_API_KEY=             # Second fallback voice cloning provider
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs(voice-cloning): add voice cloning env var placeholders"
```

---

## Chunk 7: End-to-End Testing

### Task 8: Manual testing with webapp-testing skill

- [ ] **Step 1: Test recording UI renders on character detail page**

Write and run a Playwright script that:
1. Navigates to a character detail page
2. Verifies the "Custom Voice" section is visible
3. Verifies the recording script text is displayed
4. Verifies the "Start Recording" button is present
5. Takes a screenshot

- [ ] **Step 2: Test voice API endpoints**

Write and run a Playwright script that:
1. `POST /api/v1/story/characters/<id>/voice` with a sample audio file
2. Verify response has `status: 'recorded'` and `recordingUrl`
3. `GET /api/v1/story/characters/<id>/voice`
4. Verify voice data is returned
5. `DELETE /api/v1/story/characters/<id>/voice`
6. Verify voice is removed

- [ ] **Step 3: Test voice status display after save**

Write and run a Playwright script that:
1. Navigate to character detail
2. Verify the voice status badge appears after a recording exists
3. Verify "Re-record" and "Delete Voice" buttons are present
4. Take a screenshot

- [ ] **Step 4: Commit any test scripts**

```bash
git add tests/
git commit -m "test(voice-cloning): add e2e test scripts for voice recording flow"
```
