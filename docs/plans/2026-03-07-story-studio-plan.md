# Story Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI Story Studio tool that takes a user's storyline and generates a fully illustrated picture book with in-browser reader, PDF export, and image pack.

**Architecture:** Linear pipeline — 4-step wizard (Input → Story Review → Illustration Generation → Book Editor). Claude API for story enrichment, Flux/DALL-E for illustrations. Client state in localStorage via custom hook. API endpoints in toolk1t-client under `/api/v1/story/`. Images stored in Supabase Storage.

**Tech Stack:** Next.js 16, React 19, TypeScript, Claude API (@anthropic-ai/sdk), fal.ai (Flux), pdf-lib, Supabase Storage, Zod validation

---

## Task 1: Types & Data Model

**Files:**
- Create: `tools/story-studio/types.ts`

**Step 1: Create the shared types file**

```typescript
// tools/story-studio/types.ts

export type Audience = 'toddler' | 'early-reader' | 'middle-grade' | 'young-adult' | 'all-ages'
export type BookFormat = 'picture-book'
export type BookStatus = 'draft' | 'story-approved' | 'illustrating' | 'complete'
export type ImageStatus = 'pending' | 'generating' | 'done' | 'error'
export type StylePreset = 'watercolor' | 'cartoon' | 'anime' | 'realistic' | 'paper-craft' | 'custom'
export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting'
export type WizardStep = 'input' | 'story' | 'illustrations' | 'editor'

export interface Dialogue {
  speaker: string
  line: string
}

export interface Character {
  name: string
  role: CharacterRole
  description: string
  age?: string
}

export interface Page {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue?: Dialogue[]
  mood: string
  imagePrompt: string
  imageUrl?: string
  imageStatus: ImageStatus
}

export interface BookStyle {
  preset: StylePreset
  customPrompt?: string
}

export interface StoryBook {
  id: string
  title: string
  audience: Audience
  format: BookFormat
  style: BookStyle
  theme: string
  setting: string
  characters: Character[]
  pages: Page[]
  status: BookStatus
  createdAt: string
  updatedAt: string
}

export interface StoryInput {
  title?: string
  plot: string
  audience: Audience
  format: BookFormat
  pageCount: number
  style: BookStyle
}

export const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'toddler', label: 'Toddler (2-4)' },
  { value: 'early-reader', label: 'Early Reader (5-7)' },
  { value: 'middle-grade', label: 'Middle Grade (8-12)' },
  { value: 'young-adult', label: 'Young Adult' },
  { value: 'all-ages', label: 'All Ages' },
]

export const STYLE_PRESETS: { value: StylePreset; label: string; description: string }[] = [
  { value: 'watercolor', label: 'Watercolor', description: 'Soft, flowing watercolor painting style' },
  { value: 'cartoon', label: 'Cartoon', description: 'Bold lines, bright colors, playful' },
  { value: 'anime', label: 'Anime', description: 'Japanese anime illustration style' },
  { value: 'realistic', label: 'Realistic', description: 'Photorealistic digital art' },
  { value: 'paper-craft', label: 'Paper Craft', description: 'Cut paper collage look' },
  { value: 'custom', label: 'Custom', description: 'Describe your own style' },
]

export const PAGE_COUNTS = [8, 10, 12, 16] as const

export const CREDIT_COSTS = {
  enrich: 20,
  illustrate: 5,
  regenerateStory: 10,
  regenerateImage: 5,
  exportPdf: 5,
} as const
```

**Step 2: Commit**

```bash
git add tools/story-studio/types.ts
git commit -m "feat(story-studio): add types and data model"
```

---

## Task 2: Story Book State Hook

**Files:**
- Create: `tools/story-studio/use-story-book.ts`

**Step 1: Create the state management hook**

This hook manages the entire StoryBook lifecycle — creation, editing, localStorage persistence, and wizard step tracking.

```typescript
// tools/story-studio/use-story-book.ts
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryBook, StoryInput, WizardStep, Page } from './types'

const STORAGE_KEY = 'toolk1t-story-studio'

function generateId(): string {
  return `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function loadFromStorage(): StoryBook | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveToStorage(book: StoryBook | null) {
  try {
    if (book) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage full — silently fail
  }
}

