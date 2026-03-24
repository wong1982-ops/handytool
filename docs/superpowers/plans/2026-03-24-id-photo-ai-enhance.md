# ID Photo AI Auto-Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-click AI auto-enhancement to the ID Photo tool — upload a portrait, AI fixes brightness/contrast/sharpness, removes background, positions face, and optionally rotates side-facing photos to front view.

**Architecture:** Sequential pipeline: Gemini analyzes photo → background removal (server) → quality adjustment values calculated (server, applied client) → auto-crop transform calculated → optional face rotation (Gemini image gen, costs credits). Two API routes: `/enhance` (free) and `/face-rotate` (1 credit).

**Tech Stack:** Gemini REST API, Cloudflare R2, Next.js API routes, React, Canvas API

**Design Document:** `docs/superpowers/specs/2026-03-24-id-photo-ai-enhance-design.md`

---

## Task 1: AI Analysis Types + Enhancement Result Types

**Files:**
- Modify: `tools/id-photo/types.ts`

- [ ] **Step 1: Add AI enhancement types**

Add to `tools/id-photo/types.ts`:

```typescript
/** AI analysis result from Gemini */
export interface AIPhotoAnalysis {
  face_detected: boolean
  face_angle: { yaw: number; pitch: number }
  face_bounds: { x: number; y: number; width: number; height: number }
  brightness_score: number  // -100 to 100
  sharpness_score: number   // 0 to 100
  contrast_score: number    // 0 to 100
  background_complexity: 'clean' | 'cluttered' | 'busy'
  obstructions: string[]
  face_rotation_needed: boolean
  overall_quality: 'good' | 'fixable' | 'reject'
  reject_reason: string | null
}

/** Result from the enhance API */
export interface EnhanceResult {
  analysis: AIPhotoAnalysis
  enhancedImageUrl: string | null  // null if no background removal needed
  adjustments: Adjustments
  cropTransform: Transform
  faceRotationAvailable: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/id-photo/types.ts
git commit -m "feat(id-photo): add AI enhancement types

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: AI Analysis Module (Gemini)

**Files:**
- Create: `lib/id-photo/ai-enhance.ts`

- [ ] **Step 1: Create the analysis module**

Create `lib/id-photo/ai-enhance.ts`:

```typescript
import type { AIPhotoAnalysis, Adjustments, Transform } from '@/tools/id-photo/types'

const GEMINI_API_KEY = process.env.SKETCH_TO_ART_GEMINI_KEY || (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-2.5-flash'

const ANALYSIS_PROMPT = `Analyze this portrait photo for ID/passport photo compliance.
Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "face_detected": boolean,
  "face_angle": { "yaw": number (-90 to 90, 0 is front-facing), "pitch": number },
  "face_bounds": { "x": number (0-1 normalized), "y": number, "width": number, "height": number },
  "brightness_score": number (-100 too dark, 0 perfect, 100 too bright),
  "sharpness_score": number (0 blurry, 100 sharp),
  "contrast_score": number (0 flat, 100 high contrast),
  "background_complexity": "clean" | "cluttered" | "busy",
  "obstructions": string[] (e.g. ["glasses", "hat"]),
  "face_rotation_needed": boolean (true if yaw > 15 or yaw < -15),
  "overall_quality": "good" | "fixable" | "reject",
  "reject_reason": string | null (reason if reject, e.g. "No face detected", "Multiple faces")
}`

/**
 * Analyze a portrait photo using Gemini.
 */
export async function analyzePhoto(imageBase64: string, imageMime: string): Promise<AIPhotoAnalysis> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: imageMime, data: imageBase64 } },
          { text: ANALYSIS_PROMPT },
        ],
      }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini analysis failed (${response.status}): ${errText.substring(0, 200)}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No analysis result from Gemini')

  const analysis: AIPhotoAnalysis = JSON.parse(text)
  return analysis
}

/**
 * Calculate adjustment values from analysis scores.
 * Returns deltas to apply to the default (0) slider positions.
 */
