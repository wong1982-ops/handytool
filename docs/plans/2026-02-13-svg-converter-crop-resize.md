# SVG Converter — Registry + Crop/Resize Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Register SVG Converter in the tool registry and add an inline crop/resize step before vectorization.

**Architecture:** After image upload, a new `CropResizeEditor` component (using `react-image-crop`) displays inline in the canvas area. The user crops/resizes, then clicks "Continue to Vectorize". A new `editorPhase` state machine (`upload → crop → vectorize`) controls which view renders. Only the processed image is sent to `useSvgTracer`.

**Tech Stack:** React 19, Next.js 16, react-image-crop, HTML5 Canvas (for applying crop), TypeScript strict

---

### Task 1: Add SVG Converter to tool registry

**Files:**
- Modify: `toolk1t-client/lib/tools.tsx:100-111` (insert after Image Editor entry, before Currency Exchange)

**Step 1: Add the entry**

Insert after the Image Editor object (line 99) and before Currency Exchange:

```tsx
  {
    name: 'SVG Converter',
    href: '/tools/svg-converter',
    description: 'Convert raster images to vector SVG',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    color: 'from-teal-500 to-cyan-400',
  },
```

**Step 2: Verify in browser**

Open http://localhost:3000/tools — confirm SVG Converter card appears after Image Editor. Check the mega menu and search bar autocomplete.

**Step 3: Commit**

```bash
git add toolk1t-client/lib/tools.tsx
git commit -m "feat(svg-converter): add to tool registry"
```

---

### Task 2: Install react-image-crop

**Files:**
- Modify: `toolk1t-client/package.json` (via pnpm)

**Step 1: Install the package**

```bash
cd toolk1t-client && pnpm add react-image-crop
```

**Step 2: Verify install**

```bash
ls node_modules/react-image-crop/dist
```

Expected: index.js, ReactCrop.css, and type declarations exist.

**Step 3: Commit**

```bash
git add toolk1t-client/package.json toolk1t-client/pnpm-lock.yaml
git commit -m "chore: add react-image-crop dependency"
```

---

### Task 3: Add types for crop/resize and editor phase

**Files:**
- Modify: `toolk1t-client/tools/svg-converter/types.ts`

**Step 1: Add new types at the end of the file**

Append after the existing `DEFAULT_SETTINGS` export:

```ts
export type EditorPhase = 'upload' | 'crop' | 'vectorize'

export interface CropData {
  /** Crop region as percentages (from react-image-crop) */
  x: number
  y: number
  width: number
  height: number
}

export interface ResizeData {
  width: number
  height: number
  lockAspectRatio: boolean
}
```

**Step 2: Commit**

```bash
git add toolk1t-client/tools/svg-converter/types.ts
git commit -m "feat(svg-converter): add crop/resize types and editor phase"
```

---

### Task 4: Build the CropResizeEditor component

**Files:**
- Create: `toolk1t-client/tools/svg-converter/crop-resize-editor.tsx`

**Step 1: Create the component**

This component receives the raw uploaded `imageMeta`, displays it inside `<ReactCrop>` with resize dimension inputs below, and emits the processed (cropped+resized) image via `onConfirm`.

```tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import type { ImageMeta } from './types'

interface CropResizeEditorProps {
  imageMeta: ImageMeta
  onConfirm: (processedMeta: ImageMeta) => void
  onSkip: () => void
}

const PRESETS = [
  { label: '512 × 512', w: 512, h: 512 },
  { label: '1024 × 1024', w: 1024, h: 1024 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
] as const

function applyCanvasCrop(
  imgSrc: string,
  pixelCrop: PixelCrop,
  targetW: number,
  targetH: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D not supported'))

      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetW,
        targetH,
      )
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imgSrc
  })
}

export function CropResizeEditor({ imageMeta, onConfirm, onSkip }: CropResizeEditorProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Crop state — start with full image selected
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  // Resize state
  const [resizeW, setResizeW] = useState(imageMeta.width)
  const [resizeH, setResizeH] = useState(imageMeta.height)
  const [lockAspect, setLockAspect] = useState(true)
  const aspectRatio = imageMeta.width / imageMeta.height

  // Sync resize dims when crop region changes
  useEffect(() => {
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      setResizeW(Math.round(completedCrop.width))
      setResizeH(Math.round(completedCrop.height))
    }
  }, [completedCrop])

  const handleResizeW = useCallback(
    (w: number) => {
      setResizeW(w)
      if (lockAspect) {
        const cropAspect = completedCrop
          ? completedCrop.width / completedCrop.height
          : aspectRatio
        setResizeH(Math.round(w / cropAspect))
      }
    },
    [lockAspect, completedCrop, aspectRatio],
  )

  const handleResizeH = useCallback(
    (h: number) => {
      setResizeH(h)
      if (lockAspect) {
        const cropAspect = completedCrop
          ? completedCrop.width / completedCrop.height
          : aspectRatio
        setResizeW(Math.round(h * cropAspect))
      }
    },
    [lockAspect, completedCrop, aspectRatio],
  )

  const handlePreset = useCallback(
    (w: number, h: number) => {
      setResizeW(w)
      setResizeH(h)
      setLockAspect(false)
    },
    [],
  )

  const handleConfirm = useCallback(async () => {
    // If no crop set, use full image dimensions
    const pixelCrop: PixelCrop = completedCrop && completedCrop.width > 0
      ? completedCrop
      : { x: 0, y: 0, width: imageMeta.width, height: imageMeta.height, unit: 'px' }

    const dataUrl = await applyCanvasCrop(imageMeta.dataUrl, pixelCrop, resizeW, resizeH)

    // Estimate file size from base64
    const base64Len = dataUrl.length - dataUrl.indexOf(',') - 1
    const sizeBytes = Math.round((base64Len * 3) / 4)

    onConfirm({
      name: imageMeta.name,
      width: resizeW,
      height: resizeH,
      sizeBytes,
      type: 'image/png',
      dataUrl,
    })
  }, [completedCrop, imageMeta, resizeW, resizeH, onConfirm])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-[#1a2333] shrink-0 gap-3 flex-wrap">
        {/* Resize controls */}
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <label className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs">W</span>
            <input
              type="number"
              min={1}
              max={8192}
              value={resizeW}
              onChange={(e) => handleResizeW(Number(e.target.value) || 1)}
              className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white text-center"
            />
          </label>

          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`p-1 rounded transition-colors cursor-pointer ${lockAspect ? 'text-[var(--ht-color-secondary-500)]' : 'text-slate-500'}`}
            title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            aria-label={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {lockAspect ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              )}
            </svg>
          </button>

          <label className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs">H</span>
            <input
              type="number"
              min={1}
              max={8192}
              value={resizeH}
              onChange={(e) => handleResizeH(Number(e.target.value) || 1)}
              className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white text-center"
            />
          </label>

          {/* Presets */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p.w, p.h)}
                className="px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors cursor-pointer min-h-[36px]"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[var(--ht-color-secondary-500)] hover:bg-[var(--ht-color-secondary-500)]/80 rounded-lg transition-colors cursor-pointer min-h-[36px]"
          >
            Continue to Vectorize
          </button>
        </div>
      </div>

      {/* Crop canvas */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-slate-950/40">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          className="max-h-full"
        >
          <img
            ref={imgRef}
            src={imageMeta.dataUrl}
            alt="Crop preview"
            className="max-w-full max-h-[70vh] object-contain"
            draggable={false}
          />
        </ReactCrop>
      </div>

      {/* Hint bar */}
      <div className="h-7 border-t border-slate-700 bg-[#101622] flex items-center px-4 shrink-0">
        <span className="text-[10px] text-slate-500">
          Drag to crop · Set dimensions above · Click "Continue to Vectorize" when ready
        </span>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add toolk1t-client/tools/svg-converter/crop-resize-editor.tsx
git commit -m "feat(svg-converter): add CropResizeEditor component"
```

