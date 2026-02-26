# Tool Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Feature-rich upgrade of 4 high-traffic tools: SVG Converter, Currency Exchange, JSON Converter, PDF Converter.

**Architecture:** All enhancements are client-side. No new API routes needed. New npm packages added where noted. Each tool's existing component structure is extended — no rewrites.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS v4, pnpm

**Important Notes:**
- PDF Converter already has merge, split, compress, PDF→images, images→PDF, PDF→Word, Word→PDF, PDF→Excel (8 modes). Enhancements focus on missing features: watermark, page management UI, image→PDF options.
- SVG Converter has a server-side API (`/api/v1/svg/vectorize`). Enhancements are client-side only.
- Currency Exchange uses frankfurter.app API. Crypto adds CoinGecko free API.
- JSON Converter uses CodeMirror 6. New features extend existing editor infrastructure.

---

## Tool 1: SVG Converter Enhancements

### Task 1.1: Fix EPS Export

**Files:**
- Modify: `tools/svg-converter/export-actions.tsx`
- Create: `tools/svg-converter/exporters/svg-to-eps.ts`

**Context:** The EPS Export button exists but does nothing useful. We need to convert the SVG string to EPS format (PostScript) and trigger a download.

**Step 1: Install dependency**

```bash
pnpm add canvg --filter ./
```

Note: We'll convert SVG → Canvas → PostScript manually. EPS is a text-based format we can generate from path data.

**Step 2: Create EPS exporter**

Create `tools/svg-converter/exporters/svg-to-eps.ts`:

