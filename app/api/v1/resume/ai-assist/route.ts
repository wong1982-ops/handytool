import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { z } from 'zod'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const schema = z.object({
  action: z.enum(['polish', 'continue', 'expand']),
  content: z.string().min(1).max(10000),
  context: z.object({
    module: z.string(),
    locale: z.enum(['en', 'zh']),
    jobTitle: z.string().optional(),
  }),
})

const SYSTEM_PROMPTS: Record<string, (locale: string, jobTitle?: string) => string> = {
  polish: (locale, jobTitle) =>
    `You are a professional resume writing assistant. Polish the following resume section for clarity, grammar, and professional tone. ${
      jobTitle ? `The target position is: ${jobTitle}.` : ''
    } Respond in ${locale === 'zh' ? 'Chinese' : 'English'}. Return only the improved text as HTML (use <p>, <ul>, <li>, <strong> tags). Do not include any explanation.`,

  continue: (locale, jobTitle) =>
    `You are a professional resume writing assistant. Continue writing this resume section with relevant, specific details. ${
      jobTitle ? `The target position is: ${jobTitle}.` : ''
    } Respond in ${locale === 'zh' ? 'Chinese' : 'English'}. Return only the additional text as HTML. Do not repeat existing content.`,

  expand: (locale, jobTitle) =>
    `You are a professional resume writing assistant. Expand each point in this resume section with specific details, quantifiable achievements, and metrics where possible. ${
      jobTitle ? `The target position is: ${jobTitle}.` : ''
    } Respond in ${locale === 'zh' ? 'Chinese' : 'English'}. Return only the expanded text as HTML. Keep the same structure but make each point more impactful.`,
}

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

  const { action, content, context } = parsed.data
  const systemPrompt = SYSTEM_PROMPTS[action](context.locale, context.jobTitle)

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nResume section content:\n${content}` }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return apiError('AI generation failed', 'AI_ERROR', 502)
    }

    const data = await response.json()
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return apiSuccess({ result })
  } catch (e) {
    console.error('AI assist error:', e)
    return apiError('AI service error', 'AI_ERROR', 500)
  }
}
