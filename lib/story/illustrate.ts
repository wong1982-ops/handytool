import { createClient } from '@/lib/supabase/server'

const FAL_API_KEY = process.env.FAL_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface IllustrateInput {
  imagePrompt: string
  style: { preset: string; customPrompt?: string }
  characters?: { name: string; description: string }[]
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

async function generateWithDalle(prompt: string): Promise<ArrayBuffer> {
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

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to download generated image')
  return await imageResponse.arrayBuffer()
}

export async function generateIllustration(input: IllustrateInput): Promise<string> {
  let prompt = input.imagePrompt
  if (input.characters?.length) {
    const charDescs = input.characters.map(c => `${c.name}: ${c.description}`).join('. ')
    prompt += `\n\nCharacter descriptions for consistency: ${charDescs}`
  }
  prompt += '\n\nIMPORTANT: Do not include any text, words, letters, or writing in the image. Illustration only.'

  const imageBuffer = FAL_API_KEY
    ? await generateWithFal(prompt)
    : await generateWithDalle(prompt)

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