```typescript
/**
 * Convert SVG string to EPS (Encapsulated PostScript) format.
 * Parses SVG paths and translates to PostScript drawing commands.
 */
export function svgToEps(svgString: string): Blob {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  if (!svg) throw new Error('Invalid SVG')

  const width = parseFloat(svg.getAttribute('width') || '300')
  const height = parseFloat(svg.getAttribute('height') || '300')

  const lines: string[] = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${Math.round(width)} ${Math.round(height)}`,
    '%%Pages: 1',
    '%%EndComments',
    '',
    // Flip Y axis (SVG is top-down, PS is bottom-up)
    `0 ${Math.round(height)} translate`,
    '1 -1 scale',
    '',
  ]

  // Extract all path elements and convert to PostScript
  const paths = svg.querySelectorAll('path')
  paths.forEach((path) => {
    const d = path.getAttribute('d')
    const fill = path.getAttribute('fill') || '#000000'
    if (!d) return

    // Convert hex color to PS RGB
    const r = parseInt(fill.slice(1, 3), 16) / 255
    const g = parseInt(fill.slice(3, 5), 16) / 255
    const b = parseInt(fill.slice(5, 7), 16) / 255
    lines.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} setrgbcolor`)
    lines.push('newpath')

    // Parse SVG path data to PS commands
    const commands = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || []
    let cx = 0, cy = 0
    for (const cmd of commands) {
      const type = cmd[0]
      const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number)
      switch (type) {
        case 'M': cx = nums[0]; cy = nums[1]; lines.push(`${cx} ${cy} moveto`); break
        case 'm': cx += nums[0]; cy += nums[1]; lines.push(`${cx} ${cy} moveto`); break
        case 'L': cx = nums[0]; cy = nums[1]; lines.push(`${cx} ${cy} lineto`); break
        case 'l': cx += nums[0]; cy += nums[1]; lines.push(`${cx} ${cy} lineto`); break
        case 'H': cx = nums[0]; lines.push(`${cx} ${cy} lineto`); break
        case 'h': cx += nums[0]; lines.push(`${cx} ${cy} lineto`); break
        case 'V': cy = nums[0]; lines.push(`${cx} ${cy} lineto`); break
        case 'v': cy += nums[0]; lines.push(`${cx} ${cy} lineto`); break
        case 'C':
          lines.push(`${nums[0]} ${nums[1]} ${nums[2]} ${nums[3]} ${nums[4]} ${nums[5]} curveto`)
          cx = nums[4]; cy = nums[5]; break
        case 'c':
          lines.push(`${cx+nums[0]} ${cy+nums[1]} ${cx+nums[2]} ${cy+nums[3]} ${cx+nums[4]} ${cy+nums[5]} curveto`)
          cx += nums[4]; cy += nums[5]; break
        case 'Z': case 'z': lines.push('closepath'); break
      }
    }
    lines.push('fill')
    lines.push('')
  })

  lines.push('showpage')
  lines.push('%%EOF')

  return new Blob([lines.join('\n')], { type: 'application/postscript' })
}
```

**Step 3: Create PDF exporter**

Create `tools/svg-converter/exporters/svg-to-pdf.ts`:

```typescript
/**
 * Convert SVG string to PDF using canvas rasterization + pdf-lib.
 */
export async function svgToPdf(svgString: string): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib')

  // Parse SVG dimensions
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  const width = parseFloat(svg?.getAttribute('width') || '300')
  const height = parseFloat(svg?.getAttribute('height') || '300')

  // Render SVG to canvas at 2x for quality
  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  const img = new Image()
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)

  await new Promise<void>((resolve, reject) => {
    img.onload = () => { ctx.drawImage(img, 0, 0, width, height); resolve() }
    img.onerror = reject
    img.src = url
  })
  URL.revokeObjectURL(url)

  const pngData = await new Promise<Uint8Array>((resolve) => {
    canvas.toBlob((blob) => {
      blob!.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)))
    }, 'image/png')
  })

  const pdfDoc = await PDFDocument.create()
  const pngImage = await pdfDoc.embedPng(pngData)
  const page = pdfDoc.addPage([width, height])
  page.drawImage(pngImage, { x: 0, y: 0, width, height })

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
```

**Step 4: Wire exporters into export-actions.tsx**

In `tools/svg-converter/export-actions.tsx`, import the new exporters and replace the EPS/PDF button handlers:

```typescript
import { svgToEps } from './exporters/svg-to-eps'
import { svgToPdf } from './exporters/svg-to-pdf'

// In the component, add download helper:
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// EPS button onClick:
const handleEpsExport = () => {
  if (!vectorResult?.svgString) return
  const blob = svgToEps(vectorResult.svgString)
  downloadBlob(blob, filename.replace(/\.\w+$/, '.eps'))
}

// PDF button onClick:
const handlePdfExport = async () => {
  if (!vectorResult?.svgString) return
  const blob = await svgToPdf(vectorResult.svgString)
  downloadBlob(blob, filename.replace(/\.\w+$/, '.pdf'))
}
```

**Step 5: Verify build**

```bash
pnpm build
```

**Step 6: Commit**

```bash
git add tools/svg-converter/exporters/ tools/svg-converter/export-actions.tsx
git commit -m "fix(svg-converter): implement working EPS and PDF export"
```

---

### Task 1.2: Add Batch Processing

**Files:**
- Modify: `tools/svg-converter/upload-screen.tsx`
- Create: `tools/svg-converter/batch-panel.tsx`
- Modify: `app/tools/svg-converter/page.tsx`

**Context:** Currently only single-image upload. Add multi-file upload with batch conversion and ZIP download.

**Step 1: Install JSZip**

```bash
pnpm add jszip --filter ./
```

**Step 2: Create batch-panel.tsx**

Create `tools/svg-converter/batch-panel.tsx`:

A component that:
- Accepts `File[]` from parent
- Shows a list of files with thumbnails, names, sizes
- Each file has a status indicator (pending → processing → done → error)
- "Convert All" button triggers sequential processing via the existing `/api/v1/svg/vectorize` endpoint
- "Download All as ZIP" button creates a ZIP with all SVGs using JSZip
- "Remove" button per file
- Progress bar showing X of N completed

Props interface:
```typescript
interface BatchPanelProps {
  files: File[]
  settings: VectorizationSettings
  onRemoveFile: (index: number) => void
  onClearAll: () => void
}
```

Key implementation details:
- Use `useSvgTracer` logic but loop over files sequentially (not parallel, to avoid server overload)
- Store results in a `Map<number, VectorResult>` keyed by file index
- ZIP generation: `const zip = new JSZip()` → `zip.file(name, svgString)` → `zip.generateAsync({ type: 'blob' })`
- Individual download buttons per file as well

**Step 3: Update upload-screen.tsx**

Modify the file input to accept `multiple`:
```typescript
<input type="file" accept=".png,.jpg,.jpeg,.webp,.gif" multiple onChange={handleFiles} />
```

Add logic: if 1 file selected → enter single mode (existing flow). If 2+ files → enter batch mode.

**Step 4: Update page.tsx**

Add state:
```typescript
const [batchFiles, setBatchFiles] = useState<File[]>([])
const [isBatchMode, setIsBatchMode] = useState(false)
```

When batch mode: render `BatchPanel` instead of the comparison canvas. Settings sidebar still visible and applies to all files.

**Step 5: Verify build and test**

```bash
pnpm build
```

**Step 6: Commit**

```bash
git add tools/svg-converter/batch-panel.tsx tools/svg-converter/upload-screen.tsx app/tools/svg-converter/page.tsx package.json pnpm-lock.yaml
git commit -m "feat(svg-converter): add batch processing with ZIP download"
```

---

### Task 1.3: Add Color Mode Toggle & SVG Optimization Display

**Files:**
- Modify: `tools/svg-converter/vectorization-settings.tsx`
- Modify: `tools/svg-converter/types.ts`
- Modify: `tools/svg-converter/export-actions.tsx`

**Step 1: Add color mode to types**

In `tools/svg-converter/types.ts`, add to `VectorizationSettings`:
```typescript
colorMode: 'color' | 'bw'  // black & white vs full color
```

And update `DEFAULT_SETTINGS`:
```typescript
colorMode: 'color'
```

**Step 2: Add color mode toggle to settings**

In `vectorization-settings.tsx`, add a toggle group at the top of Quick Settings:
- Two buttons: "Color" (palette icon) and "B&W" (contrast icon)
- When B&W selected: auto-set colorDepth to 1, disable color depth slider
- When Color selected: restore previous colorDepth value

**Step 3: Add SVG optimization stats to export-actions**

In `export-actions.tsx`, show optimization info when SVGO is enabled:
- Original SVG size vs. optimized size
- Percentage reduction
- Path count

Display as a small stats row above the download buttons:
```
SVG: 45.2 KB → 32.1 KB (−29%)  |  142 paths
```

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/svg-converter/vectorization-settings.tsx tools/svg-converter/types.ts tools/svg-converter/export-actions.tsx
git commit -m "feat(svg-converter): add color mode toggle and optimization stats"
```

---

### Task 1.4: Add PNG Re-export at Custom Resolution

**Files:**
- Modify: `tools/svg-converter/export-actions.tsx`
- Create: `tools/svg-converter/exporters/svg-to-png.ts`

**Step 1: Create PNG exporter**

Create `tools/svg-converter/exporters/svg-to-png.ts`:

```typescript
/**
 * Render SVG to PNG at a custom resolution.
 */
export async function svgToPng(svgString: string, targetWidth: number): Promise<Blob> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.querySelector('svg')
  const origWidth = parseFloat(svg?.getAttribute('width') || '300')
  const origHeight = parseFloat(svg?.getAttribute('height') || '300')
  const scale = targetWidth / origWidth
  const targetHeight = Math.round(origHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!

  const img = new Image()
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  await new Promise<void>((resolve, reject) => {
    img.onload = () => { ctx.drawImage(img, 0, 0, targetWidth, targetHeight); resolve() }
    img.onerror = reject
    img.src = url
  })
  URL.revokeObjectURL(url)

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png')
  })
}
```

**Step 2: Add PNG export UI to export-actions.tsx**

Add a "PNG Export" button to the secondary grid. When clicked, show a small popover with resolution presets:
- 1x (original), 2x, 4x, or custom width input
- Downloads the PNG at selected resolution

**Step 3: Verify build**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add tools/svg-converter/exporters/svg-to-png.ts tools/svg-converter/export-actions.tsx
git commit -m "feat(svg-converter): add PNG re-export at custom resolution"
```

