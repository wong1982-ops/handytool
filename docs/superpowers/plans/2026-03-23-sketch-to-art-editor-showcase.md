# Sketch to Art — Image Editor & Showcase Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inline crop/rotate/pan/zoom editing at Step 1 and Step 5 of the sketch-to-art wizard, plus a hero showcase gallery showing one mermaid sketch across all 18 art styles.

**Architecture:** New `ImageEditor` component wrapping `react-easy-crop` with crop output pipeline. New `ShowcaseGallery` hero with pre-generated static R2 images and lightbox. Both integrate into the existing 5-step wizard page.

**Tech Stack:** React 19, Next.js 16, react-easy-crop, Tailwind CSS v4, Cloudflare R2

**Design Document:** `docs/superpowers/specs/2026-03-23-sketch-to-art-editor-showcase-design.md`

---

## Task 1: Install react-easy-crop

**Files:**
- Modify: `package.json`

Note: Keep `react-image-crop` installed — it's actively used by `tools/svg-converter/crop-resize-editor.tsx`.

- [ ] **Step 1: Add react-easy-crop**

Run: `pnpm add react-easy-crop`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: replace react-image-crop with react-easy-crop"
```

---

## Task 2: Extract resizeImage Utility

The `resizeImage` function in `sketch-input.tsx` needs to be shared with the new `ImageEditor` component. Extract it to a utility file.

**Files:**
- Create: `tools/sketch-to-art/image-utils.ts`
- Modify: `tools/sketch-to-art/sketch-input.tsx`

- [ ] **Step 1: Create the utility file**

Create `tools/sketch-to-art/image-utils.ts`:

```typescript
const MAX_DIMENSION = 768
const MAX_PAYLOAD_BYTES = 3 * 1024 * 1024 // 3MB max base64 payload
const MIN_EDITOR_DIMENSION = 256

/**
 * Resize and compress image for API payload.
 * - Max 768px on longest side
 * - JPEG at 0.7 quality (much smaller than PNG for photos)
 * - If still too large, reduce quality further
 */
export function resizeImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height

      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const scale = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)

      for (const quality of [0.7, 0.5, 0.3]) {
        const result = canvas.toDataURL('image/jpeg', quality)
        if (result.length < MAX_PAYLOAD_BYTES) {
          resolve(result)
          return
        }
      }

      resolve(canvas.toDataURL('image/jpeg', 0.2))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

/**
 * Get image dimensions from a data URL.
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Check if an image is large enough to benefit from the editor.
 */
export function isEditorEligible(width: number, height: number): boolean {
  return width >= MIN_EDITOR_DIMENSION && height >= MIN_EDITOR_DIMENSION
}

/**
 * Create a cropped canvas from source image with rotation applied.
 * Used by ImageEditor to produce the final output.
 */
export function getCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation: number = 0,
  _retried: boolean = false,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      const radians = (rotation * Math.PI) / 180
      const sin = Math.abs(Math.sin(radians))
      const cos = Math.abs(Math.cos(radians))

      // Compute bounding box of rotated source
      const bBoxWidth = img.width * cos + img.height * sin
      const bBoxHeight = img.width * sin + img.height * cos

      // Set canvas to crop size
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height

      // Translate so rotation pivot is correct, then draw
      ctx.save()
      ctx.translate(-pixelCrop.x, -pixelCrop.y)
      ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
      ctx.rotate(radians)
      ctx.translate(-img.width / 2, -img.height / 2)
      ctx.drawImage(img, 0, 0)
      ctx.restore()

      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      if (_retried) {
        reject(new Error('Failed to load image for cropping'))
        return
      }
      // CORS fallback: fetch as blob
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob)
          getCroppedImage(objectUrl, pixelCrop, rotation, true).then((result) => {
            URL.revokeObjectURL(objectUrl)
            resolve(result)
          })
        })
        .catch(reject)
    }
    img.src = imageSrc
  })
}
```

- [ ] **Step 2: Update sketch-input.tsx to import from utility**

In `tools/sketch-to-art/sketch-input.tsx`, remove the local `resizeImage` function (lines 23-58) and replace with:

```typescript
import { resizeImage } from './image-utils'
```

Also remove the local constants `MAX_DIMENSION` and `MAX_PAYLOAD_BYTES` (lines 14-15) since they're now in the utility.

- [ ] **Step 3: Verify dev server still works**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/sketch-to-art`
Expected: Upload still works, preview still shows.

