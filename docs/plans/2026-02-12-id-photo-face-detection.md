# ID Photo Face Detection — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the mock face detection in ID Photo tool with real server-side face analysis using `@vladmandic/face-api`, returning bounding box, head angle, and 5-point compliance scoring.

**Architecture:** Client uploads photo via FormData → POST `/api/v1/id-photo/analyze` → server runs SSD MobileNet + 68-point landmarks → returns face box, angles, compliance checks with pass/fail/warn status + overall score. Client hook replaces the `setTimeout(() => setFaceDetected(true), 1500)` mock. Follows the same patterns as the SVG vectorize endpoint.

**Tech Stack:** `@vladmandic/face-api`, `@tensorflow/tfjs-node`, Zod, Next.js App Router API routes, React hooks

---

## Task 1: Install dependencies in handytool-api

**Files:**
- Modify: `handytool-api/package.json`
- Modify: `handytool-api/next.config.ts`

**Step 1: Install face-api and tfjs-node**

Run:
```bash
cd handytool-api && pnpm add @vladmandic/face-api @tensorflow/tfjs-node
```

**Step 2: Add to serverExternalPackages**

In `handytool-api/next.config.ts`, add both packages to the `serverExternalPackages` array (alongside `@neplex/vectorizer`):

```typescript
serverExternalPackages: ['@neplex/vectorizer', '@vladmandic/face-api', '@tensorflow/tfjs-node'],
```

These are native Node.js packages that must not be bundled by webpack.

**Step 3: Verify model files exist**

Run:
```bash
ls handytool-api/node_modules/@vladmandic/face-api/model/ | head -20
```

Expected: Directory contains model manifest files like `ssd_mobilenetv1_model-weights_manifest.json`, `face_landmark_68_model-weights_manifest.json`, etc.

**Step 4: Verify build**

Run: `cd handytool-api && npx tsc --noEmit`
Expected: 0 errors

**Step 5: Commit**

```bash
cd handytool-api
git add package.json pnpm-lock.yaml next.config.ts
git commit -m "feat(id-photo): install @vladmandic/face-api + @tensorflow/tfjs-node"
```

---

## Task 2: Create types and validation

**Files:**
- Create: `handytool-api/lib/face/types.ts`
- Create: `handytool-api/lib/face/validation.ts`

**Step 1: Create `lib/face/types.ts`**

```typescript
import { z } from 'zod'

// -- Request validation --

export const analyzeOptionsSchema = z.object({
  /** Minimum confidence for face detection (0-1) */
  minConfidence: z.number().min(0.1).max(1).default(0.5),
})

export type AnalyzeOptions = z.infer<typeof analyzeOptionsSchema>

// -- Response types --

export interface FaceBox {
  /** Top-left X, normalized 0-1 */
  x: number
  /** Top-left Y, normalized 0-1 */
  y: number
  /** Width, normalized 0-1 */
  width: number
  /** Height, normalized 0-1 */
  height: number
}

export interface FaceAngle {
  /** Head roll in degrees (tilt left/right) */
  roll: number
  /** Head pitch in degrees (tilt up/down) */
  pitch: number
  /** Head yaw in degrees (turn left/right) */
  yaw: number
}

export type ComplianceLevel = 'pass' | 'warn' | 'fail'

export interface ComplianceCheck {
  pass: boolean
  level: ComplianceLevel
  message: string
}

export interface FaceCompliance {
  centered: ComplianceCheck
  faceSize: ComplianceCheck
  headStraight: ComplianceCheck
  eyesOpen: ComplianceCheck
  lighting: ComplianceCheck
}

export interface FaceAnalysisResult {
  faceBox: FaceBox
  angle: FaceAngle
  compliance: FaceCompliance
  /** Overall score 0-100 */
  score: number
  /** Detection confidence 0-1 */
  confidence: number
  /** Processing time in ms */
  processingTimeMs: number
}
```

**Step 2: Create `lib/face/validation.ts`**

Reuse the same image validation pattern from SVG (same file types, same 20MB limit, different error class name):