---

## Tool 2: Currency Exchange Enhancements

### Task 2.1: Add Cryptocurrency Support

**Files:**
- Modify: `app/tools/currency-exchange/page.tsx`
- Create: `tools/currency-exchange/crypto-api.ts`
- Modify: `tools/currency-exchange/currency-select.tsx`
- Modify: `tools/currency-exchange/converter-bar.tsx`

**Step 1: Create crypto API module**

Create `tools/currency-exchange/crypto-api.ts`:

```typescript
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

export const CRYPTO_CURRENCIES: Record<string, { name: string; symbol: string; flag: string }> = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', flag: '₿' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', flag: 'Ξ' },
  tether: { name: 'Tether', symbol: 'USDT', flag: '₮' },
  binancecoin: { name: 'BNB', symbol: 'BNB', flag: '◆' },
  ripple: { name: 'XRP', symbol: 'XRP', flag: '✕' },
  'usd-coin': { name: 'USD Coin', symbol: 'USDC', flag: '$' },
  solana: { name: 'Solana', symbol: 'SOL', flag: '◎' },
  cardano: { name: 'Cardano', symbol: 'ADA', flag: '₳' },
  dogecoin: { name: 'Dogecoin', symbol: 'DOGE', flag: 'Ð' },
  polkadot: { name: 'Polkadot', symbol: 'DOT', flag: '●' },
}

export async function fetchCryptoRates(
  ids: string[],
  vsCurrencies: string[] = ['usd']
): Promise<Record<string, Record<string, number>>> {
  const res = await fetch(
    `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=${vsCurrencies.join(',')}&include_24hr_change=true`
  )
  if (!res.ok) throw new Error('CoinGecko API error')
  return res.json()
}

export async function fetchCryptoHistory(
  id: string,
  vsCurrency: string,
  days: number
): Promise<{ prices: [number, number][] }> {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`
  )
  if (!res.ok) throw new Error('CoinGecko API error')
  return res.json()
}
```

**Step 2: Extend currency-select.tsx**

Add a "Crypto" section separator in the dropdown. Crypto currencies appear after fiat currencies, with their symbol icons instead of flag emojis. Add a `type` field to distinguish: `'fiat' | 'crypto'`.

**Step 3: Update page.tsx conversion logic**

Add branching logic:
- Fiat → Fiat: existing frankfurter.app API
- Crypto → Fiat: CoinGecko price API
- Fiat → Crypto: CoinGecko price API (inverse)
- Crypto → Crypto: CoinGecko with intermediate USD conversion

**Step 4: Update rate-chart.tsx data fetching**

When either currency is crypto, use `fetchCryptoHistory()` instead of frankfurter.app historical endpoint.

**Step 5: Verify build**

```bash
pnpm build
```

**Step 6: Commit**

```bash
git add tools/currency-exchange/crypto-api.ts tools/currency-exchange/currency-select.tsx tools/currency-exchange/converter-bar.tsx app/tools/currency-exchange/page.tsx
git commit -m "feat(currency-exchange): add cryptocurrency support via CoinGecko"
```

---

### Task 2.2: Add Favorites & Recent Pairs

**Files:**
- Create: `tools/currency-exchange/use-favorites.ts`
- Modify: `tools/currency-exchange/converter-bar.tsx`
- Create: `tools/currency-exchange/favorites-bar.tsx`
- Modify: `app/tools/currency-exchange/page.tsx`

**Step 1: Create favorites hook**

Create `tools/currency-exchange/use-favorites.ts`:

```typescript
const STORAGE_KEY = 'ht-currency-favorites'
const RECENT_KEY = 'ht-currency-recent'
const MAX_FAVORITES = 8
const MAX_RECENT = 5

interface CurrencyPair { from: string; to: string }

