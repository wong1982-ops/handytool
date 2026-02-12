# SVG Converter: Migrate from vtracer-webapp to @neplex/vectorizer

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the client-side vtracer WASM engine with a server-side `@neplex/vectorizer` API endpoint, simplifying the client and improving reliability.

**Architecture:** The current SVG Converter uses `vtracer-webapp` (WASM) entirely client-side, with complex DOM manipulation (hidden canvas/SVG elements, tick loops, manual WASM loading). `@neplex/vectorizer` is a Node.js-only library wrapping VTracer with native bindings — it cannot run in the browser. We add a `POST /api/v1/svg/vectorize` endpoint to `handytool-api` that accepts an image + settings and returns SVG. The client hook changes from WASM processing to a fetch call. All UI components remain unchanged.

**Tech Stack:** @neplex/vectorizer, Next.js 16 API routes, FormData, Zod validation

---

## Architecture Overview

```
BEFORE:
  Client uploads image → Canvas draws pixels → WASM vtracer processes → SVG string

AFTER:
  Client uploads image → POST /api/v1/svg/vectorize (FormData: image + settings JSON)
                       ← { data: { svg, pathCount, estimatedSize, processingTimeMs } }
```

**Parameter mapping** (1:1 between existing UI settings and @neplex/vectorizer config):

| UI Setting        | Current (vtracer-webapp)  | New (@neplex/vectorizer)       |
|-------------------|--------------------------|--------------------------------|
| mode              | `mode: "spline"`         | `mode: PathSimplifyMode.Spline`|
| filterSpeckle     | `filter_speckle: 4`      | `filterSpeckle: 4`             |
| colorPrecision    | `color_precision: 6`     | `colorPrecision: 6`            |
| layerDifference   | `layer_difference: 16`   | `layerDifference: 16`          |
| cornerThreshold   | `corner_threshold: 60`   | `cornerThreshold: 60`          |
| lengthThreshold   | `length_threshold: 4.0`  | `lengthThreshold: 4.0`         |
| spliceThreshold   | `splice_threshold: 45`   | `spliceThreshold: 45`          |
| pathPrecision     | `path_precision: 8`      | `pathPrecision: 8`             |
| (hardcoded)       | `max_iterations: 10`     | `maxIterations: 10`            |
| (hardcoded)       | `hierarchical: "stacked"`| `hierarchical: Hierarchical.Stacked` |
| (hardcoded)       | N/A                      | `colorMode: ColorMode.Color`   |

---

## Task 1: Install @neplex/vectorizer in handytool-api

**Files:**
- Modify: `handytool-api/package.json`
- Modify: `handytool-api/next.config.ts`

**Step 1: Install the dependency**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace/handytool-api && pnpm add @neplex/vectorizer`

**Step 2: Add to serverExternalPackages in next.config.ts**

`@neplex/vectorizer` uses native bindings and must not be bundled by Webpack/Turbopack. Add it to `serverExternalPackages`.

```typescript
// handytool-api/next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist', 'exceljs', 'docx', 'jspdf', 'jszip', '@neplex/vectorizer'],
}

export default nextConfig
```

**Step 3: Verify installation**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace/handytool-api && node -e "const v = require('@neplex/vectorizer'); console.log('OK', Object.keys(v))"`
Expected: OK with exported keys (vectorize, vectorizeSync, ColorMode, etc.)

**Step 4: Commit**

```bash
git add handytool-api/package.json handytool-api/pnpm-lock.yaml handytool-api/next.config.ts
git commit -m "feat(api): add @neplex/vectorizer dependency for SVG conversion"
```

---

## Task 2: Create SVG validation & types in handytool-api

**Files:**
- Create: `handytool-api/lib/svg/types.ts`
- Create: `handytool-api/lib/svg/validation.ts`

**Step 1: Create the types file**