```typescript
export class FaceValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FaceValidationError'
  }
}

const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20 MB
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function validateFaceImage(file: File): void {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new FaceValidationError(
      `Invalid image type: ${file.type}. Expected PNG, JPEG, or WebP`,
    )
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new FaceValidationError('Image exceeds 20 MB limit')
  }
}
```

Note: No GIF support — face detection on animated images is not useful.

**Step 3: Verify build**

Run: `cd handytool-api && npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
cd handytool-api
git add lib/face/types.ts lib/face/validation.ts
git commit -m "feat(id-photo): add face analysis types and image validation"
```

---

## Task 3: Create face analysis engine

**Files:**
- Create: `handytool-api/lib/face/analyze.ts`

This is the core logic. It wraps `@vladmandic/face-api` to detect a single face, extract 68-point landmarks, compute angles, and run 5 compliance checks.

**Step 1: Create `lib/face/analyze.ts`**

```typescript
import * as faceapi from '@vladmandic/face-api'
import path from 'path'
import type {
  AnalyzeOptions,
  FaceAnalysisResult,
  FaceBox,
  FaceAngle,
  FaceCompliance,
  ComplianceCheck,
  ComplianceLevel,
} from './types'
import { FaceValidationError } from './validation'

// --- Model loading (singleton) ---

let modelsLoaded = false

async function ensureModels(): Promise<void> {
  if (modelsLoaded) return

  const modelPath = path.join(
    process.cwd(),
    'node_modules',
    '@vladmandic',
    'face-api',
    'model',
  )

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)

  modelsLoaded = true
}

// --- Eye Aspect Ratio (EAR) ---

interface Point {
  x: number
  y: number
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function eyeAspectRatio(eyePoints: Point[]): number {
  // EAR = (|p1-p5| + |p2-p4|) / (2 * |p0-p3|)
  const vertical1 = distance(eyePoints[1], eyePoints[5])
  const vertical2 = distance(eyePoints[2], eyePoints[4])
  const horizontal = distance(eyePoints[0], eyePoints[3])
  if (horizontal === 0) return 0
  return (vertical1 + vertical2) / (2 * horizontal)
}

// --- Lighting check ---

function checkLighting(
  landmarks: faceapi.FaceLandmarks68,
  imageWidth: number,
): ComplianceCheck {
  // Compare left/right face landmark spread as proxy for even lighting
  // Jaw landmarks: 0-8 = right jaw, 8-16 = left jaw
  const positions = landmarks.positions
  const jawMidX = positions[8].x

  // Compute average horizontal spread of left vs right landmarks
  const rightSpread = positions.slice(0, 8).reduce((sum, p) => sum + (jawMidX - p.x), 0) / 8
  const leftSpread = positions.slice(9, 17).reduce((sum, p) => sum + (p.x - jawMidX), 0) / 8

  if (rightSpread === 0 && leftSpread === 0) {
    return { pass: true, level: 'pass', message: 'Lighting appears even.' }
  }

  const maxSpread = Math.max(rightSpread, leftSpread)
  const minSpread = Math.min(rightSpread, leftSpread)
  const diff = maxSpread > 0 ? (maxSpread - minSpread) / maxSpread : 0

  if (diff < 0.2) {
    return { pass: true, level: 'pass', message: 'Lighting appears even.' }
  } else if (diff < 0.35) {
    return { pass: false, level: 'warn', message: 'Slightly uneven lighting detected.' }
  }
  return { pass: false, level: 'fail', message: 'Uneven lighting — use more even illumination.' }
}

// --- Compliance checks ---

function buildCompliance(
  faceBox: FaceBox,
  angle: FaceAngle,
  avgEAR: number,
  landmarks: faceapi.FaceLandmarks68,
  imageWidth: number,
): FaceCompliance {
  // 1. Centered: face box center within 10% of image center
  const faceCenterX = faceBox.x + faceBox.width / 2
  const faceCenterY = faceBox.y + faceBox.height / 2
  const offsetX = Math.abs(faceCenterX - 0.5)
  const offsetY = Math.abs(faceCenterY - 0.5)
  const maxOffset = Math.max(offsetX, offsetY)

  const centered: ComplianceCheck = maxOffset < 0.10
    ? { pass: true, level: 'pass', message: 'Face is well centered.' }
    : maxOffset < 0.18
      ? { pass: false, level: 'warn', message: 'Face slightly off-center. Reposition photo.' }
      : { pass: false, level: 'fail', message: 'Face is not centered. Drag to reposition.' }

  // 2. Face size: box height should be 60-80% of frame
  const faceSize: ComplianceCheck = faceBox.height >= 0.60 && faceBox.height <= 0.80
    ? { pass: true, level: 'pass', message: `Face fills ${Math.round(faceBox.height * 100)}% of frame.` }
    : faceBox.height >= 0.45 && faceBox.height <= 0.90
      ? { pass: false, level: 'warn', message: `Face fills ${Math.round(faceBox.height * 100)}% — ideal is 60-80%. ${faceBox.height < 0.60 ? 'Zoom in.' : 'Zoom out.'}` }
      : { pass: false, level: 'fail', message: `Face fills ${Math.round(faceBox.height * 100)}% — must be 60-80%. ${faceBox.height < 0.45 ? 'Much too small — zoom in.' : 'Much too large — zoom out.'}` }

  // 3. Head straight: yaw < 15°
  const absYaw = Math.abs(angle.yaw)
  const absPitch = Math.abs(angle.pitch)
  const absRoll = Math.abs(angle.roll)
  const maxAngle = Math.max(absYaw, absPitch, absRoll)

  const headStraight: ComplianceCheck = maxAngle < 10
    ? { pass: true, level: 'pass', message: `Head angle within ${maxAngle.toFixed(1)}°.` }
    : maxAngle < 15
      ? { pass: false, level: 'warn', message: `Head tilted ${maxAngle.toFixed(1)}°. Try to face camera directly.` }
      : { pass: false, level: 'fail', message: `Head tilted ${maxAngle.toFixed(1)}°. Must be under 15°.` }

  // 4. Eyes open: EAR > 0.2
  const eyesOpen: ComplianceCheck = avgEAR > 0.25
    ? { pass: true, level: 'pass', message: 'Eyes are open.' }
    : avgEAR > 0.2
      ? { pass: false, level: 'warn', message: 'Eyes may be partially closed.' }
      : { pass: false, level: 'fail', message: 'Eyes appear closed. Keep eyes open.' }

  // 5. Lighting
  const lighting = checkLighting(landmarks, imageWidth)

  return { centered, faceSize, headStraight, eyesOpen, lighting }
}

function computeScore(compliance: FaceCompliance): number {
  const checks = Object.values(compliance)
  const weights = { pass: 20, warn: 10, fail: 0 }
  return checks.reduce((sum, c) => sum + weights[c.level], 0)
}

// --- Main analyze function ---

export async function analyzeFace(
  file: File,
  options: AnalyzeOptions,
): Promise<FaceAnalysisResult> {
  const startTime = performance.now()

  await ensureModels()

  const buffer = Buffer.from(await file.arrayBuffer())
  const tensor = faceapi.tf.node.decodeImage(buffer, 3)
  const expanded = faceapi.tf.expandDims(tensor, 0)

  try {
    const detection = await faceapi
      .detectSingleFace(
        expanded as faceapi.TNetInput,
        new faceapi.SsdMobilenetv1Options({ minConfidence: options.minConfidence }),
      )
      .withFaceLandmarks()

    if (!detection) {
      throw new FaceValidationError('No face detected in the image. Ensure face is visible and well-lit.')
    }

    const { box } = detection.detection
    const imageDims = detection.detection.imageDims

    // Normalize box to 0-1
    const faceBox: FaceBox = {
      x: box.x / imageDims.width,
      y: box.y / imageDims.height,
      width: box.width / imageDims.width,
      height: box.height / imageDims.height,
    }

    // Angles from radians to degrees
    const angle: FaceAngle = {
      roll: detection.angle.roll * (180 / Math.PI),
      pitch: detection.angle.pitch * (180 / Math.PI),
      yaw: detection.angle.yaw * (180 / Math.PI),
    }

    // Eye aspect ratio
    const positions = detection.landmarks.positions
    const rightEye = positions.slice(36, 42)
    const leftEye = positions.slice(42, 48)
    const rightEAR = eyeAspectRatio(rightEye)
    const leftEAR = eyeAspectRatio(leftEye)
    const avgEAR = (rightEAR + leftEAR) / 2

    // Compliance
    const compliance = buildCompliance(faceBox, angle, avgEAR, detection.landmarks, imageDims.width)
    const score = computeScore(compliance)

    return {
      faceBox,
      angle,
      compliance,
      score,
      confidence: detection.detection.score,
      processingTimeMs: Math.round(performance.now() - startTime),
    }
  } finally {
    faceapi.tf.dispose([tensor, expanded])
  }
}
```