export function useFavorites() {
  // Read from localStorage
  // addFavorite(pair) — add to front, cap at MAX
  // removeFavorite(pair)
  // addRecent(pair) — auto-tracked on each conversion, cap at MAX
  // Return: { favorites, recent, addFavorite, removeFavorite, isFavorite, addRecent }
}
```

**Step 2: Create favorites-bar.tsx**

A horizontal scrollable strip below the converter bar:
- Shows favorite pairs as chips: "USD → BTC ★"
- Shows recent pairs as chips: "EUR → JPY" (no star)
- Click a chip → loads that pair into the converter
- Star icon toggles favorite status
- "★ Add current pair" button at the end

**Step 3: Wire into page.tsx**

- Call `addRecent()` after each successful conversion
- Pass favorites data to `FavoritesBar`
- Handle chip clicks to update `from`/`to` state

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/currency-exchange/use-favorites.ts tools/currency-exchange/favorites-bar.tsx app/tools/currency-exchange/page.tsx tools/currency-exchange/converter-bar.tsx
git commit -m "feat(currency-exchange): add favorites and recent pairs with localStorage"
```

---

### Task 2.3: Add Multi-Currency Calculator

**Files:**
- Create: `tools/currency-exchange/multi-currency.tsx`
- Modify: `app/tools/currency-exchange/page.tsx`

**Step 1: Create multi-currency component**

Create `tools/currency-exchange/multi-currency.tsx`:

A panel that shows one source amount converted to multiple target currencies simultaneously.

```typescript
interface MultiCurrencyProps {
  amount: number
  from: string
  currencies: Record<string, string>  // code → name map
  rates: Record<string, number> | null  // live rates from frankfurter
}
```

Features:
- Grid of currency cards (3 columns desktop, 2 mobile)
- Each card shows: flag, code, converted amount, rate
- "Add currency" button opens a selector to add more targets
- "Remove" button per card
- Default targets: USD, EUR, GBP, JPY, AUD (minus the source)
- Selected targets persisted in localStorage (`ht-currency-multi-targets`)
- Fetches rates in a single API call: `frankfurter.app/latest?from=X&to=Y,Z,W`

**Step 2: Add to page.tsx**

Add as a new panel in the `PanelGrid`. Default position: below the chart, full width (3/3 columns).

Update `MODES` in `converter-nav.tsx` or panel layout defaults to include this panel.

**Step 3: Verify build**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add tools/currency-exchange/multi-currency.tsx app/tools/currency-exchange/page.tsx tools/currency-exchange/use-panel-layout.ts
git commit -m "feat(currency-exchange): add multi-currency calculator panel"
```

---

### Task 2.4: Add Swap Button, Copy & Share, Offline Fallback

**Files:**
- Modify: `tools/currency-exchange/converter-bar.tsx`
- Create: `tools/currency-exchange/use-offline-rates.ts`
- Modify: `app/tools/currency-exchange/page.tsx`

**Step 1: Enhance swap button**

The swap button already exists in `converter-bar.tsx`. Verify it works correctly:
- Swaps `from` and `to` values
- Triggers reconversion
- Add 180° rotation animation on click (CSS transition)

**Step 2: Add copy & share**

In `converter-bar.tsx`, add to the result display area:
- "Copy" button — copies "100 USD = 92.34 EUR" text to clipboard
- "Share" button — copies URL with query params: `?from=USD&to=EUR&amount=100`

Read current URL and append params:
```typescript
const shareUrl = new URL(window.location.href)
shareUrl.searchParams.set('from', from)
shareUrl.searchParams.set('to', to)
shareUrl.searchParams.set('amount', String(amount))
```

On page load in `page.tsx`, read URL params to pre-fill the converter.

**Step 3: Add offline fallback**

Create `tools/currency-exchange/use-offline-rates.ts`:

```typescript
const CACHE_KEY = 'ht-currency-cached-rates'

export function useOfflineRates() {
  // On successful API response: cache rates + timestamp in localStorage
  // On API failure: return cached rates with staleness indicator
  // Return: { rates, isStale, lastUpdated }
}
```

Show a yellow badge when using cached rates: "Rates from 3 hours ago — offline mode"

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/currency-exchange/converter-bar.tsx tools/currency-exchange/use-offline-rates.ts app/tools/currency-exchange/page.tsx
git commit -m "feat(currency-exchange): add copy/share links and offline rate fallback"
```

---

### Task 2.5: Add Rate Alerts

**Files:**
- Create: `tools/currency-exchange/rate-alerts.tsx`
- Create: `tools/currency-exchange/use-rate-alerts.ts`
- Modify: `app/tools/currency-exchange/page.tsx`

**Step 1: Create rate alerts hook**

Create `tools/currency-exchange/use-rate-alerts.ts`:

```typescript
const STORAGE_KEY = 'ht-currency-alerts'
const POLL_INTERVAL = 60_000 // 1 minute

interface RateAlert {
  id: string
  from: string
  to: string
  targetRate: number
  direction: 'above' | 'below'
  createdAt: string
  triggered: boolean
}

export function useRateAlerts() {
  // Manage alerts in localStorage
  // Poll rates every 60s for active alerts
  // Use Notification API when alert triggers
  // Return: { alerts, addAlert, removeAlert, clearTriggered }
}
```

Key details:
- Request notification permission on first alert creation
- Check `Notification.permission` before attempting
- Polling uses `setInterval` with cleanup on unmount
- Triggered alerts stay in list but marked as triggered (green check)

**Step 2: Create rate alerts UI**

Create `tools/currency-exchange/rate-alerts.tsx`:

