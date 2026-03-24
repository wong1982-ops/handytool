import { uploadToR2 } from '@/lib/storage/r2'

const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

const FACE_ROTATION_PROMPT = `Generate a front-facing version of the person in this photo. The person should be looking directly at the camera (0° yaw, 0° pitch). Maintain their exact appearance: same face, skin tone, hair color and style, facial features, clothing, and lighting. Only correct the head rotation to face forward. Do not change any other aspect of the image.`

export async function generateFrontView(
  imageBase64: string,
  imageMime: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inline_data: { mime_type: imageMime, data: imageBase64 } },
            { text: FACE_ROTATION_PROMPT },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`)
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) throw new Error('No parts in Gemini response')

  for (const part of parts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) {
      const buffer = Buffer.from(imageData, 'base64')
      const r2Path = `id-photo/rotated/${crypto.randomUUID()}.png`
      const publicUrl = await uploadToR2(r2Path, buffer, 'image/png')
      return publicUrl
    }
  }

  throw new Error('No image in Gemini response')
}
