import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const postSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  monthly_credits: z.number().int().min(0),
  stripe_price_id: z.string().min(1),
  features: z.array(z.string()),
})

export async function GET() {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const admin = createAdminClient()

  const { data: tiers, error: dbError } = await admin
    .from('subscription_tiers')
    .select('*')
    .order('monthly_credits', { ascending: true })

  if (dbError) {
    console.error('admin/tiers: query failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ tiers: tiers ?? [] })
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const admin = createAdminClient()

  const { data: tier, error: dbError } = await admin
    .from('subscription_tiers')
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) {
    if (dbError.code === '23505') {
      return API_ERRORS.VALIDATION({ id: ['Tier ID already exists'] })
    }
    console.error('admin/tiers: insert failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ tier }, 201)
}
