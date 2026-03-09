# Story Quality Pipeline — Design Document

**Date**: 2026-03-10
**Status**: Approved for implementation

---

## Understanding Summary

- **What**: Enhance the story generation pipeline with a multi-step prompt chaining strategy — Story Bible generation, grounded draft, logic validation, and surgical auto-fix
- **Why**: Current single-shot generation produces plot inconsistencies, visual mismatches across pages, and shallow/generic narratives
- **Who**: All users generating storybooks (standalone and series)
- **Key constraints**: Max ~60 seconds additional latency; credit cost increases slightly (50 → 65); Gemini 2.5 Flash for all steps
- **Non-goals**: No user-facing Story Bible editing; no manual validation step; no "quality tier" toggle; no recursive validation loops

---

## Assumptions

- Gemini 2.5 Flash is sufficient for validation/fix steps (no need for Pro)
- Story Bible and validation are text-only steps — no extra image generation calls
- Auto-fix rewrites individual pages, not the whole story — keeps latency bounded
- One validation pass is enough (no recursive validate-fix loops)
- Enhanced image prompts (generated from validated text + Story Bible) will improve Imagen consistency without additional image-side changes
- Story Bible is ephemeral — not persisted to database

---

## Pipeline Design

### Current Flow

```
concept → generateStoryText() → illustrations → TTS → save
```

### New Flow

```
concept → generateStoryBible() → generateStoryDraft() → validateAndFix() → illustrations → TTS → save
```

---

## Step 1: Story Bible Generation

**Function**: `generateStoryBible(concept, plot, seriesContext?)`

Generates an internal grounding document used as context for all subsequent steps.

### Schema

```typescript
interface StoryBible {
  characters: {
    name: string
    physicalDescription: string   // hyper-detailed, single source of truth for image prompts
    personality: string           // motivations, fears, quirks
    role: 'protagonist' | 'antagonist' | 'supporting'
    relationships: { with: string; nature: string }[]
  }[]
  setting: {
    location: string
    timeContext: string           // era, season, time-of-day progression
    atmosphere: string            // mood, sensory details
  }
  narrativeArc: {
    opening: string
    incitingIncident: string
    risingAction: string
    climax: string
    resolution: string
  }
  rules: string[]                 // e.g., "Luna never removes her goggles"
  artDirection: {
    style: string                 // from concept tags
    colorPalette: string
    lightingProgression: string   // e.g., "dawn to dusk"
  }
}
```

### Key Behaviors

- `physicalDescription` becomes the single source of truth — draft step copies it verbatim into image prompts
- `rules` is a freeform list the validation step checks against
- `artDirection` guides image prompt generation for visual coherence across pages
- For series books: incorporates existing book summaries and established character traits

---

## Step 2: Story Draft Generation

**Function**: `generateStoryDraft(storyBible, concept, plot)`

Replaces the current `generateStoryText`. Same output schema (title, characters, pages with narrativeText, dialogue, imagePrompt) but grounded against the Story Bible.

### Key Differences from Current

- Story Bible injected as grounding context in the system instruction
- Explicit rule: "Use EXACTLY these character descriptions in every imagePrompt — do not paraphrase or abbreviate"
- `physicalDescription` from Story Bible referenced directly
- Uses `responseMimeType: 'application/json'` with `responseSchema` (same pattern as current)

---

## Step 3: Validation & Auto-Fix

**Function**: `validateAndFix(storyBible, draft)`

Single Gemini call with a "Senior Narrative Editor" role.

### Validation Checklist

1. **Timeline** — events follow logical sequence; no page references future events
2. **Character behavior** — actions align with personality/motivations from Story Bible
3. **Relationship consistency** — characters interact per established dynamics
4. **Causality** — every action has a reason; no deus ex machina
5. **Physical descriptions** — image prompts match Story Bible's `physicalDescription` exactly (no drift)
6. **Art direction** — image prompts follow `colorPalette` and `lightingProgression`
7. **Age-appropriateness** — language and themes match the target audience tag

### Output Schema

```typescript
interface ValidationResult {
  status: 'VALIDATED' | 'NEEDS_FIX'
  issues: {
    page: number              // 0 = book-level issue
    category: string          // from checklist above
    description: string       // what's wrong
    fix: string               // the corrected content
    field: 'narrativeText' | 'dialogue' | 'imagePrompt' | 'sceneDescription'
  }[]
}
```

### Fix Application

- If `status === 'NEEDS_FIX'`: iterate over `issues` and patch corresponding page fields
- One round of fixes only — no recursive validation
- Keeps latency bounded and predictable

---

## Integration

### Route Changes (`app/api/v1/story/generate/route.ts`)

```typescript
// Current
const storyData = await generateStoryText({ plot, concept }, seriesContext)

// New
send({ type: 'status', message: 'Building story foundation...' })
const storyBible = await generateStoryBible({ plot, concept, seriesContext })

send({ type: 'status', message: 'Writing your story...' })
const draft = await generateStoryDraft({ plot, concept, storyBible })

send({ type: 'status', message: 'Reviewing for consistency...' })
const validated = await validateAndFix({ storyBible, draft })
```

### What Stays the Same

- SSE streaming pattern (adds 2 new status messages)
- Illustration pipeline (receives validated draft, unchanged)
- TTS pipeline (unchanged)
- Series reference image loading (unchanged)
- Credit reservation/confirmation flow (unchanged)

### Credit Cost

- `CREDIT_COSTS.generate`: 50 → 65
- `WELCOME_CREDITS`: 50 → 65 (new users can still generate one book)

### Gemini Configuration

- All three new functions use `gemini-2.5-flash`
- All use `responseMimeType: 'application/json'` with typed `responseSchema`
- Validation step uses lower temperature for conservative, precise fixes

### File Changes

| File | Change |
|------|--------|
| `lib/story/enrich.ts` | Add `generateStoryBible`, rename `generateStoryText` → `generateStoryDraft` (with Story Bible grounding), add `validateAndFix` |
| `app/api/v1/story/generate/route.ts` | Replace single `generateStoryText` call with 3-step pipeline |
| `lib/story/validation.ts` | Update `CREDIT_COSTS.generate` from 50 to 65 |
| `app/api/v1/credits/balance/route.ts` | Update `WELCOME_CREDITS` from 50 to 65 |

### No Database Changes

Story Bible is ephemeral — generated per request, not persisted.

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|----------|------------------------|-----------|
| 1 | Sequential pipeline (Bible → Draft → Validate) | Parallel validation, Two-pass generation | Most reliable; clear step responsibilities; no rollback complexity |
| 2 | Story Bible is internal only | User-visible, User-editable | Keeps UX simple; no extra step in flow |
| 3 | Auto-fix surgical repairs | Full regenerate, Hybrid | Faster; keeps latency within 60s budget |
| 4 | All generations get quality pipeline | Series-only, User-selectable toggle | Consistent quality; simpler code path |
| 5 | One validation pass, no recursion | Recursive validate-fix loops | Bounds latency predictably |
| 6 | Story Bible is ephemeral (not persisted) | Store in DB per book | YAGNI; no current need to reference it later |
| 7 | Gemini 2.5 Flash for all steps | Pro for validation | Flash is sufficient; keeps cost and latency low |
| 8 | Credit cost increases to 65 | Stay at 50, Higher increase | Reflects real API cost increase; welcome credits bumped to match |
| 9 | New functions in `lib/story/enrich.ts` | Separate file | Cohesive with existing story text generation code |
