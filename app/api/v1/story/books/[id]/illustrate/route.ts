import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { generateIllustration, type IllustrateInput } from '@/lib/story/illustrate'

const illustrateSchema = z.object({
  pageId: z.string().uuid().optional(),
  imagePrompt: z.string().min(1).max(5000),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
  characterIds: z.array(z.string().uuid()).optional(),
})

const CREDIT_COST = { fast: 3, quality: 5 } as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = illustrateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { pageId, imagePrompt, qualityMode, characterIds } = parsed.data

  const { data: book, error: bookErr } = await supabase
    .from('books')
    .select('id, series_id, style, concept')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (bookErr || !book) return apiError('Book not found', 'NOT_FOUND', 404)

  const cost = pageId ? CREDIT_COST[qualityMode] : 5
  const adminClient = getAdminSupabase() as any
  const { data: reserveData, error: reserveErr } = await adminClient.rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_description: `Story Studio — ${pageId ? 'page illustration' : 'cover'} (${qualityMode})`,
  })
  const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData
  if (reserveErr || !reservation?.reservation_id) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  try {
    const style = (book as any).style || (book as any).concept?.tags?.style || "children's book illustration"

    const characters: { name: string; description: string }[] = []
    let previousPageImage: Buffer | undefined
    const characterReferences: { name: string; description: string; buffer: Buffer }[] = []

    if (characterIds?.length) {
      const { data: chars } = await supabase
        .from('characters')
        .select('name, physical_description, reference_image_url')
        .in('id', characterIds)
        .eq('status', 'approved')

      for (const c of chars ?? []) {
        const desc = c.physical_description || ''
        characters.push({ name: c.name, description: desc })
        if (c.reference_image_url) {
          try {
            const res = await fetch(c.reference_image_url)
            if (res.ok) {
              characterReferences.push({
                name: c.name,
                description: desc,
                buffer: Buffer.from(await res.arrayBuffer()),
              })
            }
          } catch { /* skip */ }
        }
      }
    }

    if (pageId) {
      const { data: currentPage } = await supabase
        .from('book_pages')
        .select('sequence')
        .eq('id', pageId)
        .single()

      if (currentPage && currentPage.sequence > 1) {
        const { data: prevPage } = await supabase
          .from('book_pages')
          .select('page_illustrations (image_url)')
          .eq('book_id', bookId)
          .eq('sequence', currentPage.sequence - 1)
          .single()

        const prevUrl = (prevPage as any)?.page_illustrations?.[0]?.image_url
        if (prevUrl) {
          try {
            const res = await fetch(prevUrl)
            if (res.ok) previousPageImage = Buffer.from(await res.arrayBuffer())
          } catch { /* skip */ }
        }
      }
    }

    const input: IllustrateInput = {
      imagePrompt,
      characters,
      characterReferences: characterReferences.length > 0 ? characterReferences : undefined,
      previousPageImage,
      style,
    }

    const result = await generateIllustration(input)
    if (!result?.url) throw new Error('Generation returned no result')

    if (pageId) {
      const { data: existing } = await supabase
        .from('page_illustrations')
        .select('id')
        .eq('book_page_id', pageId)
        .single()

      if (existing) {
        await supabase
          .from('page_illustrations')
          .update({
            image_url: result.url,
            status: 'done',
            quality_mode: qualityMode,
            generation_config: { prompt: imagePrompt, characterIds },
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('page_illustrations')
          .insert({
            book_page_id: pageId,
            image_url: result.url,
            status: 'done',
            quality_mode: qualityMode,
            generation_config: { prompt: imagePrompt, characterIds },
          })
      }
    } else {
      const { data: existing } = await supabase
        .from('book_cover')
        .select('id')
        .eq('book_id', bookId)
        .single()

      if (existing) {
        await supabase
          .from('book_cover')
          .update({ image_url: result.url, status: 'done', prompt: imagePrompt })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('book_cover')
          .insert({ book_id: bookId, image_url: result.url, status: 'done', prompt: imagePrompt })
      }
    }

    await adminClient.rpc('confirm_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_description: `Story Studio — ${pageId ? 'page illustration' : 'cover'} (${qualityMode})`,
    })

    return apiSuccess({
      imageUrl: result.url,
      pageId: pageId ?? null,
      type: pageId ? 'page' : 'cover',
    })
  } catch (e) {
    await adminClient.rpc('release_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_reason: `Failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
    })

    if (pageId) {
      const { data: errExisting } = await supabase.from('page_illustrations').select('id').eq('book_page_id', pageId).single()
      const errorData = { status: 'error', quality_mode: qualityMode, generation_config: { prompt: imagePrompt, error: e instanceof Error ? e.message : 'Unknown' } }
      if (errExisting) {
        await supabase.from('page_illustrations').update(errorData).eq('id', errExisting.id)
      } else {
        await supabase.from('page_illustrations').insert({ book_page_id: pageId, ...errorData })
      }
    }

    return apiError(
      e instanceof Error ? e.message : 'Failed to generate illustration',
      'GENERATION_ERROR',
      500,
    )
  }
}

export const maxDuration = 120
