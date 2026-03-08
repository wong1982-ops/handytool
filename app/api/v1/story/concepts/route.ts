import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { conceptsRequestSchema } from '@/lib/story/types'
import { generateConcepts } from '@/lib/story/enrich'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = conceptsRequestSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  try {
    const concepts = await generateConcepts(parsed.data)
    return apiSuccess(concepts)
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error('story/concepts: AI call failed —', message)
    if (err instanceof Error && err.stack) console.error(err.stack)
    return API_ERRORS.INTERNAL()
  }
}
