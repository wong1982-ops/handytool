# Story Studio Media Modules Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Illustrations and Narration tabs — the two media modules where users generate per-page images and multi-voice audio for their books, using single-task jobs instead of the monolithic pipeline.

**Architecture:** Each media action (illustrate one page, narrate one page) is an independent single-task job stored in `book_jobs`. Jobs are created on-demand when the user clicks "Generate" in the Illustrations or Narration tab. Batch mode creates N independent jobs in parallel. The existing `generateIllustration()` and `generateMultiVoicePageAudio()` functions from `lib/story/illustrate.ts` and `lib/story/tts.ts` are reused — only the triggering layer changes from pipeline steps to direct API calls. Results are written to the normalized `page_illustrations`, `page_audio`, and `book_cover` tables from Plan 1.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS, Supabase (normalized tables from Plan 1), Gemini (Nano Banana for images, Gemini TTS for audio), R2 storage

**Design doc:** `docs/plans/2026-03-13-story-studio-modular-redesign.md` — Tab 3: Illustrations + Tab 4: Narration

**Depends on:** Plan 1 (Database — `book_pages`, `page_illustrations`, `page_audio`, `book_cover` tables). Plan 2 (Shell Layout — tab routes + BookContext). Plan 3 (Characters — approved character portraits for illustration references). Plan 4 (Stories — books with normalized pages exist).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `app/api/v1/story/books/[id]/illustrate/route.ts` | Create | POST — generate illustration for one page or cover |
| `app/api/v1/story/books/[id]/illustrate/batch/route.ts` | Create | POST — batch generate illustrations for multiple pages |
| `app/api/v1/story/books/[id]/narrate/route.ts` | Create | POST — generate audio for one page |
| `app/api/v1/story/books/[id]/narrate/batch/route.ts` | Create | POST — batch generate audio for multiple pages |
| `app/api/v1/story/books/[id]/illustrations/route.ts` | Create | GET — list all page illustrations for a book |
| `app/api/v1/story/books/[id]/audio/route.ts` | Create | GET — list all page audio for a book |
| `app/api/v1/story/books/[id]/cover/route.ts` | Create | GET + POST — get/generate book cover |
| `tools/story-studio/illustrations/page-grid.tsx` | Create | Grid of page cards with thumbnails, status, batch selection |
| `tools/story-studio/illustrations/page-illustration-detail.tsx` | Create | Single page view: image prompt editor, character picker, generate/accept/regenerate |
| `tools/story-studio/illustrations/illustration-controls.tsx` | Create | Quality toggle, batch generate button, cost display |
| `tools/story-studio/narration/page-narration-list.tsx` | Create | List of pages with audio status, batch selection |
| `tools/story-studio/narration/page-narration-detail.tsx` | Create | Single page: script preview, voice assignments, audio player |
| `tools/story-studio/narration/narrator-voice-selector.tsx` | Create | Curated narrator voice picker at top of Narration tab |
| `tools/story-studio/narration/voice-map-editor.tsx` | Create | Book-level character → voice mapping editor |
| `tools/story-studio/use-illustrations.ts` | Create | Hooks for illustration CRUD, generation, batch |
| `tools/story-studio/use-narration.ts` | Create | Hooks for narration CRUD, generation, batch |
| `app/tools/story-studio/illustrations/page.tsx` | Modify | Replace placeholder with full Illustrations tab |
| `app/tools/story-studio/narration/page.tsx` | Modify | Replace placeholder with full Narration tab |

---

## Chunk 1: Illustration API Routes

### Task 1: Create illustration list API

**Files:**
- Create: `app/api/v1/story/books/[id]/illustrations/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Verify book ownership
  const { data: book, error: bookErr } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (bookErr || !book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Fetch all pages with their latest illustration
  const { data: pages, error: pagesErr } = await supabase
    .from('book_pages')
    .select(`
      id, sequence, scene_description, narrative_text, image_prompt, dialogue, mood,
      page_illustrations (id, image_url, status, quality_mode, generation_config, created_at, updated_at)
    `)
    .eq('book_id', bookId)
    .order('sequence', { ascending: true })

  if (pagesErr) return apiError(pagesErr.message, 'DB_ERROR', 500)

  // Also fetch book cover
  const { data: cover } = await supabase
    .from('book_cover')
    .select('id, image_url, status, prompt, created_at')
    .eq('book_id', bookId)
    .single()

  // Detect characters in each page from dialogue speakers + scene text
  // (Character detection is done client-side using character list from Plan 3)

  return apiSuccess({
    pages: (pages ?? []).map(p => ({
      id: p.id,
      sequence: p.sequence,
      sceneDescription: p.scene_description,
      narrativeText: p.narrative_text,
      imagePrompt: p.image_prompt,
      dialogue: p.dialogue,
      mood: p.mood,
      illustration: p.page_illustrations?.[0] ? {
        id: p.page_illustrations[0].id,
        imageUrl: p.page_illustrations[0].image_url,
        status: p.page_illustrations[0].status,
        qualityMode: p.page_illustrations[0].quality_mode,
        generationConfig: p.page_illustrations[0].generation_config,
        createdAt: p.page_illustrations[0].created_at,
        updatedAt: p.page_illustrations[0].updated_at,
      } : null,
    })),
    cover: cover ? {
      id: cover.id,
      imageUrl: cover.image_url,
      status: cover.status,
      prompt: cover.prompt,
      createdAt: cover.created_at,
    } : null,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/\[id\]/illustrations/route.ts
git commit -m "feat(story-studio): add illustration list API for books"
```

---

### Task 2: Create single page illustration API

**Files:**
- Create: `app/api/v1/story/books/[id]/illustrate/route.ts`

This is the core route. It generates an illustration for ONE page (or cover) using the existing `generateIllustration()` function.

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { generateIllustration, type IllustrateInput } from '@/lib/story/illustrate'
import { uploadToR2 } from '@/lib/storage/r2'

