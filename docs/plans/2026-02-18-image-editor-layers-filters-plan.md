# Image Editor — Layers & Filter Gallery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a functional multi-layer system and expand the filter gallery from 6 to 20 Instagram-style presets with intensity slider and live thumbnail previews.

**Architecture:** Fabric.js object-as-layer (each canvas object IS a layer). Filter presets defined as a static config array of fabric.js filter parameter combos. Layers panel is a new component; filter gallery expands the existing adjustments panel.

**Tech Stack:** React 19, fabric.js 6, TypeScript, Tailwind CSS v4, Next.js 16

---

## Task 1: Create Filter Presets Config

**Files:**
- Create: `tools/image-editor/filter-presets.ts`

**Step 1: Create the filter presets data file**

```ts
// tools/image-editor/filter-presets.ts

export type FilterCategory = 'warm' | 'cool' | 'vintage' | 'bw' | 'dramatic' | 'basic'

export interface FilterPresetConfig {
  id: string
  name: string
  category: FilterCategory
  filters: { type: string; params: Record<string, number> }[]
}

export const FILTER_CATEGORIES: { id: FilterCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'bw', label: 'B&W' },
  { id: 'dramatic', label: 'Dramatic' },
]

export const FILTER_PRESETS: FilterPresetConfig[] = [
  // Basic
  { id: 'natural', name: 'Natural', category: 'basic', filters: [] },

  // Warm
  { id: 'valencia', name: 'Valencia', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.08 } },
    { type: 'Saturation', params: { saturation: 0.15 } },
    { type: 'HueRotation', params: { rotation: -0.028 } },
  ]},
  { id: 'nashville', name: 'Nashville', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
    { type: 'Saturation', params: { saturation: 0.20 } },
    { type: 'HueRotation', params: { rotation: -0.056 } },
  ]},
  { id: 'gingham', name: 'Gingham', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
    { type: 'Saturation', params: { saturation: -0.15 } },
  ]},
  { id: 'lark', name: 'Lark', category: 'warm', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: 0.05 } },
    { type: 'Saturation', params: { saturation: -0.10 } },
  ]},

  // Cool
  { id: 'clarendon', name: 'Clarendon', category: 'cool', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: 0.20 } },
    { type: 'Saturation', params: { saturation: 0.15 } },
  ]},
  { id: 'hudson', name: 'Hudson', category: 'cool', filters: [
    { type: 'Brightness', params: { brightness: -0.05 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
    { type: 'Saturation', params: { saturation: -0.20 } },
    { type: 'HueRotation', params: { rotation: 0.056 } },
  ]},
  { id: 'brooklyn', name: 'Brooklyn', category: 'cool', filters: [
    { type: 'Brightness', params: { brightness: -0.05 } },
    { type: 'Contrast', params: { contrast: 0.05 } },
    { type: 'Saturation', params: { saturation: -0.15 } },
    { type: 'HueRotation', params: { rotation: 0.028 } },
  ]},
  { id: 'willow', name: 'Willow', category: 'cool', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
  ]},

  // Vintage
  { id: '1977', name: '1977', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: -0.10 } },
    { type: 'Saturation', params: { saturation: 0.30 } },
    { type: 'HueRotation', params: { rotation: -0.083 } },
  ]},
  { id: 'earlybird', name: 'Earlybird', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
    { type: 'Saturation', params: { saturation: 0.20 } },
    { type: 'Sepia', params: {} },
  ]},
  { id: 'toaster', name: 'Toaster', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.15 } },
    { type: 'Contrast', params: { contrast: 0.15 } },
    { type: 'Saturation', params: { saturation: 0.10 } },
    { type: 'HueRotation', params: { rotation: -0.111 } },
  ]},
  { id: 'walden', name: 'Walden', category: 'vintage', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
    { type: 'Saturation', params: { saturation: 0.10 } },
    { type: 'HueRotation', params: { rotation: 0.056 } },
  ]},

  // B&W
  { id: 'inkwell', name: 'Inkwell', category: 'bw', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Contrast', params: { contrast: 0.20 } },
  ]},
  { id: 'moon', name: 'Moon', category: 'bw', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Contrast', params: { contrast: 0.10 } },
  ]},
  { id: 'reyes', name: 'Reyes', category: 'bw', filters: [
    { type: 'Grayscale', params: {} },
    { type: 'Brightness', params: { brightness: 0.15 } },
    { type: 'Contrast', params: { contrast: -0.10 } },
  ]},

  // Dramatic
  { id: 'juno', name: 'Juno', category: 'dramatic', filters: [
    { type: 'Contrast', params: { contrast: 0.25 } },
    { type: 'Saturation', params: { saturation: 0.20 } },
  ]},
  { id: 'lofi', name: 'Lo-Fi', category: 'dramatic', filters: [
    { type: 'Contrast', params: { contrast: 0.30 } },
    { type: 'Saturation', params: { saturation: 0.25 } },
    { type: 'Brightness', params: { brightness: -0.05 } },
  ]},
  { id: 'aden', name: 'Aden', category: 'dramatic', filters: [
    { type: 'Brightness', params: { brightness: 0.10 } },
    { type: 'Saturation', params: { saturation: -0.20 } },
    { type: 'HueRotation', params: { rotation: 0.083 } },
  ]},
  { id: 'perpetua', name: 'Perpetua', category: 'dramatic', filters: [
    { type: 'Brightness', params: { brightness: 0.05 } },
    { type: 'Saturation', params: { saturation: 0.10 } },
    { type: 'HueRotation', params: { rotation: 0.111 } },
    { type: 'Contrast', params: { contrast: -0.05 } },
  ]},
]
```

