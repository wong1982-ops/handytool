# Mood Board Studio — Design Specification

## Overview

AI-powered mood board tool with freeform canvas. User provides a theme, AI generates a complete starter board (images, color palette, typography suggestions), then user can add more elements via iterative prompts, drag/resize/arrange freely, and export as PNG/PDF or share via public link. Cross-tool integration with Color Palette and Font Generator.

## User Experience

Single-page split layout: prompt/generation panel on the left, freeform canvas on the right. AI generates a starter board, elements appear on the canvas, user arranges them. Iterative prompts add more elements.

## Page Layout

### Desktop (md+)
```
┌──────────────────────────────────────────────────────┐
│  Mood Board Studio          [My Boards] [Share] [⬇]  │
├────────────────┬─────────────────────────────────────┤
│  Prompt Panel  │                                     │
│  (w-80)        │         Freeform Canvas             │
│                │                                     │
│  [Theme input] │    ┌──────┐  ┌────┐  ┌──────┐      │
│  [Generate]    │    │ img  │  │ img│  │ img  │      │
│                │    └──────┘  └────┘  └──────┘      │
│  Board Elements│       ┌──────────┐                  │
│  - Images (8)  │       │ palette  │  ┌────┐         │
│  - Palette     │       └──────────┘  │font│         │
│  - Fonts       │                     └────┘         │
│                │                                     │
│  [+ Add more]  │                                     │
│  (1 credit)    │                                     │
│                │                                     │
│  Cross-tool:   │                                     │
│  [→ Colors]    │                                     │
│  [→ Fonts]     │                                     │
└────────────────┴─────────────────────────────────────┘
```

### Mobile
Prompt panel as collapsible bottom sheet. Canvas fills screen. Floating "+" button opens prompt sheet.

## Generation

### Initial Generation (Free)
User types a theme (e.g., "cozy autumn bookstore brand"). AI generates:
- **6-8 mood images** — Gemini parallel calls
- **Color palette** — 5 AI-suggested colors rendered as a draggable swatch card
- **Typography suggestions** — 2-3 Google Font pairings (heading + body) as draggable text cards

All elements auto-placed on canvas in a scattered organic layout (slight random rotation, not a rigid grid).

### "Add More" Iterations (1 credit each)
User types follow-up prompts:
- "add some texture samples" → 3-4 texture images
- "more earthy tones" → 3-4 images with shifted color direction
- "suggest fonts for headers" → 2 more font pairings

New elements appear alongside existing ones.

### Manual Additions (Free, no AI)
- **Text note** — sticky note style, editable, draggable
- **Upload image** — drag-drop/file picker, appears on canvas
- **Color swatch** — manual color picker, adds swatch card

## Canvas Elements

### Element Types

| Type | Appearance | Default Size | Resizable |
|------|-----------|-------------|-----------|
| `image` | Rounded-lg, subtle shadow, white border | 200x200 | Yes |
| `palette` | Row of 5 color circles with hex labels | 250x60 | No (fixed) |
| `swatch` | Single color square with hex label | 80x80 | Yes |
| `font` | Font name + sample text in that font | 220x80 | Yes (width) |
| `text` | Sticky note, editable text | 160x100 | Yes |

### Interactions
- **Drag**: click and drag to reposition
- **Resize**: corner/edge handles on resizable elements
- **Select**: click for blue outline + delete button
- **Delete**: X button or Delete/Backspace key
- **Double-click text**: inline edit mode
- **Z-order**: selected element moves to front

### Board State (JSON)
```ts
interface BoardElement {
  id: string
  type: 'image' | 'palette' | 'swatch' | 'font' | 'text'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  data: ImageData | PaletteData | SwatchData | FontData | TextData
}
```

### Limits
- Max 30 elements per board
- Images resized to max 800px on canvas (full-res in R2 for export)

## Cross-Tool Integration

- **"Open in Color Palette"** — encodes palette as URL hash (`#hex1-hex2-hex3-hex4-hex5`), opens Color Palette tool
- **"Open in Font Generator"** — opens Font Generator with pre-filled style prompt via URL query param
- **"Open in Logo Generator"** — opens Logo Generator with theme + palette pre-populated

## Export & Sharing

### Export (Free)
- **PNG** — `html-to-image` captures canvas as PNG
- **PDF** — same capture + `jspdf` single-page landscape PDF with title

### Shareable Link (Free)
- POST board state JSON to `/api/v1/mood-board/share`
- Returns UUID, public URL: `/tools/mood-board/view/[id]`
- Read-only rendered view from JSON snapshot
- No revocation in v1 (board delete → 404)

## File Structure

