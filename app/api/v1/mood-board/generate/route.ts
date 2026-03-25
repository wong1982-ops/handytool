// app/api/v1/mood-board/generate/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { callGeminiImage, callGeminiText } from '@/lib/mood-board/gemini'
import { buildMoodImagePrompt, buildPalettePrompt } from '@/lib/mood-board/prompts'
import { FONT_SUGGESTIONS, ELEMENT_DEFAULTS } from '@/tools/mood-board/types'
import type { BoardElement } from '@/tools/mood-board/types'

export const maxDuration = 60

export async function POST(request: Request) {
  let body: { theme: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.theme?.trim() || body.theme.trim().length < 3) {
    return apiError('Theme must be at least 3 characters', 'VALIDATION_ERROR', 400)
  }

  const theme = body.theme.trim()
  const boardId = crypto.randomUUID()
  const elements: BoardElement[] = []

  console.log(`[mood-board] Generating board for theme: "${theme}"`)

  // Generate 8 images in parallel
  const imageResults = await Promise.allSettled(
    Array.from({ length: 8 }, (_, i) => i).map(async (index) => {
      const prompt = buildMoodImagePrompt(theme, index)
      const buffer = await callGeminiImage(prompt)
      const r2Path = `mood-board/${boardId}/img-${index}.png`
      const imageUrl = await uploadToR2(r2Path, buffer, 'image/png')
      return { imageUrl, index }
    }),
  )

  const images = imageResults
    .filter((r): r is PromiseFulfilledResult<{ imageUrl: string; index: number }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[mood-board] Images: ${images.length}/8 succeeded`)

  // Place images on canvas with organic layout
  images.forEach(({ imageUrl }, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    elements.push({
      id: `img-${crypto.randomUUID().slice(0, 8)}`,
      type: 'image',
      x: 40 + col * 220 + (Math.random() * 20 - 10),
      y: 20 + row * 220 + (Math.random() * 20 - 10),
      width: ELEMENT_DEFAULTS.image.width,
      height: ELEMENT_DEFAULTS.image.height,
      rotation: Math.random() * 6 - 3,
      data: { imageUrl, alt: `${theme} mood ${i + 1}` },
    })
  })

  // Generate color palette via text model
  try {
    const paletteResponse = await callGeminiText(buildPalettePrompt(theme))
    const colorMatch = paletteResponse.match(/\[[\s\S]*?\]/)
    if (colorMatch) {
      const colors: string[] = JSON.parse(colorMatch[0])
      if (colors.length >= 5) {
        elements.push({
          id: `pal-${crypto.randomUUID().slice(0, 8)}`,
          type: 'palette',
          x: 40 + (Math.random() * 20),
          y: 460 + (Math.random() * 20),
          width: ELEMENT_DEFAULTS.palette.width,
          height: ELEMENT_DEFAULTS.palette.height,
          rotation: Math.random() * 4 - 2,
          data: { colors: colors.slice(0, 5) },
        })
      }
    }
  } catch (err) {
    console.error('[mood-board] Palette generation failed:', err)
  }

  // Add font suggestions (deterministic based on theme length)
  const fontIndex = theme.length % FONT_SUGGESTIONS.length
  const fontPair = FONT_SUGGESTIONS[fontIndex]
  elements.push({
    id: `font-h-${crypto.randomUUID().slice(0, 8)}`,
    type: 'font',
    x: 300 + (Math.random() * 20),
    y: 460 + (Math.random() * 20),
    width: ELEMENT_DEFAULTS.font.width,
    height: ELEMENT_DEFAULTS.font.height,
    rotation: Math.random() * 4 - 2,
    data: { fontFamily: fontPair.heading, category: 'heading' as const, sampleText: theme },
  })
  elements.push({
    id: `font-b-${crypto.randomUUID().slice(0, 8)}`,
    type: 'font',
    x: 540 + (Math.random() * 20),
    y: 460 + (Math.random() * 20),
    width: ELEMENT_DEFAULTS.font.width,
    height: ELEMENT_DEFAULTS.font.height,
    rotation: Math.random() * 4 - 2,
    data: { fontFamily: fontPair.body, category: 'body' as const, sampleText: 'The quick brown fox jumps over the lazy dog' },
  })

  if (elements.length === 0) {
    return apiError('Board generation failed — no elements created', 'GENERATION_FAILED', 500)
  }

  return apiSuccess({ boardId, elements })
}
