# Four Tools Enhancement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance ECard Studio, Human Benchmark, Image Editor, and PDF Converter with 20 new features as specified in the approved design doc.

**Architecture:** Each tool gets targeted enhancements that build on existing component architecture. All processing stays client-side. New components follow the existing `tools/<name>/` directory pattern. State management uses React hooks with localStorage for persistence.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS v4 + SCSS, html2canvas (ecard export), Fabric.js (image editor), pdf-lib/pdfjs-dist (PDF), SVG charts (human benchmark)

---

## Part 1: ECard Studio Enhancements

### Task 1: Expand type system for business cards and new templates

**Files:**
- Modify: `tools/ecard-studio/types.ts`

**Step 1: Update types**

Add new types to `types.ts`:

```typescript
// Add to TemplateId union:
export type TemplateId =
  | 'executive' | 'midnight-pinstripe' | 'tech-blueprint' | 'aura-signature' | 'black-tie-matte' | 'blank'
  // New ecard templates:
  | 'product-launch' | 'client-anniversary' | 'employee-welcome' | 'quarterly-milestone'
  | 'holiday-greetings' | 'thank-you-note' | 'new-year' | 'congratulations'
  | 'partnership-announce' | 'team-appreciation' | 'grand-opening'
  | 'event-invite' | 'spring-fresh' | 'summer-vibes' | 'winter-frost'
  // Business card templates:
  | 'biz-classic' | 'biz-modern' | 'biz-creative' | 'biz-tech' | 'biz-elegant'
  | 'biz-bold' | 'biz-nature' | 'biz-gradient' | 'biz-dark' | 'biz-minimal'

// Add to TemplateCategory union:
export type TemplateCategory =
  | 'classic-marble' | 'corporate' | 'modernist' | 'ethereal' | 'noir'
  | 'celebration' | 'seasonal' | 'business-card'

// Add occasion type:
export type OccasionTag = 'product-launch' | 'client-anniversary' | 'employee-welcome'
  | 'quarterly-milestone' | 'holiday-greetings' | 'thank-you'

// Add card type discriminator:
export type CardType = 'ecard' | 'business-card'

// Add business card fields to ECardData:
export interface ECardData {
  // ... existing fields ...
  cardType: CardType
  // Business card contact fields (only used when cardType === 'business-card')
  phone: string
  email: string
  website: string
  address: string
}

// Update Template interface:
export interface Template {
  id: TemplateId
  name: string
  description: string
  category: TemplateCategory
  categoryLabel: string
  cardType: CardType
  occasions?: OccasionTag[]
  defaults: ECardData
}
```

**Step 2: Build and verify no type errors**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm build 2>&1 | head -40`

Fix any type errors in files that reference `ECardData` or `Template` — mainly `templates.ts`, `card-editor.tsx`, `customization-panel.tsx`, `card-canvas.tsx`.

**Step 3: Commit**

```bash
git add tools/ecard-studio/types.ts
# Also add any files updated for type compat
git commit -m "feat(ecard-studio): expand type system for business cards and new templates"
```

---

### Task 2: Add 15 new ecard templates

**Files:**
- Create: `tools/ecard-studio/ecard-templates.ts`
- Modify: `tools/ecard-studio/templates.ts` (re-export from new file, keep existing 5)

**Step 1: Create ecard-templates.ts**

Create 15 new ecard templates across 6 occasion categories. Each template has: id, name, description, category, categoryLabel, cardType: 'ecard', occasions array, and full defaults object matching ECardData shape.

Distribute across occasions:
- Product Launch: 2 templates
- Client Anniversary: 2 templates
- Employee Welcome: 2 templates
- Quarterly Milestone: 2 templates
- Holiday Greetings: 4 templates (New Year, Holiday, Spring, Winter)
- Thank You: 3 templates

Use varied layouts, color schemes, patterns, and fonts from the existing palette.

**Step 2: Update templates.ts to merge old + new**

```typescript
import { NEW_ECARD_TEMPLATES } from './ecard-templates'

// Add cardType: 'ecard' and occasions to existing 5 templates
// Export merged: export const TEMPLATES = [...existingTemplates, ...NEW_ECARD_TEMPLATES]
```

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/ecard-studio/ecard-templates.ts tools/ecard-studio/templates.ts
git commit -m "feat(ecard-studio): add 15 new ecard templates across 6 occasions"
```