- [ ] **Step 4: Commit**

```bash
git add tools/sketch-to-art/image-utils.ts tools/sketch-to-art/sketch-input.tsx
git commit -m "refactor(sketch-to-art): extract resizeImage and crop utils to shared module"
```

---

## Task 3: Create ImageEditor Component

**Files:**
- Create: `tools/sketch-to-art/image-editor.tsx`

- [ ] **Step 1: Create the component**

Create `tools/sketch-to-art/image-editor.tsx`:

```tsx
'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import type { SketchMode } from './types'
import { getCroppedImage, resizeImage } from './image-utils'

interface ImageEditorProps {
  src: string
  onComplete: (editedDataUrl: string) => void
  onCancel?: () => void
  mode: SketchMode
  initialAspect?: number
  applyLabel?: string  // default: "Use this sketch"
}

const MIN_CROP_PX = 128

const ASPECT_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
]

export default function ImageEditor({
  src,
  onComplete,
  onCancel,
  mode,
  initialAspect,
  applyLabel,
}: ImageEditorProps) {
  const isFun = mode === 'fun'
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(initialAspect)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels) return

    // Validate minimum crop size
    if (croppedAreaPixels.width < MIN_CROP_PX || croppedAreaPixels.height < MIN_CROP_PX) {
      setError(`Crop area too small (min ${MIN_CROP_PX}x${MIN_CROP_PX}px)`)
      return
    }

    setError(null)
    setProcessing(true)
    try {
      const cropped = await getCroppedImage(src, croppedAreaPixels, rotation)
      const resized = await resizeImage(cropped)
      onComplete(resized)
    } catch (err) {
      setError('Failed to process image')
      console.error('ImageEditor crop error:', err)
    } finally {
      setProcessing(false)
    }
  }, [croppedAreaPixels, rotation, src, onComplete])

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setAspect(initialAspect)
    setError(null)
  }, [initialAspect])

  return (
    <div className="flex flex-col gap-3 w-full max-w-[512px] mx-auto">
      {/* Aspect ratio pills */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {ASPECT_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setAspect(opt.value)}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              aspect === opt.value
                ? 'bg-[var(--tk-color-primary-500)] text-white'
                : 'bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Crop area */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: '0.75rem' },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs text-[var(--tk-color-text-tertiary)]">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full accent-[var(--tk-color-primary-500)]"
          aria-label="Zoom level"
        />
      </div>

      {/* Rotate + Reset controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setRotation((r) => r - 90)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] transition-colors"
          aria-label="Rotate left"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l3 3-3 3" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="min-h-[44px] px-4 rounded-lg bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-xs font-medium text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setRotation((r) => r + 90)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] transition-colors"
          aria-label="Rotate right"
        >
          <svg className="w-5 h-5 scale-x-[-1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l3 3-3 3" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-center text-[var(--tk-color-error-500)]">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] flex-1 rounded-xl font-medium bg-[var(--tk-color-surface-200)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-300)] dark:hover:bg-[var(--tk-color-surface-600)] transition-colors"
          >
            {isFun ? 'Try Again' : 'Change'}
          </button>
        )}
        <button
          type="button"
          onClick={handleApply}
          disabled={processing}
          className={`min-h-[44px] flex-1 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isFun
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-lg'
              : 'bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)]'
          }`}
        >
          {processing ? 'Processing...' : applyLabel || (isFun ? 'Use this sketch' : 'Use this sketch')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm dev`
Expected: No build errors. Component not yet wired into the page.

- [ ] **Step 3: Commit**

