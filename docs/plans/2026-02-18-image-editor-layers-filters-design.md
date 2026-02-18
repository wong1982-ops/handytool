# Image Editor — Layers System & Filter Gallery

**Date**: 2026-02-18
**Status**: Approved
**Target User**: Intermediate (Pixlr-level) — content creators, small designers

---

## Problem Statement

The image editor's layer panel is cosmetic — it shows a single "Background" entry but users cannot create, reorder, or control multiple layers. The filter gallery has only 6 basic presets, far below competitor standards (Pixlr: 30+, Photopea: 50+). These gaps prevent intermediate users from doing meaningful compositing or creative work.

## Success Metrics

- Users can add 3+ image layers and reorder them via drag-and-drop
- All 20 filter presets render correctly with adjustable intensity
- Layer opacity and blend mode changes reflect on canvas in < 100ms
- Filter thumbnail previews generate in < 2 seconds after image load

## Scope

### In Scope
- Functional layer panel (add image, auto-create text/drawing layers, reorder, rename, delete, visibility, lock, opacity, blend modes)
- 20 Instagram-style filter presets in 6 categories with intensity slider
- Live thumbnail previews in filter gallery
- Keyboard shortcuts for layer operations
- Mobile-responsive layers panel (bottom sheet) and filter gallery (horizontal strip)

### Out of Scope
- Adjustment layers (non-destructive brightness/contrast as layers)
- Layer masks / clipping masks
- Layer groups / folders
- PSD import/export
- WebGL/LUT-based filters
- AI-powered features (background removal, auto-masking)

---

## 1. Layers System

### 1.1 Architecture — Fabric.js Object-as-Layer

Each fabric.js object on the canvas IS a layer. The layers panel is a **view** of `canvas.getObjects()`, not a separate data structure. This avoids sync bugs and leverages fabric.js's built-in object stacking.

### 1.2 Data Model

```ts
interface Layer {
  id: string              // unique ID stored as fabric obj.__layerId
  name: string            // user-editable, stored as fabric obj.__layerName
  type: 'image' | 'text' | 'drawing' | 'shape'
  visible: boolean        // fabric obj.visible
  locked: boolean         // fabric obj.selectable + obj.evented
  opacity: number         // 0-100 → fabric obj.opacity (0-1)
  blendMode: BlendMode    // fabric obj.globalCompositeOperation
}

type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'
```

### 1.3 Layer Operations

| Operation | User Action | fabric.js Implementation |
|---|---|---|
| Add image layer | Drop/upload image onto canvas | `canvas.add(new FabricImage(...))` |
| Auto-create text layer | Text tool → click canvas | `canvas.add(new IText(...))` → panel updates |
| Auto-create drawing layer | Brush tool → finish stroke | `path:created` event → panel updates |
| Reorder | Drag layer row up/down | `canvas.moveTo(obj, newIndex)` |
| Rename | Double-click layer name in panel | Inline edit, saved to `obj.__layerName` |
| Toggle visibility | Click eye icon | `obj.visible = !obj.visible; canvas.renderAll()` |
| Toggle lock | Click lock icon | `obj.selectable = false; obj.evented = false` |
| Change opacity | Slider on selected layer | `obj.opacity = value / 100; canvas.renderAll()` |
| Change blend mode | Dropdown on selected layer | `obj.globalCompositeOperation = mode` |
| Delete layer | Click trash icon or Delete key | `canvas.remove(obj)` (background protected) |
| Select on canvas | Click layer row in panel | `canvas.setActiveObject(obj)` |

### 1.4 Layer Panel Layout

```
┌─────────────────────────────┐
│ LAYERS          [+ Add] [🗑] │
├─────────────────────────────┤
│ Blend: [Normal ▾]  Opacity: │
│                    [====] 80%│
├─────────────────────────────┤
│ 👁 🔒 [thumb] Text "Hello"  │  ← selected (highlighted)
│ 👁    [thumb] Drawing 1     │
│ 👁    [thumb] Photo.jpg     │
│ 👁 🔒 [thumb] Background    │  ← locked, cannot delete
└─────────────────────────────┘
```

- Blend mode dropdown + opacity slider at panel top (apply to selected layer)
- Layer rows: visibility eye | lock | 24x24 thumbnail | editable name
- Top of list = front (highest z-index), bottom = back
- Background layer always last, locked by default, non-deletable
- `[+ Add]` opens file picker to add new image layer
- `[🗑]` deletes selected layer (disabled for background)
- Drag handle on each row for reorder

### 1.5 Sync Strategy: Canvas → Panel

