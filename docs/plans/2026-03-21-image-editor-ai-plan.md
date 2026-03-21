# Image Editor AI Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 AI features to the Image Editor — background removal, object segmentation, inpainting, enhancement, and generative fill — as a new "AI Tools" section in the right panel with non-destructive layer output.

**Architecture:** AI Tools panel in the existing right-side adjustments panel. Two new canvas interaction modes (click-to-segment, brush-mask). 5 API routes: 3 using fal.ai (bg removal, segmentation, enhancement), 2 using Gemini (inpaint, generative fill). Each AI result is added as a new Fabric.js layer. 1 credit per operation.

**Tech Stack:** fal.ai REST API (BiRefNet, SAM2, Real-ESRGAN), Gemini 2.5 Flash (image editing), Fabric.js, Next.js API routes, Cloudflare R2.

**Design doc:** `docs/plans/2026-03-21-image-editor-ai-design.md`

---

### Task 1: Background Removal API Route

**Files:**
- Create: `app/api/v1/image-editor/remove-bg/route.ts`

**Step 1: Build the endpoint**

`POST /api/v1/image-editor/remove-bg`

Input: `{ image: string }` — base64 data URL of the image

Processing:
1. Auth check (getAuthUserId)
2. Deduct 1 credit (`deduct_credits` with tool_id `'image-editor-remove-bg'`)
3. Handle insufficient credits
4. Upload base64 image to a temporary data URL (fal.ai accepts data URLs)
5. Call fal.ai BiRefNet: `POST https://fal.run/fal-ai/birefnet` with `Authorization: Key ${FAL_API_KEY}` and body `{ image_url: dataUrl, model: "General Use (Heavy)", operating_resolution: "1024x1024" }`
6. Download result image from returned URL
7. Convert to base64 data URL
8. Return `apiSuccess({ image: base64DataUrl })`

Error handling: if fal.ai fails, return error (credit already deducted for MVP).

Import pattern:
```typescript
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
const FAL_API_KEY = process.env.FAL_API_KEY
```

**Step 2: Commit**

```bash
git add app/api/v1/image-editor/remove-bg/route.ts
git commit -m "feat(image-editor-ai): add background removal API via fal.ai BiRefNet"
```

---

### Task 2: Object Segmentation API Route

**Files:**
- Create: `app/api/v1/image-editor/segment/route.ts`

**Step 1: Build the endpoint**

`POST /api/v1/image-editor/segment`

Input: `{ image: string, points: { x: number, y: number }[] }` — image as base64, points as percentages (0-1) of image dimensions

Processing:
1. Auth + credit deduction (tool_id `'image-editor-segment'`)
2. Call fal.ai SAM2: `POST https://fal.run/fal-ai/sam2/image` with body:
```json
{
  "image_url": "<data url>",
  "point_coords": [[x_pixel, y_pixel]],
  "point_labels": [1]
}
```
Note: convert percentage points to pixel coordinates based on image dimensions. Get dimensions by loading the image into a buffer and reading width/height.
3. fal.ai returns masks — use the mask to extract the object from the original image
4. Return both the mask and extracted object as base64

**Step 2: Commit**

```bash
git add app/api/v1/image-editor/segment/route.ts
git commit -m "feat(image-editor-ai): add object segmentation API via fal.ai SAM2"
```

---

### Task 3: Enhancement API Route

**Files:**
- Create: `app/api/v1/image-editor/enhance/route.ts`

**Step 1: Build the endpoint**

`POST /api/v1/image-editor/enhance`

Input: `{ image: string, mode: 'upscale' | 'denoise' | 'restore-faces' }`

Note: 'sharpen' is handled client-side (no API route needed).

Processing:
1. Auth + credit deduction (tool_id `'image-editor-enhance'`)
2. Based on mode:
   - `upscale` / `denoise`: Call fal.ai Real-ESRGAN: `POST https://fal.run/fal-ai/real-esrgan` with `{ image_url: dataUrl, scale: 2 }`
   - `restore-faces`: Call fal.ai GFPGAN: `POST https://fal.run/fal-ai/gfpgan` with `{ image_url: dataUrl }`
3. Download result, convert to base64, return

**Step 2: Commit**

```bash
git add app/api/v1/image-editor/enhance/route.ts
git commit -m "feat(image-editor-ai): add image enhancement API via fal.ai Real-ESRGAN/GFPGAN"
```

---

### Task 4: Inpainting API Route

**Files:**
- Create: `app/api/v1/image-editor/inpaint/route.ts`

**Step 1: Build the endpoint**

`POST /api/v1/image-editor/inpaint`

Input: `{ image: string, mask: string, prompt?: string }`

