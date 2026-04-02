// app/api/v1/mood-board/generate/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { callGeminiImage, callGeminiText } from '@/lib/mood-board/gemini'
import { buildMoodImagePrompt, buildPalettePrompt } from '@/lib/mood-board/prompts'
import { FONT_SUGGESTIONS } from '@/tools/mood-board/types'
import type { BoardElement, MoodOption, ColorPreference } from '@/tools/mood-board/types'

export const maxDuration = 60

export async function POST(request: Request) {
  let body: { theme: string; mood?: string; colorPreference?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.theme?.trim() || body.theme.trim().length < 3) {
    return apiError('Theme must be at least 3 characters', 'VALIDATION_ERROR', 400)
  }

  const theme = body.theme.trim()
  const mood = (body.mood as MoodOption) ?? null
  const colorPreference = (body.colorPreference as ColorPreference) ?? undefined
  const boardId = crypto.randomUUID()
  const elements: BoardElement[] = []

  console.log(`[mood-board] Generating board for theme: "${theme}"`)

  // Generate 8 images in parallel
  const imageResults = await Promise.allSettled(
    Array.from({ length: 8 }, (_, i) => i).map(async (index) => {
      const prompt = buildMoodImagePrompt(theme, index, mood, colorPreference)
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

  // Place images using order-based layout
  images.forEach(({ imageUrl }, i) => {
    elements.push({
      id: `img-${crypto.randomUUID().slice(0, 8)}`,
      type: 'image',
      order: i,
      width: 200,
      height: 200,
      data: { imageUrl, alt: `${theme} mood ${i + 1}` },
    })
  })

  // Generate color palette via text model
  try {
    const paletteResponse = await callGeminiText(buildPalettePrompt(theme, mood, colorPreference))
    const colorMatch = paletteResponse.match(/\[[\s\S]*?\]/)
    if (colorMatch) {
      const colors: string[] = JSON.parse(colorMatch[0])
      if (colors.length >= 5) {
        elements.push({
          id: `pal-${crypto.randomUUID().slice(0, 8)}`,
          type: 'palette',
          order: elements.length,
          width: 250,
          height: 60,
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
    order: elements.length,
    width: 220,
    height: 80,
    data: { fontFamily: fontPair.heading, category: 'heading' as const, sampleText: theme },
  })
  elements.push({
    id: `font-b-${crypto.randomUUID().slice(0, 8)}`,
    type: 'font',
    order: elements.length,
    width: 220,
    height: 80,
    data: { fontFamily: fontPair.body, category: 'body' as const, sampleText: 'The quick brown fox jumps over the lazy dog' },
  })

  if (elements.length === 0) {
    return apiError('Board generation failed — no elements created', 'GENERATION_FAILED', 500)
  }

  return apiSuccess({ boardId, elements, mood, colorPreference })
}
