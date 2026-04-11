import { GoogleGenerativeAI } from '@google/generative-ai'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { narrativeText: string; dialogue?: { speaker: string; line: string }[]; mood?: string; sceneDescription?: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const text = body.narrativeText?.trim()
  if (!text || text.length < 5) {
    return apiError('Narrative text must be at least 5 characters', 'VALIDATION_ERROR', 400)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are a professional children's book editor. Your job is to enrich and polish story page text to make it more vivid, emotional, and engaging for young readers.

Rules:
- Preserve the core story and events — do NOT change what happens
- Add sensory details (sights, sounds, textures, smells)
- Add emotional depth (how characters feel, their inner thoughts)
- Use vivid, age-appropriate language
- Make dialogue more natural and expressive
- Keep the same general length (don't make it much longer)
- Return ONLY a JSON object with the enriched content, no markdown

Return format:
{
  "narrativeText": "enriched narrative text",
  "dialogue": [{"speaker": "name", "line": "enriched line"}],
  "imagePrompt": "updated image prompt reflecting the enriched scene"
}

If there's no dialogue, return an empty array for dialogue.
If there's no scene context for imagePrompt, omit it.`,
    })

    let prompt = `Enrich this story page text:\n\n"${text}"`

    if (body.dialogue?.length) {
      prompt += `\n\nDialogue:\n${body.dialogue.map(d => `${d.speaker}: "${d.line}"`).join('\n')}`
    }
    if (body.mood) prompt += `\n\nMood: ${body.mood}`
    if (body.sceneDescription) prompt += `\n\nScene: ${body.sceneDescription}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()?.trim()

    if (!responseText) throw new Error('No response from Gemini')

    let jsonText = responseText
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const enriched = JSON.parse(jsonText)

    return apiSuccess({
      narrativeText: enriched.narrativeText || text,
      dialogue: enriched.dialogue || body.dialogue || [],
      imagePrompt: enriched.imagePrompt || undefined,
    })
  } catch (err) {
    console.error('enrich-page error:', err instanceof Error ? err.message : err)
    return API_ERRORS.INTERNAL()
  }
}
