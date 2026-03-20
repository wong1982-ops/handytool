# Favicon Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Favicon Generator with 4 creation methods (upload, text/emoji, icon library, AI), live preview mockups, and full favicon package export (ICO, PNGs, manifest, HTML tags).

**Architecture:** Single-page tool with tabbed creation area (left) + live preview & export panel (right). Pure Canvas rendering function takes a FaviconConfig and produces canvases at any size. All export (ZIP, ICO) is client-side via JSZip. AI generation is server-side via existing Gemini API.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Canvas API, JSZip (already installed), Lucide icons (bundled subset), Iconify API (free, no key), Tailwind CSS v4.

**Design doc:** `docs/plans/2026-03-19-favicon-generator-design.md`

---

### Task 1: Types & Canvas Renderer

**Files:**
- Create: `tools/favicon-generator/types.ts`
- Create: `tools/favicon-generator/favicon-canvas.ts`

**Step 1: Create types**

```typescript
// tools/favicon-generator/types.ts

export type CreationMode = 'upload' | 'text' | 'icon' | 'ai'
export type FaviconShape = 'circle' | 'square' | 'rounded' | 'hexagon'
export type BgType = 'solid' | 'gradient' | 'transparent'
export type FontFamily = 'sans' | 'serif' | 'mono' | 'rounded' | 'handwritten'

export interface GradientConfig {
  from: string
  to: string
  angle: number
}

export interface BorderConfig {
  enabled: boolean
  color: string
  width: number // 1-4
}

export interface ShadowConfig {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export interface FaviconConfig {
  mode: CreationMode

  // Source content (varies by mode)
  imageData?: string       // base64 data URL (upload / AI result)
  text?: string            // text/emoji characters
  iconSvg?: string         // SVG string from icon library

  // Crop (upload mode)
  cropX: number
  cropY: number
  cropZoom: number

  // Shared styling
  shape: FaviconShape
  bgType: BgType
  bgColor: string
  bgGradient: GradientConfig
  fgColor: string
  fontSize: number         // percentage 50-100 (auto-fit)
  fontFamily: FontFamily
  padding: number          // percentage 0-40
  border: BorderConfig
  shadow: ShadowConfig
}

export const DEFAULT_CONFIG: FaviconConfig = {
  mode: 'text',
  text: 'A',
  cropX: 0,
  cropY: 0,
  cropZoom: 1,
  shape: 'rounded',
  bgType: 'solid',
  bgColor: '#3D6AF2',
  bgGradient: { from: '#3D6AF2', to: '#8B5CF6', angle: 135 },
  fgColor: '#FFFFFF',
  fontSize: 70,
  fontFamily: 'sans',
  padding: 15,
  border: { enabled: false, color: '#000000', width: 2 },
  shadow: { enabled: false, color: 'rgba(0,0,0,0.3)', blur: 4, offsetX: 0, offsetY: 2 },
}

export interface ExportSize {
  width: number
  height: number
  label: string
  filename: string
  checked: boolean
}

export const EXPORT_SIZES: ExportSize[] = [
  { width: 16, height: 16, label: '16x16', filename: 'favicon-16x16.png', checked: true },
  { width: 32, height: 32, label: '32x32', filename: 'favicon-32x32.png', checked: true },
  { width: 48, height: 48, label: '48x48', filename: 'favicon-48x48.png', checked: true },
  { width: 180, height: 180, label: '180x180 (Apple Touch)', filename: 'apple-touch-icon.png', checked: true },
  { width: 192, height: 192, label: '192x192 (Android)', filename: 'android-chrome-192x192.png', checked: true },
  { width: 512, height: 512, label: '512x512 (PWA)', filename: 'android-chrome-512x512.png', checked: true },
]

export const FONT_MAP: Record<FontFamily, string> = {
  sans: 'system-ui, -apple-system, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", monospace',
  rounded: '"Nunito", system-ui, sans-serif',
  handwritten: '"Comic Sans MS", "Segoe Print", cursive',
}

export const SHAPE_LABELS: Record<FaviconShape, string> = {
  circle: 'Circle',
  square: 'Square',
  rounded: 'Rounded',
  hexagon: 'Hexagon',
}
```

**Step 2: Create the Canvas renderer**

Pure function: takes FaviconConfig + size → returns HTMLCanvasElement. This is the core rendering engine used by preview and export.

