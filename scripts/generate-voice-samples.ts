/**
 * Generate pre-recorded voice samples for all 30 Gemini TTS voices.
 * Uploads WAV files to Supabase Storage at: voice-samples/{voiceName}.wav
 *
 * Usage: npx tsx scripts/generate-voice-samples.ts
 *
 * Requires: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { GEMINI_VOICES } from '../lib/story/voices'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  const val = trimmed.slice(eqIdx + 1)
  if (!process.env[key]) process.env[key] = val
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const SAMPLE_TEXT = "How are you? I'm your new character. Nice to meet you!"

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function pcmToWav(pcmBase64: string): Buffer {
  const pcmData = Buffer.from(pcmBase64, 'base64')
  const sampleRate = 24000
  const bitsPerSample = 16
  const numChannels = 1
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = pcmData.length

  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(numChannels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)

  return Buffer.concat([header, pcmData])
}

async function generateSample(voiceName: string): Promise<Buffer> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-tts',
  })

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: SAMPLE_TEXT }] }],
    generationConfig: {
      responseModalities: ['AUDIO'] as unknown as undefined,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    } as Record<string, unknown>,
  })

  const audioPart = result.response.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) =>
      p.inlineData?.mimeType?.startsWith('audio/')
  )

  if (!audioPart?.inlineData?.data) {
    throw new Error(`No audio returned for ${voiceName}`)
  }

  return pcmToWav(audioPart.inlineData.data)
}

async function main() {
  console.log(`Generating ${GEMINI_VOICES.length} voice samples...`)
  console.log(`Text: "${SAMPLE_TEXT}"`)
  console.log()

  let success = 0
  let failed = 0

  for (const voice of GEMINI_VOICES) {
    const filename = `voice-samples/${voice.name.toLowerCase()}.wav`
    process.stdout.write(`  ${voice.name} (${voice.tone}, ${voice.gender})... `)

    try {
      const wav = await generateSample(voice.name)

      const { error } = await supabase.storage
        .from('story-assets')
        .upload(filename, new Uint8Array(wav), {
          contentType: 'audio/wav',
          upsert: true,
        })

      if (error) throw new Error(`Upload failed: ${error.message}`)

      console.log(`OK (${(wav.length / 1024).toFixed(0)} KB)`)
      success++
    } catch (err) {
      console.log(`FAILED: ${err instanceof Error ? err.message : err}`)
      failed++
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log()
  console.log(`Done! ${success} succeeded, ${failed} failed.`)

  // Print the base URL for reference
  const { data } = supabase.storage.from('story-assets').getPublicUrl('voice-samples/zephyr.wav')
  const baseUrl = data.publicUrl.replace('zephyr.wav', '')
  console.log(`Base URL: ${baseUrl}`)
}

main().catch(console.error)
