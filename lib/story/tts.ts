import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface TtsInput {
  text: string
  bookId: string
  pageNumber: number
}

function pcmToWav(pcmBase64: string, sampleRate: number): Buffer {
  const pcmData = Buffer.from(pcmBase64, 'base64')
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = pcmData.length
  const headerSize = 44

  const wav = Buffer.alloc(headerSize + dataSize)

  // RIFF header
  wav.write('RIFF', 0)
  wav.writeUInt32LE(36 + dataSize, 4)
  wav.write('WAVE', 8)

  // fmt chunk
  wav.write('fmt ', 12)
  wav.writeUInt32LE(16, 16)           // chunk size
  wav.writeUInt16LE(1, 20)            // PCM format
  wav.writeUInt16LE(numChannels, 22)
  wav.writeUInt32LE(sampleRate, 24)
  wav.writeUInt32LE(byteRate, 28)
  wav.writeUInt16LE(blockAlign, 32)
  wav.writeUInt16LE(bitsPerSample, 34)

  // data chunk
  wav.write('data', 36)
  wav.writeUInt32LE(dataSize, 40)
  pcmData.copy(wav, 44)

  return wav
}

export async function generatePageAudio(input: TtsInput): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-tts',
  })

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: input.text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'] as unknown as undefined,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Kore',
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

  // Convert PCM L16 to WAV
  const wavBuffer = pcmToWav(audioPart.inlineData.data, 24000)

  // In dev mode, return a data URL to skip Supabase upload
  if (process.env.NODE_ENV === 'development') {
    const base64Wav = wavBuffer.toString('base64')
    return `data:audio/wav;base64,${base64Wav}`
  }

  // Upload to Supabase storage
  const supabase = await createClient()
  const filename = `audio/${input.bookId}/page-${input.pageNumber}.wav`

  const { error: uploadError } = await supabase.storage
    .from('story-assets')
    .upload(filename, wavBuffer, {
      contentType: 'audio/wav',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Audio upload failed: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('story-assets')
    .getPublicUrl(filename)

  return urlData.publicUrl
}

export function buildPageNarration(narrativeText: string, dialogue?: { speaker: string; line: string }[]): string {
  let text = narrativeText
  if (dialogue?.length) {
    text += '. ' + dialogue.map(d => `${d.speaker} says: "${d.line}"`).join('. ')
  }
  return text
}