```typescript
// handytool-api/lib/svg/types.ts
import { z } from 'zod'

export const vectorizeSettingsSchema = z.object({
  mode: z.enum(['spline', 'polygon', 'pixel']).default('spline'),
  filterSpeckle: z.number().int().min(1).max(128).default(4),
  colorPrecision: z.number().int().min(1).max(8).default(6),
  layerDifference: z.number().int().min(1).max(64).default(16),
  cornerThreshold: z.number().min(0).max(180).default(60),
  lengthThreshold: z.number().min(3.5).max(10).default(4.0),
  spliceThreshold: z.number().min(0).max(180).default(45),
  pathPrecision: z.number().int().min(1).max(8).default(8),
})

export type VectorizeSettings = z.infer<typeof vectorizeSettingsSchema>

export interface VectorizeResult {
  svg: string
  pathCount: number
  estimatedSize: number
  processingTimeMs: number
}
```

**Step 2: Create the validation file**

```typescript
// handytool-api/lib/svg/validation.ts
export class SvgValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SvgValidationError'
  }
}

const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20 MB
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export function validateImageFile(file: File): void {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new SvgValidationError(
      `Invalid image type: ${file.type}. Expected PNG, JPEG, WebP, or GIF`,
    )
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new SvgValidationError(`Image exceeds 20 MB limit`)
  }
}
```

**Step 3: Commit**

```bash
git add handytool-api/lib/svg/
git commit -m "feat(api): add SVG vectorization types and validation"
```

---

## Task 3: Create the vectorize processor in handytool-api

**Files:**
- Create: `handytool-api/lib/svg/vectorize.ts`

**Step 1: Write the processor**

This is the core function that wraps `@neplex/vectorizer`. It takes a `File` and settings, returns an SVG string with metadata.

```typescript
// handytool-api/lib/svg/vectorize.ts
import {
  vectorize,
  ColorMode,
  Hierarchical,
  PathSimplifyMode,
} from '@neplex/vectorizer'
import type { VectorizeSettings, VectorizeResult } from './types'

function mapMode(mode: VectorizeSettings['mode']): PathSimplifyMode {
  switch (mode) {
    case 'spline': return PathSimplifyMode.Spline
    case 'polygon': return PathSimplifyMode.Polygon
    case 'pixel': return PathSimplifyMode.None
  }
}

function countPaths(svg: string): number {
  const matches = svg.match(/<path[\s/]/g)
  return matches ? matches.length : 0
}

export async function vectorizeImage(
  file: File,
  settings: VectorizeSettings,
): Promise<VectorizeResult> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const startTime = performance.now()

  const svg = await vectorize(buffer, {
    colorMode: ColorMode.Color,
    hierarchical: Hierarchical.Stacked,
    mode: mapMode(settings.mode),
    filterSpeckle: settings.filterSpeckle,
    colorPrecision: settings.colorPrecision,
    layerDifference: settings.layerDifference,
    cornerThreshold: settings.cornerThreshold,
    lengthThreshold: settings.lengthThreshold,
    spliceThreshold: settings.spliceThreshold,
    pathPrecision: settings.pathPrecision,
    maxIterations: 10,
  })

  const processingTimeMs = Math.round(performance.now() - startTime)

  return {
    svg,
    pathCount: countPaths(svg),
    estimatedSize: Buffer.byteLength(svg, 'utf-8'),
    processingTimeMs,
  }
}
```

**Step 2: Commit**

```bash
git add handytool-api/lib/svg/vectorize.ts
git commit -m "feat(api): add vectorize processor using @neplex/vectorizer"
```

---

## Task 4: Create the API route handler

**Files:**
- Create: `handytool-api/app/api/v1/svg/vectorize/route.ts`

**Step 1: Write the route handler**

Follow existing patterns from `lib/pdf/form-data.ts` and `lib/api/response.ts`.

```typescript
// handytool-api/app/api/v1/svg/vectorize/route.ts
import { NextRequest } from 'next/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { parseFormData, getFileFromFormData, getStringField } from '@/lib/pdf/form-data'
import { validateImageFile, SvgValidationError } from '@/lib/svg/validation'
import { vectorizeSettingsSchema } from '@/lib/svg/types'
import { vectorizeImage } from '@/lib/svg/vectorize'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const file = getFileFromFormData(formData, 'image')
    validateImageFile(file)

    // Parse settings from JSON string field (with defaults via Zod)
    const settingsRaw = getStringField(formData, 'settings', '{}')
    const parseResult = vectorizeSettingsSchema.safeParse(JSON.parse(settingsRaw))
    if (!parseResult.success) {
      return API_ERRORS.VALIDATION({
        message: 'Invalid vectorization settings',
        issues: parseResult.error.flatten().fieldErrors,
      })
    }

    const result = await vectorizeImage(file, parseResult.data)
    return apiSuccess(result)
  } catch (error) {
    if (error instanceof SvgValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    console.error('[SVG Vectorize] Error:', error)
    return API_ERRORS.INTERNAL()
  }
}
```