**Step 2: Verify the file compiles**

Run: `pnpm exec tsc --noEmit --project tsconfig.json 2>&1 | grep filter-presets || echo "No errors"`
Expected: No errors

**Step 3: Commit**

```bash
git add tools/image-editor/filter-presets.ts
git commit -m "feat(image-editor): add 20 Instagram-style filter preset configs"
```

---

## Task 2: Refactor `applyFilterPreset` for New Config + Intensity

**Files:**
- Modify: `tools/image-editor/use-fabric-canvas.ts` (lines 5, 10-41, 608-655)
- Modify: `tools/image-editor/adjustments-panel.tsx` (lines 10, 22-29, 155)

**Step 1: Update `FilterPreset` type and imports**

In `adjustments-panel.tsx`, remove the old `FilterPreset` type (line 10) and `FILTERS` array (lines 22-29) and export (line 155). These are replaced by the new config.

Replace the old type:
```ts
// OLD (remove)
export type FilterPreset = 'none' | 'grayscale' | 'sepia' | 'blur' | 'invert' | 'warm'
```

With an import of the new config types. The `activeFilter` prop changes from the old string union to a `string` (the preset ID from the config). Add `filterIntensity: number` and `onFilterIntensityChange: (v: number) => void` to props.

**Step 2: Update `applyFilterPreset` in `use-fabric-canvas.ts`**

Replace the import (line 5):
```ts
// OLD
import type { Adjustments, FilterPreset } from './adjustments-panel'
// NEW
import type { Adjustments } from './adjustments-panel'
import type { FilterPresetConfig } from './filter-presets'
```

Update the `FabricCanvasAPI` interface (line 21):
```ts
// OLD
applyFilterPreset: (preset: FilterPreset) => void
// NEW
applyFilterPreset: (preset: FilterPresetConfig, intensity: number) => void
```

Replace the entire `applyFilterPreset` function body (lines 608-655) with:

```ts
const applyFilterPreset = useCallback((preset: FilterPresetConfig, intensity: number) => {
  const bgImg = bgImageRef.current
  const fabric = fabricModuleRef.current
  const canvas = fabricRef.current
  if (!bgImg || !fabric || !canvas) return

  const filtersNS = fabric.filters ?? fabric

  // Keep only non-preset (adjustment) filters
  const currentFilters: any[] = bgImg.filters ?? []
  const adjustmentFilters = currentFilters.filter((f: any) => !f.__isPreset)

  const presetFilters: any[] = []

  const tagPreset = (f: any) => {
    f.__isPreset = true
    return f
  }

  const scale = intensity / 100

  if (scale > 0 && preset.filters.length > 0) {
    for (const f of preset.filters) {
      const FilterClass = (filtersNS as any)[f.type]
      if (!FilterClass) continue

      // Boolean filters (Grayscale, Sepia) — apply at full strength
      if (Object.keys(f.params).length === 0) {
        presetFilters.push(tagPreset(new FilterClass()))
        continue
      }

      // Numeric filters — scale params by intensity
      const scaledParams: Record<string, number> = {}
      for (const [k, v] of Object.entries(f.params)) {
        scaledParams[k] = v * scale
      }
      presetFilters.push(tagPreset(new FilterClass(scaledParams)))
    }
  }

  bgImg.filters = [...adjustmentFilters, ...presetFilters]
  bgImg.applyFilters()
  canvas.renderAll()
}, [])
```

**Step 3: Update `page.tsx` to pass new types**

