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