**Important implementation notes:**
- **Singleton model loading**: Models are heavy (~5MB each). Load once, reuse across requests.
- **Tensor cleanup in finally block**: Prevents memory leaks even when detection fails.
- **`expandDims`**: Required by face-api for batch dimension on the tensor.
- **Normalized face box (0-1)**: Client can overlay at any resolution without recalculation.
- **Angles in degrees**: More intuitive for compliance checks and UI display.
- **`FaceValidationError` for no-face**: This is a validation error (400), not a 500.

**Step 2: Verify build**

Run: `cd handytool-api && npx tsc --noEmit`

Possible issues:
- `faceapi.tf.node.decodeImage` might not have exact type coverage. If TypeScript complains about `decodeImage`, add `// @ts-expect-error face-api tf.node types` above the call.
- The `as faceapi.TNetInput` cast on `expanded` handles the tensor type mismatch.

Expected: 0 errors (or fix any type issues)

**Step 3: Commit**

```bash
cd handytool-api
git add lib/face/analyze.ts
git commit -m "feat(id-photo): face analysis engine with compliance scoring"
```

---

## Task 4: Create API route handler

**Files:**
- Create: `handytool-api/app/api/v1/id-photo/analyze/route.ts`

**Step 1: Create the route**

```typescript
import { type NextRequest } from 'next/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { parseFormData, getFileFromFormData, getStringField } from '@/lib/pdf/form-data'
import { PdfValidationError } from '@/lib/pdf/validation'
import { validateFaceImage, FaceValidationError } from '@/lib/face/validation'
import { analyzeOptionsSchema } from '@/lib/face/types'
import { analyzeFace } from '@/lib/face/analyze'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await parseFormData(request)
    const file = getFileFromFormData(formData, 'image')
    validateFaceImage(file)

    // Parse optional options
    const optionsRaw = getStringField(formData, 'options', '{}')
    let optionsParsed: unknown
    try {
      optionsParsed = JSON.parse(optionsRaw)
    } catch {
      return API_ERRORS.VALIDATION({ message: 'Options must be valid JSON' })
    }
    const parseResult = analyzeOptionsSchema.safeParse(optionsParsed)
    if (!parseResult.success) {
      return API_ERRORS.VALIDATION({
        message: 'Invalid analysis options',
        issues: parseResult.error.flatten().fieldErrors,
      })
    }

    const result = await analyzeFace(file, parseResult.data)
    return apiSuccess(result)
  } catch (error) {
    if (error instanceof FaceValidationError || error instanceof PdfValidationError) {
      return API_ERRORS.VALIDATION({ message: error.message })
    }
    console.error('[ID Photo Analyze] Error:', error)
    return API_ERRORS.INTERNAL()
  }
}
```

