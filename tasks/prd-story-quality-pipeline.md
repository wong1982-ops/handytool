# PRD: Story Quality Pipeline

## Introduction

The Story Quality Pipeline enhances storybook generation by replacing a single-shot AI call with a 3-step prompt chaining strategy: **Story Bible** generation, **grounded draft** writing, and **validation with auto-fix**. This addresses recurring quality issues — plot inconsistencies, visual character drift across pages, shallow narratives, and logic errors — that arise when a single LLM call handles both creative writing and visual prompt generation simultaneously.

The pipeline also includes supporting changes: updated credit pricing, welcome credits for new users, plot text persistence, and reliable JSON output from Gemini.

## Goals

- Eliminate character visual drift across illustrated pages by establishing a single source of truth (Story Bible) for physical descriptions
- Ensure narrative coherence: consistent timeline, character behavior, and cause-and-effect logic across all pages
- Catch and surgically fix plot holes, continuity errors, and prompt mismatches before illustration begins
- Keep total generation time within a 60-second increase budget (on top of existing generation time)
- Provide new users with enough free credits to generate one complete storybook

## User Stories

### US-001: Story Bible generation step
**Description:** As a user generating a storybook, I want the system to build an internal character/world reference document so that my story has consistent characters and settings across all pages.

**Acceptance Criteria:**
- [x] System generates a Story Bible containing: characters (with hyper-detailed physical descriptions, personality, role, relationships), setting (location, time context, atmosphere), narrative arc (5-beat structure), world rules, and art direction
- [x] Story Bible uses `responseMimeType: 'application/json'` with typed `responseSchema` for reliable structured output
- [x] For series books, Story Bible incorporates existing book summaries and established character traits
- [x] SSE status message "Building story foundation..." displayed during this step
- [x] Typecheck passes

### US-002: Grounded draft generation
**Description:** As a user, I want my story draft to be written against the Story Bible so that character descriptions and world details remain consistent throughout the narrative.

**Acceptance Criteria:**
- [x] Draft generation receives Story Bible as grounding context in the system instruction
- [x] Image prompts copy `physicalDescription` from Story Bible verbatim — no paraphrasing or abbreviation
- [x] Output schema matches existing format (title, characters, pages with narrativeText, dialogue, imagePrompt, sceneDescription)
- [x] SSE status message "Writing your story..." displayed during this step
- [x] Typecheck passes

### US-003: Validation and auto-fix
**Description:** As a user, I want the system to review my generated story for consistency issues and automatically fix them before illustrations begin.

**Acceptance Criteria:**
- [x] Validation checks 7 categories: timeline, character behavior, relationship consistency, causality, physical descriptions, art direction, age-appropriateness
- [x] Issues produce surgical fixes targeting specific page fields (narrativeText, dialogue, imagePrompt, sceneDescription)
- [x] Fixes are applied in a single pass — no recursive validation loops
- [x] SSE status message "Reviewing for consistency..." displayed during this step
- [x] If status is `VALIDATED` (no issues), draft passes through unchanged
- [x] Typecheck passes

### US-004: Welcome credits for new users
**Description:** As a new user, I want to receive free credits when I first log in so that I can try generating a storybook without paying.

**Acceptance Criteria:**
- [x] New users with zero balance and no prior transactions receive 65 welcome credits
- [x] Welcome credits are idempotent — users who have spent all credits do not receive a second grant
- [x] Credit grant uses the existing `grant_purchased_credits` RPC
- [x] 65 credits = exactly one storybook generation at the new pricing
- [x] Typecheck passes

### US-005: Plot text persistence across errors
**Description:** As a user, I want my plot text to survive generation errors so that I don't lose my writing when something goes wrong.

**Acceptance Criteria:**
- [x] Plot text saved to localStorage on every keystroke
- [x] On page load, plot text restores from localStorage (priority: initialPlot prop > localStorage > empty)
- [x] Plot draft cleared only on successful generation completion or manual reset
- [x] Plot draft NOT cleared on generation error — user returns to input phase with text intact
- [x] Typecheck passes

### US-006: Reliable JSON output from Gemini
**Description:** As a developer, I need Gemini to return valid JSON consistently so that story generation doesn't fail with parse errors.

**Acceptance Criteria:**
- [x] All Gemini calls use `responseMimeType: 'application/json'` with typed `responseSchema`
- [x] `refineConceptStream` has robust JSON extraction fallback (strip markdown fences, first `{` to last `}`)
- [x] No more "Unexpected non-whitespace character after JSON" errors
- [x] Typecheck passes

## Functional Requirements

- FR-1: `generateStoryBible()` accepts concept, plot, and optional series context; returns a `StoryBible` JSON object via Gemini 2.5 Flash structured output
- FR-2: `generateStoryDraft()` accepts concept, plot, and Story Bible; injects Bible as system instruction grounding; returns story draft JSON matching existing page schema
- FR-3: `validateAndFix()` accepts Story Bible and draft; returns validated/fixed draft with issues array; applies fixes by patching specific page fields
- FR-4: Generation route calls the 3 steps sequentially with SSE status updates between each step
- FR-5: `CREDIT_COSTS.generate` set to 65 (up from 50) to reflect increased API usage
- FR-6: `WELCOME_CREDITS` set to 65, granted via `grant_purchased_credits` RPC on first balance check for users with no prior transactions
- FR-7: Plot text persisted in localStorage under key `toolk1t-story-plot-draft`; cleared on successful generation or manual reset only
- FR-8: All Gemini structured output calls use `responseMimeType: 'application/json'` with explicit `responseSchema`

## Non-Goals

- No user-facing Story Bible viewer or editor — Bible is internal/ephemeral only
- No manual validation step — validation is fully automated
- No "quality tier" toggle (standard vs. premium generation)
- No recursive validate-fix loops — single pass only
- No Story Bible persistence to database — generated fresh per request
- No subscription plan tiers (pricing drawer shows credits only)
- No changes to the illustration (Imagen 3) or TTS pipelines themselves

## Technical Considerations

- **Model**: Gemini 2.5 Flash for all three pipeline steps — sufficient quality at low cost/latency
- **Structured output**: All steps use `responseMimeType: 'application/json'` with typed `responseSchema` to prevent parse errors
- **Validation temperature**: Lower temperature for the validation step to produce conservative, precise fixes
- **Latency budget**: ~30-60 seconds additional (3 sequential Gemini calls) on top of existing generation time
- **File changes**: `lib/story/enrich.ts` (3 new functions), `app/api/v1/story/generate/route.ts` (pipeline orchestration), `lib/story/validation.ts` (cost update), `app/api/v1/credits/balance/route.ts` (welcome credits)
- **No database schema changes**: Story Bible is ephemeral; credit system uses existing tables and RPCs
- **Series context**: For series books, the Story Bible step receives summaries from prior books to maintain cross-book character consistency

## Success Metrics

- Zero "Unexpected non-whitespace character after JSON" parse errors in production
- Character physical descriptions remain consistent across all pages within a generated book (no visual drift in illustrations)
- Plot events follow logical cause-and-effect sequence with no timeline contradictions
- Total generation time stays under 3 minutes (including illustrations and TTS)
- New users can generate their first storybook without purchasing credits

## Open Questions

- Should Story Bible be persisted to the database in the future for series continuity across generation sessions?
- Would users benefit from seeing a simplified version of the Story Bible (e.g., character cards) after generation?
- Should credit costs be adjusted further if Gemini pricing changes?
- Is one validation pass sufficient long-term, or will edge cases require a second pass?