```bash
git add tools/sketch-to-art/image-editor.tsx
git commit -m "feat(sketch-to-art): add ImageEditor component with crop/rotate/pan/zoom"
```

---

## Task 4: Integrate ImageEditor into Step 1 (sketch-input.tsx)

**Files:**
- Modify: `tools/sketch-to-art/sketch-input.tsx`

- [ ] **Step 1: Add dynamic import and dimension check**

At the top of `sketch-input.tsx`, add:

```typescript
import dynamic from 'next/dynamic'
import { getImageDimensions, isEditorEligible } from './image-utils'

const ImageEditor = dynamic(() => import('./image-editor'), { ssr: false })
```

Add state for editor eligibility and raw preview:

```typescript
const [editorEligible, setEditorEligible] = useState(false)
const [rawPreview, setRawPreview] = useState<string | null>(null) // un-resized, for editor
```

- [ ] **Step 2: Check original dimensions BEFORE resize, store raw for editor**

In the `processFile` callback, before `resizeImage`, check the original dimensions:

```typescript
reader.onload = async (e) => {
  const result = e.target?.result as string
  // Check original dimensions for editor eligibility
  const dims = await getImageDimensions(result)
  const eligible = isEditorEligible(dims.width, dims.height)
  setEditorEligible(eligible)
  if (eligible) {
    setRawPreview(result) // Store raw for editor (resized in crop pipeline)
    setPreview(result)    // Also set preview to show editor
  } else {
    const resized = await resizeImage(result)
    setPreview(resized)   // Small image: show plain preview
  }
}
```

Do the same in the camera `capturePhoto` callback.

- [ ] **Step 3: Replace `<img>` preview with conditional ImageEditor**

Replace the preview section (`{preview && (...)}` block, lines 346-376) with:

```tsx
{preview && (
  <div className="flex flex-col items-center gap-4">
    {editorEligible && rawPreview ? (
      <ImageEditor
        src={rawPreview}
        onComplete={(edited) => onSketchReady(edited)}
        onCancel={handleClearPreview}
        mode={mode}
      />
    ) : (
      /* Existing plain preview for small images */
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full max-w-[512px]">
          <img
            src={preview}
            alt="Sketch preview"
            className="w-full aspect-square rounded-xl object-contain border-2 border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] bg-white"
          />
        </div>
        <div className="flex gap-2 w-full max-w-[512px]">
          <button type="button" className="min-h-[44px] flex-1 rounded-xl font-medium bg-[var(--tk-color-surface-200)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-300)] dark:hover:bg-[var(--tk-color-surface-600)] transition-colors" onClick={handleClearPreview}>
            {isFun ? 'Try Again' : 'Change'}
          </button>
          <button type="button" className={`min-h-[44px] flex-1 rounded-xl font-semibold text-white transition-all ${isFun ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-lg' : 'bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)]'}`} onClick={handleUseSketch}>
            {isFun ? 'Use this sketch' : 'Use this sketch'}
          </button>
        </div>
      </div>
    )}
  </div>
)}
```

Note: When `ImageEditor` is shown, the "Use this sketch" and "Try Again" buttons are handled by the editor's `onComplete` and `onCancel` props — no separate buttons needed.

- [ ] **Step 4: Remove the old handleUseSketch usage for editor-eligible images**

The `handleUseSketch` function is still needed for the small-image fallback path. No changes needed to it.

- [ ] **Step 5: Verify Step 1 flow**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/sketch-to-art`
Upload a large image (e.g., `~/Downloads/test.jpeg`):
- Expected: ImageEditor appears with crop handles, aspect ratio pills, rotate buttons, zoom slider
- Crop the image, click "Use this sketch" → should advance to Step 2

Upload a tiny image (<256px):
- Expected: Plain preview with simple buttons (old behavior)

- [ ] **Step 6: Commit**

```bash
git add tools/sketch-to-art/sketch-input.tsx
git commit -m "feat(sketch-to-art): integrate ImageEditor into Step 1 upload preview"
```

