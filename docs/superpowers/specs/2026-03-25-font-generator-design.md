# Font Generator — Design Specification

## Overview

AI-powered custom font/typography generator. Users describe a style, AI generates a visual A-Z + 0-9 alphabet, downloadable as PNG images and SVG vectors. Two-phase generation: preview 8 sample letters first, then generate the full 36-character set on confirmation.

## User Flow

1. **Describe** — style presets + free-text prompt + color picker + reference image upload
2. **Preview** — AI generates 8 sample characters, user confirms the style
3. **Full Set** — generate remaining 28 characters, display in grid
4. **Refine** — click any letter to regenerate individually
5. **Download** — PNG sheet, individual PNGs ZIP, SVG pack ZIP (credit-gated)

## Target Audience

Broad: designers, small business owners, casual users. UX must be simple enough for non-designers.

## Step 1: Describe Your Font

### Style Presets (8 cards with visual examples)
- **Neon** — glowing neon tube letters, pink/blue glow
- **Hand-drawn** — sketchy, imperfect, organic ink feel
- **Retro Pixel** — 8-bit pixel art, blocky game-like
- **Watercolor** — soft paint bleeds, translucent pastel layers
- **3D Bubble** — inflated, rounded, glossy with highlights
- **Gothic** — blackletter, ornate, medieval decorative
- **Graffiti** — street art, spray paint, bold urban
- **Minimalist** — thin geometric strokes, monoline, clean

### Free-text Prompt
- Textarea: "Describe your vision..." (optional, max 500 chars)
- Appended to Gemini prompt as additional creative direction

### Color Picker
- 6 preset palettes + custom color picker
- "From your Color Palette tool" section (reads `tk-palettes` from localStorage)
- "Let AI decide" toggle