A panel component:
- "Set Alert" form: current pair pre-filled, target rate input, above/below toggle
- Active alerts list with: pair, target, direction arrow, created date, remove button
- Triggered alerts shown with checkmark
- Notification permission banner if not yet granted

**Step 3: Add to page as a panel**

Add to `PanelGrid` with default 1-column span.

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/currency-exchange/rate-alerts.tsx tools/currency-exchange/use-rate-alerts.ts app/tools/currency-exchange/page.tsx tools/currency-exchange/use-panel-layout.ts
git commit -m "feat(currency-exchange): add rate alerts with browser notifications"
```

---

## Tool 3: JSON Converter Enhancements

### Task 3.1: Add XML Support

**Files:**
- Modify: `tools/json-converter/converter-sidebar.tsx`
- Modify: `app/tools/json-converter/page.tsx`
- Modify: `tools/json-converter/use-json-validator.ts`
- Modify: `tools/json-converter/code-editor.tsx`

**Step 1: Install fast-xml-parser**

```bash
pnpm add fast-xml-parser --filter ./
```

**Step 2: Add XML detection to validator**

In `use-json-validator.ts`, add XML format detection:
```typescript
// Try XML detection (before YAML, since YAML can parse some XML)
if (input.trimStart().startsWith('<')) {
  try {
    const parser = new XMLParser()
    parser.parse(input)
    return { format: 'xml', isValid: true, errors: [] }
  } catch (e) {
    // Could be invalid XML, fall through
  }
}
```

Return type: extend `DetectedFormat` to include `'xml'`.

**Step 3: Add XML conversion functions to page.tsx**

Add conversion handlers:
```typescript
import { XMLParser, XMLBuilder } from 'fast-xml-parser'

function jsonToXml(json: string): string {
  const obj = JSON.parse(json)
  const builder = new XMLBuilder({ format: true, indentBy: '  ' })
  return builder.build(obj)
}

function xmlToJson(xml: string): string {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const obj = parser.parse(xml)
  return JSON.stringify(obj, null, 2)
}

function xmlToYaml(xml: string): string {
  const json = xmlToJson(xml)
  return jsonToYaml(json) // existing function
}

function yamlToXml(yaml: string): string {
  const json = yamlToJson(yaml) // existing function
  return jsonToXml(json)
}
```

**Step 4: Add XML syntax highlighting to code-editor**

In `code-editor.tsx`, add XML language support:
```typescript
import { xml } from '@codemirror/lang-xml'
// Add to language extension selection
```

```bash
pnpm add @codemirror/lang-xml --filter ./
```

**Step 5: Add XML buttons to converter-sidebar**

Add buttons: JSON→XML, XML→JSON, YAML→XML, XML→YAML, CSV→XML, XML→CSV
Show/hide based on detected input format (same pattern as existing buttons).

**Step 6: Update status bar**

In `status-bar.tsx`, handle `format === 'xml'` case.

**Step 7: Verify build**

```bash
pnpm build
```

**Step 8: Commit**

```bash
git add tools/json-converter/ app/tools/json-converter/page.tsx components/ui/problems-panel.tsx package.json pnpm-lock.yaml
git commit -m "feat(json-converter): add XML support with bidirectional conversion"
```

---

### Task 3.2: Add Tree View

**Files:**
- Create: `tools/json-converter/tree-view.tsx`
- Modify: `app/tools/json-converter/page.tsx`

**Step 1: Create tree-view component**

Create `tools/json-converter/tree-view.tsx`:

```typescript
interface TreeViewProps {
  data: unknown
  onNodeClick?: (path: string) => void
}
```

Features:
- Recursive rendering of JSON/object structure
- Collapsible nodes with chevron toggle
- Color-coded types: string (green), number (blue), boolean (orange), null (gray)
- Array items show index in brackets
- Object keys in purple
- Expand/Collapse All buttons at top
- Click a node → highlight corresponding line in editor
- Shows value preview on collapsed objects: `{ name: "John", ... }` (truncated)
- Virtualized for large documents (only render visible nodes)

Implementation:
- Recursive `TreeNode` component
- State: `Set<string>` of expanded paths
- Path format: `root.key.subkey[0].field`
- Max depth limit (configurable, default 20)

**Step 2: Add tree view toggle to page.tsx**

Add a "Tree" tab alongside the output panel. When active, render `TreeView` instead of the output editor.

Layout:
- Desktop: Input editor | Tree view OR Output editor (toggled by tab)
- Mobile: tabs for Input / Output / Tree

**Step 3: Verify build**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add tools/json-converter/tree-view.tsx app/tools/json-converter/page.tsx
git commit -m "feat(json-converter): add collapsible tree view for JSON visualization"
```

---

### Task 3.3: Add JSON Diff Viewer

**Files:**
- Create: `tools/json-converter/diff-view.tsx`
- Modify: `app/tools/json-converter/page.tsx`

**Step 1: Create diff-view component**

Create `tools/json-converter/diff-view.tsx`:

A side-by-side diff viewer for two JSON documents.

```typescript
interface DiffViewProps {
  leftJson: string
  rightJson: string
}
```

Features:
- Parse both JSON strings into objects
- Deep diff algorithm: walk both trees, identify added/removed/changed/unchanged
- Render as two synced panels with line-level highlighting:
  - Green background: added (right only)
  - Red background: removed (left only)
  - Yellow background: changed value
  - No highlight: unchanged