---

### Task 5: Wire CropResizeEditor into page.tsx

**Files:**
- Modify: `toolk1t-client/app/tools/svg-converter/page.tsx`

**Step 1: Update imports**

Add at the top of the imports block:

```tsx
import { CropResizeEditor } from '@/tools/svg-converter/crop-resize-editor'
import type { EditorPhase } from '@/tools/svg-converter/types'
```

**Step 2: Add editor phase + processed image state**

After the existing `const [isDragging, setIsDragging] = useState(false)` line, add:

```tsx
  // Editor phase: upload → crop → vectorize
  const [editorPhase, setEditorPhase] = useState<EditorPhase>('upload')

  // The image passed to useSvgTracer (after crop/resize, or raw if skipped)
  const [processedImageMeta, setProcessedImageMeta] = useState<ImageMeta | null>(null)
```

**Step 3: Change useSvgTracer to use processedImageMeta**

Replace:
```tsx
  const { conversionState, vectorResult, error, reprocess, reset } = useSvgTracer(imageMeta, settings)
```

With:
```tsx
  const { conversionState, vectorResult, error, reprocess, reset } = useSvgTracer(processedImageMeta, settings)
```

**Step 4: Update handleFileSelect to go to crop phase**

In the existing `handleFileSelect` callback, after `setImageMeta({...})`, add:

```tsx
        setEditorPhase('crop')
```

So it becomes:
```tsx
      img.onload = () => {
        setImageMeta({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: file.size,
          type: file.type,
          dataUrl,
        })
        setEditorPhase('crop')
        setSliderPosition(50)
        setZoom(100)
      }
```

**Step 5: Add crop confirm and skip handlers**

After the `handleNewFile` callback, add:

```tsx
  const handleCropConfirm = useCallback((processed: ImageMeta) => {
    setProcessedImageMeta(processed)
    setEditorPhase('vectorize')
  }, [])

  const handleCropSkip = useCallback(() => {
    setProcessedImageMeta(imageMeta)
    setEditorPhase('vectorize')
  }, [imageMeta])

  const handleBackToCrop = useCallback(() => {
    reset()
    setProcessedImageMeta(null)
    setEditorPhase('crop')
  }, [reset])
```

**Step 6: Update handleNewFile to reset phase**

Replace the existing `handleNewFile`:

```tsx
  const handleNewFile = useCallback(() => {
    reset()
    setImageMeta(null)
    setProcessedImageMeta(null)
    setSettings(DEFAULT_SETTINGS)
    setEditorPhase('upload')
  }, [reset])
```

**Step 7: Update the canvas section to render by phase**

Replace the entire `<section>` inside `<main>` (the center canvas area) with:

```tsx
        <section className="flex-1 relative flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {editorPhase === 'upload' && (
            <UploadScreen
              onFileSelect={handleFileSelect}
              isDragging={isDragging}
              onDragStateChange={setIsDragging}
            />
          )}
          {editorPhase === 'crop' && imageMeta && (
            <CropResizeEditor
              imageMeta={imageMeta}
              onConfirm={handleCropConfirm}
              onSkip={handleCropSkip}
            />
          )}
          {editorPhase === 'vectorize' && (
            <>
              <ComparisonCanvas
                imageMeta={processedImageMeta}
                vectorResult={vectorResult}
                conversionState={conversionState}
                error={error}
                sliderPosition={sliderPosition}
                onSliderChange={setSliderPosition}
                zoom={zoom / 100}
                showGrid={showGrid}
              />
              <ZoomControls
                zoom={zoom}
                showGrid={showGrid}
                onZoomChange={handleZoomChange}
                onFitScreen={handleFitScreen}
                onToggleGrid={handleToggleGrid}
              />
            </>
          )}
        </section>
```

**Step 8: Add "Back to Crop" button in the header**

