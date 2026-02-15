# Image Editor Fabric.js Rewrite — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current `<img>` + CSS filter shell with a real Fabric.js canvas editor — working brush, eraser, text, selection, crop, undo/redo, and proper image filters with export.

**Architecture:** A single `useFabricCanvas` hook encapsulates all Fabric.js interactions (init, dispose, tool switching, filters, undo/redo, export). The existing page layout, toolbar UI, adjustments panel UI, and layers panel UI all stay — only their event handlers change to call into the hook. Fabric.js is imported dynamically (`'use client'` + conditional import) to avoid SSR issues.

**Tech Stack:** `fabric` v7 (npm package), React hooks, TypeScript, Next.js App Router

---

## Task 1: Install Fabric.js

**Files:**
- Modify: `handytool-client/package.json`

**Step 1: Install fabric**

Run:
```bash
cd handytool-client && pnpm add fabric
```

**Step 2: Verify it resolves**

Run:
```bash
node -e "console.log(require('fabric/package.json').version)"
```
Expected: Version 7.x.x (or 6.x.x)

**Step 3: Check for SSR issues**

Fabric.js uses browser APIs. Verify the Next.js build still passes:

Run: `cd handytool-client && npx tsc --noEmit`
Expected: 0 errors (fabric won't be imported at module scope, only inside `'use client'` components)

**Step 4: Commit**

```bash
cd handytool-client
git add package.json pnpm-lock.yaml
git commit -m "feat(image-editor): install fabric.js for canvas rewrite"
```

---

## Task 2: Create useFabricCanvas hook

**Files:**
- Create: `handytool-client/tools/image-editor/use-fabric-canvas.ts`

This is the core abstraction. It manages the Fabric.js canvas lifecycle and exposes methods for the page component to call. All Fabric.js imports and interactions are contained here.

**Step 1: Create the hook file**

```typescript
'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import type { ToolType } from './editor-toolbar'
import type { Adjustments, FilterPreset } from './adjustments-panel'

// ---- Types ----

export interface FabricCanvasAPI {
  // Canvas ref
  canvasRef: React.RefObject<HTMLCanvasElement | null>

  // State
  isReady: boolean
  imageSize: { width: number; height: number } | null

  // Image loading
  loadImage: (file: File) => void

  // Tools
  setTool: (tool: ToolType) => void
  setBrushColor: (color: string) => void
  setBrushWidth: (width: number) => void

  // Filters
  applyAdjustments: (adj: Adjustments) => void
  applyFilterPreset: (preset: FilterPreset) => void

  // Zoom
  setZoom: (zoom: number) => void

  // Undo / Redo
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean

  // Canvas operations
  deleteSelected: () => void
  selectAll: () => void
  rotateCW: () => void
  rotateCCW: () => void
  flipH: () => void
  flipV: () => void

  // Export
  exportPNG: () => void
  exportJPEG: (quality?: number) => void

  // Reset
  reset: () => void
}

// ---- Constants ----

const MAX_HISTORY = 30

// ---- Hook ----

export function useFabricCanvas(): FabricCanvasAPI {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricRef = useRef<any>(null) // fabric.Canvas instance
  const fabricModule = useRef<any>(null) // fabric module
  const bgImageRef = useRef<any>(null) // background FabricImage

  const [isReady, setIsReady] = useState(false)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)

  // Undo/redo state
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const isRestoringRef = useRef(false) // flag to skip saving during undo/redo
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // ---- History helpers ----

  const saveState = useCallback(() => {
    if (isRestoringRef.current || !fabricRef.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    historyIndexRef.current++
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current)
    historyRef.current.push(json)
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
      historyIndexRef.current--
    }
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(false)
  }, [])

  // ---- Init canvas ----

  useEffect(() => {
    if (!canvasRef.current) return

    let disposed = false

    import('fabric').then((fabric) => {
      if (disposed || !canvasRef.current) return

      fabricModule.current = fabric
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: true,
      })

      fabricRef.current = canvas
      setIsReady(true)

      // Listen for state changes (for undo/redo)
      canvas.on('object:added', () => { if (!isRestoringRef.current) saveState() })
      canvas.on('object:modified', () => { if (!isRestoringRef.current) saveState() })
      canvas.on('object:removed', () => { if (!isRestoringRef.current) saveState() })
    })

    return () => {
      disposed = true
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  }, [saveState])

  // ---- Load image ----

  const loadImage = useCallback((file: File) => {
    const canvas = fabricRef.current
    const fabric = fabricModule.current
    if (!canvas || !fabric) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string

      fabric.FabricImage.fromURL(url).then((img: any) => {
        // Size canvas to image
        const w = img.width
        const h = img.height
        canvas.setWidth(w)
        canvas.setHeight(h)
        setImageSize({ width: w, height: h })

        // Set as background
        canvas.backgroundImage = img
        img.set({ selectable: false, evented: false })
        bgImageRef.current = img

        canvas.renderAll()

        // Reset history
        historyRef.current = []
        historyIndexRef.current = -1
        setCanUndo(false)
        setCanRedo(false)
        saveState()
      })
    }
    reader.readAsDataURL(file)
  }, [saveState])

  // ---- Tool switching ----

  const setTool = useCallback((tool: ToolType) => {
    const canvas = fabricRef.current
    const fabric = fabricModule.current
    if (!canvas || !fabric) return

    // Reset modes
    canvas.isDrawingMode = false
    canvas.selection = false
    canvas.defaultCursor = 'default'
    canvas.hoverCursor = 'default'

    switch (tool) {
      case 'move':
        canvas.defaultCursor = 'grab'
        canvas.hoverCursor = 'grab'
        // In move mode, objects are selectable for moving
        canvas.selection = true
        canvas.forEachObject((obj: any) => {
          obj.selectable = true
          obj.evented = true
        })
        break

      case 'brush':
        canvas.isDrawingMode = true
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.width = 5
        canvas.freeDrawingBrush.color = '#000000'
        break

      case 'eraser':
        canvas.isDrawingMode = true
        // EraserBrush may not be available in all builds
        if (fabric.EraserBrush) {
          canvas.freeDrawingBrush = new fabric.EraserBrush(canvas)
          canvas.freeDrawingBrush.width = 20
        } else {
          // Fallback: white brush as "eraser"
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
          canvas.freeDrawingBrush.width = 20
          canvas.freeDrawingBrush.color = '#ffffff'
        }
        break

      case 'text':
        canvas.defaultCursor = 'text'
        // Add text on canvas click
        const textHandler = (opt: any) => {
          const pointer = canvas.getScenePoint(opt.e)
          const text = new fabric.IText('Type here', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 24,
            fill: '#000000',
            fontFamily: 'Arial',
            editable: true,
          })
          canvas.add(text)
          canvas.setActiveObject(text)
          text.enterEditing()
          // Remove one-shot handler
          canvas.off('mouse:down', textHandler)
        }
        canvas.on('mouse:down', textHandler)
        break

      case 'select':
        canvas.selection = true
        canvas.forEachObject((obj: any) => {
          obj.selectable = true
          obj.evented = true
        })
        break

      case 'crop':
        // Crop: add a semi-transparent overlay rect the user can resize
        canvas.selection = false
        const cropRect = new fabric.Rect({
          left: canvas.width * 0.1,
          top: canvas.height * 0.1,
          width: canvas.width * 0.8,
          height: canvas.height * 0.8,
          fill: 'rgba(0,0,0,0)',
          stroke: '#3D6AF2',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          cornerColor: '#3D6AF2',
          cornerStrokeColor: '#ffffff',
          transparentCorners: false,
          hasRotatingPoint: false,
        })
        // Tag it so we can find it later
        ;(cropRect as any).__isCropRect = true
        canvas.add(cropRect)
        canvas.setActiveObject(cropRect)
        break
    }

    canvas.renderAll()
  }, [])

  // ---- Brush settings ----

  const setBrushColor = useCallback((color: string) => {
    const canvas = fabricRef.current
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color
    }
  }, [])

  const setBrushWidth = useCallback((width: number) => {
    const canvas = fabricRef.current
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = width
    }
  }, [])

  // ---- Filters ----

  const applyAdjustments = useCallback((adj: Adjustments) => {
    const fabric = fabricModule.current
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!fabric || !img || !canvas) return

    // Build filter array from adjustments
    const filters: any[] = []

    if (adj.brightness !== 0) {
      filters.push(new fabric.filters.Brightness({ brightness: adj.brightness / 100 }))
    }
    if (adj.contrast !== 0) {
      filters.push(new fabric.filters.Contrast({ contrast: adj.contrast / 100 }))
    }
    if (adj.saturate !== 0) {
      filters.push(new fabric.filters.Saturation({ saturation: adj.saturate / 100 }))
    }
    if (adj.hueRotate !== 0) {
      filters.push(new fabric.filters.HueRotation({ rotation: adj.hueRotate / 360 }))
    }

    img.filters = filters
    img.applyFilters()
    canvas.renderAll()
  }, [])

  const applyFilterPreset = useCallback((preset: FilterPreset) => {
    const fabric = fabricModule.current
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!fabric || !img || !canvas) return

    // Keep existing adjustment filters, add preset on top
    // For simplicity, presets replace the entire filter stack
    // (adjustments + preset are re-applied together in the page component)
    const filters: any[] = [...(img.filters || [])]

    // Remove any previous preset filters (tagged)
    const adjusted = filters.filter((f: any) => !f.__isPreset)

    switch (preset) {
      case 'grayscale':
        adjusted.push(Object.assign(new fabric.filters.Grayscale(), { __isPreset: true }))
        break
      case 'sepia':
        adjusted.push(Object.assign(new fabric.filters.Sepia(), { __isPreset: true }))
        break
      case 'invert':
        adjusted.push(Object.assign(new fabric.filters.Invert(), { __isPreset: true }))
        break
      case 'blur':
        adjusted.push(Object.assign(new fabric.filters.Blur({ blur: 0.1 }), { __isPreset: true }))
        break
      case 'warm':
        adjusted.push(Object.assign(new fabric.filters.Sepia({ sepia: 0.3 }), { __isPreset: true }))
        adjusted.push(Object.assign(new fabric.filters.Saturation({ saturation: 0.4 }), { __isPreset: true }))
        adjusted.push(Object.assign(new fabric.filters.Brightness({ brightness: 0.05 }), { __isPreset: true }))
        break
      case 'none':
      default:
        break
    }

    img.filters = adjusted
    img.applyFilters()
    canvas.renderAll()
  }, [])

  // ---- Zoom ----

  const setZoom = useCallback((zoomPercent: number) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const scale = zoomPercent / 100
    canvas.setZoom(scale)
    // Adjust canvas viewport dimensions to show full image
    if (imageSize) {
      canvas.setWidth(imageSize.width * scale)
      canvas.setHeight(imageSize.height * scale)
    }
    canvas.renderAll()
  }, [imageSize])

  // ---- Undo / Redo ----

  const undo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || historyIndexRef.current <= 0) return

    isRestoringRef.current = true
    historyIndexRef.current--
    const json = historyRef.current[historyIndexRef.current]

    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      // Restore background image ref
      bgImageRef.current = canvas.backgroundImage
      canvas.renderAll()
      isRestoringRef.current = false
      setCanUndo(historyIndexRef.current > 0)
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
    })
  }, [])

  const redo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return

    isRestoringRef.current = true
    historyIndexRef.current++
    const json = historyRef.current[historyIndexRef.current]

    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      bgImageRef.current = canvas.backgroundImage
      canvas.renderAll()
      isRestoringRef.current = false
      setCanUndo(historyIndexRef.current > 0)
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
    })
  }, [])

  // ---- Canvas operations ----

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const objects = canvas.getActiveObjects()
    objects.forEach((obj: any) => canvas.remove(obj))
    canvas.discardActiveObject()
    canvas.renderAll()
  }, [])

  const selectAll = useCallback(() => {
    const canvas = fabricRef.current
    const fabric = fabricModule.current
    if (!canvas || !fabric) return
    const objects = canvas.getObjects().filter((o: any) => o.selectable)
    if (objects.length === 0) return
    const selection = new fabric.ActiveSelection(objects, { canvas })
    canvas.setActiveObject(selection)
    canvas.renderAll()
  }, [])

  const rotateCW = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.rotate((img.angle || 0) + 90)
    canvas.renderAll()
    saveState()
  }, [saveState])

  const rotateCCW = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.rotate((img.angle || 0) - 90)
    canvas.renderAll()
    saveState()
  }, [saveState])

  const flipH = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.set({ flipX: !img.flipX })
    canvas.renderAll()
    saveState()
  }, [saveState])

  const flipV = useCallback(() => {
    const img = bgImageRef.current
    const canvas = fabricRef.current
    if (!img || !canvas) return
    img.set({ flipY: !img.flipY })
    canvas.renderAll()
    saveState()
  }, [saveState])

  // ---- Export ----

  const exportPNG = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    // Export at full zoom
    const currentZoom = canvas.getZoom()
    canvas.setZoom(1)
    if (imageSize) {
      canvas.setWidth(imageSize.width)
      canvas.setHeight(imageSize.height)
    }
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 })
    // Restore zoom
    canvas.setZoom(currentZoom)
    if (imageSize) {
      canvas.setWidth(imageSize.width * currentZoom)
      canvas.setHeight(imageSize.height * currentZoom)
    }
    canvas.renderAll()

    const link = document.createElement('a')
    link.download = 'edited-image.png'
    link.href = dataUrl
    link.click()
  }, [imageSize])

  const exportJPEG = useCallback((quality = 0.92) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const currentZoom = canvas.getZoom()
    canvas.setZoom(1)
    if (imageSize) {
      canvas.setWidth(imageSize.width)
      canvas.setHeight(imageSize.height)
    }
    const dataUrl = canvas.toDataURL({ format: 'jpeg', quality, multiplier: 1 })
    canvas.setZoom(currentZoom)
    if (imageSize) {
      canvas.setWidth(imageSize.width * currentZoom)
      canvas.setHeight(imageSize.height * currentZoom)
    }
    canvas.renderAll()

    const link = document.createElement('a')
    link.download = 'edited-image.jpg'
    link.href = dataUrl
    link.click()
  }, [imageSize])

  // ---- Reset ----

  const reset = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.clear()
    canvas.backgroundColor = '#ffffff'
    bgImageRef.current = null
    setImageSize(null)
    historyRef.current = []
    historyIndexRef.current = -1
    setCanUndo(false)
    setCanRedo(false)
    canvas.renderAll()
  }, [])

  return {
    canvasRef,
    isReady,
    imageSize,
    loadImage,
    setTool,
    setBrushColor,
    setBrushWidth,
    applyAdjustments,
    applyFilterPreset,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelected,
    selectAll,
    rotateCW,
    rotateCCW,
    flipH,
    flipV,
    exportPNG,
    exportJPEG,
    reset,
  }
}
```

**Key design decisions:**
- **Dynamic `import('fabric')`** inside useEffect avoids SSR breakage — Fabric.js requires DOM.
- **Refs for Fabric objects** (`fabricRef`, `fabricModule`, `bgImageRef`): These are mutable singletons, not React state, to avoid re-renders during canvas operations.
- **`isRestoringRef` flag**: Prevents undo/redo from pushing new history entries.
- **`__isPreset` tag on filter objects**: Allows adjustment filters and preset filters to coexist without replacing each other.
- **Export resets zoom to 1x temporarily**: Ensures full-resolution export regardless of current viewport zoom.

**Step 2: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`

Possible issues:
- Fabric.js v7 types may not perfectly match. Use `any` casts where needed (the hook is the only file touching Fabric internals).
- `canvas.getScenePoint` may need adjustment depending on exact version. If it doesn't exist, use `canvas.getPointer(opt.e)`.

Expected: 0 errors (or fix type issues with `any` where Fabric types are ambiguous)

**Step 3: Commit**

```bash
cd handytool-client
git add tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): Fabric.js canvas hook with tools, filters, undo/redo, export"
```

---

## Task 3: Rewrite page.tsx to use Fabric canvas

**Files:**
- Modify: `handytool-client/app/tools/image-editor/page.tsx`

This is the biggest rewrite. The UI layout stays the same — only the state management and canvas rendering change.

**Step 1: Replace imports and state**

Replace the top of the file (lines 1-35):

```typescript
'use client'

