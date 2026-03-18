import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  category: z.enum(['it', 'french']).default('it'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['posted_at', 'salary_min', 'salary_max']).default('posted_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  employment_type: z.enum(['full-time', 'contract', 'part-time']).optional(),
  work_mode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  country: z.enum(['AU', 'NZ']).optional(),
  days: z.coerce.number().int().min(1).max(90).optional(),
  salary_min: z.coerce.number().int().min(0).optional(),
  salary_max: z.coerce.number().int().min(0).optional(),
  hourly_min: z.coerce.number().min(0).optional(),
  hourly_max: z.coerce.number().min(0).optional(),
  q: z.string().max(200).optional(),
})

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const {
    category, page, limit, sort, order,
    employment_type, work_mode, country, days,
    salary_min, salary_max, hourly_min, hourly_max, q,
  } = parsed.data

  const supabase = getAdminSupabase()
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('category', category)
    .eq('is_active', true)

  if (employment_type) query = query.eq('employment_type', employment_type)
  if (work_mode) query = query.eq('work_mode', work_mode)
  if (country) query = query.eq('country', country)

  if (days) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    query = query.gte('posted_at', since.toISOString())
  }

  if (salary_min) query = query.gte('salary_max', salary_min)
  if (salary_max) query = query.lte('salary_min', salary_max)
  if (hourly_min) query = query.gte('hourly_rate_max', hourly_min)
  if (hourly_max) query = query.lte('hourly_rate_min', hourly_max)

  if (q) {
    // Search title and tags
    query = query.or(`title.ilike.%${q}%,tags.cs.{${q}}`)
  }

  // Sort and paginate
  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('[job-radar] API query error:', error.message)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({
    data: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}