The panel derives its layer list from `canvas.getObjects()`:

```ts
function syncLayersFromCanvas(canvas): Layer[] {
  return canvas.getObjects()
    .filter(obj => !obj.__isCropRect)  // exclude internal objects
    .reverse()                         // top object = first in list
    .map(obj => ({
      id: obj.__layerId,
      name: obj.__layerName || autoName(obj),
      type: detectType(obj),           // image/text/drawing/shape
      visible: obj.visible,
      locked: !obj.selectable,
      opacity: Math.round(obj.opacity * 100),
      blendMode: obj.globalCompositeOperation || 'normal',
    }))
}
```

This runs on: `object:added`, `object:removed`, `object:modified`, and manual triggers (reorder, visibility toggle, etc.).

### 1.6 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+]` | Move selected layer forward |
| `Ctrl+[` | Move selected layer backward |
| `Ctrl+Shift+]` | Move selected layer to front |
| `Ctrl+Shift+[` | Move selected layer to back |
| `Delete` / `Backspace` | Delete selected layer |

### 1.7 Constraints

- Background image layer is always at index 0 (bottom), locked, non-deletable
- Maximum ~20 layers before performance degrades (browser RAM)
- Blend modes use CSS `globalCompositeOperation` — limited to 6 modes, no custom compositing
- Undo/redo covers all layer operations (existing JSON-based history)

---

## 2. Filter Gallery

### 2.1 Architecture

Each named filter is a combination of fabric.js filter constructors with specific parameter values. Filters apply to the **background image layer only**. A new **intensity slider** (0-100%) blends between the original and filtered result.

### 2.2 Filter Definitions

```ts
interface FilterPreset {
  id: string
  name: string
  category: 'warm' | 'cool' | 'vintage' | 'bw' | 'dramatic' | 'basic'
  filters: { type: string; params: Record<string, number> }[]
}
```

### 2.3 20 Named Presets

| Category | Name | Recipe (all values are fabric.js filter params) |
|---|---|---|
| **Warm** | Valencia | Brightness: 0.08, Saturation: 0.15, HueRotation: -0.028 |
| | Nashville | Brightness: 0.05, Contrast: 0.10, Saturation: 0.20, HueRotation: -0.056 |
| | Gingham | Brightness: 0.05, Contrast: -0.05, Saturation: -0.15 |
| | Lark | Brightness: 0.10, Contrast: 0.05, Saturation: -0.10 |
| **Cool** | Clarendon | Brightness: 0.05, Contrast: 0.20, Saturation: 0.15 |
| | Hudson | Brightness: -0.05, Contrast: 0.10, Saturation: -0.20, HueRotation: 0.056 |
| | Brooklyn | Brightness: -0.05, Contrast: 0.05, Saturation: -0.15, HueRotation: 0.028 |
| | Willow | Grayscale, Brightness: 0.05, Contrast: 0.10 |
| **Vintage** | 1977 | Brightness: 0.10, Contrast: -0.10, Saturation: 0.30, HueRotation: -0.083 |
| | Earlybird | Brightness: 0.05, Contrast: -0.05, Saturation: 0.20, Sepia |
| | Toaster | Brightness: 0.15, Contrast: 0.15, Saturation: 0.10, HueRotation: -0.111 |
| | Walden | Brightness: 0.10, Contrast: -0.05, Saturation: 0.10, HueRotation: 0.056 |
| **B&W** | Inkwell | Grayscale, Contrast: 0.20 |
| | Moon | Grayscale, Brightness: 0.10, Contrast: 0.10 |
| | Reyes | Grayscale, Brightness: 0.15, Contrast: -0.10 |
| **Dramatic** | Juno | Contrast: 0.25, Saturation: 0.20 |
| | Lo-Fi | Contrast: 0.30, Saturation: 0.25, Brightness: -0.05 |
| | Aden | Brightness: 0.10, Saturation: -0.20, HueRotation: 0.083 |
| | Perpetua | Brightness: 0.05, Saturation: 0.10, HueRotation: 0.111, Contrast: -0.05 |
| **Basic** | Natural | (none — removes all preset filters) |

### 2.4 Filter Intensity

A new slider (0-100%, default 100%) scales all filter parameter values:

```ts
function applyWithIntensity(preset: FilterPreset, intensity: number) {
  const scale = intensity / 100
  return preset.filters.map(f => ({
    type: f.type,
    params: Object.fromEntries(
      Object.entries(f.params).map(([k, v]) => [k, v * scale])
    ),
  }))
}
```

