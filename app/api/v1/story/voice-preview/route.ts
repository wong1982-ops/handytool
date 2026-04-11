import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { getAuthUserId } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const schema = z.object({
  voiceName: z.string().min(1),
  characterName: z.string().min(1).max(100).optional(),
})

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return new Response('Invalid input', { status: 400 })
  }

  const { voiceName, characterName } = parsed.data
  const text = characterName
    ? `How are you? I'm ${characterName}! Nice to meet you.`
    : `How are you? Nice to meet you!`

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-tts',
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text }] }],
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
      return new Response('No audio generated', { status: 500 })
    }

    // Convert PCM to WAV
    const pcmData = Buffer.from(audioPart.inlineData.data, 'base64')
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

    const wav = Buffer.concat([header, pcmData])

    return new Response(wav, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('Voice preview failed:', err)
    return new Response('Voice preview failed', { status: 500 })
  }
}