---

### Task 3: Add 10 business card templates

**Files:**
- Create: `tools/ecard-studio/business-card-templates.ts`
- Modify: `tools/ecard-studio/templates.ts` (merge business card templates)

**Step 1: Create business-card-templates.ts**

10 templates with cardType: 'business-card'. Use standard 3.5:2 aspect ratio conceptually. Each template has contact field placeholders in defaults (phone, email, website, address as empty strings).

**Step 2: Merge into TEMPLATES array in templates.ts**

**Step 3: Update BLANK_DEFAULTS to include new fields**

Add `cardType: 'ecard'`, `phone: ''`, `email: ''`, `website: ''`, `address: ''` to BLANK_DEFAULTS.

**Step 4: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 5: Commit**

```bash
git add tools/ecard-studio/business-card-templates.ts tools/ecard-studio/templates.ts
git commit -m "feat(ecard-studio): add 10 business card templates"
```

---

### Task 4: Business card layout in card canvas

**Files:**
- Modify: `tools/ecard-studio/card-canvas.tsx`
- Modify: `tools/ecard-studio/customization-panel.tsx`

**Step 1: Update card-canvas.tsx**

When `cardData.cardType === 'business-card'`:
- Render at 3.5:2 aspect ratio instead of the default ecard ratio
- Use 2-column layout: name/title/company left, contact fields (phone, email, website, address) right
- Contact fields use smaller font, with icons (phone, mail, globe, map-pin)

**Step 2: Update customization-panel.tsx**

When `cardData.cardType === 'business-card'`, show a "Contact Information" section with inputs for phone, email, website, address.

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/ecard-studio/card-canvas.tsx tools/ecard-studio/customization-panel.tsx
git commit -m "feat(ecard-studio): add business card layout with contact fields"
```

---

### Task 5: Discovery page with occasion filtering

**Files:**
- Modify: `app/tools/ecard-studio/page.tsx`
- Create: `tools/ecard-studio/discovery-page.tsx`
- Modify: `tools/ecard-studio/card-editor.tsx` (accept templateId prop)

**Step 1: Create discovery-page.tsx**

Components:
- Hero section: "What's the occasion?" with 6 intent buttons (Product Launch, Client Anniversary, Employee Welcome, Quarterly Milestone, Holiday Greetings, Thank You Note)
- Search bar: filters templates by name, category, occasion
- Category tabs: All | E-Cards | Business Cards
- Occasion filter chips (shown when E-Cards tab active)
- Template grid: 4-column desktop, 2-column mobile
- Each card: colored preview thumbnail, title, category badge, "Personalize" button

**Step 2: Update page.tsx for routing**

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { DiscoveryPage } from '@/tools/ecard-studio/discovery-page'
import { CardEditor } from '@/tools/ecard-studio/card-editor'

function ECardStudioContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')

  if (templateId) {
    return <CardEditor initialTemplate={templateId} />
  }
  return <DiscoveryPage />
}

export default function ECardStudioPage() {
  return (
    <Suspense>
      <ECardStudioContent />
    </Suspense>
  )
}
```

**Step 3: Update card-editor.tsx to accept initialTemplate prop**

```typescript
interface CardEditorProps {
  initialTemplate?: string
}

export function CardEditor({ initialTemplate }: CardEditorProps) {
  const [cardData, setCardData] = useState<ECardData>(() =>
    getInitialCardData((initialTemplate as TemplateId) ?? 'executive')
  )
  // ... rest stays the same
}
```

**Step 4: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 5: Commit**

```bash
git add app/tools/ecard-studio/page.tsx tools/ecard-studio/discovery-page.tsx tools/ecard-studio/card-editor.tsx
git commit -m "feat(ecard-studio): add discovery page with occasion filtering and search"
```

---

### Task 6: Undo/Redo for ECard editor

**Files:**
- Create: `tools/ecard-studio/use-history.ts`
- Modify: `tools/ecard-studio/card-editor.tsx`

**Step 1: Create use-history.ts hook**

