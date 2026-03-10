import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const REPHRASE_CREDIT_COST = 1

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { plot: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const plot = body.plot?.trim()
  if (!plot || plot.length < 10) {
    return apiError('Plot must be at least 10 characters', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()

  // Deduct 1 credit
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: REPHRASE_CREDIT_COST,
    p_tool_id: 'story-rephrase',
    p_description: 'Story Studio — Rephrase plot with AI',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: REPHRASE_CREDIT_COST })
    }
    console.error('rephrase-plot deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are a professional story editor. Your job is to take a rough story idea and rephrase it into a clear, vivid, and well-structured story premise that works well as input for an AI story generation model.

Rules:
- Keep the core idea and characters intact — do NOT change the plot
- Make it descriptive, vivid, and engaging
- Structure it with clear setting, characters, conflict, and stakes
- Use present tense for immediacy
- Keep it concise (2-4 sentences max)
- Do NOT add new plot elements the user didn't mention
- Do NOT wrap in quotes or add any prefix/suffix — just return the rephrased text directly`,
    })

    const result = await model.generateContent(
      `Rephrase this rough story idea into a polished, vivid story premise:\n\n${plot}`,
    )
    const text = result.response.text()?.trim()

    if (!text) throw new Error('No response from Gemini')

    return apiSuccess({ rephrasedPlot: text })
  } catch (err) {
    console.error('rephrase-plot error:', err instanceof Error ? err.message : err)
    return API_ERRORS.INTERNAL()
  }
}