### Reference Image Upload
- Optional drag-drop or file picker
- Validated: image/* types only, max 10MB
- Resized server-side before sending to Gemini
- Stored in R2 for potential re-use

## Step 2: Preview

### Characters Generated
8 sample characters: A, B, G, R, a, g, 1, &
- Covers uppercase, lowercase hint, numeral, and special character

### Display
- Large grid showing all 8 characters
- Style description shown above
- Three actions: "Love it" → Step 3, "Try again" → regenerate, "Back" → adjust inputs

### Technical
- 8 parallel Gemini calls via `Promise.allSettled`
- Target: 10-15s generation time
- Free, no auth required

## Step 3: Full Alphabet

### Characters
A-Z + 0-9 = 36 characters total. Lowercase and punctuation deferred to v2.

### Generation
- Subtract preview characters already generated (reuse them)
- Generate remaining ~28 characters in parallel
- Target: 30-45s with loading animation

### Display
- Grid: 3 cols mobile, 4 cols tablet, 6 cols desktop
- Each cell: character label above, generated image below
- Loading skeleton with shimmer while generating
- "Failed" placeholder for any that didn't succeed

## Step 4: Refine

- Click any letter to regenerate (single Gemini call)
- Regenerated letter replaces original with subtle animation
- "Regenerate all" button available but not prominent
- Badge showing count of regenerated characters
- Each regeneration updates the JSONB `characters` array in DB

## Step 5: Download

### Preview
- Full alphabet sheet (all 36 on one image)
- Individual letter previews

### Download Options

| Format | Cost | Details |
|--------|------|---------|
| Alphabet Sheet PNG | Free | All 36 letters on one image |
| Individual PNGs ZIP | Free | 36 separate PNG files |
| SVG Pack ZIP | 1 credit | 36 vectors via Gemini SVG conversion |
| Font file (.ttf/.woff) | 1 credit | v2 — not at launch |

### SVG Conversion
- Reuse Logo Generator pipeline: Gemini "Convert to clean SVG" + validation
- Converted per-character, stored in R2

## File Structure

### New Files

| File | Purpose |
|------|---------|
| `app/tools/font-generator/page.tsx` | Page route with metadata |
| `tools/font-generator/types.ts` | Types, style presets, constants |
| `tools/font-generator/font-wizard.tsx` | Main wizard orchestrator |
| `tools/font-generator/describe-step.tsx` | Step 1: style + prompt + colors + reference |
| `tools/font-generator/preview-step.tsx` | Step 2: 8-letter preview |
| `tools/font-generator/alphabet-grid.tsx` | Step 3: full 36-char grid |
| `tools/font-generator/refine-step.tsx` | Step 4: click-to-regenerate |
| `tools/font-generator/download-step.tsx` | Step 5: download options |
| `tools/font-generator/my-fonts.tsx` | History tab (Create / My Fonts toggle) |
| `lib/font-generator/prompts.ts` | Prompt templates |
| `app/api/v1/font-generator/preview/route.ts` | Generate 8 preview characters |
| `app/api/v1/font-generator/generate/route.ts` | Generate full 36-character set |
| `app/api/v1/font-generator/regenerate/route.ts` | Regenerate single character |
| `app/api/v1/font-generator/download-svg/route.ts` | SVG conversion + ZIP (1 credit) |
| `app/api/v1/font-generator/history/route.ts` | Save/fetch user's font history |

## API Design

### POST /api/v1/font-generator/preview
- Auth: Not required (free)
- Input: `{ stylePreset, customPrompt?, colors?, referenceImageBase64? }`
- Output: `{ characters: [{ char, imageUrl }], projectId }`
- Max duration: 15s

### POST /api/v1/font-generator/generate
- Auth: Not required (free)
- Input: `{ projectId, stylePreset, customPrompt?, colors?, referenceImageBase64?, existingChars? }`
- Output: `{ characters: [{ char, imageUrl }] }`
- Max duration: 45s

### POST /api/v1/font-generator/regenerate
- Auth: Not required (free)
- Input: `{ projectId, char, stylePreset, customPrompt?, colors?, referenceImageBase64? }`
- Output: `{ char, imageUrl }`

### POST /api/v1/font-generator/download-svg
- Auth: Required
- Credits: 1
- Input: `{ projectId, characters: [{ char, imageUrl }] }`
- Output: `{ downloadUrl }` (ZIP of 36 SVGs)

### GET/POST /api/v1/font-generator/history
- Auth: Required
- GET: Fetch user's font history (limit 50)
- POST: Save a generation

## Data Model

### `font_generations` table

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL
style_preset    TEXT
custom_prompt   TEXT
colors          TEXT[] DEFAULT '{}'
reference_url   TEXT
characters      JSONB DEFAULT '[]'  -- [{ char, imageUrl, svgUrl? }]
created_at      TIMESTAMPTZ DEFAULT now()
```

- RLS: users read/update own rows only
- Index on (user_id, created_at DESC)
- JSONB array for characters — simple, single row per generation
- New row per full regeneration (preserves history)

## Gemini Prompt Strategy

Base prompt per character:
```
Generate a single letter '{char}' in the following style: {styleDescription}.
Colors: {colorPalette}.
The letter should be centered on a pure white square background, clean rendering,
no other text or decoration — ONLY the letter itself.
{customPrompt ? 'Additional creative direction: ' + customPrompt : ''}
```

Reference image: sent as inline image data with "Match the visual style and texture of this reference image."

## Credit Model

| Operation | Cost |
|-----------|------|
| Preview (8 characters) | Free |
| Full generation (36 characters) | Free |
| Regenerate individual letter | Free |
| Download PNG sheet | Free |
| Download individual PNGs ZIP | Free |
| Download SVG pack ZIP | 1 credit |
| Download font file (.ttf/.woff) | 1 credit (v2) |

## Edge Cases

- **Partial failure**: Show succeeded characters, "failed" placeholder for rest. User retries individually in Step 4.
- **Reference image too large**: Validate max 10MB client-side, resize server-side.
- **Style inconsistency across letters**: Known Gemini limitation. Defer cross-letter consistency prompting to v2 (YAGNI).
- **Duplicate generation**: New DB row per full set. History shows all attempts.

## Constraints

- Gemini API: reuse existing key (`gemini-3.1-flash-image-preview`)
- R2 storage: `font-generator/{projectId}/`
- No new dependencies for MVP
- Mobile-first responsive
- WCAG 2.1 AA compliance

## Non-Goals (v1)

- Installable font files (.ttf/.woff) — v2 after demand validation
- Lowercase letters (a-z) — v2
- Punctuation and special characters beyond & — v2
- Cross-letter consistency prompting — v2 if users report issues

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | PNG + SVG at launch, font file v2 | All formats now | YAGNI — validate demand first |
| 2 | Preview 8 letters first, then full 36 | All at once, batch groups | Saves API cost, fast feedback |
| 3 | Free PNG, 1 credit SVG | All free, credits for everything | Adoption + monetization balance |
| 4 | Presets + prompt + colors + reference image | Prompt only | Maximum creative control |
| 5 | 5-step wizard flow | Single-page studio, hybrid | Consistent with existing tools |
| 6 | A-Z + 0-9 only (36 chars) | +lowercase, +punctuation | Fast generation, reasonable cost |
| 7 | JSONB array in single row | Separate table per character | Simple queries, trivial data size |
| 8 | Partial failure with retry | All-or-nothing | Better UX — show what succeeded |
| 9 | No consistency prompting at launch | Include prior letters as context | YAGNI — add if users report issues |
| 10 | New DB row per full regeneration | Overwrite | Preserves history of all attempts |