```typescript
// tools/favicon-generator/favicon-canvas.ts

import type { FaviconConfig } from './types'
import { FONT_MAP } from './types'

/**
 * Render a favicon to a canvas at the specified size.
 * Pure function — no React, no side effects.
 */
export function renderFavicon(config: FaviconConfig, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 1. Apply shape clipping
  applyShapeClip(ctx, config.shape, size)

  // 2. Draw background
  drawBackground(ctx, config, size)

  // 3. Draw content (image, text, or SVG icon)
  drawContent(ctx, config, size)

  // 4. Draw border (on top of content, inside shape)
  if (config.border.enabled) {
    drawBorder(ctx, config, size)
  }

  return canvas
}

function applyShapeClip(ctx: CanvasRenderingContext2D, shape: FaviconConfig['shape'], size: number) {
  ctx.beginPath()
  const r = size / 2
  switch (shape) {
    case 'circle':
      ctx.arc(r, r, r, 0, Math.PI * 2)
      break
    case 'square':
      ctx.rect(0, 0, size, size)
      break
    case 'rounded': {
      const radius = size * 0.2
      ctx.moveTo(radius, 0)
      ctx.lineTo(size - radius, 0)
      ctx.quadraticCurveTo(size, 0, size, radius)
      ctx.lineTo(size, size - radius)
      ctx.quadraticCurveTo(size, size, size - radius, size)
      ctx.lineTo(radius, size)
      ctx.quadraticCurveTo(0, size, 0, size - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      break
    }
    case 'hexagon': {
      const cx = r, cy = r
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      break
    }
  }
  ctx.closePath()
  ctx.clip()
}

function drawBackground(ctx: CanvasRenderingContext2D, config: FaviconConfig, size: number) {
  if (config.bgType === 'transparent') return

  if (config.bgType === 'gradient') {
    const { from, to, angle } = config.bgGradient
    const rad = (angle * Math.PI) / 180
    const x1 = size / 2 - (size / 2) * Math.cos(rad)
    const y1 = size / 2 - (size / 2) * Math.sin(rad)
    const x2 = size / 2 + (size / 2) * Math.cos(rad)
    const y2 = size / 2 + (size / 2) * Math.sin(rad)
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    gradient.addColorStop(0, from)
    gradient.addColorStop(1, to)
    ctx.fillStyle = gradient
  } else {
    ctx.fillStyle = config.bgColor
  }

  ctx.fillRect(0, 0, size, size)
}

function drawContent(ctx: CanvasRenderingContext2D, config: FaviconConfig, size: number) {
  const pad = size * (config.padding / 100)
  const innerSize = size - pad * 2

  // Apply shadow if enabled
  if (config.shadow.enabled) {
    ctx.shadowColor = config.shadow.color
    ctx.shadowBlur = config.shadow.blur * (size / 512)
    ctx.shadowOffsetX = config.shadow.offsetX * (size / 512)
    ctx.shadowOffsetY = config.shadow.offsetY * (size / 512)
  }

  if (config.mode === 'upload' && config.imageData) {
    // Image mode: draw the uploaded/AI image
    const img = new Image()
    img.src = config.imageData
    // Note: For sync rendering, imageData should already be loaded.
    // The caller should ensure the image is preloaded.
    ctx.drawImage(img, pad, pad, innerSize, innerSize)
  } else if ((config.mode === 'text' || config.mode === 'ai') && config.text) {
    // Text/emoji mode
    const fontPx = innerSize * (config.fontSize / 100)
    ctx.font = `bold ${fontPx}px ${FONT_MAP[config.fontFamily]}`
    ctx.fillStyle = config.fgColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(config.text, size / 2, size / 2)
  } else if (config.mode === 'icon' && config.iconSvg) {
    // SVG icon: render via Image with data URL
    const svgBlob = new Blob([config.iconSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.src = url
    ctx.drawImage(img, pad, pad, innerSize, innerSize)
    URL.revokeObjectURL(url)
  }

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

function drawBorder(ctx: CanvasRenderingContext2D, config: FaviconConfig, size: number) {
  const bw = config.border.width * (size / 64) // scale border with size
  ctx.save()
  // Re-create the shape path for stroking
  ctx.beginPath()
  const r = size / 2
  switch (config.shape) {
    case 'circle':
      ctx.arc(r, r, r - bw / 2, 0, Math.PI * 2)
      break
    case 'square':
      ctx.rect(bw / 2, bw / 2, size - bw, size - bw)
      break
    case 'rounded': {
      const radius = size * 0.2
      const o = bw / 2
      ctx.moveTo(radius + o, o)
      ctx.lineTo(size - radius - o, o)
      ctx.quadraticCurveTo(size - o, o, size - o, radius + o)
      ctx.lineTo(size - o, size - radius - o)
      ctx.quadraticCurveTo(size - o, size - o, size - radius - o, size - o)
      ctx.lineTo(radius + o, size - o)
      ctx.quadraticCurveTo(o, size - o, o, size - radius - o)
      ctx.lineTo(o, radius + o)
      ctx.quadraticCurveTo(o, o, radius + o, o)
      break
    }
    case 'hexagon': {
      const cx = r, cy = r, hr = r - bw / 2
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const x = cx + hr * Math.cos(angle)
        const y = cy + hr * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      break
    }
  }
  ctx.closePath()
  ctx.strokeStyle = config.border.color
  ctx.lineWidth = bw
  ctx.stroke()
  ctx.restore()
}

/**
 * Render favicon and return as data URL (PNG).
 */
export function renderFaviconDataUrl(config: FaviconConfig, size: number): string {
  return renderFavicon(config, size).toDataURL('image/png')
}

/**
 * Render favicon and return as Blob (PNG).
 */
export function renderFaviconBlob(config: FaviconConfig, size: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    renderFavicon(config, size).toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      'image/png',
    )
  })
}
```

