# Font Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered custom font/typography generator with a 5-step wizard: Describe → Preview (8 chars) → Full Set (36 chars) → Refine → Download.

**Architecture:** 5-step wizard component mirroring Logo Generator. Gemini `gemini-3.1-flash-image-preview` generates individual character images. Preview phase generates 8 sample characters; full generation completes 36 (A-Z + 0-9). Characters stored in R2, generations persisted to Supabase `font_generations` table. SVG pack download gated by 1 credit.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Gemini REST API, Cloudflare R2, Supabase (Postgres + RLS), Tailwind CSS v4.

---

## File Structure

| File | Purpose |
|------|---------|
| `tools/font-generator/types.ts` | Types, style presets, character set, defaults |
| `tools/font-generator/font-wizard.tsx` | Main wizard orchestrator with Create/My Fonts tabs |
| `tools/font-generator/describe-step.tsx` | Step 1: style presets + prompt + colors + reference image |
| `tools/font-generator/preview-step.tsx` | Step 2: 8-letter preview grid |
| `tools/font-generator/alphabet-grid.tsx` | Step 3: full 36-char generation grid |
| `tools/font-generator/refine-step.tsx` | Step 4: click-to-regenerate individual letters |
| `tools/font-generator/download-step.tsx` | Step 5: download options (PNG free, SVG 1 credit) |
| `tools/font-generator/my-fonts.tsx` | History tab showing past generations |
| `lib/font-generator/prompts.ts` | Prompt templates for Gemini |
| `lib/font-generator/gemini.ts` | Shared Gemini image generation helper (DRY — used by all 3 API routes) |
| `app/tools/font-generator/page.tsx` | Page route with metadata |
| `app/api/v1/font-generator/preview/route.ts` | Generate 8 preview characters |
| `app/api/v1/font-generator/generate/route.ts` | Generate full 36-character set |
| `app/api/v1/font-generator/regenerate/route.ts` | Regenerate single character |
| `app/api/v1/font-generator/download-svg/route.ts` | SVG conversion + ZIP (1 credit) |
| `app/api/v1/font-generator/history/route.ts` | Save/fetch user's font history |
| `supabase/migrations/027_font_generations.sql` | DB table + RLS |

---

### Task 1: Types, Constants & Prompt Builder

**Files:**
- Create: `tools/font-generator/types.ts`
- Create: `lib/font-generator/prompts.ts`

- [ ] **Step 1: Create types and constants**

