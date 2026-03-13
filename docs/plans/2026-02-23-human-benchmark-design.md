# Human Benchmark — Design Document

**Date:** 2026-02-23
**Tool:** human-benchmark
**Route:** `/tools/human-benchmark`
**Design reference:** `designs/13.HumanBenchmark/` (screen.png = dashboard, screen_1.png = test view, code.html = reference implementation)

## Overview

A single-page tool with 8 cognitive tests that measure reaction time, memory, aim, typing speed, and pattern recognition. Users access a dashboard showing all tests, pick one, play within a page-integrated layout (NOT full-screen takeover), and see results with localStorage-persisted scores.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Structure | Single tool with internal dashboard | Keeps tools listing clean; one entry point |
| Architecture | State machine in page.tsx | Matches ecard-studio pattern; simplest approach |
| Persistence | localStorage | No backend needed; survives refresh |
| Test UI style | **Page-integrated with colored game card** | Per design: test lives within page layout, game area is a large bordered card with colored bg. Nav bar stays visible with "Back to dashboard" button |
| Card style | **Bordered cards, NOT glass morphism** | Per design: `bg-white dark:bg-slate-900` with `border-slate-800 rounded-xl` borders. Hover: border turns primary, shadow appears, icon scales up |
| Scope | All 8 tests in one cycle | Complete feature from day one |

## Dashboard (per design: screen.png)

**Route:** `/tools/human-benchmark`

**Layout (top to bottom):**
1. **Stats hero card** — bordered card with:
   - Brain icon in primary circle (left)
   - "Human Benchmark" title + "Cognitive Testing Dashboard" subtitle
   - Stats: Tests completed count, Total attempts count
   - No user/auth features (we skip those — no backend)

2. **Section heading** — "Cognitive Assessment Modules" with grid_view icon, left-aligned

3. **4x2 test card grid** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6`

**Test card design (per design — NOT glass morphism):**
```
┌─────────────────────────┐
│  ┌──────┐               │
│  │ icon │  (tinted bg)  │
│  └──────┘               │
│                         │
│  **Test Name**          │
│  Description text       │
│  leading-relaxed        │
│                         │
│  LAST SCORE    192MS    │
│  ┌─────────────────┐   │
│  │   Start Test     │   │
│  └─────────────────┘   │
└─────────────────────────┘
```

- Card: `bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800`
- Hover: `hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5`
- Icon box: `size-12 rounded-lg` with **tinted background** (e.g. `bg-blue-900/30 text-blue-400`)
- Icon scales on hover: `group-hover:scale-110 transition-transform`
- Last score row: `text-[10px] uppercase font-bold tracking-widest` — label left, score value right in primary color
- Start Test button: `bg-slate-100 dark:bg-slate-800 rounded-lg` → turns `bg-primary text-white` on card hover

**Icon tint colors per test:**

| Test | Icon | Tint bg (dark) | Tint text (dark) |
|------|------|----------------|------------------|
| Reaction Time | bolt | `bg-blue-900/30` | `text-blue-400` |
| Sequence Memory | reorder | `bg-purple-900/30` | `text-purple-400` |
| Aim Trainer | target | `bg-red-900/30` | `text-red-400` |
| Number Memory | pin | `bg-amber-900/30` | `text-amber-400` |
| Verbal Memory | translate | `bg-emerald-900/30` | `text-emerald-400` |
| Chimp Test | pets | `bg-orange-900/30` | `text-orange-400` |
| Visual Memory | grid_on | `bg-cyan-900/30` | `text-cyan-400` |
| Typing | keyboard | `bg-indigo-900/30` | `text-indigo-400` |

Note: We use Heroicons SVGs (matching existing tool patterns) instead of Material Symbols. The icon names above are conceptual — implement as inline SVGs.

## Test View Layout (per design: screen_1.png)

When a test is selected, the view switches to a **page-integrated layout** (NOT full-screen takeover):

**Layout (top to bottom):**

1. **Test nav bar** — sticky top bar with:
   - Test icon (tinted) + "Human Benchmark" label (left)
   - "Dashboard" link + "Back to dashboard" button (right)

2. **Test header** — centered:
   - `<h1>` Test name + "Test" (e.g. "Reaction Time Test")
   - Subtitle with instructions

3. **Game card** — large bordered card (`rounded-xl`) with:
   - Colored background matching test state (e.g. red for waiting, green for ready)
   - Game content centered inside
   - Attempt counter badge in top-right corner (e.g. "ATTEMPT 4/5")
   - Min height ~350-400px

4. **Stats row** — 3 stat cards below game area:
   - Average score (icon + label + value)
   - Personal Best (icon + label + value)
   - Attempts count (icon + label + value)
   - Each: `bg-white dark:bg-slate-900 rounded-xl border p-4`

5. **Recent Results table** — bordered card with:
   - Heading: "Recent Results" + "Clear History" link
   - Table: Attempt # | Score | Date/Time | Status badge
   - Status badges: "FASTEST"/"AVERAGE"/"NORMAL" etc.

6. **Tips card** (optional per test) — info box with improvement tips

## Shared Test Flow

Every test follows 3 phases within the game card:

### Phase 1 — Ready (inside game card)
- Game card shows colored bg with icon + instruction text
- "Click to start" or implicit (e.g. clicking the card area)

### Phase 2 — Active (inside game card)
- Game-specific UI renders inside the card
- Stats row + recent results table below are visible and update live

### Phase 3 — Complete (inside game card)
- Game card shows result (e.g. "213 ms")
- Score auto-saved to localStorage
- Stats row updates with new values
- Recent results table adds new entry
- "Try Again" action to replay

## Individual Test Mechanics

(Unchanged from previous — same game logic)

### 1. Reaction Time
- **Game card states:** `waiting` (red bg, "WAIT FOR GREEN") → `ready` (green bg, "CLICK!") → `result` (blue bg, score)
- **Mechanic:** Random delay 1-5s before green. Click measures latency. Click during red = "Too early! Clicking too early results in a penalty"
- **Score:** Milliseconds (lower is better). Best of 5 attempts.
- **Attempt badge:** "ATTEMPT 4/5" in top-right of game card

### 2. Sequence Memory
- **UI:** 3x3 grid (grows to 4x4 at level 9+) inside game card
- **Mechanic:** Squares flash in sequence; user repeats. +1 per level. Wrong tap = game over.
- **Score:** Highest level reached.

### 3. Aim Trainer
- **UI:** Large game card area with circular targets at random positions
- **Mechanic:** 30 targets, one at a time. Timer runs from first click. Target ~80px.
- **Score:** Average ms per target (lower is better).

### 4. Number Memory
- **UI:** Large number displayed in game card → input field below
- **Mechanic:** Number shown ~1s per digit. Starts at 1 digit, +1 per level. Wrong = game over. Shows correct vs. entered on fail.
- **Score:** Highest digit count reached.

### 5. Verbal Memory
- **UI:** Word in game card + "SEEN" / "NEW" buttons
- **Mechanic:** Words shown one at a time. 3 lives. ~100-word base pool, words repeat randomly.
- **Score:** Total correct answers before losing all lives.

### 6. Chimp Test
- **UI:** Grid with numbered squares in game card
- **Mechanic:** Numbers 1-N shown, then hidden. Click in ascending order. Starts at 4, +1 per level. 3 strikes = game over.
- **Score:** Highest level reached.

### 7. Visual Memory
- **UI:** Grid (starts 3x3, grows each level) in game card
- **Mechanic:** Some squares flash white briefly. Click the ones that flashed. Grid/count grow. 3 lives.
- **Score:** Highest level reached.

### 8. Typing Test
- **UI:** Text passage in game card + input area. Real-time WPM counter.
- **Mechanic:** Type displayed paragraph. Green = correct, red = error. Timer from first keystroke.
- **Score:** WPM + accuracy percentage.

## File Structure

```
app/tools/human-benchmark/
├── page.tsx                    # View state machine (dashboard | test)
├── layout.tsx                  # Metadata + JSON-LD (NO viewport lock — not full-screen)

