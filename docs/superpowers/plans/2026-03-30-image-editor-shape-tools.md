# Image Editor Shape Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 9 shape tools (Rectangle, Ellipse, Line, Arrow, Polygon, Star, Rounded Rectangle, Triangle, Custom Polygon) with full styling, click-drag with Shift/Alt modifiers, a properties bar, gradient picker, and custom polygon vertex editing.

**Architecture:** Extend the existing Fabric.js-based image editor with a new `shape` tool type. Shape drawing logic lives in a dedicated `shape-tools.ts` module that the `use-fabric-canvas` hook calls. A `PropertiesBar` component renders below the header when shapes are active. The toolbar gets a shape flyout for sub-tool selection.

**Tech Stack:** Fabric.js 7.1, React 19, Tailwind CSS v4, TypeScript

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `tools/image-editor/shape-tools.ts` | Shape types, vertex math (star, arrow), drawing handlers, vertex editing |
| Create | `tools/image-editor/shape-flyout.tsx` | 3x3 shape selector popup |
| Create | `tools/image-editor/properties-bar.tsx` | Horizontal properties bar (dims, fill, stroke, shadow, etc.) |
| Create | `tools/image-editor/gradient-picker.tsx` | Gradient fill popover (linear/radial) |
| Modify | `tools/image-editor/editor-toolbar.tsx` | Add shape tool button + flyout trigger |
| Modify | `tools/image-editor/use-fabric-canvas.ts` | Shape drawing mode, expose shape-related methods |
| Modify | `app/tools/image-editor/page.tsx` | Wire activeShape state, properties bar, keyboard shortcuts |

---

### Task 1: Shape Types & Vertex Math

**Files:**
- Create: `tools/image-editor/shape-tools.ts`

- [ ] **Step 1: Create shape-tools.ts with types and vertex math**

```typescript
// tools/image-editor/shape-tools.ts

export const SHAPE_TYPES = [
  'rectangle',
  'ellipse',
  'line',
  'arrow',
  'polygon',
  'star',
  'rounded-rectangle',
  'triangle',
  'custom-polygon',
] as const

export type ShapeType = (typeof SHAPE_TYPES)[number]

export const SHAPE_LABELS: Record<ShapeType, string> = {
  'rectangle': 'Rectangle',
  'ellipse': 'Ellipse',
  'line': 'Line',
  'arrow': 'Arrow',
  'polygon': 'Polygon',
  'star': 'Star',
  'rounded-rectangle': 'Rounded Rectangle',
  'triangle': 'Triangle',
  'custom-polygon': 'Custom Polygon',
}

export const SHAPE_SHORTCUTS: Record<string, string> = {
  'rectangle': 'U',
  'ellipse': 'Shift+U cycles',
}

export interface ShapeStyle {
  fill: string
  fillType: 'solid' | 'gradient' | 'none'
  gradientType: 'linear' | 'radial'
  gradientAngle: number
  gradientColorStart: string
  gradientColorEnd: string
  stroke: string
  strokeWidth: number
  strokeDashArray: number[]
  cornerRadius: number
  opacity: number
  blendMode: string
  shadowEnabled: boolean
  shadowColor: string
  shadowOffsetX: number
  shadowOffsetY: number
  shadowBlur: number
}

export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: '#3D6AF2',
  fillType: 'solid',
  gradientType: 'linear',
  gradientAngle: 0,
  gradientColorStart: '#3D6AF2',
  gradientColorEnd: '#32A9D9',
  stroke: '#ffffff',
  strokeWidth: 0,
  strokeDashArray: [],
  cornerRadius: 0,
  opacity: 100,
  blendMode: 'source-over',
  shadowEnabled: false,
  shadowColor: 'rgba(0,0,0,0.5)',
  shadowOffsetX: 4,
  shadowOffsetY: 4,
  shadowBlur: 8,
}

/** Generate star vertices given n points, outer radius, and inner radius */
export function generateStarPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = []
  const step = Math.PI / points
  const startAngle = -Math.PI / 2

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = startAngle + i * step
    result.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    })
  }
  return result
}

/** Generate regular polygon vertices */
export function generatePolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = []
  const startAngle = -Math.PI / 2

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / sides
    result.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    })
  }
  return result
}

/** Calculate arrowhead triangle points for a line from (x1,y1) to (x2,y2) */
export function generateArrowheadPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  headLength: number,
): { x: number; y: number }[] {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const spreadAngle = Math.PI / 6 // 30 degrees

  return [
    { x: x2, y: y2 },
    {
      x: x2 - headLength * Math.cos(angle - spreadAngle),
      y: y2 - headLength * Math.sin(angle - spreadAngle),
    },
    {
      x: x2 - headLength * Math.cos(angle + spreadAngle),
      y: y2 - headLength * Math.sin(angle + spreadAngle),
    },
  ]
}

/** Constrain dimensions to equal aspect ratio (for Shift modifier) */
export function constrainProportions(
  width: number,
  height: number,
): { width: number; height: number } {
  const size = Math.max(Math.abs(width), Math.abs(height))
  return {
    width: Math.sign(width) * size,
    height: Math.sign(height) * size,
  }
}

/** Snap line angle to 0/45/90 increments (for Shift modifier on lines) */
export function snapAngle(x1: number, y1: number, x2: number, y2: number): { x: number; y: number } {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  return {
    x: x1 + dist * Math.cos(snapped),
    y: y1 + dist * Math.sin(snapped),
  }
}

/** Stroke dash array presets */
export const DASH_PATTERNS: Record<string, number[]> = {
  solid: [],
  dashed: [12, 6],
  dotted: [3, 3],
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/image-editor/shape-tools.ts
git commit -m "feat(image-editor): add shape types, vertex math, and style defaults"
```

---

### Task 2: Shape Flyout Component

**Files:**
- Create: `tools/image-editor/shape-flyout.tsx`

- [ ] **Step 1: Create shape-flyout.tsx**

