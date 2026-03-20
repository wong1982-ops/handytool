# Color Palette Generator — Design Document

**Date:** 2026-03-20
**Status:** DESIGN APPROVED

---

## Understanding Summary

- **What:** A Color Palette Generator with three generation methods (color theory wheel, image extraction, AI), 5-color palettes with expandable 50-950 tint/shade scales, full export formats, and accessibility checking
- **Why:** Give designers and developers a complete palette tool with developer-friendly exports (CSS vars, Tailwind config) and designer-friendly features (image extraction, color blindness simulation)
- **Who:** Designers (visual exploration, ASE/PNG export, Figma-ready JSON) and developers (CSS/Tailwind/SCSS export, shareable URLs)
- **Key constraints:** Image extraction client-side via Web Worker (median cut), AI generation server-side (credits), localStorage for saved palettes (max 20), URL hash for sharing
- **Non-goals:** Not a full design system builder, no font pairing, no layout/UI generator, no real-time collaboration

## Assumptions

- Canvas API + median cut algorithm sufficient for color extraction
- Web Worker prevents UI blocking during extraction
- Color theory calculations done client-side (pure math)
- AI palette generation reuses existing Gemini API (costs credits)
- Tailwind config export matches 50-950 scale format
- ASE file encoded client-side (binary format)
- PNG swatch rendered via Canvas (1200x630, social-share friendly)
- Color blindness simulation via Brettel algorithm (pure math on RGB)
- OKLCH for perceptually uniform tint/shade generation
- Shareable URLs encode 5 hex colors in hash fragment

---

## Layout

