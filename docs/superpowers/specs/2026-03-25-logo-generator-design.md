# Logo Generator — Design Specification

## Overview

AI-powered logo generator with a Looka-style wizard flow. User enters business info, selects style preferences, AI generates 8-12 logo concepts, user picks and customizes one, then downloads as PNG or SVG.

## User Flow

1. **Business Info** — name, tagline, industry (searchable dropdown + free text)
2. **Style Preferences** — pick style card + color palette (presets or custom)
3. **Generate** — AI creates 8-12 raster concepts, displayed in scrollable grid
4. **Edit** — canvas editor: colors, fonts, layout, text editing
5. **Download** — preview at sizes, download PNG (free) or SVG/high-res (1 credit)

## Step 1: Business Info

- Business name (required, text input)
- Tagline (optional, text input)
- Industry: searchable combobox with ~25 categories + free text fallback
- Categories: Technology, Food & Drink, Fashion, Health, Education, Finance, Real Estate, Sports, Music, Art, Travel, Automotive, Legal, Construction, Pets, Gaming, Photography, Consulting, Retail, Non-profit, Agriculture, Media, Science, Beauty, Kids

## Step 2: Style Preferences

- 6 style cards with visual examples:
  - Modern — clean lines, sans-serif, minimal
  - Playful — bright colors, rounded, fun typography
  - Elegant — serif fonts, gold/dark tones, sophisticated
  - Bold — thick type, strong colors, high impact
  - Vintage — retro textures, classic fonts, muted palette
  - Minimalist — ultra-clean, monochrome, whitespace
- Color palette: 6 pre-made palettes + custom picker
- "Let AI decide" toggle for industry-appropriate colors

## Step 3: AI Generation

### Prompt Strategy

12 parallel Gemini calls with structured variations:
- 3 icon + text layouts (icon above, icon left, icon right)
- 3 text-only/wordmark designs (creative typography)
- 3 icon-heavy/symbol designs (minimal text)
- 3 abstract/creative interpretations

Base prompt:
```
Design a professional logo for "{businessName}", a {industry} business.
Tagline: "{tagline}"
Style: {style} — {styleDescription}
Colors: {colorPalette}
[variation-specific instruction]
White background, square format, clean and professional.
```

### Technical
- Model: `gemini-3.1-flash-image-preview`
- 12 parallel `Promise.allSettled` calls
- Upload results to R2: `logo-generator/{projectId}/{index}.png`
- Target: 8+ successful out of 12
- Time: 15-30s with loading animation

### Display
- Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Click to select (blue ring highlight)
- "Regenerate" button below grid

## Step 4: Logo Editor

### Layout
- Desktop: left preview canvas (large) + right controls panel
- Mobile: preview top, controls below (scrollable)

### Controls
1. **Colors** — extract dominant colors as editable swatches, color picker
2. **Typography** — 15 Google Fonts grouped by category (sans-serif, serif, display, handwritten), weight slider, letter spacing slider
3. **Layout** — toggle: icon above, icon left, icon right, text only, icon only
4. **Text** — inline edit business name and tagline
5. **Scale** — icon-to-text ratio slider

### Technical
- DOM-based rendering (no Fabric.js)
- All client-side, no server calls during editing
- Google Fonts loaded dynamically

## Step 5: Download

### Preview
- 3 sizes: 1024px, 512px, 128px (icon)
- Dark/light background toggle
- Mockup previews: business card, website header, app icon (CSS mockups)

### Download Options

| Format | Cost | Details |
|--------|------|---------|
| PNG 512px | Free | Standard web |
| PNG 1024px | Free | High resolution |
| PNG 2048px | 1 credit | Print quality |
| SVG | 1 credit | Vector, scalable |
| Brand Kit ZIP | 1 credit | All PNGs + SVG + transparent variants |

### SVG Conversion Pipeline
1. Try Gemini: send logo image with "Convert to clean SVG code" prompt
2. Parse response — if valid SVG, use it
3. Fallback: existing SVG Converter vectorization (raster-to-SVG tracing)
4. Upload to R2

