# Human Benchmark — Enhancements & 8 New Tests Design

**Date:** 2026-03-02
**Status:** Approved
**Scope:** Fix Rhythm Test + add 4 audio games + add 4 new cognitive tests (12 → 20 tests total)

---

## Overview

Three workstreams combined into one design:

| # | Item | Type | TestId | Color |
|---|------|------|--------|-------|
| — | **Rhythm Test fix** | Fix | `rhythm-test` | `#8b5cf6` |
| — | **Name fix** | Fix | all affected | — |
| 1 | Interval Recognition | New Audio | `interval-recognition` | `#14b8a6` |
| 2 | Chord Identification | New Audio | `chord-identification` | `#ec4899` |
| 3 | Tone Memory | New Audio | `tone-memory` | `#10b981` |
| 4 | Higher or Lower | New Audio | `higher-or-lower` | `#0ea5e9` |
| 5 | Stroop Test | New Cognitive | `stroop-test` | `#f97316` |
| 6 | Quick Math | New Cognitive | `quick-math` | `#6366f1` |
| 7 | Word Scramble | New Cognitive | `word-scramble` | `#a855f7` |
| 8 | Tracking Test | New Cognitive | `tracking-test` | `#ef4444` |

---

## Fix 1: Naming Bug

`test-view.tsx:83` renders `{config.name} Test`. The Rhythm Test config has `name: "Rhythm Test"` which produces "Rhythm Test Test".

**Fix:** Rename config name from `"Rhythm Test"` to `"Rhythm"`. Audit all other configs to ensure none end with "Test":
- Current configs that need renaming: `"Rhythm Test"` → `"Rhythm"`
- All other existing configs are fine (Reaction Time, Sequence Memory, etc.)

---

## Fix 2: Rhythm Test Revamp

### Current Problems
- Only 3 fixed rounds (easy → medium → hard)
- 15 static patterns — feels repetitive
- Score = average accuracy % — inconsistent with other level-based tests

### New Design

**Progression:** Endless levels, 3 lives, level-based scoring (consistent with all other tests).

**Random Pattern Generation:**

| Levels | Beats | Spacing | Generation |
|--------|-------|---------|------------|
| 1-3 | 4 | Even quarter-note spacing (400-600ms) with ±10% jitter | Random base tempo 400-600ms |
| 4-6 | 5-6 | Mixed spacing, some eighth notes | Mix of quarter + eighth note durations |
| 7-9 | 6-7 | Syncopated, off-beats | Random durations from [200, 333, 500, 750]ms pool |
| 10+ | 7-8 | Complex, triplets, tight clusters | All durations including 150ms, high variance |

**Algorithm for random generation:**
```
function generatePattern(level):
  beatCount = 4 + floor(min(level, 8) / 2)
  baseTempo = max(250, 600 - level * 30)  // gets faster
  jitter = min(0.4, 0.1 + level * 0.03)   // more variation

  beats = [0]
  for i in 1..beatCount-1:
    gap = baseTempo * (1 + random(-jitter, jitter))
    gap = max(150, gap)  // minimum gap
    beats.push(beats[i-1] + gap)
  return beats
```

**Scoring:**
- Tolerance window: ±200ms (same as before)
- Correct round: accuracy ≥ 60% → advance, accuracy < 60% → lose 1 life
- Score = level reached
- `lowerIsBetter: false`, `unit: 'level'`

**Data changes:**
- Keep existing `rhythms.ts` patterns as reference/fallback
- Add `generateRandomPattern(level)` function

---

## New Test 5: Stroop Test (色彩干扰测试)

**TestId:** `stroop-test`
**Color:** Orange `#f97316`
**Icon:** Eye / palette

### Gameplay

1. **Intro** — "Name the ink color, not the word" with eye emoji
2. **Playing** — A color word (e.g., "BLUE") displayed in a different ink color (e.g., red). 4 color buttons below.
3. **Answer** — Tap the button matching the INK COLOR (not the word). Timer per question decreases with level.
4. **Feedback** — Correct = green flash + advance. Wrong or timeout = lose 1 life (3 lives).
5. **Result** — Score = highest level reached.

### Progression

| Levels | Time Limit | Word Pool |
|--------|-----------|-----------|
| 1-3 | 3 seconds | 4 colors (Red, Blue, Green, Yellow) |
| 4-6 | 2 seconds | 6 colors (add Purple, Orange) |
| 7+ | 1.5 seconds | 6 colors, more conflict (word never matches color) |

### Technical