```tsx
// tools/image-editor/shape-flyout.tsx
'use client'

import { useRef, useEffect } from 'react'
import { SHAPE_TYPES, SHAPE_LABELS, type ShapeType } from './shape-tools'

interface ShapeFlyoutProps {
  activeShape: ShapeType
  onSelect: (shape: ShapeType) => void
  onClose: () => void
}

const SHAPE_ICONS: Record<ShapeType, React.ReactNode> = {
  'rectangle': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="0" strokeWidth={2} />
    </svg>
  ),
  'ellipse': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" rx="9" ry="7" strokeWidth={2} />
    </svg>
  ),
  'line': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="4" y1="20" x2="20" y2="4" strokeWidth={2} strokeLinecap="round" />
    </svg>
  ),
  'arrow': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="4" y1="20" x2="20" y2="4" strokeWidth={2} strokeLinecap="round" />
      <polyline points="14,4 20,4 20,10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'polygon': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12,2 22,9 19,20 5,20 2,9" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  ),
  'star': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ),
  'rounded-rectangle': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="4" strokeWidth={2} />
    </svg>
  ),
  'triangle': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12,4 22,20 2,20" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  ),
  'custom-polygon': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="6,3 18,5 20,15 10,21 2,13" strokeWidth={2} strokeLinejoin="round" />
      <circle cx="6" cy="3" r="1.5" fill="currentColor" />
      <circle cx="18" cy="5" r="1.5" fill="currentColor" />
      <circle cx="20" cy="15" r="1.5" fill="currentColor" />
      <circle cx="10" cy="21" r="1.5" fill="currentColor" />
      <circle cx="2" cy="13" r="1.5" fill="currentColor" />
    </svg>
  ),
}

export { SHAPE_ICONS }

export function ShapeFlyout({ activeShape, onSelect, onClose }: ShapeFlyoutProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-full top-0 ml-2 bg-[#1a2333] border border-slate-700 rounded-xl p-2 shadow-xl z-50"
    >
      <div className="grid grid-cols-3 gap-1">
        {SHAPE_TYPES.map((shape) => (
          <button
            key={shape}
            onClick={() => { onSelect(shape); onClose() }}
            title={SHAPE_LABELS[shape]}
            aria-label={SHAPE_LABELS[shape]}
            className={`p-2 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              activeShape === shape
                ? 'bg-[var(--tk-color-primary-500)] text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {SHAPE_ICONS[shape]}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/image-editor/shape-flyout.tsx
git commit -m "feat(image-editor): add shape selector flyout component"
```

---

### Task 3: Gradient Picker Component

**Files:**
- Create: `tools/image-editor/gradient-picker.tsx`

- [ ] **Step 1: Create gradient-picker.tsx**

```tsx
// tools/image-editor/gradient-picker.tsx
'use client'

interface GradientPickerProps {
  type: 'linear' | 'radial'
  angle: number
  colorStart: string
  colorEnd: string
  onTypeChange: (type: 'linear' | 'radial') => void
  onAngleChange: (angle: number) => void
  onColorStartChange: (color: string) => void
  onColorEndChange: (color: string) => void
}

