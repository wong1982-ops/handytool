# Story Studio Characters Module Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Characters tab as a top-level module where users manage characters independently of series, with many-to-many series linking, portrait generation, voice assignment, and approval workflow.

**Architecture:** Characters are promoted from `series_characters` (owned by series) to the new `characters` table (owned by user) from Plan 1. The existing series management moves into the Characters tab as a sub-section. API routes are added for the new `characters` table while existing series routes remain functional during transition. The Characters tab UI replaces the old `/series` and `/series/[id]` pages.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS, Supabase RPCs (from Plan 1), Gemini for portrait generation

**Design doc:** `docs/plans/2026-03-13-story-studio-modular-redesign.md`

**Depends on:** Plan 1 (Database & Migration) — new `characters` and `character_series` tables must exist. Plan 2 (Shell Layout) — Characters tab route must exist.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `tools/story-studio/characters/character-list.tsx` | Create | My Characters grid view with cards, search, filters |
| `tools/story-studio/characters/character-form.tsx` | Create | Character create/edit form (name, age, role, personality, physical description, voice) |
| `tools/story-studio/characters/character-detail.tsx` | Create | Character detail view with portrait, refinement, approval |
| `tools/story-studio/characters/series-section.tsx` | Create | Series list & management within Characters tab |
| `tools/story-studio/characters/series-form.tsx` | Create | Series create/edit form (deferred — uses existing `/series` page for now) |
| `tools/story-studio/characters/voice-picker.tsx` | Create | Voice selection with gender/age/style filters and preview (extracted from series `[id]` page) |
| `tools/story-studio/use-characters.ts` | Create | Hooks for character CRUD, refinement, approval |
| `app/tools/story-studio/characters/page.tsx` | Modify | Replace placeholder with full Characters tab (two sections: My Characters + Series) |
| `app/api/v1/story/characters/route.ts` | Create | GET (list) + POST (create) characters |
| `app/api/v1/story/characters/[id]/route.ts` | Create | GET + PATCH + DELETE single character |
| `app/api/v1/story/characters/[id]/refine/route.ts` | Create | POST — refine portrait with feedback |
| `app/api/v1/story/characters/[id]/approve/route.ts` | Create | POST — approve character |
| `app/api/v1/story/characters/[id]/series/route.ts` | Create | POST (link) + DELETE (unlink) character ↔ series |

---

## Chunk 1: Character API Routes

### Task 1: Create character list & create API

**Files:**
- Create: `app/api/v1/story/characters/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { GEMINI_VOICES } from '@/lib/story/voices'

const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.string().max(50).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).optional(),
  personality: z.string().max(2000).optional(),
  physicalDescription: z.string().max(2000).optional(),
  voice: z.string().max(100).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  const { data, error: dbError } = await supabase.rpc('get_user_characters', {
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  return apiSuccess(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  const body = await request.json()
  const parsed = createCharacterSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { name, age, role, personality, physicalDescription, voice } = parsed.data

  // Validate voice name if provided
  if (voice && !GEMINI_VOICES.some(v => v.name === voice)) {
    return apiError('Invalid voice name', 'VALIDATION_ERROR', 400)
  }

  const { data, error: dbError } = await supabase.rpc('insert_character', {
    p_user_id: userId,
    p_name: name,
    p_age: age ?? null,
    p_role: role ?? null,
    p_personality: personality ?? null,
    p_physical_description: physicalDescription ?? null,
    p_voice: voice ?? null,
    p_reference_image_url: null,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  return apiSuccess({ id: data })
}
```

- [ ] **Step 2: Verify file exists**

Run: `ls -la app/api/v1/story/characters/route.ts`

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/story/characters/route.ts
git commit -m "feat(story-studio): add character list and create API routes"
```

---

### Task 2: Create single character API (GET/PATCH/DELETE)

**Files:**
- Create: `app/api/v1/story/characters/[id]/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { GEMINI_VOICES } from '@/lib/story/voices'

