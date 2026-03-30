import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { z } from 'zod'

export const maxDuration = 60

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const schema = z.object({
  resumeData: z.object({
    locale: z.enum(['en', 'zh']),
    baseInfo: z.any(),
    jobIntention: z.any(),
    education: z.any(),
    workExperience: z.any(),
    projects: z.any(),
    skillsCertificates: z.any(),
    selfEvaluation: z.any(),
    training: z.any(),
    awards: z.any(),
    internships: z.any(),
    customSections: z.any(),
    enabledModules: z.array(z.string()),
  }),
})

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

  const { resumeData } = parsed.data
  const locale = resumeData.locale

  const prompt = `You are a professional resume reviewer. Analyze the following resume data and provide feedback.

Respond in ${locale === 'zh' ? 'Chinese' : 'English'}.

Resume data (JSON):
${JSON.stringify(resumeData, null, 2)}

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}

Scoring criteria:
- Completeness: Are all key sections filled in?
- Quality: Is the content specific, quantifiable, and professional?
- Relevance: Does the content align with the target position?
- Formatting: Are entries well-structured with dates and descriptions?
- Missing sections: Deduct points for empty enabled modules.`

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
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return apiError('AI analysis failed', 'AI_ERROR', 502)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    let result
    try {
      result = JSON.parse(text)
    } catch {
      return apiError('Failed to parse AI response', 'AI_PARSE_ERROR', 502)
    }

    return apiSuccess({
      score: Number(result.score) || 0,
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    })
  } catch (e) {
    console.error('AI analyze error:', e)
    return apiError('AI service error', 'AI_ERROR', 500)
  }
}