import { useState, useCallback, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react'
import { EditorToolbar, type ToolType } from '@/tools/image-editor/editor-toolbar'
import { AdjustmentsPanel, FILTERS, type Adjustments, type FilterPreset } from '@/tools/image-editor/adjustments-panel'
import { useFabricCanvas } from '@/tools/image-editor/use-fabric-canvas'

interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturate: 0,
  hueRotate: 0,
}

export default function ImageEditorPage() {
  const fabric = useFabricCanvas()

  const [activeTool, setActiveTool] = useState<ToolType>('move')
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS)
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('none')
  const [zoom, setZoom] = useState(100)
  const [fgColor, setFgColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#000000')
  const [layers, setLayers] = useState<Layer[]>([])
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showMobileAdjustments, setShowMobileAdjustments] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
```

**Step 2: Remove buildFilterCss, replace loadImage and handleExport**

Remove the `buildFilterCss` function (lines 37-46). It's no longer needed.

Replace `loadImage` (lines 48-65):

```typescript
const loadImage = useCallback((file: File) => {
  fabric.loadImage(file)
  setLayers([{ id: 'bg', name: `Background (${file.name})`, visible: true, locked: false }])
  setActiveLayerId('bg')
  setAdjustments(DEFAULT_ADJUSTMENTS)
  setActiveFilter('none')
  setZoom(100)
}, [fabric])
```

Replace `handleExport` (lines 86-103):

```typescript
const handleExport = useCallback(() => {
  fabric.exportPNG()
}, [fabric])
```

Replace `handleReset` (lines 105-108):

```typescript
const handleReset = useCallback(() => {
  setAdjustments(DEFAULT_ADJUSTMENTS)
  setActiveFilter('none')
  setZoom(100)
  fabric.reset()
  setLayers([])
  setActiveLayerId(null)
}, [fabric])
```

**Step 3: Wire adjustments and filters to Fabric**

Add useEffect hooks to push state changes to the canvas:

```typescript
// Sync tool changes to Fabric
useEffect(() => {
  fabric.setTool(activeTool)
}, [activeTool, fabric])