export function useStoryBook() {
  const [book, setBook] = useState<StoryBook | null>(null)
  const [step, setStep] = useState<WizardStep>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage()
    if (saved) {
      setBook(saved)
      // Restore wizard step based on book status
      if (saved.status === 'complete') setStep('editor')
      else if (saved.status === 'illustrating') setStep('illustrations')
      else if (saved.status === 'story-approved') setStep('illustrations')
      else setStep('story')
    }
  }, [])

  // Auto-save on changes
  useEffect(() => {
    saveToStorage(book)
  }, [book])

  const updateBook = useCallback((updates: Partial<StoryBook>) => {
    setBook(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null)
  }, [])

  const updatePage = useCallback((sequence: number, updates: Partial<Page>) => {
    setBook(prev => {
      if (!prev) return null
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        pages: prev.pages.map(p =>
          p.sequence === sequence ? { ...p, ...updates } : p
        ),
      }
    })
  }, [])

  const createBook = useCallback((input: StoryInput): StoryBook => {
    const now = new Date().toISOString()
    const newBook: StoryBook = {
      id: generateId(),
      title: input.title || '',
      audience: input.audience,
      format: input.format,
      style: input.style,
      theme: '',
      setting: '',
      characters: [],
      pages: [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }
    setBook(newBook)
    return newBook
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setBook(null)
    setStep('input')
    setLoading(false)
    setError(null)
    saveToStorage(null)
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  return {
    book,
    step,
    setStep,
    loading,
    setLoading,
    error,
    setError,
    abortRef,
    createBook,
    updateBook,
    updatePage,
    reset,
    abort,
  }
}
```

**Step 2: Commit**

```bash
git add tools/story-studio/use-story-book.ts
git commit -m "feat(story-studio): add useStoryBook state management hook"
```

---

## Task 3: API — Zod Schemas & Validation

**Files:**
- Create: `lib/story/types.ts`
- Create: `lib/story/validation.ts`

**Step 1: Create server-side Zod schemas**

```typescript
// lib/story/types.ts
import { z } from 'zod'

export const audienceSchema = z.enum(['toddler', 'early-reader', 'middle-grade', 'young-adult', 'all-ages'])
export const stylePresetSchema = z.enum(['watercolor', 'cartoon', 'anime', 'realistic', 'paper-craft', 'custom'])

export const enrichRequestSchema = z.object({
  plot: z.string().min(20, 'Plot must be at least 20 characters').max(2000),
  title: z.string().max(200).optional(),
  audience: audienceSchema,
  pageCount: z.number().int().min(8).max(16),
  style: z.object({
    preset: stylePresetSchema,
    customPrompt: z.string().max(500).optional(),
  }),
})

export const illustrateRequestSchema = z.object({
  imagePrompt: z.string().min(10).max(2000),
  style: z.object({
    preset: stylePresetSchema,
    customPrompt: z.string().max(500).optional(),
  }),
  characters: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
})

export const regenerateStoryRequestSchema = z.object({
  book: z.object({
    title: z.string(),
    audience: audienceSchema,
    theme: z.string(),
    setting: z.string(),
    characters: z.array(z.object({
      name: z.string(),
      role: z.enum(['protagonist', 'antagonist', 'supporting']),
      description: z.string(),
      age: z.string().optional(),
    })),
    pages: z.array(z.object({
      sequence: z.number(),
      sceneDescription: z.string(),
      narrativeText: z.string(),
      dialogue: z.array(z.object({
        speaker: z.string(),
        line: z.string(),
      })).optional(),
      mood: z.string(),
    })),
    style: z.object({
      preset: stylePresetSchema,
      customPrompt: z.string().max(500).optional(),
    }),
  }),
  pageCount: z.number().int().min(8).max(16),
})

export const exportPdfRequestSchema = z.object({
  title: z.string(),
  pages: z.array(z.object({
    sequence: z.number(),
    narrativeText: z.string(),
    dialogue: z.array(z.object({
      speaker: z.string(),
      line: z.string(),
    })).optional(),
    imageUrl: z.string().url(),
  })),
})

export type EnrichRequest = z.infer<typeof enrichRequestSchema>
export type IllustrateRequest = z.infer<typeof illustrateRequestSchema>
export type RegenerateStoryRequest = z.infer<typeof regenerateStoryRequestSchema>
export type ExportPdfRequest = z.infer<typeof exportPdfRequestSchema>
```

**Step 2: Create validation helpers**

```typescript
// lib/story/validation.ts
export class StoryValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoryValidationError'
  }
}

export const CREDIT_COSTS = {
  enrich: 20,
  illustrate: 5,
  regenerateStory: 10,
  regenerateImage: 5,
  exportPdf: 5,
} as const
```

**Step 3: Commit**

```bash
git add lib/story/types.ts lib/story/validation.ts
git commit -m "feat(story-studio): add API Zod schemas and validation"
```

---

## Task 4: API — Story Enrichment Endpoint

**Files:**
- Create: `app/api/v1/story/enrich/route.ts`
- Create: `lib/story/enrich.ts`

**Step 1: Create the enrichment logic**

```typescript
// lib/story/enrich.ts
import Anthropic from '@anthropic-ai/sdk'
import type { EnrichRequest } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const STYLE_DESCRIPTIONS: Record<string, string> = {
  watercolor: 'soft watercolor painting with flowing colors and gentle textures',
  cartoon: 'bold cartoon style with thick outlines and bright saturated colors',
  anime: 'Japanese anime illustration with expressive eyes and dynamic poses',
  realistic: 'photorealistic digital art with detailed textures and lighting',
  'paper-craft': 'paper cut-out collage style with layered textures and shadows',
}