In `app/tools/image-editor/page.tsx`:
- Change `activeFilter` state from `FilterPreset` to `string` (preset ID): `const [activeFilter, setActiveFilter] = useState<string>('natural')`
- Add `filterIntensity` state: `const [filterIntensity, setFilterIntensity] = useState(100)`
- Update the `useEffect` that calls `fabric.applyFilterPreset` to look up the config and pass intensity:
  ```ts
  import { FILTER_PRESETS } from '@/tools/image-editor/filter-presets'

  useEffect(() => {
    const preset = FILTER_PRESETS.find(p => p.id === activeFilter)
    if (preset) fabric.applyFilterPreset(preset, filterIntensity)
  }, [activeFilter, filterIntensity, fabric.applyFilterPreset])
  ```
- Pass `filterIntensity` and `onFilterIntensityChange` to `AdjustmentsPanel`

**Step 4: Verify the app compiles and existing filters work**

Run: `pnpm exec tsc --noEmit`
Expected: No type errors

**Step 5: Commit**

```bash
git add tools/image-editor/use-fabric-canvas.ts tools/image-editor/adjustments-panel.tsx app/tools/image-editor/page.tsx
git commit -m "refactor(image-editor): update applyFilterPreset for config-based presets with intensity"
```

---

## Task 3: Build Filter Gallery UI with Category Tabs, Thumbnails & Intensity Slider

**Files:**
- Modify: `tools/image-editor/adjustments-panel.tsx` (filter gallery section, lines 62-88)

**Step 1: Add category tabs, thumbnail previews, and intensity slider**

Replace the Filter Gallery section in `adjustments-panel.tsx` (lines 62-88) with:

Add to props interface:
```ts
activeFilter: string   // preset id
onFilterChange: (id: string) => void
filterIntensity: number
onFilterIntensityChange: (v: number) => void
filterThumbnails: Record<string, string>  // preset id → data URL
```

Add state for active category:
```ts
const [activeCategory, setActiveCategory] = useState<FilterCategory | 'all'>('all')
```

Import `FILTER_PRESETS`, `FILTER_CATEGORIES`, `FilterCategory` from `filter-presets.ts`.

Replace the filter gallery JSX:

```tsx
{/* Filter Gallery */}
<div className="p-4 border-b border-slate-700">
  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
    {/* icon */}
    Filter Gallery
  </h3>

  {/* Category tabs — horizontal scrollable pills */}
  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
    {FILTER_CATEGORIES.map((cat) => (
      <button
        key={cat.id}
        onClick={() => setActiveCategory(cat.id)}
        className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
          activeCategory === cat.id
            ? 'bg-[var(--ht-color-primary-500)] text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}
      >
        {cat.label}
      </button>
    ))}
  </div>

  {/* Filter thumbnails grid */}
  <div className="grid grid-cols-3 gap-1.5">
    {FILTER_PRESETS
      .filter(p => activeCategory === 'all' || p.category === activeCategory)
      .map((preset) => (
        <button
          key={preset.id}
          onClick={() => onFilterChange(preset.id === activeFilter ? 'natural' : preset.id)}
          className={`rounded-lg text-center transition-all cursor-pointer p-1 ${
            activeFilter === preset.id
              ? 'ring-2 ring-[var(--ht-color-primary-500)] bg-[var(--ht-color-primary-500)]/10'
              : 'hover:bg-slate-800'
          }`}
        >
          <div className="w-full aspect-square rounded bg-slate-700 mb-1 overflow-hidden">
            {filterThumbnails[preset.id] ? (
              <img
                src={filterThumbnails[preset.id]}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500">
                {preset.name}
              </div>
            )}
          </div>
          <span className="text-[9px] text-slate-400 leading-tight block truncate">{preset.name}</span>
        </button>
    ))}
  </div>

  {/* Intensity slider — only shown when a filter is active */}
  {activeFilter !== 'natural' && (
    <div className="mt-3">
      <SliderControl
        label="Intensity"
        value={filterIntensity}
        min={0}
        max={100}
        suffix="%"
        onChange={onFilterIntensityChange}
      />
    </div>
  )}
</div>
```

**Step 2: Remove old `FILTERS` export**

Remove the `FILTERS` array and its export from `adjustments-panel.tsx`. Update `page.tsx` to remove the `FILTERS` import.

**Step 3: Verify visually**

Open `http://localhost:3001/tools/image-editor`, load an image, check:
- Category tabs render and filter the grid
- Clicking a filter applies it
- Clicking the active filter again removes it (back to Natural)
- Intensity slider appears when a filter is active
- Adjusting intensity scales the filter effect

