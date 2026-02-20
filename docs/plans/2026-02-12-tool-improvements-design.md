# Tool Improvements Design — Quick Wins, ID Photo, Image Editor

> **For Claude:** Use superpowers:writing-plans to create implementation plans from this design.

**Date:** 2026-02-12
**Status:** Design Approved

---

## Overview

Three workstreams to fix dead UI, make mock features real, and upgrade the Image Editor from a demo shell to a functional editor.

- **Workstream A:** Quick wins — strip fake UI, fix accessibility, ~80 min
- **Workstream B:** ID Photo — real server-side face detection + compliance
- **Workstream C:** Image Editor — Fabric.js canvas rewrite with real tools

---

**Note:** All file paths in this design document use the Toolk1t project naming convention.

---

## Workstream A: Quick Wins (13 fixes, 7 tools)

### Dead Feature Removal

| # | Tool | Fix | Files |
|---|------|-----|-------|
| A1 | My IP | Remove VPN/Tor "No" badges — no data source | `tools/myip/tech-info-panel.tsx` |
| A2 | My IP | Remove non-functional fullscreen button on map | `tools/myip/live-location-panel.tsx` |
| A3 | Speed Test | Add error state when ISP detection fails silently | `app/tools/speedtest/page.tsx` |
| A4 | Speed Test | Hide metric cards until download phase starts | `app/tools/speedtest/page.tsx` |
| A5 | PDF Converter | Increase reorder button touch targets to 44px | `tools/pdf-converter/file-list.tsx` |
| A6 | JSON Converter | Add confirmation dialog before Clear action | `app/tools/json-converter/page.tsx` |
| A7 | JSON Converter | Fix download MIME types (csv, json, yaml) | `app/tools/json-converter/page.tsx` |
| A8 | Currency Exchange | Fix "% today" → "vs yesterday" label | `tools/currency-exchange/converter-bar.tsx` |
| A9 | PDF Converter | Dynamic "Convert Now" text per mode | `app/tools/pdf-converter/page.tsx` |

### Accessibility Fixes

| # | Tool | Fix | Files |
|---|------|-----|-------|
| A10 | Swagger Editor | Add `role="tab"` + `aria-selected` to tab buttons | `app/tools/swagger-editor/page.tsx` |
| A11 | Swagger Editor | Add `aria-live="polite"` to validation badge | `app/tools/swagger-editor/page.tsx` |
| A12 | PDF Converter | Add `role="alert"` to error state | `app/tools/pdf-converter/page.tsx` |
| A13 | All tools | Add `aria-live` to status indicators | Multiple status bars |

---

## Workstream B: ID Photo — Real Face Detection

### Architecture

```
Client uploads photo → POST /api/v1/id-photo/analyze (FormData: image)
                     ← { faceBox, angle, compliance, score }
```

**Server stack:** `@vladmandic/face-api` (Node.js TensorFlow.js fork)

### API Endpoint

**POST /api/v1/id-photo/analyze**

Request: FormData with `image` field (PNG/JPEG/WebP, max 20MB)

Response:
```typescript
interface FaceAnalysisResult {
  faceBox: { x: number, y: number, width: number, height: number }  // normalized 0-1
  angle: { roll: number, pitch: number, yaw: number }               // degrees
  compliance: {
    centered: { pass: boolean, message: string }
    faceSize: { pass: boolean, message: string }
    headStraight: { pass: boolean, message: string }
    eyesOpen: { pass: boolean, message: string }
    lighting: { pass: boolean, message: string }
  }
  score: number  // 0-100 overall compliance score
}
```

### Compliance Rules

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Face centered | Box center vs image center | Within 10% of center |
| Face size | Box height / image height | 60-80% of frame |
| Head straight | Yaw angle from landmarks | < 15 degrees |
| Eyes open | Eye aspect ratio from landmarks | Ratio > 0.2 |
| Even lighting | Left/right face brightness diff | < 20% difference |

### Server Files (new)

