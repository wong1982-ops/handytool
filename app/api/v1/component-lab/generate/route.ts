// app/api/v1/component-lab/generate/route.ts
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { buildGeneratePrompt } from '@/tools/component-lab/prompts'
import type { ComponentSettings, GeneratedCode } from '@/tools/component-lab/types'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { prompt: string; settings: ComponentSettings; referenceImageBase64?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.prompt?.trim()) {
    return apiError('prompt is required', 'VALIDATION_ERROR', 400)
  }

  const geminiPrompt = buildGeneratePrompt(body.prompt.trim(), body.settings)

  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
    { text: geminiPrompt },
  ]
  if (body.referenceImageBase64) {
    parts.unshift({
      inlineData: { mimeType: 'image/jpeg', data: body.referenceImageBase64 },
    })
    parts.push({ text: 'Use this image as visual reference for the component design.' })
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    })

    if (!response.ok) {
      const err = await response.text()
      return apiError(`Generation failed: ${err.substring(0, 200)}`, 'GENERATION_FAILED', 500)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return apiError('Invalid AI response', 'GENERATION_FAILED', 500)

    const code: GeneratedCode = JSON.parse(jsonMatch[0])

    if (!code.react && !code.html) {
      return apiError('No code generated', 'GENERATION_FAILED', 500)
    }

    return apiSuccess(code)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return apiError(msg, 'GENERATION_FAILED', 500)
  }
}
