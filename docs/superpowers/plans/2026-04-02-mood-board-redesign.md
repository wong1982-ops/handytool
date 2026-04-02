# Mood Board Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current blank-canvas mood board with a guided wizard → sectioned board layout with collapsible tools drawer.

**Architecture:** Three-phase user flow: (1) Wizard collects theme + mood + color preference, (2) API generates images/palette/fonts, (3) Sectioned board displays results with a collapsible right-side drawer for adding more elements. State managed via existing `useBoard` hook, extended with new fields. No freeform drag — elements auto-arrange in structured sections.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, `@dnd-kit/sortable` (already installed) for drag-to-reorder, existing Gemini API integration, Supabase persistence, R2 storage.

**Spec:** `docs/superpowers/specs/2026-04-02-mood-board-redesign.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `tools/mood-board/wizard.tsx` | 3-step wizard (theme → mood → color) |
| `tools/mood-board/wizard-moods.ts` | Mood card data (labels, descriptions) |
| `tools/mood-board/board-sections.tsx` | Sectioned board layout orchestrator |
| `tools/mood-board/sections/image-grid.tsx` | Masonry image grid with @dnd-kit reorder |
| `tools/mood-board/sections/palette-row.tsx` | Palette swatches + font cards row |
| `tools/mood-board/sections/notes-section.tsx` | Notes/extras flex-wrap area |
| `tools/mood-board/side-drawer.tsx` | Collapsible right-side tools drawer |
| `tools/mood-board/loading-screen.tsx` | Full-screen generation progress |

### Modified Files
| File | Changes |
|------|---------|
| `tools/mood-board/types.ts` | Add `mood`, `colorPreference` to Board; add `MoodOption`, `ColorPreference` types |
| `tools/mood-board/use-board.ts` | Pass mood/color to generate(); localStorage fallback for unauth |
| `tools/mood-board/mood-board-studio.tsx` | Rewrite: wizard → loading → board flow |
| `tools/mood-board/board-toolbar.tsx` | Simplify: remove tab switching, keep save/share/download |
| `tools/mood-board/my-boards.tsx` | Keep as-is, render inline when triggered from toolbar |
| `lib/mood-board/prompts.ts` | Accept mood + colorPreference in prompt builders |
| `app/api/v1/mood-board/generate/route.ts` | Accept mood + colorPreference params; allow unauth |
| `app/api/v1/mood-board/save/route.ts` | Save mood + colorPreference columns |
| `app/tools/mood-board/page.tsx` | Remove breadcrumb wrapper (wizard is full-screen) |

### Removed Files
| File | Reason |
|------|--------|
| `tools/mood-board/prompt-panel.tsx` | Replaced by wizard + side-drawer |
| `tools/mood-board/board-canvas.tsx` | Replaced by board-sections.tsx |
| `tools/mood-board/board-element.tsx` | Element renderers moved into section-specific components |

---

## Task 1: Update Types & Data

**Files:**
- Modify: `tools/mood-board/types.ts`
- Create: `tools/mood-board/wizard-moods.ts`

- [ ] **Step 1: Update types.ts with new Board fields and types**

```typescript
// Add to tools/mood-board/types.ts — after existing types, before DEFAULT_BOARD

export type MoodOption = 'cozy' | 'bold' | 'elegant' | 'playful' | 'minimal' | 'vintage' | 'luxurious' | 'natural'

export type ColorPreference = 'warm' | 'cool' | 'neutral' | 'surprise'

// Update Board interface — add mood + colorPreference
```

In `tools/mood-board/types.ts`, add `mood: MoodOption | null` and `colorPreference: ColorPreference` to the `Board` interface. Update `DEFAULT_BOARD` to include `mood: null` and `colorPreference: 'surprise'`.

Remove `x`, `y`, `rotation` fields from `BoardElement` — the sectioned layout handles positioning. Keep `id`, `type`, `width`, `height`, `data`. Add `order: number` field for drag-to-reorder.

- [ ] **Step 2: Create wizard-moods.ts with mood card data**

```typescript
// tools/mood-board/wizard-moods.ts
import type { MoodOption } from './types'