**Step 4: Commit**

```bash
git add tools/image-editor/adjustments-panel.tsx tools/image-editor/filter-presets.ts app/tools/image-editor/page.tsx
git commit -m "feat(image-editor): filter gallery with 20 presets, category tabs, and intensity slider"
```

---

## Task 4: Generate Live Filter Thumbnail Previews

**Files:**
- Modify: `tools/image-editor/use-fabric-canvas.ts` (add `generateFilterThumbnails` to API)
- Modify: `app/tools/image-editor/page.tsx` (call thumbnail generation on image load)

**Step 1: Add thumbnail generation to `use-fabric-canvas.ts`**

Add to `FabricCanvasAPI`:
```ts
generateFilterThumbnails: () => Promise<Record<string, string>>
```

Implement after `applyFilterPreset`:

```ts
const generateFilterThumbnails = useCallback(async (): Promise<Record<string, string>> => {
  const bgImg = bgImageRef.current
  const fabric = fabricModuleRef.current
  if (!bgImg || !fabric) return {}

  const { FILTER_PRESETS } = await import('./filter-presets')
  const filtersNS = fabric.filters ?? fabric
  const thumbnails: Record<string, string> = {}

  // Create a 64x64 off-screen canvas with the background image
  const srcElement = bgImg.getElement() as HTMLImageElement
  const thumbSize = 64
  const offscreen = document.createElement('canvas')
  offscreen.width = thumbSize
  offscreen.height = thumbSize
  const ctx = offscreen.getContext('2d')!

  // Draw base thumbnail once
  const scale = Math.min(thumbSize / srcElement.naturalWidth, thumbSize / srcElement.naturalHeight)
  const w = srcElement.naturalWidth * scale
  const h = srcElement.naturalHeight * scale
  const x = (thumbSize - w) / 2
  const y = (thumbSize - h) / 2

  // Natural thumbnail
  ctx.clearRect(0, 0, thumbSize, thumbSize)
  ctx.drawImage(srcElement, x, y, w, h)
  thumbnails['natural'] = offscreen.toDataURL('image/jpeg', 0.6)

  // For each preset, create a temp FabricImage, apply filters, render to offscreen
  for (const preset of FILTER_PRESETS) {
    if (preset.id === 'natural') continue

    // Use requestIdleCallback or setTimeout to avoid blocking
    await new Promise(resolve => setTimeout(resolve, 0))

    const tempImg = new fabric.FabricImage(srcElement, {
      scaleX: scale,
      scaleY: scale,
    })

    const presetFilters: any[] = []
    for (const f of preset.filters) {
      const FilterClass = (filtersNS as any)[f.type]
      if (!FilterClass) continue
      if (Object.keys(f.params).length === 0) {
        presetFilters.push(new FilterClass())
      } else {
        presetFilters.push(new FilterClass(f.params))
      }
    }
    tempImg.filters = presetFilters
    tempImg.applyFilters()

    ctx.clearRect(0, 0, thumbSize, thumbSize)
    const el = tempImg.toCanvasElement()
    const sw = Math.min(thumbSize, el.width)
    const sh = Math.min(thumbSize, el.height)
    const sx = (thumbSize - sw) / 2
    const sy = (thumbSize - sh) / 2
    ctx.drawImage(el, sx, sy, sw, sh)
    thumbnails[preset.id] = offscreen.toDataURL('image/jpeg', 0.6)
  }

  return thumbnails
}, [])
```

**Step 2: Call from page.tsx on image load**

Add state: `const [filterThumbnails, setFilterThumbnails] = useState<Record<string, string>>({})`

After `fabric.loadImage(file)`, trigger thumbnail generation:
```ts
// In the handleImageLoad or as an effect when fabric.imageSize changes
useEffect(() => {
  if (fabric.imageSize && fabric.isReady) {
    fabric.generateFilterThumbnails().then(setFilterThumbnails)
  }
}, [fabric.imageSize, fabric.isReady])
```

Pass `filterThumbnails` to `AdjustmentsPanel`.

**Step 3: Verify thumbnails generate**

Open image editor, load an image, check that the filter gallery shows real image thumbnails within ~2 seconds.

**Step 4: Commit**

```bash
git add tools/image-editor/use-fabric-canvas.ts app/tools/image-editor/page.tsx
git commit -m "feat(image-editor): live filter thumbnail previews on image load"
```

---

## Task 5: Layer Sync — Derive Layers from Canvas Objects

