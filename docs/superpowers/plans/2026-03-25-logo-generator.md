# Logo Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered logo generator with a 5-step wizard: business info → style preferences → AI generates 8-12 concepts → canvas editor → download PNG/SVG.

**Architecture:** Wizard flow orchestrated by a main page component. 12 parallel Gemini image generation calls produce logo concepts. Client-side DOM editor for customization. SVG conversion via Gemini with raster-tracing fallback. R2 storage for generated assets.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Gemini REST API, Cloudflare R2, Google Fonts

**Design Document:** `docs/superpowers/specs/2026-03-25-logo-generator-design.md`

---

## Task 1: Types, Constants, and Prompt Templates

**Files:**
- Create: `tools/logo-generator/types.ts`
- Create: `lib/logo-generator/prompts.ts`

- [ ] **Step 1: Create types and constants**

Create `tools/logo-generator/types.ts` with:

```typescript
export type LogoStyle = 'modern' | 'playful' | 'elegant' | 'bold' | 'vintage' | 'minimalist'
export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface LogoConcept {
  imageUrl: string
  variation: string
}

export interface LogoProject {
  businessName: string
  tagline: string
  industry: string
  style: LogoStyle | null
  colors: string[]
  colorMode: 'custom' | 'ai-suggested'
  concepts: LogoConcept[]
  selectedIndex: number | null
  step: WizardStep
  loading: boolean
  error: string | null
}

export const LOGO_STYLES: { id: LogoStyle; name: string; description: string; gradient: string }[] = [
  { id: 'modern', name: 'Modern', description: 'Clean lines, sans-serif, minimal', gradient: 'from-blue-500 to-cyan-400' },
  { id: 'playful', name: 'Playful', description: 'Bright colors, rounded, fun', gradient: 'from-yellow-400 to-orange-400' },
  { id: 'elegant', name: 'Elegant', description: 'Serif fonts, gold tones, sophisticated', gradient: 'from-amber-600 to-yellow-700' },
  { id: 'bold', name: 'Bold', description: 'Thick type, strong colors, high impact', gradient: 'from-red-500 to-pink-500' },
  { id: 'vintage', name: 'Vintage', description: 'Retro textures, classic fonts, muted', gradient: 'from-amber-700 to-stone-500' },
  { id: 'minimalist', name: 'Minimalist', description: 'Ultra-clean, monochrome, whitespace', gradient: 'from-slate-400 to-slate-600' },
]

export const INDUSTRIES = [
  'Technology', 'Food & Drink', 'Fashion', 'Health', 'Education',
  'Finance', 'Real Estate', 'Sports', 'Music', 'Art',
  'Travel', 'Automotive', 'Legal', 'Construction', 'Pets',
  'Gaming', 'Photography', 'Consulting', 'Retail', 'Non-profit',
  'Agriculture', 'Media', 'Science', 'Beauty', 'Kids',
]

export const COLOR_PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#023E8A'] },
  { name: 'Sunset', colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#FF8C42', '#C0392B'] },
  { name: 'Forest', colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#1B4332'] },
  { name: 'Royal', colors: ['#7B2CBF', '#9D4EDD', '#C77DFF', '#E0AAFF', '#3C096C'] },
  { name: 'Monochrome', colors: ['#212529', '#495057', '#ADB5BD', '#DEE2E6', '#F8F9FA'] },
  { name: 'Coral', colors: ['#FF6F61', '#FFB5A7', '#FCD5CE', '#F8EDEB', '#FF8FA3'] },
]

export const GOOGLE_FONTS = {
  'sans-serif': ['Inter', 'Montserrat', 'Poppins', 'Raleway'],
  'serif': ['Playfair Display', 'Merriweather', 'Lora'],
  'display': ['Bebas Neue', 'Oswald', 'Righteous'],
  'handwritten': ['Pacifico', 'Dancing Script', 'Caveat'],
}

export const DEFAULT_PROJECT: LogoProject = {
  businessName: '',
  tagline: '',
  industry: '',
  style: null,
  colors: [],
  colorMode: 'ai-suggested',
  concepts: [],
  selectedIndex: null,
  step: 1,
  loading: false,
  error: null,
}
```

- [ ] **Step 2: Create prompt templates**

Create directory: `mkdir -p lib/logo-generator`

Create `lib/logo-generator/prompts.ts`:

