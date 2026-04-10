import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { z } from 'zod'
import { TAROT_SPREADS } from '@/tools/tarot/tarot-spreads'

export const maxDuration = 15

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const schema = z.object({
  question: z.string().min(1).max(500),
  language: z.enum(['en', 'zh']).default('en'),
})

const FALLBACK_SPREAD_ID = 'three-card'

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return apiError('AI service not configured', 'AI_NOT_CONFIGURED', 503)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON', 'VALIDATION_ERROR', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)
  }

  const { question, language } = parsed.data

  const spreadList = TAROT_SPREADS.map(
    (s) => `- id: "${s.id}", name: "${s.name.en}", cards: ${s.cardCount}, category: "${s.category}", description: "${s.description.en}"`,
  ).join('\n')

  const prompt = `You are a tarot reading assistant. Based on the user's question, recommend the single best tarot spread from the list below.

User question: "${question}"

Available spreads:
${spreadList}

Choose the spread that best matches the theme, depth, and intent of the question. Respond in ${language === 'zh' ? 'Chinese' : 'English'}.

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "spreadId": "<id from the list>",
  "reason": "<one sentence explaining why this spread fits the question>"
}`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[tarot/recommend-spread] Gemini API error:', err)
      return apiSuccess({ spreadId: FALLBACK_SPREAD_ID, reason: '' })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    let result: { spreadId?: string; reason?: string }
    try {
      result = JSON.parse(text)
    } catch {
      console.warn('[tarot/recommend-spread] Failed to parse Gemini response, using fallback')
      return apiSuccess({ spreadId: FALLBACK_SPREAD_ID, reason: '' })
    }

    const spreadId = typeof result.spreadId === 'string' ? result.spreadId : ''
    const isValid = TAROT_SPREADS.some((s) => s.id === spreadId)

    return apiSuccess({
      spreadId: isValid ? spreadId : FALLBACK_SPREAD_ID,
      reason: typeof result.reason === 'string' ? result.reason : '',
    })
  } catch (e) {
    console.error('[tarot/recommend-spread] Error:', e)
    return apiSuccess({ spreadId: FALLBACK_SPREAD_ID, reason: '' })
  }
}