**Files:**
- Modify: `tools/image-editor/use-fabric-canvas.ts` (add layer tracking to API)

**Step 1: Define Layer type and add to API**

Add a `Layer` interface to `use-fabric-canvas.ts` (or a new `types.ts` — keep it in the hook for now):

```ts
export interface Layer {
  id: string
  name: string
  type: 'image' | 'text' | 'drawing' | 'shape'
  visible: boolean
  locked: boolean
  opacity: number       // 0-100
  blendMode: string     // globalCompositeOperation value
}
```

Add to `FabricCanvasAPI`:
```ts
layers: Layer[]
activeLayerId: string | null
setActiveLayer: (id: string | null) => void
addImageLayer: (file: File) => void
deleteLayer: (id: string) => void
toggleLayerVisibility: (id: string) => void
toggleLayerLock: (id: string) => void
renameLayer: (id: string, name: string) => void
setLayerOpacity: (id: string, opacity: number) => void
setLayerBlendMode: (id: string, mode: string) => void
reorderLayer: (id: string, newIndex: number) => void
moveLayerForward: (id: string) => void
moveLayerBackward: (id: string) => void
moveLayerToFront: (id: string) => void
moveLayerToBack: (id: string) => void
```

**Step 2: Implement `syncLayersFromCanvas`**

```ts
const syncLayersFromCanvas = useCallback(() => {
  const canvas = fabricRef.current
  if (!canvas) return

  const objects = canvas.getObjects()
  const layerList: Layer[] = objects
    .filter((obj: any) => !obj.__isCropRect)
    .reverse()  // top object = first in list
    .map((obj: any) => ({
      id: obj.__layerId || '',
      name: obj.__layerName || autoName(obj),
      type: detectType(obj),
      visible: obj.visible !== false,
      locked: !obj.selectable,
      opacity: Math.round((obj.opacity ?? 1) * 100),
      blendMode: obj.globalCompositeOperation || 'source-over',
    }))

  setLayers(layerList)
}, [])

function autoName(obj: any): string {
  if (obj.__isBgImage) return 'Background'
  if (obj.type === 'i-text' || obj.type === 'textbox') return `Text "${(obj.text || '').slice(0, 15)}"`
  if (obj.type === 'path') return `Drawing ${obj.__layerId?.slice(-4) || ''}`
  if (obj.type === 'image') return obj.__layerName || 'Image Layer'
  return `Layer ${obj.__layerId?.slice(-4) || ''}`
}

function detectType(obj: any): Layer['type'] {
  if (obj.type === 'image') return 'image'
  if (obj.type === 'i-text' || obj.type === 'textbox') return 'text'
  if (obj.type === 'path' || obj.type === 'group') return 'drawing'
  return 'shape'
}
```

**Step 3: Assign `__layerId` to all objects**

In the canvas init effect, when the canvas is created, add event listeners:
```ts
canvas.on('object:added', (e: any) => {
  const obj = e.target
  if (obj && !obj.__layerId) {
    obj.__layerId = crypto.randomUUID().slice(0, 8)
  }
  if (obj && !obj.__layerName) {
    obj.__layerName = autoName(obj)
  }
  syncLayersFromCanvas()
})
canvas.on('object:removed', () => syncLayersFromCanvas())
canvas.on('object:modified', () => syncLayersFromCanvas())
```

Also tag the background image in `loadImage`:
```ts
fabricImg.__layerId = 'bg'
fabricImg.__layerName = 'Background'
```

Update history serialization to include new properties:
```ts
const json = JSON.stringify(canvas.toJSON(['__isBgImage', '__isCropRect', '__layerId', '__layerName']))
```

**Step 4: Implement layer operations**