// Sync adjustments to Fabric filters
useEffect(() => {
  fabric.applyAdjustments(adjustments)
}, [adjustments, fabric])

// Sync filter preset to Fabric
useEffect(() => {
  fabric.applyFilterPreset(activeFilter)
}, [activeFilter, fabric])

// Sync zoom to Fabric
useEffect(() => {
  fabric.setZoom(zoom)
}, [zoom, fabric])

// Sync brush color
useEffect(() => {
  fabric.setBrushColor(fgColor)
}, [fgColor, fabric])
```

**Step 4: Wire undo/redo buttons**

Replace the undo button (lines 135-138) onClick:

```tsx
<button
  onClick={fabric.undo}
  disabled={!fabric.canUndo}
  className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
  title="Undo (Ctrl+Z)"
  aria-label="Undo"
>
```

Replace the redo button (lines 140-143) onClick:

```tsx
<button
  onClick={fabric.redo}
  disabled={!fabric.canRedo}
  className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
  title="Redo (Ctrl+Shift+Z)"
  aria-label="Redo"
>
```

**Step 5: Replace the canvas section**

Replace lines 238-252 (the `<img>` section) with the Fabric canvas:

```tsx
{/* Image canvas — Fabric.js */}
<div className="relative shadow-2xl">
  <canvas ref={fabric.canvasRef} />
