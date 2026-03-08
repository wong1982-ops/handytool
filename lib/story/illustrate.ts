import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Fallback providers (used if GEMINI_API_KEY is not set or Gemini fails)
const FAL_API_KEY = process.env.FAL_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export interface IllustrateInput {
  imagePrompt: string
  characters?: { name: string; description: string }[]
  referenceImage?: Buffer  // character reference sheet
}

/**
 * Build a structured prompt with characters leading for consistency.
 */
function buildPrompt(input: IllustrateInput): string {
  let prompt = ''

  // Characters first — stronger signal for model consistency
  if (input.characters?.length) {
    prompt += 'CHARACTERS (maintain exact appearances throughout):\n'
    prompt += input.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')
    prompt += '\n\n'
  }

  prompt += `SCENE: ${input.imagePrompt}`
  prompt += '\n\nIMPORTANT: Do not include any text, words, letters, or writing in the image. Illustration only.'
  return prompt
}

/**
 * Generate a character reference sheet showing all main characters side by side.
 * Returns a Buffer for passing as reference to page illustrations, or null on failure.
 */
export async function generateCharacterReference(
  characters: { name: string; description: string }[],
  style: string,
): Promise<Buffer | null> {
  if (!characters.length || !process.env.GEMINI_API_KEY) return null

  try {
    const charDescs = characters.map(c => `${c.name}: ${c.description}`).join('. ')
    const prompt = `${style} style character reference sheet showing all main characters side by side, full body, clear distinct appearances, white background, no text. Characters: ${charDescs}`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
      generationConfig: {
        // @ts-expect-error — responseModalities is valid for image generation models
        responseModalities: ['IMAGE', 'TEXT'],
      },
    })

    const result = await model.generateContent(prompt)
    const response = result.response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
    )

    if (!imagePart?.inlineData?.data) {
      console.warn('Character reference: no image returned')
      return null
    }

    return Buffer.from(imagePart.inlineData.data, 'base64')
  } catch (err) {
    console.warn('Character reference generation failed (proceeding without):', err)
    return null
  }
}

/** Extract image data from a Gemini response and return as ArrayBuffer */
function extractImageFromGeminiResponse(response: { candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] } }[] }): ArrayBuffer {
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/')
  )

  if (!imagePart?.inlineData?.data) {
    throw new Error('No image returned from Gemini')
  }

  const binaryString = atob(imagePart.inlineData.data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Generate illustration using Gemini 2.0 Flash with optional reference image.
 */
async function generateWithGemini(
  prompt: string,
  referenceImage?: Buffer,
): Promise<ArrayBuffer | string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-preview-image-generation',
    generationConfig: {
      // @ts-expect-error — responseModalities is valid for image generation models
      responseModalities: ['IMAGE', 'TEXT'],
    },
  })

  // Pass reference image alongside text prompt if available
  if (referenceImage) {
    const result = await model.generateContent({
      contents: [{
        role: 'user' as const,
        parts: [
          { inlineData: { mimeType: 'image/png', data: referenceImage.toString('base64') } },
          { text: 'Use the character reference sheet above to maintain consistent character appearances. ' + prompt },
        ],
      }],
    })
    return extractImageFromGeminiResponse(result.response)
  }

  const result = await model.generateContent(prompt)
  return extractImageFromGeminiResponse(result.response)
}

async function generateWithFal(prompt: string): Promise<ArrayBuffer> {
  const response = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`fal.ai error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const imageUrl = data.images?.[0]?.url
  if (!imageUrl) throw new Error('No image returned from fal.ai')

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to download generated image')
  return await imageResponse.arrayBuffer()
}

async function generateWithDalle(prompt: string): Promise<ArrayBuffer | string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DALL-E error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const imageUrl = data.data?.[0]?.url
  if (!imageUrl) throw new Error('No image returned from DALL-E')

  // In dev mode, return the URL directly (skip Supabase upload)
  if (process.env.NODE_ENV === 'development') {
    return imageUrl as string
  }

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to download generated image')
  return await imageResponse.arrayBuffer()
}

export async function generateIllustration(input: IllustrateInput): Promise<string> {
  const prompt = buildPrompt(input)

  // Priority: Gemini 2.0 Flash (with reference image) → fal.ai → DALL-E
  // Fallback providers don't receive the reference image (different APIs)
  let result: ArrayBuffer | string
  if (process.env.GEMINI_API_KEY) {
    try {
      result = await generateWithGemini(prompt, input.referenceImage)
    } catch (err) {
      console.warn('Gemini illustration failed, falling back:', err)
      result = FAL_API_KEY
        ? await generateWithFal(prompt)
        : await generateWithDalle(prompt)
    }
  } else if (FAL_API_KEY) {
    result = await generateWithFal(prompt)
  } else {
    result = await generateWithDalle(prompt)
  }

  // In dev mode, DALL-E returns URL directly
  if (typeof result === 'string') {
    return result
  }

  const imageBuffer = result
  const supabase = await createClient()
  const filename = `illustrations/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`

  const { error: uploadError } = await supabase.storage
    .from('story-assets')
    .upload(filename, imageBuffer, {
      contentType: 'image/png',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('story-assets')
    .getPublicUrl(filename)

  return urlData.publicUrl
}
