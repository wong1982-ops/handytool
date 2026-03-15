import { GoogleGenerativeAI } from '@google/generative-ai'
import { uploadToR2 } from '@/lib/storage/r2'
import type { Character, Dialogue } from '@/tools/story-studio/types'
import { synthesizeWithClonedVoice, type VoiceCloneProvider } from '@/lib/story/voice-clone'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export type TtsProvider = 'gemini' | 'openai'

interface TtsInput {
  text: string
  bookId: string
  pageNumber: number
  voiceName?: string
  /** Force a specific provider for voice consistency across pages */
  forceProvider?: TtsProvider
}

interface TtsResult {
  audioUrl: string
  provider: TtsProvider
}

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

// ---------------------------------------------------------------------------
// Voice pool & assignment
// ---------------------------------------------------------------------------

export { GEMINI_VOICES, GEMINI_VOICE_NAMES } from '@/lib/story/voices'

const VOICE_POOL = {
  narrator: 'Enceladus',
  protagonist: 'Aoede',
  antagonist: 'Charon',
  supporting: ['Puck', 'Fenrir', 'Kore'],
} as const

/**
 * Assign distinct Gemini voices to narrator + each character.
 * If a character has a `voice` preference set (from series), use it directly.
 * Returns a VoiceMap: Record<string, string> mapping speaker key → voice name.
 */
export function assignVoices(
  characters: Character[],
  voicePreferences?: Record<string, string>,
): Record<string, string> {
  const map: Record<string, string> = {
    narrator: voicePreferences?.['__narrator__'] || VOICE_POOL.narrator,
  }

  let supportingIdx = 0

  for (const char of characters) {
    if (map[char.name]) continue // skip duplicates

    // Use voice preference if set (from series character)
    if (voicePreferences?.[char.name]) {
      map[char.name] = voicePreferences[char.name]
      continue
    }

    switch (char.role) {
      case 'protagonist':
        map[char.name] = VOICE_POOL.protagonist
        break
      case 'antagonist':
        map[char.name] = VOICE_POOL.antagonist
        break
      case 'supporting':
      default:
        map[char.name] = VOICE_POOL.supporting[supportingIdx % VOICE_POOL.supporting.length]
        supportingIdx++
        break
    }
  }

  return map
}

// ---------------------------------------------------------------------------
// Page segmentation
// ---------------------------------------------------------------------------

/**
 * Split a page into ordered audio segments: narration first, then dialogue lines.
 * Each segment is tagged with the speaker and their assigned voice.
 */
export function segmentPageAudio(
  narrativeText: string,
  dialogue: Dialogue[] | undefined,
  voiceMap: Record<string, string>,
): AudioSegment[] {
  const segments: AudioSegment[] = []

  // Narrative segment (always present)
  if (narrativeText.trim()) {
    segments.push({
      speaker: 'narrator',
      text: narrativeText.trim(),
      voiceName: voiceMap.narrator || VOICE_POOL.narrator,
    })
  }

  // Dialogue segments
  if (dialogue?.length) {
    for (const d of dialogue) {
      segments.push({
        speaker: d.speaker,
        text: d.line,
        voiceName: voiceMap[d.speaker] || VOICE_POOL.narrator,
      })
    }
  }

  return segments
}

// ---------------------------------------------------------------------------
// WAV stitching
// ---------------------------------------------------------------------------

const WAV_HEADER_SIZE = 44
const SAMPLE_RATE = 24000
const BITS_PER_SAMPLE = 16
const NUM_CHANNELS = 1
const BYTES_PER_MS = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8) / 1000

/** Create a WAV header for the given PCM data size */
function makeWavHeader(dataSize: number): Buffer {
  const byteRate = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8)
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8)
  const header = Buffer.alloc(WAV_HEADER_SIZE)

  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)              // PCM
  header.writeUInt16LE(NUM_CHANNELS, 22)
  header.writeUInt32LE(SAMPLE_RATE, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(BITS_PER_SAMPLE, 34)
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)

  return header
}

/**
 * Stitch multiple WAV buffers into a single WAV file with silence gaps.
 * Assumes all inputs are mono 16-bit PCM at 24kHz (Gemini TTS output).
 */
export function stitchWavBuffers(buffers: Buffer[], silenceMs = 400): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0)
  if (buffers.length === 1) return buffers[0]

  // Strip WAV headers to get raw PCM
  const pcmChunks = buffers.map(buf => buf.subarray(WAV_HEADER_SIZE))

  // Silence gap as zero-filled PCM
  const silenceBytes = Math.round(silenceMs * BYTES_PER_MS)
  const silence = Buffer.alloc(silenceBytes)

  // Calculate total PCM size
  let totalPcmSize = 0
  for (let i = 0; i < pcmChunks.length; i++) {
    totalPcmSize += pcmChunks[i].length
    if (i < pcmChunks.length - 1) totalPcmSize += silenceBytes
  }

  // Concatenate
  const pcmData = Buffer.alloc(totalPcmSize)
  let offset = 0
  for (let i = 0; i < pcmChunks.length; i++) {
    pcmChunks[i].copy(pcmData, offset)
    offset += pcmChunks[i].length
    if (i < pcmChunks.length - 1) {
      silence.copy(pcmData, offset)
      offset += silenceBytes
    }
  }

  // Write new WAV with combined header
  const header = makeWavHeader(totalPcmSize)
  return Buffer.concat([header, pcmData])
}

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------

