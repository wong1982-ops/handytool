# Image Editor Shape Tools — Design Spec

**Date:** 2026-03-29
**Location:** `tools/image-editor/`
**Sub-project:** 1 of 7 (Image Editor Photoshop Enhancement)
**Purpose:** Add 9 shape tools with full styling, click-drag interaction with modifiers, numeric properties bar, and custom polygon vertex editing.

---

## Understanding Summary

- **What**: Add 9 shape tools — Rectangle, Ellipse, Line, Arrow, Polygon, Star, Rounded Rectangle, Triangle, Custom Polygon (point-by-point with editable vertices)
- **Why**: Close the biggest daily-use gap vs Photoshop; shapes are fundamental to any serious image editor
- **Who**: All image editor users
- **Constraints**: All client-side using Fabric.js native objects, non-destructive (each shape is a selectable/editable layer object)
- **Interaction**: Click-drag with Shift (constrain proportions) and Alt (draw from center) modifiers, plus a properties bar for exact numeric input
- **Non-goals**: No pen tool / bezier curves (separate sub-project #7), no rasterize-on-draw mode, no AI mask integration in v1

## Assumptions

- Shapes are added to the existing layer system as Fabric.js objects (same as text and brush strokes)
- Gradient fill is limited to linear and radial (no custom multi-stop editor in v1)
- Drop shadow uses Fabric.js built-in shadow (single shadow per shape)
- Properties bar appears below the header menu bar when a shape tool is active or a shape is selected
- Custom polygon vertex editing reuses Fabric.js polygon control points API

---

## Toolbar Integration

The left toolbar currently has 6 tools: Move, Hand, Crop, Brush, Eraser, Text. Add a **Shape tool** as the 7th item.

**Shape tool flyout**: Clicking the shape tool icon opens a small flyout menu (anchored to the toolbar button) showing a 3x3 grid of the 9 shapes, each with a small icon. The last-used shape becomes the default shown on the toolbar button.

**Keyboard shortcuts**: `U` activates the shape tool with the last-used shape. `Shift+U` cycles through shapes.

**Active state**: When a shape tool is active, the cursor changes to crosshair. The properties bar appears below the header. The right panel continues showing layers/adjustments as normal.

**State changes**: Extend `activeTool` with `'shape'`. Add new `activeShape` state: `'rectangle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star' | 'rounded-rectangle' | 'triangle' | 'custom-polygon'`.

---

## Drawing Interaction

### Click-drag shapes (all except Custom Polygon)

1. `mousedown` on canvas → record start point, create a temporary Fabric object with zero size
2. `mousemove` → update width/height based on cursor position
   - **Shift** held: constrain to equal width/height (square, circle, equilateral, etc.)
   - **Alt** held: use start point as center instead of corner
3. `mouseup` → finalize the shape, assign `__layerId` and `__layerName` (e.g., "Rectangle 1"), add to layer list, push to undo history

**Line and Arrow**: Use start/end points instead of width/height. Shift constrains to 0°/45°/90° angles.

**Star and Polygon**: Created with default point count (Star: 5 points, Polygon: 6 sides). Point count editable in properties bar after creation — regenerates vertices.

### Custom Polygon (click-to-place)

1. Click to place each vertex — small circle indicator at each point
2. Preview line draws from last point to cursor
3. When cursor is within 8px of first point, close indicator highlights
4. Click first point or double-click anywhere to close the shape
5. Press Escape to cancel mid-draw
6. After creation, double-click the shape to enter **vertex edit mode** — each vertex becomes a draggable control point. Click outside or press Enter to exit.

---

## Properties Bar

Horizontal bar below the header menu. Appears when shape tool is active or a shape is selected. Disappears when switching to non-shape tools with no shape selected.

**Layout (left to right):**

| Group | Controls |
|-------|----------|
| Shape type | Dropdown with icon (allows switching without flyout) |
| Dimensions | W + H number inputs, linked chain icon for constrain proportions |
| Position | X + Y number inputs |
| Rotation | Angle input (0-360°) |
| Fill | Color swatch → popover: solid color picker, gradient toggle (linear/radial with angle), transparent (no fill) |
| Stroke | Color swatch + width input (px) + dash pattern dropdown (solid/dashed/dotted) |
| Corner radius | Number input — visible only for Rectangle and Rounded Rectangle |
| Points | Number input — visible only for Star (points count) and Polygon (sides count) |
| Opacity | Slider 0-100% |
| Blend mode | Dropdown: Normal, Multiply, Screen, Overlay, Darken, Lighten |
| Shadow | Toggle + popover: color, offsetX, offsetY, blur |

**Mobile**: Collapses into an icon button that opens a bottom sheet with controls stacked vertically.

**Live updates**: All property changes apply immediately — no "apply" button.

---

## Custom Shape Classes

**Natively supported by Fabric.js:**
- Rectangle → `fabric.Rect`
- Ellipse → `fabric.Ellipse`
- Line → `fabric.Line`
- Triangle → `fabric.Triangle`
- Rounded Rectangle → `fabric.Rect` with `rx`/`ry` properties

**Custom implementations:**

### Arrow
`fabric.Group` containing a `Line` and a `Polygon` (triangle arrowhead) positioned at the end point. Arrowhead rotates to match line angle. Arrowhead size scales proportionally with stroke width.

### Star
`fabric.Polygon` with mathematically generated vertices. Given `n` points, outer radius, and inner radius (default 50% of outer), generate alternating outer/inner points around center. Point count editable — regenerates vertices on change.

### Custom Polygon — Vertex Editing
After creation, double-clicking sets `shape.edit = true` and replaces Fabric's default corner controls with per-vertex draggable controls using Fabric's `controls` API. Each vertex becomes a circular handle. Dragging a handle updates the polygon's `points` array. Clicking outside or pressing Enter exits edit mode.

---

## Integration with Existing Systems

**Layer system**: Shapes get `__layerId` and `__layerName` markers, appear in Layers Panel with shape-type icons and auto-generated names ("Rectangle 1", "Star 3"). Layer opacity, blend mode, visibility, lock all work as-is.

**History system**: Shape creation pushes labeled entry ("Add Rectangle"). Property changes push entries ("Edit Rectangle"). Vertex edits push a single entry on edit mode exit. Undo/redo via existing JSON serialization.

**Adjustments & Filters**: Shapes affected by global adjustments on export. During editing, adjustments apply only to background image layer (existing behavior).

**Export**: Shapes rendered as part of final canvas. No changes to export dialog.

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `tools/image-editor/shape-tools.ts` | Shape drawing handlers (click-drag, custom polygon), shape creation helpers, star/arrow vertex math |
| Create | `tools/image-editor/properties-bar.tsx` | Properties bar component (dimensions, fill, stroke, shadow, etc.) |
| Create | `tools/image-editor/shape-flyout.tsx` | Shape selector flyout menu (3x3 icon grid) |
| Create | `tools/image-editor/gradient-picker.tsx` | Gradient fill popover (linear/radial, angle, two color stops) |
| Modify | `tools/image-editor/editor-toolbar.tsx` | Add shape tool button with flyout trigger |
| Modify | `tools/image-editor/use-fabric-canvas.ts` | Add shape drawing mode, vertex edit mode, shape interaction handlers |
| Modify | `app/tools/image-editor/page.tsx` | Add `activeShape` state, wire properties bar, keyboard shortcuts |

No new API routes. No new dependencies.

---

## Decision Log

| # | Decision | Alternatives Considered | Reason |
|---|----------|------------------------|--------|
| 1 | Decompose into 7 sub-projects, start with Shape Tools | Design all 7 at once | Each is substantial; sequential delivery reduces risk |
| 2 | Full 9-shape set in first pass | Start with 4 basic shapes | Photoshop-level completeness; Fabric.js makes all 9 feasible |
| 3 | Non-destructive objects (not rasterized) | Rasterize on draw, user's choice | Matches Photoshop behavior, enables re-editing, works with layer system |
| 4 | Advanced styling (gradient, shadow, blend mode) | Basic fill/stroke only | Photoshop parity; Fabric.js supports all natively |
| 5 | Click-drag + Shift/Alt modifiers + properties bar | Click-drag only, dialog-based input | Matches Photoshop UX conventions |
| 6 | Custom polygon with vertex editing | Fixed-point polygon only | Fabric.js controls API supports this |
| 7 | Arrow as Group (Line + Polygon arrowhead) | SVG path, custom renderer | Leverages existing Fabric objects, simpler to serialize |
| 8 | Star via calculated Polygon vertices | SVG star path, custom class | Simplest approach, supports dynamic point count |
| 9 | Properties bar below header (not sidebar) | In right panel, floating toolbar | Follows Photoshop convention |
| 10 | Mobile properties as bottom sheet | Inline collapsible, separate page | Consistent with mobile patterns |
| 11 | No new dependencies | Add a shape library | Fabric.js covers everything natively |

---

## Future Sub-projects (Roadmap)

| # | Feature | Status |
|---|---------|--------|
| 1 | Shape Tools | **This spec** |
| 2 | Selection Tools (marquee, lasso, magic wand) | Planned |
| 3 | Transform Tools (free transform, skew, perspective) | Planned |
| 4 | Gradient & Paint Bucket | Planned |
| 5 | Advanced Brush System (presets, opacity, flow, pressure) | Planned |
| 6 | Clone Stamp / Healing Brush | Planned |
| 7 | Pen Tool / Paths | Planned |
