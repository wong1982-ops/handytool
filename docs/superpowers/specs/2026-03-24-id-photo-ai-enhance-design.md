# ID Photo AI Auto-Enhancement — Design Specification

## Overview

One-click AI auto-enhancement for the ID Photo tool. User uploads any reasonable portrait, AI analyzes and fixes brightness, sharpness, contrast, background, face positioning — and optionally generates a front-facing view from angled photos. Manual slider fine-tuning remains available after AI enhancement.

## User Flow

1. User uploads photo (existing flow)
2. Loading overlay: "Enhancing your photo..." with progress animation (up to 30s)
3. AI pipeline runs: analyze → background removal → quality fix → auto-crop
4. Result shown with before/after horizontal drag slider
5. If face rotation needed: inline prompt card ("Fix — 1 credit" / "Skip")
6. User picks ID format → system crops/validates to that standard
7. Manual sliders (brightness, sharpness, contrast) pre-filled with AI values for fine-tuning
8. If photo is rejected: friendly message with tips + "Upload Another"

## Architecture: Sequential Pipeline (Approach A)

### Step 1: Analysis (Gemini, Free)

Send photo to Gemini with structured prompt. Returns JSON:

```json
{
  "face_detected": true,
  "face_angle": { "yaw": 12, "pitch": -3 },
  "face_bounds": { "x": 0.3, "y": 0.15, "width": 0.4, "height": 0.5 },
  "brightness_score": -25,
  "sharpness_score": 45,
  "contrast_score": 55,
  "background_complexity": "cluttered",
  "obstructions": ["glasses"],
  "face_rotation_needed": false,
  "overall_quality": "fixable",
  "reject_reason": null
}
```

- `reject` → show rejection UI with reason + tips
- `fixable` or `good` → proceed to pipeline

### Step 2: Background Removal (Free, Server-side)

- Triggered when `background_complexity` is `cluttered` or `busy`
- Use background removal API (remove.bg or equivalent)
- Replace with solid white (default)
- Skip if background is already clean

### Step 3: Quality Enhancement (Free, Client-side)

- Brightness: target score ~0, calculate delta from `brightness_score`
- Contrast: target score ~60, calculate delta
- Sharpness: if score < 60, apply unsharp mask via canvas
- Values become initial slider positions — user can adjust freely
- No API call, all canvas-based

### Step 4: Face Rotation (1 Credit, Server-side)

- Only when `face_rotation_needed` is true AND `face_angle.yaw` > 15°
- User prompted before execution (inline card with Skip / Fix options)
- Gemini image generation: "Generate front-facing version maintaining exact appearance"
- If confidence low → fall back to rejection with guidance
- Costs 1 credit (deducted via existing credit system)

### Step 5: Auto-Crop & Position (Free, Client-side)

- Use `face_bounds` to center face in frame
- Standard ID positioning: face = 70-80% of frame height, centered
- Set initial transform values (x, y, scale)

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `lib/id-photo/ai-enhance.ts` | Pipeline orchestrator: analyze → background → quality → crop |
| `lib/id-photo/face-rotation.ts` | Gemini image generation for face correction |
| `app/api/v1/id-photo/enhance/route.ts` | POST endpoint for AI enhancement pipeline |
| `app/api/v1/id-photo/face-rotate/route.ts` | POST endpoint for face rotation (auth + credits) |

### Modified Files

| File | Change |
|------|--------|
| `app/tools/id-photo/page.tsx` | Auto-enhance trigger after upload, loading state, before/after slider, rotation prompt card |
| `tools/id-photo/interactive-canvas.tsx` | Accept pre-calculated adjustment values and crop transform from AI |
| `tools/id-photo/adjustments-panel.tsx` | Pre-fill sliders with AI values, "AI Enhanced" indicator badge |

## UI Components

### Loading Overlay
- Gradient progress ring (reuse from Sketch to Art)
- "Enhancing your photo..." heading
- Synthesis phase bar showing progress

