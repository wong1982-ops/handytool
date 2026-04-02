import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

interface IncomingTransaction {
  date: string
  description: string
  amount: number
  sourceRef?: string
}

interface DuplicateMatch {
  index: number
  existingId: string
  date: string
  description: string
  amount: number
  matchedBy: 'source_ref' | 'fallback'
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    entity_id: string
    transactions: IncomingTransaction[]
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { entity_id, transactions } = body

  if (!entity_id?.trim()) {
    return apiError('entity_id is required', 'VALIDATION_ERROR', 400)
  }
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return apiError('transactions array is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()

  // Collect source_refs for batch lookup
  const sourceRefs = transactions
    .map((t) => t.sourceRef)
    .filter((ref): ref is string => !!ref)

  // 1. Match by source_ref (batch query)
  const refMatchMap = new Map<string, { id: string; date: string; description: string; amount: number }>()

  if (sourceRefs.length > 0) {
    const { data: refMatches } = await supabase
      .from('tax_transactions')
      .select('id, source_ref, date, description, amount')
      .eq('user_id', userId)
      .eq('entity_id', entity_id)
      .in('source_ref', sourceRefs)

    for (const row of refMatches ?? []) {
      if (row.source_ref) {
        refMatchMap.set(row.source_ref, {
          id: row.id,
          date: row.date,
          description: row.description,
          amount: row.amount,
        })
      }
    }
  }

  // 2. For transactions without source_ref match, try fallback (date+desc+amount)
  // Collect candidates that need fallback matching
  const fallbackCandidates: { index: number; date: string; description: string; amount: number }[] = []

  const duplicates: DuplicateMatch[] = []

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]

    // Check source_ref match first
    if (t.sourceRef && refMatchMap.has(t.sourceRef)) {
      const existing = refMatchMap.get(t.sourceRef)!
      duplicates.push({
        index: i,
        existingId: existing.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        matchedBy: 'source_ref',
      })
      continue
    }

    // Queue for fallback matching
    fallbackCandidates.push({ index: i, date: t.date, description: t.description, amount: t.amount })
  }

  // Batch fallback: query existing transactions for this entity matching any of the dates
  if (fallbackCandidates.length > 0) {
    const uniqueDates = [...new Set(fallbackCandidates.map((c) => c.date))]

    const { data: dateMatches } = await supabase
      .from('tax_transactions')
      .select('id, date, description, amount')
      .eq('user_id', userId)
      .eq('entity_id', entity_id)
      .in('date', uniqueDates)

    if (dateMatches && dateMatches.length > 0) {
      // Build lookup key for existing transactions
      const existingSet = new Map<string, string>()
      for (const row of dateMatches) {
        const key = `${row.date}|${row.description}|${row.amount}`
        existingSet.set(key, row.id)
      }

      for (const candidate of fallbackCandidates) {
        const key = `${candidate.date}|${candidate.description}|${candidate.amount}`
        const existingId = existingSet.get(key)
        if (existingId) {
          duplicates.push({
            index: candidate.index,
            existingId,
            date: candidate.date,
            description: candidate.description,
            amount: candidate.amount,
            matchedBy: 'fallback',
          })
        }
      }
    }
  }

  return apiSuccess({
    duplicates,
    duplicate_count: duplicates.length,
    new_count: transactions.length - duplicates.length,
  })
}