**Step 2: Smoke-test the endpoint**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace/handytool-api && pnpm dev &`

Then test with curl using a test image from the designs folder:

```bash
curl -X POST http://localhost:3001/api/v1/svg/vectorize \
  -F "image=@/Users/mercury/WebstormProjects/handytool-workspace/designs/10.SVGConverter/loic_avatar.png" \
  -F 'settings={"mode":"spline","filterSpeckle":4,"colorPrecision":6}' \
  | head -c 500
```

Expected: JSON response with `{ "data": { "svg": "<svg ...", "pathCount": ..., "estimatedSize": ..., "processingTimeMs": ... } }`

**Step 3: Commit**

```bash
git add handytool-api/app/api/v1/svg/vectorize/
git commit -m "feat(api): add POST /api/v1/svg/vectorize endpoint"
```

---

## Task 5: Update client types — remove vtracer-specific mapping

**Files:**
- Modify: `handytool-client/tools/svg-converter/types.ts`

**Step 1: Remove the `settingsToVtracerParams` function**

This function maps settings to vtracer-webapp's DOM-based params (canvas_id, svg_id). No longer needed — the API accepts settings directly.

Update `types.ts`: remove `settingsToVtracerParams` function entirely. Keep all interfaces and `DEFAULT_SETTINGS` unchanged since the settings shape is the same.

```typescript
// handytool-client/tools/svg-converter/types.ts
export interface VectorizationSettings {
  // Curve Fitting
  mode: 'spline' | 'polygon' | 'pixel'
  filterSpeckle: number
  // Color
  colorPrecision: number
  layerDifference: number
  // Path Quality
  cornerThreshold: number
  lengthThreshold: number
  spliceThreshold: number
  pathPrecision: number
  // Behavior
  liveProcessing: boolean
  optimizeSvg: boolean
}

export interface ImageMeta {
  name: string
  width: number
  height: number
  sizeBytes: number
  type: string
  dataUrl: string
}

export interface VectorResult {
  svgString: string
  svgBlobUrl: string
  pathCount: number
  estimatedSize: number
  processingTimeMs: number
}

export type ConversionState = 'idle' | 'processing' | 'ready' | 'error'

export const DEFAULT_SETTINGS: VectorizationSettings = {
  mode: 'spline',
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  cornerThreshold: 60,
  lengthThreshold: 4.0,
  spliceThreshold: 45,
  pathPrecision: 8,
  liveProcessing: true,
  optimizeSvg: true,
}
```

**Step 2: Commit**

```bash
git add handytool-client/tools/svg-converter/types.ts
git commit -m "refactor(client): remove vtracer-specific param mapping from types"
```

---

## Task 6: Rewrite the useSvgTracer hook to use the API

**Files:**
- Modify: `handytool-client/tools/svg-converter/use-svg-tracer.ts`

This is the core change. Replace the entire WASM-based conversion with a fetch call to the API.

**Step 1: Rewrite the hook**

```typescript
// handytool-client/tools/svg-converter/use-svg-tracer.ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ImageMeta, VectorizationSettings, VectorResult, ConversionState } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface UseSvgTracerReturn {
  conversionState: ConversionState
  vectorResult: VectorResult | null
  error: string | null
  reprocess: () => void
  reset: () => void
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}

