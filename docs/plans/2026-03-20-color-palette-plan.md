# Color Palette Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Color Palette Generator with color theory wheel, image extraction (Web Worker), AI generation, 5-color palettes with 50-950 tint/shade scales, full export formats (CSS/Tailwind/SCSS/JSON/ASE/PNG), accessibility checking (contrast matrix + color blindness simulation), and shareable URLs.

**Architecture:** Single-page tool with persistent palette strip (top), tabbed generation area (left), and export/accessibility panels (right). All color math (conversions, harmonies, tint/shade, contrast, color blindness simulation) is pure client-side. Image extraction runs in a Web Worker. Palettes saved to localStorage, shared via URL hash.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Canvas API, Web Workers, OKLCH color space, Brettel algorithm, JSZip (for ASE), Tailwind CSS v4.

**Design doc:** `docs/plans/2026-03-20-color-palette-design.md`

---

### Task 1: Types & Color Utilities

**Files:**
- Create: `tools/color-palette/types.ts`
- Create: `tools/color-palette/color-utils.ts`

**Step 1: Create types**

Types file with all interfaces, constants, and defaults:

- `PaletteColor { hex, locked, name }`
- `Palette` — tuple of 5 PaletteColors
- `HarmonyRule = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic' | 'square' | 'custom'`
- `HARMONY_LABELS: Record<HarmonyRule, string>`
- `DEFAULT_PALETTE` — 5 default colors (blue, purple, pink, amber, green) with names primary/secondary/accent/neutral/highlight
- `COLOR_NAMES = ['primary', 'secondary', 'accent', 'neutral', 'highlight']`
- `SavedPalette { id, name, colors: string[], createdAt }`
- `TintShadeScale` — array of 11 `{ step: number, hex: string }` entries (50-950)

**Step 2: Create color utilities**

Pure functions — no React, no DOM:

- `hexToRgb(hex): { r, g, b }` and `rgbToHex(r, g, b): string`
- `rgbToHsl(r, g, b): { h, s, l }` and `hslToRgb(h, s, l): { r, g, b }`
- `rgbToOklch(r, g, b): { l, c, h }` and `oklchToRgb(l, c, h): { r, g, b }`
- `generateTintShadeScale(hex): TintShadeScale` — 11 steps via OKLCH interpolation (50=very light → 500=base → 950=very dark)
- `generateHarmony(baseHex, rule: HarmonyRule): string[]` — returns 5 hex colors based on the harmony rule (rotates hue in HSL)
  - Complementary: base, +180, +150, +210, +90
  - Analogous: base, +30, -30, +60, -60
  - Triadic: base, +120, +240, +60, +300
  - Split-complementary: base, +150, +210, +30, -30
  - Tetradic: base, +90, +180, +270, +45
  - Monochromatic: base with 5 different lightness values
  - Square: base, +90, +180, +270, +45
  - Custom: returns current colors unchanged
- `contrastRatio(hex1, hex2): number` — WCAG relative luminance formula
- `meetsAA(ratio): boolean` (>=4.5) and `meetsAAA(ratio): boolean` (>=7)
- `simulateColorBlindness(hex, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string` — Brettel algorithm, returns simulated hex
- `randomColor(): string` — random hex
- `suggestTextColor(bgHex): string` — returns '#000000' or '#FFFFFF' based on luminance

**Step 3: Commit**

```bash
git add tools/color-palette/types.ts tools/color-palette/color-utils.ts
git commit -m "feat(color-palette): add types and color utility functions (OKLCH, harmony, contrast, Brettel)"
```

---

### Task 2: Palette Strip Component

**Files:**
- Create: `tools/color-palette/palette-strip.tsx`
- Create: `tools/color-palette/color-picker-popover.tsx`

**Step 1: Create color picker popover**

