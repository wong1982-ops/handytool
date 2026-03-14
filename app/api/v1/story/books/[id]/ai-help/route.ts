import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

type AIAction = 'rewrite' | 'expand' | 'shorten' | 'fix_grammar' | 'suggest_dialogue'

const ACTION_INSTRUCTIONS: Record<AIAction, string> = {
  rewrite: `Rewrite the text to be more vivid and engaging while preserving the same meaning, events, and tone.
Keep a similar length. Make language more expressive and polished.`,
  expand: `Expand the text by adding sensory details, emotional depth, and descriptive language.
Add roughly 30-50% more content. Preserve all original events and meaning.`,
  shorten: `Condense the text to be more concise while preserving key events, meaning, and emotional impact.
Remove redundancy and unnecessary words. Aim for roughly 30-40% shorter.`,
  fix_grammar: `Fix all grammar, spelling, punctuation, and awkward phrasing issues.
Preserve the original meaning, style, and voice exactly. Only correct errors.`,
  suggest_dialogue: `Based on the text provided, suggest natural dialogue lines that characters might say.
Return 2-4 dialogue lines that fit the scene. Make dialogue expressive and age-appropriate for a children's book.`,
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await params // validate route param exists
  const effectiveUserId = await getAuthUserId()
  if (!effectiveUserId) return API_ERRORS.UNAUTHORIZED()

  let body: { action: AIAction; text: string; field?: string; pageSequence?: number }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { action, text, field } = body

  if (!action || !ACTION_INSTRUCTIONS[action]) {
    return apiError('Invalid action', 'VALIDATION_ERROR', 400)
  }

  if (!text?.trim() || text.trim().length < 3) {
    return apiError('Text must be at least 3 characters', 'VALIDATION_ERROR', 400)
  }

  try {
    const fieldContext = field ? `The text is from the "${field}" field of a children's story page.` : ''

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are a professional children's book editor helping improve story content.
${fieldContext}

Rules:
- Write age-appropriate content for children's books
- Preserve the original intent and context
- Return ONLY a JSON object, no markdown fences
- For "suggest_dialogue" action, return: {"dialogue": [{"speaker": "Name", "line": "text"}]}
- For all other actions, return: {"text": "improved text"}`,
    })

    const prompt = `${ACTION_INSTRUCTIONS[action]}\n\nOriginal text:\n"${text.trim()}"`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()?.trim()

    if (!responseText) throw new Error('No response from Gemini')

    let jsonText = responseText
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonText)

    return apiSuccess({
      text: parsed.text || undefined,
      dialogue: parsed.dialogue || undefined,
    })
  } catch (err) {
    console.error('ai-help error:', err instanceof Error ? err.message : err)
    return API_ERRORS.INTERNAL()
  }
}
