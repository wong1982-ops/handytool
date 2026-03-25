const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

export async function callGeminiImage(prompt: string, referenceBase64?: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
    { text: prompt },
  ]
  if (referenceBase64) {
    parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } })
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`)
  }

  const data = await response.json()
  const resParts = data.candidates?.[0]?.content?.parts
  if (!resParts) throw new Error('No parts in Gemini response')

  for (const part of resParts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) return Buffer.from(imageData, 'base64')
  }

  throw new Error('No image in Gemini response')
}