export function useSvgTracer(
  imageMeta: ImageMeta | null,
  settings: VectorizationSettings,
): UseSvgTracerReturn {
  const [conversionState, setConversionState] = useState<ConversionState>('idle')
  const [vectorResult, setVectorResult] = useState<VectorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const blobUrlRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cleanup = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const doConvert = useCallback(
    async (meta: ImageMeta, currentSettings: VectorizationSettings) => {
      // Abort any in-flight request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setConversionState('processing')
      setError(null)

      try {
        const file = await dataUrlToFile(meta.dataUrl, meta.name)

        const { liveProcessing, optimizeSvg, ...apiSettings } = currentSettings

        const formData = new FormData()
        formData.append('image', file)
        formData.append('settings', JSON.stringify(apiSettings))

        const response = await fetch(`${API_BASE}/api/v1/svg/vectorize`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || `Server error: ${response.status}`)
        }

        const { data } = await response.json()

        // Cleanup previous blob
        cleanup()

        let svgString: string = data.svg

        // Client-side SVGO post-processing (if enabled)
        if (currentSettings.optimizeSvg) {
          try {
            const { optimize } = await import('svgo/browser')
            const result = optimize(svgString, {
              multipass: true,
              plugins: ['preset-default'],
            })
            svgString = result.data
          } catch {
            // SVGO failure is non-fatal
          }
        }

        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const svgBlobUrl = URL.createObjectURL(blob)
        blobUrlRef.current = svgBlobUrl

        setVectorResult({
          svgString,
          svgBlobUrl,
          pathCount: data.pathCount,
          estimatedSize: blob.size,
          processingTimeMs: data.processingTimeMs,
        })
        setConversionState('ready')
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[SVG Converter] Conversion failed:', err)
        setError(err instanceof Error ? err.message : 'Conversion failed')
        setConversionState('error')
      }
    },
    [cleanup],
  )

  const reprocess = useCallback(() => {
    if (!imageMeta) return
    doConvert(imageMeta, settings)
  }, [imageMeta, settings, doConvert])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    cleanup()
    setVectorResult(null)
    setConversionState('idle')
    setError(null)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [cleanup])

  // Auto-convert when image loads for the first time
  const prevImageRef = useRef<string | null>(null)
  useEffect(() => {
    if (!imageMeta) return
    if (prevImageRef.current === imageMeta.dataUrl) return
    prevImageRef.current = imageMeta.dataUrl
    doConvert(imageMeta, settings)
  }, [imageMeta, settings, doConvert])

  // Live reprocessing on settings changes (debounced)
  const settingsJsonRef = useRef('')
  useEffect(() => {
    if (!imageMeta) return
    if (!settings.liveProcessing) return

    const json = JSON.stringify(settings)
    if (settingsJsonRef.current === json) return
    if (settingsJsonRef.current === '') {
      settingsJsonRef.current = json
      return
    }
    settingsJsonRef.current = json

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doConvert(imageMeta, settings)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [imageMeta, settings, doConvert])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      cleanup()
    }
  }, [cleanup])

  return { conversionState, vectorResult, error, reprocess, reset }
}
```

Key changes:
- Replaced WASM loading + DOM manipulation with a single `fetch()` call
- Uses `AbortController` instead of `processIdRef` for cancellation
- Converts `dataUrl` to `File` for FormData upload
- Strips `liveProcessing` and `optimizeSvg` (client-only) before sending to API
- SVGO optimization stays client-side (optional post-processing)

**Step 2: Commit**

```bash
git add handytool-client/tools/svg-converter/use-svg-tracer.ts
git commit -m "feat(client): rewrite useSvgTracer hook to use API instead of WASM"
```

---

## Task 7: Remove obsolete WASM files

**Files:**
- Delete: `handytool-client/tools/svg-converter/vtracer-loader.ts`
- Delete: `handytool-client/tools/svg-converter/vtracer_webapp_bg.js`
- Delete: `handytool-client/public/vtracer_webapp_bg.wasm` (if it exists)

**Step 1: Verify no remaining imports of deleted files**

Search for any imports of `vtracer-loader` or `vtracer_webapp_bg` in the codebase:

Run: `grep -r "vtracer-loader\|vtracer_webapp" handytool-client/tools/ handytool-client/app/`

Expected: Only hits in `use-svg-tracer.ts` (which we already rewrote, so those imports should be gone)

**Step 2: Delete the files**

```bash
rm handytool-client/tools/svg-converter/vtracer-loader.ts
rm handytool-client/tools/svg-converter/vtracer_webapp_bg.js
rm -f handytool-client/public/vtracer_webapp_bg.wasm
```

**Step 3: Check if vtracer-webapp can be uninstalled**

Run: `grep -r "vtracer" handytool-client/package.json`

If `vtracer-webapp` is listed as a dependency, remove it:
Run: `cd /Users/mercury/WebstormProjects/handytool-workspace/handytool-client && pnpm remove vtracer-webapp`

**Step 4: Commit**

```bash
git add -A handytool-client/tools/svg-converter/ handytool-client/public/
git commit -m "chore(client): remove obsolete vtracer WASM files and loader"
```

---

## Task 8: Add NEXT_PUBLIC_API_URL env variable to client

**Files:**
- Modify: `handytool-client/.env.local` (create if not exists)

**Step 1: Add the environment variable**

```bash
# handytool-client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

