// lib/story/voice-clone.ts
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

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY
const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY

// ---------- ElevenLabs ----------

async function cloneWithElevenLabs(input: CloneVoiceInput): Promise<string> {
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured')

  const form = new FormData()
  form.append('name', input.characterName)
  form.append('description', `Cloned voice for character: ${input.characterName}`)
  form.append('files', new Blob([new Uint8Array(input.audioBuffer)], { type: 'audio/wav' }), `${input.characterName}.wav`)

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    body: form,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`ElevenLabs clone error: ${response.status} ${err}`)
  }

  const data = await response.json()
  if (!data.voice_id) throw new Error('ElevenLabs did not return voice_id')
  return data.voice_id as string
}

async function synthesizeWithElevenLabs(text: string, voiceId: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not configured')

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`ElevenLabs TTS error: ${response.status} ${err}`)
  }

  const ab = await response.arrayBuffer()
  return Buffer.from(ab)
}

async function deleteWithElevenLabs(voiceId: string): Promise<void> {
  if (!ELEVENLABS_API_KEY) return

  try {
    await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    })
  } catch (err) {
    console.warn(`[voice-clone] ElevenLabs delete best-effort failed for ${voiceId}:`, err)
  }
}

// ---------- Fish Audio ----------

async function cloneWithFishAudio(input: CloneVoiceInput): Promise<string> {
  if (!FISH_AUDIO_API_KEY) throw new Error('FISH_AUDIO_API_KEY not configured')

  const form = new FormData()
  form.append('name', input.characterName)
  form.append('audio', new Blob([new Uint8Array(input.audioBuffer)], { type: 'audio/wav' }), `${input.characterName}.wav`)

  const response = await fetch('https://api.fish.audio/v1/voices', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${FISH_AUDIO_API_KEY}` },
    body: form,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Fish Audio clone error: ${response.status} ${err}`)
  }

  const data = await response.json()
  if (!data.id) throw new Error('Fish Audio did not return id')
  return data.id as string
}

async function synthesizeWithFishAudio(text: string, voiceId: string): Promise<Buffer> {
  if (!FISH_AUDIO_API_KEY) throw new Error('FISH_AUDIO_API_KEY not configured')

  const response = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voice_id: voiceId }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Fish Audio TTS error: ${response.status} ${err}`)
  }

  const ab = await response.arrayBuffer()
  return Buffer.from(ab)
}

// ---------- Cartesia ----------

async function cloneWithCartesia(input: CloneVoiceInput): Promise<string> {
  if (!CARTESIA_API_KEY) throw new Error('CARTESIA_API_KEY not configured')

  const cartesiaHeaders = {
    'X-API-Key': CARTESIA_API_KEY,
    'Cartesia-Version': '2024-06-10',
    'Content-Type': 'application/json',
  }

  // Step 1: Clone from clip to get embedding
  const clipResponse = await fetch('https://api.cartesia.ai/voices/clone/clip', {
    method: 'POST',
    headers: cartesiaHeaders,
    body: JSON.stringify({ clip: input.audioBuffer.toString('base64') }),
  })

  if (!clipResponse.ok) {
    const err = await clipResponse.text()
    throw new Error(`Cartesia clip clone error: ${clipResponse.status} ${err}`)
  }

  const clipData = await clipResponse.json()
  if (!clipData.embedding) throw new Error('Cartesia did not return embedding')

  // Step 2: Create a named voice with the embedding
  const voiceResponse = await fetch('https://api.cartesia.ai/voices', {
    method: 'POST',
    headers: cartesiaHeaders,
    body: JSON.stringify({
      name: input.characterName,
      description: `Cloned voice for character: ${input.characterName}`,
      embedding: clipData.embedding,
      language: 'en',
    }),
  })

  if (!voiceResponse.ok) {
    const err = await voiceResponse.text()
    throw new Error(`Cartesia voice create error: ${voiceResponse.status} ${err}`)
  }

  const voiceData = await voiceResponse.json()
  if (!voiceData.id) throw new Error('Cartesia did not return id')
  return voiceData.id as string
}

async function synthesizeWithCartesia(text: string, voiceId: string): Promise<Buffer> {
  if (!CARTESIA_API_KEY) throw new Error('CARTESIA_API_KEY not configured')

  const response = await fetch('https://api.cartesia.ai/tts/bytes', {
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
      output_format: {
        container: 'wav',
        sample_rate: 24000,
        encoding: 'pcm_s16le',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Cartesia TTS error: ${response.status} ${err}`)
  }

  const ab = await response.arrayBuffer()
  return Buffer.from(ab)
}