function buildSystemPrompt(input: EnrichRequest): string {
  const styleDesc = input.style.customPrompt || STYLE_DESCRIPTIONS[input.style.preset] || input.style.preset

  return `You are a professional children's book author and illustrator. Given a story plot, create a complete ${input.pageCount}-page picture book for a ${input.audience} audience.

You MUST respond with valid JSON matching this exact structure:
{
  "title": "string — the book title",
  "theme": "string — one-sentence theme",
  "setting": "string — where/when the story takes place",
  "characters": [
    {
      "name": "string",
      "role": "protagonist" | "antagonist" | "supporting",
      "description": "string — detailed physical appearance (hair color, eye color, clothing, distinguishing features) and personality traits. Be very specific for illustration consistency.",
      "age": "string — approximate age"
    }
  ],
  "pages": [
    {
      "sequence": 1,
      "sceneDescription": "string — detailed visual scene description for the illustrator. Include setting, character positions, actions, lighting, and atmosphere.",
      "narrativeText": "string — the text that appears on this page of the book. Age-appropriate language.",
      "dialogue": [
        { "speaker": "character name", "line": "what they say" }
      ],
      "mood": "string — emotional tone (e.g., joyful, tense, peaceful, excited, mysterious)",
      "imagePrompt": "string — a detailed image generation prompt. Include: art style (${styleDesc}), scene description, character appearances, mood, lighting. Do NOT include text in the image."
    }
  ]
}

Rules:
- Exactly ${input.pageCount} pages
- First page is the opening scene, last page is the resolution
- Each page should advance the story
- Keep dialogue age-appropriate for ${input.audience}
- Image prompts must describe the visual scene completely — an artist who hasn't read the story should be able to illustrate it from the prompt alone
- Include full character physical descriptions in every image prompt for consistency
- Every imagePrompt must start with the art style description
- Do not include any text, words, or letters in image prompts — illustrations only`
}

export async function enrichStory(input: EnrichRequest) {
  const systemPrompt = buildSystemPrompt(input)
  const userMessage = input.title
    ? `Title: ${input.title}\n\nStory plot:\n${input.plot}`
    : `Story plot:\n${input.plot}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Parse JSON from response — handle markdown code blocks
  let jsonText = textBlock.text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(jsonText)
  return parsed
}
```

**Step 2: Create the API route**

```typescript
// app/api/v1/story/enrich/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { enrichRequestSchema } from '@/lib/story/types'
import { enrichStory } from '@/lib/story/enrich'
import { CREDIT_COSTS } from '@/lib/story/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return API_ERRORS.UNAUTHORIZED()
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = enrichRequestSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  // Deduct credits
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.enrich,
    p_description: 'Story Studio — story enrichment',
  })

  if (deductError) {
    return API_ERRORS.FORBIDDEN()
  }

  try {
    const enrichedStory = await enrichStory(parsed.data)
    return apiSuccess(enrichedStory)
  } catch (err) {
    console.error('story/enrich: AI call failed', err)

    // Refund credits on failure
    await supabase.rpc('refund_credits', {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.enrich,
      p_description: 'Story Studio — enrichment failed (refund)',
    }).catch(() => {})

    return API_ERRORS.INTERNAL()
  }
}
```

**Step 3: Install Anthropic SDK**

```bash
pnpm add @anthropic-ai/sdk
```

**Step 4: Commit**

```bash
git add lib/story/enrich.ts app/api/v1/story/enrich/route.ts package.json pnpm-lock.yaml
git commit -m "feat(story-studio): add story enrichment API endpoint"
```

---

## Task 5: API — Illustration Generation Endpoint

**Files:**
- Create: `lib/story/illustrate.ts`
- Create: `app/api/v1/story/illustrate/route.ts`

**Step 1: Create the illustration logic**

Use fal.ai for Flux image generation. If fal.ai is not available, fall back to OpenAI DALL-E 3.

```typescript
// lib/story/illustrate.ts
import { createClient } from '@/lib/supabase/server'

const FAL_API_KEY = process.env.FAL_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface IllustrateInput {
  imagePrompt: string
  style: { preset: string; customPrompt?: string }
  characters?: { name: string; description: string }[]
}

async function generateWithFal(prompt: string): Promise<ArrayBuffer> {
  const response = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`fal.ai error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const imageUrl = data.images?.[0]?.url
  if (!imageUrl) throw new Error('No image returned from fal.ai')

  // Download the image
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to download generated image')
  return await imageResponse.arrayBuffer()
}

