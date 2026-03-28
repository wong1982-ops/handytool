import { GoogleGenerativeAI } from '@google/generative-ai'
import { uploadToR2 } from '@/lib/storage/r2'

// ---------------------------------------------------------------------------
// Inline types (Task 1 types file may not exist yet)
// ---------------------------------------------------------------------------

interface DialogueLine {
  character: string
  text: string
}

interface VoiceScene {
  sceneIndex: number
  dialogue: DialogueLine[]
}

interface NarrationScene {
  sceneIndex: number
  narration: string
}

interface SfxScene {
  sceneIndex: number
  sfxHints: string[]
}

// ---------------------------------------------------------------------------
// Gemini client (same pattern as lib/story/tts.ts)
// ---------------------------------------------------------------------------

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const DEFAULT_NARRATOR_VOICE = 'Kore'

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------

async function retry<T>(fn: () => Promise<T>, maxAttempts: number): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxAttempts - 1) throw err
      const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error('Unreachable')
}

// ---------------------------------------------------------------------------
// PCM → WAV conversion (matches lib/story/tts.ts)
// ---------------------------------------------------------------------------

const WAV_HEADER_SIZE = 44
const SAMPLE_RATE = 24000
const BITS_PER_SAMPLE = 16
const NUM_CHANNELS = 1

function pcmToWav(pcmBase64: string, sampleRate: number): Buffer {
  const pcmData = Buffer.from(pcmBase64, 'base64')
  const dataSize = pcmData.length
  const byteRate = sampleRate * NUM_CHANNELS * (BITS_PER_SAMPLE / 8)
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8)

  const wav = Buffer.alloc(WAV_HEADER_SIZE + dataSize)
  wav.write('RIFF', 0)
  wav.writeUInt32LE(36 + dataSize, 4)
  wav.write('WAVE', 8)
  wav.write('fmt ', 12)
  wav.writeUInt32LE(16, 16)
  wav.writeUInt16LE(1, 20)
  wav.writeUInt16LE(NUM_CHANNELS, 22)
  wav.writeUInt32LE(sampleRate, 24)
  wav.writeUInt32LE(byteRate, 28)
  wav.writeUInt16LE(blockAlign, 32)
  wav.writeUInt16LE(BITS_PER_SAMPLE, 34)
  wav.write('data', 36)
  wav.writeUInt32LE(dataSize, 40)
  pcmData.copy(wav, 44)

  return wav
}

// ---------------------------------------------------------------------------
// Low-level Gemini TTS
// ---------------------------------------------------------------------------

async function generateTts(text: string, voiceName: string): Promise<Buffer> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-tts',
  })

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'] as unknown as undefined,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    } as Record<string, unknown>,
  })

  const response = result.response
  const audioPart = response.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) =>
      p.inlineData?.mimeType?.startsWith('audio/')
  )

  if (!audioPart?.inlineData?.data) {
    throw new Error('No audio returned from Gemini TTS')
  }

  return pcmToWav(audioPart.inlineData.data, 24000)
}

// ---------------------------------------------------------------------------
// Low-level Gemini audio generation (for SFX & music)
// ---------------------------------------------------------------------------

async function generateAudio(prompt: string): Promise<Buffer> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-tts',
  })

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'] as unknown as undefined,
    } as Record<string, unknown>,
  })

  const response = result.response
  const audioPart = response.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) =>
      p.inlineData?.mimeType?.startsWith('audio/')
  )

  if (!audioPart?.inlineData?.data) {
    throw new Error('No audio returned from Gemini audio generation')
  }

  return pcmToWav(audioPart.inlineData.data, 24000)
}

// ---------------------------------------------------------------------------
// 1. Voice generation
// ---------------------------------------------------------------------------

/**
 * Generate character voices for all dialogue lines across scenes.
 * Uses the book's voiceMap to look up each character's voice ID.
 *
 * @returns Map of sceneIndex → dialogueIndex → audioUrl
 */
