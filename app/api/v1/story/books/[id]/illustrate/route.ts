import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { generateIllustration, type IllustrateInput } from '@/lib/story/illustrate'

const illustrateSchema = z.object({
  pageId: z.string().uuid().optional(),
  imagePrompt: z.string().min(1).max(50000).optional(),
  refinement: z.string().min(1).max(2000).optional(),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
  characterIds: z.array(z.string().uuid()).optional(),
}).refine(data => data.imagePrompt || data.refinement, {
  message: 'Either imagePrompt or refinement is required',
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

  const { pageId, imagePrompt: rawPrompt, refinement, qualityMode, characterIds } = parsed.data

  // If refinement mode, fetch the stored prompt from existing illustration/cover
  let imagePrompt: string
  if (refinement && !rawPrompt) {
    let storedPrompt: string | undefined
    if (pageId) {
      const { data: illRows } = await supabase.rpc('get_page_illustration', {
        p_book_page_id: pageId,
      })
      storedPrompt = ((illRows || [])[0]?.generation_config as Record<string, unknown>)?.prompt as string
    } else {
      const { data: coverRows } = await supabase.rpc('get_book_cover', {
        p_book_id: bookId,
      })
      storedPrompt = (coverRows || [])[0]?.prompt as string
    }
    if (!storedPrompt) {
      return apiError('No existing illustration found to refine', 'VALIDATION_ERROR', 400)
    }
    imagePrompt = `${storedPrompt}\n\n[Refinement: ${refinement}]`
  } else if (rawPrompt) {
    imagePrompt = rawPrompt
  } else {
    return apiError('Either imagePrompt or refinement is required', 'VALIDATION_ERROR', 400)
  }

  // Verify book ownership via SECURITY DEFINER RPC
  const { data: books, error: bookErr } = await supabase.rpc('get_book_by_id', {
    p_user_id: userId,
    p_book_id: bookId,
  })
  const book = (books || [])[0]
  if (bookErr || !book) return apiError('Book not found', 'NOT_FOUND', 404)

  const cost = pageId ? CREDIT_COST[qualityMode] : 5
  const { data: reserveData, error: reserveErr } = await supabase.rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_description: `Story Studio — ${pageId ? 'page illustration' : 'cover'} (${qualityMode})`,
  })
  const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData
  if (reserveErr || !reservation?.reservation_id) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  try {
    const bookData = book.data as Record<string, unknown> | null
    const style = (bookData?.style as string) || (bookData?.concept as any)?.tags?.style || "children's book illustration"

    const characters: { name: string; description: string }[] = []
    let previousPageImage: Buffer | undefined
    const characterReferences: { name: string; description: string; buffer: Buffer }[] = []

    if (characterIds?.length) {
      const { data: chars } = await supabase.rpc('get_characters_with_images', {
        p_character_ids: characterIds,
      })

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
      // Get current page sequence to find previous page
      const { data: pageRows } = await supabase.rpc('get_book_page_by_id', {
        p_user_id: userId,
        p_book_id: bookId,
        p_page_id: pageId,
      })
      const currentPage = (pageRows || [])[0]

      if (currentPage && currentPage.sequence > 1) {
        const { data: prevUrl } = await supabase.rpc('get_prev_page_illustration_url', {
          p_book_id: bookId,
          p_sequence: currentPage.sequence,
        })
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

    // Store result via SECURITY DEFINER RPCs
    if (pageId) {
      await supabase.rpc('upsert_page_illustration', {
        p_book_page_id: pageId,
        p_image_url: result.url,
        p_status: 'done',
        p_quality_mode: qualityMode,
        p_generation_config: { prompt: imagePrompt, characterIds },
      })
    } else {
      await supabase.rpc('upsert_book_cover', {
        p_book_id: bookId,
        p_image_url: result.url,
        p_status: 'done',
        p_prompt: imagePrompt,
      })
    }

    await supabase.rpc('confirm_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_description: `Story Studio — ${pageId ? 'page illustration' : 'cover'} (${qualityMode})`,
    })

    return apiSuccess({
      imageUrl: result.url,
      pageId: pageId ?? null,
      type: pageId ? 'page' : 'cover',
    })
  } catch (e) {
    await supabase.rpc('release_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_reason: `Failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
    })

    if (pageId) {
      await supabase.rpc('upsert_page_illustration', {
        p_book_page_id: pageId,
        p_status: 'error',
        p_quality_mode: qualityMode,
        p_generation_config: { prompt: imagePrompt, error: e instanceof Error ? e.message : 'Unknown' },
      })
    }

    return apiError(
      e instanceof Error ? e.message : 'Failed to generate illustration',
      'GENERATION_ERROR',
      500,
    )
  }
}

export const maxDuration = 120