export interface MoodCard {
  id: MoodOption
  label: string
  description: string
  emoji: string
}

export const MOOD_CARDS: MoodCard[] = [
  { id: 'cozy', label: 'Cozy', description: 'Warm, inviting, comfortable', emoji: '🧶' },
  { id: 'bold', label: 'Bold', description: 'Strong, vibrant, eye-catching', emoji: '⚡' },
  { id: 'elegant', label: 'Elegant', description: 'Refined, sophisticated, luxe', emoji: '✨' },
  { id: 'playful', label: 'Playful', description: 'Fun, whimsical, colorful', emoji: '🎨' },
  { id: 'minimal', label: 'Minimal', description: 'Clean, simple, focused', emoji: '◻️' },
  { id: 'vintage', label: 'Vintage', description: 'Retro, nostalgic, timeless', emoji: '📷' },
  { id: 'luxurious', label: 'Luxurious', description: 'Premium, opulent, rich', emoji: '💎' },
  { id: 'natural', label: 'Natural', description: 'Organic, earthy, serene', emoji: '🌿' },
]

export const TEMPLATES = [
  { id: 'wedding', label: 'Wedding', theme: 'Romantic wedding with soft florals and elegant details' },
  { id: 'brand', label: 'Brand Identity', theme: 'Modern tech startup branding with clean lines' },
  { id: 'interior', label: 'Interior Design', theme: 'Scandinavian-inspired living room with warm neutrals' },
  { id: 'fashion', label: 'Fashion', theme: 'Streetwear collection with urban aesthetic' },
  { id: 'food', label: 'Food & Drink', theme: 'Artisan cafe with rustic charm and fresh ingredients' },
  { id: 'travel', label: 'Travel', theme: 'Tropical island getaway with turquoise waters' },
]
```

- [ ] **Step 3: Commit**

```bash
git add tools/mood-board/types.ts tools/mood-board/wizard-moods.ts
git commit -m "feat(mood-board): update types with mood/color preference, add wizard mood data"
```

---

## Task 2: Update Prompts & API

**Files:**
- Modify: `lib/mood-board/prompts.ts`
- Modify: `app/api/v1/mood-board/generate/route.ts`
- Modify: `app/api/v1/mood-board/save/route.ts`

- [ ] **Step 1: Update prompts.ts to accept mood and color**

Replace `lib/mood-board/prompts.ts` with:

```typescript
// lib/mood-board/prompts.ts
import type { MoodOption, ColorPreference } from '@/tools/mood-board/types'

const MOOD_DESCRIPTORS: Record<MoodOption, string> = {
  cozy: 'warm, soft lighting, comfortable textures, inviting atmosphere',
  bold: 'high contrast, vivid colors, strong compositions, impactful visuals',
  elegant: 'refined, sophisticated, luxurious materials, graceful forms',
  playful: 'bright, whimsical, fun patterns, energetic composition',
  minimal: 'clean lines, negative space, muted palette, understated beauty',
  vintage: 'retro tones, film grain, nostalgic elements, timeless aesthetic',
  luxurious: 'rich textures, gold accents, premium materials, opulent detail',
  natural: 'organic textures, earth tones, botanical elements, serene landscapes',
}

const COLOR_DESCRIPTORS: Record<ColorPreference, string> = {
  warm: 'warm color palette — reds, oranges, yellows, terracotta, amber',
  cool: 'cool color palette — blues, teals, lavenders, slate, mint',
  neutral: 'neutral color palette — whites, grays, beiges, taupes, cream',
  surprise: '',
}