```typescript
import type { LogoStyle } from '@/tools/logo-generator/types'

const STYLE_DESCRIPTIONS: Record<LogoStyle, string> = {
  modern: 'Clean geometric lines, sans-serif typography, minimal decoration, professional and contemporary',
  playful: 'Bright vibrant colors, rounded shapes, bouncy fun typography, friendly and approachable',
  elegant: 'Refined serif typography, gold or dark tones, thin lines, luxurious and sophisticated',
  bold: 'Thick heavy typography, strong saturated colors, high contrast, powerful and commanding',
  vintage: 'Retro-inspired design, distressed textures, classic serif or slab fonts, warm muted colors',
  minimalist: 'Ultra-clean design, maximum whitespace, monochrome or single accent color, stripped to essentials',
}

const VARIATIONS = [
  // Icon + text (3)
  'Create a logo with a meaningful ICON positioned ABOVE the business name text. The icon should be a simple, recognizable symbol related to the industry.',
  'Create a logo with a meaningful ICON positioned to the LEFT of the business name text. Horizontal layout.',
  'Create a logo with a meaningful ICON positioned to the RIGHT of the business name text. Horizontal layout.',
  // Text-only / wordmark (3)
  'Create a WORDMARK logo using only creative typography for the business name. No icon. Make the lettering itself artistic and distinctive.',
  'Create a LETTERMARK logo using only the initials/first letter of the business name in a creative typographic treatment. No icon.',
  'Create a TEXT-BASED logo with the business name in a custom typographic style. Include a subtle typographic flourish or ligature.',
  // Icon-heavy / symbol (3)
  'Create a SYMBOL-FOCUSED logo where a bold, abstract icon is the primary element. The business name should be small beneath it.',
  'Create an EMBLEM-STYLE logo where the business name wraps around or is contained within a circular or shield shape with an icon.',
  'Create a MASCOT-INSPIRED logo with a friendly character or stylized figure representing the business, with the name alongside.',
  // Abstract / creative (3)
  'Create an ABSTRACT logo using geometric shapes and negative space to suggest the industry. Include the business name in clean type.',
  'Create a MONOGRAM logo combining the first letters of the business name into one unified mark. Elegant and compact.',
  'Create a DYNAMIC logo with a sense of movement or transformation. Use flowing lines or progressive shapes with the business name.',
]

export function buildPrompts(
  businessName: string,
  tagline: string,
  industry: string,
  style: LogoStyle,
  colors: string[],
): string[] {
  const styleDesc = STYLE_DESCRIPTIONS[style]
  const colorStr = colors.length > 0 ? colors.join(', ') : 'appropriate colors for the industry'

  return VARIATIONS.map((variation) =>
    `Design a professional logo for "${businessName}"${tagline ? `, with tagline "${tagline}"` : ''}.
Industry: ${industry}.
Style: ${style} — ${styleDesc}.
Color palette: ${colorStr}.
${variation}
The logo must be on a pure white background, square format, clean vector-style rendering, high quality. Do NOT include any mockups, devices, or context — ONLY the logo itself.`
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/logo-generator/types.ts lib/logo-generator/prompts.ts
git commit -m "feat(logo-generator): add types, constants, and prompt templates

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Generate API Route

**Files:**
- Create: `app/api/v1/logo-generator/generate/route.ts`

- [ ] **Step 1: Create the generate endpoint**

Create directory: `mkdir -p app/api/v1/logo-generator/generate`

The route:
- Accepts `{ businessName, tagline, industry, style, colors }`
- Builds 12 prompts via `buildPrompts()`
- Fires 12 parallel Gemini calls (same REST pattern as sketch-to-art)
- Uploads successful results to R2 at `logo-generator/{uuid}/{index}.png`
- Returns `{ concepts: [{ imageUrl, variation }] }`
- maxDuration = 30
- No auth required (free)

Use the same Gemini REST pattern:
- Model: `gemini-3.1-flash-image-preview`
- Key as query param (sanitized)
- `responseModalities: ['TEXT', 'IMAGE']`
- Parse `inlineData.data` or `inline_data.data`

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/logo-generator/generate/route.ts
git commit -m "feat(logo-generator): add /generate API route — 12 parallel Gemini calls

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Business Info Step (Step 1 UI)

**Files:**
- Create: `tools/logo-generator/business-info-step.tsx`

- [ ] **Step 1: Create Step 1 component**

Props:
```typescript
interface BusinessInfoStepProps {
  businessName: string
  tagline: string
  industry: string
  onBusinessNameChange: (v: string) => void
  onTaglineChange: (v: string) => void
  onIndustryChange: (v: string) => void
  onNext: () => void
}
```

UI:
- Business name input (required, placeholder: "e.g. Bright Spark Creative")
- Tagline input (optional, placeholder: "e.g. Illuminating Ideas")
- Industry searchable combobox: text input that filters `INDUSTRIES` list as dropdown, with free text support
- "Next" button disabled until businessName is filled
- Lumina Synth colors: bg-[#131a23] cards, #3D6AF2 primary, etc.

- [ ] **Step 2: Commit**

```bash
git add tools/logo-generator/business-info-step.tsx
git commit -m "feat(logo-generator): add business info step with industry combobox

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Style Preferences Step (Step 2 UI)

