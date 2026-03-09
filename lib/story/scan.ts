import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `You are a story extraction specialist. You will be given photographs of storybook pages — they may be handwritten or printed, and some pages may have overlapping content.

Your task:
1. Extract all readable text from every image
2. Identify and deduplicate overlapping content between pages
3. Reconstruct the complete story in chronological order
4. Rewrite the story as a clean, vivid plot summary suitable for creating an illustrated children's storybook

Output rules:
- Write a single cohesive plot summary (not page-by-page)
- Preserve the story's core characters, setting, and key events
- Use clear, engaging language
- Keep it between 100–500 words
- Do NOT include any commentary, headers, or meta-text — just the plot summary`

/**
 * Extract story text from uploaded images using Gemini vision.
 * Sends all images in a single multimodal request.
 */
export async function extractStoryFromImages(imageBuffers: { data: Buffer; mimeType: string }[]): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  })

  const imageParts = imageBuffers.map((img) => ({
    inlineData: {
      data: img.data.toString('base64'),
      mimeType: img.mimeType,
    },
  }))

  const result = await model.generateContent([
    ...imageParts,
    { text: 'Extract the story from these pages and rewrite it as a clean plot summary.' },
  ])

  const text = result.response.text()?.trim()
  if (!text || text.length < 20) {
    throw new Error('EXTRACTION_FAILED')
  }

  return text
}
