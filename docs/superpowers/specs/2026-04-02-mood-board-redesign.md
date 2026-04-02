# Mood Board Redesign — Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Scope:** Full UX redesign + functional fixes for the Mood Board tool

---

## Overview

Replace the current blank-canvas + sidebar layout with a guided wizard → sectioned board experience. Target both non-designers (approachable, hand-holding) and designers (polished output, fast workflow).

## 1. Wizard Flow (New Entry Point)

Replaces the blank canvas landing. Three steps, full-screen centered.

### Step 1 — Theme
- Large heading: "What's your mood board for?"
- Textarea input, placeholder examples ("A cozy autumn wedding", "Modern tech startup branding")
- "Next" button, disabled until 3+ characters
- Below input: "Or start from a template" link → template gallery (Wedding, Brand Identity, Interior Design, Fashion, Food & Drink, Travel)
- Template selection pre-fills the theme and skips to Step 3

### Step 2 — Visual Mood
- Heading: "Pick a vibe"
- 6-8 mood cards in a grid: Cozy, Bold, Elegant, Playful, Minimal, Vintage, Luxurious, Natural
- Each card: thumbnail image + label
- Single-select with highlighted ring on selected card
- "Back" and "Next" buttons

### Step 3 — Color Preference (skippable)
- Heading: "Any color direction?"
- 4 pill buttons: Warm / Cool / Neutral / "Surprise me" (default selected)
- "Skip" link below
- "Generate Board" button (gradient, prominent)

### Loading State
- Full-screen with animated progress steps:
  - "Generating images..." → "Creating palette..." → "Picking fonts..." → "Arranging board..."
- Skeleton grid preview fills in as images arrive
- Estimated 10-15 seconds total

### State Management
- Wizard state held in local component state (not persisted)
- On "Generate Board": POST to `/api/v1/mood-board/generate` with `{ theme, mood, colorPreference }`
- Response returns `boardId` + `elements` array → transitions to board canvas view

### Returning Users
- If user has existing boards, show "My Boards" link in wizard header
- Wizard is always the entry point for new boards (no direct canvas landing)

## 2. Sectioned Board Canvas

Replaces the freeform dot-grid canvas. All elements auto-arranged in structured sections.

### Layout (top to bottom)

**Board Header**
- Editable title inline (`text-2xl font-bold`, click to edit)
- Theme subtitle below in muted text

**Toolbar Strip** (sticky top of canvas area)
- Left: Board title (compact, read-only — full title in header below)
- Right: Save status (green dot + "Saved"), Share button, Download dropdown (PNG/PDF), My Boards button

**Image Grid Section**
- CSS masonry-style grid (CSS `columns` or grid with `grid-row: span 2` for hero images)
- 6-8 AI-generated images from wizard
- 2 images sized larger (hero), rest standard
- Rounded corners (`rounded-xl`), subtle shadow
- Hover: shows delete icon overlay
- Click: opens lightbox/zoom view
- Drag-to-reorder within the grid (swap positions)

**Palette + Fonts Row**
- Full-width horizontal section with subtle top/bottom borders
- Left half: 5 color swatches as rounded squares (~48x48) with hex labels below each
- Right half: 2 font cards showing font name + sample text rendered in that font
- Visual separator between palette and fonts

**Notes & Extras Section**
- Flex-wrap container for: text notes (sticky-note style), uploaded images, extra swatches
- New manually-added elements appear here
- Empty state: subtle dashed border with "Add notes, images, or swatches" hint text

### Element Interactions
- Click element → blue ring outline + contextual action bar (delete, move up/down in order)
- No freeform positioning — elements reorder within their section only
- Text notes: click to select, double-click to edit inline
- Delete: red X on selected element, or Delete/Backspace key

### Board Sizing
- Max width: `max-w-5xl` centered
- Sections have consistent horizontal padding (`px-4 md:px-8`)
- Scrolls vertically (no infinite canvas)

## 3. Collapsible Side Drawer (Tools Panel)

Replaces the fixed left sidebar.

### Collapsed State (default)
- Thin icon strip (`w-12`, 48px) pinned to right edge of canvas
- Icons stacked vertically with tooltips on hover:
  - Sparkle — AI Add More
  - Image — Upload Image
  - Text — Add Text Note
  - Palette — Add Color Swatch
  - Link — Cross-tool Links

### Expanded State
- Click any icon → panel slides out to `w-72` (280px), overlaying canvas (not pushing)
- Clicked section auto-expanded, others collapsed (accordion)
- Close: X button, click outside, or Escape key

### Drawer Sections

**AI Add More** (1 credit)
- Text input: "What should I add?"
- "Add" button (gradient)
- Credit badge showing cost
- Generated elements auto-placed into appropriate board section (images → grid, colors → palette)

