import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { buildCharPrompt } from '@/lib/font-generator/prompts'
import { callGeminiImage } from '@/lib/font-generator/gemini'
import type { FontStyle } from '@/tools/font-generator/types'

export const maxDuration = 15

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    projectId: string
    char: string
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

  if (!body.projectId?.trim() || !body.char?.trim() || !body.stylePreset?.trim()) {
    return apiError('projectId, char, and stylePreset are required', 'VALIDATION_ERROR', 400)
  }

  const style = body.stylePreset as FontStyle
  const prompt = buildCharPrompt(body.char, style, body.colors || [], body.customPrompt, !!body.referenceImageBase64)

  try {
    const imageBuffer = await callGeminiImage(prompt, body.referenceImageBase64)
    const r2Path = `font-generator/${body.projectId}/${body.char}.png`
    const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
    return apiSuccess({ char: body.char, imageUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return apiError(msg, 'GENERATION_FAILED', 500)
  }
}