```typescript
import { useCallback, useRef, useState } from 'react'

interface UseHistoryReturn<T> {
  state: T
  set: (newState: T) => void
  update: (partial: Partial<T>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function useHistory<T>(initialState: T, maxEntries = 50): UseHistoryReturn<T> {
  const [state, setState] = useState<T>(initialState)
  const historyRef = useRef<T[]>([initialState])
  const pointerRef = useRef(0)

  const set = useCallback((newState: T) => {
    const history = historyRef.current
    const pointer = pointerRef.current
    // Truncate any redo history
    const newHistory = history.slice(0, pointer + 1)
    newHistory.push(newState)
    // Cap at maxEntries
    if (newHistory.length > maxEntries) newHistory.shift()
    historyRef.current = newHistory
    pointerRef.current = newHistory.length - 1
    setState(newState)
  }, [maxEntries])

  const update = useCallback((partial: Partial<T>) => {
    set({ ...historyRef.current[pointerRef.current], ...partial } as T)
  }, [set])

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current -= 1
      setState(historyRef.current[pointerRef.current])
    }
  }, [])

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current += 1
      setState(historyRef.current[pointerRef.current])
    }
  }, [])

  return {
    state,
    set,
    update,
    undo,
    redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < (historyRef.current.length - 1),
  }
}
```

**Step 2: Wire into card-editor.tsx**

Replace `useState<ECardData>` with `useHistory<ECardData>`. Add Undo/Redo buttons to the top bar. Wire Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts.

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/ecard-studio/use-history.ts tools/ecard-studio/card-editor.tsx
git commit -m "feat(ecard-studio): add undo/redo with keyboard shortcuts"
```

---

## Part 2: Human Benchmark Enhancements

### Task 7: Score trend charts (SVG line chart)

**Files:**
- Create: `tools/human-benchmark/score-chart.tsx`
- Modify: `tools/human-benchmark/test-view.tsx` (add chart below stat cards)

**Step 1: Create score-chart.tsx**

Pure SVG line chart component:
- Props: `history: ScoreEntry[]`, `color: string`, `unit: string`, `lowerIsBetter: boolean`
- Show last 20 attempts
- X-axis: attempt number, Y-axis: score value
- Color-coded line using test theme color
- Dots at each data point, hover shows value
- Responsive width, fixed 200px height
- Labels on axes, grid lines

```typescript
interface ScoreChartProps {
  history: ScoreEntry[]
  color: string
  unit: string
  lowerIsBetter: boolean
}

export function ScoreChart({ history, color, unit, lowerIsBetter }: ScoreChartProps) {
  const data = history.slice(-20)
  if (data.length < 2) return null
  // ... SVG rendering logic
}
```

**Step 2: Add to test-view.tsx below StatCards**

Only show when there are 2+ history entries.

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/human-benchmark/score-chart.tsx tools/human-benchmark/test-view.tsx
git commit -m "feat(human-benchmark): add SVG score trend charts"
```

---

### Task 8: Test tips/strategies

**Files:**
- Create: `tools/human-benchmark/test-tips.tsx`
- Create: `tools/human-benchmark/data/tips.ts`
- Modify: `tools/human-benchmark/test-view.tsx`

**Step 1: Create data/tips.ts**

```typescript
export const TEST_TIPS: Record<string, string[]> = {
  'reaction-time': [
    'Focus on the center of the screen, not the edges',
    'Use your dominant hand for faster response',
    'Click with your mouse button already hovering over the target area',
    'Take a deep breath before each attempt to stay calm',
  ],
  'sequence-memory': [
    'Try to group squares into patterns or shapes',
    'Watch the sequence without blinking',
    'Say the positions out loud as they light up',
  ],
  // ... 3-5 tips for each of the 8 tests
}
```

**Step 2: Create test-tips.tsx**

Collapsible card component. Collapsed by default. Remembers open/closed state in localStorage key `hb-tips-${testId}`.

**Step 3: Add to test-view.tsx below results**

**Step 4: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 5: Commit**

```bash
git add tools/human-benchmark/test-tips.tsx tools/human-benchmark/data/tips.ts tools/human-benchmark/test-view.tsx
git commit -m "feat(human-benchmark): add collapsible test tips for all 8 tests"
```

---

### Task 9: Keyboard shortcuts

