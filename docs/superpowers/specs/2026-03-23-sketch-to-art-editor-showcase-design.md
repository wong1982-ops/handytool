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
  onCancel?: () => void
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

### UI Layout (inline, not modal)
```
[ Free ] [ 1:1 ] [ 4:3 ] [ 16:9 ] [ 3:4 ]     ← aspect ratio pills
┌──────────────────────────────────────────┐
│                                          │
│          react-easy-crop area            │
│        (pan/zoom/crop handles)           │
│                                          │
└──────────────────────────────────────────┘
  [ ↺ Rotate Left ]  [ Reset ]  [ Rotate Right ↻ ]
```

### Crop Output
When user clicks "Use this sketch" (Step 1) or "Download" (Step 5), the component:
1. Creates an offscreen `<canvas>`
2. Applies rotation transform
3. Draws the cropped region from the source image
4. Exports as JPEG (quality 0.8) data URL
5. Calls `onComplete(dataUrl)`

### Integration — Step 1 (sketch-input.tsx)
- Replace the plain `<img>` preview with `<ImageEditor>`
- "Use this sketch" triggers `onComplete` which applies crop/rotate before passing to wizard
- "Try Again" / "Change" cancels the editor and clears the preview

### Integration — Step 5 (save-share.tsx)
- Show `<ImageEditor>` on the final artwork image
- Download, share, and gallery-submit all use the edited version
- Reset button returns to original uncropped version
- State: `editedFinalUrl` stored locally in SaveShare component

## 2. Showcase Gallery (Hero Section)

### Purpose
Demonstrate the tool's capabilities with a visual "wow" — one mermaid sketch transformed into all 18 art styles displayed in a masonry grid above the wizard.

### Content
- **Heading:** "One sketch. Eighteen masterpieces."
- **Subheading:** "See what AI can do with a single drawing"
- **Center piece:** Original mermaid sketch (slightly larger, labeled "Original Sketch")
- **Grid:** 18 styled versions in masonry layout
- **CTA:** "Try it with your own sketch" button → smooth-scrolls to wizard

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

### Lightbox
- Native `<dialog>` element (same pattern as job-detail-modal)
- Left: original sketch, Right: styled version
- Style name as heading
- Close button + backdrop click to dismiss
- Mobile: full-width, stacked vertically

### Component Location
- New file: `tools/sketch-to-art/showcase-gallery.tsx`
- Rendered in `app/tools/sketch-to-art/page.tsx` above the wizard
- Only shown at Step 1 (hidden once user starts editing)

## 3. File Changes

| File | Action | Description |
|------|--------|-------------|
| `tools/sketch-to-art/image-editor.tsx` | Create | Crop/rotate/pan/zoom component |
| `tools/sketch-to-art/showcase-gallery.tsx` | Create | Mermaid masonry hero gallery |
| `tools/sketch-to-art/sketch-input.tsx` | Modify | Replace `<img>` preview with `<ImageEditor>` |
| `tools/sketch-to-art/save-share.tsx` | Modify | Add `<ImageEditor>` on final artwork |
| `app/tools/sketch-to-art/page.tsx` | Modify | Add showcase hero, hide at step >1 |
| `package.json` | Modify | Add `react-easy-crop`, remove `react-image-crop` |

## 4. Dependencies

- **Add:** `react-easy-crop` — pan/zoom/crop with aspect ratio support
- **Remove:** `react-image-crop` — not used, replaced by react-easy-crop

## 5. Data Flow

### Step 1 Edit Flow
```
Upload/Camera/Draw → preview dataUrl → ImageEditor (crop/rotate/zoom)
  → onComplete(editedDataUrl) → handleSketchReady(editedDataUrl) → Step 2
```

### Step 5 Edit Flow
```
finalImage.imageUrl → ImageEditor (crop/rotate/zoom)
  → onComplete(editedDataUrl) → use for download/share/gallery
  → Reset → revert to original finalImage.imageUrl
```

## 6. Constraints

- Image editor must work on mobile (touch pan/zoom/crop)
- Crop output must stay under 3MB payload (re-run resize after crop)
- Showcase images are static — no API calls on page load
- WCAG 2.1 AA: keyboard accessible crop controls, 44px touch targets
- Core Web Vitals: lazy-load showcase images below fold
