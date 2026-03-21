# Image Editor AI Features — Design Document

**Date:** 2026-03-21
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** Add 5 AI features to the Image Editor — background removal, object segmentation, inpainting, image recovery/enhancement, and generative fill — as a new "AI Tools" collapsible section in the right adjustments panel
- **Why:** Transform the editor from a basic filter/adjustment tool into a competitive AI-powered editor
- **Who:** Designers, marketers, casual users needing quick AI-powered image edits
- **Key constraints:** fal.ai for precision tasks (bg removal, segmentation, enhancement), Gemini/Imagen for generative tasks (inpaint, generative fill). 1 credit per operation. Results as new non-destructive layers.
- **Non-goals:** Not a full Photoshop replacement. No real-time/streaming AI. No batch processing. No custom model training.

## Assumptions

- FAL_API_KEY available in env
- fal.ai models: BiRefNet (bg removal), SAM2 (segmentation), Real-ESRGAN (upscale/denoise), GFPGAN (face restore)
- Gemini for inpainting and generative fill (image editing capability)
- Images sent as base64, max 4096x4096 (auto-resize if larger)
- AI results added as new Fabric.js layers (non-destructive)
- Existing undo/redo handles AI operations
- Processing time 2-10s per operation
- One AI operation at a time

---

## AI Tools Panel

New collapsible section in `adjustments-panel.tsx`, below Filters:

| Tool | Provider | Input | Credit |
|---|---|---|---|
| Remove Background | fal.ai BiRefNet | Full image | 1 |
| Segment Object | fal.ai SAM2 | Image + click point | 1 |
| Inpaint | Gemini | Image + mask + prompt | 1 |
| Enhance / Recover | fal.ai Real-ESRGAN / GFPGAN | Full image + mode | 1 (sharpen = free, client-side) |
| Generative Fill | Gemini/Imagen | Image + mask + prompt | 1 |

Each tool is a button card. Clicking opens a tool-specific sub-panel:

- **Remove Background:** Single "Remove" button
- **Segment Object:** "Click on the object" instructions, canvas enters click-to-segment mode
- **Inpaint:** Brush mask mode (red overlay), optional prompt, "Inpaint" button
- **Enhance:** Mode dropdown (Upscale 2x, Denoise, Restore Faces, Sharpen), "Enhance" button
- **Generative Fill:** Brush mask mode, required prompt, "Generate" button

---

## Canvas Interaction Modes

Two new modes in `use-fabric-canvas.ts`:

**Click-to-Segment:**
- `aiMode: 'segment-click'`
- Crosshair cursor
- Click captures (x, y) as percentage of image dimensions
- Returns to normal after API response

**Brush Mask:**
- `aiMode: 'brush-mask'`
- Semi-transparent red overlay brush on temporary canvas
- Brush size slider (10-100px)
- "Clear mask" button
- `exportMask(): string` — black/white PNG (white = masked)

**New hook methods:**
- `exportCurrentImage(): string` — current canvas as base64 PNG
- `addAiResultLayer(imageDataUrl: string, label: string)` — adds result as new named layer

---

## API Routes

All routes: auth required, 1 credit deduction, base64 image I/O.

### `POST /api/v1/image-editor/remove-bg`
- Input: `{ image: string }`
- Provider: fal.ai BiRefNet (`fal-ai/birefnet`)
- Output: `{ data: { image: string } }` (transparent PNG)

### `POST /api/v1/image-editor/segment`
- Input: `{ image: string, points: { x: number, y: number }[] }`
- Provider: fal.ai SAM2 (`fal-ai/sam2`)
- Output: `{ data: { mask: string, image: string } }` (extracted object)

### `POST /api/v1/image-editor/inpaint`
- Input: `{ image: string, mask: string, prompt?: string }`
- Provider: Gemini (image editing)
- Output: `{ data: { image: string } }`

### `POST /api/v1/image-editor/enhance`
- Input: `{ image: string, mode: 'upscale' | 'denoise' | 'restore-faces' | 'sharpen' }`
- Provider: fal.ai Real-ESRGAN / GFPGAN (sharpen = client-side, no API)
- Output: `{ data: { image: string } }`

### `POST /api/v1/image-editor/generative-fill`
- Input: `{ image: string, mask: string, prompt: string }`
- Provider: Gemini/Imagen
- Output: `{ data: { image: string } }`

**fal.ai client pattern:**
```typescript
import { fal } from '@fal-ai/client'
fal.config({ credentials: process.env.FAL_API_KEY })
const result = await fal.subscribe('fal-ai/birefnet', { input: { image_url: dataUrl } })
```

---

## Components

| File | Responsibility |
|---|---|
| `tools/image-editor/ai-tools-panel.tsx` | AI Tools collapsible section with 5 tool cards + sub-panels |
| `tools/image-editor/ai-mask-overlay.tsx` | Brush mask canvas overlay for inpaint/generative fill |
| `tools/image-editor/use-fabric-canvas.ts` | Modified: add aiMode, exportMask, exportCurrentImage, addAiResultLayer |
| `tools/image-editor/adjustments-panel.tsx` | Modified: add AI Tools section |
| `app/api/v1/image-editor/remove-bg/route.ts` | Background removal API |
| `app/api/v1/image-editor/segment/route.ts` | Object segmentation API |
| `app/api/v1/image-editor/inpaint/route.ts` | Inpainting API |
| `app/api/v1/image-editor/enhance/route.ts` | Enhancement API |
| `app/api/v1/image-editor/generative-fill/route.ts` | Generative fill API |

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Image >10MB | Reject with error |
| Image >4096px | Auto-resize before API |
| No image loaded | Disable AI buttons, tooltip |
| Not signed in | Sign-in prompt in panel |
| Insufficient credits | Show message + pricing link |
| API timeout >30s | Error + retry, no credit charged |
| fal.ai error | Error + retry |
| Gemini content blocked | "Image couldn't be processed" |
| Segment click on empty area | "No object detected" message |
| Empty brush mask | Disable action button |
| Sharpen selected | Client-side only, no credit |
| Result blank/corrupt | Error + retry, don't add layer |
| Multiple ops at once | Disable buttons during processing |
| Undo AI operation | Removes the AI result layer |
| Very small image <100px | "Image too small" error |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | fal.ai precision + Gemini generative | All Gemini; All fal.ai | Best quality/cost balance |
| 2 | Collapsible section in right panel | Toolbar; Menu; Contextual | Matches existing pattern |
| 3 | 1 credit flat per operation | Tiered; Free | Simple, predictable |
| 4 | Non-destructive new layers | Replace; User chooses | Professional, reversible |
| 5 | Click-to-segment for SAM2 | Lasso; Box | Simplest UX |
| 6 | Brush mask for inpaint/fill | Lasso; Rectangle | Flexible, familiar |
| 7 | Sharpen client-side (free) | Server-side | Already in Fabric.js |
| 8 | Auto-resize >4096px | Reject; Warn | Prevents failures transparently |
| 9 | One operation at a time | Queue; Parallel | Simpler state |
| 10 | 5 separate API routes | Single generic | Clearer separation |