```ts
// tools/font-generator/types.ts
export type FontStyle =
  | 'neon'
  | 'hand-drawn'
  | 'retro-pixel'
  | 'watercolor'
  | '3d-bubble'
  | 'gothic'
  | 'graffiti'
  | 'minimalist'

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface FontCharacter {
  char: string
  imageUrl: string
  svgUrl?: string | null
}

export interface FontProject {
  stylePreset: FontStyle | null
  customPrompt: string
  colors: string[]
  colorMode: 'ai-suggested' | 'custom'
  referenceImageBase64: string | null
  projectId: string | null
  characters: FontCharacter[]
  step: WizardStep
  loading: boolean
  error: string | null
}

export const PREVIEW_CHARS = ['A', 'B', 'G', 'R', 'a', 'g', '1', '&']

export const FULL_CHARS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ...'0123456789'.split(''),
]

export const FONT_STYLES: {
  id: FontStyle
  name: string
  description: string
  gradient: string
}[] = [
  { id: 'neon', name: 'Neon', description: 'Glowing neon tube letters with vibrant glow effects', gradient: 'from-pink-500 to-blue-500' },
  { id: 'hand-drawn', name: 'Hand-drawn', description: 'Sketchy, imperfect, organic ink feel', gradient: 'from-amber-600 to-orange-400' },
  { id: 'retro-pixel', name: 'Retro Pixel', description: '8-bit pixel art style, blocky and game-like', gradient: 'from-green-500 to-emerald-400' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft paint bleeds with translucent pastel layers', gradient: 'from-sky-400 to-indigo-300' },
  { id: '3d-bubble', name: '3D Bubble', description: 'Inflated, rounded, glossy 3D with shiny highlights', gradient: 'from-fuchsia-500 to-pink-400' },
  { id: 'gothic', name: 'Gothic', description: 'Blackletter, ornate, medieval decorative style', gradient: 'from-slate-700 to-slate-500' },
  { id: 'graffiti', name: 'Graffiti', description: 'Street art, spray paint, bold urban style', gradient: 'from-red-500 to-yellow-400' },
  { id: 'minimalist', name: 'Minimalist', description: 'Thin geometric strokes, monoline, ultra-clean', gradient: 'from-gray-500 to-gray-300' },
]

export const FONT_COLOR_PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Neon Nights', colors: ['#FF00FF', '#00FFFF', '#FF1493', '#7B68EE', '#000000'] },
  { name: 'Earth Tones', colors: ['#8B4513', '#D2691E', '#F4A460', '#DEB887', '#2F1B14'] },
  { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'] },
  { name: 'Sunset', colors: ['#FF6B6B', '#FF8E53', '#FFC300', '#FF5733', '#C70039'] },
  { name: 'Monochrome', colors: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF'] },
  { name: 'Pastel', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'] },
]

export const DEFAULT_FONT_PROJECT: FontProject = {
  stylePreset: null,
  customPrompt: '',
  colors: FONT_COLOR_PALETTES[0].colors,
  colorMode: 'palette',
  referenceImageBase64: null,
  projectId: null,
  characters: [],
  step: 1,
  loading: false,
  error: null,
}
```

- [ ] **Step 2: Create shared Gemini image helper (DRY)**

```ts
// lib/font-generator/gemini.ts
const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

export async function callGeminiImage(prompt: string, referenceBase64?: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
    { text: prompt },
  ]
  if (referenceBase64) {
    parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } })
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`)
  }

  const data = await response.json()
  const resParts = data.candidates?.[0]?.content?.parts
  if (!resParts) throw new Error('No parts in Gemini response')

  for (const part of resParts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) return Buffer.from(imageData, 'base64')
  }

  throw new Error('No image in Gemini response')
}
```

- [ ] **Step 3: Create prompt builder**

```ts
// lib/font-generator/prompts.ts
import type { FontStyle } from '@/tools/font-generator/types'

const STYLE_DESCRIPTIONS: Record<FontStyle, string> = {
  'neon': 'a brightly glowing neon tube sign letter, vivid neon light with subtle glow and reflections on a dark background',
  'hand-drawn': 'a hand-drawn ink sketch letter with organic imperfections, visible pen strokes, and a natural handmade feel on white paper',
  'retro-pixel': 'an 8-bit pixel art letter with clean blocky pixels, retro video game aesthetic, sharp edges, on a white background',
  'watercolor': 'a watercolor painted letter with soft translucent paint bleeds, visible brush texture, and gentle pastel gradients on white paper',
  '3d-bubble': 'a glossy inflated 3D bubble letter with shiny highlights, rounded puffy form, and a subtle drop shadow on a white background',
  'gothic': 'an ornate blackletter gothic letter with decorative serifs, medieval manuscript style, intricate details on a white background',
  'graffiti': 'a bold graffiti street art letter with spray paint texture, drips, vibrant colors, urban wildstyle on a white background',
  'minimalist': 'an ultra-clean minimalist geometric letter with thin precise monoline strokes, balanced whitespace, on a white background',
}