### Transparent Variants
- Remove white background via canvas alpha detection or @imgly/background-removal
- Include in Brand Kit ZIP

## File Structure

### New Files

| File | Purpose |
|------|---------|
| `app/tools/logo-generator/page.tsx` | Page route with metadata |
| `tools/logo-generator/types.ts` | Types, constants, industries, styles |
| `tools/logo-generator/logo-wizard.tsx` | Main wizard orchestrator |
| `tools/logo-generator/business-info-step.tsx` | Step 1 UI |
| `tools/logo-generator/style-step.tsx` | Step 2 UI |
| `tools/logo-generator/concepts-grid.tsx` | Step 3 UI |
| `tools/logo-generator/logo-editor.tsx` | Step 4 canvas editor |
| `tools/logo-generator/download-step.tsx` | Step 5 UI |
| `app/api/v1/logo-generator/generate/route.ts` | Generate 12 concepts |
| `app/api/v1/logo-generator/convert-svg/route.ts` | SVG conversion |
| `app/api/v1/logo-generator/download/route.ts` | Download bundle (credit gate) |
| `lib/logo-generator/prompts.ts` | Prompt templates |

## API Design

### POST /api/v1/logo-generator/generate
- Auth: Not required (free)
- Input: `{ businessName, tagline, industry, style, colors }`
- Output: `{ concepts: [{ imageUrl, promptVariation }] }`
- Max duration: 30s

### POST /api/v1/logo-generator/convert-svg
- Auth: Required
- Credits: 1
- Input: `{ imageUrl }`
- Output: `{ svgUrl, svgCode }`

### POST /api/v1/logo-generator/download
- Auth: Required
- Credits: 1 (high-res/SVG/bundle only)
- Input: `{ imageUrl, format }`
- Output: `{ downloadUrl }`

## Credit Model

| Operation | Cost |
|-----------|------|
| Generate 8-12 concepts | Free |
| Regenerate concepts | Free |
| Edit/customize | Free |
| Download PNG 512px | Free |
| Download PNG 1024px | Free |
| Download PNG 2048px | 1 credit |
| Download SVG | 1 credit |
| Download Brand Kit | 1 credit |

## Constraints

- Processing time: 15-30s for generation with loading animation
- Gemini API: reuse existing key
- R2 storage: `logo-generator/{projectId}/`
- SVG generation is experimental — reliable fallback to tracing
- No new dependencies for editor (DOM-based)
- Google Fonts for typography (CDN, dynamic loading)
- WCAG 2.1 AA compliance
- Mobile-first responsive

## Risks

1. **Logo image quality** — Gemini may produce inconsistent logo styles. Mitigation: structured prompts with explicit style instructions.
2. **SVG conversion quality** — Gemini SVG output may be complex/invalid. Mitigation: validation + fallback to raster tracing.
3. **Font rendering** — dynamic Google Fonts may flash or shift. Mitigation: preload common fonts, show skeleton during load.
4. **Editor complexity** — DOM-based rendering may not handle complex layouts. Mitigation: keep editing simple (color/font/layout toggles, not freeform drag).

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Full wizard + canvas editor | Generate + regenerate, template-first | Most complete UX, proven Looka pattern |
| 2 | Gemini for generation | DALL-E, Stable Diffusion | Already integrated, no new keys |
| 3 | 8-12 concepts (12 parallel calls) | 4 concepts, single prompt | More choices = higher satisfaction |
| 4 | Raster first, SVG on download | SVG-only, raster-only | Raster reliable, SVG experimental |
| 5 | Gemini SVG → tracing fallback | One or the other | Best quality with reliable fallback |
| 6 | Free generation, 1 credit download | All free, credits per gen | Adoption + monetization balance |
| 7 | Client-side DOM editor | Fabric.js, server rendering | Simple, instant, no dependency |
| 8 | 12 prompt variations | Same prompt, random | Structured diversity |
| 9 | Google Fonts | System fonts, custom | Wide selection, free, cached |
| 10 | ~25 industry categories + free text | Dropdown only, free text only | Guided + flexible |