</div>
```

Remove the CSS zoom transform from the wrapper `<div>` — zoom is now handled by Fabric's `setZoom`.

**Step 6: Wire keyboard shortcuts**

Add a useEffect for keyboard shortcuts:

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    // Undo: Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      fabric.undo()
      return
    }
    // Redo: Ctrl+Shift+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      fabric.redo()
      return
    }
    // Delete selected
    if (e.key === 'Delete' || e.key === 'Backspace') {
      fabric.deleteSelected()
      return
    }
    // Select all: Ctrl+A
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      fabric.selectAll()
      return
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [fabric])
```

**Step 7: Wire menu bar**

Replace the static menu buttons (lines 126-131) with dropdown menus. Use simple `<details>` for now:

```tsx
<nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-400 ml-6 relative">
  {/* File menu */}
  <div className="relative group">
    <button className="px-3 py-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer">File</button>
    <div className="hidden group-hover:block absolute left-0 top-full bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[160px]">
      <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer">Open Image</button>
      <button onClick={() => fabric.exportPNG()} disabled={!fabric.imageSize} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Export PNG</button>
      <button onClick={() => fabric.exportJPEG()} disabled={!fabric.imageSize} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Export JPEG</button>
    </div>
  </div>

  {/* Edit menu */}
  <div className="relative group">
    <button className="px-3 py-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer">Edit</button>
    <div className="hidden group-hover:block absolute left-0 top-full bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[160px]">
      <button onClick={fabric.undo} disabled={!fabric.canUndo} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Undo</button>
      <button onClick={fabric.redo} disabled={!fabric.canRedo} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Redo</button>
      <hr className="border-slate-700 my-1" />
      <button onClick={fabric.deleteSelected} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer">Delete Selected</button>
      <button onClick={fabric.selectAll} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer">Select All</button>
    </div>
  </div>

  {/* Image menu */}
  <div className="relative group">
    <button className="px-3 py-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer">Image</button>
    <div className="hidden group-hover:block absolute left-0 top-full bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[160px]">
      <button onClick={fabric.rotateCW} disabled={!fabric.imageSize} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Rotate 90° CW</button>
      <button onClick={fabric.rotateCCW} disabled={!fabric.imageSize} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Rotate 90° CCW</button>
      <hr className="border-slate-700 my-1" />
      <button onClick={fabric.flipH} disabled={!fabric.imageSize} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Flip Horizontal</button>
      <button onClick={fabric.flipV} disabled={!fabric.imageSize} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 cursor-pointer disabled:opacity-40">Flip Vertical</button>
    </div>
  </div>

  {/* Filters menu */}
  <div className="relative group">
    <button className="px-3 py-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer">Filters</button>
    <div className="hidden group-hover:block absolute left-0 top-full bg-[#1a2333] border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[160px]">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => setActiveFilter(f.id)}
          className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${activeFilter === f.id ? 'text-[var(--ht-color-primary-500)] bg-[var(--ht-color-primary-500)]/10' : 'text-slate-300 hover:bg-slate-700'}`}
        >
          {f.label}
        </button>
      ))}
    </div>
  </div>
