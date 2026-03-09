import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'
import { regenerateStoryRequestSchema } from '@/lib/story/types'
import { CREDIT_COSTS } from '@/lib/story/validation'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = regenerateStoryRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COSTS.regenerateStory,
    p_description: 'Story Studio — story regeneration',
  })
  if (deductError) return API_ERRORS.FORBIDDEN()

  try {
    const { book, pageCount } = parsed.data
    const styleDesc = book.concept.tags.style

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are a professional children's book author. The user has an existing story that they've edited. Regenerate the story incorporating their changes while maintaining consistency. Keep the same characters and setting unless explicitly changed. Respond with the same JSON structure as the original. Art style: ${styleDesc}. Exactly ${pageCount} pages. Every imagePrompt must start with the art style and include full character physical descriptions. Do not include text/words in image prompts. Respond ONLY with the JSON object, no markdown code fences.`,
    })

    const result = await model.generateContent(
      `Here is the current story state. Please regenerate it with improvements while keeping the user's edits:\n\n${JSON.stringify(book, null, 2)}`
    )

    const text = result.response.text()
    if (!text) throw new Error('No response')

    let jsonText = text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    return apiSuccess(JSON.parse(jsonText))
  } catch (err) {
    console.error('story/regenerate-story: failed', err)
    try {
      await supabase.rpc('refund_credits', {
        p_user_id: userId,
        p_amount: CREDIT_COSTS.regenerateStory,
        p_description: 'Story Studio — regeneration failed (refund)',
      })
    } catch {
      // Silently ignore refund failures
    }
    return API_ERRORS.INTERNAL()
  }
}
