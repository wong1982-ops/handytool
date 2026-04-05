import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'
import { scrapeAll } from '@/lib/accountant-ai/scraper'
import { chunkPages } from '@/lib/accountant-ai/chunker'
import { embedTexts } from '@/lib/accountant-ai/embedder'

export const maxDuration = 300

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

export async function POST(request: Request) {
  // Allow cron secret OR admin auth
  const cronSecret = process.env.CRON_SECRET || ''
  const authHeader = request.headers.get('authorization')
  const cronHeader = request.headers.get('x-cron-secret')
  const isCronAuth = cronSecret && (authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret)

  if (!isCronAuth) {
    const userId = await getAuthUserId()
    if (!userId) return API_ERRORS.UNAUTHORIZED()

    const adminSb = getAdminSupabase()
    const { data: authUser } = await adminSb.auth.admin.getUserById(userId)
    const email = authUser?.user?.email || ''

    if (ADMIN_EMAILS.length > 0) {
      if (!ADMIN_EMAILS.includes(email)) return API_ERRORS.FORBIDDEN()
    } else if (process.env.NODE_ENV !== 'development') {
      return API_ERRORS.FORBIDDEN()
    }
  }

  const supabase = getAdminSupabase()

  try {
    // 1. Scrape all sources
    console.log('[accountant-ai/scrape] Starting scrape pipeline...')
    const pages = await scrapeAll()
    console.log(`[accountant-ai/scrape] Scraped ${pages.length} pages`)

    // 2. Store documents (upsert by URL)
    if (pages.length > 0) {
      const documents = pages.map((page) => ({
        url: page.url,
        title: page.title,
        source: page.source,
        content_text: page.content,
        scraped_at: new Date().toISOString(),
      }))

      const { error: upsertError } = await (supabase.from as any)('rag_documents').upsert(
        documents,
        { onConflict: 'url' },
      )

      if (upsertError) {
        console.error('[accountant-ai/scrape] Document upsert error:', upsertError)
        throw new Error(`Failed to store documents: ${upsertError.message}`)
      }
    }

    // 3. Chunk all documents
    const chunks = chunkPages(pages)
    console.log(`[accountant-ai/scrape] Created ${chunks.length} chunks`)

    // 4. Embed all chunks
    const texts = chunks.map((c) => c.content)
    const embeddings = await embedTexts(texts)
    console.log(`[accountant-ai/scrape] Generated ${embeddings.length} embeddings`)

    // 5. Clear old chunks
    await (supabase.from as any)('rag_chunks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    // 6. Insert new chunks in batches of 100
    const BATCH_SIZE = 100
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE)
      const batchEmbeddings = embeddings.slice(i, i + BATCH_SIZE)

      const rows = batchChunks.map((chunk, j) => ({
        content: chunk.content,
        chunk_index: chunk.chunkIndex,
        metadata: { url: chunk.metadata.url, title: chunk.metadata.title, source: chunk.metadata.source },
        embedding: `[${batchEmbeddings[j].join(',')}]`,
      }))

      const { error: insertError } = await (supabase.from as any)('rag_chunks').insert(rows)

      if (insertError) {
        console.error(`[accountant-ai/scrape] Chunk insert error (batch ${i}):`, insertError)
        throw new Error(`Failed to insert chunks: ${insertError.message}`)
      }
    }

    console.log('[accountant-ai/scrape] Pipeline complete')

    return apiSuccess({
      pagesScraped: pages.length,
      chunksCreated: chunks.length,
      embeddingsGenerated: embeddings.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[accountant-ai/scrape] Pipeline error:', message)
    return apiSuccess({ error: message, pagesScraped: 0, chunksCreated: 0, embeddingsGenerated: 0 })
  }
}