In the top header bar, after the "New file" button and before the "Reprocess" button, add:

```tsx
          {/* Back to crop */}
          {editorPhase === 'vectorize' && imageMeta && (
            <button
              onClick={handleBackToCrop}
              className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
              title="Back to crop/resize"
              aria-label="Back to crop/resize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </button>
          )}
```

**Step 9: Hide settings sidebar during crop phase**

Wrap the right `<aside>` panel and mobile overlay in a condition so they only show during vectorize phase. Change `{/* Right panel (desktop) */}` aside to:

```tsx
        {editorPhase === 'vectorize' && (
          <aside className="hidden lg:flex flex-col w-80 border-l border-slate-700 bg-[#1a2333] shrink-0 overflow-hidden">
            ...existing content unchanged...
          </aside>
        )}
```

And wrap the mobile settings overlay similarly:

```tsx
        {editorPhase === 'vectorize' && showMobileSettings && (
          ...existing mobile overlay unchanged...
        )}
```

**Step 10: Verify in browser**

1. Open http://localhost:3000/tools/svg-converter
2. Upload an image → should see crop/resize editor (not immediate vectorization)
3. Drag to select crop region → dimensions update in toolbar
4. Click "Continue to Vectorize" → vectorization starts with cropped image
5. Click back arrow → returns to crop editor
6. Click "Skip" → vectorizes full original image
7. Check mobile viewport — settings toggle only shows in vectorize phase

**Step 11: Commit**

```bash
git add toolk1t-client/app/tools/svg-converter/page.tsx
git commit -m "feat(svg-converter): wire crop/resize editor into page flow"
```

---

### Task 6: Update StatusBar to show crop phase

**Files:**
- Modify: `toolk1t-client/tools/svg-converter/status-bar.tsx`

**Step 1: Add crop state to StatusBar**

Add `editorPhase` prop and show "Crop & Resize" label when in crop phase.

Add to the props interface:

```tsx
  editorPhase?: 'upload' | 'crop' | 'vectorize'
```

In the component, before the `stateInfo` line, add:

```tsx
  if (editorPhase === 'crop') {
    return (
      <footer className="h-7 border-t border-slate-700 bg-[#101622] flex items-center justify-between px-4 shrink-0 select-none">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
          <span>Crop & Resize</span>
          {imageMeta && (
            <>
              <span className="w-px h-3 bg-slate-700 mx-2" aria-hidden="true" />
              <span>{imageMeta.width} &times; {imageMeta.height} px</span>
            </>
          )}
        </div>
      </footer>
    )
  }
```

**Step 2: Pass editorPhase from page.tsx**

In `page.tsx`, update the `<StatusBar>` to include `editorPhase`:

```tsx
      <StatusBar
        conversionState={conversionState}
        imageMeta={editorPhase === 'vectorize' ? processedImageMeta : imageMeta}
        vectorResult={vectorResult}
        editorPhase={editorPhase}
      />
```

**Step 3: Commit**

```bash
git add toolk1t-client/tools/svg-converter/status-bar.tsx toolk1t-client/app/tools/svg-converter/page.tsx
git commit -m "feat(svg-converter): show crop phase in status bar"
```

---

### Task 7: Final verification and cleanup

**Step 1: Run lint**

```bash
cd toolk1t-client && pnpm lint
```

Fix any issues.

**Step 2: Run build**

```bash
cd toolk1t-client && pnpm build
```

Ensure no TypeScript or build errors.

**Step 3: Manual browser test**

Full flow verification:
1. Home page — SVG Converter card visible after Image Editor
2. Search bar — typing "svg" shows SVG Converter suggestion
3. Mega menu — SVG Converter in the tool grid
4. SVG Converter page — upload → crop → resize → vectorize → export
5. Skip crop → vectorize full image
6. Back to crop from vectorize phase
7. New file resets everything
8. Mobile: settings toggle hidden during crop, visible during vectorize

**Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix(svg-converter): lint and build fixes"
```
