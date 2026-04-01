import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const postSchema = z.object({
  providerName: z.string().min(1).max(200),
  categoryId: z.string().min(1),
  phone: z.string().max(30).optional(),
  description: z.string().max(2000).optional(),
  serviceArea: z.array(z.string()).max(20).default([]),
})

/** POST — submit a new provider suggestion (auth required) */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { providerName, categoryId, phone, description, serviceArea } = parsed.data

  try {
    const supabase = await createClient()

    const { data: submission, error } = await supabase
      .from('community_submissions')
      .insert({
        submitted_by: userId,
        provider_name: providerName,
        category_id: categoryId,
        phone: phone || null,
        description: description || null,
        service_area: serviceArea,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Submission create error:', error)
      return API_ERRORS.INTERNAL()
    }

    return apiSuccess({
      submission: {
        id: submission.id,
        providerName: submission.provider_name,
        categoryId: submission.category_id,
        status: submission.status,
        createdAt: submission.created_at,
      },
    }, 201)
  } catch (e) {
    console.error('Submission error:', e)
    return API_ERRORS.INTERNAL()
  }
}
