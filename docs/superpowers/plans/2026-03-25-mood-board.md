# Mood Board Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered mood board tool with freeform canvas, split-panel layout, hybrid generation (one-shot + iterative), cross-tool integration, and shareable links.

**Architecture:** Single-page split layout. Left panel for prompt/generation, right panel for freeform canvas with `react-draggable` + `react-resizable` elements. Gemini generates mood images in parallel, palette and font suggestions via text model. Board state stored as JSONB in Supabase, images in R2. Export via `html-to-image` + `jspdf` client-side.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Gemini REST API, Cloudflare R2, Supabase, react-draggable, react-resizable, html-to-image, jspdf, Tailwind CSS v4.

---

## File Structure

| File | Purpose |
|------|---------|
| `tools/mood-board/types.ts` | Types, element interfaces, board state, constants |
| `tools/mood-board/use-board.ts` | Custom hook: board state, auto-save, element CRUD |
| `tools/mood-board/prompt-panel.tsx` | Left panel: theme, generate, add more, cross-tool links |
| `tools/mood-board/board-canvas.tsx` | Freeform canvas with draggable/resizable elements |
| `tools/mood-board/board-element.tsx` | Individual element renderer (image, palette, swatch, font, text) |
| `tools/mood-board/board-toolbar.tsx` | Top bar: name, My Boards, Share, Download |
| `tools/mood-board/my-boards.tsx` | History: user's saved boards |
| `tools/mood-board/mood-board-studio.tsx` | Main orchestrator |
| `app/tools/mood-board/page.tsx` | Page route with metadata |
| `app/tools/mood-board/view/[id]/page.tsx` | Public shared board view |
| `app/api/v1/mood-board/generate/route.ts` | Initial generation (images + palette + fonts) |
| `app/api/v1/mood-board/add-more/route.ts` | Iterative generation (1 credit) |
| `app/api/v1/mood-board/save/route.ts` | Auto-save board state |
| `app/api/v1/mood-board/share/route.ts` | Create shareable snapshot |
| `app/api/v1/mood-board/history/route.ts` | Fetch user's boards |
| `app/api/v1/mood-board/[id]/route.ts` | Fetch single board (shared view) |
| `lib/mood-board/prompts.ts` | Prompt templates for Gemini |
| `lib/mood-board/gemini.ts` | Shared Gemini image helper (reuse pattern from font-generator) |
| `supabase/migrations/029_mood_boards.sql` | DB table + RLS |

---

### Task 1: Types, Constants & Prompt Builder

**Files:**
- Create: `tools/mood-board/types.ts`
- Create: `lib/mood-board/prompts.ts`
- Create: `lib/mood-board/gemini.ts`

**Dependencies:** Install canvas/export libraries:
```bash
pnpm add react-draggable react-resizable html-to-image jspdf
pnpm add -D @types/react-resizable
```

- [ ] **Step 1: Create types and constants**

```ts
// tools/mood-board/types.ts

export type ElementType = 'image' | 'palette' | 'swatch' | 'font' | 'text'

export interface ImageData {
  imageUrl: string
  alt: string
}

export interface PaletteData {
  colors: string[] // 5 hex colors
}

export interface SwatchData {
  color: string // hex
}

export interface FontData {
  fontFamily: string
  category: 'heading' | 'body'
  sampleText: string
}

export interface TextData {
  content: string
  fontSize: number
}

export type ElementData = ImageData | PaletteData | SwatchData | FontData | TextData

export interface BoardElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  data: ElementData
}

export interface Board {
  id: string | null
  title: string
  theme: string
  elements: BoardElement[]
  shared: boolean
  shareId: string | null
  createdAt: string | null
  updatedAt: string | null
}

export const DEFAULT_BOARD: Board = {
  id: null,
  title: 'Untitled Board',
  theme: '',
  elements: [],
  shared: false,
  shareId: null,
  createdAt: null,
  updatedAt: null,
}

export const MAX_ELEMENTS = 30

export const ELEMENT_DEFAULTS: Record<ElementType, { width: number; height: number }> = {
  image: { width: 200, height: 200 },
  palette: { width: 250, height: 60 },
  swatch: { width: 80, height: 80 },
  font: { width: 220, height: 80 },
  text: { width: 160, height: 100 },
}

export const FONT_SUGGESTIONS = [
  { heading: 'Playfair Display', body: 'Inter' },
  { heading: 'Bebas Neue', body: 'Nunito' },
  { heading: 'Merriweather', body: 'Poppins' },
  { heading: 'Montserrat', body: 'Lora' },
  { heading: 'Righteous', body: 'EB Garamond' },
]
```

