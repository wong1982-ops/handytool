import { GoogleGenerativeAI } from '@google/generative-ai'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
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