### Before/After Slider
- Reuse horizontal drag slider from showcase-gallery.tsx
- "Original" label left, "Enhanced" label right
- "AI Enhanced" badge + "Reset to Original" link below

### Face Rotation Prompt Card
```
┌──────────────────────────────────────┐
│  🔄 Face Angle Correction Available  │
│                                      │
│  Your photo appears slightly angled. │
│  AI can generate a front-facing      │
│  version for better compliance.      │
│                                      │
│  [Skip]          [Fix — 1 credit]    │
└──────────────────────────────────────┘
```

### Rejection State
- Warning icon + specific reason
- 3 tips for a better photo (bulleted)
- "Upload Another" button

## API Design

### POST /api/v1/id-photo/enhance

- **Auth:** Not required (free)
- **Input:** `{ image: string }` (base64 data URL)
- **Output:**
```json
{
  "data": {
    "analysis": { ... },
    "enhancedImageUrl": "https://r2.dev/...",
    "adjustments": { "brightness": 15, "contrast": 8, "sharpness": 20 },
    "cropTransform": { "x": 0, "y": -20, "scale": 1.2 },
    "faceRotationAvailable": false
  }
}
```
- **Errors:** 400 (no face detected), 500 (pipeline failure)
- **Max duration:** 30s

### POST /api/v1/id-photo/face-rotate

- **Auth:** Required
- **Credits:** 1
- **Input:** `{ imageUrl: string, analysis: object }`
- **Output:** `{ data: { rotatedImageUrl: string } }`

## Credit Model

| Operation | Cost |
|-----------|------|
| Analysis (Gemini text) | Free |
| Background removal | Free |
| Brightness/contrast/sharpness | Free |
| Auto-crop positioning | Free |
| Face rotation (Gemini image gen) | 1 credit |
| Object removal (future) | 1 credit |

## Constraints

- Processing time: up to 30s with engaging loading animation
- Quality over speed
- Gemini API key: reuse existing GEMINI_API_KEY / SKETCH_TO_ART_GEMINI_KEY
- R2 storage: enhanced images uploaded to `id-photo/enhanced/{uuid}.png`
- Face rotation is experimental — graceful fallback to rejection
- No new dependencies required
- WCAG 2.1 AA: all new UI elements meet accessibility standards

## Risks

1. **Face rotation quality** — Gemini may alter skin tone, hair, or features. Mitigation: user previews before accepting, can skip.
2. **Background removal accuracy** — edges around hair may be rough. Mitigation: user can pick background color to mask imperfections.
3. **Processing time variability** — Gemini response times fluctuate. Mitigation: engaging loading animation, timeout at 30s with graceful error.
4. **Cost** — Gemini analysis is cheap per call, but at scale could add up. Mitigation: cache analysis results per image hash.

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Sequential pipeline | Single prompt, analysis-only | Best quality, clear credit boundaries, graceful degradation |
| 2 | Gemini for analysis | Face++, face-api.js | Already integrated, structured JSON output |
| 3 | Gemini image gen for rotation | 3D reconstruction, warping | Can "imagine" front view; others distort or too complex |
| 4 | Try rotation → fall back to reject | Always attempt, always reject | Best result when possible, safe fallback |
| 5 | Free basics, credits for advanced | All free, all paid | Drives adoption, monetizes expensive ops |
| 6 | Before/after slider | Instant replace, step-by-step | User verifies improvement, reuses existing component |
| 7 | Pre-fill sliders with AI values | Lock sliders, separate modes | Seamless AI → manual handoff |
| 8 | Separate API routes | Single endpoint | Clean credit gating, optional face rotation |
| 9 | Server pipeline + client adjustments | All server, all client | BG removal needs keys (server), brightness instant (client) |
| 10 | Up to 30s with animation | Fast but limited | Quality over speed |