Boolean filters like Grayscale/Sepia are applied at full strength when intensity > 0, with a Brightness offset to simulate fading.

### 2.5 Gallery UI

```
┌─────────────────────────────────────┐
│ 🎨 FILTER GALLERY                    │
├─────────────────────────────────────┤
│ [All] [Warm] [Cool] [Vintage] [B&W] [Dramatic]  ← pill tabs, horizontally scrollable
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ live │ │ live │ │ live │        │  ← 64x64 thumbnails of actual
│ │ prev │ │ prev │ │ prev │        │    image with filter applied
│ └──────┘ └──────┘ └──────┘        │
│ Valencia Nashville Gingham         │
│                                     │
│ ┌──────┐                           │
│ │ live │                           │
│ └──────┘                           │
│  Lark                               │
├─────────────────────────────────────┤
│ Intensity: [==================] 75% │  ← scales filter strength
└─────────────────────────────────────┘
```

### 2.6 Thumbnail Preview Generation

On image load, create a **64x64 downscaled canvas** of the background image. For each of the 20 presets, apply filters to this tiny canvas and cache the result as a data URL. This runs in a `requestIdleCallback` or chunked via `setTimeout(0)` to avoid blocking.

---

## 3. Mobile Considerations

| Element | Desktop | Mobile (< 1024px) |
|---|---|---|
| Layers panel | Right sidebar, always visible | Bottom sheet, swipe up to expand |
| Filter gallery | Right sidebar, scrollable | Horizontal scrollable strip at bottom |
| Category tabs | Horizontal pill row | Same, scrollable |
| Intensity slider | Below filter thumbnails | Above the filter strip |
| Blend mode dropdown | Top of layers panel | Inside layer detail sheet |
| Opacity slider | Top of layers panel | Inside layer detail sheet |

## 4. 5-State Design

| State | Layers Panel | Filter Gallery |
|---|---|---|
| **Empty** | "Upload an image to start" hint | Disabled, grayed tabs |
| **Loading** | Skeleton rows while image loads | Skeleton thumbnails |
| **Success** | Background layer listed, controls active | 20 thumbnails generated |
| **Error** | Toast: "Failed to add layer" | Toast: "Filter failed", reverts |
| **Partial** | Some layers hidden (toggled off) | Filter at partial intensity |

## 5. Acceptance Criteria

### Layers
- AC1: Given the user has an image loaded, when they click [+ Add] and select an image, then a new layer appears above the background in the panel.
- AC2: Given 3+ layers exist, when the user drags a layer row up/down, then the canvas z-order updates immediately.
- AC3: Given a layer is selected, when the user adjusts opacity to 50%, then the layer renders at 50% transparency on canvas.
- AC4: Given a layer is selected, when the user changes blend mode to "Multiply", then the layer composites with "multiply" blending.
- AC5: Given the user double-clicks a layer name, when they type a new name and press Enter, then the layer is renamed.
- AC6: Given the user clicks the eye icon, then the layer toggles visible/hidden on canvas.
- AC7: Given the background layer is selected, then the delete button is disabled.

### Filter Gallery
- AC8: Given an image is loaded, when the user clicks a category tab, then only filters in that category are shown.
- AC9: Given an image is loaded, then filter thumbnails show live previews of the actual image.
- AC10: Given the user clicks "Valencia", then the filter applies to the background image immediately.
- AC11: Given a filter is active, when the user adjusts intensity to 50%, then the filter effect is visually halved.
- AC12: Given the user clicks the active filter again, then the filter is removed (back to Natural).

## 6. Technical Notes

- All changes are client-side only (no backend)
- Undo/redo covers all layer + filter operations via existing JSON history
- Filter presets are defined as a static config array (easy to add more later)
- Thumbnail generation uses off-screen canvas, not visible DOM elements
- Blend modes limited to CSS `globalCompositeOperation` (6 modes)

## 7. Competitive Positioning

| Feature | Pixlr E | Our Target | Differentiator |
|---|---|---|---|
| Layer count | Unlimited | ~20 practical | Sufficient for target user |
| Blend modes | ~15 | 6 | Covers 90% of use cases |
| Filter presets | 30+ | 20 | Instagram-named, recognizable |
| Filter intensity | No | Yes | Our unique advantage |
| Live filter thumbnails | No | Yes | Visual browsing > text labels |
| Layer opacity | Yes | Yes | Parity |
| Drag reorder | Yes | Yes | Parity |

**Our differentiators**: Filter intensity slider + live thumbnail previews. No competitor in the free tier offers both.
