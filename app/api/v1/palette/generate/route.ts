import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const CREDIT_COST = 1

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { prompt: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const prompt = body.prompt?.trim()
  if (!prompt || prompt.length < 3) {
    return apiError('Prompt must be at least 3 characters', 'VALIDATION_ERROR', 400)
  }
  if (prompt.length > 500) {
    return apiError('Prompt must be under 500 characters', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()

  // Deduct 1 credit
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_tool_id: 'palette-generate',
    p_description: 'Color Palette — AI palette generation',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: CREDIT_COST })
    }
    console.error('palette/generate deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an expert color designer. Generate color palettes based on user descriptions.

Rules:
- Always return exactly 3 palette suggestions
- Each palette has exactly 5 colors
- Colors must be valid 6-digit hex codes (e.g. "#3D6AF2")
- Each palette should have good contrast and harmony
- Colors should match the mood, brand, or theme described
- Include a short name for each palette (2-3 words)
- Ensure colors are diverse enough to be distinguishable
- Consider accessibility — avoid colors that are too similar`,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            palettes: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING, description: 'Short palette name (2-3 words)' },
                  colors: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING, description: 'Hex color code like #3D6AF2' },
                  },
                },
                required: ['name', 'colors'],
              },
            },
          },
          required: ['palettes'],
        },
      },
    })

    const result = await model.generateContent(
      `Generate 3 beautiful, harmonious color palettes for: "${prompt}". Each palette should have 5 colors that work well together and evoke the described mood/theme.`
    )

    const text = result.response.text()
    if (!text) throw new Error('No response from AI')

    const parsed = JSON.parse(text) as {
      palettes: { name: string; colors: string[] }[]
    }

    // Validate and sanitize
    const palettes = parsed.palettes
      .slice(0, 3)
      .map((p) => ({
        name: p.name || 'Untitled',
        colors: p.colors
          .slice(0, 5)
          .map((c) => (c.startsWith('#') ? c : `#${c}`).toUpperCase())
          .filter((c) => /^#[0-9A-F]{6}$/.test(c)),
      }))
      .filter((p) => p.colors.length === 5)

    if (palettes.length === 0) {
      throw new Error('AI returned invalid palette data')
    }

    return apiSuccess({ palettes })
  } catch (err) {
    console.error('palette/generate error:', err)
    return apiError(
      'Failed to generate palette. Your credit has been deducted — please try again.',
      'GENERATION_FAILED',
      500,
    )
  }
}