Small popover component shown when user clicks a swatch to edit it:
- Hex input field (with # prefix, validates hex format)
- HSL sliders (hue 0-360, saturation 0-100, lightness 0-100)
- Live preview swatch
- Close on click outside or Escape
- Props: `color: string, onChange: (hex: string) => void, onClose: () => void`

**Step 2: Create palette strip**

Persistent horizontal strip showing 5 swatches. Props: `colors: PaletteColor[], onColorChange: (index, hex) => void, onToggleLock: (index) => void, onShuffle: () => void, expandedIndex: number | null, onExpandToggle: (index) => void`

Each swatch:
- Color block (~80px wide desktop, flex on mobile)
- Hex label below the block
- Copy button (small clipboard icon, copies hex)
- Lock toggle (lock/unlock icon, locked = color preserved during regeneration)
- Click on color block → opens ColorPickerPopover
- Click on expand arrow → toggles tint/shade scale

Tint/shade scale (shown below strip when expanded):
- Call `generateTintShadeScale(colors[expandedIndex].hex)`
- Show 11 horizontal swatches (50-950) with step label + hex
- Each step clickable to copy hex
- Horizontal scroll on mobile

Shuffle button at the end of the strip — randomizes unlocked colors.

**Step 3: Commit**

```bash
git add tools/color-palette/palette-strip.tsx tools/color-palette/color-picker-popover.tsx
git commit -m "feat(color-palette): add palette strip with tint/shade scale and color picker"
```

---

### Task 3: Color Wheel Tab

**Files:**
- Create: `tools/color-palette/color-wheel-tab.tsx`

**Step 1: Build the color wheel tab**

Interactive color wheel with harmony rules:

- SVG color wheel: hue ring drawn with conic-gradient (or arc segments), 200-300px diameter
- 5 small circles on the wheel representing current palette colors
- Dragging the primary dot (index 0) rotates all dots according to harmony rule
- Harmony rule selector: pill group with all 8 rules
- Custom mode: each dot independently draggable
- Base color section below wheel: hex input + H/S/L sliders for fine control
- "Generate" button: applies `generateHarmony(baseColor, rule)` and updates palette

The wheel can be simplified: instead of a full draggable SVG wheel, use a hue slider (0-360) + saturation slider (0-100) as the primary input, with a circular hue visualization above showing dot positions. This is more touch-friendly and easier to implement.

Props: `colors: PaletteColor[], harmonyRule: HarmonyRule, onColorsChange: (colors) => void, onRuleChange: (rule) => void`

**Step 2: Commit**

```bash
git add tools/color-palette/color-wheel-tab.tsx
git commit -m "feat(color-palette): add color wheel tab with harmony rules"
```

---

### Task 4: Image Extraction Tab + Web Worker

**Files:**
- Create: `tools/color-palette/extraction-worker.ts`
- Create: `tools/color-palette/image-tab.tsx`

**Step 1: Create the Web Worker**

Median cut color quantization algorithm:
- Input: ImageData (pixel array) + desired color count
- Process: recursively split color buckets by the channel with the widest range
- Output: array of dominant hex colors, sorted by frequency
- Self-contained — no imports (workers can't import from project modules)

File should export nothing (it's a worker script). Use `self.onmessage` / `self.postMessage`.

Message protocol:
- In: `{ imageData: Uint8ClampedArray, width: number, height: number, colorCount: number }`
- Out: `{ colors: string[] }` or `{ error: string }`

**Step 2: Create image extraction tab**

Props: `onApply: (colors: string[]) => void`

- Drag & drop zone (PNG/JPG/WebP, max 10MB)
- After upload: draw to hidden canvas, extract ImageData, send to Web Worker
- Show thumbnail + "Extracting..." spinner while worker runs
- Results: row of extracted swatches
- Color count slider (3-8, default 5)
- "Apply to palette" button
- Error/edge case handling (too few colors, worker failure → fallback to main thread)

Worker instantiation: `new Worker(new URL('./extraction-worker.ts', import.meta.url))`

**Step 3: Commit**

```bash
git add tools/color-palette/extraction-worker.ts tools/color-palette/image-tab.tsx
git commit -m "feat(color-palette): add image extraction tab with Web Worker median cut"
```

---

### Task 5: AI Tab + Saved Palettes Tab

**Files:**
- Create: `tools/color-palette/ai-tab.tsx`
- Create: `tools/color-palette/saved-tab.tsx`
- Create: `tools/color-palette/palette-storage.ts`

**Step 1: Create palette storage helpers**

```typescript
// tools/color-palette/palette-storage.ts
const STORAGE_KEY = 'tk-palettes'
const MAX_PALETTES = 20

getSavedPalettes(): SavedPalette[]
savePalette(name: string, colors: string[]): void  // prepend, trim to max
deletePalette(id: string): void
```

All localStorage operations in try/catch.

**Step 2: Create AI tab**

UI-complete placeholder (same pattern as favicon AI tab):
- Prompt textarea
- Quick preset pills: Sunrise, Ocean, Forest, Neon, Pastel, Corporate, Vintage, Candy
- Generate button (1 credit badge)
- Results area: 3 mini palette strips, click to apply
- Auth gate + "coming soon" placeholder
- Props: `onApply: (colors: string[]) => void`

**Step 3: Create saved palettes tab**

- Grid of saved palette cards (from `getSavedPalettes()`)
- Each card: mini 5-color strip + name + relative date
- Click to load, trash to delete
- "Save Current" button at top (prompts for name via small inline input)
- Empty state: "No saved palettes yet"
- Props: `currentColors: string[], onLoad: (colors: string[]) => void`

**Step 4: Commit**

```bash
git add tools/color-palette/palette-storage.ts tools/color-palette/ai-tab.tsx tools/color-palette/saved-tab.tsx
git commit -m "feat(color-palette): add AI tab (placeholder), saved palettes tab, and storage"
```

---

### Task 6: Export Panel

**Files:**
- Create: `tools/color-palette/export-panel.tsx`
- Create: `tools/color-palette/ase-encoder.ts`

**Step 1: Create ASE encoder**

Adobe Swatch Exchange binary format:
- `encodeAse(colors: { name: string, hex: string }[]): Blob`
- ASE header: 'ASEF' + version(1.0) + block count
- Each color block: type(1=color) + name(UTF-16) + color model('RGB ') + 3 float values (0-1)
- Returns Blob with type 'application/octet-stream'

**Step 2: Create export panel**

Props: `colors: PaletteColor[]`

Format selector (pill group): CSS | Tailwind | SCSS | JSON | ASE | PNG

For each text format (CSS/Tailwind/SCSS/JSON):
- Generate the output string with all 5 colors × 11 tint/shade steps
- Show in a read-only code block with syntax highlighting (simple pre/code with colors)
- Copy button with "Copied!" feedback

CSS vars format:
```css
:root {
  --color-primary-50: #...;
  --color-primary-500: #...;
  --color-primary-950: #...;
  /* repeat for secondary, accent, neutral, highlight */
}
```

Tailwind format:
```js
module.exports = {
  theme: {
    colors: {
      primary: { 50: '#...', 100: '#...', ..., 950: '#...' },
      // repeat
    }
  }
}
```

For ASE: download button → `encodeAse()` → `downloadBlob()`
For PNG: render Canvas (1200x630, 5 color bars with hex labels) → download

**Step 3: Commit**

```bash
git add tools/color-palette/ase-encoder.ts tools/color-palette/export-panel.tsx
git commit -m "feat(color-palette): add export panel with CSS/Tailwind/SCSS/JSON/ASE/PNG formats"
```

---

### Task 7: Accessibility Panel

**Files:**
- Create: `tools/color-palette/accessibility-panel.tsx`

**Step 1: Build accessibility panel**

Props: `colors: PaletteColor[]`

Two collapsible sections:

**Contrast Checker:**
- 5x5 grid/matrix
- Each cell: two color swatches (fg/bg) + contrast ratio + AA/AAA badges
- Use `contrastRatio()` from color-utils
- Green badge for pass, red for fail
- Below matrix: row of 5 swatches with suggested text color (black/white) per swatch via `suggestTextColor()`

**Color Blindness Simulation:**
- 3 rows: Protanopia, Deuteranopia, Tritanopia
- Each row: label + 5 simulated swatches via `simulateColorBlindness()`
- Warning badge when two adjacent simulated colors have contrast ratio < 1.5 (nearly indistinguishable)

Both sections default closed on mobile, open on desktop.

**Step 2: Commit**

```bash
git add tools/color-palette/accessibility-panel.tsx
git commit -m "feat(color-palette): add accessibility panel with contrast checker and color blindness sim"
```

---

### Task 8: URL Sharing Helpers

**Files:**
- Create: `tools/color-palette/url-sharing.ts`

**Step 1: Create URL sharing utilities**

```typescript
// Format: #3D6AF2-8B5CF6-EC4899-F59E0B-10B981
encodeColorsToHash(colors: PaletteColor[]): string
decodeColorsFromHash(hash: string): string[] | null  // returns 5 hex strings or null
copyShareUrl(colors: PaletteColor[]): Promise<void>
```

Validation: each segment must be valid 6-char hex. If invalid or not 5 colors, return null.

**Step 2: Commit**

```bash
git add tools/color-palette/url-sharing.ts
git commit -m "feat(color-palette): add URL hash sharing utilities"
```

---

### Task 9: Page Route — Wire Everything Together

**Files:**
- Create: `app/tools/color-palette/page.tsx`

**Step 1: Build the page**

`'use client'` page with:

**State:**
- `colors: PaletteColor[]` — the 5 palette colors (initialized from URL hash or DEFAULT_PALETTE)
- `harmonyRule: HarmonyRule` — current harmony rule ('analogous' default)
- `expandedIndex: number | null` — which swatch has tint/shade expanded
- `activeTab: 'wheel' | 'image' | 'ai' | 'saved'`

**On mount:** check URL hash via `decodeColorsFromHash`, populate if valid.

**Handlers:**
- `handleColorChange(index, hex)` — update single color
- `handleToggleLock(index)` — toggle locked state
- `handleShuffle()` — randomize unlocked colors
- `handleApplyColors(hexArray)` — apply 5 colors from extraction/AI/saved (preserves locked colors)
- `handleRuleChange(rule)` — update harmony rule + regenerate via `generateHarmony`

**Layout:**
```
<main>
  <ToolBreadcrumb />
  <h1>Color Palette Generator</h1>
  <p>Create beautiful color palettes with harmony rules, image extraction, and accessibility checking</p>

  <PaletteStrip ... />

  <div className="flex flex-col lg:flex-row gap-6">
    <div className="flex-1 min-w-0">
      Tab buttons: [Wheel | Image | AI | Saved]
      Active tab content
    </div>
    <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4">
      <ExportPanel colors={colors} />
      <AccessibilityPanel colors={colors} />
      Share URL button
    </div>
  </div>
</main>
```

**Step 2: Run build**

Run: `pnpm build`
Expected: passes with `/tools/color-palette` route.

**Step 3: Commit**

```bash
git add app/tools/color-palette/page.tsx
git commit -m "feat(color-palette): add page route wiring all components"
```

---

### Task 10: Register in Tool Library & Deploy

**Files:**
- Modify: `lib/tools.tsx`

**Step 1: Add Color Palette Generator to tools array**

Add after Favicon Generator entry:

```typescript
{
  name: 'Color Palette',
  href: '/tools/color-palette',
  description: 'Generate palettes with harmony rules, image extraction & accessibility',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  ),
  color: 'from-pink-500 to-rose-400',
},
```

**Step 2: Build and push**

```bash
pnpm build
git add lib/tools.tsx
git commit -m "feat(color-palette): register tool in homepage grid"
git push origin main
```
