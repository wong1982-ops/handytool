# SVG Converter — Registry + Crop/Resize Design

**Date:** 2026-02-13
**Status:** Approved

## Overview

Two changes to the SVG Converter tool:

1. **Register in tool registry** — Add to `lib/tools.tsx` so it appears on home page, search auto-suggestions, and mega menu
2. **Add crop/resize step** — Inline editor between upload and vectorization using `react-image-crop`

## Task A: Tool Registry Entry

Add SVG Converter entry to `toolk1t-client/lib/tools.tsx` after Image Editor (position 9). Uses a bezier-path icon with `from-teal-500 to-cyan-400` gradient. Single change propagates to all navigation surfaces.

## Task B: Crop/Resize Before Vectorization

### User Flow

```
Upload → Crop/Resize → Vectorize → Compare → Export
```

### Approach

**Option 1 (selected):** Intermediate inline editor in the same canvas area. After upload, the user sees crop handles and resize controls. They adjust, then click "Continue to Vectorize". Original image is preserved for going back.

### Components

- **New:** `CropResizeEditor` — inline crop overlay with draggable handles + resize inputs
- **Library:** `react-image-crop` (~8KB gzip)
- **Resize controls:** Width/height number inputs, lock-aspect-ratio toggle, preset buttons (512x512, 1024x1024)
- **Skip option:** "Skip" button goes straight to vectorization

### State Flow

```
imageMeta (raw upload)
  → user crops/resizes
    → croppedImageMeta (new state, holds processed dataUrl + dimensions)
      → passed to useSvgTracer instead of imageMeta
```

### Page State Machine

```
idle → uploaded → cropping → ready-to-vectorize → processing → ready → export
```

The page currently has: `idle | uploaded+processing | ready`. The new `cropping` state sits between upload and vectorization.

### Files Changed

| File | Change |
|------|--------|
| `lib/tools.tsx` | Add SVG Converter entry |
| `app/tools/svg-converter/page.tsx` | Add cropping state, wire CropResizeEditor |
| `tools/svg-converter/crop-resize-editor.tsx` | New component |
| `tools/svg-converter/types.ts` | Add `CropData` type |
| `package.json` | Add `react-image-crop` dependency |

---

## Design Approved Context

This design document references the Toolk1t project for all file paths and tool references.