export async function generateVoices(
  jobId: string,
  scenes: VoiceScene[],
  voiceMap: Record<string, string>,
): Promise<Record<number, Record<number, string>>> {
  const result: Record<number, Record<number, string>> = {}

  for (const scene of scenes) {
    result[scene.sceneIndex] = {}

    for (let dIdx = 0; dIdx < scene.dialogue.length; dIdx++) {
      const line = scene.dialogue[dIdx]
      const voiceName = voiceMap[line.character] || DEFAULT_NARRATOR_VOICE

      try {
        const audioBuffer = await retry(
          () => generateTts(line.text, voiceName),
          3,
        )

        const r2Path = `story-video/${jobId}/voice-${scene.sceneIndex}-${dIdx}.mp3`
        const audioUrl = await uploadToR2(r2Path, audioBuffer, 'audio/wav', { upsert: true })
        result[scene.sceneIndex][dIdx] = audioUrl
      } catch (err) {
        console.error(
          `[audio-pipeline] Voice generation failed for scene ${scene.sceneIndex}, dialogue ${dIdx}:`,
          err,
        )
        // Skip failed line — don't throw
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// 2. Narration generation
// ---------------------------------------------------------------------------

/**
 * Generate narrator audio for each scene's narration text.
 * Uses default narrator voice (Kore).
 *
 * @returns Map of sceneIndex → audioUrl
 */
export async function generateNarration(
  jobId: string,
  scenes: NarrationScene[],
): Promise<Record<number, string>> {
  const result: Record<number, string> = {}

  for (const scene of scenes) {
    if (!scene.narration?.trim()) continue

    try {
      const audioBuffer = await retry(
        () => generateTts(scene.narration, DEFAULT_NARRATOR_VOICE),
        3,
      )

      const r2Path = `story-video/${jobId}/narration-${scene.sceneIndex}.mp3`
      const audioUrl = await uploadToR2(r2Path, audioBuffer, 'audio/wav', { upsert: true })
      result[scene.sceneIndex] = audioUrl
    } catch (err) {
      console.error(
        `[audio-pipeline] Narration generation failed for scene ${scene.sceneIndex}:`,
        err,
      )
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// 3. SFX generation
// ---------------------------------------------------------------------------

/**
 * Generate sound effects for each scene's sfxHints.
 * Calls Gemini audio generation with a descriptive prompt.
 * Failures return null for that specific SFX entry.
 *
 * @returns Map of sceneIndex → array of (audioUrl | null)
 */
export async function generateSfx(
  jobId: string,
  scenes: SfxScene[],
): Promise<Record<number, (string | null)[]>> {
  const result: Record<number, (string | null)[]> = {}

  for (const scene of scenes) {
    result[scene.sceneIndex] = []

    for (let sfxIdx = 0; sfxIdx < scene.sfxHints.length; sfxIdx++) {
      const hint = scene.sfxHints[sfxIdx]

      try {
        const prompt = `Generate a short sound effect: ${hint}`
        const audioBuffer = await retry(
          () => generateAudio(prompt),
          2,
        )

        const r2Path = `story-video/${jobId}/sfx-${scene.sceneIndex}-${sfxIdx}.mp3`
        const audioUrl = await uploadToR2(r2Path, audioBuffer, 'audio/wav', { upsert: true })
        result[scene.sceneIndex].push(audioUrl)
      } catch (err) {
        console.error(
          `[audio-pipeline] SFX generation failed for scene ${scene.sceneIndex}, hint "${hint}":`,
          err,
        )
        result[scene.sceneIndex].push(null)
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// 4. Background music generation
// ---------------------------------------------------------------------------

/**
 * Generate a background music track matching the story's mood.
 *
 * @returns audioUrl of the uploaded music track, or empty string on failure
 */
export async function generateMusic(
  jobId: string,
  musicMood: string,
  totalDuration: number,
): Promise<string> {
  try {
    const prompt = `Generate a ${musicMood} background music track, ${totalDuration} seconds long`
    const audioBuffer = await retry(
      () => generateAudio(prompt),
      3,
    )

    const r2Path = `story-video/${jobId}/music.mp3`
    const audioUrl = await uploadToR2(r2Path, audioBuffer, 'audio/wav', { upsert: true })
    return audioUrl
  } catch (err) {
    console.error('[audio-pipeline] Music generation failed:', err)
    return ''
  }
}