export function buildMoodImagePrompt(
  theme: string,
  index: number,
  mood?: MoodOption | null,
  colorPref?: ColorPreference,
): string {
  const variations = [
    'a close-up detail shot capturing texture and material',
    'a wide atmospheric scene capturing the overall mood',
    'a product or object that embodies this aesthetic',
    'a color-rich composition focusing on the palette',
    'an interior or environment that fits this vibe',
    'a pattern or surface texture that matches this style',
    'a lifestyle scene with people or activity',
    'a typography or signage detail in this aesthetic',
  ]
  const variation = variations[index % variations.length]
  const moodDesc = mood ? ` Visual mood: ${MOOD_DESCRIPTORS[mood]}.` : ''
  const colorDesc = colorPref && colorPref !== 'surprise' ? ` Color direction: ${COLOR_DESCRIPTORS[colorPref]}.` : ''

  return (
    `Generate a high-quality mood board reference image for the theme: "${theme}".${moodDesc}${colorDesc} ` +
    `This image should be ${variation}. ` +
    `Professional photography quality, visually cohesive with the theme, ` +
    `no text overlays or watermarks. Square format.`
  )
}

export function buildPalettePrompt(theme: string, mood?: MoodOption | null, colorPref?: ColorPreference): string {
  const moodHint = mood ? ` The mood is ${mood}.` : ''
  const colorHint = colorPref && colorPref !== 'surprise' ? ` Lean toward ${colorPref} tones.` : ''

  return (
    `Suggest a 5-color palette for the theme: "${theme}".${moodHint}${colorHint} ` +
    `Return ONLY a JSON array of 5 hex color strings, no explanation. ` +
    `Example: ["#2D3436", "#636E72", "#DFE6E9", "#74B9FF", "#0984E3"]`
  )
}

export function buildAddMorePrompt(theme: string, userPrompt: string): string {
  return (
    `Generate a mood board reference image for the theme: "${theme}". ` +
    `Specific request: ${userPrompt}. ` +
    `Professional quality, visually cohesive, square format, no text overlays.`
  )
}
```

- [ ] **Step 2: Update generate route to accept mood + colorPreference**

In `app/api/v1/mood-board/generate/route.ts`:

- Change the request body type to `{ theme: string; mood?: MoodOption; colorPreference?: ColorPreference }`
- Pass `body.mood` and `body.colorPreference` to `buildMoodImagePrompt()` and `buildPalettePrompt()`
- Remove `x`, `y`, `rotation` from generated elements — replace with `order: i` field
- Return `boardId`, `elements`, `mood`, and `colorPreference` in response

- [ ] **Step 3: Update save route to persist mood + colorPreference**

In `app/api/v1/mood-board/save/route.ts`, add `mood` and `colorPreference` to the insert/upsert payload.

- [ ] **Step 4: Apply database migration**

```sql
ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS color_preference TEXT DEFAULT 'surprise';
```

Apply via Supabase MCP `apply_migration` tool.

- [ ] **Step 5: Commit**

```bash
git add lib/mood-board/prompts.ts app/api/v1/mood-board/generate/route.ts app/api/v1/mood-board/save/route.ts
git commit -m "feat(mood-board): pass mood/color to generation prompts, update API"
```

---

## Task 3: Build the Wizard

**Files:**
- Create: `tools/mood-board/wizard.tsx`

- [ ] **Step 1: Create wizard.tsx — 3-step full-screen wizard**

The wizard component manages its own step state (1, 2, 3) and calls `onGenerate({ theme, mood, colorPreference })` when the user clicks "Generate Board".

```
WizardProps:
  onGenerate: (params: { theme: string; mood: MoodOption; colorPreference: ColorPreference }) => void
  onLoadBoard: () => void  // "My Boards" link

State:
  step: 1 | 2 | 3
  theme: string
  mood: MoodOption | null
  colorPreference: ColorPreference ('surprise' default)