async function generateWithDalle(prompt: string): Promise<ArrayBuffer> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DALL-E error: ${response.status} ${err}`)
  }

  const data = await response.json()
  const imageUrl = data.data?.[0]?.url
  if (!imageUrl) throw new Error('No image returned from DALL-E')

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to download generated image')
  return await imageResponse.arrayBuffer()
}

export async function generateIllustration(input: IllustrateInput): Promise<string> {
  // Build full prompt with character descriptions
  let prompt = input.imagePrompt
  if (input.characters?.length) {
    const charDescs = input.characters.map(c => `${c.name}: ${c.description}`).join('. ')
    prompt += `\n\nCharacter descriptions for consistency: ${charDescs}`
  }
  prompt += '\n\nIMPORTANT: Do not include any text, words, letters, or writing in the image. Illustration only.'

  // Generate image
  const imageBuffer = FAL_API_KEY
    ? await generateWithFal(prompt)
    : await generateWithDalle(prompt)

  // Upload to Supabase Storage
  const supabase = await createClient()
  const filename = `illustrations/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`

  const { error: uploadError } = await supabase.storage
    .from('story-assets')
    .upload(filename, imageBuffer, {
      contentType: 'image/png',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('story-assets')
    .getPublicUrl(filename)

  return urlData.publicUrl
}
```

**Step 2: Create the API route**

```typescript
// app/api/v1/story/illustrate/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { illustrateRequestSchema } from '@/lib/story/types'
import { generateIllustration } from '@/lib/story/illustrate'
import { CREDIT_COSTS } from '@/lib/story/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return API_ERRORS.UNAUTHORIZED()
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = illustrateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  // Deduct credits
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.illustrate,
    p_description: 'Story Studio — illustration generation',
  })

  if (deductError) {
    return API_ERRORS.FORBIDDEN()
  }

  try {
    const imageUrl = await generateIllustration(parsed.data)
    return apiSuccess({ imageUrl })
  } catch (err) {
    console.error('story/illustrate: generation failed', err)

    await supabase.rpc('refund_credits', {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.illustrate,
      p_description: 'Story Studio — illustration failed (refund)',
    }).catch(() => {})

    return API_ERRORS.INTERNAL()
  }
}
```

**Step 3: Commit**

```bash
git add lib/story/illustrate.ts app/api/v1/story/illustrate/route.ts
git commit -m "feat(story-studio): add illustration generation API endpoint"
```

---

## Task 6: API — Regenerate Story & Image Endpoints

**Files:**
- Create: `app/api/v1/story/regenerate-story/route.ts`
- Create: `app/api/v1/story/regenerate-image/route.ts`

**Step 1: Regenerate story endpoint**

```typescript
// app/api/v1/story/regenerate-story/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { regenerateStoryRequestSchema } from '@/lib/story/types'
import { CREDIT_COSTS } from '@/lib/story/validation'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = regenerateStoryRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.regenerateStory,
    p_description: 'Story Studio — story regeneration',
  })
  if (deductError) return API_ERRORS.FORBIDDEN()

  try {
    const { book, pageCount } = parsed.data
    const styleDesc = book.style.customPrompt || book.style.preset

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `You are a professional children's book author. The user has an existing story that they've edited. Regenerate the story incorporating their changes while maintaining consistency. Keep the same characters and setting unless explicitly changed. Respond with the same JSON structure as the original. Art style: ${styleDesc}. Exactly ${pageCount} pages. Every imagePrompt must start with the art style and include full character physical descriptions. Do not include text/words in image prompts.`,
      messages: [{
        role: 'user',
        content: `Here is the current story state. Please regenerate it with improvements while keeping the user's edits:\n\n${JSON.stringify(book, null, 2)}`,
      }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') throw new Error('No response')

    let jsonText = textBlock.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    return apiSuccess(JSON.parse(jsonText))
  } catch (err) {
    console.error('story/regenerate-story: failed', err)
    await supabase.rpc('refund_credits', {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.regenerateStory,
      p_description: 'Story Studio — regeneration failed (refund)',
    }).catch(() => {})
    return API_ERRORS.INTERNAL()
  }
}
```

**Step 2: Regenerate image endpoint** (reuses illustrate logic)

```typescript
// app/api/v1/story/regenerate-image/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { illustrateRequestSchema } from '@/lib/story/types'
import { generateIllustration } from '@/lib/story/illustrate'
import { CREDIT_COSTS } from '@/lib/story/validation'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = illustrateRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.regenerateImage,
    p_description: 'Story Studio — image regeneration',
  })
  if (deductError) return API_ERRORS.FORBIDDEN()

  try {
    const imageUrl = await generateIllustration(parsed.data)
    return apiSuccess({ imageUrl })
  } catch (err) {
    console.error('story/regenerate-image: failed', err)
    await supabase.rpc('refund_credits', {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.regenerateImage,
      p_description: 'Story Studio — image regen failed (refund)',
    }).catch(() => {})
    return API_ERRORS.INTERNAL()
  }
}
```

**Step 3: Commit**

```bash
git add app/api/v1/story/regenerate-story/route.ts app/api/v1/story/regenerate-image/route.ts
git commit -m "feat(story-studio): add regenerate story and image API endpoints"
```

---

## Task 7: API — PDF Export Endpoint

**Files:**
- Create: `lib/story/export-pdf.ts`
- Create: `app/api/v1/story/export-pdf/route.ts`

**Step 1: Create PDF generation logic**

```typescript
// lib/story/export-pdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { ExportPdfRequest } from './types'