**Step 3: Commit**

```bash
git add tools/favicon-generator/types.ts tools/favicon-generator/favicon-canvas.ts
git commit -m "feat(favicon-generator): add types and Canvas rendering engine"
```

---

### Task 2: ICO Encoder & Export Utilities

**Files:**
- Create: `tools/favicon-generator/ico-encoder.ts`
- Create: `tools/favicon-generator/export-utils.ts`

**Step 1: Create ICO binary encoder**

Client-side ICO generation: takes multiple PNG blobs, produces a single .ico Blob.

```typescript
// tools/favicon-generator/ico-encoder.ts

/**
 * Encode multiple PNG images into a single ICO file.
 * ICO format: header + directory entries + image data (PNG stored as-is).
 */
export async function encodeIco(pngs: { size: number; blob: Blob }[]): Promise<Blob> {
  const imageBuffers = await Promise.all(
    pngs.map(async (p) => new Uint8Array(await p.blob.arrayBuffer()))
  )

  // ICO header: 6 bytes
  // Directory entry: 16 bytes per image
  // Image data: concatenated PNG blobs
  const headerSize = 6
  const dirSize = 16 * pngs.length
  let dataOffset = headerSize + dirSize

  // Build header
  const header = new ArrayBuffer(headerSize)
  const hv = new DataView(header)
  hv.setUint16(0, 0, true)          // reserved
  hv.setUint16(2, 1, true)          // type: ICO
  hv.setUint16(4, pngs.length, true) // image count

  // Build directory entries
  const dir = new ArrayBuffer(dirSize)
  const dv = new DataView(dir)
  for (let i = 0; i < pngs.length; i++) {
    const off = i * 16
    const s = pngs[i].size
    dv.setUint8(off + 0, s >= 256 ? 0 : s)  // width (0 = 256)
    dv.setUint8(off + 1, s >= 256 ? 0 : s)  // height
    dv.setUint8(off + 2, 0)                  // color palette
    dv.setUint8(off + 3, 0)                  // reserved
    dv.setUint16(off + 4, 1, true)           // color planes
    dv.setUint16(off + 6, 32, true)          // bits per pixel
    dv.setUint32(off + 8, imageBuffers[i].length, true) // image size
    dv.setUint32(off + 12, dataOffset, true) // offset to image data
    dataOffset += imageBuffers[i].length
  }

  return new Blob(
    [header, dir, ...imageBuffers],
    { type: 'image/x-icon' },
  )
}
```

**Step 2: Create export utilities**