- **Colors**: Red (#ef4444), Blue (#3b82f6), Green (#22c55e), Yellow (#eab308), Purple (#a855f7), Orange (#f97316)
- **Conflict generation**: Word is always a different color name from the ink color
- **Timer**: Visual countdown bar that shrinks. Timeout = wrong answer.
- **Scoring:** `lowerIsBetter: false`. Score = level.

---

## New Test 6: Quick Math (速算测试)

**TestId:** `quick-math`
**Color:** Indigo `#6366f1`
**Icon:** Calculator / hash

### Gameplay

1. **Intro** — "Solve equations as fast as you can" with calculator emoji
2. **Playing** — Equation displayed (e.g., "7 + 5 = ?"). 4 answer buttons.
3. **Answer** — Tap correct answer. Timer per question.
4. **Feedback** — Correct = advance. Wrong/timeout = lose 1 life (3 lives).
5. **Result** — Score = highest level reached.

### Progression

| Levels | Operations | Range | Time |
|--------|-----------|-------|------|
| 1-3 | + only | 1-10 | 5s |
| 4-6 | +, - | 1-20 | 4s |
| 7-9 | +, -, × | 1-12 for × | 4s |
| 10+ | +, -, ×, ÷ | larger numbers | 3s |

### Technical

- **Equation generation**: Random operands + operation based on level. Ensure integer results for division.
- **Distractor generation**: 3 wrong answers near the correct one (±1 to ±5 range). No duplicates.
- **Timer**: Visual bar countdown.
- **Scoring:** `lowerIsBetter: false`. Score = level.

---

## New Test 7: Word Scramble (单词拼写)

**TestId:** `word-scramble`
**Color:** Purple `#a855f7`
**Icon:** Text / shuffle

### Gameplay

1. **Intro** — "Unscramble the word" with shuffle emoji
2. **Playing** — Scrambled word displayed in large text (e.g., "ELPPA"). Text input field below.
3. **Answer** — Type the correct word and press Enter. Timer per word.
4. **Feedback** — Correct = advance. Wrong/timeout = lose 1 life (3 lives).
5. **Result** — Score = highest level reached.

### Progression

| Levels | Word Length | Time | Word Source |
|--------|-----------|------|-------------|
| 1-3 | 4 letters | 15s | Common words (apple, house, water...) |
| 4-6 | 5-6 letters | 12s | Medium words (bridge, garden, planet...) |
| 7-9 | 6-7 letters | 10s | Harder words (circuit, abstract, journey...) |
| 10+ | 7-8 letters | 8s | Advanced words (elephant, discover, treasure...) |

### Technical

- **Word list**: ~200 common English words organized by length. Stored in `data/words.ts`.
- **Scramble algorithm**: Fisher-Yates shuffle of characters. Ensure scrambled ≠ original.
- **Input**: Single text input, auto-focused. Case-insensitive comparison.
- **Timer**: Visual countdown bar.
- **Scoring:** `lowerIsBetter: false`. Score = level.

---

## New Test 8: Tracking Test (追踪测试)

**TestId:** `tracking-test`
**Color:** Red `#ef4444`
**Icon:** Crosshair / cursor

### Gameplay

1. **Intro** — "Keep your cursor on the moving target" with target emoji
2. **Playing** — A circular target (30px diameter) moves around the game area. Player must keep cursor/finger on it.
3. **Round end** — 10-second rounds. Time-on-target tracked as a percentage.
4. **Advance** — ≥50% time-on-target = pass, advance to next level. <50% = lose 1 life (3 lives).
5. **Result** — Score = highest level reached.

### Progression

| Levels | Speed | Movement |
|--------|-------|----------|
| 1-3 | Slow (2px/frame) | Smooth, gentle curves |
| 4-6 | Medium (3-4px/frame) | Direction changes every 1-2s |
| 7-9 | Fast (5-6px/frame) | Frequent direction changes, sharp turns |
| 10+ | Very fast (7+px/frame) | Erratic, unpredictable movement |

### Technical

- **Movement**: `requestAnimationFrame` loop. Target position updated each frame.
- **Path generation**: Parametric movement with random waypoints. Smooth interpolation between waypoints.
- **Hit detection**: Distance from cursor to target center < target radius (15px). Checked each frame.
- **Time tracking**: `timeOnTarget / totalFrames × 100` = accuracy %.
- **Touch support**: `onTouchMove` + `onMouseMove` for cross-device.
- **Target visual**: Pulsing circle with crosshair. Turns green when cursor is on it, red when not.
- **Scoring:** `lowerIsBetter: false`. Score = level.

---

## Integration Points

### types.ts

Add 8 new TestId values.

### constants.ts

Add 8 new TEST_CONFIGS entries.

### page.tsx

Add 8 new imports and TEST_COMPONENTS entries.

### data/tips.ts

Add tips for all 8 new tests.

### New Files

```
tools/human-benchmark/tests/
├── interval-recognition.tsx
├── chord-identification.tsx
├── tone-memory.tsx
├── higher-or-lower.tsx
├── stroop-test.tsx
├── quick-math.tsx
├── word-scramble.tsx
└── tracking-test.tsx

tools/human-benchmark/data/
├── intervals.ts
├── chords.ts
├── colors.ts        # Stroop test color definitions
├── equations.ts     # Quick math generation
└── words.ts         # Word scramble word lists
```

### Existing Files Modified

- `tools/human-benchmark/tests/rhythm-test.tsx` — Revamp to endless levels
- `tools/human-benchmark/data/rhythms.ts` — Add random generation
- `tools/human-benchmark/constants.ts` — Fix name + add 8 configs
- `tools/human-benchmark/types.ts` — Add 8 TestIds
- `tools/human-benchmark/data/tips.ts` — Add tips for 8 new tests + 4 audio tests