**Files:**
- Create: `tools/logo-generator/style-step.tsx`

- [ ] **Step 1: Create Step 2 component**

Props:
```typescript
interface StyleStepProps {
  style: LogoStyle | null
  colors: string[]
  colorMode: 'custom' | 'ai-suggested'
  onStyleChange: (s: LogoStyle) => void
  onColorsChange: (c: string[]) => void
  onColorModeChange: (m: 'custom' | 'ai-suggested') => void
  onNext: () => void
  onBack: () => void
}
```

UI:
- 6 style cards in a 2x3 grid (mobile) / 3x2 grid (desktop)
- Each card: gradient background matching style, style name, brief description
- Selected card: blue glow ring (same as sketch-to-art style picker)
- Color palette section: 6 preset palette cards + "Custom" option with color picker
- "Let AI decide" toggle
- Back + Next buttons

- [ ] **Step 2: Commit**

```bash
git add tools/logo-generator/style-step.tsx
git commit -m "feat(logo-generator): add style preferences step with palettes

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Concepts Grid (Step 3 UI)

**Files:**
- Create: `tools/logo-generator/concepts-grid.tsx`

- [ ] **Step 1: Create Step 3 component**

Props:
```typescript
interface ConceptsGridProps {
  concepts: LogoConcept[]
  selectedIndex: number | null
  loading: boolean
  onSelect: (index: number) => void
  onRegenerate: () => void
  onNext: () => void
  onBack: () => void
}
```

UI:
- Loading state: Lumina Synth progress ring + "Crafting your logos..." with rotating messages
- Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Each card: logo image on white bg, rounded-2xl, hover scale + shadow
- Selected: blue glow ring + checkmark overlay
- "Regenerate" button below grid
- Back + "Customize This Logo" next button (disabled until selection)

- [ ] **Step 2: Commit**

```bash
git add tools/logo-generator/concepts-grid.tsx
git commit -m "feat(logo-generator): add concepts grid with selection and loading

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Logo Editor (Step 4 UI)

**Files:**
- Create: `tools/logo-generator/logo-editor.tsx`

- [ ] **Step 1: Create Step 4 component**

Props:
```typescript
interface LogoEditorProps {
  concept: LogoConcept
  businessName: string
  tagline: string
  onBack: () => void
  onNext: () => void
}
```

UI — split layout (desktop: left preview + right controls):

**Left: Preview**
- Large logo image display (max 500px)
- Text overlay: business name + tagline rendered with selected font
- Background: white with subtle checkerboard for transparency

**Right: Controls panel**
- **Colors section**: color swatches extracted via canvas (or 5 editable hex inputs), each opens a color picker
- **Font section**: scrollable list of Google Font options grouped by category, click to apply. Font weight slider. Letter spacing slider.
- **Layout section**: 5 icon buttons (icon above, icon left, icon right, text only, icon only)
- **Text section**: business name + tagline text inputs for editing

Note: For V1, the editor modifies a text overlay on top of the base concept image. Full image re-rendering is a future enhancement. The font/text changes render as a DOM overlay on the preview.

- [ ] **Step 2: Commit**

```bash
git add tools/logo-generator/logo-editor.tsx
git commit -m "feat(logo-generator): add logo editor with color/font/layout controls

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Download Step (Step 5 UI)

**Files:**
- Create: `tools/logo-generator/download-step.tsx`

- [ ] **Step 1: Create Step 5 component**

Props:
```typescript
interface DownloadStepProps {
  concept: LogoConcept
  businessName: string
  onStartOver: () => void
}
```

UI:
- Logo preview at 3 sizes (1024, 512, 128) in a row
- Dark/light background toggle
- Simple CSS mockups: business card rectangle, website header bar, app icon square — each with the logo composited
- Download buttons:
  - "Download PNG (512px)" — free, direct download
  - "Download PNG (1024px)" — free, direct download
  - "Download PNG (2048px)" — 1 credit, calls API
  - "Download SVG" — 1 credit, calls convert-svg API then download
  - "Download Brand Kit" — 1 credit, bundles all
- "Start Over" button

- [ ] **Step 2: Commit**

```bash
git add tools/logo-generator/download-step.tsx
git commit -m "feat(logo-generator): add download step with mockups and credit-gated exports

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: SVG Conversion + Download API Routes