- Summary stats at top: "3 added, 2 removed, 5 changed"
- Path breadcrumb for each difference
- "Next diff" / "Previous diff" navigation buttons
- Handle non-JSON gracefully (show text diff fallback)

Implementation:
- Custom recursive diff function (no external dependency)
- Compare objects key-by-key, arrays element-by-element
- Generate a flat list of `DiffEntry` items with path, type, left/right values
- Render using two code blocks with aligned line numbers

**Step 2: Add diff mode to page.tsx**

Add a "Diff" tab. When active:
- Left panel = Input editor (editable)
- Right panel = second input editor (editable, replaces output)
- Below: diff results panel

**Step 3: Verify build**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add tools/json-converter/diff-view.tsx app/tools/json-converter/page.tsx
git commit -m "feat(json-converter): add JSON diff viewer with visual highlighting"
```

---

### Task 3.4: Add Schema Validation

**Files:**
- Create: `tools/json-converter/schema-validator.tsx`
- Modify: `app/tools/json-converter/page.tsx`

**Step 1: Install ajv**

```bash
pnpm add ajv ajv-formats --filter ./
```

**Step 2: Create schema validator component**

Create `tools/json-converter/schema-validator.tsx`:

```typescript
interface SchemaValidatorProps {
  inputJson: string
  onErrors: (errors: ValidationError[]) => void
}
```

Features:
- Collapsible "Schema" panel below the editors
- Textarea to paste a JSON Schema (or load from file)
- "Validate" button
- Error list: path, message, schema rule that failed
- Errors also forwarded to the problems panel (existing component)
- Use Ajv with ajv-formats for full JSON Schema draft-07 support
- Show green checkmark when valid
- Persist last-used schema in localStorage

**Step 3: Wire into page.tsx**

Add schema panel below the editors. Validation errors merge with existing problems panel data.

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/json-converter/schema-validator.tsx app/tools/json-converter/page.tsx package.json pnpm-lock.yaml
git commit -m "feat(json-converter): add JSON Schema validation with ajv"
```

---

### Task 3.5: Add Formatting Controls & CSV Options

**Files:**
- Modify: `tools/json-converter/converter-sidebar.tsx`
- Modify: `app/tools/json-converter/page.tsx`

**Step 1: Add formatting controls**

In `converter-sidebar.tsx`, add a settings section (collapsible):

- **Indent size**: 2 / 4 / Tab (button group)
- **Sort keys**: toggle (alphabetical sort of object keys)
- **Minify on convert**: toggle

Store in state, pass to conversion functions. The beautify function uses the selected indent.

**Step 2: Add CSV options**

When CSV is detected or CSV conversion is selected, show:
- **Delimiter**: comma / semicolon / tab / pipe (button group)
- **Header row**: toggle (first row is headers)
- **Flatten strategy**: dot notation / bracket notation / none

These options affect both CSV→JSON and JSON→CSV conversions.

**Step 3: Update conversion functions in page.tsx**

Pass formatting options to conversion functions:
```typescript
function beautify(json: string, indent: number | 'tab', sortKeys: boolean): string
function jsonToCsv(json: string, delimiter: string, headers: boolean): string
function csvToJson(csv: string, delimiter: string, hasHeaders: boolean): string
```

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/json-converter/converter-sidebar.tsx app/tools/json-converter/page.tsx
git commit -m "feat(json-converter): add formatting controls and CSV delimiter options"
```

---

### Task 3.6: Add Drag-and-Drop File Import & JMESPath Query

**Files:**
- Modify: `app/tools/json-converter/page.tsx`
- Create: `tools/json-converter/query-panel.tsx`

**Step 1: Add drag-and-drop to page.tsx**

Add `onDragOver`/`onDrop` handlers to the main container:
```typescript
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => setInput(reader.result as string)
  reader.readAsText(file)
}
```

Show a drop overlay when dragging: "Drop .json, .yaml, .csv, or .xml file"
Accept: `.json`, `.yaml`, `.yml`, `.csv`, `.xml`, `.toml`

**Step 2: Create query panel**

Create `tools/json-converter/query-panel.tsx`:

```typescript
interface QueryPanelProps {
  input: string
  onResult: (result: string) => void
}
```

Features:
- Input field for JMESPath expression (e.g., `people[?age > 30].name`)
- "Run Query" button
- Live results as user types (debounced 300ms)
- Error message if expression is invalid
- Preset queries dropdown: "Select all keys", "Filter array", "Flatten nested"
- Results displayed in output panel

```bash
pnpm add jmespath --filter ./
pnpm add -D @types/jmespath --filter ./
```

**Step 3: Add query panel toggle to page.tsx**

Add below the editors, collapsible. When a query is active, output shows query results instead of conversion output.

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/json-converter/query-panel.tsx app/tools/json-converter/page.tsx package.json pnpm-lock.yaml
git commit -m "feat(json-converter): add drag-drop file import and JMESPath query"
```

---

## Tool 4: PDF Converter Enhancements

### Task 4.1: Add Watermark Feature

**Files:**
- Create: `tools/pdf-converter/processors/watermark.ts`
- Modify: `tools/pdf-converter/converter-nav.tsx`
- Modify: `tools/pdf-converter/mode-options.tsx`
- Modify: `app/tools/pdf-converter/page.tsx`

**Step 1: Add watermark mode to converter-nav.tsx**

Add to `MODES` array:
```typescript
{ id: 'watermark', label: 'Watermark', icon: /* droplet/stamp SVG */ }
```