**Files:**
- Modify: `tools/human-benchmark/test-view.tsx`
- Modify: `tools/human-benchmark/dashboard.tsx`
- Modify each test component in `tools/human-benchmark/tests/*.tsx` (add Space to start)

**Step 1: Add global keyboard handler in test-view.tsx**

- Escape → return to dashboard (`onBack()`)
- Space → start/restart test (pass to test component)

**Step 2: Add "Press Space to start" hint**

Add a small hint below the "Start" button on each test's intro screen.

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/human-benchmark/test-view.tsx tools/human-benchmark/tests/
git commit -m "feat(human-benchmark): add keyboard shortcuts (Space to start, Escape to go back)"
```

---

### Task 10: Share results as image

**Files:**
- Create: `tools/human-benchmark/share-result.tsx`
- Modify: `tools/human-benchmark/test-view.tsx`

**Step 1: Create share-result.tsx**

"Share" button on result screen. Generates a canvas-based image card:
- 600x400px canvas
- Test name, score with unit, rank badge (if applicable)
- Test theme color background gradient
- "toolk1t.com" branding at bottom
- Two actions: "Download PNG" and "Copy to Clipboard"

Use `HTMLCanvasElement` API directly (no extra deps).

**Step 2: Add Share button to test-view.tsx result area**

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/human-benchmark/share-result.tsx tools/human-benchmark/test-view.tsx
git commit -m "feat(human-benchmark): add share results as PNG image"
```

---

### Task 11: Daily challenge

**Files:**
- Create: `tools/human-benchmark/daily-challenge.tsx`
- Modify: `tools/human-benchmark/dashboard.tsx`

**Step 1: Create daily-challenge.tsx**

- Determine today's featured test: `TEST_CONFIGS[dayOfYear % TEST_CONFIGS.length]`
- Show banner card at top of dashboard with:
  - "Daily Challenge" badge
  - Featured test name + description
  - Today's best score (from localStorage key `hb-daily-${YYYY-MM-DD}`)
  - Countdown timer to midnight (next challenge)
  - "Take Challenge" button

**Step 2: Add to dashboard.tsx above the test grid**

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/human-benchmark/daily-challenge.tsx tools/human-benchmark/dashboard.tsx
git commit -m "feat(human-benchmark): add daily challenge with countdown timer"
```

---

## Part 3: Image Editor Enhancements

### Task 12: Navigator panel (minimap)

**Files:**
- Create: `tools/image-editor/navigator-panel.tsx`
- Modify: `tools/image-editor/adjustments-panel.tsx` (add navigator as collapsible section)
- Modify: `tools/image-editor/use-fabric-canvas.ts` (expose viewport bounds)

**Step 1: Expose viewport bounds from use-fabric-canvas.ts**

Add to the API:
```typescript
viewportBounds: { x: number; y: number; width: number; height: number } | null
panTo: (x: number, y: number) => void
```

Track viewport bounds on canvas pan/zoom events.

**Step 2: Create navigator-panel.tsx**

- 150x100px thumbnail of full image (use canvas.toDataURL at reduced scale)
- Blue rectangle overlay showing current viewport bounds
- Click on navigator → calls `panTo` to jump to that area
- Update thumbnail on image load and after filter changes (debounced 500ms)

**Step 3: Add as first collapsible section in adjustments-panel.tsx**

**Step 4: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 5: Commit**

```bash
git add tools/image-editor/navigator-panel.tsx tools/image-editor/adjustments-panel.tsx tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): add navigator minimap panel"
```

---

### Task 13: Sharpen adjustment slider

**Files:**
- Modify: `tools/image-editor/adjustments-panel.tsx` (add Sharpen slider)
- Modify: `tools/image-editor/use-fabric-canvas.ts` (add sharpen filter logic)

**Step 1: Add Sharpen to Adjustments interface**

In adjustments-panel.tsx, add `sharpen: number` (0-100, default 0) to the Adjustments interface and add a slider in the UI.

**Step 2: Implement sharpen filter in use-fabric-canvas.ts**

Use Fabric.js `Convolute` filter with a sharpening kernel:
```
[0, -1, 0, -1, 5, -1, 0, -1, 0]
```
Scale the kernel intensity based on slider value (0 = no effect, 100 = full sharpen).

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/image-editor/adjustments-panel.tsx tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): add sharpen adjustment slider"
```