This allows the client to find the API server. In production, this would be set to the deployed API URL.

**Step 2: Commit** (do NOT commit .env.local — add to .env.example instead if one exists)

Check for `.env.example`:
Run: `ls handytool-client/.env.example 2>/dev/null`

If it exists, add the variable there. If not, create `.env.example`:

```bash
# handytool-client/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
git add handytool-client/.env.example
git commit -m "docs(client): add NEXT_PUBLIC_API_URL to env example"
```

---

## Task 9: Verify end-to-end flow

**Step 1: Start the API server**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace/handytool-api && pnpm dev`
Expected: Server starts on port 3001

**Step 2: Start the client**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace/handytool-client && pnpm dev`
Expected: Client starts on port 3000

**Step 3: Manual test**

1. Open `http://localhost:3000/tools/svg-converter`
2. Upload `designs/10.SVGConverter/loic_avatar.png`
3. Verify: image loads, processing spinner appears, SVG result renders in comparison canvas
4. Adjust settings (e.g., change filter speckle, color precision)
5. Verify: live processing re-fetches from API after 300ms debounce
6. Click "Download SVG" — verify file downloads
7. Open browser DevTools Network tab — verify requests go to `localhost:3001/api/v1/svg/vectorize`

**Step 4: Test error handling**

1. Stop the API server
2. Upload an image in the client
3. Verify: error state displays (not a crash)
4. Restart the API server
5. Click reprocess — verify it recovers

**Step 5: Commit** (nothing to commit — this is manual verification)

---

## Task 10: Add CORS headers to API (if needed)

The client (port 3000) calls the API (port 3001) — this is a cross-origin request. If the API doesn't already handle CORS, we need to add it.

**Files:**
- Create: `handytool-api/middleware.ts` (if CORS fails in Task 9)

**Step 1: Test if CORS is an issue**

During Task 9, check the browser console for CORS errors. If none, skip this task.

**Step 2: Add CORS middleware (only if needed)**

```typescript
// handytool-api/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
]

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const response = NextResponse.next()
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

**Step 3: Commit (only if CORS middleware was added)**

```bash
git add handytool-api/middleware.ts
git commit -m "feat(api): add CORS middleware for cross-origin client requests"
```

---

## Summary of changes

| Repo | Action | Files |
|------|--------|-------|
| handytool-api | Add dependency | `package.json`, `next.config.ts` |
| handytool-api | New validation | `lib/svg/types.ts`, `lib/svg/validation.ts` |
| handytool-api | New processor | `lib/svg/vectorize.ts` |
| handytool-api | New endpoint | `app/api/v1/svg/vectorize/route.ts` |
| handytool-api | CORS (if needed) | `middleware.ts` |
| handytool-client | Rewrite hook | `tools/svg-converter/use-svg-tracer.ts` |
| handytool-client | Simplify types | `tools/svg-converter/types.ts` |
| handytool-client | Delete WASM | `vtracer-loader.ts`, `vtracer_webapp_bg.js`, WASM binary |
| handytool-client | Env config | `.env.example` |

**UI components unchanged:** `upload-screen.tsx`, `comparison-canvas.tsx`, `comparison-slider.tsx`, `vectorization-settings.tsx`, `export-actions.tsx`, `canvas-toolbar.tsx`, `zoom-controls.tsx`, `status-bar.tsx`, `svg-converter.scss`
