import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  locale: z.enum(['en', 'zh']),
  data: z.record(z.any()),
})

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON', 'VALIDATION_ERROR', 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)
  }

  const { id, title, locale, data } = parsed.data

  try {
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update
      const { error } = await supabase
        .from('resumes')
        .update({ title, locale, data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } else {
      // Insert
      const { error } = await supabase
        .from('resumes')
        .insert({ id, user_id: userId, title, locale, data })

      if (error) throw error
    }

    return apiSuccess({ id, saved: true })
  } catch (e) {
    console.error('Resume save error:', e)
    return apiError('Failed to save resume', 'SAVE_ERROR', 500)
  }
}