export function GradientPicker({
  type,
  angle,
  colorStart,
  colorEnd,
  onTypeChange,
  onAngleChange,
  onColorStartChange,
  onColorEndChange,
}: GradientPickerProps) {
  return (
    <div className="p-3 space-y-3 w-56">
      {/* Type toggle */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
        <button
          onClick={() => onTypeChange('linear')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            type === 'linear' ? 'bg-[var(--tk-color-primary-500)] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Linear
        </button>
        <button
          onClick={() => onTypeChange('radial')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            type === 'radial' ? 'bg-[var(--tk-color-primary-500)] text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Radial
        </button>
      </div>

      {/* Preview */}
      <div
        className="w-full h-8 rounded-lg border border-slate-700"
        style={{
          background: type === 'linear'
            ? `linear-gradient(${angle}deg, ${colorStart}, ${colorEnd})`
            : `radial-gradient(circle, ${colorStart}, ${colorEnd})`,
        }}
      />

      {/* Angle (linear only) */}
      {type === 'linear' && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 w-10">Angle</label>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => onAngleChange(Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--tk-color-primary-500)]"
          />
          <input
            type="number"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => onAngleChange(Number(e.target.value))}
            className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-white text-center"
          />
        </div>
      )}

      {/* Color stops */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400 w-10">Start</label>
        <label className="flex-1 h-7 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: colorStart }}>
          <input type="color" value={colorStart} onChange={(e) => onColorStartChange(e.target.value)} className="sr-only" />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-400 w-10">End</label>
        <label className="flex-1 h-7 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: colorEnd }}>
          <input type="color" value={colorEnd} onChange={(e) => onColorEndChange(e.target.value)} className="sr-only" />
        </label>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/image-editor/gradient-picker.tsx
git commit -m "feat(image-editor): add gradient picker component"
```

---

### Task 4: Properties Bar Component

**Files:**
- Create: `tools/image-editor/properties-bar.tsx`

- [ ] **Step 1: Create properties-bar.tsx**

```tsx
// tools/image-editor/properties-bar.tsx
'use client'

import { useState } from 'react'
import { type ShapeType, type ShapeStyle, SHAPE_LABELS, DASH_PATTERNS } from './shape-tools'
import { GradientPicker } from './gradient-picker'

interface ShapeProperties {
  x: number
  y: number
  width: number
  height: number
  angle: number
  scaleX: number
  scaleY: number
  /** For star/polygon — number of points/sides */
  pointCount?: number
}

interface PropertiesBarProps {
  shapeType: ShapeType
  style: ShapeStyle
  properties: ShapeProperties | null
  onStyleChange: (updates: Partial<ShapeStyle>) => void
  onPropertiesChange: (updates: Partial<ShapeProperties>) => void
  onShapeTypeChange: (type: ShapeType) => void
}

const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
]

export function PropertiesBar({
  shapeType,
  style,
  properties,
  onStyleChange,
  onPropertiesChange,
  onShapeTypeChange,
}: PropertiesBarProps) {
  const [showFillPopover, setShowFillPopover] = useState(false)
  const [showShadowPopover, setShowShadowPopover] = useState(false)

  const showCornerRadius = shapeType === 'rectangle' || shapeType === 'rounded-rectangle'
  const showPointCount = shapeType === 'star' || shapeType === 'polygon'

  return (
    <div className="h-10 border-b border-slate-700 bg-[#101622] flex items-center gap-3 px-3 overflow-x-auto text-xs shrink-0">
      {/* Shape type dropdown */}
      <select
        value={shapeType}
        onChange={(e) => onShapeTypeChange(e.target.value as ShapeType)}
        className="bg-slate-800 border border-slate-700 text-white rounded px-1.5 py-1 text-xs cursor-pointer"
      >
        {Object.entries(SHAPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <div className="w-px h-5 bg-slate-700" />

      {/* Dimensions */}
      {properties && (
        <>
          <label className="text-slate-500">W</label>
          <input
            type="number"
            value={Math.round(properties.width * properties.scaleX)}
            onChange={(e) => onPropertiesChange({ width: Number(e.target.value) / properties.scaleX })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
          <label className="text-slate-500">H</label>
          <input
            type="number"
            value={Math.round(properties.height * properties.scaleY)}
            onChange={(e) => onPropertiesChange({ height: Number(e.target.value) / properties.scaleY })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />

          <div className="w-px h-5 bg-slate-700" />

          {/* Position */}
          <label className="text-slate-500">X</label>
          <input
            type="number"
            value={Math.round(properties.x)}
            onChange={(e) => onPropertiesChange({ x: Number(e.target.value) })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
          <label className="text-slate-500">Y</label>
          <input
            type="number"
            value={Math.round(properties.y)}
            onChange={(e) => onPropertiesChange({ y: Number(e.target.value) })}
            className="w-14 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />

          <div className="w-px h-5 bg-slate-700" />

          {/* Rotation */}
          <label className="text-slate-500">R</label>
          <input
            type="number"
            min={0}
            max={360}
            value={Math.round(properties.angle)}
            onChange={(e) => onPropertiesChange({ angle: Number(e.target.value) })}
            className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
          <span className="text-slate-500">°</span>
        </>
      )}

      <div className="w-px h-5 bg-slate-700" />

      {/* Fill */}
      <div className="relative flex items-center gap-1">
        <label className="text-slate-500">Fill</label>
        <button
          onClick={() => setShowFillPopover(!showFillPopover)}
          className="w-6 h-6 rounded border border-slate-600 cursor-pointer"
          style={{
            backgroundColor: style.fillType === 'none' ? 'transparent' : style.fill,
            backgroundImage: style.fillType === 'none'
              ? 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 1px, transparent 4px)'
              : style.fillType === 'gradient'
                ? style.gradientType === 'linear'
                  ? `linear-gradient(${style.gradientAngle}deg, ${style.gradientColorStart}, ${style.gradientColorEnd})`
                  : `radial-gradient(circle, ${style.gradientColorStart}, ${style.gradientColorEnd})`
                : undefined,
          }}
          title="Fill color"
        />
        {showFillPopover && (
          <div className="absolute top-full left-0 mt-1 bg-[#1a2333] border border-slate-700 rounded-xl shadow-xl z-50 p-3 space-y-2">
            {/* Fill type selector */}
            <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
              {(['solid', 'gradient', 'none'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => onStyleChange({ fillType: ft })}
                  className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
                    style.fillType === ft ? 'bg-[var(--tk-color-primary-500)] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
            {style.fillType === 'solid' && (
              <div className="flex items-center gap-2">
                <label className="w-full h-8 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: style.fill }}>
                  <input type="color" value={style.fill} onChange={(e) => onStyleChange({ fill: e.target.value })} className="sr-only" />
                </label>
              </div>
            )}
            {style.fillType === 'gradient' && (
              <GradientPicker
                type={style.gradientType}
                angle={style.gradientAngle}
                colorStart={style.gradientColorStart}
                colorEnd={style.gradientColorEnd}
                onTypeChange={(gradientType) => onStyleChange({ gradientType })}
                onAngleChange={(gradientAngle) => onStyleChange({ gradientAngle })}
                onColorStartChange={(gradientColorStart) => onStyleChange({ gradientColorStart })}
                onColorEndChange={(gradientColorEnd) => onStyleChange({ gradientColorEnd })}
              />
            )}
            <button onClick={() => setShowFillPopover(false)} className="w-full text-center text-xs text-slate-500 hover:text-white py-1 cursor-pointer">
              Close
            </button>
          </div>
        )}
      </div>

      {/* Stroke */}
      <div className="flex items-center gap-1">
        <label className="text-slate-500">Stroke</label>
        <label className="w-6 h-6 rounded border border-slate-600 cursor-pointer" style={{ backgroundColor: style.stroke }}>
          <input type="color" value={style.stroke} onChange={(e) => onStyleChange({ stroke: e.target.value })} className="sr-only" />
        </label>
        <input
          type="number"
          min={0}
          max={50}
          value={style.strokeWidth}
          onChange={(e) => onStyleChange({ strokeWidth: Number(e.target.value) })}
          className="w-10 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          title="Stroke width"
        />
        <select
          value={JSON.stringify(style.strokeDashArray)}
          onChange={(e) => onStyleChange({ strokeDashArray: JSON.parse(e.target.value) })}
          className="bg-slate-800 border border-slate-700 text-white rounded px-1 py-0.5 text-xs cursor-pointer"
        >
          {Object.entries(DASH_PATTERNS).map(([name, pattern]) => (
            <option key={name} value={JSON.stringify(pattern)}>{name}</option>
          ))}
        </select>
      </div>

      {/* Corner radius */}
      {showCornerRadius && (
        <div className="flex items-center gap-1">
          <label className="text-slate-500">Radius</label>
          <input
            type="number"
            min={0}
            max={200}
            value={style.cornerRadius}
            onChange={(e) => onStyleChange({ cornerRadius: Number(e.target.value) })}
            className="w-10 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
        </div>
      )}

      {/* Point count */}
      {showPointCount && properties && (
        <div className="flex items-center gap-1">
          <label className="text-slate-500">{shapeType === 'star' ? 'Points' : 'Sides'}</label>
          <input
            type="number"
            min={3}
            max={24}
            value={properties.pointCount ?? (shapeType === 'star' ? 5 : 6)}
            onChange={(e) => onPropertiesChange({ pointCount: Number(e.target.value) })}
            className="w-10 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs"
          />
        </div>
      )}

      <div className="w-px h-5 bg-slate-700" />

      {/* Opacity */}
      <div className="flex items-center gap-1">
        <label className="text-slate-500">Opacity</label>
        <input
          type="range"
          min={0}
          max={100}
          value={style.opacity}
          onChange={(e) => onStyleChange({ opacity: Number(e.target.value) })}
          className="w-16 h-1 accent-[var(--tk-color-primary-500)]"
        />
        <span className="text-slate-400 w-7 text-right">{style.opacity}%</span>
      </div>

      {/* Blend mode */}
      <select
        value={style.blendMode}
        onChange={(e) => onStyleChange({ blendMode: e.target.value })}
        className="bg-slate-800 border border-slate-700 text-white rounded px-1 py-0.5 text-xs cursor-pointer"
      >
        {BLEND_MODES.map((bm) => (
          <option key={bm.value} value={bm.value}>{bm.label}</option>
        ))}
      </select>

      {/* Shadow */}
      <div className="relative flex items-center gap-1">
        <label className="flex items-center gap-1 cursor-pointer text-slate-500">
          <input
            type="checkbox"
            checked={style.shadowEnabled}
            onChange={(e) => onStyleChange({ shadowEnabled: e.target.checked })}
            className="rounded border-slate-600 w-3 h-3"
          />
          Shadow
        </label>
        {style.shadowEnabled && (
          <button
            onClick={() => setShowShadowPopover(!showShadowPopover)}
            className="text-xs text-slate-400 hover:text-white px-1 cursor-pointer"
          >
            ···
          </button>
        )}
        {showShadowPopover && style.shadowEnabled && (
          <div className="absolute top-full right-0 mt-1 bg-[#1a2333] border border-slate-700 rounded-xl shadow-xl z-50 p-3 space-y-2 w-48">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">Color</label>
              <label className="flex-1 h-6 rounded border border-slate-700 cursor-pointer" style={{ backgroundColor: style.shadowColor }}>
                <input type="color" value={style.shadowColor} onChange={(e) => onStyleChange({ shadowColor: e.target.value })} className="sr-only" />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">X</label>
              <input type="number" value={style.shadowOffsetX} onChange={(e) => onStyleChange({ shadowOffsetX: Number(e.target.value) })} className="flex-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">Y</label>
              <input type="number" value={style.shadowOffsetY} onChange={(e) => onStyleChange({ shadowOffsetY: Number(e.target.value) })} className="flex-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-10">Blur</label>
              <input type="number" min={0} value={style.shadowBlur} onChange={(e) => onStyleChange({ shadowBlur: Number(e.target.value) })} className="flex-1 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-white text-center text-xs" />
            </div>
            <button onClick={() => setShowShadowPopover(false)} className="w-full text-center text-xs text-slate-500 hover:text-white py-1 cursor-pointer">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/image-editor/properties-bar.tsx
git commit -m "feat(image-editor): add shape properties bar component"
```

---

### Task 5: Add Shape Tool to Toolbar

**Files:**
- Modify: `tools/image-editor/editor-toolbar.tsx`

- [ ] **Step 1: Update ToolType and add shape button with flyout**

Replace the entire file content:

```tsx
// tools/image-editor/editor-toolbar.tsx
'use client'

import { useState } from 'react'
import { ShapeFlyout, SHAPE_ICONS } from './shape-flyout'
import type { ShapeType } from './shape-tools'

export type ToolType = 'move' | 'hand' | 'crop' | 'brush' | 'eraser' | 'text' | 'shape'

interface EditorToolbarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  fgColor: string
  bgColor: string
  onSwapColors: () => void
  onFgColorChange: (color: string) => void
  onBgColorChange: (color: string) => void
  activeShape: ShapeType
  onShapeChange: (shape: ShapeType) => void
}

const TOOLS: { id: ToolType; label: string; icon: React.ReactNode }[] = [
  {
    id: 'move',
    label: 'Move Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    id: 'hand',
    label: 'Hand Tool (Pan)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v3c0 3.037 2.462 5.5 5.5 5.5h2.718a3 3 0 002.01-.77l4.244-3.811A1.5 1.5 0 1017.5 13H16m-6-1.5V3.5a1.5 1.5 0 113 0v6m0 0V3a1.5 1.5 0 113 0v8.5" />
      </svg>
    ),
  },
  {
    id: 'crop',
    label: 'Crop Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0h12M7 4L3 4m14 0v12m0 0H9m12 0h-4M7 20v-4" />
      </svg>
    ),
  },
  {
    id: 'brush',
    label: 'Brush Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'eraser',
    label: 'Eraser Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    id: 'text',
    label: 'Text Tool',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 6v14m4-14v14m4-14v14" />
      </svg>
    ),
  },
]

export function EditorToolbar({
  activeTool,
  onToolChange,
  fgColor,
  bgColor,
  onSwapColors,
  onFgColorChange,
  onBgColorChange,
  activeShape,
  onShapeChange,
}: EditorToolbarProps) {
  const [showFlyout, setShowFlyout] = useState(false)

  return (
    <aside className="w-14 border-r border-slate-700 dark:border-slate-700 bg-[#101622] flex flex-col items-center py-4 gap-3 shrink-0">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          aria-label={tool.label}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === tool.id
              ? 'bg-[var(--tk-color-primary-500)] text-white'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {tool.icon}
        </button>
      ))}

      {/* Shape tool with flyout */}
      <div className="relative">
        <button
          onClick={() => {
            onToolChange('shape')
            setShowFlyout((prev) => !prev)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            setShowFlyout(true)
          }}
          title={`Shape Tool (${activeShape})`}
          aria-label="Shape Tool"
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'shape'
              ? 'bg-[var(--tk-color-primary-500)] text-white'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          {SHAPE_ICONS[activeShape]}
          {/* Small triangle indicator */}
          <svg className="absolute bottom-1.5 right-1.5 w-2 h-2 text-slate-500" viewBox="0 0 8 8" fill="currentColor">
            <polygon points="0,0 8,8 8,0" />
          </svg>
        </button>
        {showFlyout && (
          <ShapeFlyout
            activeShape={activeShape}
            onSelect={(shape) => {
              onShapeChange(shape)
              onToolChange('shape')
            }}
            onClose={() => setShowFlyout(false)}
          />
        )}
      </div>

      {/* Foreground / background colors */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <div className="relative w-11 h-11">
          <label
            className="absolute top-0 left-0 w-6 h-6 rounded-sm border-2 border-slate-500 z-10 cursor-pointer"
            style={{ backgroundColor: fgColor }}
            title="Foreground color"
          >
            <input
              type="color"
              value={fgColor}
              onChange={(e) => onFgColorChange(e.target.value)}
              className="sr-only"
              aria-label="Foreground color"
            />
          </label>
          <label
            className="absolute bottom-0 right-0 w-6 h-6 rounded-sm border-2 border-slate-500 cursor-pointer"
            style={{ backgroundColor: bgColor }}
            title="Background color"
          >
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange(e.target.value)}
              className="sr-only"
              aria-label="Background color"
            />
          </label>
        </div>
        <button
          type="button"
          className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
          onClick={onSwapColors}
          title="Swap colors"
          aria-label="Swap foreground and background colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/image-editor/editor-toolbar.tsx
git commit -m "feat(image-editor): add shape tool to toolbar with flyout trigger"
```

---

### Task 6: Canvas Hook — Shape Drawing Mode

**Files:**
- Modify: `tools/image-editor/use-fabric-canvas.ts`

This is the core task. Add shape drawing handlers to the existing canvas hook. The hook already has a `setTool` function with a switch statement. We need to:
1. Import shape types
2. Add refs for shape drawing state
3. Add a `'shape'` case to `setTool`
4. Add shape creation handlers with Shift/Alt modifiers
5. Expose new methods for the properties bar and shape management

- [ ] **Step 1: Add shape imports and refs**

At the top of `use-fabric-canvas.ts`, add the import after existing imports:

```typescript
import type { ToolType } from './editor-toolbar'
import {
  type ShapeType,
  type ShapeStyle,
  DEFAULT_SHAPE_STYLE,
  generateStarPoints,
  generatePolygonPoints,
  generateArrowheadPoints,
  constrainProportions,
  snapAngle,
} from './shape-tools'
```

After the existing refs (around line 60-70), add:

```typescript
  // Shape drawing state
  const activeShapeRef = useRef<ShapeType>('rectangle')
  const shapeStyleRef = useRef<ShapeStyle>({ ...DEFAULT_SHAPE_STYLE })
  const drawingShapeRef = useRef<any>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const customPolyPointsRef = useRef<{ x: number; y: number }[]>([])
  const customPolyPreviewRef = useRef<any[]>([]) // temp fabric objects for preview
  const isDrawingShapeRef = useRef(false)
  const shapeCounterRef = useRef<Record<string, number>>({})
```

- [ ] **Step 2: Add shape tool case in setTool**

Inside the `setTool` callback's `switch` statement (after the `'text'` case), add:

```typescript
      case 'shape': {
        canvas.defaultCursor = 'crosshair'
        canvas.selection = false

        // Make existing shapes selectable for editing
        allObjects.forEach((obj: any) => {
          if (obj.__isShape && !obj.__isBgImage) {
            obj.selectable = true
            obj.evented = true
          }
        })

        const shapeMouseDown = (opt: any) => {
          if (activeShapeRef.current === 'custom-polygon') {
            handleCustomPolyClick(opt)
            return
          }
          const pointer = canvas.getViewportPoint(opt.e)
          drawStartRef.current = { x: pointer.x, y: pointer.y }
          isDrawingShapeRef.current = true

          const shape = createInitialShape(pointer.x, pointer.y, activeShapeRef.current)
          if (shape) {
            drawingShapeRef.current = shape
            canvas.add(shape)
            canvas.requestRenderAll()
          }
        }

        const shapeMouseMove = (opt: any) => {
          if (!isDrawingShapeRef.current || !drawingShapeRef.current || !drawStartRef.current) return
          const pointer = canvas.getViewportPoint(opt.e)
          const shiftKey = opt.e.shiftKey
          const altKey = opt.e.altKey

          updateShapeDuringDraw(
            drawingShapeRef.current,
            drawStartRef.current,
            pointer,
            activeShapeRef.current,
            shiftKey,
            altKey,
          )
          canvas.requestRenderAll()
        }

        const shapeMouseUp = () => {
          if (!isDrawingShapeRef.current || !drawingShapeRef.current) return
          isDrawingShapeRef.current = false

          const shape = drawingShapeRef.current
          // Assign layer metadata
          const shapeType = activeShapeRef.current
          const count = (shapeCounterRef.current[shapeType] ?? 0) + 1
          shapeCounterRef.current[shapeType] = count
          const label = SHAPE_LABELS[shapeType]

          shape.__layerId = crypto.randomUUID().slice(0, 8)
          shape.__layerName = `${label} ${count}`
          shape.__isShape = true
          shape.__shapeType = shapeType
          shape.selectable = true
          shape.evented = true

          drawingShapeRef.current = null
          drawStartRef.current = null

          syncLayers()
          pushHistory(`Add ${label}`)
        }

        canvas.on('mouse:down', shapeMouseDown)
        canvas.on('mouse:move', shapeMouseMove)
        canvas.on('mouse:up', shapeMouseUp)

        cleanupFnRef.current = () => {
          canvas.off('mouse:down', shapeMouseDown)
          canvas.off('mouse:move', shapeMouseMove)
          canvas.off('mouse:up', shapeMouseUp)
          // Clean up custom polygon preview objects
          customPolyPreviewRef.current.forEach((obj) => canvas.remove(obj))
          customPolyPreviewRef.current = []
          customPolyPointsRef.current = []
          isDrawingShapeRef.current = false
          drawingShapeRef.current = null
        }
        break
      }
```

Note: `cleanupFnRef` stores the cleanup function. If it doesn't exist, add a `const cleanupFnRef = useRef<(() => void) | null>(null)` ref and call it at the start of `setTool` before the switch:

```typescript
    // Clean up previous tool handlers
    if (cleanupFnRef.current) {
      cleanupFnRef.current()
      cleanupFnRef.current = null
    }
```

- [ ] **Step 3: Add createInitialShape helper**

Add this function inside the hook (before the `setTool` callback):

```typescript
  const createInitialShape = (x: number, y: number, shapeType: ShapeType) => {
    const fabric = fabricModuleRef.current
    if (!fabric) return null

    const style = shapeStyleRef.current
    const fillOptions = getFillOptions(style, 0, 0)
    const commonProps = {
      left: x,
      top: y,
      strokeWidth: style.strokeWidth,
      stroke: style.strokeWidth > 0 ? style.stroke : undefined,
      strokeDashArray: style.strokeDashArray.length > 0 ? [...style.strokeDashArray] : undefined,
      opacity: style.opacity / 100,
      globalCompositeOperation: style.blendMode,
      shadow: style.shadowEnabled
        ? new fabric.Shadow({
            color: style.shadowColor,
            offsetX: style.shadowOffsetX,
            offsetY: style.shadowOffsetY,
            blur: style.shadowBlur,
          })
        : undefined,
      selectable: false,
      evented: false,
      originX: 'left' as const,
      originY: 'top' as const,
    }

    switch (shapeType) {
      case 'rectangle':
        return new fabric.Rect({ ...commonProps, ...fillOptions, width: 0, height: 0 })
      case 'rounded-rectangle':
        return new fabric.Rect({ ...commonProps, ...fillOptions, width: 0, height: 0, rx: style.cornerRadius, ry: style.cornerRadius })
      case 'ellipse':
        return new fabric.Ellipse({ ...commonProps, ...fillOptions, rx: 0, ry: 0 })
      case 'triangle':
        return new fabric.Triangle({ ...commonProps, ...fillOptions, width: 0, height: 0 })
      case 'line':
        return new fabric.Line([x, y, x, y], { ...commonProps, stroke: style.stroke || '#ffffff' })
      case 'arrow':
        return new fabric.Line([x, y, x, y], { ...commonProps, stroke: style.stroke || '#ffffff', __isArrowLine: true })
      case 'polygon':
        return new fabric.Polygon(generatePolygonPoints(0, 0, 0, 6), { ...commonProps, ...fillOptions })
      case 'star':
        return new fabric.Polygon(generateStarPoints(0, 0, 0, 0, 5), { ...commonProps, ...fillOptions })
      default:
        return null
    }
  }

  const getFillOptions = (style: ShapeStyle, width: number, height: number) => {
    const fabric = fabricModuleRef.current
    if (!fabric || style.fillType === 'none') return { fill: 'transparent' }
    if (style.fillType === 'solid') return { fill: style.fill }
    // Gradient
    const angle = (style.gradientAngle * Math.PI) / 180
    if (style.gradientType === 'linear') {
      return {
        fill: new fabric.Gradient({
          type: 'linear',
          coords: {
            x1: width / 2 - Math.cos(angle) * width / 2,
            y1: height / 2 - Math.sin(angle) * height / 2,
            x2: width / 2 + Math.cos(angle) * width / 2,
            y2: height / 2 + Math.sin(angle) * height / 2,
          },
          colorStops: [
            { offset: 0, color: style.gradientColorStart },
            { offset: 1, color: style.gradientColorEnd },
          ],
        }),
      }
    }
    return {
      fill: new fabric.Gradient({
        type: 'radial',
        coords: { x1: width / 2, y1: height / 2, x2: width / 2, y2: height / 2, r1: 0, r2: Math.max(width, height) / 2 },
        colorStops: [
          { offset: 0, color: style.gradientColorStart },
          { offset: 1, color: style.gradientColorEnd },
        ],
      }),
    }
  }
```

- [ ] **Step 4: Add updateShapeDuringDraw helper**

```typescript
  const updateShapeDuringDraw = (
    shape: any,
    start: { x: number; y: number },
    current: { x: number; y: number },
    shapeType: ShapeType,
    shift: boolean,
    alt: boolean,
  ) => {
    let dx = current.x - start.x
    let dy = current.y - start.y

    if (shapeType === 'line' || shapeType === 'arrow') {
      let endX = current.x
      let endY = current.y
      if (shift) {
        const snapped = snapAngle(start.x, start.y, current.x, current.y)
        endX = snapped.x
        endY = snapped.y
      }
      shape.set({ x2: endX, y2: endY })

      // Update arrowhead if arrow
      if (shapeType === 'arrow') {
        updateArrowhead(shape, start.x, start.y, endX, endY)
      }
      return
    }

    if (shift) {
      const constrained = constrainProportions(dx, dy)
      dx = constrained.width
      dy = constrained.height
    }

    let left = start.x
    let top = start.y
    let width = Math.abs(dx)
    let height = Math.abs(dy)

    if (alt) {
      // Draw from center
      left = start.x - width
      top = start.y - height
      width *= 2
      height *= 2
    } else {
      if (dx < 0) left = start.x + dx
      if (dy < 0) top = start.y + dy
    }

    switch (shapeType) {
      case 'rectangle':
      case 'rounded-rectangle':
      case 'triangle':
        shape.set({ left, top, width, height })
        break
      case 'ellipse':
        shape.set({ left, top, rx: width / 2, ry: height / 2 })
        break
      case 'polygon': {
        const cx = left + width / 2
        const cy = top + height / 2
        const r = Math.min(width, height) / 2
        const sides = shape.__pointCount ?? 6
        shape.set({ points: generatePolygonPoints(0, 0, r, sides), left: cx - r, top: cy - r })
        break
      }
      case 'star': {
        const cx2 = left + width / 2
        const cy2 = top + height / 2
        const outerR = Math.min(width, height) / 2
        const innerR = outerR * 0.5
        const pts = shape.__pointCount ?? 5
        shape.set({ points: generateStarPoints(0, 0, outerR, innerR, pts), left: cx2 - outerR, top: cy2 - outerR })
        break
      }
    }

    // Update gradient coords if gradient fill
    const style = shapeStyleRef.current
    if (style.fillType === 'gradient') {
      const fillOpts = getFillOptions(style, width, height)
      shape.set(fillOpts)
    }
  }

  const updateArrowhead = (lineShape: any, x1: number, y1: number, x2: number, y2: number) => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Remove existing arrowhead
    const existing = canvas.getObjects().find((o: any) => o.__arrowFor === lineShape.__layerId)
    if (existing) canvas.remove(existing)

    const headLen = Math.max(10, (lineShape.strokeWidth ?? 2) * 4)
    const points = generateArrowheadPoints(x1, y1, x2, y2, headLen)
    const fabric = fabricModuleRef.current
    if (!fabric) return

    const arrowhead = new fabric.Polygon(points, {
      fill: lineShape.stroke || '#ffffff',
      selectable: false,
      evented: false,
      __arrowFor: lineShape.__layerId,
    })
    canvas.add(arrowhead)
  }
```

- [ ] **Step 5: Add custom polygon click handler**

```typescript
  const handleCustomPolyClick = (opt: any) => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const pointer = canvas.getViewportPoint(opt.e)
    const points = customPolyPointsRef.current

    // Check if closing the polygon (click near first point)
    if (points.length >= 3) {
      const first = points[0]
      const dist = Math.sqrt((pointer.x - first.x) ** 2 + (pointer.y - first.y) ** 2)
      if (dist < 8 || opt.e.detail === 2) {
        // Close and finalize
        finalizeCustomPolygon()
        return
      }
    }

    // Add point
    points.push({ x: pointer.x, y: pointer.y })

    // Draw point indicator
    const circle = new fabric.Circle({
      left: pointer.x - 4,
      top: pointer.y - 4,
      radius: 4,
      fill: '#3D6AF2',
      stroke: '#ffffff',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      __isCustomPolyPreview: true,
    })
    canvas.add(circle)
    customPolyPreviewRef.current.push(circle)

    // Draw line from previous point
    if (points.length > 1) {
      const prev = points[points.length - 2]
      const line = new fabric.Line([prev.x, prev.y, pointer.x, pointer.y], {
        stroke: '#3D6AF2',
        strokeWidth: 1,
        strokeDashArray: [4, 4],
        selectable: false,
        evented: false,
        __isCustomPolyPreview: true,
      })
      canvas.add(line)
      customPolyPreviewRef.current.push(line)
    }

    canvas.requestRenderAll()
  }

  const finalizeCustomPolygon = () => {
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const points = [...customPolyPointsRef.current]
    if (points.length < 3) return

    // Remove preview objects
    customPolyPreviewRef.current.forEach((obj) => canvas.remove(obj))
    customPolyPreviewRef.current = []
    customPolyPointsRef.current = []

    // Calculate bounding box to normalize points
    const minX = Math.min(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const normalizedPoints = points.map((p) => ({ x: p.x - minX, y: p.y - minY }))

    const style = shapeStyleRef.current
    const fillOptions = getFillOptions(style, 0, 0)

    const polygon = new fabric.Polygon(normalizedPoints, {
      left: minX,
      top: minY,
      ...fillOptions,
      strokeWidth: style.strokeWidth,
      stroke: style.strokeWidth > 0 ? style.stroke : undefined,
      opacity: style.opacity / 100,
      selectable: true,
      evented: true,
    })

    const count = (shapeCounterRef.current['custom-polygon'] ?? 0) + 1
    shapeCounterRef.current['custom-polygon'] = count
    polygon.__layerId = crypto.randomUUID().slice(0, 8)
    polygon.__layerName = `Custom Polygon ${count}`
    polygon.__isShape = true
    polygon.__shapeType = 'custom-polygon'

    canvas.add(polygon)
    canvas.setActiveObject(polygon)
    canvas.requestRenderAll()

    syncLayers()
    pushHistory('Add Custom Polygon')
  }
```

- [ ] **Step 6: Add setActiveShape and updateSelectedShape methods**

```typescript
  const setActiveShape = useCallback((shape: ShapeType) => {
    activeShapeRef.current = shape
  }, [])

  const setShapeStyle = useCallback((updates: Partial<ShapeStyle>) => {
    shapeStyleRef.current = { ...shapeStyleRef.current, ...updates }

    // Apply to currently selected shape if it's a shape object
    const canvas = fabricRef.current
    const fabric = fabricModuleRef.current
    if (!canvas || !fabric) return

    const active = canvas.getActiveObject()
    if (!active || !(active as any).__isShape) return

    const style = shapeStyleRef.current
    const updates2: any = {}

    // Fill
    const fillOpts = getFillOptions(style, active.width ?? 0, active.height ?? 0)
    Object.assign(updates2, fillOpts)

    // Stroke
    updates2.stroke = style.strokeWidth > 0 ? style.stroke : undefined
    updates2.strokeWidth = style.strokeWidth
    updates2.strokeDashArray = style.strokeDashArray.length > 0 ? [...style.strokeDashArray] : undefined

    // Opacity & blend
    updates2.opacity = style.opacity / 100
    updates2.globalCompositeOperation = style.blendMode

    // Shadow
    if (style.shadowEnabled) {
      updates2.shadow = new fabric.Shadow({
        color: style.shadowColor,
        offsetX: style.shadowOffsetX,
        offsetY: style.shadowOffsetY,
        blur: style.shadowBlur,
      })
    } else {
      updates2.shadow = null
    }

    // Corner radius (rect only)
    if ((active as any).__shapeType === 'rectangle' || (active as any).__shapeType === 'rounded-rectangle') {
      updates2.rx = style.cornerRadius
      updates2.ry = style.cornerRadius
    }

    active.set(updates2)
    canvas.requestRenderAll()
    pushHistory('Edit Shape')
  }, [pushHistory])

  const getSelectedShapeProperties = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return null

    const active = canvas.getActiveObject()
    if (!active || !(active as any).__isShape) return null

    return {
      x: active.left ?? 0,
      y: active.top ?? 0,
      width: active.width ?? 0,
      height: active.height ?? 0,
      angle: active.angle ?? 0,
      scaleX: active.scaleX ?? 1,
      scaleY: active.scaleY ?? 1,
      pointCount: (active as any).__pointCount,
    }
  }, [])

  const updateSelectedShapeProperties = useCallback((updates: Record<string, number>) => {
    const canvas = fabricRef.current
    if (!canvas) return

    const active = canvas.getActiveObject()
    if (!active || !(active as any).__isShape) return

    if (updates.x !== undefined) active.set('left', updates.x)
    if (updates.y !== undefined) active.set('top', updates.y)
    if (updates.width !== undefined) active.set('width', updates.width)
    if (updates.height !== undefined) active.set('height', updates.height)
    if (updates.angle !== undefined) active.set('angle', updates.angle)
    if (updates.pointCount !== undefined) {
      (active as any).__pointCount = updates.pointCount
      // Regenerate vertices
      const shapeType = (active as any).__shapeType as ShapeType
      const r = Math.min(active.width ?? 50, active.height ?? 50) / 2
      if (shapeType === 'polygon') {
        (active as any).set('points', generatePolygonPoints(0, 0, r, updates.pointCount))
      } else if (shapeType === 'star') {
        (active as any).set('points', generateStarPoints(0, 0, r, r * 0.5, updates.pointCount))
      }
    }

    active.setCoords()
    canvas.requestRenderAll()
    pushHistory('Edit Shape')
  }, [pushHistory])
```

- [ ] **Step 7: Add new methods to the return object**

Add these to the `return { ... }` block:

```typescript
    // Shape operations
    setActiveShape,
    setShapeStyle,
    getSelectedShapeProperties,
    updateSelectedShapeProperties,
    shapeStyle: shapeStyleRef.current,
```

Also add `'__isShape', '__shapeType', '__pointCount', '__arrowFor', '__isArrowLine', '__isCustomPolyPreview'` to the `toJSON` custom properties array in `pushHistory`.

- [ ] **Step 8: Commit**

```bash
git add tools/image-editor/use-fabric-canvas.ts
git commit -m "feat(image-editor): add shape drawing mode to canvas hook"
```

---

### Task 7: Wire Page — State, Properties Bar, Keyboard Shortcuts

**Files:**
- Modify: `app/tools/image-editor/page.tsx`

- [ ] **Step 1: Add imports and state**

Add imports at the top:

```typescript
import { PropertiesBar } from '@/tools/image-editor/properties-bar'
import { type ShapeType, type ShapeStyle, DEFAULT_SHAPE_STYLE, SHAPE_TYPES } from '@/tools/image-editor/shape-tools'
```

Add state inside the component (after existing state):

```typescript
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle')
  const [shapeStyle, setShapeStyle] = useState<ShapeStyle>({ ...DEFAULT_SHAPE_STYLE })
  const [selectedShapeProps, setSelectedShapeProps] = useState<{
    x: number; y: number; width: number; height: number; angle: number; scaleX: number; scaleY: number; pointCount?: number;
  } | null>(null)
```

- [ ] **Step 2: Add shape sync effects**

After existing `useEffect` blocks:

```typescript
  // Sync active shape to canvas hook
  useEffect(() => { fabric.setActiveShape(activeShape) }, [activeShape, fabric.setActiveShape])

  // Poll selected shape properties when shape tool is active
  useEffect(() => {
    if (activeTool !== 'shape') {
      setSelectedShapeProps(null)
      return
    }
    const interval = setInterval(() => {
      const props = fabric.getSelectedShapeProperties()
      setSelectedShapeProps(props)
    }, 100)
    return () => clearInterval(interval)
  }, [activeTool, fabric.getSelectedShapeProperties])
```

- [ ] **Step 3: Add shape style change handler**

```typescript
  const handleShapeStyleChange = useCallback((updates: Partial<ShapeStyle>) => {
    setShapeStyle((prev) => {
      const next = { ...prev, ...updates }
      fabric.setShapeStyle(updates)
      return next
    })
  }, [fabric.setShapeStyle])

  const handleShapePropertiesChange = useCallback((updates: Record<string, number>) => {
    fabric.updateSelectedShapeProperties(updates)
  }, [fabric.updateSelectedShapeProperties])
```

- [ ] **Step 4: Add keyboard shortcut for shape tool**

In the existing keyboard handler (inside the `useEffect`), add before the closing `}`:

```typescript
      // Shape tool shortcut
      if (!isInput && e.key.toLowerCase() === 'u' && !meta) {
        e.preventDefault()
        if (e.shiftKey) {
          // Cycle through shapes
          setActiveShape((prev) => {
            const idx = SHAPE_TYPES.indexOf(prev)
            return SHAPE_TYPES[(idx + 1) % SHAPE_TYPES.length]
          })
        }
        setActiveTool('shape')
        return
      }
      // Escape cancels custom polygon drawing
      if (e.key === 'Escape' && activeTool === 'shape') {
        // Hook cleanup handles the rest via setTool
        setActiveTool('move')
        return
      }
```

- [ ] **Step 5: Update EditorToolbar usage**

Update the `<EditorToolbar>` component call to pass the new props:

```tsx
<EditorToolbar
  activeTool={activeTool}
  onToolChange={setActiveTool}
  fgColor={fgColor}
  bgColor={bgColor}
  onSwapColors={handleSwapColors}
  onFgColorChange={setFgColor}
  onBgColorChange={setBgColor}
  activeShape={activeShape}
  onShapeChange={setActiveShape}
/>
```

- [ ] **Step 6: Add PropertiesBar to the layout**

Add the `PropertiesBar` between the header menu and the canvas area. Find the header div and add after it:

```tsx
{/* Properties bar — visible when shape tool active or shape selected */}
{(activeTool === 'shape' || selectedShapeProps) && (
  <PropertiesBar
    shapeType={activeShape}
    style={shapeStyle}
    properties={selectedShapeProps}
    onStyleChange={handleShapeStyleChange}
    onPropertiesChange={handleShapePropertiesChange}
    onShapeTypeChange={(type) => {
      setActiveShape(type)
      setActiveTool('shape')
    }}
  />
)}
```

- [ ] **Step 7: Commit**

```bash
git add app/tools/image-editor/page.tsx
git commit -m "feat(image-editor): wire shape state, properties bar, and keyboard shortcuts"
```

---

### Task 8: Build Verification

- [ ] **Step 1: Run build**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm build
```

Expected: Build completes with no TypeScript errors.

- [ ] **Step 2: Fix any issues**

Common issues:
- `ToolType` import needs updating in `use-fabric-canvas.ts` since the union changed
- Missing Fabric.js type declarations for custom properties (`__isShape`, etc.) — use `as any` consistently
- `SHAPE_LABELS` needs importing in `use-fabric-canvas.ts` for history labels
- `syncLayers` and `pushHistory` may need to be accessible from the shape handlers — they're already defined in the hook scope

- [ ] **Step 3: Commit fixes**

```bash
git add -A && git commit -m "fix(image-editor): resolve build issues in shape tools integration"
```