Add to `MODE_DESCRIPTIONS`:
```typescript
'watermark': {
  title: 'Add Watermark',
  description: 'Add text or image watermark to PDF pages',
  accept: '.pdf',
  label: 'PDF',
  multiple: false,
}
```

**Step 2: Add watermark options to mode-options.tsx**

When mode is `watermark`, show:
- **Type toggle**: Text / Image
- **Text input**: watermark text (e.g., "CONFIDENTIAL")
- **Font size**: slider (12–120pt)
- **Opacity**: slider (10%–100%)
- **Position**: grid selector (9 positions: top-left, top-center, ... bottom-right, or "diagonal")
- **Color**: color picker (default: gray)
- **Rotation**: slider (0–360°, default 45° for diagonal)
- **Image upload**: when type=Image, file picker for PNG/JPG

**Step 3: Create watermark processor**

Create `tools/pdf-converter/processors/watermark.ts`:

```typescript
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

export async function addWatermark(
  pdfFile: File,
  options: {
    type: 'text' | 'image'
    text?: string
    fontSize?: number
    opacity?: number
    position?: string
    color?: { r: number; g: number; b: number }
    rotation?: number
    imageFile?: File
  },
  onProgress?: (percent: number, message: string) => void
): Promise<{ blob: Blob; filename: string }> {
  const pdfBytes = await pdfFile.arrayBuffer()
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (let i = 0; i < pages.length; i++) {
    onProgress?.((i / pages.length) * 100, `Watermarking page ${i + 1}/${pages.length}`)
    const page = pages[i]
    const { width, height } = page.getSize()

    if (options.type === 'text' && options.text) {
      const fontSize = options.fontSize || 48
      const textWidth = font.widthOfTextAtSize(options.text, fontSize)
      // Calculate position based on options.position
      // Draw text with opacity and rotation
      page.drawText(options.text, {
        x: /* calculated */,
        y: /* calculated */,
        size: fontSize,
        font,
        color: rgb(
          (options.color?.r || 128) / 255,
          (options.color?.g || 128) / 255,
          (options.color?.b || 128) / 255
        ),
        opacity: options.opacity || 0.3,
        rotate: degrees(options.rotation || 45),
      })
    } else if (options.type === 'image' && options.imageFile) {
      const imgBytes = await options.imageFile.arrayBuffer()
      const img = options.imageFile.type === 'image/png'
        ? await pdfDoc.embedPng(imgBytes)
        : await pdfDoc.embedJpg(imgBytes)
      // Draw image with calculated position and opacity
      page.drawImage(img, { /* ... */ opacity: options.opacity || 0.3 })
    }
  }

  const resultBytes = await pdfDoc.save()
  onProgress?.(100, 'Done')
  return {
    blob: new Blob([resultBytes], { type: 'application/pdf' }),
    filename: pdfFile.name.replace('.pdf', '_watermarked.pdf'),
  }
}
```

**Step 4: Wire into page.tsx**

Add `watermark` case to the mode switch in `handleProcess`:
```typescript
case 'watermark': {
  const { addWatermark } = await import('@/tools/pdf-converter/processors/watermark')
  return addWatermark(files[0].file, watermarkOptions, onProgress)
}
```

Add watermark options state:
```typescript
const [watermarkOpts, setWatermarkOpts] = useState({
  type: 'text' as const,
  text: 'CONFIDENTIAL',
  fontSize: 48,
  opacity: 0.3,
  position: 'center',
  color: { r: 128, g: 128, b: 128 },
  rotation: 45,
})
```

**Step 5: Verify build**

```bash
pnpm build
```

**Step 6: Commit**

```bash
git add tools/pdf-converter/processors/watermark.ts tools/pdf-converter/converter-nav.tsx tools/pdf-converter/mode-options.tsx app/tools/pdf-converter/page.tsx
git commit -m "feat(pdf-converter): add text and image watermark support"
```

---

### Task 4.2: Add Page Management UI

**Files:**
- Create: `tools/pdf-converter/page-manager.tsx`
- Modify: `tools/pdf-converter/converter-nav.tsx`
- Modify: `app/tools/pdf-converter/page.tsx`

**Step 1: Add page manager mode to converter-nav**

Add to `MODES`:
```typescript
{ id: 'manage-pages', label: 'Page Manager', icon: /* grid/layout SVG */ }
```

**Step 2: Create page-manager component**

Create `tools/pdf-converter/page-manager.tsx`:

```typescript
interface PageManagerProps {
  file: File
  onExport: (blob: Blob, filename: string) => void
}
```

Features:
- Renders all PDF pages as thumbnail grid (using pdfjs-dist)
- Thumbnail size: ~150px wide, with page number overlay
- **Drag-to-reorder**: dnd-kit sortable (already a project dependency)
- **Rotate**: 90° CW/CCW per page (right-click menu or button overlay)
- **Delete**: remove specific pages (X button on hover)
- **Select multiple**: checkbox per thumbnail, bulk actions
- **Bulk actions bar**: "Delete selected", "Rotate selected"
- **Export**: "Save PDF" button — uses pdf-lib to reconstruct PDF with reordered/rotated/deleted pages

Implementation details:
- Use `pdfjs-dist` to render page thumbnails to canvas
- Store page state: `{ pageNumber: number, rotation: number, deleted: boolean }[]`
- On export: iterate state, copy pages from source PDF via pdf-lib, apply rotations
- Show loading spinner while rendering thumbnails (lazy render visible pages first)