This follows the exact same pattern as the SVG vectorize route:
- `parseFormData` + `getFileFromFormData` from shared helpers
- Zod validation of options
- JSON.parse wrapped in try/catch (learned from SVG converter PO review)
- Catches both `FaceValidationError` and `PdfValidationError` (shared form-data helpers throw the latter)

**Step 2: Verify build**

Run: `cd handytool-api && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
cd handytool-api
git add app/api/v1/id-photo/analyze/route.ts
git commit -m "feat(id-photo): POST /api/v1/id-photo/analyze endpoint"
```

---

## Task 5: Smoke test the API

**Step 1: Start the API server**

Run: `cd handytool-api && pnpm dev`

**Step 2: Test with a real image**

Use any JPEG/PNG with a face. The test image from SVG converter works, or use any photo:

```bash
curl -X POST http://localhost:3001/api/v1/id-photo/analyze \
  -F "image=@/path/to/face-photo.jpg" \
  | node -e "process.stdin.on('data',d=>console.log(JSON.stringify(JSON.parse(d).data,null,2)))"
```

Expected: JSON response with `faceBox`, `angle`, `compliance`, `score`, `confidence`, `processingTimeMs`.

**Step 3: Test error cases**

No face (use a landscape/object photo):
```bash
curl -s -X POST http://localhost:3001/api/v1/id-photo/analyze \
  -F "image=@/path/to/landscape.jpg" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d)))"
```
Expected: `{ error: 'Validation failed', code: 'VALIDATION_ERROR', details: { message: 'No face detected...' } }`