- [ ] **Step 2: Create shared Gemini image helper**

```ts
// lib/mood-board/gemini.ts
const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const IMAGE_MODEL = 'gemini-3.1-flash-image-preview'
const TEXT_MODEL = 'gemini-2.5-flash'

export async function callGeminiImage(prompt: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`)
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) throw new Error('No parts in Gemini response')

  for (const part of parts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) return Buffer.from(imageData, 'base64')
  }

  throw new Error('No image in Gemini response')
}

export async function callGeminiText(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) throw new Error(`Gemini text API ${response.status}`)

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
```

- [ ] **Step 3: Create prompt builder**

```ts
// lib/mood-board/prompts.ts

export function buildMoodImagePrompt(theme: string, index: number): string {
  const variations = [
    'a close-up detail shot capturing texture and material',
    'a wide atmospheric scene capturing the overall mood',
    'a product or object that embodies this aesthetic',
    'a color-rich composition focusing on the palette',
    'an interior or environment that fits this vibe',
    'a pattern or surface texture that matches this style',
    'a lifestyle scene with people or activity',
    'a typography or signage detail in this aesthetic',
  ]
  const variation = variations[index % variations.length]

  return (
    `Generate a high-quality mood board reference image for the theme: "${theme}". ` +
    `This image should be ${variation}. ` +
    `Professional photography quality, visually cohesive with the theme, ` +
    `no text overlays or watermarks. Square format.`
  )
}

export function buildPalettePrompt(theme: string): string {
  return (
    `Suggest a 5-color palette for the theme: "${theme}". ` +
    `Return ONLY a JSON array of 5 hex color strings, no explanation. ` +
    `Example: ["#2D3436", "#636E72", "#DFE6E9", "#74B9FF", "#0984E3"]`
  )
}

export function buildAddMorePrompt(theme: string, userPrompt: string): string {
  return (
    `Generate a mood board reference image for the theme: "${theme}". ` +
    `Specific request: ${userPrompt}. ` +
    `Professional quality, visually cohesive, square format, no text overlays.`
  )
}
```

- [ ] **Step 4: Commit**

```bash
pnpm add react-draggable react-resizable html-to-image jspdf
pnpm add -D @types/react-resizable
git add tools/mood-board/types.ts lib/mood-board/prompts.ts lib/mood-board/gemini.ts package.json pnpm-lock.yaml
git commit -m "feat(mood-board): add types, constants, prompt builder, and Gemini helper"
```

---

### Task 2: Database Migration & API Routes

**Files:**
- Create: `supabase/migrations/029_mood_boards.sql`
- Create: `app/api/v1/mood-board/generate/route.ts`
- Create: `app/api/v1/mood-board/add-more/route.ts`
- Create: `app/api/v1/mood-board/save/route.ts`
- Create: `app/api/v1/mood-board/share/route.ts`
- Create: `app/api/v1/mood-board/history/route.ts`
- Create: `app/api/v1/mood-board/[id]/route.ts`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/029_mood_boards.sql
CREATE TABLE IF NOT EXISTS public.mood_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL DEFAULT 'Untitled Board',
  theme TEXT,
  elements JSONB NOT NULL DEFAULT '[]',
  shared BOOLEAN DEFAULT false,
  share_id UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mood_boards_user ON public.mood_boards (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_boards_share ON public.mood_boards (share_id) WHERE shared = true;

ALTER TABLE public.mood_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own boards" ON public.mood_boards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public read shared boards" ON public.mood_boards FOR SELECT TO anon, authenticated USING (shared = true);
CREATE POLICY "Users insert own boards" ON public.mood_boards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own boards" ON public.mood_boards FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON public.mood_boards TO anon, authenticated;
GRANT INSERT, UPDATE ON public.mood_boards TO authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run: `mcp__supabase__apply_migration` with project_id `wgrcfnumbozvtmhcavnm`, name `mood_boards`, and the SQL above.

- [ ] **Step 3: Create generate API route**

```ts
// app/api/v1/mood-board/generate/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { callGeminiImage, callGeminiText } from '@/lib/mood-board/gemini'
import { buildMoodImagePrompt, buildPalettePrompt } from '@/lib/mood-board/prompts'
import { FONT_SUGGESTIONS, ELEMENT_DEFAULTS } from '@/tools/mood-board/types'
import type { BoardElement } from '@/tools/mood-board/types'

