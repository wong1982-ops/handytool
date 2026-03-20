import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    businessInfo: { name?: string; title?: string; company?: string; tagline?: string; industry?: string }
    dominantColors: string[]
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { businessInfo, dominantColors } = body

  if (!businessInfo?.name?.trim() || !businessInfo?.company?.trim()) {
    return apiError('Name and company are required', 'VALIDATION_ERROR', 400)
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction:
        'You are a brand identity expert. Given business information and logo colors, suggest a cohesive brand identity for a professional business card design.',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            suggestedColors: {
              type: SchemaType.OBJECT,
              properties: {
                primary: { type: SchemaType.STRING, description: 'Primary brand color hex code' },
                secondary: { type: SchemaType.STRING, description: 'Secondary brand color hex code' },
                accent: { type: SchemaType.STRING, description: 'Accent color hex code' },
              },
              required: ['primary', 'secondary', 'accent'],
            },
            suggestedStyle: {
              type: SchemaType.STRING,
              format: 'enum',
              enum: ['modern', 'classic', 'minimalist', 'bold', 'elegant', 'playful', 'corporate', 'creative'],
              description: 'Recommended design style',
            },
            suggestedTagline: {
              type: SchemaType.STRING,
              nullable: true,
              description: 'A suggested tagline for the business',
            },
            suggestedFonts: {
              type: SchemaType.OBJECT,
              properties: {
                heading: { type: SchemaType.STRING, description: 'Recommended heading font' },
                body: { type: SchemaType.STRING, description: 'Recommended body font' },
              },
              required: ['heading', 'body'],
            },
            brandPersonality: {
              type: SchemaType.STRING,
              description: 'A short description of the brand personality',
            },
          },
          required: ['suggestedColors', 'suggestedStyle', 'suggestedTagline', 'suggestedFonts', 'brandPersonality'],
        },
      },
    })

    const parts: string[] = [
      `Name: ${businessInfo.name}`,
      `Title: ${businessInfo.title || 'N/A'}`,
      `Company: ${businessInfo.company}`,
    ]
    if (businessInfo.industry) parts.push(`Industry: ${businessInfo.industry}`)
    if (businessInfo.tagline) parts.push(`Tagline: ${businessInfo.tagline}`)
    if (dominantColors?.length) parts.push(`Logo dominant colors: ${dominantColors.join(', ')}`)

    const userMessage = `Analyze this business and suggest a brand identity for their business card:\n\n${parts.join('\n')}`

    const result = await model.generateContent(userMessage)
    const text = result.response.text()
    if (!text) throw new Error('No response from AI')

    const parsed = JSON.parse(text)

    // Normalize suggestedFonts to array format matching BrandAnalysis type
    const analysis = {
      suggestedColors: parsed.suggestedColors,
      suggestedStyle: parsed.suggestedStyle,
      suggestedTagline: parsed.suggestedTagline || '',
      suggestedFonts: [parsed.suggestedFonts.heading, parsed.suggestedFonts.body],
      brandPersonality: parsed.brandPersonality,
    }

    return apiSuccess({ analysis })
  } catch (err) {
    console.error('ecard/analyze-brand error:', err)
    return apiError('Failed to analyze brand identity', 'ANALYSIS_FAILED', 500)
  }
}