---

### Task 14: Layer thumbnails

**Files:**
- Modify: `tools/image-editor/layers-panel.tsx`
- Modify: `tools/image-editor/use-fabric-canvas.ts` (add layer thumbnail generation)

**Step 1: Add thumbnail generation to use-fabric-canvas.ts**

- Generate 40x40px canvas thumbnail per layer
- Debounce updates (300ms) on layer content change
- Expose `layerThumbnails: Record<string, string>` in API (layer id → data URL)
- Fallback: empty layer icon for layers with no content

**Step 2: Update layers-panel.tsx**

Show 40x40px thumbnail next to each layer name. Use a gray placeholder icon for empty layers.

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/image-editor/layers-panel.tsx tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): add layer thumbnails in layers panel"
```

---

### Task 15: History filmstrip

**Files:**
- Create: `tools/image-editor/history-strip.tsx`
- Modify: `tools/image-editor/use-fabric-canvas.ts` (expose history entries with labels + thumbnails)

**Step 1: Enhance history tracking in use-fabric-canvas.ts**

Currently tracks undo/redo states. Enhance to also store:
- Label (e.g., "Brightness +20", "Filter: Valencia", "Rotate CW")
- Small thumbnail (100x75px data URL, generated on state push)
- Max 20 visible entries

Expose: `historyEntries: { label: string; thumbnail: string; index: number }[]`, `historyIndex: number`, `goToHistory: (index: number) => void`

**Step 2: Create history-strip.tsx**

Horizontal scrollable strip at bottom of canvas area:
- Each entry: small thumbnail + label text below
- Current state highlighted with blue border
- Click to revert to that state
- Auto-scroll to keep current state visible

**Step 3: Add to the image editor page layout below the canvas**

**Step 4: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 5: Commit**

```bash
git add tools/image-editor/history-strip.tsx tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): add history filmstrip with thumbnails"
```

---

### Task 16: Export presets

**Files:**
- Create: `tools/image-editor/export-dialog.tsx`
- Modify: `tools/image-editor/editor-toolbar.tsx` (add export preset button)
- Modify: `tools/image-editor/use-fabric-canvas.ts` (add export with resize)

**Step 1: Define export presets**

```typescript
const EXPORT_PRESETS = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'Facebook Cover', width: 820, height: 312 },
  { name: 'Print A4', width: 2480, height: 3508 },
  { name: 'Custom', width: 0, height: 0 },
] as const
```

**Step 2: Create export-dialog.tsx**

Modal dialog with:
- Preset dropdown/buttons
- Custom width/height inputs (shown when "Custom" selected)
- Format selection: PNG / JPEG / WEBP radio buttons
- Quality slider (10-100%) for JPEG/WEBP
- Preview of output dimensions
- "Export" button

**Step 3: Add exportWithPreset to use-fabric-canvas.ts**

Resize canvas to target dimensions, export in chosen format/quality, then restore original size.

**Step 4: Add "Export" dropdown button to editor-toolbar.tsx**

**Step 5: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 6: Commit**

```bash
git add tools/image-editor/export-dialog.tsx tools/image-editor/editor-toolbar.tsx tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): add export presets with format and quality options"
```

---

## Part 4: PDF Converter Enhancements

### Task 17: Conversion history

**Files:**
- Create: `tools/pdf-converter/conversion-history.tsx`
- Create: `tools/pdf-converter/use-conversion-history.ts`
- Modify: `tools/pdf-converter/output-preview.tsx` (log completed conversions)

**Step 1: Create use-conversion-history.ts**

```typescript
interface ConversionRecord {
  id: string
  filename: string
  mode: string
  timestamp: number
  inputSize: number
  outputSize: number
  status: 'success' | 'error'
}