**Files:**
- Create: `app/api/v1/logo-generator/convert-svg/route.ts`
- Create: `app/api/v1/logo-generator/download/route.ts`

- [ ] **Step 1: Create SVG conversion route**

`app/api/v1/logo-generator/convert-svg/route.ts`:
- Auth required, 1 credit
- Input: `{ imageUrl }`
- Try Gemini text model (`gemini-2.5-flash`) with prompt: "Convert this logo image to clean, minimal SVG code. Output ONLY valid SVG markup, no explanation."
- Validate response starts with `<svg` and ends with `</svg>`
- If valid: upload SVG to R2, return `{ svgUrl, svgCode }`
- If invalid: fall back to returning the original imageUrl with a note that SVG conversion failed

- [ ] **Step 2: Create download route**

`app/api/v1/logo-generator/download/route.ts`:
- Auth required, 1 credit (only for formats: png-2048, svg, bundle)
- Input: `{ imageUrl, format }`
- For png-2048: fetch image, resize to 2048px via canvas on server, upload to R2
- For svg: redirect to convert-svg
- For bundle: create a zip with multiple PNGs + SVG (future — for V1 just redirect to single format)
- Return `{ downloadUrl }`

- [ ] **Step 3: Commit**

```bash
git add app/api/v1/logo-generator/convert-svg/route.ts app/api/v1/logo-generator/download/route.ts
git commit -m "feat(logo-generator): add SVG conversion and download API routes

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Wizard Orchestrator + Page Route

**Files:**
- Create: `tools/logo-generator/logo-wizard.tsx`
- Create: `app/tools/logo-generator/page.tsx`

- [ ] **Step 1: Create the wizard orchestrator**

`tools/logo-generator/logo-wizard.tsx`:
- Manages `LogoProject` state
- Renders the correct step component based on `project.step`
- Handles step transitions (next/back)
- Calls generate API on step 2→3 transition
- Passes callbacks to each step component
- Step indicator (reuse Lumina Synth labeled stepper pattern from sketch-to-art)

- [ ] **Step 2: Create the page route**

`app/tools/logo-generator/page.tsx`:
- Server component with metadata
- Import and render LogoWizard
- Breadcrumb
- SEO metadata: title "Logo Generator — Create Professional Logos with AI | Toolk1t"

- [ ] **Step 3: Register the tool**

Add to `lib/tools.tsx` in the tools array:
```typescript
{
  slug: 'logo-generator',
  name: 'Logo Generator',
  description: 'Create professional logos with AI',
  icon: '...', // appropriate icon
}
```

- [ ] **Step 4: Verify locally**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/logo-generator`
Test full flow: enter business name → pick style → generate → select → edit → download

- [ ] **Step 5: Commit**

```bash
git add tools/logo-generator/logo-wizard.tsx app/tools/logo-generator/page.tsx lib/tools.tsx
git commit -m "feat(logo-generator): add wizard orchestrator and page route

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Summary

| # | Task | Key Files |
|---|------|-----------|
| 1 | Types + prompts | `tools/logo-generator/types.ts`, `lib/logo-generator/prompts.ts` |
| 2 | Generate API | `app/api/v1/logo-generator/generate/route.ts` |
| 3 | Step 1: Business Info | `tools/logo-generator/business-info-step.tsx` |
| 4 | Step 2: Style Prefs | `tools/logo-generator/style-step.tsx` |
| 5 | Step 3: Concepts Grid | `tools/logo-generator/concepts-grid.tsx` |
| 6 | Step 4: Logo Editor | `tools/logo-generator/logo-editor.tsx` |
| 7 | Step 5: Download | `tools/logo-generator/download-step.tsx` |
| 8 | SVG + Download APIs | `app/api/v1/logo-generator/convert-svg/route.ts`, `download/route.ts` |
| 9 | Wizard + Page | `tools/logo-generator/logo-wizard.tsx`, `app/tools/logo-generator/page.tsx` |