Invalid file type:
```bash
curl -s -X POST http://localhost:3001/api/v1/id-photo/analyze \
  -F "image=@/path/to/file.pdf" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d)))"
```
Expected: 400 validation error about image type.

**Step 4: Note the first-request loading time**

The first request loads TensorFlow models (~2-5 seconds). Subsequent requests should be fast (~100-500ms). Log both times — this matters for UX.

---

## Task 6: Create client hook

**Files:**
- Create: `handytool-client/tools/id-photo/use-face-analysis.ts`

**Step 1: Create the hook**

```typescript
'use client'

import { useState, useCallback, useRef } from 'react'
import type { FaceAnalysisResult } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error'

interface UseFaceAnalysisReturn {
  state: AnalysisState
  result: FaceAnalysisResult | null
  error: string | null
  analyze: (file: File) => Promise<void>
  reset: () => void
}

export function useFaceAnalysis(): UseFaceAnalysisReturn {
  const [state, setState] = useState<AnalysisState>('idle')
  const [result, setResult] = useState<FaceAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const analyze = useCallback(async (file: File) => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState('analyzing')
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_BASE}/api/v1/id-photo/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      const json = await response.json()

      if (!response.ok) {
        const msg = json.details?.message || json.error || 'Analysis failed'
        setState('error')
        setError(msg)
        return
      }

      setResult(json.data as FaceAnalysisResult)
      setState('done')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setState('error')
      setError('Failed to connect to analysis server.')
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState('idle')
    setResult(null)
    setError(null)
  }, [])

  return { state, result, error, analyze, reset }
}
```

**Step 2: Add `FaceAnalysisResult` to client types**

In `handytool-client/tools/id-photo/types.ts`, add the response types (mirroring the server types, but without Zod):

```typescript
// --- Face analysis API response types ---

export interface FaceBox {
  x: number
  y: number
  width: number
  height: number
}

export interface FaceAngle {
  roll: number
  pitch: number
  yaw: number
}

export type ComplianceLevel = 'pass' | 'warn' | 'fail'

export interface ComplianceCheck {
  pass: boolean
  level: ComplianceLevel
  message: string
}

export interface FaceCompliance {
  centered: ComplianceCheck
  faceSize: ComplianceCheck
  headStraight: ComplianceCheck
  eyesOpen: ComplianceCheck
  lighting: ComplianceCheck
}

export interface FaceAnalysisResult {
  faceBox: FaceBox
  angle: FaceAngle
  compliance: FaceCompliance
  score: number
  confidence: number
  processingTimeMs: number
}
```

Also update the `Compliance` interface and `DEFAULT_COMPLIANCE` to match the 5 new server checks. Replace the old 4-check interface:

```typescript
// REMOVE old interface:
// export interface Compliance {
//   headCentered: ComplianceStatus
//   eyesLevel: ComplianceStatus
//   bgContrast: ComplianceStatus
//   noEyewear: ComplianceStatus
// }

// REPLACE WITH: (reuses ComplianceLevel from server)
export interface Compliance {
  centered: ComplianceStatus
  faceSize: ComplianceStatus
  headStraight: ComplianceStatus
  eyesOpen: ComplianceStatus
  lighting: ComplianceStatus
}

export const DEFAULT_COMPLIANCE: Compliance = {
  centered: 'pending',
  faceSize: 'pending',
  headStraight: 'pending',
  eyesOpen: 'pending',
  lighting: 'pending',
}
```

