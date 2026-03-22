import crypto from 'crypto'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleGenAI } from '@google/genai'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

    // Step 2: Fetch current image and convert to base64
    const currentImageResponse = await fetch(currentImageUrl)
    const currentImageArrayBuffer = await currentImageResponse.arrayBuffer()
    const currentImageBase64 = Buffer.from(currentImageArrayBuffer).toString('base64')

    // Step 3: Strip data URL prefix from original sketch
    const sketchBase64 = originalSketch.replace(/^data:image\/[^;]+;base64,/, '')

    // Step 4: Generate new image with Nano Banana
    const nanoBanana = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

    const response = await nanoBanana.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/png', data: sketchBase64 } },
            { inlineData: { mimeType: 'image/png', data: currentImageBase64 } },
            { text: refinedPrompt },
          ],
        },
      ],
      config: { responseModalities: ['IMAGE', 'TEXT'] },
    })

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts
    const imagePart = parts?.find(
      (p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data,
    )
    if (!imagePart?.inlineData?.data) {
      throw new Error('No image in refinement response')
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    const r2Path = `sketch-art/${crypto.randomUUID()}.png`
    const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')

    return apiSuccess({ imageUrl, prompt: refinedPrompt })
  } catch (err) {
    console.error('sketch-to-art/refine error:', err)
    return apiError(
      'Failed to refine the art. Please try again.',
      'REFINEMENT_FAILED',
      500,
    )
  }
}
