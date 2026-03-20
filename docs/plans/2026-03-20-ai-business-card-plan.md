# AI Business Card Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-powered business card generator within ECard Studio — wizard flow with dynamic form, logo brand analysis, Imagen/Gemini image generation (3 designs), and chat-based refinement.

**Architecture:** 5-step wizard: business info form (progressive disclosure) → logo upload + brand analysis → AI generates 3 card images → pick + chat refinement → download. Server-side uses Gemini 2.5 Flash for brand analysis/prompt rewriting, and the existing illustration pipeline (Nano Banana / Imagen 3) for card image generation. Images stored in R2.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Gemini 2.5 Flash, Nano Banana (gemini-3.1-flash-image-preview) / Imagen 3, Cloudflare R2, Tailwind CSS v4.

**Design doc:** `docs/plans/2026-03-20-ai-business-card-design.md`

---

### Task 1: Types & Wizard State

**Files:**
- Create: `tools/ecard-studio/ai-card/types.ts`

**Step 1: Create types file**

All types for the AI business card wizard. NO `'use client'`.

```typescript
// tools/ecard-studio/ai-card/types.ts

export interface BusinessInfo {
  name: string
  title: string
  company: string
  phone?: string
  email?: string
  website?: string
  address?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  tagline?: string
  industry?: string
}

export const REQUIRED_FIELDS = ['name', 'title', 'company'] as const

export const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Real Estate',
  'Legal', 'Marketing', 'Design', 'Consulting', 'Retail',
  'Food & Hospitality', 'Construction', 'Manufacturing', 'Non-profit', 'Other',
] as const

export interface BrandAnalysis {
  suggestedColors: { primary: string; secondary: string; accent: string }
  suggestedStyle: 'classic' | 'modern' | 'bold' | 'minimal' | 'creative' | 'elegant'
  suggestedTagline: string | null
  suggestedFonts: { heading: string; body: string }
  brandPersonality: string
}

export interface GeneratedDesign {
  imageUrl: string
  style: string
  prompt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

export type WizardStep = 1 | 2 | 3 | 4 | 5

export interface WizardState {
  step: WizardStep
  businessInfo: BusinessInfo
  logoDataUrl: string | null
  brandAnalysis: BrandAnalysis | null
  designs: GeneratedDesign[]
  selectedIndex: number | null
  chatHistory: ChatMessage[]
  currentDesign: GeneratedDesign | null
  refinementCount: number
  loading: boolean
  error: string | null
}

export const MAX_REFINEMENTS = 10

export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: '',
  title: '',
  company: '',
}

export const DEFAULT_WIZARD_STATE: WizardState = {
  step: 1,
  businessInfo: DEFAULT_BUSINESS_INFO,
  logoDataUrl: null,
  brandAnalysis: null,
  designs: [],
  selectedIndex: null,
  chatHistory: [],
  currentDesign: null,
  refinementCount: 0,
  loading: false,
  error: null,
}

/** Title keywords → suggested extra fields */
export const FIELD_SUGGESTIONS: Record<string, string[]> = {
  tech: ['website', 'linkedin'],
  developer: ['website', 'linkedin'],
  engineer: ['website', 'linkedin'],
  cto: ['website', 'linkedin'],
  designer: ['website', 'instagram'],
  creative: ['website', 'instagram'],
  artist: ['website', 'instagram'],
  photographer: ['website', 'instagram'],
  marketing: ['phone', 'linkedin', 'twitter'],
  sales: ['phone', 'linkedin'],
  agent: ['phone', 'address'],
  realtor: ['phone', 'address'],
  lawyer: ['phone', 'address'],
  consultant: ['phone', 'linkedin', 'website'],
}
```

**Step 2: Commit**

```bash
git add tools/ecard-studio/ai-card/types.ts
git commit -m "feat(ai-business-card): add types and wizard state definitions"
```

---

### Task 2: Step 1 — Business Info Form

**Files:**
- Create: `tools/ecard-studio/ai-card/business-info-form.tsx`

**Step 1: Build the progressive disclosure form**

`'use client'` component.

Props: `info: BusinessInfo, onChange: (info: BusinessInfo) => void, onNext: () => void`

- 3 required fields always visible: Name, Title, Company (large, prominent inputs)
- After all 3 are filled → reveal additional fields section with smooth animation
- Additional fields shown based on title keywords (using FIELD_SUGGESTIONS)
- Always show: phone, email, website after initial 3
- Context-based: linkedin, twitter, instagram, address based on title
- "Add more fields" button shows remaining hidden fields
- Optional: tagline input, industry dropdown (INDUSTRY_OPTIONS)
- "Next" button at bottom, disabled until required fields filled
- All inputs: rounded-xl, border-slate-200 dark, 44px min height, dark mode support

**Step 2: Commit**

```bash
git add tools/ecard-studio/ai-card/business-info-form.tsx
git commit -m "feat(ai-business-card): add dynamic business info form with progressive disclosure"
```

---

### Task 3: Step 2 — Logo Upload & Brand Analysis UI

**Files:**
- Create: `tools/ecard-studio/ai-card/logo-upload.tsx`