/** Retry an async fn with exponential backoff */
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
// Low-level TTS generation (unchanged)
// ---------------------------------------------------------------------------

function pcmToWav(pcmBase64: string, sampleRate: number): Buffer {
  const pcmData = Buffer.from(pcmBase64, 'base64')
  const dataSize = pcmData.length

  const wav = Buffer.alloc(WAV_HEADER_SIZE + dataSize)

  // Reuse makeWavHeader logic inline for the base64 path
  const byteRate = sampleRate * NUM_CHANNELS * (BITS_PER_SAMPLE / 8)
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8)

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

/** Generate audio using Gemini TTS */
async function generateWithGemini(text: string, voiceName: string): Promise<Buffer> {
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

/** Generate audio using OpenAI TTS as fallback */
async function generateWithOpenAI(text: string): Promise<Buffer> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured for TTS fallback')
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      response_format: 'mp3',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI TTS error: ${response.status} ${err}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// ---------------------------------------------------------------------------
// Public API: single-segment TTS (used internally + by multi-voice pipeline)
// ---------------------------------------------------------------------------

export async function generatePageAudio(input: TtsInput): Promise<TtsResult> {
  const voiceName = input.voiceName || 'Kore'
  let audioBuffer: Buffer
  let contentType: string
  let fileExtension: string
  let provider: TtsProvider

  if (input.forceProvider === 'openai') {
    audioBuffer = await retry(() => generateWithOpenAI(input.text), 3)
    contentType = 'audio/mpeg'
    fileExtension = 'mp3'
    provider = 'openai'
  } else if (input.forceProvider === 'gemini') {
    audioBuffer = await retry(() => generateWithGemini(input.text, voiceName), 3)
    contentType = 'audio/wav'
    fileExtension = 'wav'
    provider = 'gemini'
  } else {
    try {
      audioBuffer = await retry(() => generateWithGemini(input.text, voiceName), 3)
      contentType = 'audio/wav'
      fileExtension = 'wav'
      provider = 'gemini'
    } catch (geminiErr) {
      console.warn('Gemini TTS failed after 3 retries, falling back to OpenAI TTS:', geminiErr)
      audioBuffer = await retry(() => generateWithOpenAI(input.text), 2)
      contentType = 'audio/mpeg'
      fileExtension = 'mp3'
      provider = 'openai'
    }
  }

  // Upload to R2 (always — base64 data URIs are too large for JSONB state in book_jobs)
  const filename = `audio/${input.bookId}/page-${input.pageNumber}.${fileExtension}`
  const audioUrl = await uploadToR2(filename, audioBuffer, contentType, { upsert: true })

  return { audioUrl, provider }
}

// ---------------------------------------------------------------------------
// Multi-voice page audio: generate segments, stitch, upload
// ---------------------------------------------------------------------------

interface MultiVoiceInput {
  segments: AudioSegment[]
  bookId: string
  pageNumber: number
  forceProvider?: TtsProvider
}

interface MultiVoiceResult {
  audioUrl: string
  provider: TtsProvider
}

/**
 * Generate multi-voice audio for a page:
 * 1. TTS each segment with its assigned voice (sequential to preserve order)
 * 2. Stitch WAV buffers with silence gaps
 * 3. Upload the combined file
 *
 * Falls back to single-voice OpenAI if Gemini fails.
 */
export async function generateMultiVoicePageAudio(
  input: MultiVoiceInput,
): Promise<MultiVoiceResult> {
  const { segments, bookId, pageNumber, forceProvider } = input

  // OpenAI fallback: single-voice, combine all text
  if (forceProvider === 'openai') {
    const fullText = segments.map(s => s.text).join('. ')
    return generatePageAudio({
      text: fullText,
      bookId,
      pageNumber,
      forceProvider: 'openai',
    })
  }

  // Gemini multi-voice: generate each segment separately
  const wavBuffers: Buffer[] = []
  let detectedProvider: TtsProvider = 'gemini'

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

  // Stitch all WAV segments
  const stitchedBuffer = stitchWavBuffers(wavBuffers, 400)
  const contentType = 'audio/wav'
  const fileExtension = 'wav'

  // In dev mode, return data URL
  if (process.env.NODE_ENV === 'development') {
    const base64 = stitchedBuffer.toString('base64')
    return {
      audioUrl: `data:${contentType};base64,${base64}`,
      provider: detectedProvider,
    }
  }

  // Upload to R2
  const filename = `audio/${bookId}/page-${pageNumber}.${fileExtension}`
  const audioUrl = await uploadToR2(filename, stitchedBuffer, contentType, { upsert: true })

  return { audioUrl, provider: detectedProvider }
}

// ---------------------------------------------------------------------------
// Legacy helper (kept for OpenAI single-voice fallback)
// ---------------------------------------------------------------------------

export function buildPageNarration(
  narrativeText: string,
  dialogue?: { speaker: string; line: string }[],
): string {
  let text = narrativeText
  if (dialogue?.length) {
    text += '. ' + dialogue.map(d => `${d.speaker} says: "${d.line}"`).join('. ')
  }
  return text
}
