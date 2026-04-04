import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { analyzeKeywords } from '@/lib/seo-studio/gemini'
import { createHash } from 'crypto'

export const maxDuration = 30

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { query: string }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const query = body.query?.trim()
  if (!query || query.length < 2) return apiError('Query must be at least 2 characters', 'VALIDATION_ERROR', 400)

  const queryHash = createHash('sha256').update(query.toLowerCase()).digest('hex')
  const supabase = await getSupabase()

  // Check cache (24hr TTL)
  const { data: cached } = await supabase
    .from('seo_keyword_cache')
    .select('results, cached_at')
    .eq('query_hash', queryHash)
    .single()

  if (cached) {
    const age = Date.now() - new Date(cached.cached_at).getTime()
    if (age < 24 * 60 * 60 * 1000) return apiSuccess(cached.results)
  }

  // Deduct 1 credit
  const authSupabase = await createClient()
  const { error: deductError } = await authSupabase.rpc('deduct_credits', {
    p_user_id: userId, p_amount: 1, p_tool_id: 'seo-studio', p_description: `Keyword research: "${query}"`,
  })
  if (deductError) {
    return deductError.message?.includes('insufficient_credits')
      ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
      : API_ERRORS.INTERNAL()
  }

  // Google Autocomplete
  let autocomplete: string[] = []
  try {
    const acRes = await fetch(`https://suggestqueries.google.com/complete/search?q=${encodeURIComponent(query)}&client=chrome`)
    if (acRes.ok) { const d = await acRes.json(); autocomplete = Array.isArray(d[1]) ? d[1].slice(0, 10) : [] }
  } catch {}

  // Gemini analysis
  try {
    const analysis = await analyzeKeywords(query, autocomplete)
    const results = { ...analysis, autocomplete }
    await supabase.from('seo_keyword_cache').upsert({ query_hash: queryHash, query, results, cached_at: new Date().toISOString() }, { onConflict: 'query_hash' })
    return apiSuccess(results)
  } catch (err) {
    console.error('[seo-studio/keywords] Analysis failed:', err)
    return apiError('Keyword analysis failed', 'GENERATION_FAILED', 500)
  }
}