**Step 1: Build the logo upload + brand analysis display**

`'use client'` component.

Props: `logoDataUrl: string | null, onLogoChange: (dataUrl: string | null) => void, brandAnalysis: BrandAnalysis | null, onAnalyze: () => void, onUpdateAnalysis: (analysis: BrandAnalysis) => void, loading: boolean, error: string | null, onNext: () => void, onSkip: () => void`

**Upload area:**
- Drag & drop zone (PNG/JPG/SVG/WebP, max 5MB)
- File validation with error messages
- After upload: show logo thumbnail + "Remove" button
- Convert to base64 data URL
- "Skip" button to proceed without logo

**Brand analysis display (shown after analysis completes):**
- "Brand Profile" card with:
  - Color palette: 3 swatches (primary, secondary, accent) — each clickable to change via color picker
  - Style badge (e.g. "Modern")
  - Suggested tagline — editable inline text input
  - Brand personality — text display
  - Font suggestions — text display
- "Regenerate" button to re-analyze
- "Next" button to proceed

**Color extraction helper (client-side):**
- `extractDominantColors(dataUrl: string): Promise<string[]>` — draws image to canvas, samples pixels, returns top 5 hex colors using simple bucket sort

**Step 2: Commit**

```bash
git add tools/ecard-studio/ai-card/logo-upload.tsx
git commit -m "feat(ai-business-card): add logo upload with brand analysis display"
```

---

### Task 4: Brand Analysis API Route

**Files:**
- Create: `app/api/v1/ecard/analyze-brand/route.ts`

**Step 1: Build the brand analysis endpoint**

`POST /api/v1/ecard/analyze-brand`

Input: `{ businessInfo: BusinessInfo, dominantColors: string[] }`

- Auth required (getAuthUserId)
- No credit cost (free, bundled with generation)
- Uses Gemini 2.5 Flash with structured JSON output
- System prompt: "You are a brand identity expert. Analyze the business information and logo colors to suggest a cohesive brand identity for a business card."
- Returns: `{ data: BrandAnalysis }`
- Schema: suggestedColors (primary/secondary/accent hex), suggestedStyle (enum), suggestedTagline (string or null — only if not already provided), suggestedFonts (heading/body), brandPersonality (short phrase)

Import pattern: same as `app/api/v1/palette/generate/route.ts` — use GoogleGenerativeAI, SchemaType, createClient, getAuthUserId, apiSuccess, apiError, API_ERRORS.

**Step 2: Commit**

```bash
git add app/api/v1/ecard/analyze-brand/route.ts
git commit -m "feat(ai-business-card): add brand analysis API route via Gemini"
```

---

### Task 5: Card Generation API Route

**Files:**
- Create: `app/api/v1/ecard/generate-cards/route.ts`

**Step 1: Build the card generation endpoint**

`POST /api/v1/ecard/generate-cards`

Input: `{ businessInfo: BusinessInfo, brandAnalysis: BrandAnalysis | null, logoDataUrl: string | null }`

- Auth required
- Costs 1 credit (deduct via supabase.rpc('deduct_credits'))
- Generates 3 card images in parallel using the existing illustration pipeline

**For each of 3 designs, build a prompt:**
1. Design A — `Professional business card, {brandAnalysis.suggestedStyle} style...`
2. Design B — contrasting style (map: modern→classic, bold→elegant, etc.)
3. Design C — creative wildcard

**Prompt template:**
```
Professional business card design, {style} style, 3.5:2 aspect ratio.
Name: {name}
Title: {title}
Company: {company}
{tagline if provided}
Contact: {phone}, {email}, {website}
Colors: {primary}, {secondary}, {accent}
{logo description if provided}
Clean typography, high quality, print-ready design.
```

**Image generation:** Use `generateIllustration` from `@/lib/story/illustrate` — it handles the provider cascade (Nano Banana → Imagen 3 → fallbacks). Pass the prompt as `imagePrompt`.

If logo was uploaded, convert data URL to Buffer and pass as `referenceImage` so the AI can incorporate it.

**Returns:** `{ data: { designs: GeneratedDesign[] } }` — each with imageUrl (R2 URL), style label, and prompt used.