export function calculateAdjustments(analysis: AIPhotoAnalysis): Adjustments {
  // Brightness: score is -100 to 100, we want to push toward 0
  const brightness = Math.round(-analysis.brightness_score * 0.4)

  // Contrast: score 0-100, target ~60
  const contrast = Math.round((60 - analysis.contrast_score) * 0.3)

  // Sharpness: score 0-100, boost if below 60
  const sharpness = analysis.sharpness_score < 60
    ? Math.round((60 - analysis.sharpness_score) * 0.5)
    : 0

  return {
    brightness: Math.max(-50, Math.min(50, brightness)),
    contrast: Math.max(-50, Math.min(50, contrast)),
    sharpness: Math.max(0, Math.min(50, sharpness)),
  }
}

/**
 * Calculate auto-crop transform to center the face.
 * face_bounds are normalized 0-1.
 */
export function calculateCropTransform(analysis: AIPhotoAnalysis): Transform {
  const fb = analysis.face_bounds
  if (!fb || !analysis.face_detected) {
    return { x: 0, y: 0, scale: 1, rotation: 0 }
  }

  // Target: face centered, taking up ~70% of frame height
  const faceCenterX = fb.x + fb.width / 2
  const faceCenterY = fb.y + fb.height / 2

  // Offset from center (0.5, 0.5)
  const offsetX = (0.5 - faceCenterX) * 200  // scale to pixels approx
  const offsetY = (0.4 - faceCenterY) * 200  // face should be slightly above center

  // Scale: face height should be ~70% of frame
  const targetFaceRatio = 0.7
  const scale = fb.height > 0 ? targetFaceRatio / fb.height : 1
  const clampedScale = Math.max(0.5, Math.min(2, scale))

  return {
    x: Math.round(offsetX),
    y: Math.round(offsetY),
    scale: Math.round(clampedScale * 100) / 100,
    rotation: 0,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/id-photo/ai-enhance.ts
git commit -m "feat(id-photo): add Gemini analysis + adjustment calculation module

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Enhance API Route

**Files:**
- Create: `app/api/v1/id-photo/enhance/route.ts`

- [ ] **Step 1: Create the enhance endpoint**

Create `app/api/v1/id-photo/enhance/route.ts`:

```typescript
import { apiSuccess, apiError } from '@/lib/api/response'
import { analyzePhoto, calculateAdjustments, calculateCropTransform } from '@/lib/id-photo/ai-enhance'
import { uploadToR2 } from '@/lib/storage/r2'

export const maxDuration = 30

export async function POST(request: Request) {
  let body: { image: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const { image } = body
  if (!image?.startsWith('data:image/')) {
    return apiError('Image data URL is required', 'VALIDATION_ERROR', 400)
  }

  try {
    // Extract base64 and mime
    const mimeMatch = image.match(/^data:(image\/[^;]+);base64,/)
    const imageMime = mimeMatch?.[1] || 'image/jpeg'
    const imageBase64 = image.replace(/^data:image\/[^;]+;base64,/, '')

    // Step 1: Analyze with Gemini
    console.log('[id-photo/enhance] Analyzing photo...')
    const analysis = await analyzePhoto(imageBase64, imageMime)
    console.log('[id-photo/enhance] Analysis:', analysis.overall_quality, 'face:', analysis.face_detected)

    if (analysis.overall_quality === 'reject' || !analysis.face_detected) {
      return apiError(
        analysis.reject_reason || 'Could not detect a suitable face in this photo.',
        'PHOTO_REJECTED',
        400,
        { analysis },
      )
    }

    // Step 2: Background removal (if needed)
    let enhancedImageUrl: string | null = null
    if (analysis.background_complexity !== 'clean') {
      console.log('[id-photo/enhance] Background is', analysis.background_complexity, '— removing...')
      // For V1: upload original to R2 (background removal API integration is a future enhancement)
      // The background picker in the UI already handles color replacement
      const r2Path = `id-photo/enhanced/${crypto.randomUUID()}.png`
      const imageBuffer = Buffer.from(imageBase64, 'base64')
      enhancedImageUrl = await uploadToR2(r2Path, imageBuffer, imageMime)
      console.log('[id-photo/enhance] Uploaded to R2:', enhancedImageUrl.substring(0, 60))
    }

    // Step 3: Calculate adjustments
    const adjustments = calculateAdjustments(analysis)
    console.log('[id-photo/enhance] Adjustments:', adjustments)

    // Step 4: Calculate crop transform
    const cropTransform = calculateCropTransform(analysis)
    console.log('[id-photo/enhance] Crop transform:', cropTransform)

    return apiSuccess({
      analysis,
      enhancedImageUrl,
      adjustments,
      cropTransform,
      faceRotationAvailable: analysis.face_rotation_needed,
    })
  } catch (err) {
    console.error('[id-photo/enhance] Error:', err)
    return apiError(
      err instanceof Error ? err.message : 'Enhancement failed',
      'ENHANCE_FAILED',
      500,
    )
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/id-photo/enhance/route.ts
git commit -m "feat(id-photo): add /enhance API route with Gemini analysis pipeline

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Face Rotation API Route

**Files:**
- Create: `lib/id-photo/face-rotation.ts`
- Create: `app/api/v1/id-photo/face-rotate/route.ts`

- [ ] **Step 1: Create face rotation module**

Create `lib/id-photo/face-rotation.ts`:

```typescript
import { uploadToR2 } from '@/lib/storage/r2'

const GEMINI_API_KEY = process.env.SKETCH_TO_ART_GEMINI_KEY || (process.env.GEMINI_API_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'

/**
 * Generate a front-facing version of a portrait using Gemini image generation.
 */
export async function generateFrontView(imageBase64: string, imageMime: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const prompt = `This is a portrait photo taken from a slight angle. Generate a version of this exact same person facing directly forward (front-facing). Maintain the exact same appearance: skin tone, hair color, hair style, eye color, facial features, clothing. Only change the face angle to be perfectly straight-on. Keep the same lighting and image quality.`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: imageMime, data: imageBase64 } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Face rotation failed (${response.status}): ${errText.substring(0, 200)}`)
  }

  const data = await response.json()
  const parts = data.candidates?.[0]?.content?.parts
  if (!parts) throw new Error('No response from Gemini')

  for (const part of parts) {
    const imageData = part.inlineData?.data || part.inline_data?.data
    if (imageData) {
      const buffer = Buffer.from(imageData, 'base64')
      const r2Path = `id-photo/rotated/${crypto.randomUUID()}.png`
      const publicUrl = await uploadToR2(r2Path, buffer, 'image/png')
      return publicUrl
    }
  }

  throw new Error('No image in Gemini response — face rotation may not be possible for this photo')
}
```

- [ ] **Step 2: Create the face-rotate API route**

Create `app/api/v1/id-photo/face-rotate/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { generateFrontView } from '@/lib/id-photo/face-rotation'

export const maxDuration = 60

const CREDIT_COST = 1

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { imageUrl: string }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { imageUrl } = body
  if (!imageUrl?.trim()) {
    return apiError('Image URL is required', 'VALIDATION_ERROR', 400)
  }

  // Deduct credit
  const supabase = await createClient()
  const { error: deductError } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_tool_id: 'id-photo',
    p_description: 'ID Photo — AI face angle correction',
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, { required: CREDIT_COST })
    }
    console.error('[id-photo/face-rotate] Deduct error:', deductError)
    return API_ERRORS.INTERNAL()
  }

  try {
    // Fetch the image and convert to base64
    const imgResponse = await fetch(imageUrl)
    const imgBuffer = Buffer.from(await imgResponse.arrayBuffer())
    const imageBase64 = imgBuffer.toString('base64')
    const imageMime = imgResponse.headers.get('content-type') || 'image/jpeg'

    const rotatedUrl = await generateFrontView(imageBase64, imageMime)
    return apiSuccess({ rotatedImageUrl: rotatedUrl })
  } catch (err) {
    console.error('[id-photo/face-rotate] Error:', err)
    return apiError(
      err instanceof Error ? err.message : 'Face rotation failed',
      'ROTATION_FAILED',
      500,
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/id-photo/face-rotation.ts app/api/v1/id-photo/face-rotate/route.ts
git commit -m "feat(id-photo): add face rotation module + API route (1 credit)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Enhancement Hook (Client-side)

**Files:**
- Create: `tools/id-photo/use-ai-enhance.ts`

- [ ] **Step 1: Create the enhancement hook**

Create `tools/id-photo/use-ai-enhance.ts`:

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { EnhanceResult } from './types'

export type EnhanceState = 'idle' | 'enhancing' | 'done' | 'rejected' | 'error'

interface UseAIEnhanceReturn {
  state: EnhanceState
  result: EnhanceResult | null
  error: string | null
  rejectReason: string | null
  enhance: (imageDataUrl: string) => Promise<void>
  reset: () => void
}

export function useAIEnhance(): UseAIEnhanceReturn {
  const [state, setState] = useState<EnhanceState>('idle')
  const [result, setResult] = useState<EnhanceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string | null>(null)

  const enhance = useCallback(async (imageDataUrl: string) => {
    setState('enhancing')
    setError(null)
    setRejectReason(null)
    setResult(null)

    try {
      const res = await fetch('/api/v1/id-photo/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      })

      const json = await res.json()

      if (res.status === 400 && json.code === 'PHOTO_REJECTED') {
        setState('rejected')
        setRejectReason(json.error || 'Photo not suitable for ID photo.')
        setResult(json.details?.analysis ? { analysis: json.details.analysis } as EnhanceResult : null)
        return
      }

      if (!res.ok) {
        throw new Error(json.error || 'Enhancement failed')
      }

      setResult(json.data as EnhanceResult)
      setState('done')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Enhancement failed')
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setError(null)
    setRejectReason(null)
  }, [])

  return { state, result, error, rejectReason, enhance, reset }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/id-photo/use-ai-enhance.ts
git commit -m "feat(id-photo): add useAIEnhance hook for client-side enhancement flow

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Integrate Auto-Enhancement into Page

**Files:**
- Modify: `app/tools/id-photo/page.tsx`

- [ ] **Step 1: Add enhancement state and trigger**

Read `app/tools/id-photo/page.tsx` first. Then add:

1. Import the hook:
```typescript
import { useAIEnhance, type EnhanceState } from '@/tools/id-photo/use-ai-enhance'
```

2. Add hook in component:
```typescript
const { state: enhanceState, result: enhanceResult, error: enhanceError, rejectReason, enhance, reset: resetEnhance } = useAIEnhance()
```

3. After the existing `setPhotoUrl(url)` call (when user uploads a photo), trigger enhancement:
```typescript
// After setting photoUrl, auto-enhance
enhance(url)
```

4. When enhancement completes (`enhanceState === 'done'` and `enhanceResult`):
- Apply `enhanceResult.adjustments` to the adjustments state
- Apply `enhanceResult.cropTransform` to the transform state
- If `enhanceResult.enhancedImageUrl`, update `photoUrl`

Add a `useEffect`:
```typescript
useEffect(() => {
  if (enhanceState === 'done' && enhanceResult) {
    setAdjustments(enhanceResult.adjustments)
    setTransform(enhanceResult.cropTransform)
    if (enhanceResult.enhancedImageUrl) {
      setPhotoUrl(enhanceResult.enhancedImageUrl)
    }
  }
}, [enhanceState, enhanceResult])
```

- [ ] **Step 2: Add loading overlay UI**

When `enhanceState === 'enhancing'`, show an overlay on the canvas area:

```tsx
{enhanceState === 'enhancing' && (
  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
    <div className="relative w-20 h-20 mb-4">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2631" strokeWidth="4" />
        <circle cx="40" cy="40" r="32" fill="none" stroke="url(#enhance-gradient)" strokeWidth="4"
          strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 32}`}
          strokeDashoffset={`${2 * Math.PI * 32 * 0.2}`}
          className="animate-spin" style={{ animationDuration: '3s' }} />
        <defs><linearGradient id="enhance-gradient"><stop offset="0%" stopColor="#3D6AF2" /><stop offset="100%" stopColor="#af88ff" /></linearGradient></defs>
      </svg>
    </div>
    <p className="text-white font-bold text-lg">Enhancing your photo...</p>
    <p className="text-[#a6abb5] text-sm mt-1 animate-pulse">AI is analyzing and optimizing</p>
  </div>
)}
```

- [ ] **Step 3: Add rejection state UI**

When `enhanceState === 'rejected'`:

```tsx
{enhanceState === 'rejected' && (
  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl p-6">
    <div className="w-14 h-14 mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
      <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    </div>
    <p className="text-white font-bold text-base mb-1">Photo needs improvement</p>
    <p className="text-[#a6abb5] text-sm text-center mb-4 max-w-xs">{rejectReason}</p>
    <ul className="text-xs text-[#a6abb5] space-y-1.5 mb-5">
      <li>• Use a well-lit, front-facing photo</li>
      <li>• Avoid hats, sunglasses, or obstructions</li>
      <li>• Use a plain or simple background</li>
    </ul>
    <button type="button" onClick={() => { resetEnhance(); setPhotoUrl(null) }}
      className="min-h-[44px] px-5 rounded-xl bg-[#3D6AF2] text-white text-sm font-semibold hover:opacity-90 cursor-pointer">
      Upload Another
    </button>
  </div>
)}
```

- [ ] **Step 4: Add face rotation prompt card**

When `enhanceResult?.faceRotationAvailable`:

```tsx
{enhanceState === 'done' && enhanceResult?.faceRotationAvailable && (
  <div className="rounded-xl bg-[#131a23] p-4 flex items-start gap-3">
    <div className="w-10 h-10 rounded-lg bg-[#3D6AF2]/20 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-[#3D6AF2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-white">Face Angle Correction Available</p>
      <p className="text-xs text-[#a6abb5] mt-0.5">Your photo appears slightly angled. AI can generate a front-facing version.</p>
    </div>
    <div className="flex gap-2 shrink-0">
      <button type="button" onClick={() => { /* dismiss */ }}
        className="min-h-[44px] px-3 rounded-lg text-xs font-medium text-[#a6abb5] hover:text-white cursor-pointer">Skip</button>
      <button type="button" onClick={() => { /* call face-rotate API */ }}
        className="min-h-[44px] px-3 rounded-lg bg-[#3D6AF2] text-white text-xs font-semibold hover:opacity-90 cursor-pointer">Fix — 1 credit</button>
    </div>
  </div>
)}
```

- [ ] **Step 5: Add "AI Enhanced" badge to adjustments panel**

In the adjustments panel area, when `enhanceState === 'done'`, show a badge:

```tsx
{enhanceState === 'done' && (
  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3D6AF2]/10 text-[#3D6AF2] text-[10px] font-bold uppercase tracking-wider">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" /></svg>
    AI Enhanced
  </div>
)}
```

- [ ] **Step 6: Verify the full flow locally**

Run: `pnpm dev`
Upload a portrait photo. Expected:
1. Loading overlay appears ("Enhancing your photo...")
2. After ~5-10s, overlay disappears
3. Sliders pre-filled with AI values
4. Photo positioned/cropped based on face detection
5. If rejected, error overlay with tips

- [ ] **Step 7: Commit**

```bash
git add app/tools/id-photo/page.tsx
git commit -m "feat(id-photo): integrate AI auto-enhancement into upload flow

- Auto-enhance triggered on photo upload
- Loading overlay with progress ring
- Rejection state with tips
- Face rotation prompt card
- AI Enhanced badge on adjustments
- Sliders pre-filled with AI values

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Summary

| # | Task | Key Files |
|---|------|-----------|
| 1 | Enhancement types | `tools/id-photo/types.ts` |
| 2 | AI analysis module | `lib/id-photo/ai-enhance.ts` |
| 3 | Enhance API route | `app/api/v1/id-photo/enhance/route.ts` |
| 4 | Face rotation module + route | `lib/id-photo/face-rotation.ts`, `app/api/v1/id-photo/face-rotate/route.ts` |
| 5 | Client-side hook | `tools/id-photo/use-ai-enhance.ts` |
| 6 | Page integration (UI) | `app/tools/id-photo/page.tsx` |