Processing:
1. Auth + credit deduction (tool_id `'image-editor-inpaint'`)
2. Use Gemini 2.5 Flash with image editing capability:
   - Send the original image as an inline image part
   - Send the mask as a second inline image part
   - Prompt: "Edit this image. The white areas in the second image (mask) should be {prompt || 'filled in naturally to match the surrounding area'}. Keep everything outside the mask exactly the same."
3. Gemini returns an edited image
4. Extract image from response, convert to base64, return

Use `@google/genai` (GoogleGenAI) — the same Nano Banana client already used in illustrate.ts:
```typescript
import { GoogleGenAI } from '@google/genai'
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
```

Generate with `gemini-2.5-flash` model, passing images as inline data parts.

**Step 2: Commit**

```bash
git add app/api/v1/image-editor/inpaint/route.ts
git commit -m "feat(image-editor-ai): add inpainting API via Gemini image editing"
```

---

### Task 5: Generative Fill API Route

**Files:**
- Create: `app/api/v1/image-editor/generative-fill/route.ts`

**Step 1: Build the endpoint**

`POST /api/v1/image-editor/generative-fill`

Input: `{ image: string, mask: string, prompt: string }` — prompt is required

Processing:
1. Auth + credit deduction (tool_id `'image-editor-generative-fill'`)
2. Validate: prompt must be non-empty
3. Use Gemini same as inpaint but with explicit generation prompt:
   - "Edit this image. In the white areas of the mask (second image), generate: {prompt}. Match the style, lighting, and perspective of the original image. Keep everything outside the mask exactly the same."
4. Return result as base64

**Step 2: Commit**

```bash
git add app/api/v1/image-editor/generative-fill/route.ts
git commit -m "feat(image-editor-ai): add generative fill API via Gemini"
```

---

### Task 6: AI Tools Panel Component

**Files:**
- Create: `tools/image-editor/ai-tools-panel.tsx`

**Step 1: Build the AI tools panel**

`'use client'` component.

Props:
```typescript
{
  isReady: boolean                    // is canvas loaded
  onRemoveBg: () => void
  onStartSegment: () => void
  onStartInpaint: () => void
  onStartGenerativeFill: () => void
  onEnhance: (mode: string) => void
  aiProcessing: boolean               // is an AI operation in progress
  aiError: string | null
  onClearError: () => void
}
```

Structure:
- Collapsible section header "AI Tools" with sparkle icon
- When collapsed: just the header
- When expanded: 5 tool cards as full-width buttons:

Each card: left icon + label, right "1 cr" badge. All disabled when `!isReady` or `aiProcessing`.

1. **Remove Background** (wand icon) — onClick: `onRemoveBg()` directly (no sub-panel needed)
2. **Segment Object** (scissors icon) — onClick: `onStartSegment()`, shows instruction text "Click on the object in the image"
3. **Inpaint** (paintbrush icon) — onClick: `onStartInpaint()`, shows sub-panel with:
   - Instruction: "Brush over the area to modify"
   - Brush size slider (10-100, default 30)
   - Prompt input (optional): "What should replace it?"
   - "Inpaint" button + "Cancel" button
4. **Enhance / Recover** (sparkle icon) — onClick shows sub-panel with:
   - Mode radio buttons: Upscale 2x, Denoise, Restore Faces, Sharpen
   - "Enhance" button
   - Note: "Sharpen is free (client-side)"
5. **Generative Fill** (image icon) — onClick: `onStartGenerativeFill()`, shows sub-panel with:
   - Instruction: "Brush the area to fill"
   - Brush size slider (10-100, default 30)
   - Prompt input (required): "Describe what to generate"
   - "Generate" button + "Cancel" button

Auth gate: if not authenticated, show sign-in prompt instead of tools.

Processing state: when `aiProcessing` is true, show spinner overlay on the active tool card.

Error display: if `aiError`, show red alert with dismiss button.

"Back" button in each sub-panel returns to the tool list.

**Step 2: Commit**

```bash
git add tools/image-editor/ai-tools-panel.tsx
git commit -m "feat(image-editor-ai): add AI tools panel component with 5 tool sub-panels"
```

---

### Task 7: Canvas AI Modes (use-fabric-canvas extensions)

**Files:**
- Modify: `tools/image-editor/use-fabric-canvas.ts`

**Step 1: Add AI-related methods to FabricCanvasAPI interface**

Add these new members to the `FabricCanvasAPI` interface:

```typescript
// AI modes
aiMode: 'none' | 'segment-click' | 'brush-mask'
setAiMode: (mode: 'none' | 'segment-click' | 'brush-mask') => void
aiMaskBrushSize: number
setAiMaskBrushSize: (size: number) => void
// AI exports
exportCurrentImage: () => string | null       // canvas as base64 PNG data URL
exportMask: () => string | null               // mask overlay as base64 PNG (black/white)
clearMask: () => void                         // clear the mask overlay
// AI result
addAiResultLayer: (imageDataUrl: string, label: string) => void  // add result as new layer
// Segment click handler
onSegmentClick: React.MutableRefObject<((point: { x: number; y: number }) => void) | null>
```

