# Favicon Generator — Design Document

**Date:** 2026-03-19
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** A Favicon Generator tool with four creation methods — image upload, text/emoji styling, icon library search (bundled Lucide + Iconify API), and AI generation (Gemini, costs credits)
- **Why:** Give developers and designers a one-stop tool to create complete favicon packages without needing Figma or external services
- **Who:** Web developers and designers building sites, same audience as other Toolk1t tools
- **Key constraints:** Mostly client-side (Canvas API), AI generation uses credits via server API, icon library uses bundled popular set + Iconify API, capped exports (max 512x512, max 1MB ICO)
- **Non-goals:** Not a full logo designer, no vector editing, no brand kit management, no favicon hosting/CDN

## Assumptions

- Canvas API sufficient for rendering favicons at all required sizes (16-512px)
- ICO file generation done client-side (manual binary construction)
- AI icon generation reuses existing Gemini API infrastructure (costs credits)
- Iconify API is free and doesn't require an API key
- Bundled icon subset is ~500 popular Lucide icons (no external fetch needed)
- manifest.json and HTML link snippets generated as copyable text
- Full customization (gradients, shadows, borders) achievable with Canvas API
- Preview mockups are styled div compositions adapting to dark mode

---

## Layout

### Desktop (>=1024px)

Two-panel: tabbed creation area (left) + live preview & export (right).

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Tools > Favicon Generator        │
├──────────────────────────┬──────────────────────────┤
│  Creation Area           │  Preview & Export         │
│                          │                          │
│  [Upload|Text|Icons|AI]  │  Browser Tab mockup      │
│                          │  Bookmarks Bar mockup    │
│  (active tab content)    │  Mobile Home mockup      │
│                          │  Google Search mockup    │
│                          │                          │
│                          │  [Download ZIP]          │
│                          │  [Copy HTML] [Copy JSON] │
│                          │  Size checkboxes         │
└──────────────────────────┴──────────────────────────┘
```

### Mobile (<1024px)

- Creation tabs full-width
- Active tab content below
- Preview section stacks underneath (collapsible accordion)
- Export section at bottom

---

## Components

| File | Responsibility |
|---|---|
| `tools/favicon-generator/types.ts` | FaviconConfig, ExportSize, CreationMode types |
| `tools/favicon-generator/upload-tab.tsx` | Drag & drop upload, 1:1 crop with zoom slider, bg color for transparency |
| `tools/favicon-generator/text-tab.tsx` | Text/emoji input, shape, bg (solid/gradient/transparent), fg color, font, size, border, shadow, padding |
| `tools/favicon-generator/icon-tab.tsx` | Bundled Lucide grid + Iconify API search, category filters, same customization as text tab |
| `tools/favicon-generator/ai-tab.tsx` | Prompt textarea, style selector, generate button (credits), 4-thumbnail results |
| `tools/favicon-generator/preview-panel.tsx` | Browser tab, bookmarks bar, mobile home screen, Google search result mockups |
| `tools/favicon-generator/export-panel.tsx` | Size checkboxes, Download ZIP, Copy HTML tags, Copy manifest.json |
| `tools/favicon-generator/favicon-canvas.tsx` | Pure function: renderFavicon(config, size) → HTMLCanvasElement |
| `app/tools/favicon-generator/page.tsx` | Page route, state management, wires all components |

---

## Creation Tabs

### Upload Tab
- Drag & drop zone, accepts PNG/JPG/SVG/WebP (max 10MB)
- 1:1 aspect ratio crop area with zoom slider
- Optional background color picker for transparent PNGs
- "Apply" renders to shared canvas

### Text/Emoji Tab
- Text input (max ~3 chars recommended)
- Shape: circle, square, rounded square, hexagon
- Background: solid color / 2-color gradient (with angle slider) / transparent
- Text color picker
- Font: Sans, Serif, Mono, Rounded, Handwritten (system fonts)
- Font size: auto-fit default, manual override slider
- Border: toggle, color, width (1-4px)
- Shadow: toggle, color, blur, offset
- Padding: slider (0-40%)

### Icon Library Tab
- Search input (debounced)
- Category filter pills (Common, Social, Dev, Arrows, etc.)
- Bundled ~500 Lucide icons shown by default
- Iconify API results appear on search
- Click to select → same customization options as text tab (bg, shape, color, border, shadow)

### AI Generate Tab
- Prompt textarea
- Style selector: Flat, 3D, Pixel Art, Minimal, Gradient
- Generate button (1 credit)
- 4 thumbnail results, click to select
- Selected icon can be further customized (bg, shape, border)

---

## Preview Panel

Four mockup contexts, all live-updating:

1. **Browser Tab** — dark/light tab bar, favicon (16px), page title, URL
2. **Bookmarks Bar** — row of items, favicon (16px) + label
3. **Mobile Home Screen** — phone outline, app grid, favicon as PWA icon (192px) + label
4. **Google Search** — search result snippet, favicon (16px) next to domain

All mockups are styled `<div>` compositions, adapt to dark mode.

---

## Export Panel

**Sizes (all checked by default):**
- 16x16, 32x32, 48x48 → bundled into `favicon.ico`
- 180x180 → `apple-touch-icon.png`
- 192x192 → `android-chrome-192x192.png`
- 512x512 → `android-chrome-512x512.png`

**Actions:**
- **Download ZIP** — all files in one download (JSZip, client-side)
- **Copy HTML Tags** — `<link rel="icon" ...>` snippet
- **Copy manifest.json** — `{ "icons": [...] }` snippet

ICO generated client-side (multi-size PNG → ICO binary).

---

## State Model

```typescript
interface FaviconConfig {
  mode: 'upload' | 'text' | 'icon' | 'ai'
  imageData?: string        // base64 (upload / AI result)
  text?: string             // text/emoji
  iconSvg?: string          // SVG string from library
  cropX: number
  cropY: number
  cropZoom: number
  shape: 'circle' | 'square' | 'rounded' | 'hexagon'
  bgType: 'solid' | 'gradient' | 'transparent'
  bgColor: string
  bgGradient: { from: string; to: string; angle: number }
  fgColor: string
  fontSize: number
  fontFamily: 'sans' | 'serif' | 'mono' | 'rounded' | 'handwritten'
  padding: number
  border: { enabled: boolean; color: string; width: number }
  shadow: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number }
}
```

- All state in page.tsx via useState
- Pure render function: `renderFavicon(config, size) → HTMLCanvasElement`
- Preview re-renders on every config change (Canvas at 512px is <1ms)

---

## Edge Cases & Error Handling

| Scenario | Behaviour |
|---|---|
| Upload >10MB | Reject with "Image must be under 10MB" |
| Non-image file | Reject with "Please upload an image (PNG, JPG, SVG, WebP)" |
| SVG upload | Rasterize to canvas first |
| Transparent PNG | Checkerboard background in crop area |
| Empty text | Placeholder "A" in muted style |
| Text >3 chars | Allow with warning "Best results with 1-3 characters" |
| Iconify API fails | Show bundled icons only, hide API search |
| Not signed in (AI) | Show sign-in prompt |
| Insufficient credits | Show "Not enough credits" + pricing link |
| AI generation fails | Error with retry button |
| No favicon configured | Disable download with "Create a favicon first" |
| ICO encoding fails | Fall back to PNG-only ZIP, show note |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | Four creation methods (upload, text, icons, AI) | Fewer methods | Maximum flexibility for different user needs |
| 2 | AI via server API + icon library as free default | AI only; Icons only | Free option for most users, AI as premium upsell |
| 3 | Full favicon package export (ICO, PNGs, manifest, HTML) | Just ICO; ICO + PNG | Complete solution — user doesn't need another tool |
| 4 | Multiple preview contexts (tab, bookmarks, mobile, search) | Single preview; No preview | Key differentiator — users see exactly how it looks |
| 5 | Full text customization (gradients, borders, shadows) | Minimal; Moderate | Power users expect it, simple defaults serve beginners |
| 6 | Bundled Lucide icons + Iconify API search | Bundled only; API only | Fast default experience + comprehensive search |
| 7 | Tabbed single-page with live preview sidebar | Wizard; Canvas-centric | Fast iteration, live preview on every change |
| 8 | Client-side Canvas + JSZip export | Server-side rendering | Zero latency, no API dependency for core features |
| 9 | Capped exports (max 512px, max 1MB) | No limits | Prevents browser memory issues |
| 10 | State in page.tsx, pure render function | Complex state management | Simple, predictable, Canvas rendering is fast |