tools/human-benchmark/
├── types.ts                    # TestType enum, Score interfaces, TestConfig
├── constants.ts                # Test configs (name, icon, color, description)
├── dashboard.tsx               # Dashboard: stats hero + test card grid
├── test-card.tsx               # Individual test card for dashboard
├── test-view.tsx               # Test page layout (nav bar + game card + stats + history)
├── game-card.tsx               # The colored game area card (replaces test-wrapper)
├── stat-cards.tsx              # Stats row (average, personal best, attempts)
├── results-table.tsx           # Recent results table with history
├── use-test-scores.ts          # localStorage hook for scores
├── tests/
│   ├── reaction-time.tsx
│   ├── sequence-memory.tsx
│   ├── aim-trainer.tsx
│   ├── number-memory.tsx
│   ├── verbal-memory.tsx
│   ├── chimp-test.tsx
│   ├── visual-memory.tsx
│   └── typing-test.tsx
└── data/
    ├── words.ts                # Word list for verbal memory
    └── typing-passages.ts      # Text passages for typing test

e2e/
└── human-benchmark.spec.ts     # E2E tests
```

## Shared Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `test-view.tsx` | Full test page layout (nav + game + stats + history) | `testId`, `config`, `children` (game content), `onBack` |
| `game-card.tsx` | Colored game area card | `bgColor`, `children`, `badge?` |
| `stat-cards.tsx` | 3-card stats row | `average?`, `best?`, `attempts` |
| `results-table.tsx` | Recent results table | `history: ScoreEntry[]`, `unit`, `onClear` |
| `test-card.tsx` | Dashboard test card | `test: TestConfig`, `score?`, `onClick` |
| `use-test-scores.ts` | Score persistence | Returns `{ getScore, saveScore, scores }` |

## Data Flow

```
page.tsx (state: currentView)
  ├── dashboard.tsx
  │     ├── stats hero (tests completed, total attempts)
  │     └── test-card.tsx × 8 (reads scores via useTestScores)
  └── test-view.tsx (nav bar, layout)
        ├── game-card.tsx (colored game area)
        │     └── <ActiveTest> (test-specific gameplay)
        ├── stat-cards.tsx (average, personal best, attempts)
        └── results-table.tsx (recent results with clear history)
```

## localStorage Schema

```typescript
interface StoredScores {
  [testId: string]: {
    best: number
    history: { score: number; date: string }[]
    attempts: number
  }
}
// Key: "human-benchmark-scores"
```

## Accessibility

- All interactive elements 44px+ touch targets
- Keyboard accessible: Enter/Space to start, Escape to return to dashboard
- Focus management between states
- Screen reader announcements for state transitions
- Reduced motion: skip animations when `prefers-reduced-motion` is set
- High contrast colors meet WCAG 2.1 AA (4.5:1 text ratio)

## SEO

- Title: "Human Benchmark - Brain Games & Cognitive Tests"
- JSON-LD: WebApplication schema
- Breadcrumbs: Home → Tools → Human Benchmark