export async function generateBookPdf(input: ExportPdfRequest): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  const PAGE_WIDTH = 842  // A4 landscape width
  const PAGE_HEIGHT = 595 // A4 landscape height
  const MARGIN = 40

  // Cover page
  const cover = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const titleSize = 36
  const titleWidth = boldFont.widthOfTextAtSize(input.title, titleSize)
  cover.drawText(input.title, {
    x: (PAGE_WIDTH - titleWidth) / 2,
    y: PAGE_HEIGHT / 2,
    size: titleSize,
    font: boldFont,
    color: rgb(0.15, 0.15, 0.15),
  })

  // Content pages
  for (const pageData of input.pages) {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

    // Embed illustration
    try {
      const imgResponse = await fetch(pageData.imageUrl)
      const imgBytes = new Uint8Array(await imgResponse.arrayBuffer())

      let image
      if (pageData.imageUrl.includes('.png')) {
        image = await doc.embedPng(imgBytes)
      } else {
        image = await doc.embedJpg(imgBytes)
      }

      const imgWidth = PAGE_WIDTH - MARGIN * 2
      const imgHeight = (PAGE_HEIGHT - MARGIN * 2) * 0.6
      const scale = Math.min(imgWidth / image.width, imgHeight / image.height)

      page.drawImage(image, {
        x: MARGIN,
        y: PAGE_HEIGHT - MARGIN - image.height * scale,
        width: image.width * scale,
        height: image.height * scale,
      })
    } catch {
      // Image failed to load — skip
    }

    // Narrative text
    const textY = PAGE_HEIGHT * 0.3
    const lines = wrapText(pageData.narrativeText, font, 14, PAGE_WIDTH - MARGIN * 2)
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: MARGIN,
        y: textY - i * 20,
        size: 14,
        font,
        color: rgb(0.2, 0.2, 0.2),
      })
    })

    // Dialogue
    if (pageData.dialogue?.length) {
      const dialogueY = textY - lines.length * 20 - 20
      pageData.dialogue.forEach((d, i) => {
        const text = `${d.speaker}: "${d.line}"`
        page.drawText(text, {
          x: MARGIN + 20,
          y: dialogueY - i * 18,
          size: 12,
          font,
          color: rgb(0.3, 0.3, 0.5),
        })
      })
    }
  }

  return doc.save()
}