const illustrateSchema = z.object({
  pageId: z.string().uuid().optional(),       // null = cover
  imagePrompt: z.string().min(1).max(5000),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
  characterIds: z.array(z.string().uuid()).optional(),  // override auto-detected
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

  // Verify book ownership + get book details
  const { data: book, error: bookErr } = await supabase
    .from('books')
    .select('id, series_id, style, concept')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (bookErr || !book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Credit check + reserve
  const cost = pageId ? CREDIT_COST[qualityMode] : 5  // Cover always 5
  const adminClient = createAdminClient()
  const { data: reserveData, error: reserveErr } = await adminClient.rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_description: `Story Studio — ${pageId ? 'page illustration' : 'cover'} (${qualityMode})`,
  })
  // RPC returns a table — extract first row
  const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData
  if (reserveErr || !reservation?.reservation_id) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  try {
    // Build illustration input
    const style = book.style || book.concept?.tags?.style || "children's book illustration"

    // Load character references for consistency
    const characters: { name: string; description: string }[] = []
    let previousPageImage: Buffer | undefined
    const characterReferences: { name: string; description: string; buffer: Buffer }[] = []

    if (characterIds?.length) {
      // Fetch approved characters with portraits
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

    // Load previous page illustration for visual continuity
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

        const prevUrl = prevPage?.page_illustrations?.[0]?.image_url
        if (prevUrl) {
          try {
            const res = await fetch(prevUrl)
            if (res.ok) previousPageImage = Buffer.from(await res.arrayBuffer())
          } catch { /* skip */ }
        }
      }
    }

    // Generate illustration
    const input: IllustrateInput = {
      imagePrompt,
      characters,
      characterReferences: characterReferences.length > 0 ? characterReferences : undefined,
      previousPageImage,
      style,
    }

    const result = await generateIllustration(input)
    if (!result?.url) throw new Error('Generation returned no result')

    // Store result in page_illustrations or book_cover
    if (pageId) {
      // Upsert page illustration
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
      // Upsert book cover
      const { data: existing } = await supabase
        .from('book_cover')
        .select('id')
        .eq('book_id', bookId)
        .single()

      if (existing) {
        await supabase
          .from('book_cover')
          .update({
            image_url: result.url,
            status: 'done',
            prompt: imagePrompt,
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('book_cover')
          .insert({
            book_id: bookId,
            image_url: result.url,
            status: 'done',
            prompt: imagePrompt,
          })
      }
    }

    // Confirm credit reservation
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
    // Release credits on failure
    await adminClient.rpc('release_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_reason: `Failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
    })

    // Mark illustration as error
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/\[id\]/illustrate/route.ts
git commit -m "feat(story-studio): add single page/cover illustration generation API"
```

---

### Task 3: Create batch illustration API

**Files:**
- Create: `app/api/v1/story/books/[id]/illustrate/batch/route.ts`

Batch creates N independent illustration requests. Each fires in parallel via fire-and-forget fetch to the single-page route. Returns immediately with job tracking.

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const batchSchema = z.object({
  pages: z.array(z.object({
    pageId: z.string().uuid(),
    imagePrompt: z.string().min(1).max(5000),
    characterIds: z.array(z.string().uuid()).optional(),
  })).min(1).max(20),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
  includeCover: z.boolean().default(false),
  coverPrompt: z.string().max(5000).optional(),
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
  const parsed = batchSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { pages, qualityMode, includeCover, coverPrompt } = parsed.data

  // Verify book ownership
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Calculate total cost
  const pageCost = pages.length * CREDIT_COST[qualityMode]
  const coverCost = includeCover ? 5 : 0
  const totalCost = pageCost + coverCost

  // Check available credits (not reserve — each page reserves independently)
  const adminClient = createAdminClient()
  const { data: creditRow } = await adminClient
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()
  const balance = creditRow?.balance ?? 0
  if (balance < totalCost) {
    return apiError(
      `Insufficient credits. Need ${totalCost}, have ${balance}`,
      'INSUFFICIENT_CREDITS',
      402,
    )
  }

  // Mark all target pages as "generating" (select-then-insert/update since no unique constraint on book_page_id)
  const pageIds = pages.map(p => p.pageId)
  for (const pageId of pageIds) {
    const { data: existing } = await supabase
      .from('page_illustrations')
      .select('id')
      .eq('book_page_id', pageId)
      .single()

    if (existing) {
      await supabase.from('page_illustrations').update({ status: 'generating', quality_mode: qualityMode }).eq('id', existing.id)
    } else {
      await supabase.from('page_illustrations').insert({ book_page_id: pageId, status: 'generating', quality_mode: qualityMode })
    }
  }

  // Fire individual illustration requests in parallel (fire-and-forget)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const forwardHeaders: Record<string, string> = {}
  const cookie = request.headers.get('cookie')
  if (cookie) forwardHeaders['cookie'] = cookie

  // Fire each page illustration
  for (const page of pages) {
    fetch(`${baseUrl}/api/v1/story/books/${bookId}/illustrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...forwardHeaders },
      body: JSON.stringify({
        pageId: page.pageId,
        imagePrompt: page.imagePrompt,
        qualityMode,
        characterIds: page.characterIds,
      }),
    }).catch(() => {}) // fire-and-forget
  }

  // Fire cover if requested
  if (includeCover && coverPrompt) {
    fetch(`${baseUrl}/api/v1/story/books/${bookId}/illustrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...forwardHeaders },
      body: JSON.stringify({
        imagePrompt: coverPrompt,
        qualityMode: 'quality',
      }),
    }).catch(() => {})
  }

  return apiSuccess({
    queued: pages.length + (includeCover ? 1 : 0),
    totalCost,
    qualityMode,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/\[id\]/illustrate/batch/route.ts
git commit -m "feat(story-studio): add batch illustration generation API"
```

---

### Task 4: Create book cover API

**Files:**
- Create: `app/api/v1/story/books/[id]/cover/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { data: cover } = await supabase
    .from('book_cover')
    .select('id, image_url, status, prompt, created_at')
    .eq('book_id', bookId)
    .single()

  return apiSuccess(cover ? {
    id: cover.id,
    imageUrl: cover.image_url,
    status: cover.status,
    prompt: cover.prompt,
    createdAt: cover.created_at,
  } : null)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/\[id\]/cover/route.ts
git commit -m "feat(story-studio): add book cover GET API"
```

---

### Task 5: Create narration audio list API

**Files:**
- Create: `app/api/v1/story/books/[id]/audio/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Verify ownership
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Fetch pages with audio
  const { data: pages, error: pagesErr } = await supabase
    .from('book_pages')
    .select(`
      id, sequence, narrative_text, dialogue,
      page_audio (id, audio_url, status, voice_map, duration_seconds, created_at, updated_at)
    `)
    .eq('book_id', bookId)
    .order('sequence', { ascending: true })

  if (pagesErr) return apiError(pagesErr.message, 'DB_ERROR', 500)

  return apiSuccess({
    pages: (pages ?? []).map(p => ({
      id: p.id,
      sequence: p.sequence,
      narrativeText: p.narrative_text,
      dialogue: p.dialogue,
      audio: p.page_audio?.[0] ? {
        id: p.page_audio[0].id,
        audioUrl: p.page_audio[0].audio_url,
        status: p.page_audio[0].status,
        voiceMap: p.page_audio[0].voice_map,
        durationSeconds: p.page_audio[0].duration_seconds,
        createdAt: p.page_audio[0].created_at,
        updatedAt: p.page_audio[0].updated_at,
      } : null,
    })),
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/\[id\]/audio/route.ts
git commit -m "feat(story-studio): add narration audio list API"
```

---

### Task 6: Create single page narration API

**Files:**
- Create: `app/api/v1/story/books/[id]/narrate/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import {
  assignVoices,
  segmentPageAudio,
  generateMultiVoicePageAudio,
} from '@/lib/story/tts'
import { uploadToR2 } from '@/lib/storage/r2'

const narrateSchema = z.object({
  pageId: z.string().uuid(),
  narratorVoice: z.string().min(1),               // curated narrator voice name
  voiceMap: z.record(z.string()).optional(),        // character name → voice name overrides
})

const CREDIT_COST = 3  // 3 credits per page narration

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = narrateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { pageId, narratorVoice, voiceMap: voiceOverrides } = parsed.data

  // Verify book ownership
  const { data: book } = await supabase
    .from('books')
    .select('id, series_id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Fetch page content
  const { data: page } = await supabase
    .from('book_pages')
    .select('id, sequence, narrative_text, dialogue')
    .eq('id', pageId)
    .eq('book_id', bookId)
    .single()
  if (!page) return apiError('Page not found', 'NOT_FOUND', 404)

  // Reserve credits
  const adminClient = createAdminClient()
  const { data: reserveData, error: reserveErr } = await adminClient.rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_description: `Story Studio — narration page ${page.sequence}`,
  })
  // RPC returns a table — extract first row
  const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData
  if (reserveErr || !reservation?.reservation_id) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  try {
    // Build voice map: narrator + character voices
    // Start with character voice preferences from the characters table
    const dialogueSpeakers = (page.dialogue as { speaker: string; line: string }[] ?? [])
      .map(d => d.speaker)
      .filter((v, i, a) => a.indexOf(v) === i)  // unique

    // Fetch character voice preferences if any speakers found
    let characterVoices: Record<string, string> = {}
    if (dialogueSpeakers.length > 0) {
      const { data: chars } = await supabase
        .from('characters')
        .select('name, voice')
        .eq('user_id', userId)
        .in('name', dialogueSpeakers)
      for (const c of chars ?? []) {
        if (c.voice) characterVoices[c.name] = c.voice
      }
    }

    // Merge: character defaults → book-level overrides → per-request overrides
    const finalVoiceMap: Record<string, string> = {
      narrator: narratorVoice,
      ...characterVoices,
      ...(voiceOverrides ?? {}),
    }

    // Segment page into narration + dialogue
    const segments = segmentPageAudio(
      page.narrative_text || '',
      page.dialogue as { speaker: string; line: string }[] | undefined,
      finalVoiceMap,
    )

    if (segments.length === 0) {
      // Release credits — nothing to generate
      await adminClient.rpc('release_reserved_credits', {
        p_reservation_id: reservation.reservation_id,
        p_reason: 'No audio segments to generate',
      })
      return apiError('Page has no text content to narrate', 'VALIDATION_ERROR', 400)
    }

    // Generate multi-voice audio
    const result = await generateMultiVoicePageAudio({
      segments,
      bookId,
      pageNumber: page.sequence,
    })

    if (!result?.audioUrl) throw new Error('TTS returned no audio')

    // Store result in page_audio
    const { data: existing } = await supabase
      .from('page_audio')
      .select('id')
      .eq('book_page_id', pageId)
      .single()

    const audioData = {
      book_page_id: pageId,
      audio_url: result.audioUrl,
      status: 'done' as const,
      voice_map: finalVoiceMap,
      // Note: generateMultiVoicePageAudio does not return durationSeconds — column stays null
      // Duration could be calculated client-side from the audio element if needed
      duration_seconds: null,
    }

    if (existing) {
      await supabase
        .from('page_audio')
        .update(audioData)
        .eq('id', existing.id)
    } else {
      await supabase
        .from('page_audio')
        .insert(audioData)
    }

    // Confirm credits
    await adminClient.rpc('confirm_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_description: `Story Studio — narration page ${page.sequence}`,
    })

    return apiSuccess({
      audioUrl: result.audioUrl,
      voiceMap: finalVoiceMap,
      pageId,
    })
  } catch (e) {
    // Release credits
    await adminClient.rpc('release_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_reason: `Failed: ${e instanceof Error ? e.message : 'Unknown'}`,
    })

    // Mark as error (select-then-insert/update since no unique constraint on book_page_id)
    const { data: existingAudio } = await supabase
      .from('page_audio')
      .select('id')
      .eq('book_page_id', pageId)
      .single()

    if (existingAudio) {
      await supabase.from('page_audio').update({ status: 'error', voice_map: {} }).eq('id', existingAudio.id)
    } else {
      await supabase.from('page_audio').insert({ book_page_id: pageId, status: 'error', voice_map: {} })
    }

    return apiError(
      e instanceof Error ? e.message : 'Failed to generate narration',
      'GENERATION_ERROR',
      500,
    )
  }
}

export const maxDuration = 120
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/\[id\]/narrate/route.ts
git commit -m "feat(story-studio): add single page narration generation API"
```

---

### Task 7: Create batch narration API

**Files:**
- Create: `app/api/v1/story/books/[id]/narrate/batch/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const batchNarrateSchema = z.object({
  pageIds: z.array(z.string().uuid()).min(1).max(20),
  narratorVoice: z.string().min(1),
  voiceMap: z.record(z.string()).optional(),
})

const CREDIT_COST = 3

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = batchNarrateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { pageIds, narratorVoice, voiceMap } = parsed.data

  // Verify ownership
  const { data: book } = await supabase
    .from('books')
    .select('id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Check credits
  const totalCost = pageIds.length * CREDIT_COST
  const adminClient = createAdminClient()
  const { data: creditRow } = await adminClient
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()
  const balance = creditRow?.balance ?? 0
  if (balance < totalCost) {
    return apiError(
      `Insufficient credits. Need ${totalCost}, have ${balance}`,
      'INSUFFICIENT_CREDITS',
      402,
    )
  }

  // Mark pages as generating (select-then-insert/update since no unique constraint on book_page_id)
  for (const pageId of pageIds) {
    const { data: existing } = await supabase
      .from('page_audio')
      .select('id')
      .eq('book_page_id', pageId)
      .single()

    if (existing) {
      await supabase.from('page_audio').update({ status: 'generating', voice_map: {} }).eq('id', existing.id)
    } else {
      await supabase.from('page_audio').insert({ book_page_id: pageId, status: 'generating', voice_map: {} })
    }
  }

  // Fire individual narration requests
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const forwardHeaders: Record<string, string> = {}
  const cookie = request.headers.get('cookie')
  if (cookie) forwardHeaders['cookie'] = cookie

  for (const pageId of pageIds) {
    fetch(`${baseUrl}/api/v1/story/books/${bookId}/narrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...forwardHeaders },
      body: JSON.stringify({ pageId, narratorVoice, voiceMap }),
    }).catch(() => {})
  }

  return apiSuccess({
    queued: pageIds.length,
    totalCost,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/\[id\]/narrate/batch/route.ts
git commit -m "feat(story-studio): add batch narration generation API"
```

---

## Chunk 2: Illustration Hooks & Components

### Task 8: Create useIllustrations hook

**Files:**
- Create: `tools/story-studio/use-illustrations.ts`

- [ ] **Step 1: Create the hook file**

```ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'

export interface PageIllustration {
  id: string
  sequence: number
  sceneDescription: string
  narrativeText: string
  imagePrompt: string | null
  dialogue: { speaker: string; line: string }[] | null
  mood: string | null
  illustration: {
    id: string
    imageUrl: string | null
    status: 'pending' | 'generating' | 'done' | 'error'
    qualityMode: 'fast' | 'quality'
    generationConfig: Record<string, unknown> | null
    createdAt: string
    updatedAt: string
  } | null
}

export interface BookCover {
  id: string
  imageUrl: string | null
  status: 'pending' | 'generating' | 'done' | 'error'
  prompt: string | null
  createdAt: string
}

export function useIllustrations() {
  const { activeBookId } = useBookContext()
  const [pages, setPages] = useState<PageIllustration[]>([])
  const [cover, setCover] = useState<BookCover | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIllustrations = useCallback(async () => {
    if (!activeBookId) { setPages([]); setCover(null); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/story/books/${activeBookId}/illustrations`)
      if (!res.ok) throw new Error('Failed to load illustrations')
      const { data } = await res.json()
      setPages(data.pages ?? [])
      setCover(data.cover ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [activeBookId])

  useEffect(() => { fetchIllustrations() }, [fetchIllustrations])

  const generateOne = useCallback(async (
    pageId: string | null,
    imagePrompt: string,
    qualityMode: 'fast' | 'quality',
    characterIds?: string[],
  ) => {
    if (!activeBookId) return

    // Optimistically set status to generating
    if (pageId) {
      setPages(prev => prev.map(p =>
        p.id === pageId
          ? { ...p, illustration: { ...p.illustration!, status: 'generating' } as PageIllustration['illustration'] }
          : p,
      ))
    }

    const res = await fetch(`/api/v1/story/books/${activeBookId}/illustrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, imagePrompt, qualityMode, characterIds }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Generation failed')
    }

    const { data } = await res.json()
    // Refresh to get updated state
    await fetchIllustrations()
    return data
  }, [activeBookId, fetchIllustrations])

  const generateBatch = useCallback(async (
    pages: { pageId: string; imagePrompt: string; characterIds?: string[] }[],
    qualityMode: 'fast' | 'quality',
    includeCover?: boolean,
    coverPrompt?: string,
  ) => {
    if (!activeBookId) return

    const res = await fetch(`/api/v1/story/books/${activeBookId}/illustrate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages, qualityMode, includeCover, coverPrompt }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Batch failed')
    }

    const { data } = await res.json()
    // Start polling for updates
    return data
  }, [activeBookId])

  return {
    pages, cover, loading, error,
    generateOne, generateBatch,
    refresh: fetchIllustrations,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/use-illustrations.ts
git commit -m "feat(story-studio): add useIllustrations hook"
```

---

### Task 9: Create PageGrid component

**Files:**
- Create: `tools/story-studio/illustrations/page-grid.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'
import type { PageIllustration, BookCover } from '@/tools/story-studio/use-illustrations'

interface PageGridProps {
  pages: PageIllustration[]
  cover: BookCover | null
  selectedIds: Set<string>
  onToggleSelect: (pageId: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onPageClick: (pageId: string | null) => void  // null = cover
}

export function PageGrid({
  pages, cover, selectedIds,
  onToggleSelect, onSelectAll, onDeselectAll, onPageClick,
}: PageGridProps) {
  const allSelected = pages.length > 0 && pages.every(p => selectedIds.has(p.id))

  return (
    <div>
      {/* Batch selection controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
        {selectedIds.size > 0 && (
          <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Cover card */}
        <div
          className="relative bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed
            border-amber-300 dark:border-amber-700 overflow-hidden cursor-pointer
            hover:shadow-md transition-shadow"
          onClick={() => onPageClick(null)}
        >
          <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {cover?.imageUrl ? (
              <img src={cover.imageUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-400">
                <svg className="w-10 h-10 mx-auto mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <p className="text-xs">Cover</p>
              </div>
            )}
          </div>
          <StatusBadge status={cover?.status ?? 'pending'} label="Cover" />
        </div>

        {/* Page cards */}
        {pages.map(page => {
          const isSelected = selectedIds.has(page.id)
          const ill = page.illustration

          return (
            <div
              key={page.id}
              className={`relative bg-white dark:bg-slate-900 rounded-xl border overflow-hidden
                cursor-pointer hover:shadow-md transition-all ${
                  isSelected
                    ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-800'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              onClick={() => onPageClick(page.id)}
            >
              {/* Checkbox */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={e => { e.stopPropagation(); onToggleSelect(page.id) }}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer
                  ${isSelected
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {ill?.imageUrl ? (
                  <img src={ill.imageUrl} alt={`Page ${page.sequence}`} className="w-full h-full object-cover" />
                ) : ill?.status === 'generating' ? (
                  <div className="text-center text-slate-400">
                    <div className="w-8 h-8 mx-auto border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs mt-2">Generating...</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Page {page.sequence}</p>
                )}
              </div>

              <StatusBadge status={ill?.status ?? 'pending'} label={`Page ${page.sequence}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    done: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    generating: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    pending: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  }

  return (
    <div className="p-2 flex items-center justify-between">
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors[status] || colors.pending}`}>
        {status === 'done' ? 'Done' : status === 'generating' ? 'Generating' : status === 'error' ? 'Error' : 'Pending'}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/illustrations/page-grid.tsx
git commit -m "feat(story-studio): add PageGrid component for illustration overview"
```

---

### Task 10: Create IllustrationControls component

**Files:**
- Create: `tools/story-studio/illustrations/illustration-controls.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

interface IllustrationControlsProps {
  selectedCount: number
  qualityMode: 'fast' | 'quality'
  onQualityChange: (mode: 'fast' | 'quality') => void
  onGenerateSelected: () => void
  generating: boolean
}

const CREDIT_COST = { fast: 3, quality: 5 } as const

export function IllustrationControls({
  selectedCount, qualityMode, onQualityChange,
  onGenerateSelected, generating,
}: IllustrationControlsProps) {
  const costPerPage = CREDIT_COST[qualityMode]
  const totalCost = selectedCount * costPerPage

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl
      border border-slate-200 dark:border-slate-800">
      {/* Quality toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Quality:</span>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['quality', 'fast'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onQualityChange(mode)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                qualityMode === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {mode === 'quality' ? 'Quality' : 'Fast'}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {costPerPage} credit{costPerPage !== 1 ? 's' : ''}/page
        </span>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerateSelected}
        disabled={selectedCount === 0 || generating}
        className="ml-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
          disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
        style={{ minHeight: '44px' }}
      >
        {generating
          ? 'Generating...'
          : selectedCount > 0
            ? `Generate Selected (${selectedCount}) — ${totalCost} credits`
            : 'Select pages to generate'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/illustrations/illustration-controls.tsx
git commit -m "feat(story-studio): add IllustrationControls with quality toggle and cost display"
```

---

### Task 11: Create PageIllustrationDetail component

**Files:**
- Create: `tools/story-studio/illustrations/page-illustration-detail.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'
import type { PageIllustration } from '@/tools/story-studio/use-illustrations'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface PageIllustrationDetailProps {
  page: PageIllustration
  characters: CharacterItem[]  // all approved characters
  qualityMode: 'fast' | 'quality'
  onGenerate: (imagePrompt: string, qualityMode: 'fast' | 'quality', characterIds: string[]) => Promise<void>
  onBack: () => void
  generating: boolean
}

export function PageIllustrationDetail({
  page, characters, qualityMode, onGenerate, onBack, generating,
}: PageIllustrationDetailProps) {
  const [prompt, setPrompt] = useState(page.imagePrompt || page.sceneDescription || '')
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(() => {
    // Auto-detect characters from dialogue speakers
    const speakers = (page.dialogue ?? []).map(d => d.speaker.toLowerCase())
    return characters
      .filter(c => speakers.includes(c.name.toLowerCase()))
      .map(c => c.id)
  })
  const [mode, setMode] = useState(qualityMode)

  const ill = page.illustration
  const previousUrl = ill?.imageUrl

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Back to grid"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Page {page.sequence}
        </h2>
        {ill?.status && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            ill.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            ill.status === 'generating' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            ill.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-slate-100 text-slate-500'
          }`}>
            {ill.status}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Preview */}
        <div>
          <div className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {previousUrl ? (
              <img src={previousUrl} alt={`Page ${page.sequence}`} className="w-full h-full object-cover" />
            ) : generating ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm mt-3">Generating illustration...</p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <p className="text-sm">No illustration yet</p>
              </div>
            )}
          </div>

          {/* Continuity indicator */}
          {page.sequence > 1 && (
            <p className="text-xs text-slate-400 mt-2">
              Uses Page {page.sequence - 1} as style reference for visual continuity
            </p>
          )}
        </div>

        {/* Right: Controls */}
        <div className="space-y-4">
          {/* Scene description (read-only) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Scene Description</label>
            <p className="text-sm text-slate-600 dark:text-slate-400">{page.sceneDescription || 'No scene description'}</p>
          </div>

          {/* Image prompt (editable) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Image Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the illustration..."
            />
          </div>

          {/* Character picker */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">
              Characters in Scene ({selectedCharacterIds.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {characters.filter(c => c.status === 'approved').map(char => {
                const isSelected = selectedCharacterIds.includes(char.id)
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacterIds(prev =>
                      isSelected ? prev.filter(id => id !== char.id) : [...prev, char.id]
                    )}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {char.referenceImageUrl ? (
                      <img src={char.referenceImageUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                    )}
                    {char.name}
                  </button>
                )
              })}
              {characters.filter(c => c.status === 'approved').length === 0 && (
                <p className="text-xs text-slate-400 italic">No approved characters. Approve characters in the Characters tab.</p>
              )}
            </div>
          </div>

          {/* Quality mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Mode:</span>
            {(['quality', 'fast'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                  mode === m
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {m === 'quality' ? 'Quality (5 cr)' : 'Fast (3 cr)'}
              </button>
            ))}
          </div>

          {/* Generate / Regenerate */}
          <button
            onClick={() => onGenerate(prompt, mode, selectedCharacterIds)}
            disabled={!prompt.trim() || generating}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {generating ? 'Generating...' : previousUrl ? 'Regenerate' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/illustrations/page-illustration-detail.tsx
git commit -m "feat(story-studio): add PageIllustrationDetail with prompt editor and character picker"
```

---

## Chunk 3: Illustrations Tab Page

### Task 12: Implement Illustrations tab page

**Files:**
- Modify: `app/tools/story-studio/illustrations/page.tsx`

- [ ] **Step 1: Replace placeholder with full implementation**

Replace the entire content of `app/tools/story-studio/illustrations/page.tsx`:

```tsx
'use client'

import { useState, useCallback } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'
import { useIllustrations } from '@/tools/story-studio/use-illustrations'
import { useCharacterList } from '@/tools/story-studio/use-characters'
import { PageGrid } from '@/tools/story-studio/illustrations/page-grid'
import { IllustrationControls } from '@/tools/story-studio/illustrations/illustration-controls'
import { PageIllustrationDetail } from '@/tools/story-studio/illustrations/page-illustration-detail'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

type View = 'grid' | 'detail'

export default function IllustrationsPage() {
  const { user, loading: authLoading } = useAuth()
  const { activeBookId } = useBookContext()
  const { pages, cover, loading, generateOne, generateBatch, refresh } = useIllustrations()
  const { characters } = useCharacterList()

  const [view, setView] = useState<View>('grid')
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [qualityMode, setQualityMode] = useState<'fast' | 'quality'>('quality')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggleSelect = useCallback((pageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(pageId) ? next.delete(pageId) : next.add(pageId)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(pages.map(p => p.id)))
  }, [pages])

  const handleDeselectAll = useCallback(() => setSelectedIds(new Set()), [])

  const handlePageClick = useCallback((pageId: string | null) => {
    if (pageId) {
      setSelectedPageId(pageId)
      setView('detail')
    }
    // Cover click — could open a cover-specific detail (simplified: use same detail)
  }, [])

  const handleGenerateOne = useCallback(async (
    imagePrompt: string,
    mode: 'fast' | 'quality',
    characterIds: string[],
  ) => {
    setGenerating(true)
    setError(null)
    try {
      await generateOne(selectedPageId, imagePrompt, mode, characterIds)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }, [generateOne, selectedPageId])

  const handleGenerateBatch = useCallback(async () => {
    if (selectedIds.size === 0) return
    setGenerating(true)
    setError(null)
    try {
      const batchPages = pages
        .filter(p => selectedIds.has(p.id))
        .map(p => ({
          pageId: p.id,
          imagePrompt: p.imagePrompt || p.sceneDescription || '',
          characterIds: undefined,  // auto-detect on server
        }))
      await generateBatch(batchPages, qualityMode)
      // Start polling for updates (simple interval)
      const interval = setInterval(async () => {
        await refresh()
      }, 5000)
      setTimeout(() => clearInterval(interval), 120000)  // stop after 2 min
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Batch failed')
    } finally {
      setGenerating(false)
    }
  }, [selectedIds, pages, qualityMode, generateBatch, refresh])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to illustrate books</h2>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  // No book selected
  if (!activeBookId) {
    return (
      <div className="text-center py-20">
        <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Select a book to start illustrating</h2>
        <p className="text-sm text-slate-400">Choose a book from the dropdown above.</p>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  // Detail view
  if (view === 'detail' && selectedPageId) {
    const page = pages.find(p => p.id === selectedPageId)
    if (!page) { setView('grid'); return null }

    return (
      <PageIllustrationDetail
        page={page}
        characters={characters}
        qualityMode={qualityMode}
        onGenerate={handleGenerateOne}
        onBack={() => { setView('grid'); refresh() }}
        generating={generating}
      />
    )
  }

  // Grid view (default)
  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <IllustrationControls
        selectedCount={selectedIds.size}
        qualityMode={qualityMode}
        onQualityChange={setQualityMode}
        onGenerateSelected={handleGenerateBatch}
        generating={generating}
      />

      <PageGrid
        pages={pages}
        cover={cover}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onPageClick={handlePageClick}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "illustrations" | head -10`

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/illustrations/page.tsx
git commit -m "feat(story-studio): implement Illustrations tab with grid, detail, and batch generation"
```

---

## Chunk 4: Narration Hooks & Components

### Task 13: Create useNarration hook

**Files:**
- Create: `tools/story-studio/use-narration.ts`

- [ ] **Step 1: Create the hook file**

```ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'

export interface PageNarration {
  id: string
  sequence: number
  narrativeText: string
  dialogue: { speaker: string; line: string }[] | null
  audio: {
    id: string
    audioUrl: string | null
    status: 'pending' | 'generating' | 'done' | 'error'
    voiceMap: Record<string, string> | null
    durationSeconds: number | null  // Currently null — TTS doesn't return duration; can be calculated client-side from audio element
    createdAt: string
    updatedAt: string
  } | null
}

export function useNarration() {
  const { activeBookId } = useBookContext()
  const [pages, setPages] = useState<PageNarration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAudio = useCallback(async () => {
    if (!activeBookId) { setPages([]); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/story/books/${activeBookId}/audio`)
      if (!res.ok) throw new Error('Failed to load audio')
      const { data } = await res.json()
      setPages(data.pages ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [activeBookId])

  useEffect(() => { fetchAudio() }, [fetchAudio])

  const generateOne = useCallback(async (
    pageId: string,
    narratorVoice: string,
    voiceMap?: Record<string, string>,
  ) => {
    if (!activeBookId) return

    // Optimistic update
    setPages(prev => prev.map(p =>
      p.id === pageId
        ? { ...p, audio: { ...p.audio!, status: 'generating' } as PageNarration['audio'] }
        : p,
    ))

    const res = await fetch(`/api/v1/story/books/${activeBookId}/narrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, narratorVoice, voiceMap }),
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error || 'Narration failed')
    }

    await fetchAudio()
    return json
  }, [activeBookId, fetchAudio])

  const generateBatch = useCallback(async (
    pageIds: string[],
    narratorVoice: string,
    voiceMap?: Record<string, string>,
  ) => {
    if (!activeBookId) return

    const res = await fetch(`/api/v1/story/books/${activeBookId}/narrate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageIds, narratorVoice, voiceMap }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Batch narration failed')
    }

    return await res.json()
  }, [activeBookId])

  return {
    pages, loading, error,
    generateOne, generateBatch,
    refresh: fetchAudio,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/use-narration.ts
git commit -m "feat(story-studio): add useNarration hook"
```

---

### Task 14: Create NarratorVoiceSelector component

**Files:**
- Create: `tools/story-studio/narration/narrator-voice-selector.tsx`

- [ ] **Step 1: Create the component**

Curated narrator voices — a subset of GEMINI_VOICES suited for storytelling.

```tsx
'use client'

import { useRef, useState } from 'react'
import { GEMINI_VOICES, type GeminiVoice } from '@/lib/story/voices'

// Curated voices for narration — calm, warm, clear delivery
const NARRATOR_VOICES = GEMINI_VOICES.filter(v =>
  ['Enceladus', 'Aoede', 'Leda', 'Kore', 'Charon', 'Fenrir'].includes(v.name)
)

interface NarratorVoiceSelectorProps {
  selectedVoice: string
  onSelect: (voiceName: string) => void
}

export function NarratorVoiceSelector({ selectedVoice, onSelect }: NarratorVoiceSelectorProps) {
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function handlePreview(voice: GeminiVoice) {
    if (previewLoading) return
    if (previewVoice === voice.name) {
      audioRef.current?.pause()
      setPreviewVoice(null)
      return
    }
    setPreviewLoading(true)
    setPreviewVoice(voice.name)
    try {
      const res = await fetch('/api/v1/story/voice-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceName: voice.name, characterName: 'the narrator' }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setPreviewVoice(null)
      await audio.play()
    } catch {
      setPreviewVoice(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Narrator Voice</label>
      <div className="flex flex-wrap gap-2">
        {NARRATOR_VOICES.map(voice => {
          const isSelected = selectedVoice === voice.name
          const isPreviewing = previewVoice === voice.name
          return (
            <div
              key={voice.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <button
                onClick={() => onSelect(voice.name)}
                className="text-sm font-medium cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <span className={isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}>
                  {voice.name}
                </span>
                <span className="ml-1 text-[10px] text-slate-400">
                  {voice.gender} · {voice.style}
                </span>
              </button>
              <button
                onClick={() => handlePreview(voice)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-500 cursor-pointer"
                aria-label={`Preview ${voice.name}`}
              >
                {isPreviewing ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/narration/narrator-voice-selector.tsx
git commit -m "feat(story-studio): add NarratorVoiceSelector with preview"
```

---

### Task 15: Create VoiceMapEditor component

**Files:**
- Create: `tools/story-studio/narration/voice-map-editor.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { GEMINI_VOICES } from '@/lib/story/voices'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface VoiceMapEditorProps {
  characters: CharacterItem[]             // characters detected in this book's dialogue
  voiceMap: Record<string, string>        // character name → voice name
  onChange: (voiceMap: Record<string, string>) => void
}

export function VoiceMapEditor({ characters, voiceMap, onChange }: VoiceMapEditorProps) {
  if (characters.length === 0) return null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Character Voices</label>
      <div className="space-y-2">
        {characters.map(char => {
          const currentVoice = voiceMap[char.name] || char.voice || ''
          return (
            <div key={char.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[120px]">
                {char.referenceImageUrl ? (
                  <img src={char.referenceImageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {char.name}
                </span>
              </div>
              <select
                value={currentVoice}
                onChange={e => onChange({ ...voiceMap, [char.name]: e.target.value })}
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600
                  bg-white dark:bg-slate-800 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select voice...</option>
                {GEMINI_VOICES.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.gender} · {v.age} · {v.style})
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/narration/voice-map-editor.tsx
git commit -m "feat(story-studio): add VoiceMapEditor for character-to-voice mapping"
```

---

### Task 16: Create PageNarrationList component

**Files:**
- Create: `tools/story-studio/narration/page-narration-list.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useRef, useState } from 'react'
import type { PageNarration } from '@/tools/story-studio/use-narration'

interface PageNarrationListProps {
  pages: PageNarration[]
  selectedIds: Set<string>
  onToggleSelect: (pageId: string) => void
  onPageClick: (pageId: string) => void
}

export function PageNarrationList({
  pages, selectedIds, onToggleSelect, onPageClick,
}: PageNarrationListProps) {
  return (
    <div className="space-y-2">
      {pages.map(page => {
        const audio = page.audio
        const isSelected = selectedIds.has(page.id)
        const previewText = (page.narrativeText || '').slice(0, 100) + ((page.narrativeText?.length ?? 0) > 100 ? '...' : '')
        const speakers = [...new Set((page.dialogue ?? []).map(d => d.speaker))]

        return (
          <div
            key={page.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer
              hover:shadow-sm transition-all ${
                isSelected
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            onClick={() => onPageClick(page.id)}
          >
            {/* Checkbox */}
            <div
              onClick={e => { e.stopPropagation(); onToggleSelect(page.id) }}
              className="shrink-0"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>

            {/* Page info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Page {page.sequence}
                </span>
                {speakers.length > 0 && (
                  <span className="text-[10px] text-slate-400 truncate">
                    {speakers.join(', ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{previewText || 'No text'}</p>
            </div>

            {/* Duration + status */}
            <div className="shrink-0 text-right">
              {audio?.durationSeconds ? (
                <span className="text-xs text-slate-500">
                  {Math.floor(audio.durationSeconds / 60)}:{String(Math.floor(audio.durationSeconds % 60)).padStart(2, '0')}
                </span>
              ) : null}
              <span className={`block text-[10px] font-semibold mt-0.5 ${
                audio?.status === 'done' ? 'text-green-600 dark:text-green-400' :
                audio?.status === 'generating' ? 'text-blue-600 dark:text-blue-400' :
                audio?.status === 'error' ? 'text-red-600 dark:text-red-400' :
                'text-slate-400'
              }`}>
                {audio?.status === 'done' ? 'Done' :
                 audio?.status === 'generating' ? 'Generating...' :
                 audio?.status === 'error' ? 'Error' : 'Pending'}
              </span>
            </div>

            {/* Inline audio player for done pages */}
            {audio?.audioUrl && audio.status === 'done' && (
              <InlinePlayer audioUrl={audio.audioUrl} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function InlinePlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!audioRef.current) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
        text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800
        transition-colors cursor-pointer"
      aria-label={playing ? 'Pause' : 'Play'}
    >
      {playing ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/narration/page-narration-list.tsx
git commit -m "feat(story-studio): add PageNarrationList with inline audio player"
```

---

## Chunk 5: Narration Tab Page

### Task 17: Implement Narration tab page

**Files:**
- Modify: `app/tools/story-studio/narration/page.tsx`

- [ ] **Step 1: Replace placeholder with full implementation**

Replace the entire content of `app/tools/story-studio/narration/page.tsx`:

```tsx
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'
import { useNarration } from '@/tools/story-studio/use-narration'
import { useCharacterList } from '@/tools/story-studio/use-characters'
import { NarratorVoiceSelector } from '@/tools/story-studio/narration/narrator-voice-selector'
import { VoiceMapEditor } from '@/tools/story-studio/narration/voice-map-editor'
import { PageNarrationList } from '@/tools/story-studio/narration/page-narration-list'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

const CREDIT_PER_PAGE = 3

export default function NarrationPage() {
  const { user, loading: authLoading } = useAuth()
  const { activeBookId } = useBookContext()
  const { pages, loading, generateOne, generateBatch, refresh } = useNarration()
  const { characters } = useCharacterList()

  const [narratorVoice, setNarratorVoice] = useState('Enceladus')  // Default narrator
  const [voiceMap, setVoiceMap] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Detect unique speakers across all pages
  const bookSpeakers = useMemo(() => {
    const speakers = new Set<string>()
    for (const page of pages) {
      for (const d of page.dialogue ?? []) {
        speakers.add(d.speaker)
      }
    }
    return Array.from(speakers)
  }, [pages])

  // Characters that appear as speakers in this book
  const bookCharacters = useMemo(() => {
    return characters.filter(c =>
      bookSpeakers.some(s => s.toLowerCase() === c.name.toLowerCase())
    )
  }, [characters, bookSpeakers])

  // Pre-populate voice map from character defaults
  const effectiveVoiceMap = useMemo(() => {
    const defaults: Record<string, string> = {}
    for (const char of bookCharacters) {
      if (char.voice) defaults[char.name] = char.voice
    }
    return { ...defaults, ...voiceMap }
  }, [bookCharacters, voiceMap])

  // Check for unassigned speakers
  const unassignedSpeakers = bookSpeakers.filter(s => !effectiveVoiceMap[s])

  const handleToggleSelect = useCallback((pageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(pageId) ? next.delete(pageId) : next.add(pageId)
      return next
    })
  }, [])

  const handlePageClick = useCallback(async (pageId: string) => {
    // Generate single page narration
    setGenerating(true)
    setError(null)
    try {
      await generateOne(pageId, narratorVoice, effectiveVoiceMap)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Narration failed')
    } finally {
      setGenerating(false)
    }
  }, [generateOne, narratorVoice, effectiveVoiceMap])

  const handleGenerateBatch = useCallback(async () => {
    if (selectedIds.size === 0) return
    if (unassignedSpeakers.length > 0) {
      setError(`Assign voices to: ${unassignedSpeakers.join(', ')}`)
      return
    }
    setGenerating(true)
    setError(null)
    try {
      await generateBatch(Array.from(selectedIds), narratorVoice, effectiveVoiceMap)
      // Poll for updates
      const interval = setInterval(async () => { await refresh() }, 5000)
      setTimeout(() => clearInterval(interval), 120000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Batch failed')
    } finally {
      setGenerating(false)
    }
  }, [selectedIds, unassignedSpeakers, narratorVoice, effectiveVoiceMap, generateBatch, refresh])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to add narration</h2>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  // No book selected
  if (!activeBookId) {
    return (
      <div className="text-center py-20">
        <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Select a book to start narrating</h2>
        <p className="text-sm text-slate-400">Choose a book from the dropdown above.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Narrator voice selector */}
      <NarratorVoiceSelector
        selectedVoice={narratorVoice}
        onSelect={setNarratorVoice}
      />

      {/* Character voice mapping */}
      {bookCharacters.length > 0 && (
        <VoiceMapEditor
          characters={bookCharacters}
          voiceMap={effectiveVoiceMap}
          onChange={setVoiceMap}
        />
      )}

      {/* Unassigned speaker warning */}
      {unassignedSpeakers.length > 0 && (
        <div className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm">
          Unassigned speakers: {unassignedSpeakers.join(', ')}. Select voices above before generating.
        </div>
      )}

      {/* Batch controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const allSelected = pages.every(p => selectedIds.has(p.id))
              setSelectedIds(allSelected ? new Set() : new Set(pages.map(p => p.id)))
            }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {pages.every(p => selectedIds.has(p.id)) ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
          )}
        </div>

        <button
          onClick={handleGenerateBatch}
          disabled={selectedIds.size === 0 || generating}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          {generating
            ? 'Generating...'
            : selectedIds.size > 0
              ? `Generate Selected (${selectedIds.size}) — ${selectedIds.size * CREDIT_PER_PAGE} credits`
              : 'Select pages to generate'}
        </button>
      </div>

      {/* Page list */}
      <PageNarrationList
        pages={pages}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onPageClick={handlePageClick}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "narration" | head -10`

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/narration/page.tsx
git commit -m "feat(story-studio): implement Narration tab with voice mapping and batch generation"
```

---

### Task 18: End-to-end verification

- [ ] **Step 1: Run the dev server and verify Illustrations tab**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev`

Verify:
1. Navigate to `/tools/story-studio/illustrations`
2. Without a book selected: "Select a book to start illustrating" empty state
3. Select a book from dropdown → page grid loads with cover + page cards
4. Each page card shows thumbnail/placeholder, page number, status badge
5. Click checkbox to select pages → selection count updates
6. Quality toggle switches between "Quality" and "Fast" with cost per page
7. "Generate Selected" shows total cost
8. Click a page card → detail view with image prompt editor
9. Character picker shows approved characters with auto-detection from dialogue
10. Continuity indicator shows "Uses Page N as reference"
11. Back button returns to grid

- [ ] **Step 2: Verify Narration tab**

1. Navigate to `/tools/story-studio/narration`
2. Without a book selected: "Select a book to start narrating" empty state
3. Select a book → narrator voice selector shows curated voices with preview
4. Character voice map auto-populated from character definitions
5. Unassigned speakers show warning
6. Page list shows: preview text, speakers, duration, status
7. "Select all" / "Deselect all" works
8. "Generate Selected" shows total cost (3 credits/page)
9. Click individual page → generates narration for that page

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(story-studio): complete Media Modules with Illustrations and Narration tabs"
```

---

## Prerequisites & Dependencies

- **Plan 1 tables required**: `book_pages`, `page_illustrations`, `page_audio`, `book_cover` — all with RLS policies allowing user access via book ownership chain.
- **Plan 2 layout required**: Illustrations and Narration tab routes must exist at `app/tools/story-studio/illustrations/page.tsx` and `narration/page.tsx`. `BookContext` provider with `activeBookId` must be available.
- **Plan 3 characters required**: `useCharacterList` hook provides approved characters for illustration character picker and narration voice mapping.
- **Plan 4 stories required**: Books must have normalized pages in `book_pages` table (created during story generation or from "Write from scratch" flow).
- **Existing generation functions**: `generateIllustration()` from `lib/story/illustrate.ts` and `generateMultiVoicePageAudio()` from `lib/story/tts.ts` are used directly — no pipeline wrapper needed.
- **Credit RPCs**: `reserve_credits`, `confirm_reserved_credits`, `release_reserved_credits` — all from migration 006. Credit balance checks use direct query on `user_credits` table instead of `get_user_credits` RPC.
- **R2 storage**: `uploadToR2(path, body, contentType)` from `@/lib/storage/r2`.

## Notes on Architecture Shift

### Old Pipeline → New Single-Task Model

| Aspect | Old (pipeline via `withJobStep`) | New (direct API calls) |
|---|---|---|
| Trigger | Cron + fire-and-forget chain | User clicks "Generate" |
| Scope | All pages in sequence | One page at a time |
| Job tracking | `book_jobs` table + state machine | Status in `page_illustrations`/`page_audio` tables |
| Failure | Retry via cron, 3 attempts | Immediate error to user, manual retry |
| Credits | Reserve full amount upfront | Reserve per-page at generation time |
| Batch | N/A (sequential pipeline) | Parallel fire-and-forget to single-page routes |
| Duration | Minutes (cascading timeouts) | 30-120s per call |
| User control | All or nothing | Per-page opt-in |

### Batch Polling Strategy

Batch generation uses a simple polling approach:
1. Batch API marks pages as "generating" and fires individual requests
2. Client polls the illustrations/audio list API every 5 seconds
3. Polling stops after 2 minutes (safety net)
4. Individual page statuses update independently as each generation completes

A more sophisticated approach using Server-Sent Events (SSE) or WebSockets could replace polling in a future iteration, but simple polling is sufficient for the current scale.

## Credit Pricing Summary

| Action | Cost | Route |
|---|---|---|
| Illustration (fast) | 3 credits/page | `POST /api/v1/story/books/[id]/illustrate` |
| Illustration (quality) | 5 credits/page | `POST /api/v1/story/books/[id]/illustrate` |
| Cover illustration | 5 credits | `POST /api/v1/story/books/[id]/illustrate` (no pageId) |
| Narration | 3 credits/page | `POST /api/v1/story/books/[id]/narrate` |