**Step 3: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`
Expected: Type errors in page.tsx and compliance-panel.tsx (because we changed the Compliance interface). These are expected and will be fixed in the next tasks.

**Step 4: Commit**

```bash
cd handytool-client
git add tools/id-photo/use-face-analysis.ts tools/id-photo/types.ts
git commit -m "feat(id-photo): face analysis hook and updated types"
```

---

## Task 7: Update page.tsx — replace mock with real API

**Files:**
- Modify: `handytool-client/app/tools/id-photo/page.tsx`

**Step 1: Import the hook**

Add import at the top:

```typescript
import { useFaceAnalysis } from '@/tools/id-photo/use-face-analysis'
```

**Step 2: Replace mock state with hook**

Remove the old `faceDetected` state (line 30):
```typescript
// REMOVE:
const [faceDetected, setFaceDetected] = useState(false)
```

Add the hook after other state declarations:
```typescript
const { state: analysisState, result: analysisResult, error: analysisError, analyze: analyzeFace, reset: resetAnalysis } = useFaceAnalysis()

// Derived state for backward compatibility
const faceDetected = analysisState === 'done' && analysisResult !== null
```

**Step 3: Replace mock face detection in handleFileSelect**

In `handleFileSelect` (lines 52-73), replace the `setTimeout` mock with a real API call.

Replace the `reader.onload` callback:

```typescript
// BEFORE (lines 64-71):
reader.onload = (e) => {
  setPhotoUrl(e.target?.result as string)
  setTransform(DEFAULT_TRANSFORM)
  showToast('Photo uploaded — align your face with the guides')
  // Mock face detection (delay for realism)
  setTimeout(() => setFaceDetected(true), 1500)
}

// AFTER:
reader.onload = (e) => {
  setPhotoUrl(e.target?.result as string)
  setTransform(DEFAULT_TRANSFORM)
  showToast('Analyzing face...')
  analyzeFace(file)
}
```

**Step 4: Map server compliance to component state**

Replace the entire mock `useEffect` (lines 76-95) with one that reads server data:

```typescript
// BEFORE: Mock compliance based on transform math (lines 76-95)

// AFTER: Map server compliance to component compliance state
useEffect(() => {
  if (!analysisResult) {
    setCompliance(DEFAULT_COMPLIANCE)
    return
  }

  const c = analysisResult.compliance
  setCompliance({
    centered: c.centered.level === 'pass' ? 'pass' : c.centered.level === 'warn' ? 'warn' : 'fail',
    faceSize: c.faceSize.level === 'pass' ? 'pass' : c.faceSize.level === 'warn' ? 'warn' : 'fail',
    headStraight: c.headStraight.level === 'pass' ? 'pass' : c.headStraight.level === 'warn' ? 'warn' : 'fail',
    eyesOpen: c.eyesOpen.level === 'pass' ? 'pass' : c.eyesOpen.level === 'warn' ? 'warn' : 'fail',
    lighting: c.lighting.level === 'pass' ? 'pass' : c.lighting.level === 'warn' ? 'warn' : 'fail',
  })
}, [analysisResult])
```

**Step 5: Show analysis error toast**

Add a useEffect for the error state:

```typescript
useEffect(() => {
  if (analysisError) {
    showToast(analysisError)
  }
}, [analysisError, showToast])
```

**Step 6: Show analysis score toast on success**

Add after the error effect:

```typescript
useEffect(() => {
  if (analysisResult) {
    showToast(`Face detected — compliance score: ${analysisResult.score}/100`)
  }
}, [analysisResult, showToast])
```

**Step 7: Update handleReset**

In `handleReset` (lines 104-110), replace `setFaceDetected(false)` with `resetAnalysis()`:

```typescript
const handleReset = useCallback(() => {
  setPhotoUrl(null)
  setTransform(DEFAULT_TRANSFORM)
  setAdjustments(DEFAULT_ADJUSTMENTS)
  resetAnalysis()
  setCompliance(DEFAULT_COMPLIANCE)
}, [resetAnalysis])
```

**Step 8: Pass analysisResult to InteractiveCanvas**

Update the `InteractiveCanvas` usage to pass the analysis result for face overlay rendering (Task 9):

```tsx
<InteractiveCanvas
  photoUrl={photoUrl}
  transform={transform}
  adjustments={adjustments}
  selectedFormat={selectedFormat}
  showGuides={showGuides}
  bgColor={bgColor}
  faceDetected={faceDetected}
  analysisState={analysisState}
  faceBox={analysisResult?.faceBox ?? null}
  onTransformChange={setTransform}
  onFileSelect={handleFileSelect}