function wrapText(text: string, font: typeof StandardFonts, size: number, maxWidth: number): string[] {
  // Simple word-wrap implementation
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    // Approximate width — 0.5 * size per character
    if (test.length * size * 0.5 > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}
```

**Step 2: Create the API route**

```typescript
// app/api/v1/story/export-pdf/route.ts
import { createClient } from '@/lib/supabase/server'
import { API_ERRORS } from '@/lib/api/response'
import { exportPdfRequestSchema } from '@/lib/story/types'
import { generateBookPdf } from '@/lib/story/export-pdf'
import { CREDIT_COSTS } from '@/lib/story/validation'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }

  const parsed = exportPdfRequestSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: CREDIT_COSTS.exportPdf,
    p_description: 'Story Studio — PDF export',
  })
  if (deductError) return API_ERRORS.FORBIDDEN()

  try {
    const pdfBytes = await generateBookPdf(parsed.data)
    const filename = `${parsed.data.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch (err) {
    console.error('story/export-pdf: failed', err)
    await supabase.rpc('refund_credits', {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.exportPdf,
      p_description: 'Story Studio — PDF export failed (refund)',
    }).catch(() => {})
    return API_ERRORS.INTERNAL()
  }
}
```

**Step 3: Commit**

```bash
git add lib/story/export-pdf.ts app/api/v1/story/export-pdf/route.ts
git commit -m "feat(story-studio): add PDF export API endpoint"
```

---

## Task 8: Supabase Storage Bucket Setup

**Step 1: Create the storage bucket via Supabase dashboard or migration**

Run this SQL in the Supabase SQL editor or add as a migration:

```sql
-- Create the story-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-assets', 'story-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload story assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-assets');

-- Allow public read access
CREATE POLICY "Public read access for story assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-assets');
```

**Step 2: Commit migration if using migration file**

```bash
git add supabase/migrations/
git commit -m "feat(story-studio): add Supabase storage bucket for story assets"
```

---

## Task 9: Client — Step 1 Story Input Form

**Files:**
- Create: `tools/story-studio/story-input-form.tsx`
- Create: `tools/story-studio/style-picker.tsx`

**Step 1: Create the style picker component**

```typescript
// tools/story-studio/style-picker.tsx
'use client'

import { STYLE_PRESETS, type StylePreset, type BookStyle } from './types'

interface StylePickerProps {
  value: BookStyle
  onChange: (style: BookStyle) => void
}

export function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Illustration Style
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange({ preset: preset.value, customPrompt: preset.value === 'custom' ? value.customPrompt : undefined })}
            className={`p-3 rounded-xl border-2 text-left transition-colors cursor-pointer ${
              value.preset === preset.value
                ? 'border-[#3D6AF2] bg-[#3D6AF2]/5 dark:bg-[#3D6AF2]/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{preset.label}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{preset.description}</p>
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <textarea
          value={value.customPrompt || ''}
          onChange={(e) => onChange({ ...value, customPrompt: e.target.value })}
          placeholder="Describe your illustration style (e.g., 'retro 1950s comic book with halftone dots')"
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-none h-20 focus:border-[#3D6AF2] focus:outline-none"
          maxLength={500}
        />
      )}
    </div>
  )
}
```

**Step 2: Create the story input form**

```typescript
// tools/story-studio/story-input-form.tsx
'use client'

import { useState } from 'react'
import { StylePicker } from './style-picker'
import { AUDIENCES, PAGE_COUNTS, CREDIT_COSTS, type StoryInput, type Audience, type BookStyle } from './types'

interface StoryInputFormProps {
  onSubmit: (input: StoryInput) => void
  loading: boolean
  creditBalance: number | null
}

