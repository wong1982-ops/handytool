# Sketch to Art — Image Editor & Showcase Gallery Design

## Overview

Two enhancements to the Sketch to Art tool:
1. **Image Editor** — Inline crop, rotate, pan/zoom on the image preview at Step 1 (before style selection) and Step 5 (before save/share)
2. **Showcase Gallery** — Hero section above the wizard showing one mermaid sketch transformed into all 18 art styles in a masonry grid

## 1. Image Editor Component

### Purpose
Let users crop, rotate, and pan/zoom their sketch before generating art, and edit the final artwork before downloading. Uses `react-easy-crop` (replaces the unused `react-image-crop`).

### Props
```typescript
interface ImageEditorProps {
  src: string                // data URL or R2 URL
  onComplete: (editedDataUrl: string) => void
  onCancel?: () => void      // Step 1: clears preview. Step 5: not used (reset instead)
  mode: 'fun' | 'pro'
  initialAspect?: number     // default: undefined (free crop)
}
```

### Features
- **Crop** — draggable crop area with resize handles
- **Aspect ratio presets** — pill buttons: Free, 1:1, 4:3, 16:9, 3:4
- **Rotate** — 90-degree increment buttons (rotate left, rotate right)
- **Pan & zoom** — drag to pan within crop region, scroll wheel / pinch-to-zoom on mobile
- **Reset** — undo all edits, return to original
- **Minimum crop size** — 128x128px minimum. If crop area is smaller, show validation tooltip and prevent `onComplete`

### UI Layout (inline, not modal)
```
[ Free ] [ 1:1 ] [ 4:3 ] [ 16:9 ] [ 3:4 ]     <- aspect ratio pills
+------------------------------------------+
|                                          |
|          react-easy-crop area            |
|        (pan/zoom/crop handles)           |
|                                          |
+------------------------------------------+
  [ Rotate Left ]  [ Reset ]  [ Rotate Right ]
```

### Small Image Bypass
If the source image is below 256px on either axis (e.g., small canvas drawings), skip the editor and show the plain `<img>` preview instead. The editor only adds value for images large enough to benefit from cropping.

### Crop Output Pipeline
When user clicks "Use this sketch" (Step 1) or "Download" (Step 5), the component:
1. Creates an offscreen `<canvas>`
2. Applies rotation transform
3. Draws the cropped region from the source image
4. Exports as JPEG (quality 0.8) data URL
5. **Runs `resizeImage()` utility** to ensure output is max 768px and under 3MB
6. Calls `onComplete(resizedDataUrl)`

### CORS Handling for R2 URLs (Step 5)
At Step 5, the source image is an R2-hosted URL. To draw cross-origin images onto canvas without tainting:
- Load the `Image` element with `crossOrigin="anonymous"`
- R2 bucket already returns `Access-Control-Allow-Origin: *` (Cloudflare R2 default for public buckets)
- If CORS fails, fall back to fetching the image as a blob via `fetch()` and creating an object URL

### Styles
Import `react-easy-crop` CSS or replicate required overlay styles in SCSS to match the project's Tailwind/SCSS convention. The crop overlay (dark mask around crop area) needs custom styling to match the tool's dark theme.

### Dynamic Import
Load `ImageEditor` via `next/dynamic` with `ssr: false` to avoid adding react-easy-crop (~10KB gzipped) to the initial bundle. Users browsing the showcase gallery don't need the editor loaded.

### Integration — Step 1 (sketch-input.tsx)
- Replace the plain `<img>` preview with `<ImageEditor>` (if image >= 256px)
- "Use this sketch" triggers `onComplete` which applies crop/rotate/resize before passing to wizard
- "Try Again" / "Change" calls `onCancel` → clears the preview

### Integration — Step 5 (save-share.tsx)
- Show `<ImageEditor>` on the final artwork image
- Download, share, and gallery-submit all use the edited version
- Reset button returns to original uncropped version (reset != cancel)
- State: `editedFinalUrl` stored locally in SaveShare component

## 2. Showcase Gallery (Hero Section)

### Purpose
Demonstrate the tool's capabilities with a visual "wow" — one mermaid sketch transformed into all 18 art styles displayed in a masonry grid above the wizard.

