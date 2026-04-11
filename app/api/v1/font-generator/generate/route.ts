import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { buildCharPrompt } from '@/lib/font-generator/prompts'
import { callGeminiImage } from '@/lib/font-generator/gemini'
import { FULL_CHARS } from '@/tools/font-generator/types'
import type { FontStyle } from '@/tools/font-generator/types'

export const maxDuration = 60

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    projectId: string
    stylePreset: string
    customPrompt?: string
    colors?: string[]
    referenceImageBase64?: string
    existingChars?: string[]
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.projectId?.trim() || !body.stylePreset?.trim()) {
    return apiError('projectId and stylePreset are required', 'VALIDATION_ERROR', 400)
  }

  const style = body.stylePreset as FontStyle
  const existing = new Set(body.existingChars || [])
  const remaining = FULL_CHARS.filter((c) => !existing.has(c))

  console.log(`[font-generator] Generating ${remaining.length} remaining characters...`)

  const results = await Promise.allSettled(
    remaining.map(async (char) => {
      const prompt = buildCharPrompt(char, style, body.colors || [], body.customPrompt, !!body.referenceImageBase64)
      const imageBuffer = await callGeminiImage(prompt, body.referenceImageBase64)
      const r2Path = `font-generator/${body.projectId}/${char}.png`
      const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
      return { char, imageUrl }
    }),
  )

  const characters = results
    .filter((r): r is PromiseFulfilledResult<{ char: string; imageUrl: string }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[font-generator] Full set: ${characters.length}/${remaining.length} succeeded`)

  return apiSuccess({ characters })
}