export const maxDuration = 60

export async function POST(request: Request) {
  let body: { theme: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.theme?.trim() || body.theme.trim().length < 3) {
    return apiError('Theme must be at least 3 characters', 'VALIDATION_ERROR', 400)
  }

  const theme = body.theme.trim()
  const boardId = crypto.randomUUID()
  const elements: BoardElement[] = []

  console.log(`[mood-board] Generating board for theme: "${theme}"`)

  // Generate 8 images in parallel
  const imageResults = await Promise.allSettled(
    Array.from({ length: 8 }, (_, i) => i).map(async (index) => {
      const prompt = buildMoodImagePrompt(theme, index)
      const buffer = await callGeminiImage(prompt)
      const r2Path = `mood-board/${boardId}/img-${index}.png`
      const imageUrl = await uploadToR2(r2Path, buffer, 'image/png')
      return { imageUrl, index }
    }),
  )

  const images = imageResults
    .filter((r): r is PromiseFulfilledResult<{ imageUrl: string; index: number }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[mood-board] Images: ${images.length}/8 succeeded`)

  // Place images on canvas with organic layout
  images.forEach(({ imageUrl }, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    elements.push({
      id: `img-${crypto.randomUUID().slice(0, 8)}`,
      type: 'image',
      x: 40 + col * 220 + (Math.random() * 20 - 10),
      y: 20 + row * 220 + (Math.random() * 20 - 10),
      width: ELEMENT_DEFAULTS.image.width,
      height: ELEMENT_DEFAULTS.image.height,
      rotation: Math.random() * 6 - 3,
      data: { imageUrl, alt: `${theme} mood ${i + 1}` },
    })
  })

  // Generate color palette via text model
  try {
    const paletteResponse = await callGeminiText(buildPalettePrompt(theme))
    const colorMatch = paletteResponse.match(/\[[\s\S]*?\]/)
    if (colorMatch) {
      const colors: string[] = JSON.parse(colorMatch[0])
      if (colors.length >= 5) {
        elements.push({
          id: `pal-${crypto.randomUUID().slice(0, 8)}`,
          type: 'palette',
          x: 40 + (Math.random() * 20),
          y: 460 + (Math.random() * 20),
          width: ELEMENT_DEFAULTS.palette.width,
          height: ELEMENT_DEFAULTS.palette.height,
          rotation: Math.random() * 4 - 2,
          data: { colors: colors.slice(0, 5) },
        })
      }
    }
  } catch (err) {
    console.error('[mood-board] Palette generation failed:', err)
  }

  // Add font suggestions (deterministic based on theme length)
  const fontIndex = theme.length % FONT_SUGGESTIONS.length
  const fontPair = FONT_SUGGESTIONS[fontIndex]
  elements.push({
    id: `font-h-${crypto.randomUUID().slice(0, 8)}`,
    type: 'font',
    x: 300 + (Math.random() * 20),
    y: 460 + (Math.random() * 20),
    width: ELEMENT_DEFAULTS.font.width,
    height: ELEMENT_DEFAULTS.font.height,
    rotation: Math.random() * 4 - 2,
    data: { fontFamily: fontPair.heading, category: 'heading' as const, sampleText: theme },
  })
  elements.push({
    id: `font-b-${crypto.randomUUID().slice(0, 8)}`,
    type: 'font',
    x: 540 + (Math.random() * 20),
    y: 460 + (Math.random() * 20),
    width: ELEMENT_DEFAULTS.font.width,
    height: ELEMENT_DEFAULTS.font.height,
    rotation: Math.random() * 4 - 2,
    data: { fontFamily: fontPair.body, category: 'body' as const, sampleText: 'The quick brown fox jumps over the lazy dog' },
  })

  if (elements.length === 0) {
    return apiError('Board generation failed — no elements created', 'GENERATION_FAILED', 500)
  }

  return apiSuccess({ boardId, elements })
}
```

- [ ] **Step 4: Create add-more route (1 credit)**

```ts
// app/api/v1/mood-board/add-more/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { callGeminiImage } from '@/lib/mood-board/gemini'
import { buildAddMorePrompt } from '@/lib/mood-board/prompts'
import { ELEMENT_DEFAULTS } from '@/tools/mood-board/types'
import type { BoardElement } from '@/tools/mood-board/types'

export const maxDuration = 30

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { boardId: string; prompt: string; theme: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.prompt?.trim() || !body.boardId) {
    return apiError('prompt and boardId are required', 'VALIDATION_ERROR', 400)
  }

  // Deduct 1 credit
  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'mood-board',
    p_description: 'Mood board add more elements',
  })

  if (creditError) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  console.log(`[mood-board] Add more: "${body.prompt.trim()}"`)

  // Generate 3-4 images
  const count = body.prompt.toLowerCase().includes('font') ? 0 : Math.min(4, 3 + Math.floor(Math.random() * 2))
  const elements: BoardElement[] = []

  if (count > 0) {
    const results = await Promise.allSettled(
      Array.from({ length: count }, (_, i) => i).map(async (index) => {
        const prompt = buildAddMorePrompt(body.theme || '', body.prompt.trim())
        const buffer = await callGeminiImage(prompt)
        const r2Path = `mood-board/${body.boardId}/add-${Date.now()}-${index}.png`
        const imageUrl = await uploadToR2(r2Path, buffer, 'image/png')
        return imageUrl
      }),
    )

    results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .forEach((r, i) => {
        elements.push({
          id: `add-${crypto.randomUUID().slice(0, 8)}`,
          type: 'image',
          x: 100 + i * 230 + (Math.random() * 30 - 15),
          y: 100 + (Math.random() * 30 - 15),
          width: ELEMENT_DEFAULTS.image.width,
          height: ELEMENT_DEFAULTS.image.height,
          rotation: Math.random() * 6 - 3,
          data: { imageUrl: r.value, alt: body.prompt.trim() },
        })
      })
  }

  return apiSuccess({ elements })
}
```

- [ ] **Step 5: Create save, share, history, and board-by-id routes**

```ts
// app/api/v1/mood-board/save/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { boardId?: string; title: string; theme: string; elements: unknown[] }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()

  if (body.boardId) {
    // Update existing board
    const { error } = await supabase
      .from('mood_boards')
      .update({
        title: body.title,
        theme: body.theme,
        elements: body.elements,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.boardId)
      .eq('user_id', userId)

    if (error) {
      console.error('[mood-board/save] Update error:', error)
      return API_ERRORS.INTERNAL()
    }
    return apiSuccess({ boardId: body.boardId })
  }

  // Create new board
  const { data, error } = await supabase
    .from('mood_boards')
    .insert({
      user_id: userId,
      title: body.title || 'Untitled Board',
      theme: body.theme,
      elements: body.elements,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[mood-board/save] Insert error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ boardId: data.id }, 201)
}
```

```ts
// app/api/v1/mood-board/share/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { boardId: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.boardId) {
    return apiError('boardId is required', 'VALIDATION_ERROR', 400)
  }

  const shareId = crypto.randomUUID()
  const supabase = await createClient()

  const { error } = await supabase
    .from('mood_boards')
    .update({ shared: true, share_id: shareId })
    .eq('id', body.boardId)
    .eq('user_id', userId)

  if (error) {
    console.error('[mood-board/share] Error:', error)
    return API_ERRORS.INTERNAL()
  }

  const shareUrl = `/tools/mood-board/view/${shareId}`
  return apiSuccess({ shareId, shareUrl })
}
```

```ts
// app/api/v1/mood-board/history/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mood_boards')
    .select('id, title, theme, elements, shared, share_id, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('[mood-board/history] Error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data || [] })
}
```

```ts
// app/api/v1/mood-board/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError } from '@/lib/api/response'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mood_boards')
    .select('id, title, theme, elements, created_at')
    .eq('share_id', id)
    .eq('shared', true)
    .single()

  if (error || !data) {
    return apiError('Board not found', 'NOT_FOUND', 404)
  }

  return apiSuccess({ board: data })
}
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/029_mood_boards.sql app/api/v1/mood-board/
git commit -m "feat(mood-board): add database migration and all API routes"
```

---

### Task 3: Board State Hook

**Files:**
- Create: `tools/mood-board/use-board.ts`

- [ ] **Step 1: Create the use-board hook**

Custom hook managing board state, auto-save, and element CRUD operations.

```ts
// tools/mood-board/use-board.ts
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Board, BoardElement, ElementType, ElementData, DEFAULT_BOARD } from './types'
import { MAX_ELEMENTS, ELEMENT_DEFAULTS } from './types'

interface UseBoardReturn {
  board: Board
  saving: boolean
  generating: boolean
  addingMore: boolean
  error: string | null
  setBoard: (b: Board) => void
  generate: (theme: string) => Promise<void>
  addMore: (prompt: string) => Promise<void>
  addElement: (type: ElementType, data: ElementData) => void
  updateElement: (id: string, partial: Partial<BoardElement>) => void
  removeElement: (id: string) => void
  bringToFront: (id: string) => void
  save: () => Promise<void>
  share: () => Promise<string | null>
  loadBoard: (entry: any) => void
}

export function useBoard(): UseBoardReturn {
  const [board, setBoard] = useState<Board>({
    id: null,
    title: 'Untitled Board',
    theme: '',
    elements: [],
    shared: false,
    shareId: null,
    createdAt: null,
    updatedAt: null,
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [addingMore, setAddingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boardRef = useRef(board)
  boardRef.current = board

  // Auto-save (debounced 2s)
  useEffect(() => {
    if (!board.id || board.elements.length === 0) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/v1/mood-board/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: board.id,
          title: board.title,
          theme: board.theme,
          elements: board.elements,
        }),
      }).catch(() => {})
    }, 2000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [board.id, board.elements, board.title, board.theme])

  // Generate initial board
  const generate = useCallback(async (theme: string) => {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/mood-board/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Generation failed')
        return
      }

      setBoard((b) => ({
        ...b,
        theme,
        title: theme.slice(0, 40),
        elements: json.data?.elements || [],
      }))

      // Auto-save new board (fire-and-forget)
      fetch('/api/v1/mood-board/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: theme.slice(0, 40),
          theme,
          elements: json.data?.elements || [],
        }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.data?.boardId) {
            setBoard((b) => ({ ...b, id: json.data.boardId }))
          }
        })
        .catch(() => {})
    } catch {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
  }, [])

  // Add more elements (1 credit)
  const addMore = useCallback(async (prompt: string) => {
    if (boardRef.current.elements.length >= MAX_ELEMENTS) {
      setError(`Board is full (max ${MAX_ELEMENTS} elements). Remove some to add more.`)
      return
    }
    setAddingMore(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/mood-board/add-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: boardRef.current.id || 'temp',
          prompt,
          theme: boardRef.current.theme,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Add more failed')
        return
      }

      const newElements: BoardElement[] = json.data?.elements || []
      setBoard((b) => ({
        ...b,
        elements: [...b.elements, ...newElements].slice(0, MAX_ELEMENTS),
      }))
    } catch {
      setError('Network error')
    } finally {
      setAddingMore(false)
    }
  }, [])

  // Element CRUD
  const addElement = useCallback((type: ElementType, data: ElementData) => {
    setBoard((b) => {
      if (b.elements.length >= MAX_ELEMENTS) return b
      const defaults = ELEMENT_DEFAULTS[type]
      const el: BoardElement = {
        id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
        type,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: defaults.width,
        height: defaults.height,
        rotation: Math.random() * 4 - 2,
        data,
      }
      return { ...b, elements: [...b.elements, el] }
    })
  }, [])

  const updateElement = useCallback((id: string, partial: Partial<BoardElement>) => {
    setBoard((b) => ({
      ...b,
      elements: b.elements.map((el) => (el.id === id ? { ...el, ...partial } : el)),
    }))
  }, [])

  const removeElement = useCallback((id: string) => {
    setBoard((b) => ({ ...b, elements: b.elements.filter((el) => el.id !== id) }))
  }, [])

  const bringToFront = useCallback((id: string) => {
    setBoard((b) => {
      const el = b.elements.find((e) => e.id === id)
      if (!el) return b
      return { ...b, elements: [...b.elements.filter((e) => e.id !== id), el] }
    })
  }, [])

  // Manual save
  const save = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/mood-board/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: boardRef.current.id,
          title: boardRef.current.title,
          theme: boardRef.current.theme,
          elements: boardRef.current.elements,
        }),
      })
      const json = await res.json()
      if (json.data?.boardId && !boardRef.current.id) {
        setBoard((b) => ({ ...b, id: json.data.boardId }))
      }
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }, [])

  // Share
  const share = useCallback(async (): Promise<string | null> => {
    if (!boardRef.current.id) await save()
    if (!boardRef.current.id) return null

    try {
      const res = await fetch('/api/v1/mood-board/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: boardRef.current.id }),
      })
      const json = await res.json()
      if (json.data?.shareUrl) {
        setBoard((b) => ({ ...b, shared: true, shareId: json.data.shareId }))
        return json.data.shareUrl
      }
    } catch {
      // silent
    }
    return null
  }, [save])

  // Load from history
  const loadBoard = useCallback((entry: any) => {
    setBoard({
      id: entry.id,
      title: entry.title || 'Untitled',
      theme: entry.theme || '',
      elements: entry.elements || [],
      shared: entry.shared || false,
      shareId: entry.share_id || null,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    })
  }, [])

  return {
    board, saving, generating, addingMore, error,
    setBoard, generate, addMore, addElement, updateElement,
    removeElement, bringToFront, save, share, loadBoard,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/mood-board/use-board.ts
git commit -m "feat(mood-board): add board state hook with auto-save and element CRUD"
```

---

### Task 4: Board Element & Canvas

**Files:**
- Create: `tools/mood-board/board-element.tsx`
- Create: `tools/mood-board/board-canvas.tsx`

- [ ] **Step 1: Create board element renderer**

Individual element component that renders based on type. Wrapped with `react-draggable` and `react-resizable` by the parent canvas.

Props:
```ts
interface BoardElementProps {
  element: BoardElement
  selected: boolean
  onSelect: () => void
  onUpdate: (partial: Partial<BoardElement>) => void
  onRemove: () => void
}
```

Renders based on `element.type`:
- `image`: `<img>` with white border, rounded-lg, shadow
- `palette`: row of 5 colored circles with hex labels beneath
- `swatch`: single colored square with hex label
- `font`: font name in bold + sample text rendered in that Google Font (load dynamically)
- `text`: editable `<textarea>` on double-click, sticky-note styling (light yellow bg or dark card)

Selected state: `ring-2 ring-[#3D6AF2]` + delete button at top-right corner.

- [ ] **Step 2: Create board canvas**

The freeform canvas container that wraps each `BoardElement` with `Draggable` from `react-draggable` and `ResizableBox` from `react-resizable`.

Props:
```ts
interface BoardCanvasProps {
  elements: BoardElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, partial: Partial<BoardElement>) => void
  onRemove: (id: string) => void
  onBringToFront: (id: string) => void
}
```

- Container: `relative w-full min-h-[600px] bg-[#0d1117] rounded-xl overflow-hidden` with subtle dot grid background
- Each element wrapped in `<Draggable>` with `position={{ x: el.x, y: el.y }}` and `onStop` updating position
- Resizable elements wrapped in `<ResizableBox>` with `onResizeStop` updating dimensions
- Click canvas background to deselect
- Keyboard: Delete/Backspace removes selected element
- Element `style.transform` includes `rotate(${el.rotation}deg)`

Import `react-draggable` as: `import Draggable from 'react-draggable'`
Import `react-resizable` as: `import { ResizableBox } from 'react-resizable'`
Also import the react-resizable CSS: need to check if there's a CSS file to import or if styling is done manually.

- [ ] **Step 3: Commit**

```bash
git add tools/mood-board/board-element.tsx tools/mood-board/board-canvas.tsx
git commit -m "feat(mood-board): add board element renderer and freeform canvas"
```

---

### Task 5: Prompt Panel & Board Toolbar

**Files:**
- Create: `tools/mood-board/prompt-panel.tsx`
- Create: `tools/mood-board/board-toolbar.tsx`

- [ ] **Step 1: Create prompt panel**

Left sidebar panel for theme input, generation, add more, manual additions, and cross-tool links.

Props:
```ts
interface PromptPanelProps {
  theme: string
  generating: boolean
  addingMore: boolean
  elementCount: number
  maxElements: number
  hasElements: boolean
  paletteColors: string[]  // extracted from first palette element
  error: string | null
  onGenerate: (theme: string) => void
  onAddMore: (prompt: string) => void
  onAddText: () => void
  onAddSwatch: (color: string) => void
  onUploadImage: (file: File) => void
}
```

Sections:
1. Theme input + Generate button (gradient). Disabled during generation, shows spinner.
2. "Add more" section (visible after initial generation): textarea + "Add (1 credit)" button with credit badge.
3. Manual additions: "Add Text Note" button, color picker + "Add Swatch", "Upload Image" file input
4. Cross-tool links (visible when palette exists):
   - "Open in Color Palette →" link (encodes colors as hash)
   - "Open in Font Generator →" link
   - "Open in Logo Generator →" link
5. Element count: "N/30 elements"

Dark theme: `bg-[#090f16]` panel bg, `bg-[#131a23]` input bg, `#3D6AF2` primary.

- [ ] **Step 2: Create board toolbar**

Top bar with board name, actions.

Props:
```ts
interface BoardToolbarProps {
  title: string
  saving: boolean
  onTitleChange: (title: string) => void
  onShare: () => void
  onDownloadPng: () => void
  onDownloadPdf: () => void
  onShowHistory: () => void
}
```

Layout: flex row with:
- Editable title (inline input, click to edit)
- Saving indicator (subtle dot + "Saved" / "Saving...")
- "My Boards" button
- "Share" button (copies link to clipboard, shows toast)
- Download dropdown: PNG / PDF options

- [ ] **Step 3: Commit**

```bash
git add tools/mood-board/prompt-panel.tsx tools/mood-board/board-toolbar.tsx
git commit -m "feat(mood-board): add prompt panel and board toolbar"
```

---

### Task 6: My Boards History

**Files:**
- Create: `tools/mood-board/my-boards.tsx`

- [ ] **Step 1: Create my boards component**

Same pattern as `tools/font-generator/my-fonts.tsx` and `tools/music-studio/my-clips.tsx`.

Props:
```ts
interface MyBoardsProps {
  onLoadBoard: (entry: any) => void
  onBack: () => void
}
```

- Fetches from `/api/v1/mood-board/history`
- Loading / error / empty states
- Each entry card: first image element as thumbnail, title, theme, element count, date, shared badge
- Click loads board into editor
- Empty state: canvas icon + "No boards yet" + "Create your first mood board"

- [ ] **Step 2: Commit**

```bash
git add tools/mood-board/my-boards.tsx
git commit -m "feat(mood-board): add My Boards history"
```

---

### Task 7: Main Studio Orchestrator

**Files:**
- Create: `tools/mood-board/mood-board-studio.tsx`

- [ ] **Step 1: Create the main studio component**

'use client' default export that composes all sub-components using the `useBoard` hook.

State:
- `activeTab: 'studio' | 'boards'`
- `selectedElementId: string | null`
- `useBoard()` hook for all board state

Layout:
```
Desktop (md+):
  BoardToolbar (full width top)
  flex row:
    PromptPanel (w-80, shrink-0, overflow-y-auto, h-full)
    BoardCanvas (flex-1)

Mobile:
  BoardToolbar
  BoardCanvas (full width)
  Floating "+" FAB → opens PromptPanel as bottom sheet
```

Tab toggle: "Studio" / "My Boards" at top.

Export handlers:
- `handleDownloadPng`: use `html-to-image`'s `toPng()` on the canvas container ref, trigger download
- `handleDownloadPdf`: use `toPng()` then `jspdf` to create landscape PDF with the image
- `handleShare`: call `board.share()`, copy URL to clipboard, show toast

Wire all props from `useBoard` to child components. Extract palette colors from first palette element for cross-tool links.

Handle image upload: convert File to base64 via FileReader, upload to R2 via a small helper (or just use the base64 URL directly on canvas for v1 simplicity — actual persistence happens on auto-save since the image URLs are in the elements JSON). Actually, for uploaded images we should POST them to R2 first. Add a simple upload handler that calls a small fetch to save to R2 and returns the URL.

- [ ] **Step 2: Commit**

```bash
git add tools/mood-board/mood-board-studio.tsx
git commit -m "feat(mood-board): add main studio orchestrator"
```

---

### Task 8: Page Routes & Tool Registration

**Files:**
- Create: `app/tools/mood-board/page.tsx`
- Create: `app/tools/mood-board/view/[id]/page.tsx`
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`

- [ ] **Step 1: Create page route**

```tsx
// app/tools/mood-board/page.tsx
import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import MoodBoardStudio from '@/tools/mood-board/mood-board-studio'

export const metadata: Metadata = {
  title: 'Mood Board Studio — AI Visual Brainstorming | Toolk1t',
  description:
    'Create AI-powered mood boards with freeform canvas. Generate images, color palettes, and typography from a theme. Drag, arrange, and share your vision.',
}

export default function MoodBoardPage() {
  return (
    <main
      className="flex-1 flex flex-col bg-[#090f16] min-h-screen"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="px-4 pt-4">
        <ToolBreadcrumb toolName="Mood Board" toolSlug="mood-board" />
      </div>
      <div className="flex-1 flex flex-col">
        <MoodBoardStudio />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create shared board view page**

```tsx
// app/tools/mood-board/view/[id]/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Mood Board | Toolk1t',
  description: 'View a shared AI-generated mood board.',
}

async function fetchBoard(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'
  const res = await fetch(`${baseUrl}/api/v1/mood-board/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  return json.data?.board || null
}

export default async function SharedBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const board = await fetchBoard(id)

  if (!board) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#090f16] min-h-screen">
        <div className="text-center">
          <p className="text-white text-lg font-bold">Board not found</p>
          <p className="text-[#70767f] text-sm mt-1">This board may have been deleted or the link is invalid.</p>
        </div>
      </main>
    )
  }

  // Render read-only board view — images positioned absolutely based on elements JSON
  return (
    <main className="flex-1 flex flex-col items-center bg-[#090f16] min-h-screen p-4">
      <h1 className="text-white text-2xl font-bold mb-4">{board.title}</h1>
      <p className="text-[#70767f] text-sm mb-6">Theme: {board.theme}</p>
      <div className="relative w-full max-w-5xl min-h-[600px] bg-[#0d1117] rounded-xl overflow-hidden">
        {(board.elements as any[]).map((el: any) => {
          if (el.type === 'image' && el.data?.imageUrl) {
            return (
              <div
                key={el.id}
                className="absolute rounded-lg overflow-hidden border-2 border-white/10 shadow-lg"
                style={{
                  left: el.x, top: el.y,
                  width: el.width, height: el.height,
                  transform: `rotate(${el.rotation || 0}deg)`,
                }}
              >
                <img src={el.data.imageUrl} alt={el.data.alt || ''} className="w-full h-full object-cover" />
              </div>
            )
          }
          if (el.type === 'palette' && el.data?.colors) {
            return (
              <div
                key={el.id}
                className="absolute flex gap-2 items-center bg-[#131a23] rounded-xl px-3 py-2"
                style={{ left: el.x, top: el.y, transform: `rotate(${el.rotation || 0}deg)` }}
              >
                {el.data.colors.map((c: string, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-[9px] text-[#70767f]">{c}</span>
                  </div>
                ))}
              </div>
            )
          }
          if (el.type === 'font' && el.data?.fontFamily) {
            return (
              <div
                key={el.id}
                className="absolute bg-[#131a23] rounded-xl px-4 py-3"
                style={{ left: el.x, top: el.y, width: el.width, transform: `rotate(${el.rotation || 0}deg)` }}
              >
                <p className="text-[10px] text-[#70767f] mb-1">{el.data.category === 'heading' ? 'Heading' : 'Body'}</p>
                <p className="text-white text-sm font-medium">{el.data.fontFamily}</p>
                <p className="text-[#a6abb5] text-xs mt-1" style={{ fontFamily: el.data.fontFamily }}>{el.data.sampleText}</p>
              </div>
            )
          }
          if (el.type === 'text' && el.data?.content) {
            return (
              <div
                key={el.id}
                className="absolute bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2"
                style={{ left: el.x, top: el.y, width: el.width, transform: `rotate(${el.rotation || 0}deg)` }}
              >
                <p className="text-white text-sm">{el.data.content}</p>
              </div>
            )
          }
          return null
        })}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Add to tools list and bento showcase**

Add to `lib/tools.tsx`:
```ts
{
  name: 'Mood Board',
  href: '/tools/mood-board',
  description: 'AI-powered visual brainstorming canvas',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  color: 'from-teal-500 to-emerald-500',
}
```

Add to bento showcase:
```tsx
{
  name: 'Mood Board',
  description: 'AI visual brainstorming canvas',
  href: '/tools/mood-board',
  gridClass: '',
  glowClass: 'from-teal-500/10',
  preview: (
    <div className="w-full h-full flex items-center justify-center gap-2">
      {[1,2,3].map(i => (
        <div key={i} className="w-8 h-10 rounded-md border border-teal-500/30 bg-teal-500/5" style={{ transform: `rotate(${(i-2)*5}deg)` }} />
      ))}
    </div>
  ),
}
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add app/tools/mood-board/ lib/tools.tsx components/home/bento-showcase.tsx
git commit -m "feat(mood-board): add page routes and register tool"
```