- `toolk1t-api/lib/face/types.ts` — Zod schema + interfaces
- `toolk1t-api/lib/face/validation.ts` — image validation (reuse SVG pattern)
- `toolk1t-api/lib/face/analyze.ts` — face-api.js wrapper, compliance scoring
- `toolk1t-api/app/api/v1/id-photo/analyze/route.ts` — POST endpoint

### Client Changes

- New: `toolk1t-client/tools/id-photo/use-face-analysis.ts` — hook calling API on photo upload
- Modify: `toolk1t-client/app/tools/id-photo/page.tsx` — replace `setTimeout` mock with hook
- Modify: `toolk1t-client/tools/id-photo/settings-panel.tsx` — wire real compliance data
- Modify: `toolk1t-client/tools/id-photo/photo-canvas.tsx` — add face overlay rectangle (green/amber/red)

### What stays unchanged

- `format-sidebar.tsx` — format presets (passport, visa, etc.)
- Export flow — download at 300 DPI
- Photo zoom/rotate/crop controls

---

## Workstream C: Image Editor — Fabric.js Rewrite

### Dependency

Install: `pnpm add fabric` in toolk1t-client

### Canvas Architecture

Replace current `<img>` + CSS filters with Fabric.js managed canvas:

```
Current:  <img src={imageUrl} style={{ filter: cssFilterString }}>
After:    <canvas id="editor-canvas"> managed by fabric.Canvas
```

### Tool Behaviors

| Tool | Fabric.js Implementation |
|------|--------------------------|
| Move | `canvas.selection = true`, default object manipulation |
| Crop | Custom overlay rect, on apply: crop via `toDataURL(region)` → reload |
| Brush | `canvas.isDrawingMode = true`, `freeDrawingBrush` with fg color + width |
| Eraser | `EraserBrush` — removes drawn paths, leaves background intact |
| Text | Click canvas → insert `fabric.IText`, immediately editable |
| Selection | `canvas.selection = true`, marquee select with highlight |

### Undo/Redo System

State snapshot approach:
- Stack of `canvas.toJSON()` snapshots, max 30 entries
- Push on: stroke end, text placed, filter applied, object moved/resized/deleted
- Undo: `canvas.loadFromJSON(stack[index - 1])`
- Redo: `canvas.loadFromJSON(stack[index + 1])`
- Keyboard: Ctrl+Z undo, Ctrl+Shift+Z redo

### Filter Pipeline

Replace CSS filter strings with Fabric.js image filters:

```typescript
backgroundImage.filters = [
  new fabric.Image.filters.Brightness({ brightness }),
  new fabric.Image.filters.Contrast({ contrast }),
  new fabric.Image.filters.Saturation({ saturation }),
  new fabric.Image.filters.HueRotation({ rotation }),
]
backgroundImage.applyFilters()
canvas.renderAll()
```

### Menu Actions

| Menu | Items |
|------|-------|
| File | New, Open Image, Export PNG, Export JPEG |
| Edit | Undo, Redo, Delete Selected, Select All |
| Image | Resize Canvas, Rotate 90 CW/CCW, Flip H/V |
| Filters | Grayscale, Sepia, Invert, Blur (gallery presets) |

### Files Changed

- New: `toolk1t-client/tools/image-editor/use-fabric-canvas.ts` — Fabric init, tool switching, undo/redo, export
- Rewrite: `toolk1t-client/app/tools/image-editor/page.tsx` — replace img canvas with Fabric, wire menus
- Modify: `toolk1t-client/tools/image-editor/editor-toolbar.tsx` — wire onClick to Fabric tool modes
- Modify: `toolk1t-client/tools/image-editor/adjustments-panel.tsx` — wire sliders to Fabric filters

### What stays unchanged

- Toolbar visual layout and icons
- Adjustments panel slider UI
- Layers panel visual structure (rewired to Fabric objects)
- Status bar, top bar, keyboard shortcut structure

---

## Implementation Order

1. **Workstream A** — Quick wins (1 session, ~80 min). No dependencies, pure fixes.
2. **Workstream B** — ID Photo face detection (1-2 sessions). Server + client.
3. **Workstream C** — Image Editor Fabric.js (2-3 sessions). Biggest rewrite.

Each workstream is independently shippable. A doesn't block B or C.
