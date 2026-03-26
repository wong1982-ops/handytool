// app/api/v1/component-lab/save/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    name: string
    tags: string[]
    prompt: string
    settings: unknown
    codeReact: string
    codeVue: string
    codeSvelte: string
    codeHtml: string
    isPublic: boolean
  }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.name?.trim()) {
    return apiError('name is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()

  // Deduct 1 credit
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
  })
  if (creditError) {
    console.error('[component-lab/save] Credit deduction error:', creditError)
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  // Generate slug
  const slug =
    body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40) +
    '-' +
    randomUUID().slice(0, 6)

  const { data, error } = await supabase
    .from('components_library')
    .insert({
      user_id: userId,
      name: body.name.trim(),
      slug,
      tags: body.tags ?? [],
      prompt: body.prompt,
      settings: body.settings,
      code_react: body.codeReact,
      code_vue: body.codeVue,
      code_svelte: body.codeSvelte,
      code_html: body.codeHtml,
      is_public: body.isPublic ?? false,
    })
    .select('id, slug')
    .single()

  if (error) {
    console.error('[component-lab/save] Insert error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id, slug: data.slug }, 201)
}