```ts
const addImageLayer = useCallback((file: File) => {
  const canvas = fabricRef.current
  const fabric = fabricModuleRef.current
  if (!canvas || !fabric) return

  const reader = new FileReader()
  reader.onload = async () => {
    const img = await fabric.FabricImage.fromURL(reader.result as string)
    const canvasW = canvas.getWidth()
    const canvasH = canvas.getHeight()
    const scale = Math.min(canvasW / img.width!, canvasH / img.height!, 0.5)
    img.set({ scaleX: scale, scaleY: scale, left: canvasW / 4, top: canvasH / 4 })
    img.__layerId = crypto.randomUUID().slice(0, 8)
    img.__layerName = file.name.replace(/\.[^.]+$/, '')
    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.renderAll()
    saveHistory()
  }
  reader.readAsDataURL(file)
}, [])

const deleteLayer = useCallback((id: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  if (id === 'bg') return  // cannot delete background

  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    canvas.remove(obj)
    canvas.renderAll()
    saveHistory()
  }
}, [])

const toggleLayerVisibility = useCallback((id: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    obj.visible = !obj.visible
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const toggleLayerLock = useCallback((id: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    const locked = obj.selectable
    obj.selectable = !locked
    obj.evented = !locked
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const renameLayer = useCallback((id: string, name: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id) as any
  if (obj) {
    obj.__layerName = name
    syncLayersFromCanvas()
  }
}, [])

const setLayerOpacity = useCallback((id: string, opacity: number) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    obj.opacity = opacity / 100
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const setLayerBlendMode = useCallback((id: string, mode: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    obj.globalCompositeOperation = mode
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const reorderLayer = useCallback((id: string, newIndex: number) => {
  const canvas = fabricRef.current
  if (!canvas) return
  if (id === 'bg') return  // background stays at bottom

  const objects = canvas.getObjects().filter((o: any) => !o.__isCropRect)
  const obj = objects.find((o: any) => o.__layerId === id)
  if (obj) {
    // newIndex is in panel order (reversed), convert to canvas index
    const canvasIndex = objects.length - 1 - newIndex
    canvas.moveTo(obj, Math.max(0, canvasIndex))
    canvas.renderAll()
    syncLayersFromCanvas()
    saveHistory()
  }
}, [])

const moveLayerForward = useCallback((id: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    canvas.bringObjectForward(obj)
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const moveLayerBackward = useCallback((id: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    canvas.sendObjectBackwards(obj)
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const moveLayerToFront = useCallback((id: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    canvas.bringObjectToFront(obj)
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const moveLayerToBack = useCallback((id: string) => {
  const canvas = fabricRef.current
  if (!canvas) return
  if (id === 'bg') return
  const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
  if (obj) {
    // Move to index 1 (above background at 0)
    canvas.moveTo(obj, 1)
    canvas.renderAll()
    syncLayersFromCanvas()
  }
}, [])

const setActiveLayer = useCallback((id: string | null) => {
  const canvas = fabricRef.current
  if (!canvas) return
  if (!id) {
    canvas.discardActiveObject()
  } else {
    const obj = canvas.getObjects().find((o: any) => o.__layerId === id)
    if (obj && obj.selectable) {
      canvas.setActiveObject(obj)
    }
  }
  canvas.renderAll()
  setActiveLayerIdState(id)
}, [])
```

**Step 5: Sync canvas selection → activeLayerId**

In the init effect:
```ts
canvas.on('selection:created', (e: any) => {
  const obj = e.selected?.[0]
  if (obj?.__layerId) setActiveLayerIdState(obj.__layerId)
})
canvas.on('selection:updated', (e: any) => {
  const obj = e.selected?.[0]
  if (obj?.__layerId) setActiveLayerIdState(obj.__layerId)
})
canvas.on('selection:cleared', () => {
  setActiveLayerIdState(null)
})
```

**Step 6: Verify**

Load image, add text with text tool, add drawing with brush — check that `layers` state reflects all objects.

**Step 7: Commit**

```bash
git add tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): layer sync engine with full CRUD operations"
```

---

## Task 6: Build Layers Panel Component

**Files:**
- Create: `tools/image-editor/layers-panel.tsx`
- Modify: `app/tools/image-editor/page.tsx` (replace inline layers with new component)

**Step 1: Create `layers-panel.tsx`**

