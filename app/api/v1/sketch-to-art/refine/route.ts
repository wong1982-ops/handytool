import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateIllustration } from '@/lib/story/illustrate'

export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    originalSketch: string
    currentImageUrl: string
    feedback: string
    style: string
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { originalSketch, currentImageUrl, feedback, style } = body

  if (!originalSketch?.trim()) {
    return apiError('Original sketch is required', 'VALIDATION_ERROR', 400)
  }
  if (!currentImageUrl?.trim()) {
    return apiError('Current image URL is required', 'VALIDATION_ERROR', 400)
  }
  if (!feedback?.trim()) {
    return apiError('Feedback is required', 'VALIDATION_ERROR', 400)
  }

  try {
    // Step 1: Use Gemini 2.5 Flash to rewrite prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'You refine art generation prompts. Given the original style and user feedback, write an improved prompt. Return ONLY the new prompt.',
    })

    const result = await model.generateContent(
      `Original style: ${style}\nFeedback: ${feedback}\nWrite the refined prompt.`,
    )

    const refinedPrompt = result.response.text()?.trim()
    if (!refinedPrompt) throw new Error('No refined prompt from AI')

    // Step 2: Convert original sketch to Buffer
    const sketchBase64 = originalSketch.replace(/^data:image\/[^;]+;base64,/, '')
    const sketchBuffer = Buffer.from(sketchBase64, 'base64')

    // Step 3: Generate new image using the proven illustrate pipeline
    const genResult = await generateIllustration({
      imagePrompt: refinedPrompt,
      referenceImage: sketchBuffer,
    })

    return apiSuccess({ imageUrl: genResult.url, prompt: refinedPrompt })
  } catch (err) {
    console.error('sketch-to-art/refine error:', err)
    return apiError(
      'Failed to refine the art. Please try again.',
      'REFINEMENT_FAILED',
      500,
    )
  }
}