/>
```

**Step 9: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`
Expected: Errors in compliance-panel.tsx (old keys) and interactive-canvas.tsx (new props). These are fixed in the next tasks.

**Step 10: Commit**

```bash
cd handytool-client
git add app/tools/id-photo/page.tsx
git commit -m "feat(id-photo): wire real face analysis API to page"
```

---

## Task 8: Update compliance-panel.tsx for 5 server checks

**Files:**
- Modify: `handytool-client/tools/id-photo/compliance-panel.tsx`

**Step 1: Update the CHECKS array to match the 5 new compliance keys**

Replace the entire `CHECKS` array (lines 17-46):

```typescript
const CHECKS: CheckItem[] = [
  {
    key: 'centered',
    label: 'Face Centered',
    passText: 'Face is well centered in the frame.',
    failText: 'Face is not centered. Drag to reposition.',
    warnText: 'Face slightly off-center. Adjust position.',
  },
  {
    key: 'faceSize',
    label: 'Face Size',
    passText: 'Face size is within the required range.',
    failText: 'Face size is outside the required range.',
    warnText: 'Face size is borderline. Zoom to adjust.',
  },
  {
    key: 'headStraight',
    label: 'Head Straight',
    passText: 'Head angle is within acceptable range.',
    failText: 'Head is tilted too much. Face camera directly.',
    warnText: 'Slight head tilt detected.',
  },
  {
    key: 'eyesOpen',
    label: 'Eyes Open',
    passText: 'Eyes are open and visible.',
    failText: 'Eyes appear closed. Keep eyes open.',
    warnText: 'Eyes may be partially closed.',
  },
  {
    key: 'lighting',
    label: 'Even Lighting',
    passText: 'Lighting appears even across the face.',
    failText: 'Uneven lighting detected. Use even illumination.',
    warnText: 'Slightly uneven lighting. Consider adjusting.',
  },
]
```

**Step 2: Update the "Official Validation" banner text**

Optionally update the allPass banner (lines 139-141) to include the compliance score. This requires passing the score as a prop. For now, keep the existing banner text — it already says "All critical requirements met."

**Step 3: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`
Expected: 0 errors for this file (page.tsx might still have the InteractiveCanvas prop error — fixed next task)

**Step 4: Commit**

```bash
cd handytool-client
git add tools/id-photo/compliance-panel.tsx
git commit -m "feat(id-photo): update compliance panel for 5 server-side checks"
```

---

## Task 9: Add face overlay to interactive-canvas.tsx

**Files:**
- Modify: `handytool-client/tools/id-photo/interactive-canvas.tsx`

**Step 1: Add new props to the interface**

Update `InteractiveCanvasProps` (lines 8-18) to accept face analysis data:

```typescript
interface InteractiveCanvasProps {
  photoUrl: string | null
  transform: Transform
  adjustments: Adjustments
  selectedFormat: PhotoFormat
  showGuides: boolean
  bgColor: string
  faceDetected: boolean
  analysisState: 'idle' | 'analyzing' | 'done' | 'error'
  faceBox: { x: number; y: number; width: number; height: number } | null
  onTransformChange: (t: Transform) => void
  onFileSelect: (file: File) => void
}
```

**Step 2: Destructure new props**

Add `analysisState` and `faceBox` to the destructuring (line 20):

```typescript
export function InteractiveCanvas({
  photoUrl,
  transform,
  adjustments,
  selectedFormat,
  showGuides,
  bgColor,
  faceDetected,
  analysisState,
  faceBox,
  onTransformChange,
  onFileSelect,
}: InteractiveCanvasProps) {
```

**Step 3: Add face bounding box overlay**

Inside the crop frame container (after `<FaceGuides>` at line 238), add a face box overlay:

```tsx
{/* Face bounding box overlay */}
{faceBox && faceDetected && (
  <div
    className="absolute border-2 border-green-400 rounded-sm pointer-events-none z-10 transition-all duration-300"
    style={{
      left: `${faceBox.x * 100}%`,
      top: `${faceBox.y * 100}%`,
      width: `${faceBox.width * 100}%`,
      height: `${faceBox.height * 100}%`,
    }}
    aria-hidden="true"
  >
    {/* Corner markers */}
    <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-green-400" />
    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-green-400" />
    <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-green-400" />
    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-green-400" />
  </div>
)}

{/* Analyzing spinner */}
{analysisState === 'analyzing' && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
    <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <span className="text-white text-xs font-bold">Analyzing face...</span>
    </div>
  </div>
)}
```

**Step 4: Update the "FACE DETECTED" badge**

Replace the existing badge (lines 241-248) to show the analysis state:

```tsx
{/* Analysis status badge */}
{analysisState === 'done' && faceDetected && (
  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-green-500/90 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
    FACE DETECTED
  </div>
)}
{analysisState === 'error' && (
  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-red-500/90 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg backdrop-blur-sm" role="alert">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
    NO FACE FOUND
  </div>
)}
```

**Step 5: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`
Expected: 0 errors