export function StoryInputForm({ onSubmit, loading, creditBalance }: StoryInputFormProps) {
  const [title, setTitle] = useState('')
  const [plot, setPlot] = useState('')
  const [audience, setAudience] = useState<Audience>('all-ages')
  const [pageCount, setPageCount] = useState(10)
  const [style, setStyle] = useState<BookStyle>({ preset: 'watercolor' })

  const totalCost = CREDIT_COSTS.enrich + pageCount * CREDIT_COSTS.illustrate + CREDIT_COSTS.exportPdf
  const canAfford = creditBalance === null || creditBalance >= CREDIT_COSTS.enrich
  const plotValid = plot.trim().length >= 20

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!plotValid || loading) return
    onSubmit({ title: title.trim() || undefined, plot: plot.trim(), audience, format: 'picture-book', pageCount, style })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Title <span className="text-slate-400">(optional — AI will generate one)</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Amazing Story"
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#3D6AF2] focus:outline-none"
          maxLength={200}
        />
      </div>

      {/* Plot */}
      <div>
        <label htmlFor="plot" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Storyline / Main Plot <span className="text-red-400">*</span>
        </label>
        <textarea
          id="plot"
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
          placeholder="Tell us your story idea... A curious little fox discovers a hidden garden behind the old library where books come to life at night..."
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-none h-32 focus:border-[#3D6AF2] focus:outline-none"
          maxLength={2000}
          required
        />
        <p className="text-xs text-slate-400 mt-1">{plot.length}/2000 characters (min 20)</p>
      </div>

      {/* Audience */}
      <div>
        <label htmlFor="audience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Target Audience
        </label>
        <select
          id="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value as Audience)}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#3D6AF2] focus:outline-none cursor-pointer"
        >
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Page Count */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Pages
        </label>
        <div className="flex gap-2">
          {PAGE_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setPageCount(count)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                pageCount === count
                  ? 'bg-[#3D6AF2] text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
              style={{ minHeight: '44px' }}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <StylePicker value={style} onChange={setStyle} />

      {/* Cost & Submit */}
      <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Estimated total cost</span>
          <span className="font-bold text-slate-900 dark:text-white">{totalCost} credits</span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Story: {CREDIT_COSTS.enrich} + Illustrations: {pageCount} x {CREDIT_COSTS.illustrate} + Export: {CREDIT_COSTS.exportPdf}
        </div>
        <button
          type="submit"
          disabled={!plotValid || loading || !canAfford}
          className="w-full py-3 rounded-xl bg-[#3D6AF2] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-default"
          style={{ minHeight: '44px' }}
        >
          {loading ? 'Generating Story...' : `Generate Story (${CREDIT_COSTS.enrich} credits)`}
        </button>
        {!canAfford && (
          <p className="text-xs text-red-400 text-center">Insufficient credits. Purchase more in Billing.</p>
        )}
      </div>
    </form>
  )
}
```

**Step 3: Commit**

```bash
git add tools/story-studio/story-input-form.tsx tools/story-studio/style-picker.tsx
git commit -m "feat(story-studio): add Step 1 story input form and style picker"
```

---

## Task 10: Client — Step 2 Story Review

**Files:**
- Create: `tools/story-studio/story-review.tsx`
- Create: `tools/story-studio/character-card.tsx`
- Create: `tools/story-studio/page-card.tsx`

**Step 1:** Create `character-card.tsx` — editable character display with name, role, description, age fields. Each field is a contentEditable span or input that calls `onChange` with the updated character.

**Step 2:** Create `page-card.tsx` — displays a single page's sequence number, scene description, narrative text, dialogue list, and mood tag. All fields are editable. Dialogue entries can be added/removed.

**Step 3:** Create `story-review.tsx` — renders the full enriched story: title (editable), theme, setting, character list (using `CharacterCard`), and page list (using `PageCard`). Has "Regenerate Story" and "Approve & Generate Illustrations" buttons with credit costs shown.

**Step 4: Commit**

```bash
git add tools/story-studio/story-review.tsx tools/story-studio/character-card.tsx tools/story-studio/page-card.tsx
git commit -m "feat(story-studio): add Step 2 story review components"
```

---

## Task 11: Client — Step 3 Illustration Grid

**Files:**
- Create: `tools/story-studio/illustration-grid.tsx`
- Create: `tools/story-studio/illustration-card.tsx`

**Step 1:** Create `illustration-card.tsx` — shows a single page with its image status (pending spinner, generating progress, done with image preview, error with retry). Has "Regenerate" button and "Edit Prompt" expandable field.

**Step 2:** Create `illustration-grid.tsx` — renders a responsive grid of `IllustrationCard` components. Manages sequential generation — calls `/api/v1/story/illustrate` for each page one at a time. Shows overall progress (e.g., "3 of 10 pages"). Has "Approve & Build Book" button that enables when all pages are done.

**Step 3: Commit**

```bash
git add tools/story-studio/illustration-grid.tsx tools/story-studio/illustration-card.tsx
git commit -m "feat(story-studio): add Step 3 illustration generation grid"
```

---

## Task 12: Client — Step 4 Book Reader & Editor

**Files:**
- Create: `tools/story-studio/book-reader.tsx`
- Create: `tools/story-studio/book-editor.tsx`
- Create: `tools/story-studio/export-panel.tsx`

**Step 1:** Create `book-reader.tsx` — flip-through book reader. Shows one spread at a time (illustration on left, text on right). Previous/Next page buttons. Page indicator (3 of 10). Keyboard navigation (arrow keys). CSS page-turn transition.

**Step 2:** Create `book-editor.tsx` — wraps `BookReader` with an edit mode toggle. In edit mode, clicking a page opens inline editing for text/dialogue. Drag handle on pages for reorder. Delete page button. "Add Page" button. "Regenerate Illustration" per page.

**Step 3:** Create `export-panel.tsx` — sidebar/bottom panel with: Download PDF button (calls `/api/v1/story/export-pdf`), Download Image Pack (creates ZIP client-side using JSZip from all imageUrls), credit cost displayed next to each action.

**Step 4: Commit**

```bash
git add tools/story-studio/book-reader.tsx tools/story-studio/book-editor.tsx tools/story-studio/export-panel.tsx
git commit -m "feat(story-studio): add Step 4 book reader, editor, and export panel"
```

---

## Task 13: Client — Wizard Progress Bar

**Files:**
- Create: `tools/story-studio/wizard-progress.tsx`

**Step 1:** Create `wizard-progress.tsx` — horizontal progress bar showing 4 steps: Input, Story, Illustrations, Book. Active step is highlighted with brand color. Completed steps show a checkmark. Clickable to navigate back (but not forward past current progress). Mobile: compact with icons only.

**Step 2: Commit**

```bash
git add tools/story-studio/wizard-progress.tsx
git commit -m "feat(story-studio): add wizard progress bar"
```

---

## Task 14: Client — Page Route & Wizard Assembly

**Files:**
- Create: `app/tools/story-studio/page.tsx`

**Step 1:** Create the page route that assembles all components into the wizard flow:

```typescript
// app/tools/story-studio/page.tsx
'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { WizardProgress } from '@/tools/story-studio/wizard-progress'
import { StoryInputForm } from '@/tools/story-studio/story-input-form'
import { StoryReview } from '@/tools/story-studio/story-review'
import { IllustrationGrid } from '@/tools/story-studio/illustration-grid'
import { BookEditor } from '@/tools/story-studio/book-editor'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import type { StoryInput } from '@/tools/story-studio/types'