export function buildCharPrompt(
  char: string,
  style: FontStyle,
  colors: string[],
  customPrompt?: string,
  hasReference?: boolean,
): string {
  const styleDesc = STYLE_DESCRIPTIONS[style]
  const colorList = colors.length > 0 ? `Color palette: ${colors.join(', ')}. ` : ''
  const customClause = customPrompt?.trim()
    ? `Additional creative direction: ${customPrompt.trim()}. `
    : ''
  const referenceClause = hasReference
    ? 'Match the visual style and texture of the provided reference image. '
    : ''

  return (
    `Generate a single letter "${char}" rendered as ${styleDesc}. ` +
    `${colorList}` +
    `${referenceClause}` +
    `${customClause}` +
    `The letter must be centered on a pure white square background, clean crisp rendering, high quality. ` +
    `Do NOT include any other text, labels, or decoration — ONLY the single letter "${char}" itself.`
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/font-generator/types.ts lib/font-generator/prompts.ts lib/font-generator/gemini.ts
git commit -m "feat(font-generator): add types, constants, prompt builder, and shared Gemini helper"
```

---

### Task 2: Database Migration & History API

**Files:**
- Create: `supabase/migrations/027_font_generations.sql`
- Create: `app/api/v1/font-generator/history/route.ts`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/027_font_generations.sql
CREATE TABLE IF NOT EXISTS public.font_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  style_preset TEXT,
  custom_prompt TEXT,
  colors TEXT[] NOT NULL DEFAULT '{}',
  reference_url TEXT,
  characters JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_font_generations_user ON public.font_generations (user_id, created_at DESC);

ALTER TABLE public.font_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own fonts" ON public.font_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own fonts" ON public.font_generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own fonts" ON public.font_generations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.font_generations TO authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run: `mcp__supabase__apply_migration` with project_id `wgrcfnumbozvtmhcavnm`, name `font_generations`, and the SQL above.

- [ ] **Step 3: Create history API route**

```ts
// app/api/v1/font-generator/history/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    stylePreset: string
    customPrompt?: string
    colors: string[]
    referenceUrl?: string
    characters: { char: string; imageUrl: string; svgUrl?: string | null }[]
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.characters?.length) {
    return apiError('characters are required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('font_generations')
    .insert({
      user_id: userId,
      style_preset: body.stylePreset || null,
      custom_prompt: body.customPrompt?.trim() || null,
      colors: body.colors || [],
      reference_url: body.referenceUrl || null,
      characters: body.characters,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[font-generator/history] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data.id }, 201)
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('font_generations')
    .select('id, style_preset, custom_prompt, colors, reference_url, characters, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[font-generator/history] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data || [] })
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/027_font_generations.sql app/api/v1/font-generator/history/route.ts
git commit -m "feat(font-generator): add database migration and history API"
```

---

### Task 3: Preview & Generate API Routes

**Files:**
- Create: `app/api/v1/font-generator/preview/route.ts`
- Create: `app/api/v1/font-generator/generate/route.ts`
- Create: `app/api/v1/font-generator/regenerate/route.ts`

**Note:** All 3 routes import `callGeminiImage` from `lib/font-generator/gemini.ts` (created in Task 1). No duplication.

- [ ] **Step 1: Create preview route (8 characters)**

```ts
// app/api/v1/font-generator/preview/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { buildCharPrompt } from '@/lib/font-generator/prompts'
import { callGeminiImage } from '@/lib/font-generator/gemini'
import { PREVIEW_CHARS } from '@/tools/font-generator/types'
import type { FontStyle } from '@/tools/font-generator/types'

export const maxDuration = 30

export async function POST(request: Request) {
  let body: {
    stylePreset: string
    customPrompt?: string
    colors?: string[]
    referenceImageBase64?: string
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.stylePreset?.trim()) {
    return apiError('stylePreset is required', 'VALIDATION_ERROR', 400)
  }

  const projectId = crypto.randomUUID()
  const style = body.stylePreset as FontStyle

  console.log(`[font-generator] Generating ${PREVIEW_CHARS.length} preview characters...`)

  const results = await Promise.allSettled(
    PREVIEW_CHARS.map(async (char) => {
      const prompt = buildCharPrompt(char, style, body.colors || [], body.customPrompt, !!body.referenceImageBase64)
      const imageBuffer = await callGeminiImage(prompt, body.referenceImageBase64)
      const r2Path = `font-generator/${projectId}/${char}.png`
      const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
      return { char, imageUrl }
    }),
  )

  const characters = results
    .filter((r): r is PromiseFulfilledResult<{ char: string; imageUrl: string }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[font-generator] Preview: ${characters.length}/${PREVIEW_CHARS.length} succeeded`)

  if (characters.length === 0) {
    const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined
    const msg = firstError?.reason instanceof Error ? firstError.reason.message : 'All generations failed'
    return apiError(`Preview failed: ${msg}`, 'GENERATION_FAILED', 500)
  }

  return apiSuccess({ projectId, characters })
}
```

- [ ] **Step 2: Create full generate route (remaining characters)**

```ts
// app/api/v1/font-generator/generate/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { buildCharPrompt } from '@/lib/font-generator/prompts'
import { callGeminiImage } from '@/lib/font-generator/gemini'
import { FULL_CHARS } from '@/tools/font-generator/types'
import type { FontStyle } from '@/tools/font-generator/types'

export const maxDuration = 60

export async function POST(request: Request) {
  let body: {
    projectId: string
    stylePreset: string
    customPrompt?: string
    colors?: string[]
    referenceImageBase64?: string
    existingChars?: string[]
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.projectId?.trim() || !body.stylePreset?.trim()) {
    return apiError('projectId and stylePreset are required', 'VALIDATION_ERROR', 400)
  }

  const style = body.stylePreset as FontStyle
  const existing = new Set(body.existingChars || [])
  const remaining = FULL_CHARS.filter((c) => !existing.has(c))

  console.log(`[font-generator] Generating ${remaining.length} remaining characters...`)

  const results = await Promise.allSettled(
    remaining.map(async (char) => {
      const prompt = buildCharPrompt(char, style, body.colors || [], body.customPrompt, !!body.referenceImageBase64)
      const imageBuffer = await callGeminiImage(prompt, body.referenceImageBase64)
      const r2Path = `font-generator/${body.projectId}/${char}.png`
      const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
      return { char, imageUrl }
    }),
  )

  const characters = results
    .filter((r): r is PromiseFulfilledResult<{ char: string; imageUrl: string }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[font-generator] Full set: ${characters.length}/${remaining.length} succeeded`)

  return apiSuccess({ characters })
}
```

- [ ] **Step 3: Create regenerate route (single character)**

```ts
// app/api/v1/font-generator/regenerate/route.ts
import { apiSuccess, apiError } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'
import { buildCharPrompt } from '@/lib/font-generator/prompts'
import { callGeminiImage } from '@/lib/font-generator/gemini'
import type { FontStyle } from '@/tools/font-generator/types'

export const maxDuration = 15

export async function POST(request: Request) {
  let body: {
    projectId: string
    char: string
    stylePreset: string
    customPrompt?: string
    colors?: string[]
    referenceImageBase64?: string
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.projectId?.trim() || !body.char?.trim() || !body.stylePreset?.trim()) {
    return apiError('projectId, char, and stylePreset are required', 'VALIDATION_ERROR', 400)
  }

  const style = body.stylePreset as FontStyle
  const prompt = buildCharPrompt(body.char, style, body.colors || [], body.customPrompt, !!body.referenceImageBase64)

  try {
    const imageBuffer = await callGeminiImage(prompt, body.referenceImageBase64)
    const r2Path = `font-generator/${body.projectId}/${body.char}.png`
    const imageUrl = await uploadToR2(r2Path, imageBuffer, 'image/png')
    return apiSuccess({ char: body.char, imageUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return apiError(msg, 'GENERATION_FAILED', 500)
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/font-generator/preview/route.ts app/api/v1/font-generator/generate/route.ts app/api/v1/font-generator/regenerate/route.ts
git commit -m "feat(font-generator): add preview, generate, and regenerate API routes"
```

---

### Task 4: SVG Download API Route

**Files:**
- Create: `app/api/v1/font-generator/download-svg/route.ts`

- [ ] **Step 1: Create SVG download route with credit gating**

```ts
// app/api/v1/font-generator/download-svg/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'

export const maxDuration = 120

const GEMINI_API_KEY =
  process.env.SKETCH_TO_ART_GEMINI_KEY ||
  (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()

const SVG_PROMPT = `Convert this letter image into clean, minimal SVG code. Output ONLY the raw SVG markup starting with <svg and ending with </svg>. Use simple paths, no embedded raster images. Optimize for small file size.`

async function convertToSvg(imageUrl: string): Promise<string> {
  const imageRes = await fetch(imageUrl)
  const imageBuffer = await imageRes.arrayBuffer()
  const base64 = Buffer.from(imageBuffer).toString('base64')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64 } },
          { text: SVG_PROMPT },
        ],
      }],
    }),
  })

  if (!response.ok) throw new Error(`Gemini SVG conversion failed: ${response.status}`)

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i)
  if (!svgMatch) throw new Error('No valid SVG in response')

  return svgMatch[0]
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    projectId: string
    characters: { char: string; imageUrl: string }[]
  }

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.projectId || !body.characters?.length) {
    return apiError('projectId and characters are required', 'VALIDATION_ERROR', 400)
  }

  // Deduct 1 credit
  const supabase = await createClient()
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: 1,
    p_tool_id: 'font-generator',
    p_description: 'Font SVG pack download',
  })

  if (creditError) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  console.log(`[font-generator] Converting ${body.characters.length} characters to SVG...`)

  const results = await Promise.allSettled(
    body.characters.map(async ({ char, imageUrl }) => {
      const svgCode = await convertToSvg(imageUrl)
      const r2Path = `font-generator/${body.projectId}/${char}.svg`
      const svgUrl = await uploadToR2(r2Path, Buffer.from(svgCode, 'utf-8'), 'image/svg+xml')
      return { char, svgUrl, svgCode }
    }),
  )

  const svgs = results
    .filter((r): r is PromiseFulfilledResult<{ char: string; svgUrl: string; svgCode: string }> => r.status === 'fulfilled')
    .map((r) => r.value)

  console.log(`[font-generator] SVG conversion: ${svgs.length}/${body.characters.length} succeeded`)

  return apiSuccess({ svgs })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/font-generator/download-svg/route.ts