const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.string().max(50).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).optional(),
  personality: z.string().max(2000).optional(),
  physicalDescription: z.string().max(2000).optional(),
  voice: z.string().max(100).nullable().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  // Direct query instead of RPC — get character with series links
  const { data, error: dbError } = await supabase
    .from('characters')
    .select('*, character_series(series_id)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (!data) return apiError('Character not found', 'NOT_FOUND', 404)

  // Transform to camelCase with seriesIds array
  const character = {
    id: data.id,
    name: data.name,
    age: data.age,
    role: data.role,
    personality: data.personality,
    physicalDescription: data.physical_description,
    referenceImageUrl: data.reference_image_url,
    voice: data.voice,
    status: data.status,
    refinementCount: data.refinement_count,
    seriesIds: (data.character_series ?? []).map((cs: { series_id: string }) => cs.series_id),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  return apiSuccess(character)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  const body = await request.json()
  const parsed = updateCharacterSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  // Validate voice name if provided and not null (null = clear voice)
  if (parsed.data.voice && !GEMINI_VOICES.some(v => v.name === parsed.data.voice)) {
    return apiError('Invalid voice name', 'VALIDATION_ERROR', 400)
  }

  // Build update object — only include fields that were explicitly provided
  // This avoids COALESCE issues where undefined fields would clear existing values
  const updates: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) updates.name = parsed.data.name
  if (parsed.data.age !== undefined) updates.age = parsed.data.age
  if (parsed.data.role !== undefined) updates.role = parsed.data.role
  if (parsed.data.personality !== undefined) updates.personality = parsed.data.personality
  if (parsed.data.physicalDescription !== undefined) updates.physical_description = parsed.data.physicalDescription
  if (parsed.data.voice !== undefined) updates.voice = parsed.data.voice

  if (Object.keys(updates).length === 0) {
    return apiError('No fields to update', 'VALIDATION_ERROR', 400)
  }

  const { error: dbError, count } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (count === 0) return apiError('Character not found or not owned', 'NOT_FOUND', 404)

  return apiSuccess({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  // Delete character image from R2 if exists
  const { data: char } = await supabase
    .from('characters')
    .select('reference_image_url')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (char?.reference_image_url) {
    try {
      const { deleteFromR2 } = await import('@/lib/storage/r2')
      await deleteFromR2(char.reference_image_url)
    } catch { /* best effort */ }
  }

  const { data, error: dbError } = await supabase.rpc('delete_character', {
    p_character_id: id,
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)
  if (!data) return apiError('Character not found or not owned', 'NOT_FOUND', 404)

  return apiSuccess({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/characters/\[id\]/route.ts
git commit -m "feat(story-studio): add single character GET/PATCH/DELETE API routes"
```

---

### Task 3: Create character refinement API

**Files:**
- Create: `app/api/v1/story/characters/[id]/refine/route.ts`

This is adapted from the existing `app/api/v1/story/series/refine-character/route.ts` but works with the new top-level `characters` table.

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { generateCharacterReference } from '@/lib/story/illustrate'
import { uploadToR2 } from '@/lib/storage/r2'
import { createAdminClient } from '@/lib/supabase/admin'

const refineSchema = z.object({
  physicalDescription: z.string().min(10).max(2000),
  feedback: z.string().max(1000).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  const body = await request.json()
  const parsed = refineSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  // Fetch character — must be owned by user (direct query, no RPC needed)
  const { data: character, error: fetchErr } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .eq('user_id', userId)
    .single()
  if (fetchErr || !character) return apiError('Character not found', 'NOT_FOUND', 404)

  const isFirstGeneration = !character.reference_image_url
  const maxRefinements = 3  // Design doc specifies max 3 refinements

  if (!isFirstGeneration && character.refinement_count >= maxRefinements) {
    return apiError('Refinement limit reached. Approve this character or create a new one.', 'REFINEMENT_LIMIT', 400)
  }

  // Credit check: first generation costs 1 credit, refinements are free
  const adminClient = createAdminClient()
  if (isFirstGeneration) {
    const { data: balance } = await adminClient.rpc('get_user_credits', { p_user_id: userId })
    if ((balance ?? 0) < 1) return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)

    // Reserve credit upfront
    await adminClient.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: 1,
      p_reason: 'character_refinement',
      p_reference_id: characterId,
    })
  }

  // Merge feedback into description if provided
  let description = parsed.data.physicalDescription
  if (parsed.data.feedback) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent(`You are refining a character's physical description based on user feedback.

Current description:
${description}

User feedback:
${parsed.data.feedback}

Write an improved physical description that incorporates the feedback. Keep it under 500 words. Return ONLY the description, no preamble.`)
      const refined = result.response.text()?.trim()
      if (refined && refined.length > 10) description = refined
    } catch {
      // Use original description if merge fails
    }
  }

  // Find a style reference from user's other approved characters
  let styleRefBuffer: Buffer | undefined
  const { data: approvedChars } = await supabase
    .from('characters')
    .select('id, reference_image_url')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .not('reference_image_url', 'is', null)
    .neq('id', characterId)
    .limit(1)
  if (approvedChars?.[0]?.reference_image_url) {
    try {
      const res = await fetch(approvedChars[0].reference_image_url)
      if (res.ok) styleRefBuffer = Buffer.from(await res.arrayBuffer())
    } catch { /* best effort */ }
  }

  // Generate portrait — signature: (characters[], style, styleRefBuffer?)
  let imageBuffer: Buffer | null
  try {
    imageBuffer = await generateCharacterReference(
      [{ name: character.name, description }],
      'children\'s book illustration',  // default style
      styleRefBuffer,
    )
  } catch {
    // Refund credit if generation fails
    if (isFirstGeneration) {
      await adminClient.rpc('add_credits', {
        p_user_id: userId,
        p_amount: 1,
        p_reason: 'character_refinement_refund',
        p_reference_id: characterId,
      })
    }
    return apiError('Failed to generate portrait', 'GENERATION_ERROR', 500)
  }
  if (!imageBuffer) {
    // Refund credit if generation returns null
    if (isFirstGeneration) {
      await adminClient.rpc('add_credits', {
        p_user_id: userId,
        p_amount: 1,
        p_reason: 'character_refinement_refund',
        p_reference_id: characterId,
      })
    }
    return apiError('Failed to generate portrait', 'GENERATION_ERROR', 500)
  }

  // Upload to R2 — signature: uploadToR2(path, body, contentType)
  const key = `characters/${userId}/${characterId}.png`
  const imageUrl = await uploadToR2(key, imageBuffer, 'image/png')

  // Update character with new portrait + description + refinement count
  const newRefinementCount = isFirstGeneration ? 0 : character.refinement_count + 1
  await supabase
    .from('characters')
    .update({
      physical_description: description,
      reference_image_url: imageUrl,
      refinement_count: newRefinementCount,
    })
    .eq('id', characterId)
    .eq('user_id', userId)

  return apiSuccess({
    physicalDescription: description,
    referenceImageUrl: imageUrl,
    refinementCount: newRefinementCount,
    maxRefinements,
  })
}

export const maxDuration = 120
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/characters/\[id\]/refine/route.ts
git commit -m "feat(story-studio): add character portrait refinement API"
```

---

### Task 4: Create character approve API

**Files:**
- Create: `app/api/v1/story/characters/[id]/approve/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  // Fetch character (direct query)
  const { data: character, error: fetchErr } = await supabase
    .from('characters')
    .select('id, status, reference_image_url')
    .eq('id', characterId)
    .eq('user_id', userId)
    .single()
  if (fetchErr || !character) return apiError('Character not found', 'NOT_FOUND', 404)
  if (!character.reference_image_url) return apiError('Character must have a portrait before approval', 'VALIDATION_ERROR', 400)
  if (character.status === 'approved') return apiError('Character is already approved', 'VALIDATION_ERROR', 400)

  // Update status via direct update (RLS handles ownership)
  const { error: updateErr } = await supabase
    .from('characters')
    .update({ status: 'approved' })
    .eq('id', characterId)
    .eq('user_id', userId)

  if (updateErr) return apiError(updateErr.message, 'DB_ERROR', 500)

  return apiSuccess({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/characters/\[id\]/approve/route.ts
git commit -m "feat(story-studio): add character approval API"
```

---

### Task 5: Create character-series linking API

**Files:**
- Create: `app/api/v1/story/characters/[id]/series/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const linkSchema = z.object({
  seriesId: z.string().uuid(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  const body = await request.json()
  const parsed = linkSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { data, error: dbError } = await supabase.rpc('link_character_to_series', {
    p_character_id: characterId,
    p_series_id: parsed.data.seriesId,
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  return apiSuccess({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return apiError('Unauthorized', API_ERRORS.UNAUTHORIZED, 401)

  const url = new URL(request.url)
  const seriesId = url.searchParams.get('seriesId')
  if (!seriesId) return apiError('seriesId query param required', 'VALIDATION_ERROR', 400)

  const { data, error: dbError } = await supabase.rpc('unlink_character_from_series', {
    p_character_id: characterId,
    p_series_id: seriesId,
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  return apiSuccess({ success: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/characters/\[id\]/series/route.ts
git commit -m "feat(story-studio): add character-series linking API"
```

---

## Chunk 2: Character Hooks & Components

### Task 6: Create useCharacters hook

**Files:**
- Create: `tools/story-studio/use-characters.ts`

- [ ] **Step 1: Create the hook file**

```ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

export interface CharacterItem {
  id: string
  name: string
  age: string | null
  role: string | null
  personality: string | null
  physicalDescription: string | null
  referenceImageUrl: string | null
  voice: string | null
  status: 'draft' | 'approved'
  refinementCount: number
  seriesIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateCharacterInput {
  name: string
  age?: string
  role?: 'protagonist' | 'antagonist' | 'supporting'
  personality?: string
  physicalDescription?: string
  voice?: string
}

export interface UpdateCharacterInput {
  name?: string
  age?: string
  role?: 'protagonist' | 'antagonist' | 'supporting'
  personality?: string
  physicalDescription?: string
  voice?: string | null
}

export function useCharacterList() {
  const { user } = useAuth()
  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Note: GET /api/v1/story/characters uses get_user_characters RPC which returns
  // snake_case fields. The RPC returns series as [{id, title}] array per character.
  // We transform to camelCase CharacterItem in the mapping below.
  const fetchCharacters = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      setLoading(true)
      const res = await fetch('/api/v1/story/characters')
      if (!res.ok) throw new Error('Failed to load characters')
      const { data } = await res.json()
      // Transform RPC response (snake_case + series objects) to CharacterItem
      const mapped: CharacterItem[] = (data ?? []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        age: (c.age as string) ?? null,
        role: (c.role as string) ?? null,
        personality: (c.personality as string) ?? null,
        physicalDescription: (c.physical_description as string) ?? null,
        referenceImageUrl: (c.reference_image_url as string) ?? null,
        voice: (c.voice as string) ?? null,
        status: (c.status as 'draft' | 'approved') ?? 'draft',
        refinementCount: (c.refinement_count as number) ?? 0,
        // RPC may return series as [{id, title}] — extract IDs
        seriesIds: Array.isArray(c.series)
          ? (c.series as { id: string }[]).map(s => s.id)
          : [],
        createdAt: c.created_at as string,
        updatedAt: c.updated_at as string,
      }))
      setCharacters(mapped)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchCharacters() }, [fetchCharacters])

  const createCharacter = useCallback(async (input: CreateCharacterInput) => {
    const res = await fetch('/api/v1/story/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Failed to create character')
    }
    const { data } = await res.json()
    await fetchCharacters()
    return data.id as string
  }, [fetchCharacters])

  const deleteCharacter = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/story/characters/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete character')
    setCharacters(prev => prev.filter(c => c.id !== id))
  }, [])

  return { characters, loading, error, createCharacter, deleteCharacter, refresh: fetchCharacters }
}

export function useCharacterDetail(characterId: string | null) {
  const { user } = useAuth()
  const [character, setCharacter] = useState<CharacterItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [refining, setRefining] = useState(false)

  const fetchCharacter = useCallback(async () => {
    if (!characterId || !user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/story/characters/${characterId}`)
      if (!res.ok) throw new Error('Not found')
      const { data } = await res.json()
      setCharacter(data)
    } catch {
      setCharacter(null)
    } finally {
      setLoading(false)
    }
  }, [characterId, user])

  useEffect(() => { fetchCharacter() }, [fetchCharacter])

  const updateCharacter = useCallback(async (updates: UpdateCharacterInput) => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update')
    await fetchCharacter()
  }, [characterId, fetchCharacter])

  const refinePortrait = useCallback(async (physicalDescription: string, feedback?: string) => {
    if (!characterId) return
    setRefining(true)
    try {
      const res = await fetch(`/api/v1/story/characters/${characterId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physicalDescription, feedback }),
      })
      if (!res.ok) {
        const { error, code } = await res.json()
        throw new Error(code === 'INSUFFICIENT_CREDITS' ? 'Insufficient credits' : error)
      }
      const { data } = await res.json()
      // Optimistic update
      setCharacter(prev => prev ? {
        ...prev,
        physicalDescription: data.physicalDescription,
        referenceImageUrl: data.referenceImageUrl,
        refinementCount: data.refinementCount,
      } : null)
      return data
    } finally {
      setRefining(false)
    }
  }, [characterId])

  const approveCharacter = useCallback(async () => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}/approve`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to approve')
    setCharacter(prev => prev ? { ...prev, status: 'approved' } : null)
  }, [characterId])

  const linkToSeries = useCallback(async (seriesId: string) => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}/series`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesId }),
    })
    if (!res.ok) throw new Error('Failed to link')
    await fetchCharacter()
  }, [characterId, fetchCharacter])

  const unlinkFromSeries = useCallback(async (seriesId: string) => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}/series?seriesId=${seriesId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to unlink')
    await fetchCharacter()
  }, [characterId, fetchCharacter])

  return {
    character, loading, refining,
    updateCharacter, refinePortrait, approveCharacter,
    linkToSeries, unlinkFromSeries, refresh: fetchCharacter,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/use-characters.ts
git commit -m "feat(story-studio): add useCharacterList and useCharacterDetail hooks"
```

---

### Task 7: Extract VoicePicker component

**Files:**
- Create: `tools/story-studio/characters/voice-picker.tsx`

Extract the existing VoicePicker from `app/tools/story-studio/series/[id]/page.tsx` (lines 20–193) into its own file for reuse.

- [ ] **Step 1: Create the voice picker component**

```tsx
'use client'

import { useState, useRef } from 'react'
import { GEMINI_VOICES, type GeminiVoice } from '@/lib/story/voices'

interface VoicePickerProps {
  selectedVoice: string | null
  onSelect: (voiceName: string | null) => void
  characterName?: string
}

export function VoicePicker({ selectedVoice, onSelect, characterName }: VoicePickerProps) {
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all')
  const [ageFilter, setAgeFilter] = useState<string>('all')
  const [styleFilter, setStyleFilter] = useState<string>('all')
  const [previewVoice, setPreviewVoice] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredVoices = GEMINI_VOICES.filter(v => {
    if (genderFilter !== 'all' && v.gender !== genderFilter) return false
    if (ageFilter !== 'all' && v.age !== ageFilter) return false
    if (styleFilter !== 'all' && v.style !== styleFilter) return false
    return true
  })

  async function handlePreview(voice: GeminiVoice) {
    if (previewLoading) return
    if (previewVoice === voice.name) {
      // Stop current preview
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
        body: JSON.stringify({
          voiceName: voice.name,
          characterName: characterName || 'this character',
        }),
      })
      if (!res.ok) throw new Error('Preview failed')
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
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterGroup
          label="Gender"
          options={['all', 'female', 'male']}
          value={genderFilter}
          onChange={v => setGenderFilter(v as typeof genderFilter)}
        />
        <FilterGroup
          label="Age"
          options={['all', 'young', 'adult', 'mature']}
          value={ageFilter}
          onChange={setAgeFilter}
        />
        <FilterGroup
          label="Style"
          options={['all', 'bright', 'calm', 'energetic', 'serious', 'warm']}
          value={styleFilter}
          onChange={setStyleFilter}
        />
      </div>

      {/* Auto-assign option */}
      <button
        onClick={() => onSelect(null)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
          selectedVoice === null
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        style={{ minHeight: '44px' }}
      >
        Auto-assign voice
      </button>

      {/* Voice list */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredVoices.map(voice => {
          const isSelected = selectedVoice === voice.name
          const isPreviewing = previewVoice === voice.name
          return (
            <div
              key={voice.name}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <button
                onClick={() => onSelect(voice.name)}
                className="flex-1 text-left cursor-pointer"
                style={{ minHeight: '36px' }}
              >
                <span className={isSelected ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                  {voice.name}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {voice.gender} · {voice.age} · {voice.style}
                </span>
              </button>
              <button
                onClick={() => handlePreview(voice)}
                className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                aria-label={`Preview ${voice.name}`}
              >
                {isPreviewing ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          )
        })}
        {filteredVoices.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No voices match filters</p>
        )}
      </div>
    </div>
  )
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400 mr-1">{label}:</span>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
            value === opt
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/characters/voice-picker.tsx
git commit -m "feat(story-studio): extract VoicePicker component for reuse"
```

---

### Task 8: Create CharacterForm component

**Files:**
- Create: `tools/story-studio/characters/character-form.tsx`

- [ ] **Step 1: Create the form component**

```tsx
'use client'

import { useState } from 'react'
import { VoicePicker } from '@/tools/story-studio/characters/voice-picker'
import type { CreateCharacterInput, UpdateCharacterInput } from '@/tools/story-studio/use-characters'

interface CharacterFormProps {
  /** If provided, form is in edit mode */
  initial?: {
    name: string
    age: string | null
    role: string | null
    personality: string | null
    physicalDescription: string | null
    voice: string | null
  }
  onSubmit: (data: CreateCharacterInput | UpdateCharacterInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CharacterForm({ initial, onSubmit, onCancel, loading }: CharacterFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [age, setAge] = useState(initial?.age ?? '')
  const [role, setRole] = useState<string>(initial?.role ?? '')
  const [personality, setPersonality] = useState(initial?.personality ?? '')
  const [physicalDescription, setPhysicalDescription] = useState(initial?.physicalDescription ?? '')
  const [voice, setVoice] = useState<string | null>(initial?.voice ?? null)
  const [showVoicePicker, setShowVoicePicker] = useState(false)

  const isEdit = !!initial

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      name,
      age: age || undefined,
      role: (role as 'protagonist' | 'antagonist' | 'supporting') || undefined,
      personality: personality || undefined,
      physicalDescription: physicalDescription || undefined,
      voice: voice ?? undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {isEdit ? 'Edit Character' : 'New Character'}
      </h3>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Character name"
        />
      </div>

      {/* Age + Role (inline) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
          <input
            type="text"
            value={age}
            onChange={e => setAge(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 8 years old"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select role</option>
            <option value="protagonist">Protagonist</option>
            <option value="antagonist">Antagonist</option>
            <option value="supporting">Supporting</option>
          </select>
        </div>
      </div>

      {/* Personality */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Personality</label>
        <textarea
          value={personality}
          onChange={e => setPersonality(e.target.value)}
          maxLength={2000}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Brave, curious, always looking for adventure..."
        />
      </div>

      {/* Physical Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Description</label>
        <textarea
          value={physicalDescription}
          onChange={e => setPhysicalDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="A young girl with curly red hair, freckles, and bright green eyes..."
        />
      </div>

      {/* Voice */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice</label>
          <button
            type="button"
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer"
          >
            {showVoicePicker ? 'Hide picker' : voice ? 'Change' : 'Choose voice'}
          </button>
        </div>
        {voice && !showVoicePicker && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{voice}</p>
        )}
        {!voice && !showVoicePicker && (
          <p className="text-sm text-slate-400 italic">Auto-assign</p>
        )}
        {showVoicePicker && (
          <VoicePicker selectedVoice={voice} onSelect={setVoice} characterName={name} />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          {loading ? 'Saving...' : isEdit ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/characters/character-form.tsx
git commit -m "feat(story-studio): add CharacterForm component"
```

---

## Chunk 3: Characters Tab Page

### Task 9: Create CharacterList component

**Files:**
- Create: `tools/story-studio/characters/character-list.tsx`

- [ ] **Step 1: Create the character list component**

This component renders the "My Characters" grid with character cards showing portrait, name, role, status badge, and series tags.

```tsx
'use client'

import { useState } from 'react'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface CharacterListProps {
  characters: CharacterItem[]
  loading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export function CharacterList({ characters, loading, onSelect, onDelete, onCreate }: CharacterListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Characters</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white
            bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Character
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <p className="text-sm">No characters yet. Create your first character to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map(char => (
            <div
              key={char.id}
              className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800
                overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelect(char.id)}
            >
              {/* Portrait */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {char.referenceImageUrl ? (
                  <img
                    src={char.referenceImageUrl}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">{char.name}</h3>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    char.status === 'approved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {char.status === 'approved' ? 'Approved' : 'Draft'}
                  </span>
                </div>
                {char.role && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize">{char.role}</p>
                )}
              </div>

              {/* Delete button (hidden until hover) */}
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(char.id) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={`Delete ${char.name}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Character?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This will permanently delete the character and remove it from all series. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 rounded-lg
                  hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null) }}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/characters/character-list.tsx
