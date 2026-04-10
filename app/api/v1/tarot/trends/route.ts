import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  if (!GEMINI_API_KEY) {
    return apiError('AI service not configured', 'AI_NOT_CONFIGURED', 503)
  }

  // Fetch last 30 readings
  const supabase = await createClient()
  const { data, error } = await (supabase.from as any)('tarot_readings')
    .select('spread_id, question, cards, interpretation')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('[tarot/trends] DB error:', error)
    return API_ERRORS.INTERNAL()
  }

  const readings = data || []

  if (readings.length < 5) {
    return apiError('Need at least 5 readings', 'INSUFFICIENT_DATA', 400)
  }

  // Build summary string for Gemini
  const summaryLines = readings.map((r: any, i: number) => {
    const cardIds = Array.isArray(r.cards)
      ? r.cards.map((c: any) => c.cardId).join(', ')
      : 'unknown'
    return `${i + 1}. spread: "${r.spread_id}", question: "${r.question || 'none'}", cards: [${cardIds}]`
  })
  const summary = summaryLines.join('\n')

  const prompt = `You are a tarot analyst. Analyze the following tarot reading history and identify patterns.

Reading history (most recent first):
${summary}

Respond with a JSON object containing:
- frequentCards: array of strings naming cards that appear most often (use the card IDs/numbers)
- recurringThemes: array of strings describing recurring life themes
- insights: array of 3-5 short insight strings about the person's journey
- narrative: a 2-3 sentence paragraph summarizing the overall spiritual narrative

Respond ONLY with valid JSON, no markdown, no code blocks.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[tarot/trends] Gemini error:', err)
      return API_ERRORS.INTERNAL()
    }

    const geminiData = await response.json()
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    let result: {
      frequentCards?: string[]
      recurringThemes?: string[]
      insights?: string[]
      narrative?: string
    }

    try {
      result = JSON.parse(text)
    } catch {
      console.error('[tarot/trends] Failed to parse Gemini JSON:', text)
      return API_ERRORS.INTERNAL()
    }

    return apiSuccess({
      frequentCards: Array.isArray(result.frequentCards) ? result.frequentCards : [],
      recurringThemes: Array.isArray(result.recurringThemes) ? result.recurringThemes : [],
      insights: Array.isArray(result.insights) ? result.insights : [],
      narrative: typeof result.narrative === 'string' ? result.narrative : '',
    })
  } catch (e) {
    console.error('[tarot/trends] Error:', e)
    return API_ERRORS.INTERNAL()
  }
}
