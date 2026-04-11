import { z } from 'zod'
import { API_ERRORS, getAuthUserId } from '@/lib/api/response'

export const maxDuration = 30

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const schema = z.object({
  spreadId: z.string().min(1),
  spreadName: z.string().min(1),
  question: z.string().max(500).default(''),
  language: z.enum(['en', 'zh']).default('en'),
  cards: z
    .array(
      z.object({
        cardId: z.number().int().min(0).max(77),
        positionLabel: z.string(),
        cardName: z.string(),
        reversed: z.boolean(),
        meaning: z.string(),
      }),
    )
    .min(1)
    .max(15),
})

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

interface GeminiCardResult {
  position: string
  cardName: string
  interpretation: string
}

interface GeminiReadingResult {
  cards: GeminiCardResult[]
  narrative: string
}

function buildPrompt(
  spreadName: string,
  question: string,
  language: 'en' | 'zh',
  cards: z.infer<typeof schema>['cards'],
): string {
  const langInstruction =
    language === 'zh'
      ? 'Respond entirely in Traditional Chinese (繁體中文).'
      : 'Respond entirely in English.'

  const cardList = cards
    .map(
      (c, i) =>
        `${i + 1}. Position: "${c.positionLabel}" — ${c.cardName}${c.reversed ? ' (Reversed)' : ''}\n   Meaning: ${c.meaning}`,
    )
    .join('\n')

  const questionSection = question.trim()
    ? `The seeker's question: "${question}"`
    : 'The seeker did not provide a specific question — offer a general reading.'

  return `You are a wise and empathetic tarot reader. ${langInstruction}

Spread: ${spreadName}
${questionSection}

Cards drawn:
${cardList}

Provide a JSON response with this exact structure:
{
  "cards": [
    {
      "position": "<position label>",
      "cardName": "<card name with orientation>",
      "interpretation": "<2-3 sentences interpreting this card in its position>"
    }
  ],
  "narrative": "<A holistic 3-5 sentence narrative weaving all cards together into a cohesive reading>"
}

Return ONLY valid JSON, no markdown fences or extra text.`
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { spreadId: _spreadId, spreadName, question, language, cards } = parsed.data

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Anonymous users are allowed — attempt to get userId but don't require it
  const userId = await getAuthUserId()

  const prompt = buildPrompt(spreadName, question, language, cards)

  const geminiBody = {
    system_instruction: {
      parts: [{ text: 'You are a wise and empathetic tarot reader.' }],
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          cards: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                position: { type: 'STRING' },
                cardName: { type: 'STRING' },
                interpretation: { type: 'STRING' },
              },
              required: ['position', 'cardName', 'interpretation'],
            },
          },
          narrative: { type: 'STRING' },
        },
        required: ['cards', 'narrative'],
      },
    },
  }

  function stripCodeFences(text: string): string {
    let cleaned = text.trim()
    // Remove ```json or ``` opening fence
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '')
    // Remove closing fence
    cleaned = cleaned.replace(/\s*```\s*$/, '')
    return cleaned.trim()
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(sseEvent(data)))
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody),
        })

        if (!response.ok) {
          const errText = await response.text()
          console.error('tarot/reading: Gemini API error —', response.status, errText)
          send({ type: 'error', message: 'AI reading failed. Please try again.' })
          return
        }

        const geminiData = await response.json() as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> }
          }>
        }

        const rawText =
          geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

        let result: GeminiReadingResult
        try {
          result = JSON.parse(stripCodeFences(rawText)) as GeminiReadingResult
        } catch {
          console.error('tarot/reading: Failed to parse Gemini JSON —', rawText.slice(0, 500))
          send({ type: 'error', message: 'Failed to parse reading. Please try again.' })
          return
        }

        if (!result?.cards || !Array.isArray(result.cards)) {
          console.error('tarot/reading: Gemini response missing cards array —', rawText.slice(0, 500))
          send({ type: 'error', message: 'AI returned malformed response. Please try again.' })
          return
        }

        // Stream one event per card
        for (let i = 0; i < result.cards.length; i++) {
          const card = result.cards[i]
          send({
            type: 'card',
            index: i,
            position: card.position,
            cardName: card.cardName,
            interpretation: card.interpretation,
          })
        }

        // Stream the holistic narrative
        send({ type: 'narrative', text: result.narrative })

        // Signal completion
        send({ type: 'done', userId: userId ?? null })
      } catch (err) {
        const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
        console.error('tarot/reading: Unexpected error —', message)
        send({ type: 'error', message: 'An unexpected error occurred. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
