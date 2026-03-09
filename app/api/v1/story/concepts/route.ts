import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { conceptsRequestSchema } from '@/lib/story/types'
import { generateConcepts, type SeriesContext, type SeriesBookSummary } from '@/lib/story/enrich'
import { CREDIT_COSTS } from '@/lib/story/validation'

export async function POST(request: Request) {
  // Authenticate — concepts require login so we can check credit balance
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Pre-check: user must have enough credits for a full generation
  // (concepts are free, but we prevent users from wasting time if they can't generate)
  if (userId && process.env.NODE_ENV !== 'development') {
    try {
      const supabase = await createClient()
      const { data: credits } = await supabase
        .from('user_credits')
        .select('subscription_balance, purchased_balance, locked_balance')
        .eq('user_id', userId)
        .single()

      const available = (credits?.subscription_balance ?? 0)
        + (credits?.purchased_balance ?? 0)
        - (credits?.locked_balance ?? 0)

      if (available < CREDIT_COSTS.generate) {
        return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, {
          available,
          required: CREDIT_COSTS.generate,
          message: `You need at least ${CREDIT_COSTS.generate} credits to generate a story book. You have ${available} available.`,
        })
      }
    } catch {
      // If credit check fails, allow through (don't block on transient DB errors)
    }
  }

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
    // Load series context if seriesId is provided
    let seriesContext: SeriesContext | undefined
    if (parsed.data.seriesId) {
      const supabase = await createClient()
      const { data: seriesData } = await supabase.rpc('get_series_with_characters', {
        p_series_id: parsed.data.seriesId,
        p_user_id: userId ?? null,
      })
      const series = Array.isArray(seriesData) ? seriesData?.[0] : seriesData
      if (series) {
        const chars = (series.characters as { name: string; description: string; status: string }[]) || []
        const approvedChars = chars.filter(c => c.status === 'approved')
        if (approvedChars.length === 0) {
          return apiError('Series has no approved characters', 'NO_APPROVED_CHARACTERS', 400)
        }
        // Load existing books for continuity context
        const existingBooks: SeriesBookSummary[] = []
        const { data: books } = await supabase
          .from('books')
          .select('data')
          .eq('series_id', parsed.data.seriesId!)
          .order('created_at', { ascending: true })

        if (books?.length) {
          for (const b of books) {
            const bd = b.data as Record<string, unknown> | undefined
            if (!bd) continue
            const bookConcept = bd.concept as Record<string, unknown> | undefined
            const sections = bookConcept?.sections as Record<string, unknown> | undefined
            existingBooks.push({
              title: (bd.title as string) || 'Untitled',
              premise: (sections?.premise as string) || '',
              theme: (bd.theme as string) || '',
            })
          }
        }

        seriesContext = {
          setting: series.setting,
          artStyle: series.art_style,
          characters: approvedChars.map(c => ({ name: c.name, description: c.description })),
          existingBooks: existingBooks.length > 0 ? existingBooks : undefined,
        }
      }
    }

    const concepts = await generateConcepts({
      plot: parsed.data.plot,
      seriesContext,
    })
    return apiSuccess(concepts)
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error('story/concepts: AI call failed —', message)
    if (err instanceof Error && err.stack) console.error(err.stack)
    return API_ERRORS.INTERNAL()
  }
}
