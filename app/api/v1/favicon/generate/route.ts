import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const CREDIT_COST = 1

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { prompt: string; style?: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const prompt = body.prompt?.trim()
  if (!prompt || prompt.length < 3) {
    return apiError('Prompt must be at least 3 characters', 'VALIDATION_ERROR', 400)
  }
  if (prompt.length > 500) {
    return apiError('Prompt must be under 500 characters', 'VALIDATION_ERROR', 400)
  }

  const style = body.style || 'Flat'
  const supabase = await createClient()

  // Deduct 1 credit
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_tool_id: 'favicon-generate',
    p_description: 'Favicon Generator — AI icon generation',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: CREDIT_COST })
    }
    console.error('favicon/generate deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Generate 4 simple favicon/icon designs as SVG code. Each SVG should be a 64x64 viewBox icon suitable for use as a website favicon.

Style: ${style}
Description: ${prompt}

Rules:
- Each SVG must use viewBox="0 0 64 64"
- Keep designs simple and recognizable at small sizes (16x16 pixels)
- Use bold shapes, minimal detail
- Each design should be a different interpretation of the prompt
- Use appropriate colors for the subject matter
- No text in the icons
- No external references or images
- Each SVG should be complete and self-contained

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{"icons":[{"name":"short name","svg":"<svg viewBox=\\"0 0 64 64\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>"},{"name":"short name","svg":"<svg...>...</svg>"},{"name":"short name","svg":"<svg...>...</svg>"},{"name":"short name","svg":"<svg...>...</svg>"}]}`
        }]
      }],
    })

    const text = result.response.text()
    if (!text) throw new Error('No response from AI')

    // Parse JSON — handle potential markdown wrapping
    let jsonStr = text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(jsonStr) as {
      icons: { name: string; svg: string }[]
    }

    // Validate and sanitize
    const icons = parsed.icons
      .slice(0, 4)
      .filter((icon) => icon.svg && icon.svg.includes('<svg') && icon.svg.includes('</svg>'))
      .map((icon) => ({
        name: icon.name || 'Icon',
        svg: icon.svg,
      }))

    if (icons.length === 0) {
      throw new Error('AI returned no valid SVG icons')
    }

    return apiSuccess({ icons })
  } catch (err) {
    console.error('favicon/generate error:', err)
    return apiError(
      'Failed to generate favicon. Your credit has been deducted — please try again.',
      'GENERATION_FAILED',
      500,
    )
  }
}