```typescript
// tools/favicon-generator/export-utils.ts

import JSZip from 'jszip'
import type { FaviconConfig, ExportSize } from './types'
import { renderFaviconBlob } from './favicon-canvas'
import { encodeIco } from './ico-encoder'

/**
 * Generate a ZIP containing all favicon files.
 */
export async function generateFaviconZip(
  config: FaviconConfig,
  sizes: ExportSize[],
): Promise<Blob> {
  const zip = new JSZip()
  const checked = sizes.filter((s) => s.checked)

  // Generate individual PNGs
  const pngEntries: { size: ExportSize; blob: Blob }[] = []
  for (const size of checked) {
    const blob = await renderFaviconBlob(config, size.width)
    pngEntries.push({ size, blob })
    zip.file(size.filename, blob)
  }

  // Generate ICO from 16, 32, 48 sizes
  const icoSizes = pngEntries.filter((e) => [16, 32, 48].includes(e.size.width))
  if (icoSizes.length > 0) {
    try {
      const icoBlob = await encodeIco(
        icoSizes.map((e) => ({ size: e.size.width, blob: e.blob })),
      )
      zip.file('favicon.ico', icoBlob)
    } catch {
      // ICO encoding failed — skip, PNGs are still in the ZIP
    }
  }

  return zip.generateAsync({ type: 'blob' })
}

/**
 * Generate HTML <link> tags for favicon.
 */
export function generateHtmlTags(): string {
  return `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`
}

/**
 * Generate manifest.json icons array.
 */
export function generateManifestJson(): string {
  return JSON.stringify({
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2)
}

/**
 * Trigger a browser download for a Blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

**Step 3: Commit**

```bash
git add tools/favicon-generator/ico-encoder.ts tools/favicon-generator/export-utils.ts
git commit -m "feat(favicon-generator): add ICO encoder and export utilities (ZIP, HTML, manifest)"
```

---

### Task 3: Text/Emoji Tab + Shared Style Controls

**Files:**
- Create: `tools/favicon-generator/style-controls.tsx`
- Create: `tools/favicon-generator/text-tab.tsx`

**Step 1: Create shared style controls**

These controls (shape, bg, border, shadow, padding) are reused by text-tab and icon-tab.

The style controls component should include:
- Shape selector (circle/square/rounded/hexagon) as visual button group
- Background type toggle (solid/gradient/transparent)
- Color pickers for bg, gradient from/to, fg color
- Gradient angle slider (0-360)
- Font family selector (5 options)
- Font size slider (50-100%)
- Padding slider (0-40%)
- Border toggle + color + width slider
- Shadow toggle + color + blur + offset sliders

All using native `<input type="color">`, `<input type="range">`, and button groups.
Touch targets min 44px. Dark mode support.

**Step 2: Create text tab**

- Text input field (max 10 chars, recommended 1-3)
- Warning when >3 chars
- Integrates StyleControls for all customization
- Calls `onConfigChange` with every update

**Step 3: Commit**

```bash
git add tools/favicon-generator/style-controls.tsx tools/favicon-generator/text-tab.tsx
git commit -m "feat(favicon-generator): add text/emoji tab with full style controls"
```

---

### Task 4: Upload Tab

**Files:**
- Create: `tools/favicon-generator/upload-tab.tsx`

**Step 1: Build upload tab**

- Drag & drop zone (accepts PNG/JPG/SVG/WebP, max 10MB)
- After upload: shows image preview with zoom slider (1x-3x)
- Background color picker for transparent images
- File validation (type + size) with error messages
- Converts upload to base64 data URL for FaviconConfig.imageData
- Apply button sets mode='upload' on config

**Step 2: Commit**

```bash
git add tools/favicon-generator/upload-tab.tsx
git commit -m "feat(favicon-generator): add upload tab with drag & drop and zoom"
```

---

### Task 5: Icon Library Tab

**Files:**
- Create: `tools/favicon-generator/icon-data.ts`
- Create: `tools/favicon-generator/icon-tab.tsx`

**Step 1: Create bundled icon data**

Curate ~100 popular icons from Lucide as inline SVG strings (not 500 — keep bundle small, Iconify API covers the rest). Categories: Common, Social, Dev, Arrows, Media, Commerce.

```typescript
// tools/favicon-generator/icon-data.ts
export interface BundledIcon {
  name: string
  category: string
  svg: string // raw SVG string (24x24 viewBox)
}

export const ICON_CATEGORIES = ['Common', 'Social', 'Dev', 'Media', 'Commerce', 'Arrows'] as const

export const BUNDLED_ICONS: BundledIcon[] = [
  // ... ~100 icons with SVG strings
]
```

**Step 2: Create icon tab**

- Search input (debounced 300ms)
- Category filter pills
- Grid of icon buttons (bundled icons shown by default)
- When searching: fetch from Iconify API (`https://api.iconify.design/search?query=...&limit=40`)
- Click icon → sets config.iconSvg + mode='icon'
- Reuses StyleControls for color/bg/shape customization
- Fallback: if Iconify API fails, show only bundled icons

**Step 3: Commit**

