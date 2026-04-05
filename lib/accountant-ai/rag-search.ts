/**
 * Vector similarity search over the RAG chunks stored in Supabase.
 * Embeds the query with Gemini, then calls match_rag_chunks RPC.
 */

import { getAdminSupabase } from '@/lib/supabase/admin'
import { embedQuery } from './embedder'

export interface RagResult {
  content: string
  url: string
  title: string
  source: string
  similarity: number
}

/**
 * Searches the RAG knowledge base for chunks most similar to the query.
 *
 * @param query     Natural-language question or keyword string
 * @param matchCount  Number of top results to return (default: 5)
 */
export async function ragSearch(query: string, matchCount = 5): Promise<RagResult[]> {
  const embedding = await embedQuery(query)

  const supabase = getAdminSupabase()

  const { data, error } = await (supabase.rpc as any)('match_rag_chunks', {
    query_embedding: `[${embedding.join(',')}]`,
    match_count: matchCount,
  })

  if (error) {
    throw new Error(`match_rag_chunks RPC error: ${error.message}`)
  }

  return (data ?? []) as RagResult[]
}