### Content
- **Heading:** "One sketch. Eighteen masterpieces."
- **Subheading:** "See what AI can do with a single drawing"
- **Center piece:** Original mermaid sketch (slightly larger, labeled "Original Sketch")
- **Grid:** 18 styled versions in masonry layout
- **CTA:** "Try it with your own sketch" button → smooth-scrolls to wizard (offset by header height ~64px using `scroll-margin-top`)

### Image Generation
- Pre-generate all 18 styles from one mermaid sketch using the existing generate API
- Upload to R2 as static assets: `sketch-art/showcase/mermaid-{style-id}.png`
- Hardcode URLs in the component — zero runtime API calls
- Generate once via a script, commit the URLs

### Grid Layout
| Viewport | Columns | Tile size |
|----------|---------|-----------|
| Mobile (<640px) | 2 | ~170px |
| Tablet (640-1024px) | 4 | ~200px |
| Desktop (>1024px) | 6 | ~180px |

### Tile Design
- Rounded corners (rounded-xl)
- Style name label overlay at bottom (semi-transparent dark gradient)
- Hover: subtle scale-up (scale-105) + ring highlight in primary color
- Click: opens lightbox showing before (sketch) / after (styled) side-by-side
- **Loading:** skeleton placeholder while image loads
- **Error fallback:** show the style's gradient card (same as style-picker tiles) with style name on image load failure

### Lightbox
- Native `<dialog>` element (same pattern as job-detail-modal)
- Left: original sketch, Right: styled version
- Style name as heading
- Close button + backdrop click to dismiss
- **Keyboard:** Escape closes, focus trapped while open, Left/Right arrows navigate between styles
- Mobile: full-width, stacked vertically

### Visibility
- Show when `state.step === 1 && !state.sketchDataUrl` (before any sketch is selected)
- Hidden once user has a preview or progresses past Step 1
- Reappears if user clicks "Start Over" (which resets to default state)

### Component Location
- New file: `tools/sketch-to-art/showcase-gallery.tsx`
- Rendered in `app/tools/sketch-to-art/page.tsx` above the wizard

## 3. File Changes

| File | Action | Description |
|------|--------|-------------|
| `tools/sketch-to-art/image-editor.tsx` | Create | Crop/rotate/pan/zoom component |
| `tools/sketch-to-art/showcase-gallery.tsx` | Create | Mermaid masonry hero gallery |
| `tools/sketch-to-art/sketch-input.tsx` | Modify | Replace `<img>` preview with `<ImageEditor>` |
| `tools/sketch-to-art/save-share.tsx` | Modify | Add `<ImageEditor>` on final artwork |
| `app/tools/sketch-to-art/page.tsx` | Modify | Add showcase hero, wire visibility condition |
| `package.json` | Modify | Add `react-easy-crop`, remove `react-image-crop` |

## 4. Dependencies

- **Add:** `react-easy-crop` — pan/zoom/crop with aspect ratio support (~10KB gzipped)
- **Remove:** `react-image-crop` — not used, replaced by react-easy-crop

## 5. Data Flow

### Step 1 Edit Flow
```
Upload/Camera/Draw → preview dataUrl → ImageEditor (crop/rotate/zoom)
  → onComplete(editedDataUrl) → resizeImage() → handleSketchReady(resizedDataUrl) → Step 2
```

### Step 5 Edit Flow
```
finalImage.imageUrl → fetch as blob (CORS) → ImageEditor (crop/rotate/zoom)
  → onComplete(editedDataUrl) → use for download/share/gallery
  → Reset → revert to original finalImage.imageUrl
```

## 6. Constraints

- Image editor must work on mobile (touch pan/zoom/crop)
- Minimum crop area: 128x128 pixels
- Small images (<256px either axis): skip editor, show plain preview
- Crop output pipeline includes `resizeImage()` — max 768px, under 3MB
- Step 5: load R2 images with `crossOrigin="anonymous"` for canvas export
- Showcase images are static — no API calls on page load, lazy-loaded
- WCAG 2.1 AA: keyboard accessible crop controls, 44px touch targets, focus trapping in lightbox
- Core Web Vitals: dynamic import for ImageEditor, lazy-load showcase images
- Import or replicate `react-easy-crop` CSS to match dark theme