**Error handling:** If 1-2 fail, return the successful ones. If all fail, return error (don't charge credit — refund via `release_reserved_credits` or skip deduction on failure).

**Step 2: Commit**

```bash
git add app/api/v1/ecard/generate-cards/route.ts
git commit -m "feat(ai-business-card): add card generation API route (3 parallel Imagen/Gemini designs)"
```

---

### Task 6: Card Refinement API Route

**Files:**
- Create: `app/api/v1/ecard/refine-card/route.ts`

**Step 1: Build the refinement endpoint**

`POST /api/v1/ecard/refine-card`

Input: `{ originalPrompt: string, userFeedback: string, previousImageUrl: string }`

- Auth required
- Costs 1 credit per refinement
- Step 1: Gemini rewrites the original prompt incorporating the user's feedback
- Step 2: Generate new image using the updated prompt via `generateIllustration`
- Returns: `{ data: { design: GeneratedDesign } }` — new imageUrl, style, updated prompt

**Gemini prompt rewriting:**
```
You are refining a business card design prompt based on user feedback.

Original prompt: {originalPrompt}

User feedback: {userFeedback}

Rewrite the prompt to incorporate the feedback while keeping all business information intact.
Return ONLY the updated prompt text, nothing else.
```

**Step 2: Commit**

```bash
git add app/api/v1/ecard/refine-card/route.ts
git commit -m "feat(ai-business-card): add card refinement API route (chat-based)"
```

---

### Task 7: Steps 3-4 — Card Gallery & Refinement Chat UI

**Files:**
- Create: `tools/ecard-studio/ai-card/card-gallery.tsx`
- Create: `tools/ecard-studio/ai-card/refinement-chat.tsx`

**Step 1: Build card gallery (Step 3-4 pick phase)**

Props: `designs: GeneratedDesign[], selectedIndex: number | null, onSelect: (index: number) => void, loading: boolean`

- 3 card thumbnails in a row (desktop) or stacked (mobile)
- Style label under each
- Loading state: 3 skeleton cards with "Designing your cards..." message
- Click to select → highlighted border + checkmark
- "Pick this one" button confirms

**Step 2: Build refinement chat (Step 4 refine phase)**

Props: `currentDesign: GeneratedDesign, chatHistory: ChatMessage[], onSendMessage: (message: string) => void, refinementCount: number, loading: boolean, error: string | null, designHistory: GeneratedDesign[], onRevert: (index: number) => void`

- Current card shown large at top
- Quick suggestion pills: "Darker colors", "Lighter colors", "More modern", "More classic", "Bigger text", "Add border"
- Chat input with send button
- Chat history showing user messages and resulting card images
- Design history thumbnails (click to revert)
- Refinement counter: "{count}/10 refinements used"
- Disabled state when limit reached

**Step 3: Commit**

```bash
git add tools/ecard-studio/ai-card/card-gallery.tsx tools/ecard-studio/ai-card/refinement-chat.tsx
git commit -m "feat(ai-business-card): add card gallery and refinement chat UI"
```

---

### Task 8: Step 5 — Download Panel

**Files:**
- Create: `tools/ecard-studio/ai-card/download-panel.tsx`

**Step 1: Build download panel**

Props: `design: GeneratedDesign, businessInfo: BusinessInfo`

- Final card shown at full size (max-width container)
- "Download PNG" button — fetches the R2 image URL, triggers download
- "Start Over" button — resets wizard to Step 1
- "Make Another" button — goes back to Step 3 with same business info

Download helper: fetch image URL → blob → `downloadBlob(blob, 'business-card.png')`

**Step 2: Commit**

```bash
git add tools/ecard-studio/ai-card/download-panel.tsx
git commit -m "feat(ai-business-card): add download panel"
```

---

### Task 9: Page Route — Wire Wizard Together

**Files:**
- Create: `app/tools/ecard-studio/ai-business-card/page.tsx`

**Step 1: Build the wizard page**

`'use client'` page with auth gate.

**State:** `useState<WizardState>(DEFAULT_WIZARD_STATE)`

**Step rendering:**
- Step 1: `<BusinessInfoForm>` — onNext sets step=2
- Step 2: `<LogoUpload>` — onAnalyze calls `/api/v1/ecard/analyze-brand`, onNext/onSkip sets step=3 and triggers generation
- Step 3: Loading state while `/api/v1/ecard/generate-cards` runs, auto-advance to step=4
- Step 4: `<CardGallery>` for picking + `<RefinementChat>` after selection. Refinement calls `/api/v1/ecard/refine-card`. "Done" button advances to step=5.
- Step 5: `<DownloadPanel>`

**Wizard navigation:** Back/Next buttons at bottom of each step. Step indicator at top showing progress (1-5 dots/tabs).

**Layout:**
```jsx
<main className="flex-1 flex flex-col items-center py-10 px-4">
  <div className="w-full max-w-2xl flex flex-col gap-6">
    {/* Step indicator */}
    {/* Active step component */}
    {/* Navigation buttons */}
  </div>
</main>
```

**Step 2: Run build**

Run: `pnpm build`
Expected: passes with new route.

**Step 3: Commit**

```bash
git add app/tools/ecard-studio/ai-business-card/page.tsx
git commit -m "feat(ai-business-card): add wizard page route wiring all steps"
```

---

### Task 10: Entry Point & Deploy

**Files:**
- Modify: `app/tools/ecard-studio/page.tsx` — add "Create with AI" button linking to `/tools/ecard-studio/ai-business-card`

**Step 1: Add entry point**

Read `app/tools/ecard-studio/page.tsx` and add a prominent "Create with AI" button/card near the top, next to or above the template picker. Links to `/tools/ecard-studio/ai-business-card`.

Style: gradient button (amber → purple), sparkle icon, "Create Business Card with AI" label, "1 credit" badge.

**Step 2: Run build**

Run: `pnpm build`

**Step 3: Commit and push**

```bash
git add app/tools/ecard-studio/page.tsx app/tools/ecard-studio/ai-business-card/page.tsx
git commit -m "feat(ai-business-card): add entry point and deploy"
git push origin main
```
