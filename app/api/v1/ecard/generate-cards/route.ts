import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateIllustration } from '@/lib/story/illustrate'
import type { BusinessInfo, BrandAnalysis, GeneratedDesign } from '@/tools/ecard-studio/ai-card/types'

const CREDIT_COST = 1

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    businessInfo: BusinessInfo
    brandAnalysis: BrandAnalysis | null
    logoDataUrl: string | null
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { businessInfo, brandAnalysis, logoDataUrl } = body

  if (!businessInfo?.name?.trim() || !businessInfo?.company?.trim()) {
    return apiError('Name and company are required', 'VALIDATION_ERROR', 400)
  }

  // Deduct credit
  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_tool_id: 'ecard-ai-generate',
    p_description: 'AI Business Card — generate 3 designs',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: CREDIT_COST })
    }
    console.error('ecard/generate-cards deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  // Prepare logo buffer
  let logoBuffer: Buffer | undefined
  if (logoDataUrl) {
    try {
      const base64Data = logoDataUrl.split(',')[1]
      logoBuffer = Buffer.from(base64Data, 'base64')
    } catch {
      // Ignore invalid logo data, proceed without it
    }
  }

  // Determine 3 style variations
  const styleA = brandAnalysis?.suggestedStyle || 'modern'
  const CONTRAST_MAP: Record<string, string> = {
    classic: 'modern minimal',
    modern: 'classic elegant',
    bold: 'minimal clean',
    minimal: 'bold creative',
    creative: 'classic professional',
    elegant: 'modern bold',
    minimalist: 'bold creative',
    playful: 'classic elegant',
    corporate: 'creative modern',
  }
  const styleB = CONTRAST_MAP[styleA] || 'classic elegant'
  const styleC = 'creative artistic'

  // Build colors
  const primary = brandAnalysis?.suggestedColors?.primary || '#3D6AF2'
  const secondary = brandAnalysis?.suggestedColors?.secondary || '#32A9D9'
  const accent = brandAnalysis?.suggestedColors?.accent || '#F2C94C'

  // Build contact info line
  const contactParts: string[] = []
  if (businessInfo.phone) contactParts.push(businessInfo.phone)
  if (businessInfo.email) contactParts.push(businessInfo.email)
  if (businessInfo.website) contactParts.push(businessInfo.website)
  const contactLine = contactParts.length > 0 ? `Contact info: ${contactParts.join(' ')}` : ''

  // Build prompt template
  function buildPrompt(style: string): string {
    const lines = [
      `Professional business card design, ${style} style, landscape 3.5:2 aspect ratio.`,
      `Person: ${businessInfo.name}, ${businessInfo.title}`,
      `Company: ${businessInfo.company}`,
    ]
    if (businessInfo.tagline) lines.push(`Tagline: ${businessInfo.tagline}`)
    if (contactLine) lines.push(contactLine)
    lines.push(`Color palette: ${primary}, ${secondary}, ${accent}`)
    lines.push('Requirements: Clean readable typography, professional layout, high quality print-ready design.')
    lines.push('Do NOT include any placeholder text or lorem ipsum.')
    return lines.join('\n')
  }

  const promptA = buildPrompt(styleA)
  const promptB = buildPrompt(styleB)
  const promptC = buildPrompt(styleC)

  try {
    const results = await Promise.allSettled([
      generateIllustration({ imagePrompt: promptA, referenceImage: logoBuffer }),
      generateIllustration({ imagePrompt: promptB, referenceImage: logoBuffer }),
      generateIllustration({ imagePrompt: promptC, referenceImage: logoBuffer }),
    ])

    const styleLabels = [styleA, styleB, styleC]
    const prompts = [promptA, promptB, promptC]
    const designs: GeneratedDesign[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value?.url) {
        designs.push({
          imageUrl: result.value.url,
          style: styleLabels[index] as GeneratedDesign['style'],
          prompt: prompts[index],
        })
      }
    })

    if (designs.length === 0) {
      return apiError(
        'Failed to generate any card designs. Your credit has been deducted — please try again.',
        'GENERATION_FAILED',
        500,
      )
    }

    return apiSuccess({ designs })
  } catch (err) {
    console.error('ecard/generate-cards error:', err)
    return apiError(
      'Failed to generate card designs. Your credit has been deducted — please try again.',
      'GENERATION_FAILED',
      500,
    )
  }
}