**Step 3: Wire into page.tsx**

When mode is `manage-pages`, render `PageManager` instead of the standard upload/process flow. Single PDF file input.

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/pdf-converter/page-manager.tsx tools/pdf-converter/converter-nav.tsx app/tools/pdf-converter/page.tsx
git commit -m "feat(pdf-converter): add page manager with reorder, rotate, and delete"
```

---

### Task 4.3: Enhance Image-to-PDF Options

**Files:**
- Modify: `tools/pdf-converter/mode-options.tsx`
- Modify: `tools/pdf-converter/processors/images-to-pdf.ts`
- Modify: `app/tools/pdf-converter/page.tsx`

**Step 1: Add options to mode-options.tsx**

When mode is `images-to-pdf`, show:
- **Page size**: A4 / Letter / Legal / Custom (width × height mm)
- **Orientation**: Portrait / Landscape (auto-detect default)
- **Margins**: None / Small (10mm) / Medium (20mm) / Large (30mm)
- **Fit mode**: Fit (maintain aspect, may have whitespace) / Fill (crop to fill) / Stretch (distort to fill)

**Step 2: Update images-to-pdf processor**

Modify `tools/pdf-converter/processors/images-to-pdf.ts`:

Currently creates pages sized to images. Update to:
```typescript
interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'legal' | 'custom'
  customWidth?: number  // mm
  customHeight?: number // mm
  orientation: 'portrait' | 'landscape' | 'auto'
  margin: number  // mm
  fitMode: 'fit' | 'fill' | 'stretch'
}

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },      // points
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
}
```

For each image:
1. Create page at specified size and orientation
2. Calculate image placement based on fit mode and margins
3. Embed and draw image at calculated position/size

**Step 3: Update page.tsx state**

Add image-to-pdf options state and pass to processor.

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add tools/pdf-converter/mode-options.tsx tools/pdf-converter/processors/images-to-pdf.ts app/tools/pdf-converter/page.tsx
git commit -m "feat(pdf-converter): add page size, orientation, margin, and fit options for image-to-PDF"
```

---

### Task 4.4: Add Batch Processing with ZIP

**Files:**
- Modify: `app/tools/pdf-converter/page.tsx`
- Modify: `tools/pdf-converter/file-list.tsx`

**Step 1: Add batch processing to applicable modes**

For modes that process a single file (pdf-to-images, compress-pdf, watermark, split-pdf), enable multi-file input:
- When multiple files are staged, process each one sequentially
- Show per-file progress in the file list
- On completion: auto-ZIP all results and offer "Download All as ZIP"

**Step 2: Update file-list.tsx**

Add per-file status tracking:
```typescript
interface FileProcessingStatus {
  fileId: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  result?: { blob: Blob; filename: string }
  error?: string
}
```

Show individual download buttons per completed file, plus "Download All (ZIP)" button.

**Step 3: Update page.tsx processing logic**

Modify `handleProcess` to loop through all staged files:
```typescript
for (const file of stagedFiles) {
  updateFileStatus(file.id, 'processing')
  try {
    const result = await processFile(file, mode, options, onProgress)
    updateFileStatus(file.id, 'completed', result)
  } catch (e) {
    updateFileStatus(file.id, 'error', e.message)
  }
}
// After all: generate ZIP
```

JSZip is already available (used by split-pdf and pdf-to-images processors).

**Step 4: Verify build**

```bash
pnpm build
```

**Step 5: Commit**

```bash
git add app/tools/pdf-converter/page.tsx tools/pdf-converter/file-list.tsx
git commit -m "feat(pdf-converter): add batch processing with individual and ZIP downloads"
```

---

## Final Steps

### Task 5.1: SEO Updates for All Enhanced Tools

**Files:**
- Modify: `app/tools/svg-converter/layout.tsx` (or create if missing)
- Modify: `app/tools/currency-exchange/layout.tsx`
- Modify: `app/tools/json-converter/layout.tsx`
- Modify: `app/tools/pdf-converter/layout.tsx`
- Modify: `app/sitemap.ts`

**Step 1: Update meta descriptions**

Update each tool's layout.tsx metadata to reflect new capabilities:

- SVG Converter: mention batch processing, EPS/PDF/PNG export, color modes
- Currency Exchange: mention 170+ fiat currencies, top 10 crypto, historical charts, rate alerts
- JSON Converter: mention XML support, schema validation, diff viewer, tree view, JMESPath
- PDF Converter: mention 10 conversion modes, watermark, page manager

**Step 2: Update structured data**

Ensure JSON-LD `WebApplication` schema includes updated descriptions and feature keywords.

**Step 3: Verify build**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add app/tools/*/layout.tsx app/sitemap.ts
git commit -m "chore(seo): update meta descriptions and structured data for enhanced tools"
```

---

### Task 5.2: Final Build Verification & Deploy

**Step 1: Full build**

```bash
pnpm build
```

Fix any TypeScript or build errors.

**Step 2: Local smoke test**

```bash
pnpm dev
```

Verify each tool loads and new features are accessible.

**Step 3: Commit and push**

```bash
git add -A
git commit -m "feat: tool enhancements — SVG batch/exports, currency crypto/alerts, JSON XML/diff/tree, PDF watermark/pages"
git push
```

Deployment is automatic via Vercel on push.