export default function StoryStudioPage() {
  const { user, loading: authLoading } = useAuth()
  const { balance } = useCredits()
  const {
    book, step, setStep,
    loading, setLoading,
    error, setError,
    abortRef, createBook, updateBook, updatePage, reset,
  } = useStoryBook()

  const handleGenerateStory = useCallback(async (input: StoryInput) => {
    setLoading(true)
    setError(null)

    const newBook = createBook(input)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/v1/story/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || `Failed: ${res.status}`)
      }

      const { data } = await res.json()

      updateBook({
        ...data,
        id: newBook.id,
        audience: input.audience,
        format: input.format,
        style: input.style,
        status: 'draft',
        pages: (data.pages || []).map((p: Record<string, unknown>, i: number) => ({
          ...p,
          sequence: i + 1,
          imageStatus: 'pending' as const,
        })),
      })
      setStep('story')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Story generation failed')
    } finally {
      setLoading(false)
    }
  }, [createBook, updateBook, setStep, setLoading, setError, abortRef])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in Required</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Sign in to create AI-illustrated story books.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <ToolBreadcrumb toolName="Story Studio" />

        <div className="mt-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Story Studio
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Turn your story idea into a fully illustrated picture book
          </p>
        </div>

        <WizardProgress currentStep={step} onStepClick={setStep} bookStatus={book?.status} />

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
          </div>
        )}

        <div className="mt-6">
          {step === 'input' && (
            <StoryInputForm
              onSubmit={handleGenerateStory}
              loading={loading}
              creditBalance={balance?.total ?? null}
            />
          )}

          {step === 'story' && book && (
            <StoryReview
              book={book}
              onUpdateBook={updateBook}
              onApprove={() => {
                updateBook({ status: 'story-approved' })
                setStep('illustrations')
              }}
              onRegenerate={async () => { /* call regenerate-story endpoint */ }}
              onBack={() => setStep('input')}
              loading={loading}
            />
          )}

          {step === 'illustrations' && book && (
            <IllustrationGrid
              book={book}
              onUpdatePage={updatePage}
              onComplete={() => {
                updateBook({ status: 'complete' })
                setStep('editor')
              }}
              onBack={() => setStep('story')}
            />
          )}

          {step === 'editor' && book && (
            <BookEditor
              book={book}
              onUpdateBook={updateBook}
              onUpdatePage={updatePage}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/tools/story-studio/page.tsx
git commit -m "feat(story-studio): add page route with wizard assembly"
```

---

## Task 15: Register Tool & Final Integration

**Files:**
- Modify: `lib/tools.tsx`

**Step 1:** Add Story Studio to the tools array in `lib/tools.tsx`:

```typescript
{
  name: 'Story Studio',
  href: '/tools/story-studio',
  description: 'Create AI-illustrated picture books from your story ideas',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  color: 'from-purple-500 to-pink-400',
},
```

**Step 2:** Add env variables to `.env.example` and `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
FAL_API_KEY=...          # fal.ai for Flux image generation
OPENAI_API_KEY=sk-...    # fallback for DALL-E 3
```

**Step 3:** Verify build passes

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add lib/tools.tsx
git commit -m "feat(story-studio): register tool in homepage grid"
```

---

## Task 16: End-to-End Testing

**Step 1:** Start the dev server and run through the full wizard flow manually:
- Fill in story input → Generate Story → Review & edit → Generate Illustrations → Read book → Export PDF
- Test regenerate story, regenerate illustration
- Test mobile viewport
- Verify credits are deducted correctly
- Verify error handling (stop server, test with invalid input)

**Step 2:** Take screenshots for documentation

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(story-studio): complete Story Studio tool"
git push origin main
```

---

## Environment Variables Required

| Variable | Purpose | Where to get |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API for story enrichment | console.anthropic.com |
| `FAL_API_KEY` | Flux image generation via fal.ai | fal.ai dashboard |
| `OPENAI_API_KEY` | DALL-E 3 fallback (optional) | platform.openai.com |

## Supabase Setup Required

1. Create `story-assets` storage bucket (Task 8)
2. Ensure `deduct_credits` and `refund_credits` RPCs exist (already in DB)
