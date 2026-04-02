// app/api/v1/mood-board/add-more/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { callGeminiImage } from '@/lib/mood-board/gemini'
import { buildAddMorePrompt } from '@/lib/mood-board/prompts'
import type { BoardElement } from '@/tools/mood-board/types'

export const maxDuration = 30

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { boardId: string; prompt: string; theme: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.prompt?.trim() || !body.boardId) {
    return apiError('prompt and boardId are required', 'VALIDATION_ERROR', 400)
  }

  // Deduct 1 credit
  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'mood-board',
    p_description: 'Mood board add more elements',
  })

  if (creditError) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  console.log(`[mood-board] Add more: "${body.prompt.trim()}"`)

  // Generate 3-4 images
  const count = body.prompt.toLowerCase().includes('font') ? 0 : Math.min(4, 3 + Math.floor(Math.random() * 2))
  const elements: BoardElement[] = []

  if (count > 0) {
    const results = await Promise.allSettled(
      Array.from({ length: count }, (_, i) => i).map(async (index) => {
        const prompt = buildAddMorePrompt(body.theme || '', body.prompt.trim())
        const buffer = await callGeminiImage(prompt)
        const r2Path = `mood-board/${body.boardId}/add-${Date.now()}-${index}.png`
        const imageUrl = await uploadToR2(r2Path, buffer, 'image/png')
        return imageUrl
      }),
    )

    results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .forEach((r, i) => {
        elements.push({
          id: `add-${crypto.randomUUID().slice(0, 8)}`,
          type: 'image',
          order: elements.length,
          width: 200,
          height: 200,
          data: { imageUrl: r.value, alt: body.prompt.trim() },
        })
      })
  }

  return apiSuccess({ elements })
}