**Upload Image**
- Drop zone with dashed border + browse button
- Accepts `image/*`
- Uploaded image added to Image Grid section

**Add Text Note**
- One-click "Add Note" button
- Creates new sticky note in Notes section with placeholder text
- Focus immediately for editing

**Add Color Swatch**
- Color picker input + hex display
- "Add to Palette" button
- Appends to the Palette row

**Cross-tool Links**
- "Open in Color Palette" — passes current palette hex values via URL hash
- "Open in Font Generator" — link only (no pre-fill)
- "Open in Logo Generator" — link only (no pre-fill)

### Mobile Behavior
- Icon strip hidden on mobile
- FAB "+" button (bottom-right, existing) triggers bottom sheet
- Bottom sheet contains same drawer sections as vertical list
- Max height: 60vh, scrollable, drag handle at top

## 4. Functional Fixes

### Generation Quality
- Pass `mood` and `colorPreference` from wizard into Gemini prompt templates
- Update `lib/mood-board/prompts.ts` to accept and use new parameters
- On partial image failure: show placeholder card with "Retry" button instead of silently omitting
- Loading state: skeleton grid with shimmer animation, items fill in as they complete

### Canvas Interactions
- Remove `react-draggable` and `react-resizable` dependencies from mood board components
- Images: CSS grid with drag-to-reorder (use HTML drag and drop API or a lightweight library like `@dnd-kit/core`)
- Notes: flex-wrap container, drag-to-reorder within section
- No freeform positioning — structured sections only
- Element selection: click → blue outline ring + action buttons appear above element

### Authentication & Persistence
- `/api/v1/mood-board/generate`: allow unauthenticated calls
- Unauthenticated users: board saved to `localStorage` key `mb_draft_board`
- When user tries Share or My Boards: show sign-in prompt
- After sign-in: migrate `localStorage` board to Supabase via `/api/v1/mood-board/save`
- Authenticated users: auto-save to Supabase (existing 2s debounce, keep as-is)

### Mobile Experience
- Wizard steps: naturally full-screen, stack vertically — no changes needed
- Board sections: single column stack (images → palette+fonts → notes)
- Palette+fonts row wraps to vertical on mobile (palette above, fonts below)
- FAB "+" → bottom sheet tools drawer
- No canvas zoom/pan needed — natural vertical scroll

### Export Improvements
- PNG export: add option for white background (in addition to current dark)
- Include board title + theme as header text in exported image
- PDF: keep existing landscape orientation

## 5. File Changes Summary

### New Files
- `tools/mood-board/wizard.tsx` — 3-step wizard component
- `tools/mood-board/board-sections.tsx` — sectioned board layout (image grid, palette row, notes)
- `tools/mood-board/side-drawer.tsx` — collapsible tools drawer
- `tools/mood-board/image-grid.tsx` — masonry image grid with drag-to-reorder
- `tools/mood-board/palette-row.tsx` — palette + fonts horizontal row

### Modified Files
- `tools/mood-board/mood-board-studio.tsx` — orchestrate wizard → board transition
- `tools/mood-board/use-board.ts` — add `mood` and `colorPreference` to state, localStorage fallback
- `tools/mood-board/types.ts` — add `mood`, `colorPreference` to Board type
- `tools/mood-board/board-toolbar.tsx` — simplify, remove sidebar toggle
- `tools/mood-board/my-boards.tsx` — keep as-is, accessed from toolbar
- `app/api/v1/mood-board/generate/route.ts` — accept `mood` + `colorPreference` params, allow unauth
- `lib/mood-board/prompts.ts` — incorporate mood/color into prompt templates
- `lib/mood-board/gemini.ts` — pass updated prompts

### Removed Files
- `tools/mood-board/prompt-panel.tsx` — replaced by wizard + side drawer
- `tools/mood-board/board-canvas.tsx` — replaced by board-sections.tsx
- `tools/mood-board/board-element.tsx` — element renderers moved into section-specific components

### Dependencies
- Remove: `react-draggable`, `react-resizable` (from mood board usage only — check if other tools use them)
- Add: `@dnd-kit/core` + `@dnd-kit/sortable` (lightweight drag-to-reorder, if not already installed)

## 6. Database Changes

### Migration: Add mood + color_preference columns
```sql
ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE mood_boards ADD COLUMN IF NOT EXISTS color_preference TEXT DEFAULT 'surprise';
```

No breaking changes — existing boards work with null mood/color_preference.

## 7. Out of Scope (Future)

- Real-time collaboration
- Template marketplace
- Board duplication/forking
- Share link revocation
- Infinite zoom/pan canvas
- Vector editing
- Font size picker in text notes
