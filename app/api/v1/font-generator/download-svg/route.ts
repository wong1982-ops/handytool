import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'

export const maxDuration = 120

const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const SVG_PROMPT = `Convert this letter image into clean, minimal SVG code. Output ONLY the raw SVG markup starting with <svg and ending with </svg>. Use simple paths, no embedded raster images. Optimize for small file size.`

async function convertToSvg(imageUrl: string): Promise<string> {
  const imageRes = await fetch(imageUrl)
  const imageBuffer = await imageRes.arrayBuffer()
  const base64 = Buffer.from(imageBuffer).toString('base64')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64 } },
          { text: SVG_PROMPT },
        ],
      }],
    }),
  })

  if (!response.ok) throw new Error(`Gemini SVG conversion failed: ${response.status}`)

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i)
  if (!svgMatch) throw new Error('No valid SVG in response')

  return svgMatch[0]
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    projectId: string
    characters: { char: string; imageUrl: string }[]
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.projectId || !body.characters?.length) {
    return apiError('projectId and characters are required', 'VALIDATION_ERROR', 400)
  }

  // Deduct 1 credit
  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'font-generator',
    p_description: 'Font SVG pack download',
  })

  if (creditError) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  console.log(`[font-generator] Converting ${body.characters.length} characters to SVG...`)

  const results = await Promise.allSettled(
    body.characters.map(async ({ char, imageUrl }) => {
      const svgCode = await convertToSvg(imageUrl)
      const r2Path = `font-generator/${body.projectId}/${char}.svg`
      const svgUrl = await uploadToR2(r2Path, Buffer.from(svgCode, 'utf-8'), 'image/svg+xml')
      return { char, svgUrl, svgCode }
    }),
  )

  const svgs = results
    .filter((r): r is PromiseFulfilledResult<{ char: string; svgUrl: string; svgCode: string }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[font-generator] SVG conversion: ${svgs.length}/${body.characters.length} succeeded`)

  return apiSuccess({ svgs })
}