git commit -m "feat(font-generator): add credit-gated SVG download API"
```

---

### Task 5: Page Route & Wizard Orchestrator

**Files:**
- Create: `app/tools/font-generator/page.tsx`
- Create: `tools/font-generator/font-wizard.tsx`

- [ ] **Step 1: Create page route**

```tsx
// app/tools/font-generator/page.tsx
import type { Metadata } from 'next'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import FontWizard from '@/tools/font-generator/font-wizard'

export const metadata: Metadata = {
  title: 'Font Generator — Create Custom Fonts with AI | Toolk1t',
  description:
    'Design unique custom fonts and alphabets with AI. Choose a style, preview sample letters, generate a full A-Z character set, and download as PNG or SVG.',
}

export default function FontGeneratorPage() {
  return (
    <main
      className="flex-1 flex flex-col items-center py-10 px-4 bg-[#090f16]"
      style={{ overscrollBehaviorX: 'none' } as React.CSSProperties}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <ToolBreadcrumb toolName="Font Generator" toolSlug="font-generator" />
        </div>
        <FontWizard />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create wizard orchestrator**

The wizard orchestrator manages all state and delegates to step components. It follows the Logo Generator pattern exactly: tab toggle (Create/My Fonts), step indicator, step content routing, generation handlers, and auto-save to history.

Key state:
- `project: FontProject` (all wizard state)
- `activeTab: 'create' | 'history'`

Key handlers:
- `handlePreview(proj)` → calls `/api/v1/font-generator/preview`
- `handleGenerateFull(proj)` → calls `/api/v1/font-generator/generate` with existing chars
- `handleRegenerate(char)` → calls `/api/v1/font-generator/regenerate`
- `handleBack()` / `handleStartOver()` / `handleLoadFromHistory()`

Auto-save: after full generation succeeds, fire-and-forget POST to `/api/v1/font-generator/history`.

Create this file at `tools/font-generator/font-wizard.tsx` following the exact pattern from `tools/logo-generator/logo-wizard.tsx`:
- Title with gradient text: "Font" + "Generator" in blue gradient
- Tab toggle (Create / My Fonts)
- 5-step indicator (desktop circles + mobile compact pills)
- Step subtitles: Describe → Preview → Generate → Refine → Download
- Error display
- Conditional step rendering

- [ ] **Step 3: Commit**

```bash
git add app/tools/font-generator/page.tsx tools/font-generator/font-wizard.tsx
git commit -m "feat(font-generator): add page route and wizard orchestrator"
```

---

### Task 6: Describe Step (Step 1)

**Files:**
- Create: `tools/font-generator/describe-step.tsx`

- [ ] **Step 1: Create describe step component**

This component collects user input: style preset selection, free-text prompt, color palette, and optional reference image upload. It follows the StyleStep pattern from Logo Generator.

Props interface:
```ts
interface DescribeStepProps {
  stylePreset: FontStyle | null
  customPrompt: string
  colors: string[]
  colorMode: 'custom' | 'ai-suggested'
  referenceImageBase64: string | null
  onStyleChange: (s: FontStyle) => void
  onCustomPromptChange: (v: string) => void
  onColorsChange: (c: string[]) => void
  onColorModeChange: (m: 'custom' | 'ai-suggested') => void
  onReferenceChange: (base64: string | null) => void
  onNext: () => void
}
```

Sections:
1. **Style presets grid** — 2x4 grid of `FONT_STYLES` cards (gradient top + name/description bottom), selected state with blue ring/glow
2. **Creative direction textarea** — "Describe your vision..." max 500 chars with counter
3. **Color palette** — "Let AI decide" / "Choose palette" toggle, preset palettes from `FONT_COLOR_PALETTES`, saved palettes from Color Palette tool (`getSavedPalettes()`), custom color pickers
4. **Reference image** — drag-drop zone or file picker, preview thumbnail with remove button, converts to base64 on select, validates image/* max 10MB
5. **Next button** — enabled when `stylePreset !== null`, gradient style

- [ ] **Step 2: Commit**

```bash
git add tools/font-generator/describe-step.tsx
git commit -m "feat(font-generator): add describe step (style, prompt, colors, reference)"
```

---

### Task 7: Preview Step (Step 2)

**Files:**
- Create: `tools/font-generator/preview-step.tsx`

- [ ] **Step 1: Create preview step component**

Displays the 8 sample characters after generation. Shows loading animation during generation, then a grid of character images.

Props interface:
```ts
interface PreviewStepProps {
  characters: FontCharacter[]
  loading: boolean
  error: string | null
  onConfirm: () => void
  onRetry: () => void
  onBack: () => void
}
```

Layout:
- **Loading state**: spinning progress ring with rotating messages ("Crafting your letters...", "Mixing the perfect ink...", "Adding artistic flair...", "Almost there..."), same pattern as Logo Generator `ConceptsGrid`
- **Loaded state**: 2x4 grid (mobile) / 4x2 grid (desktop) of preview characters. Each cell shows the character label centered above the generated image. Images have rounded corners, white bg, subtle shadow.
- **Error state**: red error message with retry button
- **Actions**: "Love it → Generate full set" (gradient button), "Try again" (outline button), "Back" (outline button)

- [ ] **Step 2: Commit**

```bash
git add tools/font-generator/preview-step.tsx
git commit -m "feat(font-generator): add preview step with 8-character grid"
```

---

### Task 8: Alphabet Grid (Step 3) & Refine Step (Step 4)

**Files:**
- Create: `tools/font-generator/alphabet-grid.tsx`
- Create: `tools/font-generator/refine-step.tsx`

- [ ] **Step 1: Create alphabet grid component**

Displays all 36 characters (including the 8 from preview + 28 newly generated). Shows loading skeleton for characters still generating.

Props interface:
```ts
interface AlphabetGridProps {
  characters: FontCharacter[]
  loading: boolean
  totalExpected: number
  onNext: () => void
  onBack: () => void
}
```

Layout:
- **Grid**: `grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3`
- Each cell: character label (text-xs, text-center, text-[#70767f]) above the image
- Loading cells: shimmer skeleton placeholder
- Failed cells: dashed border with "?" placeholder
- Characters sorted alphabetically: A-Z then 0-9
- Bottom: "Next: Refine" button (gradient) + "Back" (outline)

- [ ] **Step 2: Create refine step component**

Same grid as alphabet-grid but with click-to-regenerate functionality.

Props interface:
```ts
interface RefineStepProps {
  characters: FontCharacter[]
  regeneratingChar: string | null
  onRegenerate: (char: string) => void
  onNext: () => void
  onBack: () => void
}
```

Behavior:
- Click any character → calls `onRegenerate(char)` → shows spinner on that cell → replaces image when done
- Hover state: subtle blue outline + "click to regenerate" tooltip
- Counter badge: "N regenerated" shown if any have been regenerated
- "Regenerate all" link (text button, not prominent)
- Bottom: "Next: Download" (gradient) + "Back" (outline)

- [ ] **Step 3: Commit**

```bash
git add tools/font-generator/alphabet-grid.tsx tools/font-generator/refine-step.tsx
git commit -m "feat(font-generator): add alphabet grid and refine step"
```

---

### Task 9: Download Step (Step 5) & My Fonts History

**Files:**
- Create: `tools/font-generator/download-step.tsx`
- Create: `tools/font-generator/my-fonts.tsx`

- [ ] **Step 1: Create download step component**

Props interface:
```ts
interface DownloadStepProps {
  characters: FontCharacter[]
  projectId: string
  stylePreset: string
  onStartOver: () => void
}
```

Layout:
- **Alphabet preview**: full grid showing all 36 characters at small size
- **Download options**:
  - Alphabet Sheet PNG (all 36 on one image) — Free, emerald button. Generated client-side using canvas: arrange all character images into a 6x6 grid, export as PNG.
  - Individual PNGs ZIP — Free, emerald button. Uses JSZip to bundle 36 PNGs.
  - SVG Pack ZIP — 1 credit, purple button with credit badge. Calls `/api/v1/font-generator/download-svg`, then bundles resulting SVGs with JSZip.
- **Start over** button at bottom

Note: JSZip is needed as a dependency. Check if already installed; if not, add `pnpm add jszip`.

- [ ] **Step 2: Create My Fonts history component**

Same pattern as `tools/logo-generator/my-logos.tsx`:
- Fetches from `/api/v1/font-generator/history`
- Loading / error / empty states
- Each entry: first character as preview image, style preset name, character count, date
- Click loads project back into wizard at Step 4 (refine)

Props interface:
```ts
interface MyFontsProps {
  onLoadProject: (entry: HistoryEntry) => void
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/font-generator/download-step.tsx tools/font-generator/my-fonts.tsx
git commit -m "feat(font-generator): add download step and My Fonts history"
```

---

### Task 10: Register Tool & Integration

**Files:**
- Modify: `lib/tools.tsx` — add Font Generator entry
- Modify: `components/home/bento-showcase.tsx` — add Font Generator card
- Modify: `components/mobile/mobile-shell.tsx` — add to FULL_SCREEN_PATHS if needed

- [ ] **Step 1: Add to tools list**

Add a new entry to the `tools` array in `lib/tools.tsx`:
```ts
{
  name: 'Font Generator',
  href: '/tools/font-generator',
  description: 'Create custom fonts and alphabets with AI',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16M7 3v3m10-3v3" />
    </svg>
  ),
  color: 'from-pink-500 to-blue-500',
}
```

- [ ] **Step 2: Add to bento showcase**

Add a Font Generator entry to `bentoItems` in `components/home/bento-showcase.tsx` with a preview showing sample letter thumbnails and a gradient matching the neon style.

- [ ] **Step 3: Verify build passes**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx
git commit -m "feat(font-generator): register tool in navigation and homepage"
```
