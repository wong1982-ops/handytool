import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { buildCharPrompt } from '@/lib/font-generator/prompts'
import { callGeminiImage } from '@/lib/font-generator/gemini'
import { PREVIEW_CHARS } from '@/tools/font-generator/types'
import type { FontStyle } from '@/tools/font-generator/types'

export const maxDuration = 30

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    stylePreset: string
    customPrompt?: string
    colors?: string[]
    referenceImageBase64?: string
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.stylePreset?.trim()) {
    return apiError('stylePreset is required', 'VALIDATION_ERROR', 400)
  }

  const projectId = crypto.randomUUID()
  const style = body.stylePreset as FontStyle

  console.log(`[font-generator] Generating ${PREVIEW_CHARS.length} preview characters...`)

  const results = await Promise.allSettled(
    PREVIEW_CHARS.map(async (char) => {
      const prompt = buildCharPrompt(char, style, body.colors || [], body.customPrompt, !!body.referenceImageBase64)
      const imageBuffer = await callGeminiImage(prompt, body.referenceImageBase64)
      const r2Path = `font-generator/${projectId}/${char}.png`
      const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
      return { char, imageUrl }
    }),
  )

  const characters = results
    .filter((r): r is PromiseFulfilledResult<{ char: string; imageUrl: string }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[font-generator] Preview: ${characters.length}/${PREVIEW_CHARS.length} succeeded`)

  if (characters.length === 0) {
    const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined
    const msg = firstError?.reason instanceof Error ? firstError.reason.message : 'All generations failed'
    return apiError(`Preview failed: ${msg}`, 'GENERATION_FAILED', 500)
  }

  return apiSuccess({ projectId, characters })
}