| File | Purpose |
|------|---------|
| `tools/mood-board/types.ts` | Types, element interfaces, board state, constants |
| `tools/mood-board/use-board.ts` | Custom hook: board state, auto-save, element CRUD |
| `tools/mood-board/prompt-panel.tsx` | Left panel: theme, generate, add more, cross-tool links |
| `tools/mood-board/board-canvas.tsx` | Freeform canvas with draggable/resizable elements |
| `tools/mood-board/board-element.tsx` | Individual element renderer |
| `tools/mood-board/board-toolbar.tsx` | Top bar: name, My Boards, Share, Download |
| `tools/mood-board/my-boards.tsx` | History: user's saved boards |
| `tools/mood-board/mood-board-studio.tsx` | Main orchestrator |
| `app/tools/mood-board/page.tsx` | Page route with metadata |
| `app/tools/mood-board/view/[id]/page.tsx` | Public shared board view |
| `app/api/v1/mood-board/generate/route.ts` | Initial generation |
| `app/api/v1/mood-board/add-more/route.ts` | Iterative generation (1 credit) |
| `app/api/v1/mood-board/save/route.ts` | Auto-save board state |
| `app/api/v1/mood-board/share/route.ts` | Create shareable snapshot |
| `app/api/v1/mood-board/history/route.ts` | Fetch user's boards |
| `app/api/v1/mood-board/[id]/route.ts` | Fetch single board (shared view) |
| `lib/mood-board/prompts.ts` | Prompt templates |
| `supabase/migrations/029_mood_boards.sql` | DB table + RLS |

## API Design

### POST /api/v1/mood-board/generate
- Auth: Not required (free)
- Input: `{ theme }`
- Output: `{ boardId, elements: BoardElement[] }`

### POST /api/v1/mood-board/add-more
- Auth: Required
- Credits: 1
- Input: `{ boardId, prompt, existingTheme }`
- Output: `{ elements: BoardElement[] }`

### POST /api/v1/mood-board/save
- Auth: Required
- Input: `{ boardId, title, theme, elements }`
- Output: `{ success: true }`

### POST /api/v1/mood-board/share
- Auth: Required
- Input: `{ boardId }`
- Output: `{ shareId, shareUrl }`

### GET /api/v1/mood-board/history
- Auth: Required
- Output: `{ entries: Board[] }`

### GET /api/v1/mood-board/[id]
- Auth: Not required (public if shared)
- Output: `{ board: Board }`

## Data Model

### `mood_boards` table

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL
title           TEXT NOT NULL DEFAULT 'Untitled Board'
theme           TEXT
elements        JSONB NOT NULL DEFAULT '[]'
shared          BOOLEAN DEFAULT false
share_id        UUID UNIQUE
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

- RLS: owner reads/updates own boards. Anyone reads where `shared = true`.
- `elements` is the full board state as JSON array.

## Credit Model

| Operation | Cost |
|-----------|------|
| Initial board generation (6-8 images + palette + fonts) | Free |
| "Add more" iterative generation | 1 credit |
| Manual additions (text, upload, swatch) | Free |
| Drag/resize/arrange | Free |
| Download PNG | Free |
| Download PDF | Free |
| Shareable link | Free |

## Dependencies

- `react-draggable` — drag positioning
- `react-resizable` — resize handles
- `html-to-image` — DOM-to-PNG capture
- `jspdf` — client-side PDF generation

## Edge Cases

- **Partial generation failure**: Show succeeded images + "failed" placeholders
- **Element limit**: Max 30, show message when full
- **Unauthenticated users**: Board in localStorage only, no save/share. Prompt to sign in.
- **Auto-save**: Debounced 2s, every element change
- **Export CORS**: R2 images same-origin. Fallback to base64 if needed.
- **Mobile drag**: react-draggable supports touch natively. 44px min touch targets.
- **Share revocation**: None in v1. Delete board → shared link 404.

## Non-Goals (v1)

- Real-time collaboration
- Infinite zoom/pan canvas
- Vector editing
- Template marketplace
- Board duplication/forking
- Live synced shared links

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Visual mood board + freeform canvas | Design brief, collections | AI generation + manual arrangement |
| 2 | Hybrid generation (one-shot + iterative) | One-shot, iterative only | Complete starter, then refine |
| 3 | react-draggable + react-resizable | DOM, Canvas 2D, tldraw | Lightweight, React-native |
| 4 | Images + colors + text + cross-tool links | Images only | Ecosystem synergy |
| 5 | PNG + PDF + shareable link | PNG only | Maximum sharing |
| 6 | First gen free, 1 credit per "add more" | All free, per download | Adoption + monetization |
| 7 | Static JSON snapshot sharing | Live link | Simple, reliable |
| 8 | Split panel layout | Wizard, canvas-first | Structure + immediacy |
| 9 | Auto-save debounced 2s | Manual save | No data loss |
| 10 | Max 30 elements | Unlimited | Performance |
| 11 | html-to-image + jspdf | Server rendering | Client-side, no server dep |
| 12 | localStorage for unauth | Auth required | Let anyone try |