</nav>
```

**Step 8: Update image presence check**

Throughout the JSX, replace `imageUrl` checks with `fabric.imageSize`:

- Line 174: `disabled={!imageUrl}` → `disabled={!fabric.imageSize}`
- Line 210: `{!imageUrl ?` → `{!fabric.imageSize ?`
- Status bar line 351: `{imageSize ?` → `{fabric.imageSize ?` and use `fabric.imageSize.width` / `fabric.imageSize.height`

**Step 9: Remove unused state**

Remove `imageUrl`, `imageSize` state declarations — these are now managed by the hook.

**Step 10: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`
Expected: 0 errors

**Step 11: Commit**

```bash
cd handytool-client
git add app/tools/image-editor/page.tsx
git commit -m "feat(image-editor): rewrite page to use Fabric.js canvas"
```

---

## Task 4: Wire adjustments panel to Fabric filters

**Files:**
- Modify: `handytool-client/tools/image-editor/adjustments-panel.tsx`

The adjustments panel UI stays unchanged. The only change is removing the CSS filter strings from the `FILTERS` array since they're no longer used (the page component maps preset names to Fabric filters via the hook).

**Step 1: Remove CSS strings from FILTERS**

Update the FILTERS array (lines 22-29):

```typescript
// BEFORE:
const FILTERS: { id: FilterPreset; label: string; css: string }[] = [
  { id: 'none', label: 'Natural', css: '' },
  { id: 'blur', label: 'Soft Focus', css: 'blur(2px)' },
  ...
]

// AFTER:
const FILTERS: { id: FilterPreset; label: string }[] = [
  { id: 'none', label: 'Natural' },
  { id: 'blur', label: 'Soft Focus' },
  { id: 'grayscale', label: 'Grayscale' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'invert', label: 'Invert' },
  { id: 'warm', label: 'Warm' },
]
```

**Step 2: Fix any references to `f.css`**

Search for `css` references. The only place was `FILTERS` — the page component previously used `preset.css` in `buildFilterCss()`, which is now removed.

Update imports in page.tsx if `FILTERS` type changed.

**Step 3: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
cd handytool-client
git add tools/image-editor/adjustments-panel.tsx
git commit -m "feat(image-editor): remove CSS filter strings, Fabric handles filters"
```

---

## Task 5: Verify end-to-end

**Step 1: Start client**

Run: `cd handytool-client && pnpm dev`

**Step 2: Test basic flow**

1. Navigate to http://localhost:3000/tools/image-editor
2. Upload an image (drag-drop or click)
3. Verify: Image appears on canvas (not as `<img>` — inspect element should show `<canvas>`)

**Step 3: Test tools**

1. **Move tool**: Click objects, drag to reposition
2. **Brush tool**: Draw on the canvas — strokes should appear
3. **Eraser tool**: Erase brush strokes (or white brush if EraserBrush unavailable)
4. **Text tool**: Click on canvas — editable text appears
5. **Select tool**: Click to select objects, press Delete to remove

**Step 4: Test adjustments**

1. Move Brightness slider → image brightens/darkens in real-time
2. Move Contrast slider → contrast changes
3. Move Saturate slider → saturation changes
4. Move Hue Rotate slider → hue shifts
5. Click filter presets (Grayscale, Sepia, etc.) → filter applies

**Step 5: Test undo/redo**

1. Draw something, Ctrl+Z → stroke disappears
2. Ctrl+Shift+Z → stroke reappears
3. Undo/Redo buttons should enable/disable correctly

**Step 6: Test menus**

1. File → Open Image, Export PNG, Export JPEG
2. Edit → Undo, Redo, Delete Selected, Select All
3. Image → Rotate CW/CCW, Flip H/V
4. Filters → preset gallery

**Step 7: Test export**

1. Click Export → PNG downloads
2. Open exported file → should include all edits (brush strokes, text, filters)

**Step 8: Test zoom**

1. Zoom slider 25-300% → canvas scales
2. Export at zoomed state → full resolution (not scaled)

**Step 9: Verify build**

Run: `cd handytool-client && npx tsc --noEmit`
Expected: 0 errors

**Step 10: Commit fixes**

If any fixes were needed:

```bash
cd handytool-client
git add -A
git commit -m "fix(image-editor): end-to-end verification fixes"
```

---

## Summary

| Task | What | Commit |
|------|------|--------|
| 1 | Install fabric | `feat(image-editor): install fabric.js for canvas rewrite` |
| 2 | Create useFabricCanvas hook | `feat(image-editor): Fabric.js canvas hook with tools, filters, undo/redo, export` |
| 3 | Rewrite page.tsx | `feat(image-editor): rewrite page to use Fabric.js canvas` |
| 4 | Update adjustments panel | `feat(image-editor): remove CSS filter strings, Fabric handles filters` |
| 5 | E2E verification | Fix commits if needed |

**Files changed:**
- New: `tools/image-editor/use-fabric-canvas.ts`
- Rewrite: `app/tools/image-editor/page.tsx`
- Modify: `tools/image-editor/adjustments-panel.tsx`
- Unchanged: `tools/image-editor/editor-toolbar.tsx` (UI stays, tool switching wired via page)
- Unchanged: `app/tools/image-editor/layout.tsx` (SEO metadata)
