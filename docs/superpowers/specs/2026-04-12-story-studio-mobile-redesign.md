# Story Studio Mobile Redesign — Design Spec

**Date:** 2026-04-12
**Status:** Approved
**Scope:** Mobile-only UI overhaul for Story Studio (Quick Mode + Reader + Editor)

---

## Overview

Redesign Story Studio's mobile experience with a dual-track approach: a new mobile-optimized UI layer that shares the existing data/API layer with the desktop version. Desktop UI remains unchanged.

**Two modes:**
- **Quick Mode** (mass users): Gemini-style chat input → auto-generate full picture book (text + illustrations + narration)
- **Advanced Edit Mode** (power users): Bottom-sheet editor for refining text, regenerating illustrations, adjusting narration

**Reference:** Google Gemini Storybook (https://gemini.google.com/gem/storybook)

---

## Architecture

### Routing Strategy

Same URLs, responsive component switching via `useMobileShell()` (767px breakpoint):

```
/tools/story-studio              → Mobile: MobileHome  |  Desktop: StudioShell (unchanged)
/tools/story-studio/book/[slug]  → Mobile: MobileReader |  Desktop: BookReaderClient (unchanged)
```

### Component Layering

```
Shared Layer (unchanged):
├── hooks: use-story-book, use-job-progress, use-bookshelf, use-characters...
├── API: /api/v1/story/*
├── i18n: i18n/en.ts, zh.ts
└── types: types.ts

Mobile UI (new):
├── tools/story-studio/mobile/
│   ├── mobile-home.tsx           — Chat-style home (input + examples + bookshelf grid)
│   ├── mobile-reader.tsx         — Fullscreen swipe page reader
│   ├── mobile-edit-drawer.tsx    — Bottom sheet editor (text/illustration/narration tabs)
│   ├── mobile-progress.tsx       — Fullscreen generation progress
│   ├── mobile-settings-panel.tsx — Collapsible settings panel (style/language/pages)
│   ├── mobile-cover-grid.tsx     — Book cover grid component
│   └── mobile-page-card.tsx      — Single page card (image + text)

Desktop UI (unchanged):
├── tools/story-studio/studio-shell.tsx
├── tools/story-studio/book-viewer.tsx
└── ... (all existing components)
```

### Switching Mechanism

```tsx
const isMobile = useMobileShell()
return isMobile ? <MobileHome /> : <StudioShell>...</StudioShell>
```

---

## Mobile Home (Chat-style Entry + Bookshelf)

### Layout (top to bottom)

1. **Top bar** — Minimal: app name "故事工坊" + language toggle (中文/EN)
2. **Hero area** — Title "想要什么故事？" + subtitle "描述一下，AI帮你画"
3. **Example prompt cards** — 2-column grid, horizontally scrollable. Tap to fill input.
4. **Bookshelf section** — Title "我的绘本 (N)" with "全部→" link. 2-column cover grid, infinite scroll.
5. **Fixed bottom input bar** — Always visible. Text input + send button + ⚙️ settings toggle.
6. **Collapsible settings panel** — Expands above input bar. Options: art style, language, page count. Collapsed by default.

### Interactions

- Example cards tap → auto-fill input box
- Cover grid: long-press → action menu (delete/share/edit)
- In-progress stories show as placeholder covers with circular progress indicator
- No tab navigation — Characters/Series accessible via ⚙️ settings or side drawer
- Input bar follows keyboard (adjusts position when keyboard opens)

---

## Mobile Reader (Fullscreen Swipe)

### Layout

```
┌─────────────────────────┐
│ ← [书名]          [⋯]  │  ← Auto-hiding top bar
├─────────────────────────┤
│                         │
│      ┌───────────┐      │
│      │  插画 60%  │      │  ← Image area (60% height)
│      └───────────┘      │
│                         │
│   叙述文字...            │  ← Text area (40%, scrollable)
│   "对话内容"             │
│        —— 角色名         │
│                         │
├─────────────────────────┤
│ ●○○○○○  ▶播放  📤分享   │  ← Always-visible bottom bar
└─────────────────────────┘
        ← swipe →
```

### Page Types

- **Cover page:** Full-bleed image + title/author overlaid on bottom gradient
- **Content pages:** Image top (60%) + text bottom (40%)
- **Text-only pages:** Centered text with decorative flourishes (for pages without illustrations)

### Interactions

- **Swipe left/right:** Page transition (CSS transform, 300ms ease)
- **Top bar auto-hide:** Hides on scroll down, reappears on tap center or scroll up
- **Bottom bar:** Always visible. Dot indicators (current page highlighted), play button, share button.
- **Play button:** Plays current page narration. On completion, auto-advances to next page.
- **Auto-play mode:** Continuous narration + auto-page-turn (bedtime story mode)
- **⋯ menu:** Edit, Add Illustrations, Add Narration, Export PDF, Delete
- **Image tap:** Opens fullscreen lightbox with pinch-to-zoom
- **Long-press text / ⋯→Edit:** Opens bottom edit drawer for current page

### Technical

- Touch handling: `touch-action: pan-y` + custom touchStart/touchEnd (50px threshold)
- Preload: current page ±1 images with `<Image priority>`
- Audio: reuse existing `audioRef` pattern

---

## Bottom Sheet Editor

### Trigger

- Long-press text area in reader
- ⋯ menu → "编辑此页"
- Opens at 50vh (half screen), draggable to 90vh (full screen)

### Layout

Drag handle at top. Page indicator "第 N 页 / 共 M 页". Three tabs:

| Tab | Content |
|-----|---------|
| **文字** | Editable narrative text field + editable dialogue list + "AI润色" button + "撤销" button + "添加对话" button |
| **插画** | Current illustration preview + "重新生成" button + optional style/prompt adjustment |
| **配音** | Current audio playback + "重新生成" button + narrator voice selection |

### Interactions

- Drag handle: pull down to dismiss (100px threshold), pull up to expand full screen
- AI refine: text shimmer animation → show diff (old → new) → accept or undo
- Illustration regenerate: loading overlay on current image → replace on completion
- Save: closes drawer, refreshes current page in reader
- Scrim overlay behind drawer (tap to dismiss)
- Reuses existing `BottomSheet` component (framer-motion drag)

---

## Generation Progress (Fullscreen)

### Layout

```
┌─────────────────────────┐
│      ✨ 🪄 动画          │  ← Animated magic wand/sparkles
│                         │
│   正在创作你的故事...     │  ← Primary status
│   "趣味提示轮换"         │  ← Rotating fun tips (3s)
│                         │
│   ━━━━━━━━░░░░░  65%    │  ← Progress bar
│                         │
│   📖 写故事  ✅           │
│   🎨 画插画  ⏳ 3/6      │  ← Step breakdown (live)
│   🎙 录配音  ○            │
│                         │
│    [在后台继续]          │  ← Secondary: return to home
└─────────────────────────┘
```

### Behavior

- **Text-only generation** (no illustrations/narration): Magic animation + progress bar only (~1-2 min)
- **Full generation** (with illustrations/narration): Shows step breakdown with live updates (~10-15 min)
- **Completion:** 100% → 1s delay → auto-navigate to reader
- **"在后台继续" button:** Returns to home, bookshelf shows progress placeholder card
- **Failure:** Progress bar turns red + error message + "重试" button, credits auto-refunded
- **Resume:** Page reload auto-detects incomplete jobs, restores progress display

### Bookshelf Progress Placeholder

In-progress stories shown in cover grid as semi-transparent cards with circular progress overlay and percentage.

---

## Data Layer (Zero Changes)

All existing hooks, APIs, and job queue reused without modification:

- `useStoryBook()` — creation flow state
- `useJobProgress()` — generation progress tracking (3s polling + Supabase Realtime)
- `useBookContext()` — book selection
- `useStoriesList()` / `useBookshelf()` — bookshelf data
- `useLanguage()` — i18n (zh/en)
- `useCharacterList()` — character management
- All `/api/v1/story/*` endpoints
- Job queue pipeline (story_bible → story_draft → validate → character_ref → cover → illustrate → tts → save)
- Bulk generate endpoints (bulk-illustrate, bulk-narrate)

---

## New File Inventory

| File | Est. Lines | Purpose |
|------|-----------|---------|
| `mobile-home.tsx` | ~200 | Chat-style home page |
| `mobile-reader.tsx` | ~300 | Fullscreen swipe reader |
| `mobile-edit-drawer.tsx` | ~250 | Bottom sheet editor with 3 tabs |
| `mobile-progress.tsx` | ~150 | Fullscreen generation progress |
| `mobile-settings-panel.tsx` | ~100 | Collapsible settings (style/language/pages) |
| `mobile-cover-grid.tsx` | ~120 | Bookshelf cover grid |
| `mobile-page-card.tsx` | ~80 | Single page card (image + text layout) |

**Modified files:**
- `app/tools/story-studio/page.tsx` — Add `isMobile ? <MobileHome /> : <existing>`
- `app/tools/story-studio/book/[slug]/page.tsx` — Add `isMobile ? <MobileReader /> : <BookReaderClient />`

**No changes to:** Desktop UI components, API endpoints, database schema, job queue.

---

## Out of Scope (Future Iterations)

- Character management mobile UI
- Series management mobile UI
- Desktop UI changes
- New API endpoints
- Database schema changes
- Offline support / PWA enhancements
