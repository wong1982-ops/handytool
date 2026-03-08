import { API_ERRORS, apiSuccess } from '@/lib/api/response'
import { refineRequestSchema } from '@/lib/story/types'
import { refineConcept } from '@/lib/story/enrich'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = refineRequestSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  try {
    const result = await refineConcept(parsed.data)
    return apiSuccess(result)
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error('story/refine: AI call failed —', message)
    return API_ERRORS.INTERNAL()
  }
}