---

## Task 5: Integrate ImageEditor into Step 5 (save-share.tsx)

**Files:**
- Modify: `tools/sketch-to-art/save-share.tsx`

- [ ] **Step 1: Add dynamic import and edited state**

At the top of `save-share.tsx`, add:

```typescript
import dynamic from 'next/dynamic'

const ImageEditor = dynamic(() => import('./image-editor'), { ssr: false })
```

Inside the component, add state:

```typescript
const [editedUrl, setEditedUrl] = useState<string | null>(null)
const [editing, setEditing] = useState(false)
const activeUrl = editedUrl || finalImage.imageUrl
```

- [ ] **Step 2: Add edit toggle to the Image display**

Replace the "Final image" section (lines 118-129) with:

```tsx
{/* Final image with optional editor */}
<div className="mx-auto w-full max-w-lg">
  {editing ? (
    <>
      <ImageEditor
        src={finalImage.imageUrl}
        onComplete={(edited) => {
          setEditedUrl(edited)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
        mode={mode}
      />
    </>
  ) : (
    <>
      <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg">
        <Image
          src={activeUrl}
          alt="Final artwork"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 512px"
          priority
        />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] px-4 py-2 text-sm font-medium text-[var(--tk-color-text-primary)] transition-colors hover:bg-[var(--tk-color-surface-100)] dark:hover:bg-[var(--tk-color-surface-700)]"
        >
          {isFun ? 'Crop / Rotate' : 'Edit'}
        </button>
        {editedUrl && (
          <button
            type="button"
            onClick={() => setEditedUrl(null)}
            className="min-h-[44px] px-4 rounded-xl text-xs text-[var(--tk-color-text-tertiary)] hover:text-[var(--tk-color-text-secondary)] transition-colors"
          >
            Reset to original
          </button>
        )}
      </div>
    </>
  )}
</div>
```

Note: The `ImageEditor` button label at Step 5 should say "Apply" instead of "Use this sketch". Add an optional `applyLabel` prop to `ImageEditor` and pass `applyLabel="Apply"` from save-share. Update the ImageEditor component in Task 3 to accept this prop.

- [ ] **Step 3: Update download/share/publish to use activeUrl**

Replace all references to `finalImage.imageUrl` in the action handlers with `activeUrl`:

- `handleDownload`: `fetch(activeUrl)` instead of `fetch(finalImage.imageUrl)`
- `handleCopyLink`: `navigator.clipboard.writeText(activeUrl)`
- `handleShareX`: `encodeURIComponent(activeUrl)`
- `handleShareLinkedIn`: `encodeURIComponent(activeUrl)`
- `handlePublish`: `resultImageUrl: activeUrl`

Update the dependency arrays of these `useCallback` hooks to include `activeUrl` instead of `finalImage.imageUrl`.

- [ ] **Step 4: Verify Step 5 flow**

Run: `pnpm dev`
Navigate through the full wizard to Step 5 (generate art, select variation, skip refinement).
Expected: ImageEditor appears on the final artwork. Crop/rotate, then download — downloaded image should be the edited version.

- [ ] **Step 5: Commit**

```bash
git add tools/sketch-to-art/save-share.tsx
git commit -m "feat(sketch-to-art): integrate ImageEditor into Step 5 save/share"
```

---

## Task 6: Generate Showcase Images Script

Create a Node.js script that generates all 18 art styles from a mermaid sketch and uploads them to R2.

**Files:**
- Create: `scripts/generate-showcase.ts`

- [ ] **Step 1: Create the generation script**

Create `scripts/generate-showcase.ts`:

```typescript
/**
 * Generate showcase images for Sketch to Art hero gallery.
 * Uses the same Gemini API + R2 upload as the production route.
 *
 * Usage: npx tsx scripts/generate-showcase.ts <sketch-path>
 * Example: npx tsx scripts/generate-showcase.ts ~/Downloads/mermaid-sketch.png
 *
 * Requires: GEMINI_API_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local
 */
import * as fs from 'fs'
import * as path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Load .env.local
import 'dotenv/config'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-3.1-flash-image-preview'
const R2_ACCOUNT_ID = (process.env.R2_ACCOUNT_ID || '').replace(/[^\x20-\x7E]/g, '').trim()
const R2_ACCESS_KEY_ID = (process.env.R2_ACCESS_KEY_ID || '').replace(/[^\x20-\x7E]/g, '').trim()
const R2_SECRET_ACCESS_KEY = (process.env.R2_SECRET_ACCESS_KEY || '').replace(/[^\x20-\x7E]/g, '').trim()
const R2_BUCKET = process.env.R2_BUCKET || 'story-assets'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev'

const ART_STYLES = [
  { id: 'watercolor', name: 'Watercolor' },
  { id: 'oil-painting', name: 'Oil Painting' },
  { id: 'impressionist', name: 'Impressionist' },
  { id: 'van-gogh', name: 'Van Gogh' },
  { id: 'picasso', name: 'Picasso' },
  { id: 'chalk-pastel', name: 'Chalk / Pastel' },
  { id: 'cartoon', name: 'Cartoon' },
  { id: 'anime', name: 'Anime / Manga' },
  { id: 'pixel-art', name: 'Pixel Art' },
  { id: '3d-render', name: '3D Render' },
  { id: 'comic-book', name: 'Comic Book' },
  { id: 'pop-art', name: 'Pop Art' },
  { id: 'ghibli', name: 'Studio Ghibli' },
  { id: 'stained-glass', name: 'Stained Glass' },
  { id: 'steampunk', name: 'Steampunk' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'claymation', name: 'Claymation' },
  { id: 'fantasy', name: 'Fantasy Illustration' },
]

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

async function callGemini(sketchBase64: string, mime: string, prompt: string): Promise<Buffer> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inline_data: { mime_type: mime, data: sketchBase64 } },
        { text: prompt },
      ] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).substring(0, 200)}`)
  const data = await res.json()
  const parts = data.candidates?.[0]?.content?.parts || []
  for (const part of parts) {
    const imgData = part.inlineData?.data || part.inline_data?.data
    if (imgData) return Buffer.from(imgData, 'base64')
  }
  throw new Error('No image in response')
}

async function main() {
  const sketchPath = process.argv[2]
  if (!sketchPath) {
    console.error('Usage: npx tsx scripts/generate-showcase.ts <sketch-path>')
    process.exit(1)
  }

  const absPath = path.resolve(sketchPath)
  const ext = path.extname(absPath).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
  const sketchBase64 = fs.readFileSync(absPath).toString('base64')

  // Upload original sketch
  const originalKey = 'sketch-art/showcase/mermaid-original.png'
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET, Key: originalKey,
    Body: fs.readFileSync(absPath), ContentType: mime,
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  console.log(`Original: ${R2_PUBLIC_URL}/${originalKey}`)

  // Generate each style
  const results: Record<string, string> = { original: `${R2_PUBLIC_URL}/${originalKey}` }

  for (const style of ART_STYLES) {
    console.log(`Generating ${style.name}...`)
    try {
      const prompt = `Transform this sketch into beautiful ${style.name} art. Maintain the original composition and subjects but elevate it with professional ${style.name} artistic quality. Make it vibrant and visually stunning.`
      const buf = await callGemini(sketchBase64, mime, prompt)
      const key = `sketch-art/showcase/mermaid-${style.id}.png`
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET, Key: key,
        Body: buf, ContentType: 'image/png',
        CacheControl: 'public, max-age=31536000, immutable',
      }))
      results[style.id] = `${R2_PUBLIC_URL}/${key}`
      console.log(`  OK: ${results[style.id]}`)
    } catch (err) {
      console.error(`  FAILED: ${err instanceof Error ? err.message : err}`)
    }
    // Rate limit: wait 2s between calls
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log('\n=== SHOWCASE URLS ===')
  console.log(JSON.stringify(results, null, 2))
}