git commit -m "feat(story-studio): add CharacterList grid component"
```

---

### Task 10: Create SeriesSection component

**Files:**
- Create: `tools/story-studio/characters/series-section.tsx`

- [ ] **Step 1: Create the series section component**

This is a collapsible section at the bottom of the Characters tab. Each series card expands to show its linked characters. Uses the existing `useSeriesList` hook.

```tsx
'use client'

import { useState } from 'react'
import { useSeriesList } from '@/tools/story-studio/use-series'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface SeriesSectionProps {
  characters: CharacterItem[]
  onSelectCharacter: (id: string) => void
  onCreateSeries: () => void
}

export function SeriesSection({ characters, onSelectCharacter, onCreateSeries }: SeriesSectionProps) {
  const { series, loading, deleteSeries } = useSeriesList()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Series</h2>
        <button
          onClick={onCreateSeries}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400
            hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Series
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : series.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
          No series yet. Create a series to group characters together.
        </p>
      ) : (
        <div className="space-y-2">
          {series.map(s => {
            const isExpanded = expandedId === s.id
            // Find characters linked to this series
            const linkedChars = characters.filter(c => c.seriesIds?.includes(s.id))

            return (
              <div key={s.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Series header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer
                    hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  <div>
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">{s.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {linkedChars.length} character{linkedChars.length !== 1 ? 's' : ''}
                      {s.bookCount > 0 && ` · ${s.bookCount} book${s.bookCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {linkedChars.length >= 6 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        {linkedChars.length}/6+
                      </span>
                    )}
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>

                {/* Expanded: linked characters */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {s.description && (
                      <p className="text-xs text-slate-400 mb-2">{s.description}</p>
                    )}
                    {linkedChars.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No characters linked. Select a character and add it to this series.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {linkedChars.map(char => (
                          <button
                            key={char.id}
                            onClick={() => onSelectCharacter(char.id)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800
                              hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-sm"
                          >
                            {char.referenceImageUrl ? (
                              <img src={char.referenceImageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">{char.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Series actions */}
                    <div className="flex justify-end mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
                        className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Delete Series
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete series confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Series?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This will delete the series. Characters will be unlinked but not deleted. Books will be unlinked.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => { await deleteSeries(deleteConfirm); setDeleteConfirm(null) }}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/characters/series-section.tsx
git commit -m "feat(story-studio): add SeriesSection collapsible component"
```

---

### Task 11: Implement Characters tab page

**Files:**
- Modify: `app/tools/story-studio/characters/page.tsx`

- [ ] **Step 1: Replace placeholder with full implementation**

Replace the entire content of `app/tools/story-studio/characters/page.tsx` with:

```tsx
'use client'

import { useState, useCallback } from 'react'
import { useCharacterList } from '@/tools/story-studio/use-characters'
import { CharacterList } from '@/tools/story-studio/characters/character-list'
import { CharacterForm } from '@/tools/story-studio/characters/character-form'
import { CharacterDetail } from '@/tools/story-studio/characters/character-detail'
import { SeriesSection } from '@/tools/story-studio/characters/series-section'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { CreateCharacterInput } from '@/tools/story-studio/use-characters'

type View = 'list' | 'create' | 'detail'

export default function CharactersPage() {
  const { user, loading: authLoading } = useAuth()
  const { characters, loading, createCharacter, deleteCharacter, refresh } = useCharacterList()
  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleCreate = useCallback(async (data: CreateCharacterInput) => {
    setFormLoading(true)
    try {
      const id = await createCharacter(data)
      setSelectedId(id)
      setView('detail')
    } finally {
      setFormLoading(false)
    }
  }, [createCharacter])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    setView('detail')
  }, [])

  const handleBack = useCallback(() => {
    setSelectedId(null)
    setView('list')
    refresh()
  }, [refresh])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to manage characters</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Create and manage your characters after signing in.</p>
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

  // Create form
  if (view === 'create') {
    return (
      <div className="max-w-lg mx-auto">
        <CharacterForm
          onSubmit={data => handleCreate(data as CreateCharacterInput)}
          onCancel={() => setView('list')}
          loading={formLoading}
        />
      </div>
    )
  }

  // Detail view
  if (view === 'detail' && selectedId) {
    return (
      <CharacterDetail
        characterId={selectedId}
        onBack={handleBack}
      />
    )
  }

  // List view (default)
  return (
    <div>
      <CharacterList
        characters={characters}
        loading={loading}
        onSelect={handleSelect}
        onDelete={deleteCharacter}
        onCreate={() => setView('create')}
      />

      <SeriesSection
        characters={characters}
        onSelectCharacter={handleSelect}
        onCreateSeries={() => {
          // Reuse existing series creation flow — navigate to old series page for now
          // Will be replaced with inline modal in future iteration
          window.location.href = '/tools/story-studio/series'
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "characters" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/characters/page.tsx
git commit -m "feat(story-studio): implement Characters tab with list, create, and series sections"
```

---

### Task 12: Create CharacterDetail component

**Files:**
- Create: `tools/story-studio/characters/character-detail.tsx`

- [ ] **Step 1: Create the detail component**

This component shows the character's portrait, info, refinement controls, series linking, and approval workflow.

```tsx
'use client'

import { useState } from 'react'
import { useCharacterDetail, type UpdateCharacterInput } from '@/tools/story-studio/use-characters'
import { useSeriesList } from '@/tools/story-studio/use-series'
import { CharacterForm } from '@/tools/story-studio/characters/character-form'

interface CharacterDetailProps {
  characterId: string
  onBack: () => void
}

export function CharacterDetail({ characterId, onBack }: CharacterDetailProps) {
  const {
    character, loading, refining,
    updateCharacter, refinePortrait, approveCharacter,
    linkToSeries, unlinkFromSeries,
  } = useCharacterDetail(characterId)

  const { series } = useSeriesList()

  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [linkingSeriesId, setLinkingSeriesId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (loading || !character) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  const maxRefinements = 3  // Matches design doc limit
  const canRefine = character.refinementCount < maxRefinements || !character.referenceImageUrl
  const canApprove = character.referenceImageUrl && character.status !== 'approved'
  const linkedSeriesIds = character.seriesIds ?? []
  const availableSeries = series.filter(s => !linkedSeriesIds.includes(s.id))

  if (editing) {
    return (
      <div className="max-w-lg mx-auto">
        <CharacterForm
          initial={{
            name: character.name,
            age: character.age,
            role: character.role,
            personality: character.personality,
            physicalDescription: character.physicalDescription,
            voice: character.voice,
          }}
          onSubmit={async (data) => {
            await updateCharacter(data as UpdateCharacterInput)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Back to characters"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{character.name}</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          character.status === 'approved'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
        }`}>
          {character.status === 'approved' ? 'Approved' : 'Draft'}
        </span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Portrait + refinement */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {character.referenceImageUrl ? (
              <img src={character.referenceImageUrl} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                </svg>
                <p className="text-sm mt-2">No portrait yet</p>
              </div>
            )}
          </div>

          {/* Refinement controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {character.referenceImageUrl ? `Refinements: ${character.refinementCount}/${maxRefinements}` : 'Generate first portrait (1 credit)'}
              </span>
            </div>

            {canRefine && (
              <>
                {character.referenceImageUrl && (
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Feedback for refinement (e.g., 'make the hair curlier')"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                      bg-white dark:bg-slate-800 text-sm resize-none
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                <button
                  onClick={async () => {
                    setError(null)
                    try {
                      await refinePortrait(character.physicalDescription || '', feedback || undefined)
                      setFeedback('')
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Refinement failed')
                    }
                  }}
                  disabled={refining || (!character.physicalDescription && !character.referenceImageUrl)}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                    disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  {refining
                    ? 'Generating...'
                    : character.referenceImageUrl
                      ? `Refine Portrait (free)`
                      : 'Generate Portrait (1 credit)'}
                </button>
              </>
            )}

            {canApprove && (
              <button
                onClick={async () => {
                  try { await approveCharacter() } catch { setError('Failed to approve') }
                }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700
                  rounded-lg transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Approve Character
              </button>
            )}
          </div>
        </div>

        {/* Right: Info + series */}
        <div className="space-y-4">
          {/* Info fields */}
          <div className="space-y-3">
            {character.role && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Role</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">{character.role}</p>
              </div>
            )}
            {character.age && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Age</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.age}</p>
              </div>
            )}
            {character.personality && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Personality</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.personality}</p>
              </div>
            )}
            {character.physicalDescription && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Physical Description</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.physicalDescription}</p>
              </div>
            )}
            {character.voice && (
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase">Voice</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{character.voice}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400
              hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Edit Details
          </button>

          {/* Series linking */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Series</h3>

            {linkedSeriesIds.length > 0 ? (
              <div className="space-y-1 mb-3">
                {series.filter(s => linkedSeriesIds.includes(s.id)).map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{s.title}</span>
                    <button
                      onClick={() => unlinkFromSeries(s.id)}
                      className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mb-3">Not in any series</p>
            )}

            {availableSeries.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={linkingSeriesId ?? ''}
                  onChange={e => setLinkingSeriesId(e.target.value || null)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Add to series...</option>
                  {availableSeries.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (!linkingSeriesId) return
                    await linkToSeries(linkingSeriesId)
                    setLinkingSeriesId(null)
                  }}
                  disabled={!linkingSeriesId}
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                    disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/characters/character-detail.tsx
git commit -m "feat(story-studio): add CharacterDetail component with portrait refinement and series linking"
```

---

### Task 13: End-to-end verification

- [ ] **Step 1: Run the dev server and verify**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev`

Verify:
1. Navigate to `/tools/story-studio/characters`
2. Auth gate shows for unauthenticated users
3. After sign in, "My Characters" section shows empty state
4. Click "New Character" → form appears with all fields
5. Create a character → redirected to detail view
6. Detail view shows character info, "Generate Portrait" button
7. Edit character → form pre-filled with existing data
8. "Series" section at bottom shows series list
9. Can link/unlink character to series
10. Back button returns to character list

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat(story-studio): complete Characters module with CRUD, refinement, and series linking"
```

---

## Prerequisites & Dependencies

- **Plan 1 RPCs required**: `get_user_characters`, `insert_character`, `delete_character`, `link_character_to_series`, `unlink_character_from_series` — all defined in Plan 1's migration 015. Note: `get_character` and `update_character` RPCs are NOT required — this plan uses direct Supabase queries with RLS instead, which avoids COALESCE field-clearing issues and removes a dependency.
- **Plan 2 layout required**: Characters tab route must exist at `app/tools/story-studio/characters/page.tsx` with `StudioShell` wrapper from layout.
- **Existing series APIs**: The `useSeriesList` hook and series API routes remain unchanged. Series creation still uses the existing `/api/v1/story/series` endpoint.
- **Character images**: Uploaded to R2 at `characters/{userId}/{characterId}.png` (different path from old `series/{seriesId}/characters/{characterId}.png`).

## Notes for Subsequent Plans

- **Plan 4 (Stories)**: Story editor will use `useCharacterList` to show characters available for the story, auto-detect characters from scene text
- **Plan 5 (Media)**: Illustrations tab will reference approved characters for portrait consistency; Narration tab will use character voice assignments
- **Migration from old series_characters**: Data migration in Plan 1 copies characters from `series_characters` → `characters` + `character_series`. Old series pages can be removed after Characters tab is verified working