```tsx
// tools/image-editor/layers-panel.tsx
'use client'

import { useState, useRef } from 'react'
import type { Layer } from './use-fabric-canvas'

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
]

interface LayersPanelProps {
  layers: Layer[]
  activeLayerId: string | null
  onSelectLayer: (id: string) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onOpacityChange: (id: string, opacity: number) => void
  onBlendModeChange: (id: string, mode: string) => void
  onReorder: (id: string, newIndex: number) => void
  onAddImage: () => void
}

export function LayersPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDelete,
  onOpacityChange,
  onBlendModeChange,
  onReorder,
  onAddImage,
}: LayersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemId = useRef<string | null>(null)

  const activeLayer = layers.find(l => l.id === activeLayerId)

  const handleDoubleClick = (layer: Layer) => {
    if (layer.id === 'bg') return
    setEditingId(layer.id)
    setEditName(layer.name)
  }

  const handleRenameSubmit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim())
    }
    setEditingId(null)
  }

  // Drag-and-drop reorder
  const handleDragStart = (id: string) => {
    dragItemId.current = id
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    if (dragItemId.current && dragItemId.current !== 'bg') {
      onReorder(dragItemId.current, index)
    }
    dragItemId.current = null
    setDragOverIndex(null)
  }

  return (
    <div className="flex flex-col border-t border-slate-700">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Layers</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddImage}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Add image layer"
            aria-label="Add image layer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => activeLayerId && activeLayerId !== 'bg' && onDelete(activeLayerId)}
            disabled={!activeLayerId || activeLayerId === 'bg'}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete selected layer"
            aria-label="Delete selected layer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Blend mode + Opacity — for active layer */}
      {activeLayer && (
        <div className="px-3 pb-2 space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-500 w-10 shrink-0">Blend</label>
            <select
              value={activeLayer.blendMode}
              onChange={(e) => onBlendModeChange(activeLayer.id, e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-[10px] text-slate-300 cursor-pointer"
              aria-label="Blend mode"
            >
              {BLEND_MODES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-slate-500 w-10 shrink-0">Opacity</label>
            <input
              type="range"
              min={0}
              max={100}
              value={activeLayer.opacity}
              onChange={(e) => onOpacityChange(activeLayer.id, Number(e.target.value))}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--ht-color-primary-500)]"
              aria-label="Layer opacity"
            />
            <span className="text-[10px] text-slate-400 w-7 text-right">{activeLayer.opacity}%</span>
          </div>
        </div>
      )}

      {/* Layer list */}
      <div className="max-h-48 overflow-y-auto px-1 pb-2 space-y-0.5">
        {layers.length === 0 ? (
          <p className="text-[11px] text-slate-600 px-3 py-2">Upload an image to start</p>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              draggable={layer.id !== 'bg'}
              onDragStart={() => handleDragStart(layer.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDragOverIndex(null)}
              onDrop={() => handleDrop(index)}
              onClick={() => onSelectLayer(layer.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors group ${
                activeLayerId === layer.id
                  ? 'bg-[var(--ht-color-primary-500)]/20 border border-[var(--ht-color-primary-500)]/30'
                  : 'hover:bg-slate-800 border border-transparent'
              } ${dragOverIndex === index ? 'border-t-2 border-t-[var(--ht-color-primary-500)]' : ''}`}
            >
              {/* Drag handle */}
              {layer.id !== 'bg' && (
                <span className="text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>
                </span>
              )}
              {layer.id === 'bg' && <span className="w-3" />}

              {/* Visibility */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id) }}
                className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                title={layer.visible ? 'Hide layer' : 'Show layer'}
                aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
              >
                {layer.visible ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                )}
              </button>

              {/* Lock */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id) }}
                className={`transition-colors p-0.5 cursor-pointer ${layer.locked ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
                title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                aria-label={layer.locked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
              >
                {layer.locked ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                )}
              </button>

              {/* Name */}
              {editingId === layer.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-[11px] text-white outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 text-[11px] font-medium truncate text-slate-300"
                  onDoubleClick={() => handleDoubleClick(layer)}
                >
                  {layer.name}
                </span>
              )}

              {/* Type indicator */}
              <span className="text-[8px] text-slate-600 uppercase">{layer.type}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 2: Replace inline layers in page.tsx**

Remove the inline layers section (lines 457-505 in page.tsx) and replace with:

```tsx
import { LayersPanel } from '@/tools/image-editor/layers-panel'

// In the right panel, replace the inline layers section:
<LayersPanel
  layers={fabric.layers}
  activeLayerId={fabric.activeLayerId}
  onSelectLayer={fabric.setActiveLayer}
  onToggleVisibility={fabric.toggleLayerVisibility}
  onToggleLock={fabric.toggleLayerLock}
  onRename={fabric.renameLayer}
  onDelete={fabric.deleteLayer}
  onOpacityChange={fabric.setLayerOpacity}
  onBlendModeChange={fabric.setLayerBlendMode}
  onReorder={fabric.reorderLayer}
  onAddImage={() => layerFileInputRef.current?.click()}
/>
```

Add a hidden file input for layer image uploads:
```tsx
const layerFileInputRef = useRef<HTMLInputElement>(null)

<input
  ref={layerFileInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) fabric.addImageLayer(file)
    e.target.value = ''
  }}