**Step 2: Implement the AI modes in the hook**

Add state:
```typescript
const [aiMode, setAiMode] = useState<'none' | 'segment-click' | 'brush-mask'>('none')
const [aiMaskBrushSize, setAiMaskBrushSize] = useState(30)
const onSegmentClick = useRef<((point: { x: number; y: number }) => void) | null>(null)
const maskCanvasRef = useRef<HTMLCanvasElement | null>(null)
```

**segment-click mode:**
- When `aiMode === 'segment-click'`, override Fabric.js canvas click handler
- On click: calculate (x, y) as fraction of image dimensions (0-1)
- Call `onSegmentClick.current?.({ x, y })`
- Set cursor to crosshair

**brush-mask mode:**
- Create a secondary canvas overlay (same dimensions as image) for drawing the mask
- Use Fabric.js freeDrawingBrush or a plain 2D canvas overlay
- Brush color: red with 50% opacity (for visual) but export as white-on-black
- `exportMask()`: render the mask canvas as white-on-black PNG data URL
- `clearMask()`: clear the mask canvas

**exportCurrentImage():**
- Export the current Fabric.js canvas as a PNG data URL (without mask overlay)
- Use `canvas.toDataURL('image/png')`

**addAiResultLayer(imageDataUrl, label):**
- Load the data URL as a Fabric.js Image object
- Add it to the canvas as a new layer
- Push to layers state with name = label (e.g. "Background Removed", "Enhanced")
- Save undo history with label

Keep changes minimal — add the new state/methods without refactoring existing code.

**Step 3: Commit**

```bash
git add tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor-ai): add AI canvas modes (segment-click, brush-mask, exportMask, addAiResultLayer)"
```

---

### Task 8: Integrate AI Panel into Adjustments Panel

**Files:**
- Modify: `tools/image-editor/adjustments-panel.tsx`

**Step 1: Add AI Tools section**

Import `AiToolsPanel` and add it as a new collapsible section in the adjustments panel, after the Filters section.

Add new props to `AdjustmentsPanelProps`:
```typescript
// AI Tools
aiReady: boolean
aiProcessing: boolean
aiError: string | null
onRemoveBg: () => void
onStartSegment: () => void
onStartInpaint: () => void
onStartGenerativeFill: () => void
onEnhance: (mode: string) => void
onClearAiError: () => void
```

Render `<AiToolsPanel>` as a new collapsible section (follow the existing pattern for Navigator/Adjustments/Filters sections with disclosure toggle).

**Step 2: Commit**

```bash
git add tools/image-editor/adjustments-panel.tsx
git commit -m "feat(image-editor-ai): integrate AI tools panel into adjustments panel"
```

---

### Task 9: Wire AI Operations in Page Component

**Files:**
- Modify: `app/tools/image-editor/page.tsx`

**Step 1: Add AI state and handlers**

Add to the page component:

State:
```typescript
const [aiProcessing, setAiProcessing] = useState(false)
const [aiError, setAiError] = useState<string | null>(null)
```

Handler functions (each follows the same pattern):

```typescript
async function handleRemoveBg() {
  setAiProcessing(true)
  setAiError(null)
  try {
    const image = fabricCanvas.exportCurrentImage()
    if (!image) throw new Error('No image loaded')
    const res = await fetch('/api/v1/image-editor/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed')
    fabricCanvas.addAiResultLayer(json.data.image, 'Background Removed')
  } catch (err) {
    setAiError(err instanceof Error ? err.message : 'AI operation failed')
  } finally {
    setAiProcessing(false)
  }
}
```

Similar handlers for:
- `handleStartSegment()` — sets `fabricCanvas.setAiMode('segment-click')`, registers `onSegmentClick` callback that calls the segment API
- `handleStartInpaint()` — sets `fabricCanvas.setAiMode('brush-mask')`, the sub-panel's "Inpaint" button exports mask + image + prompt and calls the API
- `handleEnhance(mode)` — if mode is 'sharpen', apply client-side filter. Otherwise call enhance API.
- `handleStartGenerativeFill()` — same as inpaint but with required prompt and different API

Pass all handlers + state to `AdjustmentsPanel` as new props.

**Step 2: Run build**

Run: `pnpm build`
Expected: passes.

**Step 3: Commit**

```bash
git add app/tools/image-editor/page.tsx
git commit -m "feat(image-editor-ai): wire AI operations in page component"
```

---

### Task 10: Build Verification & Deploy

**Step 1: Run full build**

Run: `pnpm build`
Expected: passes with no errors.

**Step 2: Commit any remaining changes and push**

```bash
git add .
git commit -m "feat(image-editor-ai): final cleanup and build verification"
git push origin main
```
