import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateIllustration } from '@/lib/story/illustrate'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const CREDIT_COST = 1

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { originalPrompt: string; userFeedback: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { originalPrompt, userFeedback } = body

  if (!originalPrompt?.trim()) {
    return apiError('Original prompt is required', 'VALIDATION_ERROR', 400)
  }
  if (!userFeedback?.trim()) {
    return apiError('User feedback is required', 'VALIDATION_ERROR', 400)
  }

  // Deduct credit
  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_tool_id: 'ecard-ai-refine',
    p_description: 'AI Business Card — refine design',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: CREDIT_COST })
    }
    console.error('ecard/refine-card deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    // Step 1: Gemini rewrites the prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'You are refining a business card design prompt. Incorporate the user\'s feedback while keeping all business information intact. Return ONLY the updated prompt, nothing else.',
    })

    const result = await model.generateContent(
      `Original prompt:\n${originalPrompt}\n\nFeedback: ${userFeedback}\n\nReturn the refined prompt.`,
    )

    const refinedPrompt = result.response.text()?.trim()
    if (!refinedPrompt) throw new Error('No refined prompt from AI')

    // Step 2: Generate new image
    const illustration = await generateIllustration({ imagePrompt: refinedPrompt })

    if (!illustration?.url) {
      throw new Error('Image generation returned no URL')
    }

    return apiSuccess({
      design: {
        imageUrl: illustration.url,
        style: 'Refined',
        prompt: refinedPrompt,
      },
    })
  } catch (err) {
    console.error('ecard/refine-card error:', err)
    return apiError(
      'Failed to refine card design. Your credit has been deducted — please try again.',
      'REFINEMENT_FAILED',
      500,
    )
  }
}