// localStorage key: 'pdf-converter-history'
// Max 20 entries
// Functions: addRecord, getRecords, clearHistory
```

**Step 2: Create conversion-history.tsx**

"Recent Conversions" section below upload zone:
- Table/list with columns: filename, mode, date, input/output size, status
- "Clear History" button
- Empty state: "No conversions yet"

**Step 3: Call addRecord after each successful conversion in output-preview.tsx**

**Step 4: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 5: Commit**

```bash
git add tools/pdf-converter/conversion-history.tsx tools/pdf-converter/use-conversion-history.ts tools/pdf-converter/output-preview.tsx
git commit -m "feat(pdf-converter): add conversion history with localStorage persistence"
```

---

### Task 18: Drag-and-drop page reordering

**Files:**
- Modify: `tools/pdf-converter/file-list.tsx`

**Step 1: Replace click-based move up/down with HTML5 drag-and-drop**

- Add `draggable` attribute and drag handle icon (6-dot grip) to each file/page item
- Implement `onDragStart`, `onDragOver`, `onDragEnd`, `onDrop` handlers
- Show drop indicator line between items during drag
- Update the files array order on drop
- Works for all modes that show file lists: merge-pdf, images-to-pdf, page-manager

**Step 2: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 3: Commit**

```bash
git add tools/pdf-converter/file-list.tsx
git commit -m "feat(pdf-converter): replace move up/down with drag-and-drop reordering"
```

---

### Task 19: Output format options + file size comparison

**Files:**
- Modify: `tools/pdf-converter/mode-options.tsx` (add format/quality options for pdf-to-images)
- Modify: `tools/pdf-converter/output-preview.tsx` (show size comparison)

**Step 1: Add format options for PDF→Images mode**

In mode-options.tsx, when mode is `pdf-to-images`:
- Radio buttons: PNG / JPEG / WEBP
- Quality slider (10-100%) visible only for JPEG/WEBP
- Pass format and quality to the processor

**Step 2: Add file size comparison to output-preview.tsx**

After processing, show:
- Input size → Output size (reduction %)
- Color-coded: green for reduction (>10%), yellow for similar (±10%), red for increase (>10%)
- Format sizes with `formatBytes()` helper

**Step 3: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 4: Commit**

```bash
git add tools/pdf-converter/mode-options.tsx tools/pdf-converter/output-preview.tsx
git commit -m "feat(pdf-converter): add output format options and file size comparison"
```

---

### Task 20: Web Worker for PDF processing

**Files:**
- Create: `tools/pdf-converter/pdf-worker.ts`
- Create: `tools/pdf-converter/use-pdf-worker.ts`
- Modify: `tools/pdf-converter/output-preview.tsx` (use worker for processing)

**Step 1: Create pdf-worker.ts**

Web Worker that handles pdf-lib and pdfjs-dist operations:
- Receives messages: `{ type: 'process', mode, files, options }`
- Posts progress: `{ type: 'progress', percent, label }`
- Posts result: `{ type: 'result', output }` or `{ type: 'error', message }`
- Supports cancel via `AbortController` pattern

**Step 2: Create use-pdf-worker.ts hook**

```typescript
interface UsePdfWorkerReturn {
  process: (mode: string, files: File[], options: unknown) => Promise<Blob[]>
  progress: number
  progressLabel: string
  isProcessing: boolean
  cancel: () => void
}
```

Falls back to main-thread processing if Worker is unavailable.

**Step 3: Wire into output-preview.tsx**

Replace direct processor calls with worker-based processing. Show animated progress bar with cancel button.

**Step 4: Build and verify**

Run: `pnpm build 2>&1 | head -40`

**Step 5: Commit**

```bash
git add tools/pdf-converter/pdf-worker.ts tools/pdf-converter/use-pdf-worker.ts tools/pdf-converter/output-preview.tsx
git commit -m "feat(pdf-converter): move PDF processing to Web Worker with progress and cancel"
```

---

## Final Verification

### Task 21: Full build and smoke test

**Step 1: Run full build**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm build
```

**Step 2: Visual smoke test all 4 tools**

Use webapp-testing skill to verify:
- ECard Studio: discovery page loads, template filtering works, editor opens with template, business card layout renders, undo/redo works
- Human Benchmark: daily challenge shows, score chart renders with history, tips section expands, share generates image
- Image Editor: navigator panel shows with image, sharpen slider works, layer thumbnails appear, history strip shows, export dialog opens
- PDF Converter: conversion history shows after processing, drag-and-drop reorders files, format options appear for pdf-to-images, size comparison displays

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete 4-tool enhancement — ecard studio, human benchmark, image editor, pdf converter"
```