```

**Step 1 UI:** Full-screen centered. Heading "What's your mood board for?". Textarea. "Next" button (disabled until 3+ chars). Template gallery link below — clicking a template sets theme + skips to step 3.

**Step 2 UI:** Heading "Pick a vibe". Grid of 8 `MOOD_CARDS` — each is a clickable card with emoji + label + description. Single-select with `ring-2 ring-[#3D6AF2]` highlight. Back + Next buttons.

**Step 3 UI:** Heading "Any color direction?". 4 pill buttons (warm/cool/neutral/surprise). Default: surprise. Skip link. "Generate Board" gradient button.

Styling: dark theme (`bg-[#090f16]`), centered `max-w-xl`, consistent with design system tokens.

- [ ] **Step 2: Commit**

```bash
git add tools/mood-board/wizard.tsx
git commit -m "feat(mood-board): add 3-step creation wizard"
```

---

## Task 4: Build the Loading Screen

**Files:**
- Create: `tools/mood-board/loading-screen.tsx`

- [ ] **Step 1: Create loading-screen.tsx**

Full-screen dark background with centered content:
- Animated progress indicator (pulsing gradient ring or spinner)
- Step labels that advance: "Generating images..." → "Creating palette..." → "Picking fonts..." → "Arranging board..."
- Use a `step` prop (0-3) controlled by the parent based on generation progress
- Skeleton grid preview: 8 shimmer rectangles in a 4x2 grid layout that fade in as images arrive

```
LoadingScreenProps:
  step: number  // 0-3, controls which label is active
  completedImages: number  // 0-8, fills in skeleton slots
```

- [ ] **Step 2: Commit**

```bash
git add tools/mood-board/loading-screen.tsx
git commit -m "feat(mood-board): add generation loading screen with progress steps"
```

---

## Task 5: Build the Sectioned Board Layout

**Files:**
- Create: `tools/mood-board/board-sections.tsx`
- Create: `tools/mood-board/sections/image-grid.tsx`
- Create: `tools/mood-board/sections/palette-row.tsx`
- Create: `tools/mood-board/sections/notes-section.tsx`

- [ ] **Step 1: Create image-grid.tsx — masonry image grid with drag-to-reorder**

Uses `@dnd-kit/core` and `@dnd-kit/sortable` for drag-to-reorder.

```
ImageGridProps:
  images: BoardElement[]  // filtered to type === 'image'
  selectedId: string | null
  onSelect: (id: string | null) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemove: (id: string) => void
```

Layout: CSS grid with `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`. First two images span 2 columns (`col-span-2`) for hero sizing. Each image: `rounded-xl`, subtle shadow, hover shows delete icon overlay. Click to select (blue ring). `@dnd-kit/sortable` `SortableContext` wraps the grid for reorder.

Mobile: 2-column grid, no hero sizing.

- [ ] **Step 2: Create palette-row.tsx — palette + fonts horizontal row**

```
PaletteRowProps:
  palette: BoardElement | null  // type === 'palette'
  fonts: BoardElement[]  // type === 'font'
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRemove: (id: string) => void
```

Layout: flex row with `gap-6`. Left: 5 color swatches (`w-12 h-12 rounded-lg`) with hex label below each. Right: 2 font cards showing font name + sample text. Subtle border top and bottom. Mobile: wraps to column (palette above, fonts below).

- [ ] **Step 3: Create notes-section.tsx — notes/extras flex area**

```
NotesSectionProps:
  elements: BoardElement[]  // type === 'text' | 'swatch' | 'image' (uploaded)
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, partial: Partial<BoardElement>) => void
  onRemove: (id: string) => void
```

Layout: `flex flex-wrap gap-3`. Text notes: yellow sticky-note cards, double-click to edit. Swatches: color square + hex. Uploaded images: small thumbnails. Empty state: dashed border with hint text "Add notes, images, or swatches".

- [ ] **Step 4: Create board-sections.tsx — orchestrates all sections**

```
BoardSectionsProps:
  board: Board
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateElement: (id: string, partial: Partial<BoardElement>) => void
  onRemoveElement: (id: string) => void
  onReorderImages: (fromIndex: number, toIndex: number) => void
  onTitleChange: (title: string) => void
```

Layout: `max-w-5xl mx-auto` vertical stack. Board title (editable, `text-2xl font-bold text-white`). Theme subtitle (muted). Then: `<ImageGrid>` → `<PaletteRow>` → `<NotesSection>`. Click on background deselects. Keyboard handler: Delete/Backspace removes selected element.

- [ ] **Step 5: Commit**

```bash
git add tools/mood-board/board-sections.tsx tools/mood-board/sections/
git commit -m "feat(mood-board): add sectioned board layout with image grid, palette row, notes"
```

---

## Task 6: Build the Side Drawer

**Files:**
- Create: `tools/mood-board/side-drawer.tsx`

- [ ] **Step 1: Create side-drawer.tsx — collapsible tools panel**

```
SideDrawerProps:
  open: boolean
  activeSection: 'ai' | 'upload' | 'text' | 'swatch' | 'links' | null
  onToggle: (section: string | null) => void
  onClose: () => void
  // Action callbacks
  onAddMore: (prompt: string) => Promise<void>
  addingMore: boolean
  onUploadImage: (file: File) => void
  onAddTextNote: () => void
  onAddSwatch: (color: string) => void
  paletteColors: string[]  // for cross-tool link
  elementCount: number
  maxElements: number
}
```

**Collapsed state:** `w-12` strip on right edge, `fixed right-0 top-1/3`. 5 icon buttons stacked vertically. Tooltip on hover.

**Expanded state:** `w-72` panel slides out from right, overlays canvas. Backdrop click or Escape to close. Accordion sections — only clicked section expanded.

**Sections:**
- AI Add More: textarea + "Add" button (gradient) + credit badge
- Upload Image: dashed drop zone + browse button (file input `accept="image/*"`)
- Add Text Note: single "Add Note" button
- Add Color Swatch: color input + hex display + "Add to Palette" button
- Cross-tool Links: 3 links to Color Palette, Font Generator, Logo Generator

**Mobile:** `open` prop controls a bottom sheet instead. Slides up from bottom, max-h-[60vh], scrollable, drag handle at top.

- [ ] **Step 2: Commit**

```bash
git add tools/mood-board/side-drawer.tsx
git commit -m "feat(mood-board): add collapsible side drawer with tools panel"
```

---

## Task 7: Update useBoard Hook

**Files:**
- Modify: `tools/mood-board/use-board.ts`

- [ ] **Step 1: Update useBoard to pass mood/color and handle localStorage**

Changes:
1. `generate()` signature: `generate(theme: string, mood: MoodOption, colorPreference: ColorPreference)`
2. Pass `mood` and `colorPreference` in the fetch body to `/api/v1/mood-board/generate`
3. Store `mood` and `colorPreference` on the board state
4. Add `reorderImages(fromIndex: number, toIndex: number)` method — swaps elements by order within the images subset
5. Add localStorage fallback:
   - After generate, if no auth, save board JSON to `localStorage.setItem('mb_draft_board', JSON.stringify(board))`
   - On mount, check `localStorage.getItem('mb_draft_board')` — if found and no board.id, restore it
   - After successful Supabase save (board.id assigned), clear localStorage draft
6. Update `addElement` to set `order` field instead of random `x`/`y`/`rotation`

- [ ] **Step 2: Commit**

```bash
git add tools/mood-board/use-board.ts
git commit -m "feat(mood-board): update useBoard with mood/color, localStorage fallback, reorder"
```

---

## Task 8: Rewrite the Studio Orchestrator

**Files:**
- Modify: `tools/mood-board/mood-board-studio.tsx`
- Modify: `tools/mood-board/board-toolbar.tsx`
- Modify: `app/tools/mood-board/page.tsx`

- [ ] **Step 1: Rewrite mood-board-studio.tsx — wizard → loading → board flow**

Replace entire file. The studio now manages a `view` state:

```typescript
type StudioView = 'wizard' | 'loading' | 'board' | 'my-boards'
```

Flow:
- Default: `'wizard'`
- Wizard `onGenerate` → set `'loading'` → call `board.generate()` → on success set `'board'`
- Toolbar "My Boards" → set `'my-boards'`
- My Boards `onLoadBoard` → set `'board'`

When `view === 'board'`:
- Render `<BoardToolbar>` (sticky top)
- Render `<BoardSections>` (scrollable main)
- Render `<SideDrawer>` (right edge)
- Mobile: FAB "+" button triggers drawer bottom sheet

When `view === 'wizard'`:
- Full-screen `<Wizard>` component

When `view === 'loading'`:
- Full-screen `<LoadingScreen>`

When `view === 'my-boards'`:
- `<BoardToolbar>` + `<MyBoards>` full width

- [ ] **Step 2: Simplify board-toolbar.tsx**

Remove: Studio/My Boards tab switching (now handled by studio view state).
Keep: title display (compact), save status, share button, download dropdown, "My Boards" button (triggers `onViewBoards` callback).
Add: "New Board" button that returns to wizard.

- [ ] **Step 3: Update page.tsx — remove breadcrumb wrapper for wizard**

The breadcrumb should only show when in board view, not during wizard. Move breadcrumb rendering into `mood-board-studio.tsx` conditionally.

```typescript
// app/tools/mood-board/page.tsx
import type { Metadata } from 'next'
import MoodBoardStudio from '@/tools/mood-board/mood-board-studio'

export const metadata: Metadata = {
  title: 'Mood Board Studio — AI Visual Brainstorming | Toolk1t',
  description:
    'Create AI-powered mood boards. Generate images, color palettes, and typography from a theme.',
}

export default function MoodBoardPage() {
  return (
    <main className="flex-1 flex flex-col bg-[#090f16] min-h-screen">
      <MoodBoardStudio />
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add tools/mood-board/mood-board-studio.tsx tools/mood-board/board-toolbar.tsx app/tools/mood-board/page.tsx
git commit -m "feat(mood-board): rewrite studio with wizard → loading → board flow"
```

---

## Task 9: Remove Old Files & Clean Up

**Files:**
- Remove: `tools/mood-board/prompt-panel.tsx`
- Remove: `tools/mood-board/board-canvas.tsx`
- Remove: `tools/mood-board/board-element.tsx`

- [ ] **Step 1: Delete replaced files**

```bash
rm tools/mood-board/prompt-panel.tsx
rm tools/mood-board/board-canvas.tsx
rm tools/mood-board/board-element.tsx
```

- [ ] **Step 2: Verify no remaining imports**

Search for imports of removed files. Fix any remaining references.

```bash
grep -r "prompt-panel\|board-canvas\|board-element" tools/mood-board/ app/tools/mood-board/
```

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Verify no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(mood-board): remove replaced files (prompt-panel, board-canvas, board-element)"
```

---

## Task 10: Database Migration & Deploy

**Files:**
- Create: `supabase/migrations/035_mood_board_redesign.sql`

- [ ] **Step 1: Write and apply migration**

```sql
ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS color_preference TEXT DEFAULT 'surprise';
```

Apply via Supabase MCP tool.

- [ ] **Step 2: Full build verification**

```bash
pnpm build
```

- [ ] **Step 3: Commit migration**

```bash
git add supabase/migrations/035_mood_board_redesign.sql
git commit -m "feat(mood-board): add mood and color_preference columns"
```

- [ ] **Step 4: Deploy (only when user requests)**

```bash
vercel --prod --yes
```

---

## Task Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Update types & mood data | None |
| 2 | Update prompts & API | Task 1 |
| 3 | Build wizard component | Task 1 |
| 4 | Build loading screen | None |
| 5 | Build sectioned board layout | Task 1 |
| 6 | Build side drawer | Task 1 |
| 7 | Update useBoard hook | Tasks 1, 2 |
| 8 | Rewrite studio orchestrator | Tasks 3-7 |
| 9 | Remove old files & clean up | Task 8 |
| 10 | Database migration & deploy | Task 9 |
