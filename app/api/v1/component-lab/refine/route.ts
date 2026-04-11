// app/api/v1/component-lab/refine/route.ts
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { buildRefinePrompt } from '@/tools/component-lab/prompts'
import type { ComponentSettings, Framework, GeneratedCode } from '@/tools/component-lab/types'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    prompt: string
    currentCode: string
    framework: Framework
    instruction: string
    settings: ComponentSettings
  }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.instruction?.trim()) {
    return apiError('instruction is required', 'VALIDATION_ERROR', 400)
  }

  const geminiPrompt = buildRefinePrompt(
    body.prompt,
    body.currentCode,
    body.framework,
    body.instruction.trim(),
    body.settings,
  )

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: geminiPrompt }] }] }),
    })

    if (!response.ok) {
      return apiError('Refinement failed', 'GENERATION_FAILED', 500)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return apiError('Invalid AI response', 'GENERATION_FAILED', 500)

    const result = JSON.parse(jsonMatch[0])
    const code: GeneratedCode = {
      react: result.react || '',
      vue: result.vue || '',
      svelte: result.svelte || '',
      html: result.html || '',
    }

    return apiSuccess({ code, summary: result.summary || 'Changes applied' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Refinement failed'
    return apiError(msg, 'GENERATION_FAILED', 500)
  }
}