### Desktop (>=1024px)

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb + Title                                  │
├─────────────────────────────────────────────────────┤
│ Palette Strip (5 swatches, always visible)          │
│ [██ #3D6AF2] [██ #8B5CF6] [██ #EC4899] [██ #F59E0B] [██ #10B981] │
│ (expanded tint/shade scale when swatch selected)    │
├──────────────────────────┬──────────────────────────┤
│  Generation Area         │  Export Panel             │
│  [Wheel|Image|AI|Saved]  │  Accessibility Panel     │
│  (active tab content)    │  Share URL               │
└──────────────────────────┴──────────────────────────┘
```

### Mobile (<1024px)
- Palette strip full-width (horizontal scroll)
- Generation tabs below
- Export + accessibility as collapsible accordions

---

## Components

| File | Responsibility |
|---|---|
| `types.ts` | PaletteColor, Palette, HarmonyRule, ExportFormat types |
| `color-utils.ts` | Hex/RGB/HSL/OKLCH conversions, harmony calculations, tint/shade generation, contrast ratio, Brettel simulation |
| `palette-strip.tsx` | Persistent 5-swatch strip with lock toggle, shuffle, click-to-expand tint/shade (50-950), color picker popover |
| `color-wheel-tab.tsx` | Interactive SVG color wheel, harmony rule selector, draggable dots, base color hex+HSL input |
| `image-tab.tsx` | Image upload, Web Worker extraction, results display, "Apply to palette" |
| `extraction-worker.ts` | Web Worker: median cut color quantization algorithm |
| `ai-tab.tsx` | Prompt input, preset pills, AI generation (credits), 3 palette suggestions |
| `saved-tab.tsx` | localStorage palette list (max 20), save/load/delete |
| `export-panel.tsx` | CSS vars, Tailwind config, SCSS, JSON, ASE download, PNG swatch download |
| `accessibility-panel.tsx` | 5x5 contrast checker matrix (AA/AAA) + color blindness simulation (protanopia, deuteranopia, tritanopia) |
| `app/tools/color-palette/page.tsx` | Page route, state management, URL hash sharing |

---

## Palette Strip

- 5 large swatches (~80px desktop, flex mobile) showing color block + hex + copy icon
- Click swatch → expand tint/shade scale below (50-950, 11 steps)
- 500 = base color, lighter via OKLCH toward white, darker toward black
- Lock toggle per swatch (locked colors preserved during regeneration)
- Shuffle button randomizes unlocked colors
- Click swatch opens color picker popover (hex input + HSL sliders)
- Ring highlight on selected swatch

---

## Generation Tabs

### Color Wheel Tab
- Interactive SVG color wheel (hue ring + inner area)
- 5 draggable dots representing palette colors
- Harmony rule selector: Complementary, Analogous, Triadic, Split-complementary, Tetradic, Monochromatic, Square, Custom
- Rule selection snaps dots to geometric positions relative to primary
- Custom mode: free drag
- Base color input: hex + HSL sliders
- Generate button applies harmony

### Image Extraction Tab
- Drag & drop (PNG/JPG/WebP, max 10MB)
- Web Worker runs median cut → top 5 dominant colors
- Shows image thumbnail + extracted swatches
- "Apply to palette" button
- Color count slider (3-8) for more control
- Note for similar colors: "Try an image with more color variety"

### AI Generate Tab
- Prompt textarea
- Quick presets: Sunrise, Ocean, Forest, Neon, Pastel, Corporate, Vintage, Candy
- Generate button (1 credit)
- Results: 3 palette suggestions as mini strips, click to apply
- Placeholder UI initially (API integration later)

### Saved Palettes Tab
- Grid of saved palettes from localStorage (max 20)
- Each card: mini strip + name + date
- Click to load, trash to delete
- "Save Current" button (prompts for name)
- Empty state: "No saved palettes yet"

---

## Export Panel

| Format | Output | Action |
|---|---|---|
| CSS Variables | `--color-primary-500: #...;` (base + tints/shades) | Copy |
| Tailwind Config | `colors: { primary: { 50: '...', ..., 950: '...' } }` | Copy |
| SCSS Variables | `$color-primary-500: #...;` | Copy |
| JSON | Full palette object with tint/shade scales | Copy |
| ASE (Adobe) | Binary .ase swatch file (5 base colors) | Download |
| PNG Swatch | 1200x630 image with color bars + hex labels | Download |

Auto-generated semantic names: primary, secondary, accent, neutral, highlight (user can rename).

---

## Accessibility Panel

### Contrast Checker
- 5x5 matrix: every color pair tested
- Each cell: contrast ratio + AA/AAA pass/fail badges
- Cells use both colors as fg/bg to visualize
- Auto-suggested accessible text colors (black/white) per swatch

### Color Blindness Simulation
- 3 modes: Protanopia, Deuteranopia, Tritanopia
- Shows palette strip as seen by each viewer type
- Brettel algorithm (color matrix on RGB values)
- Warning badge when two colors become indistinguishable

---

## State Model

```typescript
interface PaletteColor {
  hex: string
  locked: boolean
  name: string
}

interface PaletteState {
  colors: [PaletteColor, PaletteColor, PaletteColor, PaletteColor, PaletteColor]
  harmonyRule: HarmonyRule
  expandedIndex: number | null
  activeTab: 'wheel' | 'image' | 'ai' | 'saved'
}
```

**URL sharing:** `/tools/color-palette#3D6AF2-8B5CF6-EC4899-F59E0B-10B981`

**localStorage:** `tk-palettes` → `Array<{ id, name, colors, createdAt }>` (max 20)

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Image >10MB | Reject with error |
| Non-image file | Reject with message |
| Web Worker unsupported | Fall back to main thread |
| Extraction <5 colors | Pad with neutral grays + note |
| Colors too similar in extraction | Show variety note |
| Invalid hex in URL hash | Ignore, use defaults |
| localStorage full | Silently fail, show note |
| AI generation fails | Error + retry |
| Not signed in (AI) | Sign-in prompt |
| Contrast below AA | Red badge + suggested alternative |
| Indistinguishable under color blindness | Warning badge |
| All 5 locked + regenerate | "Unlock at least one color" |

---

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | Three generation methods + saved | Fewer methods | Maximum flexibility |
| 2 | Fixed 5 + expandable 50-950 scale | Flexible 2-10; No shades | Matches Tailwind, simple UX, powerful output |
| 3 | Full harmony rules + custom | Basic 4 only | Power users expect full set |
| 4 | Client-side extraction via Web Worker | Server-side; Main thread | Free, instant, no UI blocking |
| 5 | Full export: CSS/Tailwind/SCSS/JSON/ASE/PNG | Basic hex only | Serves both designers and developers |
| 6 | localStorage + URL hash sharing | No persistence; Database | Simple, no auth needed |
| 7 | Contrast matrix + color blindness simulation | Contrast only; None | Accessibility is core to professional palette work |
| 8 | Tabs + persistent palette strip | Split-screen; Cards | Palette always visible, good mobile UX |
| 9 | OKLCH for tint/shade | HSL mixing | Perceptually uniform |
| 10 | Brettel algorithm for simulation | CSS filter approximation | More accurate |
| 11 | 5 hex colors in URL hash | Base64 | Human-readable |