**Step 6: Commit**

```bash
cd handytool-client
git add tools/id-photo/interactive-canvas.tsx
git commit -m "feat(id-photo): face bounding box overlay and analysis state indicators"
```

---

## Task 10: Verify end-to-end

**Step 1: Start both servers**

Terminal 1: `cd handytool-api && pnpm dev` (port 3001)
Terminal 2: `cd handytool-client && pnpm dev` (port 3000)

**Step 2: Test in browser**

1. Navigate to http://localhost:3000/tools/id-photo
2. Upload a photo with a clear face
3. Verify: "Analyzing face..." spinner appears over the canvas
4. Verify: After ~1-3 seconds, "FACE DETECTED" badge appears
5. Verify: Green bounding box overlays the detected face
6. Verify: Compliance panel shows 5 checks (centered, face size, head straight, eyes open, lighting)
7. Verify: Toast shows compliance score

**Step 3: Test error case**

1. Upload a photo without a face (landscape, object, etc.)
2. Verify: "NO FACE FOUND" red badge appears
3. Verify: Toast shows the error message
4. Verify: Compliance stays in pending state

**Step 4: Test reset**

1. Click "Reset" button
2. Verify: All state clears, returns to upload screen
3. Upload a new photo
4. Verify: Analysis runs again cleanly

**Step 5: Verify both builds pass**

Run:
```bash
cd handytool-api && npx tsc --noEmit
cd handytool-client && npx tsc --noEmit
```
Expected: 0 errors in both

**Step 6: Commit**

If any fixes were needed during testing, commit them:

```bash
cd handytool-client
git add -A
git commit -m "fix(id-photo): end-to-end verification fixes"
```

```bash
cd handytool-api
git add -A
git commit -m "fix(id-photo): end-to-end verification fixes"
```

---

## Summary

| Task | Location | What | Commit |
|------|----------|------|--------|
| 1 | API | Install face-api + tfjs-node | `feat(id-photo): install @vladmandic/face-api + @tensorflow/tfjs-node` |
| 2 | API | Types + validation | `feat(id-photo): add face analysis types and image validation` |
| 3 | API | Analysis engine | `feat(id-photo): face analysis engine with compliance scoring` |
| 4 | API | Route handler | `feat(id-photo): POST /api/v1/id-photo/analyze endpoint` |
| 5 | API | Smoke test | (manual test, no commit) |
| 6 | Client | Hook + types | `feat(id-photo): face analysis hook and updated types` |
| 7 | Client | Wire page.tsx | `feat(id-photo): wire real face analysis API to page` |
| 8 | Client | Compliance panel | `feat(id-photo): update compliance panel for 5 server-side checks` |
| 9 | Client | Canvas overlay | `feat(id-photo): face bounding box overlay and analysis state indicators` |
| 10 | Both | E2E verification | Fix commits if needed |
