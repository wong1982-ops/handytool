# Sketch to Art — Design Document

**Date:** 2026-03-22
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** AI tool that transforms hand-drawn sketches into various art styles — input via upload, camera capture, or in-browser canvas. 18 preset styles + custom text descriptions. Generates 4 variations, user picks one and refines via chat (max 5 rounds).
- **Why:** Fun creative tool for kids and adults to turn simple drawings into professional-looking art
- **Who:** Kids of all ages, parents, casual artists, designers
- **Key constraints:** 1 credit for initial 4 variations + 5 refinements. Fun/Pro mode toggle. Download + share + public gallery (opt-in).
- **Non-goals:** Not a drawing tutorial. Not a full illustration tool. No print-to-order.

## Assumptions

- Nano Banana (gemini-3.1-flash-image-preview) for sketch → art transformation
- Upload: PNG/JPG/WebP, max 10MB
- Drawing canvas: simple pen/eraser/colors, 512x512, touch-friendly
- Camera: getUserMedia with snapshot capture, fallback to file input
- Gallery: Supabase table + R2 images, public viewing, opt-in submission
- Fun mode: playful UI (emoji, confetti, larger buttons). Pro mode: clean glassmorphism.
- Mode preference saved in localStorage
- 4 variations generated in parallel with varied prompt phrasing
- Refinement reuses original sketch + selected image as reference
- Mobile-first (camera capture is primary for kids)

---

## Route & Layout

**Route:** `/tools/sketch-to-art`
**Gallery:** `/tools/sketch-to-art/gallery`

Single page wizard, vertical scroll through 5 steps. Mode toggle (Fun/Pro) top-right.

## Components

| File | Responsibility |
|---|---|
| `tools/sketch-to-art/types.ts` | ArtStyle, SketchInput, GeneratedVariation types |
| `tools/sketch-to-art/sketch-input.tsx` | Upload + camera + canvas tabs (Step 1) |
| `tools/sketch-to-art/drawing-canvas.tsx` | In-browser drawing tool |
| `tools/sketch-to-art/style-picker.tsx` | 18 preset styles + custom input (Step 2) |
| `tools/sketch-to-art/generation-results.tsx` | 4 variations grid + selection (Step 3) |
| `tools/sketch-to-art/refinement-chat.tsx` | Chat refinement (Step 4) |
| `tools/sketch-to-art/save-share.tsx` | Download, share, gallery (Step 5) |
| `tools/sketch-to-art/mode-toggle.tsx` | Fun/Pro switch |
| `app/tools/sketch-to-art/page.tsx` | Wizard page |
| `app/tools/sketch-to-art/gallery/page.tsx` | Public gallery |
| `app/api/v1/sketch-to-art/generate/route.ts` | Generate 4 variations |
| `app/api/v1/sketch-to-art/refine/route.ts` | Refine selected image |
| `app/api/v1/sketch-to-art/gallery/route.ts` | Submit to gallery |

---

## Step 1: Sketch Input

Three tabs: Upload, Camera, Draw

**Upload:** Drag & drop, PNG/JPG/WebP, max 10MB, thumbnail preview.

**Camera:** getUserMedia live feed, capture button, retake option. Falls back to file input.

**Draw:** Canvas 512x512, pen (3 sizes), eraser, 8 color swatches, undo/redo, clear. Touch-friendly. Exports as PNG data URL.

---

## Step 2: Style Picker

**18 presets in 3 categories:**

Classic Art: Watercolor, Oil Painting, Impressionist, Van Gogh, Picasso, Chalk/Pastel

Modern/Digital: Cartoon, Anime/Manga, Pixel Art, 3D Render, Comic Book, Pop Art

Fantasy/Creative: Studio Ghibli, Stained Glass, Steampunk, Cyberpunk, Claymation, Fantasy Illustration

**Custom input:** Free text field below grid.

Grid: 3-col mobile, 4-col tablet, 6-col desktop.

---

## Step 3: Generation

**API:** `POST /api/v1/sketch-to-art/generate`
- Input: sketch (base64), style, customStyle?
- 1 credit, auth required
- 4 parallel Nano Banana generations with varied prompt phrasing
- Upload to R2, return 4 image URLs

**Loading:** Fun mode = magic wand animation + messages. Pro mode = skeleton + spinner.

**Results:** 2x2 grid, click to select.

---

## Step 4: Refinement

Chat panel below selected image.

Quick pills: "More colorful", "Add background", "Make darker", "More detailed", "Simpler", "Add sparkles"

**API:** `POST /api/v1/sketch-to-art/refine`
- Input: imageUrl, feedback, originalSketch, style
- No additional credit (max 5 rounds)
- Gemini rewrites prompt → Nano Banana regenerates

History row for reverting. Counter: "X/5 changes remaining".

---

## Step 5: Save & Share

- Download PNG
- Share: copy link, X, Instagram
- Gallery submit (opt-in): title input, publish toggle
- Saves to `sketch_gallery` table

---

## Gallery Page

`/tools/sketch-to-art/gallery`

Public masonry grid. Each card: result image, title, style badge, original sketch toggle. Newest first. Load more pagination. ISR revalidate = 300.

---

## Database

```sql
CREATE TABLE public.sketch_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  original_sketch_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Upload >10MB | Reject |
| Non-image file | Reject |
| Camera not supported | Hide tab |
| Camera denied | Message + fallback |
| Empty canvas | Disable Next |
| All 4 fail | Error + retry, no credit |
| 1-3 fail | Show successful ones |
| Refinement fails | Keep current, don't count |
| Not signed in | Auth gate at Step 3 |
| Insufficient credits | Message at Step 3 |
| Gallery submit fails | Error, still downloadable |
| Small sketch <50px | "Drawing too small" |
| Content safety | Gemini built-in filters |

---

## Fun vs Pro Mode

| Element | Fun Mode | Pro Mode |
|---|---|---|
| Background | Subtle confetti/stars | Clean dark |
| Buttons | Rounded-full, colorful, emoji | Standard, minimal |
| Generate label | "✨ Make Magic!" | "Generate" |
| Refine label | "🪄 Change it!" | "Refine" |
| Loading | Magic wand + messages | Spinner |
| Completion | Confetti burst | Subtle fade-in |
| Quick pills | Emoji labels | Text labels |
| Font feel | Slightly larger, rounded | Standard |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | All ages | Specific range | Max audience |
| 2 | 18 presets + custom | Presets only | Library + freedom |
| 3 | Upload + camera + draw | Upload only | Accessibility |
| 4 | 4 variations + 5 refinements | Single; Variations only | Creative exploration |
| 5 | 1 credit total | Per-op; Free | Simple, generous |
| 6 | Fun/Pro toggle | Single mode | Serves both audiences |
| 7 | Wizard flow | Single-page; Chat | Kid-friendly, mobile |
| 8 | Download + share + gallery | Download only | Community + showcase |
| 9 | Nano Banana | Imagen; fal.ai | Proven, supports sketches |
| 10 | Simple canvas (pen, 8 colors) | Full editor | Quick sketches |
| 11 | Gallery as sub-route | Separate; None | SEO + within tool |