```bash
git add tools/favicon-generator/icon-data.ts tools/favicon-generator/icon-tab.tsx
git commit -m "feat(favicon-generator): add icon library tab with bundled icons + Iconify search"
```

---

### Task 6: AI Generate Tab

**Files:**
- Create: `tools/favicon-generator/ai-tab.tsx`

**Step 1: Build AI tab**

- Prompt textarea ("Describe your favicon...")
- Style selector pills: Flat, 3D, Pixel Art, Minimal, Gradient
- Generate button showing credit cost (1 credit)
- Auth gate: if not signed in, show sign-in prompt
- On generate: POST to `/api/v1/favicon/generate` (to be created later, for now show placeholder)
- Results: grid of 4 thumbnails, click to select
- Selected result sets config.imageData + mode='ai'
- Error states: insufficient credits, generation failed, content blocked

For initial implementation, the AI tab can be a placeholder UI that shows "Coming soon — AI generation requires server integration" until the API route is built. The UI structure should be complete.

**Step 2: Commit**

```bash
git add tools/favicon-generator/ai-tab.tsx
git commit -m "feat(favicon-generator): add AI generate tab (UI ready, API placeholder)"
```

---

### Task 7: Preview Panel

**Files:**
- Create: `tools/favicon-generator/preview-panel.tsx`

**Step 1: Build the four preview mockups**

Each mockup is a styled `<div>` composition:

1. **Browser Tab** — tab bar with favicon (16px rendered to data URL), "My Website" title, "mywebsite.com" URL
2. **Bookmarks Bar** — row of bookmark pills, one with the favicon + "My Site"
3. **Mobile Home Screen** — phone outline (rounded rect border), 3x3 app grid, center app is the favicon (192px) with "My App" label
4. **Google Search** — search result card with favicon (16px) + "mywebsite.com" + blue title + grey description

All read from `FaviconConfig` via the `renderFaviconDataUrl` function. Update on every config change. Adapt to dark mode.

On mobile: collapsible accordion (closed by default to save space).

**Step 2: Commit**

```bash
git add tools/favicon-generator/preview-panel.tsx
git commit -m "feat(favicon-generator): add preview panel with 4 context mockups"
```

---

### Task 8: Export Panel

**Files:**
- Create: `tools/favicon-generator/export-panel.tsx`

**Step 1: Build export panel**

- Size checkboxes (all checked by default, using EXPORT_SIZES)
- Download ZIP button — calls `generateFaviconZip`, then `downloadBlob`
- Copy HTML Tags button — copies `generateHtmlTags()` to clipboard
- Copy manifest.json button — copies `generateManifestJson()` to clipboard
- Disable download if no favicon is configured yet
- Loading spinner during ZIP generation
- Each copy button shows "Copied!" feedback (2s)

**Step 2: Commit**

```bash
git add tools/favicon-generator/export-panel.tsx
git commit -m "feat(favicon-generator): add export panel with ZIP download and copy snippets"
```

---

### Task 9: Page Route — Wire Everything Together

**Files:**
- Create: `app/tools/favicon-generator/page.tsx`

**Step 1: Build the page**

- `'use client'` page
- State: `useState<FaviconConfig>(DEFAULT_CONFIG)`, `activeTab` state
- Layout: breadcrumb, title/subtitle, two-panel (creation + preview/export)
- Tab buttons: Upload | Text | Icons | AI
- Active tab renders the corresponding component
- Preview panel and export panel on the right (stacked below on mobile)
- All tabs call `setConfig` to update the shared state
- Preview and export read from config

**Step 2: Verify build passes**

Run: `pnpm build`
Expected: Build passes with new `/tools/favicon-generator` route.

**Step 3: Commit**

```bash
git add app/tools/favicon-generator/page.tsx
git commit -m "feat(favicon-generator): add page route wiring all components"
```

---

### Task 10: Register in Tool Library & Deploy

**Files:**
- Modify: `lib/tools.tsx`

**Step 1: Add Favicon Generator to tools array**

Add after Regex Tester entry:

```typescript
{
  name: 'Favicon Generator',
  href: '/tools/favicon-generator',
  description: 'Create favicons from text, icons, images, or AI',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
    </svg>
  ),
  color: 'from-fuchsia-500 to-pink-400',
},
```

**Step 2: Verify build**

Run: `pnpm build`

**Step 3: Commit and push**

```bash
git add lib/tools.tsx
git commit -m "feat(favicon-generator): register tool in homepage grid"
git push origin main
```