main().catch(console.error)
```

- [ ] **Step 2: Run the script with a mermaid sketch**

Find or draw a mermaid sketch, then run:
```bash
npx tsx scripts/generate-showcase.ts ~/Downloads/mermaid-sketch.png
```

Expected: Generates 18 styled images + uploads to R2. Outputs JSON with all URLs.

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-showcase.ts
git commit -m "feat(sketch-to-art): add showcase image generation script"
```

---

## Task 7: Create Showcase Gallery Component

**Files:**
- Create: `tools/sketch-to-art/showcase-gallery.tsx`

- [ ] **Step 1: Create the component**

Create `tools/sketch-to-art/showcase-gallery.tsx` using the URLs generated by Task 6. The component includes:
- Hero heading + subheading
- Original sketch (center, larger)
- 18-tile masonry grid with style labels
- Lightbox dialog with before/after + keyboard nav (Escape, Left/Right arrows)
- CTA button that scrolls to wizard
- Skeleton loading + error fallback using style gradient cards
- Lazy-loaded images with `loading="lazy"`

The component should use `ART_STYLES` from `./types` for labels and gradient fallbacks.

**Props:**
```typescript
interface ShowcaseGalleryProps {
  mode: SketchMode
}
```

Hardcode the R2 URLs as a constant map:
```typescript
const SHOWCASE_BASE = 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev/sketch-art/showcase'
const SHOWCASE_URLS: Record<string, string> = {
  original: `${SHOWCASE_BASE}/mermaid-original.png`,
  // ... one entry per style.id from ART_STYLES
}
```

- [ ] **Step 2: Verify it renders standalone**

Temporarily add it to the page to verify rendering. Will be properly wired in Task 8.

- [ ] **Step 3: Commit**

```bash
git add tools/sketch-to-art/showcase-gallery.tsx
git commit -m "feat(sketch-to-art): add showcase gallery hero with lightbox"
```

---

## Task 8: Wire Showcase Gallery into Page

**Files:**
- Modify: `app/tools/sketch-to-art/page.tsx`

- [ ] **Step 1: Import and render ShowcaseGallery**

Add import:
```typescript
import ShowcaseGallery from '@/tools/sketch-to-art/showcase-gallery'
```

Add a `div` with `id="wizard"` and `scroll-margin-top: 80px` around the wizard section so the CTA can scroll to it.

Render `<ShowcaseGallery mode={mode} />` above the wizard, conditionally:
```tsx
{state.step === 1 && !state.sketchDataUrl && (
  <ShowcaseGallery mode={mode} />
)}
```

- [ ] **Step 2: Verify the full page**

Run: `pnpm dev`
Navigate to: `http://localhost:3000/tools/sketch-to-art`
Expected:
- Showcase gallery visible above the wizard at Step 1
- Click a tile → lightbox opens with before/after
- Left/Right arrows navigate styles, Escape closes
- "Try it with your own sketch" scrolls to wizard
- Upload an image → showcase disappears
- Click "Start Over" → showcase reappears

- [ ] **Step 3: Commit**

```bash
git add app/tools/sketch-to-art/page.tsx
git commit -m "feat(sketch-to-art): wire showcase gallery into page with visibility logic"
```

---

## Summary

| # | Task | Key Files |
|---|------|-----------|
| 1 | Swap dependencies | `package.json` |
| 2 | Extract image utils | `tools/sketch-to-art/image-utils.ts`, `sketch-input.tsx` |
| 3 | ImageEditor component | `tools/sketch-to-art/image-editor.tsx` |
| 4 | Integrate into Step 1 | `tools/sketch-to-art/sketch-input.tsx` |
| 5 | Integrate into Step 5 | `tools/sketch-to-art/save-share.tsx` |
| 6 | Generate showcase images | `scripts/generate-showcase.ts` |
| 7 | Showcase gallery component | `tools/sketch-to-art/showcase-gallery.tsx` |
| 8 | Wire gallery into page | `app/tools/sketch-to-art/page.tsx` |