/>
```

Remove old `layers`, `activeLayerId`, `toggleLayerVisibility` state and functions from page.tsx since they now live in the hook.

**Step 3: Verify visually**

- Load image → Background layer appears with lock icon
- Add text → Text layer auto-appears
- Draw with brush → Drawing layer auto-appears
- Click [+] → File picker opens, selected image becomes new layer
- Toggle eye icon → Layer hides/shows on canvas
- Toggle lock → Layer becomes unselectable
- Drag layer row → Z-order changes on canvas
- Double-click name → Inline rename
- Delete non-background layer → Removed from canvas
- Adjust opacity slider → Layer transparency changes
- Change blend mode dropdown → Compositing changes

**Step 4: Commit**

```bash
git add tools/image-editor/layers-panel.tsx app/tools/image-editor/page.tsx tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): full layers panel with opacity, blend modes, reorder, rename"
```

---

## Task 7: Layer Keyboard Shortcuts

**Files:**
- Modify: `app/tools/image-editor/page.tsx` (keyboard handler)

**Step 1: Add layer shortcuts to the existing keydown handler**

In the existing `handleKeyDown` function in `page.tsx`, add:

```ts
// Layer shortcuts
if ((e.ctrlKey || e.metaKey) && e.key === ']' && !e.shiftKey) {
  e.preventDefault()
  if (fabric.activeLayerId) fabric.moveLayerForward(fabric.activeLayerId)
  return
}
if ((e.ctrlKey || e.metaKey) && e.key === '[' && !e.shiftKey) {
  e.preventDefault()
  if (fabric.activeLayerId) fabric.moveLayerBackward(fabric.activeLayerId)
  return
}
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === ']') {
  e.preventDefault()
  if (fabric.activeLayerId) fabric.moveLayerToFront(fabric.activeLayerId)
  return
}
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '[') {
  e.preventDefault()
  if (fabric.activeLayerId) fabric.moveLayerToBack(fabric.activeLayerId)
  return
}
```

**Step 2: Verify shortcuts work**

Load image, add 2+ layers, select a layer, press Ctrl+] to move forward, Ctrl+[ to move backward.

**Step 3: Commit**

```bash
git add app/tools/image-editor/page.tsx
git commit -m "feat(image-editor): keyboard shortcuts for layer reordering"
```

---

## Task 8: Mobile Responsive Layers & Filters

**Files:**
- Modify: `app/tools/image-editor/page.tsx` (mobile overlay)

**Step 1: Add mobile layers panel to the existing mobile overlay**

The current mobile overlay only shows `AdjustmentsPanel`. Add tab switching between Adjustments and Layers:

```tsx
{/* Mobile right panel overlay */}
{showMobileAdjustments && (
  <div className="fixed right-0 top-0 bottom-0 w-72 bg-[#1a2333] z-40 lg:hidden shadow-2xl flex flex-col">
    {/* Tab bar */}
    <div className="flex border-b border-slate-700">
      <button
        onClick={() => setMobileTab('adjustments')}
        className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
          mobileTab === 'adjustments' ? 'text-white border-b-2 border-[var(--ht-color-primary-500)]' : 'text-slate-400'
        }`}
      >
        Adjustments
      </button>
      <button
        onClick={() => setMobileTab('layers')}
        className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
          mobileTab === 'layers' ? 'text-white border-b-2 border-[var(--ht-color-primary-500)]' : 'text-slate-400'
        }`}
      >
        Layers
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto">
      {mobileTab === 'adjustments' ? (
        <AdjustmentsPanel ... />
      ) : (
        <LayersPanel ... />
      )}
    </div>

    {/* Close button */}
    <button onClick={() => setShowMobileAdjustments(false)} ...>Close</button>
  </div>
)}
```

Add state: `const [mobileTab, setMobileTab] = useState<'adjustments' | 'layers'>('adjustments')`

**Step 2: Verify on mobile viewport**

Resize browser to < 1024px, tap panel toggle, switch between Adjustments and Layers tabs.

**Step 3: Commit**

```bash
git add app/tools/image-editor/page.tsx
git commit -m "feat(image-editor): mobile responsive layers panel with tab switching"
```

---

## Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Filter presets config (20 presets) | `filter-presets.ts` (new) |
| 2 | Refactor `applyFilterPreset` for config + intensity | `use-fabric-canvas.ts`, `adjustments-panel.tsx`, `page.tsx` |
| 3 | Filter gallery UI (categories, thumbnails, intensity) | `adjustments-panel.tsx`, `page.tsx` |
| 4 | Live filter thumbnail previews | `use-fabric-canvas.ts`, `page.tsx` |
| 5 | Layer sync engine (derive layers from canvas) | `use-fabric-canvas.ts` |
| 6 | Layers panel component | `layers-panel.tsx` (new), `page.tsx` |
| 7 | Layer keyboard shortcuts | `page.tsx` |
| 8 | Mobile responsive layers & filters | `page.tsx` |
