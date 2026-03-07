import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { regenerateStoryRequestSchema } from '@/lib/story/types'
import { CREDIT_COSTS } from '@/lib/story/validation'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = regenerateStoryRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.regenerateStory,
    p_description: 'Story Studio — story regeneration',
  })
  if (deductError) return API_ERRORS.FORBIDDEN()

  try {
    const { book, pageCount } = parsed.data
    const styleDesc = book.style.customPrompt || book.style.preset

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `You are a professional children's book author. The user has an existing story that they've edited. Regenerate the story incorporating their changes while maintaining consistency. Keep the same characters and setting unless explicitly changed. Respond with the same JSON structure as the original. Art style: ${styleDesc}. Exactly ${pageCount} pages. Every imagePrompt must start with the art style and include full character physical descriptions. Do not include text/words in image prompts.`,
      messages: [{
        role: 'user',
        content: `Here is the current story state. Please regenerate it with improvements while keeping the user's edits:\n\n${JSON.stringify(book, null, 2)}`,
      }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No response')

    let jsonText = textBlock.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    return apiSuccess(JSON.parse(jsonText))
  } catch (err) {
    console.error('story/regenerate-story: failed', err)
    try {
      await supabase.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: CREDIT_COSTS.regenerateStory,
        p_description: 'Story Studio — regeneration failed (refund)',
      })
    } catch {
      // Silently ignore refund failures
    }
    return API_ERRORS.INTERNAL()
  }
}