// ---------- Public API ----------

/**
 * Clone a voice from an audio sample. Tries providers in cascade order:
 * ElevenLabs → Fish Audio → Cartesia. Returns the first success.
 * Throws if all providers fail.
 */
export async function cloneVoice(input: CloneVoiceInput): Promise<CloneVoiceResult> {
  const errors: string[] = []

  // 1. ElevenLabs
  if (ELEVENLABS_API_KEY) {
    try {
      console.log(`[voice-clone] Cloning voice "${input.characterName}" via ElevenLabs`)
      const providerVoiceId = await cloneWithElevenLabs(input)
      console.log(`[voice-clone] ElevenLabs clone success: ${providerVoiceId}`)
      return { provider: 'elevenlabs', providerVoiceId }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[voice-clone] ElevenLabs clone failed:', msg)
      errors.push(`ElevenLabs: ${msg}`)
    }
  } else {
    errors.push('ElevenLabs: ELEVENLABS_API_KEY not configured')
  }

  // 2. Fish Audio
  if (FISH_AUDIO_API_KEY) {
    try {
      console.log(`[voice-clone] Cloning voice "${input.characterName}" via Fish Audio`)
      const providerVoiceId = await cloneWithFishAudio(input)
      console.log(`[voice-clone] Fish Audio clone success: ${providerVoiceId}`)
      return { provider: 'fish_audio', providerVoiceId }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[voice-clone] Fish Audio clone failed:', msg)
      errors.push(`Fish Audio: ${msg}`)
    }
  } else {
    errors.push('Fish Audio: FISH_AUDIO_API_KEY not configured')
  }

  // 3. Cartesia
  if (CARTESIA_API_KEY) {
    try {
      console.log(`[voice-clone] Cloning voice "${input.characterName}" via Cartesia`)
      const providerVoiceId = await cloneWithCartesia(input)
      console.log(`[voice-clone] Cartesia clone success: ${providerVoiceId}`)
      return { provider: 'cartesia', providerVoiceId }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[voice-clone] Cartesia clone failed:', msg)
      errors.push(`Cartesia: ${msg}`)
    }
  } else {
    errors.push('Cartesia: CARTESIA_API_KEY not configured')
  }

  throw new Error(`All voice clone providers failed:\n${errors.join('\n')}`)
}

/**
 * Synthesize speech using a previously cloned voice.
 * Routes to the provider that owns the voice ID.
 */
export async function synthesizeWithClonedVoice(
  text: string,
  provider: VoiceCloneProvider,
  providerVoiceId: string,
): Promise<Buffer> {
  switch (provider) {
    case 'elevenlabs':
      return synthesizeWithElevenLabs(text, providerVoiceId)
    case 'fish_audio':
      return synthesizeWithFishAudio(text, providerVoiceId)
    case 'cartesia':
      return synthesizeWithCartesia(text, providerVoiceId)
    default: {
      const _exhaustive: never = provider
      throw new Error(`Unknown voice clone provider: ${_exhaustive}`)
    }
  }
}

/**
 * Best-effort cleanup of a cloned voice.
 * Only ElevenLabs supports deletion; Fish Audio and Cartesia are no-ops.
 */
export async function deleteClonedVoice(
  provider: VoiceCloneProvider,
  providerVoiceId: string,
): Promise<void> {
  switch (provider) {
    case 'elevenlabs':
      await deleteWithElevenLabs(providerVoiceId)
      break
    case 'fish_audio':
      // Fish Audio has no public delete endpoint — no-op
      break
    case 'cartesia':
      // Cartesia has no delete in the specified API — no-op
      break
    default: {
      const _exhaustive: never = provider
      console.warn(`[voice-clone] deleteClonedVoice: unknown provider ${_exhaustive}`)
    }
  }
}
